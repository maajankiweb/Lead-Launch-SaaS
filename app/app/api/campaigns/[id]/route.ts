import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const campaign = await db.campaign.findFirst({
      where: { id, userId: user.id },
      include: {
        leads: {
          include: {
            audit: true,
            pitch: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.campaign.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Campaign deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete campaign" }, { status: 500 });
  }
}
