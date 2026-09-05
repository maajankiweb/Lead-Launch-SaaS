import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { verifyRazorpaySignature, processPlanUpgrade } from "@/lib/payments";
import { PLANS, PlanType } from "@/lib/plans";

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
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    if (planId !== "PRO" && planId !== "AGENCY_SCALE" && planId !== "ENTERPRISE") {
      return NextResponse.json({ error: "Invalid paid plan selected" }, { status: 400 });
    }

    const result = await processPlanUpgrade({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      planId: planId as "PRO" | "AGENCY_SCALE" | "ENTERPRISE",
      billingCycle,
      currency,
      provider: "razorpay",
      transactionId: paymentId,
    });

    return NextResponse.json({
      success: true,
      message: `Payment verified and upgraded to ${PLANS[planId as PlanType]?.name || "Pro"}!`,
      plan: result.plan,
      payment: result.payment,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: error.message || "Payment verification failed" }, { status: 500 });
  }
}
