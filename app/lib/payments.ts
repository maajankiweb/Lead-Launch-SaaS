import crypto from "node:crypto";
import { db } from "./db";
import { PLANS, PlanType } from "./plans";

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  userName: string;
  planId: "PRO" | "AGENCY_SCALE" | "ENTERPRISE";
  billingCycle: "monthly" | "annual";
  currency?: "USD" | "INR";
  provider?: "stripe" | "razorpay" | "instant";
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret?: string
): boolean {
  const keySecret = secret || process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return expected === signature;
}

export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
}: {
  amount: number;
  currency?: string;
  receipt: string;
}) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return null;
  }
  const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      receipt,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay Order creation failed: ${err}`);
  }
  return res.json();
}

export async function createStripeSession({
  amount,
  currency = "usd",
  customerEmail,
  planName,
  successUrl,
  cancelUrl,
}: {
  amount: number;
  currency?: string;
  customerEmail: string;
  planName: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return null;
  }
  const params = new URLSearchParams();
  params.append("payment_method_types[]", "card");
  params.append("line_items[0][price_data][currency]", currency.toLowerCase());
  params.append("line_items[0][price_data][product_data][name]", `Lead to Launch - ${planName} Plan`);
  params.append("line_items[0][price_data][unit_amount]", String(Math.round(amount * 100)));
  params.append("line_items[0][quantity]", "1");
  params.append("mode", "payment");
  params.append("customer_email", customerEmail);
  params.append("success_url", successUrl);
  params.append("cancel_url", cancelUrl);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Stripe session creation failed: ${err}`);
  }
  return res.json();
}

export async function processPlanUpgrade({
  userId,
  userEmail,
  userName,
  planId,
  billingCycle,
  currency = "USD",
  provider = "instant",
  transactionId,
}: CreateCheckoutParams & { transactionId?: string }) {
  const plan = PLANS[planId as PlanType] || PLANS.PRO;
  const isINR = currency === "INR" || provider === "razorpay";

  let finalAmount = 0;
  if (isINR) {
    finalAmount = billingCycle === "annual" ? plan.priceAnnualMonthlyINR * 12 : plan.priceMonthlyINR;
  } else {
    finalAmount = billingCycle === "annual" ? plan.priceAnnualMonthly * 12 : plan.priceMonthly;
  }

  const txn =
    transactionId ||
    `txn_${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Update user record in database
  await db.user.update({
    where: { id: userId },
    data: {
      plan: planId,
      role: planId === "ENTERPRISE" || planId === "AGENCY_SCALE" ? "AGENCY" : "FREELANCER",
    },
  });

  // 2. Record Payment History in MongoDB Atlas
  const payment = await db.payment.create({
    data: {
      userId,
      userEmail: userEmail || "user@example.com",
      userName: userName || "Subscriber",
      plan: planId,
      amount: finalAmount,
      currency: isINR ? "INR" : "USD",
      provider,
      transactionId: txn,
      status: "completed",
    },
  });

  return {
    success: true,
    payment,
    plan: planId,
  };
}
