import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { processPlanUpgrade, createRazorpayOrder, createStripeSession } from "@/lib/payments";
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

    const plan = PLANS[planId as PlanType];
    const isINR = currency === "INR" || provider === "razorpay";
    const amount = isINR
      ? (billingCycle === "annual" ? plan.priceAnnualMonthlyINR * 12 : plan.priceMonthlyINR)
      : (billingCycle === "annual" ? plan.priceAnnualMonthly * 12 : plan.priceMonthly);

    // 1. If Razorpay is requested and configured, create Razorpay Order
    if (provider === "razorpay" && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const order = await createRazorpayOrder({
        amount,
        currency: "INR",
        receipt: `rcpt_${user.id.slice(0, 8)}_${Date.now().toString().slice(-6)}`,
      });

      return NextResponse.json({
        success: true,
        gateway: "razorpay",
        orderId: order.id,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        planId,
        billingCycle,
      });
    }

    // 2. If Stripe is requested and configured, create Stripe Checkout Session
    if (provider === "stripe" && process.env.STRIPE_SECRET_KEY) {
      const origin = req.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const session = await createStripeSession({
        amount,
        currency: "usd",
        customerEmail: user.email,
        planName: plan.name,
        successUrl: `${origin}/dashboard?payment=success&plan=${planId}`,
        cancelUrl: `${origin}/dashboard?payment=cancelled`,
      });

      return NextResponse.json({
        success: true,
        gateway: "stripe",
        sessionId: session.id,
        url: session.url,
      });
    }

    // 3. Default instant upgrade (direct MongoDB Atlas update)
    const result = await processPlanUpgrade({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      planId,
      billingCycle,
      currency: isINR ? "INR" : "USD",
      provider: provider || "instant",
    });

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${plan.name}!`,
      plan: result.plan,
      payment: result.payment,
    });
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: error.message || "Payment checkout failed" }, { status: 500 });
  }
}
