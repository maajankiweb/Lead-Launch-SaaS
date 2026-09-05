import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateSalesBrief } from "@/lib/salesBriefEngine";
import type { Lead, AuditResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lead, audit } = body as { lead: Lead; audit: AuditResult };

    if (!lead || !audit) {
      return NextResponse.json({ error: "Lead and audit data are required." }, { status: 400 });
    }

    const brief = generateSalesBrief(lead, audit);
    return NextResponse.json({ success: true, brief });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate sales brief" },
      { status: 500 }
    );
  }
}
