import { NextResponse } from "next/server";
import { generateDemoSiteHtml, type DemoSiteTheme } from "@/lib/demoSiteGenerator";
import type { RankedLead } from "@/lib/types";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { lead, theme } = (await req.json()) as {
      lead: RankedLead;
      theme?: DemoSiteTheme;
    };

    if (!lead) {
      return NextResponse.json({ error: "No lead provided" }, { status: 400 });
    }

    // Try generating dynamic tailored site using free AI or our engine
    let html = generateDemoSiteHtml(lead, { theme: theme || "modern" });

    // Optional free Pollinations AI enhancement for tailored copy if network allows
    try {
      const promptText = encodeURIComponent(
        `Generate a concise headline and 3 custom services for this business: ${lead.name}, category: ${lead.category}, city: ${lead.city}. Return in JSON: {"headline": "...", "services": [{"title": "...", "desc": "..."}]}`
      );
      const aiRes = await fetch(`https://text.pollinations.ai/${promptText}?json=true`, {
        signal: AbortSignal.timeout(3500),
      });
      if (aiRes.ok) {
        const aiJson = await aiRes.json().catch(() => null);
        if (aiJson && aiJson.headline) {
          // Enhances heading if AI returns valid custom copy
          html = generateDemoSiteHtml(lead, {
            theme: theme || "modern",
            customHeading: aiJson.headline,
          });
        }
      }
    } catch {
      // Graceful fallback to our bespoke high-conversion template
    }

    return NextResponse.json({
      success: true,
      html,
      title: `${lead.name} — Demo Website`,
      suggestedRepoName: `demo-${(lead.name || "site").toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate demo website" },
      { status: 500 }
    );
  }
}
