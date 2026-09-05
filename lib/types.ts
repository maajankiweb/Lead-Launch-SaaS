export type Lead = {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviewsCount?: number;
  lat: number;
  lng: number;
  photosCount?: number;
  yearsInBusiness?: number;

  // Intelligence additions
  company?: string;
  industry?: string;
  businessHours?: string;
  googleBusinessStatus?: "verified" | "claimed" | "unclaimed";
  socialProfiles?: {
    linkedin?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  techStack?: string[];
  cms?: string;
  ssl?: boolean;
  websiteAge?: string;
  leadSource?: "google_maps" | "csv_import" | "manual" | "api";
  assignedOwner?: string;
  tags?: string[];
  healthScore?: number; // 0 - 100
  healthGrade?: "High Opportunity" | "Medium Opportunity" | "Low Opportunity";
  healthReasons?: string[];
};

export type AuditIssueSeverity = "critical" | "warning" | "optimal";

export type AuditIssue = {
  id: string;
  pillar: "performance" | "seo" | "technical" | "conversion" | "content";
  title: string;
  severity: AuditIssueSeverity;
  impact: string;
  recommendation: string;
  scoreImpact?: number;
};

export type AuditResult = {
  leadId: string;
  pageSpeedScore: number;
  hasWebsite: boolean;
  mobileFriendly: boolean;
  https: boolean;
  hasSchema: boolean;
  loadTimeMs: number;
  gaps: string[];
  biggestGap: string;
  estLostRevenuePerMonth: number;

  // Advanced 5-pillar audit additions
  overallScore?: number;
  performanceScore?: number;
  seoScore?: number;
  technicalScore?: number;
  mobileScore?: number;
  conversionScore?: number;
  contentScore?: number;
  coreWebVitals?: {
    lcp: string; // e.g. "3.8s"
    cls: string; // e.g. "0.22"
    inp: string; // e.g. "280ms"
    ttfb: string; // e.g. "1.2s"
    pageSize: string; // e.g. "4.2 MB"
    requests: number; // e.g. 74
  };
  issues?: AuditIssue[];
  conversionSignals?: {
    hasPrimaryCta: boolean;
    hasPhoneCta: boolean;
    hasWhatsAppCta: boolean;
    hasContactForm: boolean;
    hasBookingSystem: boolean;
    hasTrustSignals: boolean;
    hasVisibleReviews: boolean;
    hasPricing: boolean;
  };
  contentAnalysis?: {
    servicePagesCovered: boolean;
    hasAboutPage: boolean;
    hasFaqSection: boolean;
    hasLocationTargeting: boolean;
    contentQualityScore: number;
  };
  technicalDetails?: {
    sslValid: boolean;
    httpStatus: number;
    viewportResponsive: boolean;
    hasRobotsTxt: boolean;
    hasSitemap: boolean;
    hasOpenGraph: boolean;
  };
};

export type RankedLead = Lead & {
  audit: AuditResult;
  score: number;
  scoreReasoning?: string;
  scoreBreakdown?: {
    noOrBadSite: number;
    reviewVolume: number;
    rating: number;
    recency: number;
    reachable: number;
    industryFit: number;
  };
};

export type BuildPromptResult = {
  prompt: string;
  pitchPoints: string[];
  designSpecifications?: {
    objective: string;
    targetAudience: string;
    recommendedPages: string[];
    ctaStrategy: string;
    seoRecommendations: string[];
    conversionFeatures: string[];
  };
};

export type OutreachResult = {
  first: string;
  followUp: string;
  bestSendTime: string;
  linkedinPitch?: string;
  smsPitch?: string;
};

export type ScrapeInput = {
  niche: string;
  city: string;
  count: number;
};

export type OutreachChannel = "whatsapp" | "email" | "instagram" | "linkedin" | "sms";
export type OutreachLanguage = "english" | "hinglish";

// Competitor Analysis Types
export type CompetitorItem = {
  id: string;
  name: string;
  website: string;
  rating?: number;
  reviewsCount?: number;
  pageSpeedScore: number;
  mobileFriendly: boolean;
  hasWhatsApp: boolean;
  hasBooking: boolean;
  seoScore: number;
  advantages: string[];
  gaps: string[];
};

export type CompetitiveReport = {
  prospectId: string;
  summary: string;
  prospectStrengths: string[];
  competitorStrengths: string[];
  missingFeatures: string[];
  conversionGaps: string[];
  recommendedImprovements: string[];
  competitors: CompetitorItem[];
};

// AI Sales Brief Types
export type SalesBrief = {
  leadId: string;
  companyName: string;
  industry: string;
  location: string;
  websiteScore: number;
  opportunityLevel: "High" | "Medium" | "Low";
  topProblems: string[];
  topOpportunities: string[];
  recommendedServices: string[];
  pitchAngle: string;
  outreachChannel: OutreachChannel;
  suggestedProject: string;
  estimatedProjectRange: {
    min: number;
    max: number;
    currency: "INR" | "USD";
  };
  nextAction: string;
  generatedAt: string;
};

// Follow-up Sequence Types
export type SequenceStep = {
  day: number;
  stepTitle: string;
  channel: OutreachChannel;
  subject?: string;
  message: string;
  status: "pending" | "sent" | "replied" | "skipped";
};

export type OutreachSequence = {
  id: string;
  leadId: string;
  title: string;
  status: "active" | "paused" | "completed";
  steps: SequenceStep[];
  currentStepIndex: number;
  createdAt: string;
};

// CRM Pipeline Types
export type CRMStage =
  | "new_lead"
  | "qualified"
  | "audited"
  | "contacted"
  | "interested"
  | "meeting_scheduled"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost";

export type DealItemV2 = {
  id: string;
  userId?: string;
  leadId?: string;
  clientName: string;
  company: string;
  service: string;
  value: number;
  probability: number;
  stage: CRMStage;
  targetDate?: string;
  notes?: string;
  owner?: string;
  createdAt: string;
  updatedAt: string;
};

// Tasks & Follow-up Types
export type TaskItem = {
  id: string;
  leadId?: string;
  dealId?: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "completed" | "overdue";
  assignedOwner?: string;
  nextActionTag?: string;
  createdAt: string;
};

// Activity Timeline Types
export type ActivityLogItem = {
  id: string;
  leadId?: string;
  dealId?: string;
  type: "call" | "email" | "whatsapp" | "meeting" | "audit" | "proposal" | "note" | "stage_change";
  title: string;
  details: string;
  timestamp: string;
  author: string;
};

// Proposal Types
export type ProposalTemplate =
  | "website_redesign"
  | "local_seo"
  | "google_ads"
  | "social_media"
  | "website_seo_bundle"
  | "website_ads_bundle"
  | "full_digital_growth";

export type ProposalDocument = {
  id: string;
  leadId?: string;
  dealId?: string;
  title: string;
  template: ProposalTemplate;
  clientName: string;
  company: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined";
  executiveSummary: string;
  problemStatement: string;
  proposedSolution: string;
  deliverables: string[];
  timeline: string;
  setupInvestment: number;
  monthlyRetainer: number;
  currency: "INR" | "USD";
  roiProjection: string;
  terms: string;
  viewCount: number;
  lastViewedAt?: string;
  createdAt: string;
};

// Client Management & Portal Types
export type ClientRecord = {
  id: string;
  leadId?: string;
  dealId?: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  website?: string;
  status: "active" | "onboarding" | "completed" | "paused";
  projectTitle: string;
  progressPercent: number;
  milestones: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate: string;
  }>;
  totalContractValue: number;
  portalAccessKey: string;
  createdAt: string;
};

// Revenue Opportunity Assumptions
export type RevenueAssumptions = {
  monthlyVisitors: number;
  currentConversionRate: number;
  targetConversionRate: number;
  avgCustomerValue: number;
  leadToCustomerRate: number;
  currency: "INR" | "USD";
};
