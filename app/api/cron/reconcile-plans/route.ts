import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizePlanType } from "@/lib/plans";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    // Basic auth guard for cron endpoint (Bearer token or Vercel Cron header)
    const authHeader = req.headers.get("authorization");
    const cronHeader = req.headers.get("x-vercel-cron");
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}` && !cronHeader) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    // 1. Fetch all users from MongoDB Atlas
    const users = await db.user.findMany();
    let reconciledCount = 0;
    const adjustments: Array<{ userId: string; oldPlan: string; newPlan: string }> = [];

    for (const user of users) {
      // Fetch user's completed payments
      const payments = await db.payment.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      const completedPayments = payments.filter((p: any) => p.status === "completed");
      if (completedPayments.length === 0) continue;

      // Find the most recent completed paid plan
      const latestPayment = completedPayments[0];
      const targetPlan = normalizePlanType(latestPayment.plan);

      // Check if user.plan matches the paid plan
      if (user.plan !== targetPlan) {
        const oldPlan = user.plan;
        await db.user.update({
          where: { id: user.id },
          data: {
            plan: targetPlan,
            role: targetPlan === "ENTERPRISE" || targetPlan === "AGENCY_SCALE" ? "AGENCY" : "FREELANCER",
            planUpdatedAt: new Date(),
          },
        });

        logger.reconciliation({
          userId: user.id,
          oldPlan,
          newPlan: targetPlan,
          source: "cron_reconcile",
        });

        adjustments.push({ userId: user.id, oldPlan, newPlan: targetPlan });
        reconciledCount++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checkedUsers: users.length,
      reconciledCount,
      adjustments,
    });
  } catch (error: any) {
    console.error("Reconciliation cron error:", error);
    return NextResponse.json({ error: error?.message || "Reconciliation failed" }, { status: 500 });
  }
}
