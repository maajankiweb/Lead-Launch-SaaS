import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, attachAuthCookie } from "@/lib/auth";
import { verifyRazorpaySignature, processPlanUpgrade } from "@/lib/payments";
import { normalizePlanType, normalizePlanKey, getPlanConfig, getPlanLimits, PLANS, PlanType } from "@/lib/plans";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      orderId,
      paymentId,
      signature,
      planId,
      billingCycle = "monthly",
      currency = "INR",
    } = await req.json();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "Missing payment verification parameters" }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature(orderId, paymentId, signature);
    if (!isValid) {
      logger.webhookEvent({
        userId: user.id,
        event: "razorpay.verify_signature",
        provider: "razorpay",
        transactionId: paymentId,
        success: false,
        error: "Invalid payment signature",
      });
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const canonicalPlanType = normalizePlanType(planId);
    if (canonicalPlanType === "FREE") {
      return NextResponse.json({ error: "Invalid paid plan selected" }, { status: 400 });
    }

    const result = await processPlanUpgrade({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      planId: canonicalPlanType,
      billingCycle,
      currency,
      provider: "razorpay",
      transactionId: paymentId,
    });

    const planConfig = getPlanConfig(canonicalPlanType);
    const planLimits = getPlanLimits(canonicalPlanType);

    const response = NextResponse.json({
      success: true,
      message: `Payment verified and upgraded to ${planConfig.name}!`,
      plan: result.plan,
      planLimits,
      payment: result.payment,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        plan: result.user.plan,
      },
    });

    // Re-issue updated session cookie so browser receives new tier immediately without logout
    await attachAuthCookie(response, {
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      plan: result.user.plan,
    });

    return response;
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: error.message || "Payment verification failed" }, { status: 500 });
  }
}
