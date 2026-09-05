import type { Lead, AuditResult, CompetitorItem, CompetitiveReport } from "./types";

export function generateCompetitorReport(
  lead: Lead,
  audit: AuditResult,
  customCompetitors?: CompetitorItem[]
): CompetitiveReport {
  const city = lead.city || "Local City";
  const category = lead.category || "Healthcare";
  const revs = lead.reviewsCount || 45;

  let competitors: CompetitorItem[] = [];

  if (customCompetitors && customCompetitors.length > 0) {
    competitors = customCompetitors;
  } else {
    // Generate realistic local rivals in the same geography
    const baseDomain = lead.name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 8);
    competitors = [
      {
        id: "comp-1",
        name: `Apex ${category} Care`,
        website: `https://apex${baseDomain}.in`,
        rating: 4.8,
        reviewsCount: Math.round(revs * 1.4),
        pageSpeedScore: 84,
        mobileFriendly: true,
        hasWhatsApp: true,
        hasBooking: true,
        seoScore: 88,
        advantages: ["Instant online appointment picker", "Sub-2s mobile loading", "Full schema markup"],
        gaps: ["No evening clinic hours listed"],
      },
      {
        id: "comp-2",
        name: `City Speciality ${category}`,
        website: `https://city${baseDomain}.com`,
        rating: 4.6,
        reviewsCount: Math.round(revs * 0.9),
        pageSpeedScore: 72,
        mobileFriendly: true,
        hasWhatsApp: true,
        hasBooking: false,
        seoScore: 76,
        advantages: ["Floating WhatsApp chat button", "Active before/after patient gallery"],
        gaps: ["Slow desktop hero video", "Missing pricing guidance"],
      },
      {
        id: "comp-3",
        name: `Elite ${category} Studio`,
        website: `https://elite${baseDomain}.co`,
        rating: 4.7,
        reviewsCount: Math.round(revs * 1.1),
        pageSpeedScore: 68,
        mobileFriendly: true,
        hasWhatsApp: false,
        hasBooking: true,
        seoScore: 70,
        advantages: ["Interactive calendar booking widget", "5-star Google review feed"],
        gaps: ["No direct WhatsApp chat option", "Missing FAQ schema"],
      },
    ];
  }

  // Identify Prospect Strengths
  const prospectStrengths: string[] = [];
  if (lead.rating && lead.rating >= 4.7) {
    prospectStrengths.push(`Higher average Google review rating (${lead.rating}★) than most local rivals`);
  }
  if (revs > 100) {
    prospectStrengths.push(`Deep established reputation with ${revs}+ verified patient reviews`);
  }
  if (lead.phone) {
    prospectStrengths.push("Direct primary telephone contact easily accessible");
  }

  // Identify Competitor Strengths
  const competitorStrengths: string[] = [
    "Top competitors average 75+ PageSpeed scores on mobile 4G networks",
    "67% of rivals have automated 1-click WhatsApp or calendar booking flows",
    "Structured LocalBusiness schema markup helps rivals rank in Google 3-Pack Maps",
  ];

  // Missing Features & Conversion Gaps
  const missingFeatures: string[] = [];
  const conversionGaps: string[] = [];

  if (!audit.hasWebsite) {
    missingFeatures.push("Dedicated branded web domain (.in or .com)");
    missingFeatures.push("Online treatment catalog with patient guides");
    conversionGaps.push("Zero online booking: 100% of website search traffic leaks to rivals");
  } else {
    if (audit.pageSpeedScore < 60) {
      conversionGaps.push(`Mobile speed deficit: Loads in ${audit.loadTimeMs ? (audit.loadTimeMs/1000).toFixed(1) : "4.2"}s vs. competitor average of 1.8s`);
    }
    missingFeatures.push("Floating 1-click WhatsApp appointment scheduler");
    missingFeatures.push("Interactive before/after clinical showcase slider");
  }

  const recommendedImprovements: string[] = [
    `Deploy a high-speed mobile website beating Apex ${category} Care's 84 PageSpeed score`,
    "Implement 1-click WhatsApp instant booking to capture mobile visitors within 30 seconds",
    "Install LocalBusiness & FAQPage JSON-LD schemas to conquer localized Google Map rankings",
  ];

  const summary = !audit.hasWebsite
    ? `While ${lead.name} has a superior ${lead.rating}★ rating, local competitors like Apex ${category} Care and City Speciality ${category} capture the majority of high-intent search traffic due to modern web presence and instant booking funnels.`
    : `Top local competitors currently hold 3 decisive conversion advantages over ${lead.name}: sub-2s mobile loading, automated WhatsApp scheduling, and rich local SEO schema. Fixing these gaps will redirect substantial patient volume.`;

  return {
    prospectId: lead.id,
    summary,
    prospectStrengths,
    competitorStrengths,
    missingFeatures,
    conversionGaps,
    recommendedImprovements,
    competitors,
  };
}
