import { NextRequest, NextResponse } from "next/server";
import { generateDemoSiteHtml, type DemoSiteTheme } from "@/lib/demoSiteGenerator";
import type { RankedLead } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json().catch(() => ({}));
    const { lead, theme, apiKeyGoogle: passedKey } = body as {
      lead: RankedLead;
      theme?: DemoSiteTheme;
      apiKeyGoogle?: string;
    };

    if (!lead) {
      return NextResponse.json({ error: "No lead provided" }, { status: 400 });
    }

    // Resolve Google AI Studio (Gemini) API Key:
    // 1. Passed in request body
    // 2. User record in DB
    // 3. Environment variables GEMINI_API_KEY or GOOGLE_AI_API_KEY
    let googleApiKey = passedKey?.trim() || "";

    if (!googleApiKey && user?.id) {
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { apiKeyGoogle: true },
      });
      if (dbUser?.apiKeyGoogle) {
        googleApiKey = dbUser.apiKeyGoogle.trim();
      }
    }

    if (!googleApiKey) {
      googleApiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_AI_API_KEY?.trim() || "";
    }

    let html = "";
    let generatedSource: "gemini" | "local_generator" = "local_generator";

    // 1. If Google AI Studio (Gemini) API key is configured, synthesize bespoke landing page
    if (googleApiKey) {
      try {
        const cleanPhone = (lead.phone || "").replace(/\D/g, "");
        const waNum = (lead.whatsapp || lead.phone || "919876543210").replace(/\D/g, "");
        const doctorOrOwner = lead.name.includes("Dr.") ? lead.name.split(",")[0] : lead.name;

        const systemPrompt = `You are a world-class UI/UX web designer and front-end architect.
Build a breathtaking, ultra-modern, production-grade, single-page responsive website HTML for this business:
- Name: ${lead.name}
- Category: ${lead.category || "Professional Business"}
- Location: ${lead.address || lead.city}
- Rating: ${lead.rating || 4.9}★ (${lead.reviewsCount || 100}+ reviews)
- Contact: Phone ${lead.phone || "Available"} | WhatsApp https://wa.me/${waNum}
- Style: ${theme || "modern"} (use dark luxe aesthetic: slate-950/900 background, emerald/cyan accents, glassmorphism cards, glowing borders, crisp typography)

REQUIREMENTS:
1. Return ONLY the raw HTML document starting with <!DOCTYPE html> and ending with </html>. Do NOT include markdown code blocks (\`\`\`html) or explanations.
2. Include Tailwind CSS CDN (<script src="https://cdn.tailwindcss.com"></script>) and Lucide Icons (<script src="https://unpkg.com/lucide@latest"></script>).
3. Structure:
   - Sticky Header with business name, navigation links, and "Book Consultation" CTA button.
   - Hero Section: High-converting headline for ${lead.category}, trust badges (${lead.rating}★ Google Rating, ${lead.reviewsCount}+ verified reviews), and click-to-call + WhatsApp CTAs.
   - Credentials / Trust Strip.
   - Core Services Grid (4-6 tailored cards with icons, descriptions, and 'Learn More' buttons).
   - About / Meet ${doctorOrOwner} section with credentials and satisfaction guarantees.
   - Verified Client Testimonials carousel or 3-column review cards.
   - Interactive Appointment / Quote Booking Form with clean responsive inputs.
   - Location, Hours & Google Map directions section.
   - Fixed Floating WhatsApp CTA button in bottom-right.
   - Modern Footer with LocalBusiness Schema.org JSON-LD structured data.
4. Execute lucide.createIcons() inside a <script> tag before </body> so icons render properly.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
              },
            }),
            signal: AbortSignal.timeout(25000), // 25s timeout
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          let rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          // Clean up any markdown code fence wrappers
          rawText = rawText.trim();
          if (rawText.startsWith("```html")) {
            rawText = rawText.substring(7);
          } else if (rawText.startsWith("```")) {
            rawText = rawText.substring(3);
          }
          if (rawText.endsWith("```")) {
            rawText = rawText.slice(0, -3);
          }
          rawText = rawText.trim();

          if (rawText.includes("<!DOCTYPE") || (rawText.includes("<html") && rawText.includes("</html>"))) {
            html = rawText;
            generatedSource = "gemini";
          }
        }
      } catch {
        // Fall back to local generator if Gemini call times out or fails
      }
    }

    // 2. Fallback to our bespoke high-conversion template generator
    if (!html) {
      html = generateDemoSiteHtml(lead, { theme: theme || "modern" });
      generatedSource = "local_generator";
    }

    const suggestedRepo = `demo-${(lead.name || "site")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40)}`;

    return NextResponse.json({
      success: true,
      html,
      source: generatedSource,
      hasGoogleAiKey: Boolean(googleApiKey),
      title: `${lead.name} — Demo Website`,
      suggestedRepoName: suggestedRepo,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate demo website" },
      { status: 500 }
    );
  }
}
