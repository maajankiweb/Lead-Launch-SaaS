import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deals = await db.deal.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ deals });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch deals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const planLimits = getPlanLimits(user.plan);
    const existingDeals = await db.deal.findMany({ where: { userId: user.id } });
    if (existingDeals.length >= planLimits.crmDeals) {
      return NextResponse.json(
        {
          error: `${planLimits.name} is limited to ${planLimits.crmDeals} CRM deals. Upgrade your plan to manage more deals.`,
          requiresUpgrade: true,
          limit: planLimits.crmDeals,
          current: existingDeals.length,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { clientName, company, service = "Website Redesign & SEO", value = 1500, stage = "lead", notes = "", leadId } = body;

    if (!clientName || !company) {
      return NextResponse.json({ error: "Client name and company are required." }, { status: 400 });
    }

    const deal = await db.deal.create({
      data: {
        userId: user.id,
        leadId: leadId || null,
        clientName: clientName.trim(),
        company: company.trim(),
        service: service.trim(),
        value: Number(value) || 0,
        stage: stage || "lead",
        notes: notes ? notes.trim() : null,
      },
    });

    return NextResponse.json({ success: true, deal });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create deal" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, stage, notes, value, service } = body;

    if (!id) {
      return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });
    }

    const existing = await db.deal.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    const updated = await db.deal.update({
      where: { id },
      data: {
        ...(stage !== undefined && { stage }),
        ...(notes !== undefined && { notes }),
        ...(value !== undefined && { value: Number(value) }),
        ...(service !== undefined && { service }),
      },
    });

    return NextResponse.json({ success: true, deal: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update deal" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Deal ID is required" }, { status: 400 });
    }

    await db.deal.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Deal deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete deal" }, { status: 500 });
  }
}
