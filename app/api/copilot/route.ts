import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { answerCopilotQuery } from "@/lib/copilotEngine";
import type { Lead, AuditResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { question, lead, audit } = body as {
      question: string;
      lead: Lead;
      audit?: AuditResult;
    };

    if (!question || !lead) {
      return NextResponse.json(
        { error: "Question and lead data are required." },
        { status: 400 }
      );
    }

    const response = answerCopilotQuery(question, lead, audit);
    return NextResponse.json({ success: true, ...response });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process copilot query" },
      { status: 500 }
    );
  }
}
