export type PlanType = "FREE" | "PRO" | "AGENCY_SCALE" | "ENTERPRISE";

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
    name: "Starter Free",
    tagline: "For testing the workflow & evaluating leads",
    priceMonthly: 0,
    priceAnnualMonthly: 0,
    priceMonthlyINR: 0,
    priceAnnualMonthlyINR: 0,
    limits: {
      maxLeadsPerScrape: 15,
      maxCampaigns: 1,
      maxCrmDeals: 5,
    },
    features: {
      unlimitedScraping: false,
      fullTechnicalAudits: false, // basic audits
      aiRedesignMockups: true,
      persistentDatabase: true,
      dealsCrm: true, // basic tracker
      customAgencyBranding: false,
      multiCampaignSwitcher: false,
      csvExport: false,
      customApiKeys: false,
      prioritySupport: false,
    },
  },
  PRO: {
    id: "PRO",
    name: "Freelancer Pro",
    tagline: "For solo developers & designers closing deals",
    priceMonthly: 29,
    priceAnnualMonthly: 24,
    priceMonthlyINR: 1499,
    priceAnnualMonthlyINR: 1199,
    limits: {
      maxLeadsPerScrape: 100,
      maxCampaigns: 15,
      maxCrmDeals: 150,
    },
    features: {
      unlimitedScraping: true,
      fullTechnicalAudits: true,
      aiRedesignMockups: true,
      persistentDatabase: true,
      dealsCrm: true,
      customAgencyBranding: false,
      multiCampaignSwitcher: true,
      csvExport: true,
      customApiKeys: true,
      prioritySupport: false,
    },
  },
  AGENCY_SCALE: {
    id: "AGENCY_SCALE",
    name: "Agency Scale",
    tagline: "For digital agencies & high-volume teams",
    priceMonthly: 99,
    priceAnnualMonthly: 79,
    priceMonthlyINR: 4999,
    priceAnnualMonthlyINR: 3999,
    limits: {
      maxLeadsPerScrape: 300,
      maxCampaigns: 100,
      maxCrmDeals: 2000,
    },
    features: {
      unlimitedScraping: true,
      fullTechnicalAudits: true,
      aiRedesignMockups: true,
      persistentDatabase: true,
      dealsCrm: true,
      customAgencyBranding: true, // White-labeling on audit reports & pitches
      multiCampaignSwitcher: true,
      csvExport: true,
      customApiKeys: true,
      prioritySupport: true,
    },
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "IT Firm & Enterprise",
    tagline: "For IT services, B2B software companies & enterprise SDR teams",
    priceMonthly: 149,
    priceAnnualMonthly: 119,
    priceMonthlyINR: 9999,
    priceAnnualMonthlyINR: 7999,
    limits: {
      maxLeadsPerScrape: 1000,
      maxCampaigns: 500,
      maxCrmDeals: 10000,
    },
    features: {
      unlimitedScraping: true,
      fullTechnicalAudits: true,
      aiRedesignMockups: true,
      persistentDatabase: true,
      dealsCrm: true,
      customAgencyBranding: true,
      multiCampaignSwitcher: true,
      csvExport: true,
      customApiKeys: true,
      prioritySupport: true,
      dedicatedAccountManager: true,
      customApiAccess: true,
    },
  },
};

export function getPlanConfig(plan?: string | null): PlanConfig {
  if (!plan) return PLANS.FREE;
  const upper = plan.toUpperCase();
  if (upper === "ENTERPRISE" || upper === "IT" || upper === "IT_FIRM") return PLANS.ENTERPRISE;
  if (upper === "AGENCY_SCALE" || upper === "AGENCY") return PLANS.AGENCY_SCALE;
  if (upper === "PRO" || upper === "FREELANCER") return PLANS.PRO;
  return PLANS.FREE;
}
