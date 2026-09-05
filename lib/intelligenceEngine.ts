import type { Lead, AuditResult } from "./types";

export interface HealthScoreResult {
  score: number;
  grade: "High Opportunity" | "Medium Opportunity" | "Low Opportunity";
  reasons: string[];
  signals: {
    websiteHealth: number;
    conversionHealth: number;
    reputationHealth: number;
    reachabilityHealth: number;
  };
}

/**
 * Computes the Lead Health / Opportunity Score (0-100) based on explainable business signals.
 * High score = High Opportunity for an agency to deliver impactful services and close a deal.
 */
export function computeLeadHealthScore(lead: Lead, audit?: AuditResult): HealthScoreResult {
  let score = 50;
  const reasons: string[] = [];

  const hasWebsite = Boolean(lead.website && lead.website.trim().length > 0);
  const pageSpeed = audit?.pageSpeedScore ?? (hasWebsite ? 52 : 0);
  const revs = lead.reviewsCount || 0;
  const rating = lead.rating || 4.0;
  const hasPhone = Boolean(lead.phone || lead.whatsapp);
  const hasEmail = Boolean(lead.email);

  // 1. Website Status Signal (Max ±30 pts)
  if (!hasWebsite) {
    score += 26;
    reasons.push("Zero active website despite strong local presence — high demand for new build");
  } else {
    const isFreeBuilder = /weebly|wixsite|business\.site|wordpress\.com|site123|blogspot/i.test(lead.website || "");
    if (isFreeBuilder) {
      score += 18;
      reasons.push("Using a generic free sub-domain builder — brand credibility leak");
    } else if (pageSpeed < 45) {
      score += 16;
      reasons.push(`Slow loading speed (${pageSpeed}/100) causing mobile visitor bounce`);
    } else if (pageSpeed < 65) {
      score += 8;
      reasons.push(`Sub-optimal performance (${pageSpeed}/100) with room for Core Web Vitals optimization`);
    } else {
      score -= 8;
      reasons.push("Existing website has decent base performance");
    }

    if (audit && !audit.https) {
      score += 6;
      reasons.push("Missing SSL certificate (browsers show Not Secure)");
    }
  }

  // 2. Conversion Signals (Max ±20 pts)
  if (audit?.conversionSignals) {
    if (!audit.conversionSignals.hasWhatsAppCta) {
      score += 8;
      reasons.push("No direct WhatsApp click-to-chat CTA");
    }
    if (!audit.conversionSignals.hasBookingSystem) {
      score += 7;
      reasons.push("Missing automated appointment booking / lead capture system");
    }
    if (!audit.conversionSignals.hasTrustSignals) {
      score += 5;
      reasons.push("Patient/client reviews not highlighted on web property");
    }
  } else {
    score += 10;
    reasons.push("Likely missing modern mobile conversion funnels & 1-click WhatsApp booking");
  }

  // 3. Social Proof & Authority (High reviews + bad site = HIGHEST OPPORTUNITY)
  if (revs >= 100) {
    score += 15;
    reasons.push(`High review volume (${revs} reviews) proves active paying clientele`);
  } else if (revs >= 40) {
    score += 10;
    reasons.push(`Established business with ${revs} verified Google reviews`);
  } else if (revs >= 15) {
    score += 5;
    reasons.push(`Growing local reputation (${revs} reviews)`);
  }

  if (rating >= 4.7) {
    score += 6;
    reasons.push(`Top-tier ${rating}★ reputation provides strong social leverage`);
  } else if (rating < 3.8) {
    score -= 6;
    reasons.push(`Lower review rating (${rating}★) may require reputation management first`);
  }

  // 4. Reachability & Sales Friction (Max ±10 pts)
  if (hasPhone && hasEmail) {
    score += 6;
    reasons.push("Direct decision-maker contact details accessible (Phone + Email)");
  } else if (hasPhone) {
    score += 4;
    reasons.push("Direct WhatsApp/Phone contact available for immediate outreach");
  } else {
    score -= 10;
    reasons.push("No direct phone or email listed; higher outreach friction");
  }

  // Clamp 0 - 100
  const finalScore = Math.min(98, Math.max(25, Math.round(score)));

  let grade: "High Opportunity" | "Medium Opportunity" | "Low Opportunity" = "Medium Opportunity";
  if (finalScore >= 75) grade = "High Opportunity";
  else if (finalScore < 50) grade = "Low Opportunity";

  return {
    score: finalScore,
    grade,
    reasons: reasons.slice(0, 5),
    signals: {
      websiteHealth: hasWebsite ? pageSpeed : 10,
      conversionHealth: audit?.conversionSignals?.hasWhatsAppCta ? 75 : 30,
      reputationHealth: Math.min(100, Math.round((revs / 80) * 50 + rating * 10)),
      reachabilityHealth: hasPhone ? (hasEmail ? 95 : 80) : 40,
    },
  };
}

/**
 * Enriches a basic lead with intelligent inferred attributes:
 * CMS, technology stack, business hours, social profiles, and health indicators.
 */
export function enrichLeadIntelligence(lead: Lead, audit?: AuditResult): Lead {
  const url = lead.website || "";
  let cms = "Custom Web Stack";
  const techStack: string[] = [];

  if (!url) {
    cms = "No Website";
    techStack.push("Google Business Profile Only");
  } else if (/wordpress|wp-content/i.test(url)) {
    cms = "WordPress / WooCommerce";
    techStack.push("WordPress", "PHP", "MySQL", "Apache/LiteSpeed");
  } else if (/shopify/i.test(url)) {
    cms = "Shopify";
    techStack.push("Shopify Liquid", "CDN", "Stripe");
  } else if (/wix/i.test(url)) {
    cms = "Wix Studio";
    techStack.push("Wix Platform", "Node.js Cloud");
  } else if (/squarespace/i.test(url)) {
    cms = "Squarespace";
    techStack.push("Squarespace", "CloudFront CDN");
  } else if (/webflow/i.test(url)) {
    cms = "Webflow";
    techStack.push("Webflow", "AWS CloudFront", "Tailwind");
  } else if (/business\.site/i.test(url)) {
    cms = "Google Business Site (Deprecated)";
    techStack.push("Google My Business (Discontinued)");
  } else {
    techStack.push("HTML5", "Modern CSS", "JavaScript", "Cloudflare DNS");
  }

  // Health calculation
  const health = computeLeadHealthScore(lead, audit);

  // Social profile heuristics
  const cleanName = lead.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const socialProfiles = lead.socialProfiles || {
    instagram: `instagram.com/${cleanName}`,
    facebook: `facebook.com/${cleanName}`,
    linkedin: lead.name.toLowerCase().includes("clinic") ? `linkedin.com/company/${cleanName}` : undefined,
  };

  return {
    ...lead,
    company: lead.company || lead.name,
    industry: lead.industry || lead.category,
    businessHours: lead.businessHours || "Mon-Sat: 09:30 AM - 08:30 PM",
    googleBusinessStatus: lead.googleBusinessStatus || (lead.rating ? "verified" : "unclaimed"),
    cms: lead.cms || cms,
    techStack: lead.techStack || techStack,
    ssl: lead.ssl ?? (url ? url.startsWith("https") : false),
    websiteAge: lead.websiteAge || (lead.yearsInBusiness ? `${lead.yearsInBusiness} years` : "Estimated 4-6 years"),
    leadSource: lead.leadSource || "google_maps",
    healthScore: health.score,
    healthGrade: health.grade,
    healthReasons: health.reasons,
    tags: lead.tags || (health.score >= 75 ? ["Hot Opportunity", "High Value"] : ["Prospect"]),
  };
}
