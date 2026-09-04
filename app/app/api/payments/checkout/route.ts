import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { processPlanUpgrade } from "@/lib/payments";
import { PLANS, PlanType } from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please login to upgrade." }, { status: 401 });
    }

    const { planId, billingCycle = "monthly", currency = "USD", provider = "instant" } = await req.json();

    if (planId !== "PRO" && planId !== "AGENCY_SCALE" && planId !== "ENTERPRISE") {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const result = await processPlanUpgrade({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      planId,
      billingCycle,
      currency,
      provider,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${PLANS[planId as PlanType].name}!`,
      plan: result.plan,
      payment: result.payment,
    });
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: error.message || "Payment checkout failed" }, { status: 500 });
  }
}
