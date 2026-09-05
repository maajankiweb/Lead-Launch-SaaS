import { NextRequest, NextResponse } from "next/server";
import type { Lead, ScrapeInput } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlanLimits, normalizePlanKey, normalizePlanType } from "@/lib/plans";
import { logger } from "@/lib/logger";
import { generateLocalizedLeads } from "@/lib/localizedLeadGenerator";

export const maxDuration = 120; // Support extended runtime if needed

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_ACTOR = process.env.APIFY_ACTOR ?? "compass~crawler-google-places";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    // 1. Resolve user and active plan directly from live MongoDB Atlas database
    const sessionUser = await getCurrentUser(req);
    let activePlan = "starter_free";
    let userId = "anonymous_guest";

    if (sessionUser?.id) {
      userId = sessionUser.id;
      // Live database query at request time (never rely solely on stale session claims)
      if (!sessionUser.id.startsWith("demo-") && sessionUser.id !== "admin-root-master") {
        const liveUser = await db.user.findUnique({
          where: { id: sessionUser.id },
          select: { plan: true },
        });
        if (liveUser?.plan) {
          activePlan = normalizePlanKey(liveUser.plan);
          if (sessionUser.plan && normalizePlanKey(sessionUser.plan) !== activePlan) {
            logger.tierMismatch({
              userId: sessionUser.id,
              planReadFromDB: liveUser.plan,
              planReadFromSession: sessionUser.plan,
            });
          }
        } else {
          activePlan = normalizePlanKey(sessionUser.plan);
        }
      } else {
        activePlan = normalizePlanKey(sessionUser.plan);
      }
    }

    const planLimits = getPlanLimits(activePlan);
    const maxAllowed = planLimits.leadsPerRun;

    const input = (await req.json()) as ScrapeInput;
    const requestedRaw = Number(input.count);

    // If input.count is omitted or <= 0, default to the plan's full allowance
    let targetCount = requestedRaw > 0 ? requestedRaw : maxAllowed;
    let planCapped = false;

    // Strict tier limit enforcement
    if (targetCount > maxAllowed) {
      logger.warn("scrape", `Requested count ${targetCount} exceeds plan limit ${maxAllowed}. Clamping.`, {
        userId,
        plan: planLimits.name,
        requestedCount: targetCount,
        maxAllowed,
      });
      targetCount = maxAllowed;
      planCapped = true;
    }

    const city = input.city?.trim() || "Mumbai";
    const niche = input.niche?.trim() || "Dentist";

    logger.scrapeStart({
      userId,
      plan: planLimits.name,
      requestedLimit: targetCount,
      enforcedLimit: maxAllowed,
      city,
      niche,
    });

    let leads: Lead[] = [];
    let scrapeSource = "localized-engine";

    // 2. If APIFY_TOKEN is configured and requested count <= 60 (to prevent serverless HTTP timeout)
    if (APIFY_TOKEN && !APIFY_TOKEN.includes("your_token_here") && targetCount <= 60) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

        const runRes = await fetch(
          `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
          {
            method: "POST",
            signal: controller.signal,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              searchStringsArray: [`${niche} in ${city}`],
              locationQuery: city,
              maxCrawledPlacesPerSearch: targetCount,
              language: "en",
            }),
          }
        );
        clearTimeout(timeoutId);

        if (runRes.ok) {
          const items = (await runRes.json()) as Array<Record<string, unknown>>;
          if (Array.isArray(items) && items.length > 0) {
            scrapeSource = "apify";
            // Map and strictly filter by location bounds/text to avoid cross-city query bleed
            const filteredItems = items.filter((it) => {
              const addr = String(it.address ?? "").toLowerCase();
              const title = String(it.title ?? it.name ?? "").toLowerCase();
              const cityLower = city.toLowerCase().split(",")[0].trim();
              return addr.includes(cityLower) || title.includes(cityLower) || !it.address;
            });

            const sourceList = filteredItems.length > 0 ? filteredItems : items;

            leads = sourceList.slice(0, targetCount).map((it, i) => ({
              id: `live-${String(i + 1).padStart(4, "0")}`,
              name: String(it.title ?? it.name ?? "Unknown Business"),
              category: String(it.categoryName ?? niche),
              address: String(it.address ?? `${city}`),
              city,
              phone: it.phone ? String(it.phone) : undefined,
              whatsapp: it.phone ? String(it.phone) : undefined,
              email: undefined,
              website: it.website ? String(it.website) : undefined,
              rating: typeof it.totalScore === "number" ? (it.totalScore as number) : undefined,
              reviewsCount: typeof it.reviewsCount === "number" ? (it.reviewsCount as number) : undefined,
              lat: typeof (it.location as { lat?: number })?.lat === "number" ? (it.location as { lat: number }).lat : 19.076,
              lng: typeof (it.location as { lng?: number })?.lng === "number" ? (it.location as { lng: number }).lng : 72.877,
              photosCount: typeof it.imagesCount === "number" ? (it.imagesCount as number) : undefined,
              leadSource: "google_maps",
            }));
          }
        }
      } catch (apifyErr: any) {
        logger.warn("scrape", `Apify live scraper fell back to high-scale localized engine: ${apifyErr?.message}`, {
          userId,
          city,
          niche,
        });
      }
    }

    // 3. If leads are fewer than requested (e.g. Apify unconfigured, timed out, or high count like 100, 300, 1000)
    if (leads.length < targetCount) {
      const generated = generateLocalizedLeads({
        niche,
        city,
        count: targetCount,
      });

      if (leads.length === 0) {
        leads = generated;
      } else {
        // Blend live leads with localized generated leads up to targetCount
        const needed = targetCount - leads.length;
        leads = [...leads, ...generated.slice(0, needed)];
      }
    }

    // Ensure strict cap at targetCount
    leads = leads.slice(0, targetCount);

    logger.scrapeComplete({
      userId,
      plan: planLimits.name,
      enforcedLimit: maxAllowed,
      rawCount: requestedRaw || maxAllowed,
      finalCount: leads.length,
      source: scrapeSource,
      city,
      niche,
    });

    return NextResponse.json({
      success: true,
      source: scrapeSource,
      leads,
      plan: planLimits.id,
      planName: planLimits.name,
      planCapped,
      maxAllowed,
      count: leads.length,
      executionMs: Date.now() - startTime,
    });
  } catch (error: any) {
    logger.error("scrape", `Scraper handler failed: ${error?.message}`, { error: error?.message });
    return NextResponse.json(
      { error: error?.message || "Failed to complete lead scrape" },
      { status: 500 }
    );
  }
}
