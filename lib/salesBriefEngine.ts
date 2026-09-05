import type { Lead, AuditResult, SalesBrief, OutreachChannel } from "./types";

export function generateSalesBrief(lead: Lead, audit: AuditResult): SalesBrief {
  const revs = lead.reviewsCount || 40;
  const rating = lead.rating || 4.5;
  const city = lead.city || "Local City";
  const category = lead.category || "Local Practice";
  const hasWebsite = audit.hasWebsite;
  const score = audit.overallScore ?? (hasWebsite ? 52 : 24);

  // Top Problems identified
  const topProblems: string[] = [];
  if (!hasWebsite) {
    topProblems.push(`No digital storefront: 100% of organic Google inquiries in ${city} go to competitors`);
    topProblems.push("Zero online booking: Patients cannot schedule appointments outside working hours");
    topProblems.push("Reputation unmonetized: Outstanding Google reviews are not driving web conversions");
  } else {
    topProblems.push(`Slow mobile performance (${audit.pageSpeedScore}/100): High bounce rate on mobile devices`);
    topProblems.push("Missing WhatsApp CTA: No fast, friction-free messaging channel for mobile visitors");
    topProblems.push("Incomplete Local SEO & Schema: Google cannot surface treatment pricing or booking in rich snippets");
  }

  // Top Business Opportunities
  const topOpportunities: string[] = [
    `Capture an estimated ₹${(audit.estLostRevenuePerMonth || 50000).toLocaleString("en-IN")}/mo in leaked appointments`,
    `Dominant local rankings for "Best ${category} in ${city}" search terms`,
    "Instant WhatsApp appointment engine converting casual visitors within 30 seconds",
  ];

  // Recommended Agency Services
  const recommendedServices: string[] = !hasWebsite
    ? [
        "Custom High-Speed Website Development (Next.js / Tailwind)",
        "Direct 1-Click WhatsApp Booking Integration",
        "Google Business Profile Sync & Local SEO Schema",
        "Automated Patient Review Showcase System",
      ]
    : [
        "Core Web Vitals Speed Optimization (Target 90+ PageSpeed)",
        "Mobile Conversion Architecture & WhatsApp Chat Funnel",
        "Local SEO Dominance & Schema.org JSON-LD Infrastructure",
        "Before/After Treatment Case Gallery & Social Proof Badging",
      ];

  // Suggested Pitch Angle
  const pitchAngle = !hasWebsite
    ? `Compliment their stellar ${rating}★ reputation (${revs}+ reviews), then respectfully point out that missing a mobile website causes 40%+ of interested patients to book with nearby clinics instead.`
    : `Acknowledge their strong brand and existing site, then demonstrate the exact speed bottleneck and missing WhatsApp flow costing them direct consultations.`;

  // Recommended Outreach Channel
  const outreachChannel: OutreachChannel = lead.whatsapp || lead.phone ? "whatsapp" : "email";

  // Project Type & Pricing Range
  const isHighValue = revs > 100 || category.toLowerCase().includes("implant") || category.toLowerCase().includes("clinic");
  const minPrice = !hasWebsite ? (isHighValue ? 45000 : 25000) : (isHighValue ? 35000 : 20000);
  const maxPrice = !hasWebsite ? (isHighValue ? 120000 : 65000) : (isHighValue ? 95000 : 50000);

  const suggestedProject = !hasWebsite
    ? "Turnkey Healthcare Practice Website & Patient Acquisition System"
    : "Website Modernization, Speed Overhaul & WhatsApp Booking Funnel";

  // Next Best Action
  const nextAction = lead.whatsapp
    ? `Send personalized WhatsApp demo link to ${lead.phone || "the clinic"} between 11:00 AM – 1:30 PM`
    : lead.email
    ? `Send 1-page Website Audit teaser report to ${lead.email}`
    : `Call clinic desk to identify decision-maker / clinic manager contact`;

  const opportunityLevel = (audit.overallScore ?? 50) < 45 || !hasWebsite ? "High" : "Medium";

  return {
    leadId: lead.id,
    companyName: lead.company || lead.name,
    industry: lead.industry || lead.category,
    location: `${lead.address ? lead.address + ", " : ""}${city}`,
    websiteScore: score,
    opportunityLevel,
    topProblems,
    topOpportunities,
    recommendedServices,
    pitchAngle,
    outreachChannel,
    suggestedProject,
    estimatedProjectRange: {
      min: minPrice,
      max: maxPrice,
      currency: "INR",
    },
    nextAction,
    generatedAt: new Date().toISOString(),
  };
}
