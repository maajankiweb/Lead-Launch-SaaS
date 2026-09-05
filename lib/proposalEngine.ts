import type { Lead, AuditResult, ProposalDocument, ProposalTemplate } from "./types";

export function generateProposalDocument(
  lead: Lead,
  audit: AuditResult,
  template: ProposalTemplate = "website_redesign"
): ProposalDocument {
  const company = lead.company || lead.name;
  const clientName = lead.name.includes("Dr.") ? lead.name : `Management, ${company}`;
  const city = lead.city || "Local City";
  const category = lead.category || "Practice";
  const lostRev = (audit.estLostRevenuePerMonth || 50000).toLocaleString("en-IN");
  const annualRev = ((audit.estLostRevenuePerMonth || 50000) * 12).toLocaleString("en-IN");

  let title = `Strategic Digital Growth Proposal: ${company}`;
  let proposedSolution = "";
  let deliverables: string[] = [];
  let timeline = "2 to 3 Weeks";
  let setupInvestment = 45000;
  let monthlyRetainer = 5000;
  let roiProjection = `Recovering just 2–3 additional patient consultations per month yields a 300%+ annual ROI on the initial setup.`;

  switch (template) {
    case "website_redesign":
      title = `Modern High-Speed Website & Mobile Booking Architecture: ${company}`;
      proposedSolution = `Deploy a bespoke, ultra-fast Next.js website engineered for sub-second mobile loading, seamless 1-click WhatsApp booking, and automated Google review social proof.`;
      deliverables = [
        "Custom responsive design (Desktop, Tablet, Mobile) with modern UI",
        "Sticky 1-click WhatsApp appointment booking funnel",
        "Before & after clinical case portfolio gallery",
        "Interactive appointment request form with SMS/Email alerts",
        "Full LocalBusiness & MedicalClinic Schema.org structured data",
        "Core Web Vitals guarantee: 90+ Google PageSpeed score",
        "Domain connection, SSL installation, and high-speed edge CDN deployment",
      ];
      timeline = "14 Business Days";
      setupInvestment = 45000;
      monthlyRetainer = 3000;
      break;

    case "local_seo":
      title = `Google 3-Pack Maps & Local Search Dominance: ${company}`;
      proposedSolution = `Systematically optimize ${company}'s local search presence so you rank #1 for high-intent queries like 'best ${category} in ${city}'.`;
      deliverables = [
        "Complete Google Business Profile (GBP) audit & category optimization",
        "Local citation building across 50+ authoritative Indian business directories",
        "Geo-targeted localized landing pages for surrounding neighborhoods",
        "Review velocity campaign setup to ethically acquire 15+ new 5-star reviews/month",
        "Monthly local ranking benchmark reports & keyword tracking",
      ];
      timeline = "30 Days Setup + Ongoing Growth";
      setupInvestment = 25000;
      monthlyRetainer = 12000;
      roiProjection = `Ranking in the top 3 on Google Maps captures up to 44% of all local search clicks in ${city}.`;
      break;

    case "google_ads":
      title = `High-Intent Google Ads & Lead Generation Engine: ${company}`;
      proposedSolution = `Target high-intent customers searching actively for treatments in ${city} with tightly targeted Google Search campaigns and dedicated high-converting landing pages.`;
      deliverables = [
        "Keyword research identifying negative keywords to eliminate wasted ad spend",
        "High-conversion dedicated landing page with direct WhatsApp booking",
        "Conversion tracking for phone calls, WhatsApp chats, and form submissions",
        "A/B testing of ad copy, extensions, and headlines",
        "Bi-weekly optimization and negative keyword pruning",
      ];
      timeline = "7 Days Setup + 90 Days Growth";
      setupInvestment = 20000;
      monthlyRetainer = 15000;
      roiProjection = `Expected cost per qualified consultation: ₹400–₹800, generating immediate appointments in Week 1.`;
      break;

    case "website_seo_bundle":
      title = `Website Redesign + Local SEO Dominance Bundle: ${company}`;
      proposedSolution = `The comprehensive digital foundation: A blazingly fast modern website combined with organic Google Maps dominance to capture both traffic and conversions.`;
      deliverables = [
        "Full custom high-performance mobile-first website (Next.js & Tailwind)",
        "Automated WhatsApp chat booking & patient intake integration",
        "Complete Google Business Profile optimization & 40+ local citations",
        "Local SEO schema markup & 5 localized service landing pages",
        "Google review integration showcasing 5-star patient satisfaction",
        "Bi-monthly performance analytics and ranking reviews",
      ];
      timeline = "21 Business Days";
      setupInvestment = 65000;
      monthlyRetainer = 10000;
      roiProjection = `Captures high-ticket inquiries from both organic search and word-of-mouth verification, offsetting the setup investment in ~60 days.`;
      break;

    case "full_digital_growth":
      title = `Complete Digital Agency Sales Operating System: ${company}`;
      proposedSolution = `Full-spectrum growth partnership: Premium website, top Google Maps rankings, paid search customer acquisition, and automated review management.`;
      deliverables = [
        "Flagship mobile website with sub-second loading speeds",
        "Multi-channel booking integration (WhatsApp, Call, Form, Google Reserve)",
        "Continuous Local SEO and Google 3-Pack optimization",
        "Management of Google Ads campaigns with negative keyword protection",
        "Automated SMS/WhatsApp post-visit review generation workflow",
        "Dedicated account manager with monthly executive ROI reviews",
      ];
      timeline = "30 Days Deployment + 6-Month Partnership";
      setupInvestment = 95000;
      monthlyRetainer = 25000;
      roiProjection = `Designed to increase monthly booked revenue by ₹1,50,000–₹3,00,000 within 90 days of launch.`;
      break;

    default:
      title = `Digital Conversion Modernization Proposal: ${company}`;
      proposedSolution = `Eliminate digital leakage and upgrade ${company}'s online presence to match its outstanding reputation.`;
      deliverables = [
        "Modern mobile responsive website",
        "WhatsApp booking engine",
        "Local SEO optimization",
      ];
  }

  const executiveSummary = `This proposal outlines a targeted digital strategy for ${company} in ${city}. Despite maintaining a stellar ${lead.rating || 4.5}★ rating with ${lead.reviewsCount || 40}+ verified customer reviews, ${company}'s current digital funnel has significant gaps—costing an estimated ₹${lostRev}/month (₹${annualRev}/year) in missed inquiries. By implementing the modern solution detailed herein, ${company} will establish an authoritative online presence, dominate local search, and convert casual mobile searchers into scheduled appointments within seconds.`;

  const problemStatement = audit.hasWebsite
    ? `Current website suffers from mobile speed deficits (${audit.pageSpeedScore}/100 PageSpeed), missing WhatsApp booking CTAs, and absent Schema.org structured data, leading to a bounce rate above 50% on mobile visitors.`
    : `Currently operating with zero dedicated web presence. While local competitors capture organic search traffic, ${company} relies entirely on offline word-of-mouth, allowing nearby practices to capture high-value clients searching on Google.`;

  return {
    id: `prop-${lead.id}-${Date.now()}`,
    leadId: lead.id,
    title,
    template,
    clientName,
    company,
    status: "draft",
    executiveSummary,
    problemStatement,
    proposedSolution,
    deliverables,
    timeline,
    setupInvestment,
    monthlyRetainer,
    currency: "INR",
    roiProjection,
    terms: `• 50% advance upon project initiation, 50% upon final client sign-off before domain cutover.\n• Deliverables include all source code, hosting setup, and 30 days of complimentary post-launch support.\n• Monthly retainers commence 30 days after website deployment and can be cancelled with 30 days notice.`,
    viewCount: 0,
    createdAt: new Date().toISOString(),
  };
}
