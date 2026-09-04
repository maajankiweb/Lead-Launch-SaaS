import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB, User, Campaign, Lead, Deal } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const t0 = Date.now();
    await connectDB();
    const dbLatency = Date.now() - t0;

    const [userCount, campaignCount, leadCount, dealCount] = await Promise.all([
      User.countDocuments({}),
      Campaign.countDocuments({}),
      Lead.countDocuments({}),
      Deal.countDocuments({}),
    ]);

    return NextResponse.json({
      status: "operational",
      serverTime: new Date().toISOString(),
      nodeVersion: process.version,
      database: {
        provider: "MongoDB Atlas (MaaJanki Cluster0)",
        status: "connected",
        latencyMs: dbLatency,
        collections: {
          users: userCount,
          campaigns: campaignCount,
          leads: leadCount,
          deals: dealCount,
        },
      },
      environment: {
        hasApifyToken: Boolean(process.env.APIFY_TOKEN),
        hasJwtSecret: Boolean(process.env.JWT_SECRET),
        hasClaudeKey: Boolean(process.env.ANTHROPIC_API_KEY),
        hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
        nodeEnv: process.env.NODE_ENV || "development",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "System diagnostics failed" }, { status: 500 });
  }
}
