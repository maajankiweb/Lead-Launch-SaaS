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
  const finalCurrency = isINR ? "INR" : "USD";
  
  let finalAmount = 0;
  if (isINR) {
    finalAmount = billingCycle === "annual" ? (plan.priceAnnualMonthlyINR * 12) : plan.priceMonthlyINR;
  } else {
    finalAmount = billingCycle === "annual" ? (plan.priceAnnualMonthly * 12) : plan.priceMonthly;
  }

  const txn = transactionId || `txn_${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

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
      currency,
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
