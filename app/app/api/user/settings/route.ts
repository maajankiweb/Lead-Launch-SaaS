import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        agencyName: true,
        agencyLogo: true,
        apiKeyClaude: true,
        apiKeyOpenAI: true,
        apiKeyGoogle: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: fullUser });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, agencyName, apiKeyClaude, apiKeyOpenAI, apiKeyGoogle, plan } = body;

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(agencyName !== undefined && { agencyName: agencyName?.trim() || null }),
        ...(apiKeyClaude !== undefined && { apiKeyClaude: apiKeyClaude?.trim() || null }),
        ...(apiKeyOpenAI !== undefined && { apiKeyOpenAI: apiKeyOpenAI?.trim() || null }),
        ...(apiKeyGoogle !== undefined && { apiKeyGoogle: apiKeyGoogle?.trim() || null }),
        ...(plan !== undefined && { plan }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        agencyName: true,
        agencyLogo: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update settings" }, { status: 500 });
  }
}
