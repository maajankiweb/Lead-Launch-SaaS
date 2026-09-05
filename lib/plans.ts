export type PlanType = "FREE" | "PRO" | "AGENCY_SCALE" | "ENTERPRISE";

export type PlanKey = "starter_free" | "freelancer_pro" | "agency_scale" | "it_firm_enterprise";

export interface PlanLimits {
  readonly id: PlanKey;
  readonly name: string;
  readonly leadsPerRun: number;
  readonly campaigns: number;
  readonly crmDeals: number;
  readonly fullAudit: boolean;
  readonly csvExport: boolean;
  readonly whiteLabel?: boolean;
  readonly apiAccess?: boolean;
  readonly multiSeat?: boolean;
}

// Single Source of Truth for Plan Limits across the entire SaaS platform
export const PLAN_LIMITS = {
  starter_free: {
    id: "starter_free",
    name: "Starter Free",
    leadsPerRun: 15,
    campaigns: 1,
    crmDeals: 5,
    fullAudit: false,
    csvExport: false,
    whiteLabel: false,
    apiAccess: false,
    multiSeat: false,
  },
  freelancer_pro: {
    id: "freelancer_pro",
    name: "Freelancer Pro",
    leadsPerRun: 100,
    campaigns: 15,
    crmDeals: 150,
    fullAudit: true,
    csvExport: true,
    whiteLabel: false,
    apiAccess: false,
    multiSeat: false,
  },
  agency_scale: {
    id: "agency_scale",
    name: "Agency Scale",
    leadsPerRun: 300,
    campaigns: 100,
    crmDeals: 2000,
    fullAudit: true,
    csvExport: true,
    whiteLabel: true,
    apiAccess: false,
    multiSeat: false,
  },
  it_firm_enterprise: {
    id: "it_firm_enterprise",
    name: "IT Firm Enterprise",
    leadsPerRun: 1000,
    campaigns: 500,
    crmDeals: 10000,
    fullAudit: true,
    csvExport: true,
    whiteLabel: true,
    apiAccess: true,
    multiSeat: true,
  },
} as const;

export interface PlanConfig {
  id: PlanType;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnualMonthly: number;
  priceMonthlyINR: number;
  priceAnnualMonthlyINR: number;
  limits: {
    maxLeadsPerScrape: number;
    maxCampaigns: number;
    maxCrmDeals: number;
  };
  features: {
    unlimitedScraping: boolean;
    fullTechnicalAudits: boolean;
    aiRedesignMockups: boolean;
    persistentDatabase: boolean;
    dealsCrm: boolean;
    customAgencyBranding: boolean;
    multiCampaignSwitcher: boolean;
    csvExport: boolean;
    customApiKeys: boolean;
    prioritySupport: boolean;
    dedicatedAccountManager?: boolean;
    customApiAccess?: boolean;
  };
}

