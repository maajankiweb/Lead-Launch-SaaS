import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateCompetitorReport } from "@/lib/competitorEngine";
import type { Lead, AuditResult, CompetitorItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lead, audit, customCompetitors } = body as {
      lead: Lead;
      audit: AuditResult;
      customCompetitors?: CompetitorItem[];
    };

    if (!lead) {
      return NextResponse.json({ error: "Lead data is required." }, { status: 400 });
    }

    const report = generateCompetitorReport(lead, audit, customCompetitors);
    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate competitor report" },
      { status: 500 }
    );
  }
}
