import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRazorpayWebhookSignature, processPlanUpgrade } from "@/lib/payments";
import { normalizePlanType } from "@/lib/plans";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();

    // Verify webhook signature if secret is configured
    if (process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET) {
      if (!signature) {
        logger.webhookEvent({
          event: "unknown",
          provider: "razorpay",
          success: false,
          error: "Missing x-razorpay-signature header",
        });
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
      }

      const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
      if (!isValid) {
        logger.webhookEvent({
          event: "unknown",
          provider: "razorpay",
          success: false,
          error: "Invalid webhook signature",
        });
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity || payload.payload?.order?.entity || {};

    const transactionId = paymentEntity.id || paymentEntity.order_id || `wh_${Date.now()}`;

    // Extract metadata/notes
    const notes = paymentEntity.notes || {};
    const userEmail = paymentEntity.email || notes.userEmail || notes.email;
    const rawPlanId = notes.planId || notes.plan || "PRO";
    const canonicalPlan = normalizePlanType(rawPlanId);

    // Find the user by ID (from notes) or by Email
    let user = null;
    if (notes.userId) {
      user = await db.user.findUnique({ where: { id: notes.userId } });
    }
    if (!user && userEmail) {
      user = await db.user.findUnique({ where: { email: userEmail } });
    }

    if (!user) {
      logger.webhookEvent({
        event,
        provider: "razorpay",
        transactionId,
        success: false,
        error: `User not found for payment (${userEmail || notes.userId})`,
      });
      // Acknowledge receipt to Razorpay to avoid infinite retries for unregistered customer
      return NextResponse.json({ status: "acknowledged_user_not_found" }, { status: 200 });
    }

    // Idempotency check: check if payment transaction has already been recorded
    const existingPayment = await db.payment.findMany({
      where: { userId: user.id },
    });
    const alreadyProcessed = existingPayment.some(
      (p: any) => p.transactionId === transactionId && p.status === "completed"
    );

    if (alreadyProcessed) {
      logger.info("webhook", `Payment ${transactionId} was already processed idempotently.`, {
        userId: user.id,
        transactionId,
      });
      return NextResponse.json({ status: "already_processed" }, { status: 200 });
    }

    // Handle supported events: payment.captured, order.paid, subscription.activated
    if (
      event === "payment.captured" ||
      event === "order.paid" ||
      event === "subscription.activated" ||
      event === "payment.authorized"
    ) {
      const upgradeResult = await processPlanUpgrade({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        planId: canonicalPlan,
        billingCycle: notes.billingCycle || "monthly",
        currency: (paymentEntity.currency || "INR").toUpperCase(),
        provider: "razorpay",
        transactionId,
      });

      return NextResponse.json({
        status: "success",
        plan: upgradeResult.plan,
        userId: user.id,
      });
    }

    return NextResponse.json({ status: "event_ignored", event });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    logger.error("webhook", "Webhook handler unexpected exception", {
      error: error?.message,
    });
    return NextResponse.json({ error: error?.message || "Webhook error" }, { status: 500 });
  }
}