export const PLANS: Record<PlanType, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: PLAN_LIMITS.starter_free.name,
    tagline: "For testing the workflow & evaluating leads",
    priceMonthly: 0,
    priceAnnualMonthly: 0,
    priceMonthlyINR: 0,
    priceAnnualMonthlyINR: 0,
    limits: {
      maxLeadsPerScrape: PLAN_LIMITS.starter_free.leadsPerRun,
      maxCampaigns: PLAN_LIMITS.starter_free.campaigns,
      maxCrmDeals: PLAN_LIMITS.starter_free.crmDeals,
    },
    features: {
      unlimitedScraping: false,
      fullTechnicalAudits: PLAN_LIMITS.starter_free.fullAudit,
      aiRedesignMockups: true,
      persistentDatabase: true,
      dealsCrm: true,
      customAgencyBranding: false,
      multiCampaignSwitcher: false,
      csvExport: PLAN_LIMITS.starter_free.csvExport,
      customApiKeys: false,
      prioritySupport: false,
    },
  },
  PRO: {
    id: "PRO",
    name: PLAN_LIMITS.freelancer_pro.name,
    tagline: "For solo developers & designers closing deals",
    priceMonthly: 29,
    priceAnnualMonthly: 24,
    priceMonthlyINR: 1499,
    priceAnnualMonthlyINR: 1199,
    limits: {
      maxLeadsPerScrape: PLAN_LIMITS.freelancer_pro.leadsPerRun,
      maxCampaigns: PLAN_LIMITS.freelancer_pro.campaigns,
      maxCrmDeals: PLAN_LIMITS.freelancer_pro.crmDeals,
    },
    features: {
      unlimitedScraping: true,
      fullTechnicalAudits: PLAN_LIMITS.freelancer_pro.fullAudit,
      aiRedesignMockups: true,
      persistentDatabase: true,
      dealsCrm: true,
      customAgencyBranding: false,
      multiCampaignSwitcher: true,
      csvExport: PLAN_LIMITS.freelancer_pro.csvExport,
      customApiKeys: true,
      prioritySupport: false,
    },
  },
  AGENCY_SCALE: {
    id: "AGENCY_SCALE",
    name: PLAN_LIMITS.agency_scale.name,
    tagline: "For digital agencies & high-volume teams",
    priceMonthly: 99,
    priceAnnualMonthly: 79,
    priceMonthlyINR: 4999,
    priceAnnualMonthlyINR: 3999,
    limits: {
      maxLeadsPerScrape: PLAN_LIMITS.agency_scale.leadsPerRun,
      maxCampaigns: PLAN_LIMITS.agency_scale.campaigns,
      maxCrmDeals: PLAN_LIMITS.agency_scale.crmDeals,
    },
    features: {
      unlimitedScraping: true,
      fullTechnicalAudits: PLAN_LIMITS.agency_scale.fullAudit,
      aiRedesignMockups: true,
      persistentDatabase: true,
      dealsCrm: true,
      customAgencyBranding: true,
      multiCampaignSwitcher: true,
      csvExport: PLAN_LIMITS.agency_scale.csvExport,
      customApiKeys: true,
      prioritySupport: true,
    },
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: PLAN_LIMITS.it_firm_enterprise.name,
    tagline: "For IT services, B2B software companies & enterprise SDR teams",
    priceMonthly: 149,
    priceAnnualMonthly: 119,
    priceMonthlyINR: 9999,
    priceAnnualMonthlyINR: 7999,
    limits: {
      maxLeadsPerScrape: PLAN_LIMITS.it_firm_enterprise.leadsPerRun,
      maxCampaigns: PLAN_LIMITS.it_firm_enterprise.campaigns,
      maxCrmDeals: PLAN_LIMITS.it_firm_enterprise.crmDeals,
    },
    features: {
      unlimitedScraping: true,
      fullTechnicalAudits: PLAN_LIMITS.it_firm_enterprise.fullAudit,
      aiRedesignMockups: true,
      persistentDatabase: true,
      dealsCrm: true,
      customAgencyBranding: true,
      multiCampaignSwitcher: true,
      csvExport: PLAN_LIMITS.it_firm_enterprise.csvExport,
      customApiKeys: true,
      prioritySupport: true,
      dedicatedAccountManager: true,
      customApiAccess: true,
    },
  },
};

/**
 * Normalizes any plan string (e.g. "PRO", "freelancer_pro", "agency_scale", "IT_FIRM")
 * to canonical snake_case PlanKey.
 */
export function normalizePlanKey(plan?: string | null): PlanKey {
  if (!plan) return "starter_free";
  const p = plan.toString().trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
  if (p.includes("enterprise") || p.includes("it_firm") || p.startsWith("it")) {
    return "it_firm_enterprise";
  }
  if (p.includes("agency")) {
    return "agency_scale";
  }
  if (p.includes("pro") || p.includes("freelancer")) {
    return "freelancer_pro";
  }
  return "starter_free";
}

/**
 * Normalizes any plan string to legacy uppercase PlanType enum.
 */
export function normalizePlanType(plan?: string | null): PlanType {
  const key = normalizePlanKey(plan);
  switch (key) {
    case "it_firm_enterprise":
      return "ENTERPRISE";
    case "agency_scale":
      return "AGENCY_SCALE";
    case "freelancer_pro":
      return "PRO";
    default:
      return "FREE";
  }
}

/**
 * Get single-source-of-truth limits for any plan identifier.
 */
export function getPlanLimits(plan?: string | null): PlanLimits {
  const key = normalizePlanKey(plan);
  return PLAN_LIMITS[key];
}

/**
 * Get complete plan config for UI and billing.
 */
export function getPlanConfig(plan?: string | null): PlanConfig {
  const type = normalizePlanType(plan);
  return PLANS[type] || PLANS.FREE;
}
