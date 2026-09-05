type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  level: LogLevel;
  timestamp: string;
  category: "scrape" | "payment" | "webhook" | "auth" | "crm" | "reconciliation";
  message: string;
  data?: Record<string, any>;
}

function formatLog(payload: LogPayload) {
  const jsonStr = JSON.stringify({
    ...payload,
    service: "lead-to-launch-saas",
    env: process.env.NODE_ENV || "development",
  });
  return jsonStr;
}

export const logger = {
  info(category: LogPayload["category"], message: string, data?: Record<string, any>) {
    const payload: LogPayload = {
      level: "info",
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
    };
    console.info(`[INFO][${category.toUpperCase()}] ${message}`, formatLog(payload));
  },

  warn(category: LogPayload["category"], message: string, data?: Record<string, any>) {
    const payload: LogPayload = {
      level: "warn",
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
    };
    console.warn(`[WARN][${category.toUpperCase()}] ⚠️ ${message}`, formatLog(payload));
  },

  error(category: LogPayload["category"], message: string, data?: Record<string, any>) {
    const payload: LogPayload = {
      level: "error",
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
    };
    console.error(`[ERROR][${category.toUpperCase()}] 🚨 ${message}`, formatLog(payload));
  },

  scrapeStart({
    userId,
    plan,
    requestedLimit,
    enforcedLimit,
    city,
    niche,
  }: {
    userId: string;
    plan: string;
    requestedLimit: number;
    enforcedLimit: number;
    city: string;
    niche: string;
  }) {
    this.info("scrape", "Scrape job initiated with tier limit enforcement", {
      userId,
      plan,
      requestedLimit,
      enforcedLimit,
      city,
      niche,
    });
  },

  scrapeComplete({
    userId,
    plan,
    enforcedLimit,
    rawCount,
    finalCount,
    source,
    city,
    niche,
  }: {
    userId: string;
    plan: string;
    enforcedLimit: number;
    rawCount: number;
    finalCount: number;
    source: string;
    city: string;
    niche: string;
  }) {
    this.info("scrape", "Scrape completed and bounded to plan limits", {
      userId,
      plan,
      enforcedLimit,
      rawCount,
      finalCount,
      source,
      city,
      niche,
    });
  },

  webhookEvent({
    userId,
    event,
    oldPlan,
    newPlan,
    provider,
    transactionId,
    success,
    error,
  }: {
    userId?: string;
    event: string;
    oldPlan?: string;
    newPlan?: string;
    provider: string;
    transactionId?: string;
    success: boolean;
    error?: string;
  }) {
    if (success) {
      this.info("webhook", `Webhook event processed: ${event}`, {
        userId,
        event,
        oldPlan,
        newPlan,
        provider,
        transactionId,
        success: true,
      });
    } else {
      this.error("webhook", `Webhook event failed: ${event}`, {
        userId,
        event,
        oldPlan,
        newPlan,
        provider,
        transactionId,
        success: false,
        error,
      });
    }
  },

  tierMismatch({
    userId,
    planReadFromDB,
    planReadFromSession,
  }: {
    userId: string;
    planReadFromDB: string;
    planReadFromSession: string;
  }) {
    this.warn("auth", "Session plan mismatch detected: live DB plan overrides session claim", {
      userId,
      planReadFromDB,
      planReadFromSession,
      mismatch: true,
    });
  },

  reconciliation({
    userId,
    oldPlan,
    newPlan,
    source = "reconciliation",
  }: {
    userId: string;
    oldPlan: string;
    newPlan: string;
    source?: string;
  }) {
    this.info("reconciliation", `User subscription auto-reconciled: ${oldPlan} -> ${newPlan}`, {
      userId,
      oldPlan,
      newPlan,
      source,
    });
  },
};
