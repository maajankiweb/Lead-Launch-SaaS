import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlanConfig } from "@/lib/plans";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaigns = await db.campaign.findMany({
      where: { userId: user.id },
      include: {
        _count: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const planConfig = getPlanConfig(user.plan);

    return NextResponse.json({
      campaigns,
      plan: planConfig.id,
      canExportCsv: planConfig.features.csvExport,
      canMultiCampaign: planConfig.features.multiCampaignSwitcher,
      maxCampaigns: planConfig.limits.maxCampaigns,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const planConfig = getPlanConfig(user.plan);

    // Check existing campaign count against tier limits
    const existing = await db.campaign.findMany({ where: { userId: user.id } });
    if (existing.length >= planConfig.limits.maxCampaigns) {
      return NextResponse.json(
        {
          error: `Your ${planConfig.name} plan is limited to ${planConfig.limits.maxCampaigns} campaign. Upgrade to Freelancer Pro or Agency Scale for unlimited multi-campaign pipelines.`,
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    const { title, niche, location, leads = [] } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Campaign title is required" }, { status: 400 });
    }

    const campaign = await db.campaign.create({
      data: {
        userId: user.id,
        title: title.trim(),
        niche: niche?.trim() || "General",
        location: location?.trim() || "Worldwide",
      },
    });

    // Save initial leads if provided
    if (Array.isArray(leads) && leads.length > 0) {
      for (const item of leads) {
        await db.lead.create({
          data: {
            campaignId: campaign.id,
            name: item.name || "Unknown Business",
            category: item.category || niche || "Local Business",
            address: item.address || location,
            phone: item.phone,
            website: item.website,
            rating: item.rating ? Number(item.rating) : null,
            reviews: item.reviews ? Number(item.reviews) : null,
            email: item.email,
            instagram: item.instagram,
            opportunityScore: item.opportunityScore,
            opportunityNotes: item.opportunityNotes,
          },
        });
      }
    }

    const completeCampaign = await db.campaign.findUnique({
      where: { id: campaign.id },
      include: { leads: true },
    });

    return NextResponse.json({ success: true, campaign: completeCampaign });
  } catch (error: any) {
    console.error("Save campaign error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create campaign" }, { status: 500 });
  }
}
