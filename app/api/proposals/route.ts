import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateProposalDocument } from "@/lib/proposalEngine";
import type { Lead, AuditResult, ProposalTemplate, ProposalDocument } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { lead, audit, template } = body as {
      lead: Lead;
      audit: AuditResult;
      template?: ProposalTemplate;
    };

    if (!lead || !audit) {
      return NextResponse.json(
        { error: "Lead and audit data are required to build proposal." },
        { status: 400 }
      );
    }

    const proposal = generateProposalDocument(lead, audit, template || "website_redesign");
    return NextResponse.json({ success: true, proposal });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate proposal" },
      { status: 500 }
    );
  }
}
