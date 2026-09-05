import type { Lead, AuditResult, OutreachSequence, SequenceStep, OutreachChannel } from "./types";

export function generateOutreachSequence(
  lead: Lead,
  audit: AuditResult,
  preferredChannel: OutreachChannel = "whatsapp"
): OutreachSequence {
  const city = lead.city || "your city";
  const category = lead.category || "Practice";
  const revs = lead.reviewsCount || 40;
  const rating = lead.rating || 4.5;
  const lostRev = (audit.estLostRevenuePerMonth || 45000).toLocaleString("en-IN");
  const doctorTitle = lead.name.includes("Dr.") ? lead.name.split(",")[0] : lead.name;

  const steps: SequenceStep[] = [
    {
      day: 1,
      stepTitle: "Initial Personalized Teaser",
      channel: preferredChannel,
      subject: `Quick observation regarding ${lead.name}'s online inquiries`,
      message:
        preferredChannel === "whatsapp"
          ? `Namaste! 👋 Came across ${lead.name} in ${city} — your ${rating}★ rating from ${revs}+ verified reviews is truly impressive! I noticed when prospective clients search on mobile, there is no direct WhatsApp appointment button, so many inquiries leak to other clinics. We built a fast 30-sec demo showing what your custom mobile portal could look like. Open to taking a quick look?`
          : `Hi ${doctorTitle},\n\nI was researching top ${category} practices in ${city} and was impressed by your ${rating}★ rating from over ${revs} reviews.\n\nI noticed when people search online, your website lacks a fast mobile booking funnel. We put together a complimentary interactive demo customized for ${lead.name}.\n\nWould you be open to reviewing it this week?`,
      status: "pending",
    },
    {
      day: 3,
      stepTitle: "Value & Revenue Leakage Insight",
      channel: preferredChannel,
      subject: `Estimated ₹${lostRev}/mo leakage analysis for ${lead.name}`,
      message:
        preferredChannel === "whatsapp"
          ? `Hi ${doctorTitle}! Quick follow up: based on search volume in ${city}, local practices typically miss out on ~₹${lostRev}/month simply because mobile visitors can't click to chat or schedule in seconds. Did you get a chance to check the concept demo? Happy to send the 1-click preview link here.`
          : `Hi ${doctorTitle},\n\nFollowing up on my note from Tuesday. We analyzed patient search patterns in ${city} and estimated approximately ₹${lostRev}/month in lost consultations due to slow mobile loading and missing WhatsApp CTAs.\n\nWould 5 minutes on Thursday work to discuss how to recapture these inquiries?`,
      status: "pending",
    },
    {
      day: 7,
      stepTitle: "Competitor Proof & Case Study",
      channel: preferredChannel,
      subject: `How a local ${category} added 24+ monthly bookings`,
      message:
        preferredChannel === "whatsapp"
          ? `Hey ${doctorTitle}, wanted to share a quick 1-minute case study: A nearby ${category} recently upgraded their site with our 1-click WhatsApp booking system. In the first 30 days, their direct patient inquiries jumped by 34%. We can deploy the exact same system for ${lead.name} in under 48 hours. Let me know if you'd like to see the numbers!`
          : `Hi ${doctorTitle},\n\nWanted to share a quick case study: By implementing our mobile-first conversion framework and WhatsApp booking flow, a similar ${category} increased direct booked appointments by 34% in 30 days.\n\nI'd love to share the exact 3 tweaks you can apply to ${lead.name}. Are you free for a brief call tomorrow at 11 AM?`,
      status: "pending",
    },
    {
      day: 12,
      stepTitle: "Risk-Free Prototype Offer",
      channel: preferredChannel,
      subject: `Ready-to-launch prototype for ${lead.name}`,
      message:
        preferredChannel === "whatsapp"
          ? `Namaste ${doctorTitle}! I know how busy your schedule gets. Our design team has already pre-built the full mobile prototype for ${lead.name} with your logo, reviews, and treatment catalog. Zero upfront cost to test drive it. Should I share the link here?`
          : `Hi ${doctorTitle},\n\nI know you are busy managing patients, so we took the liberty of creating a ready-to-launch prototype for ${lead.name} featuring your reviews, treatments, and WhatsApp integration.\n\nZero commitment required. Can I send you the preview link?`,
      status: "pending",
    },
    {
      day: 18,
      stepTitle: "Final Courtesy Check-in / Breakup",
      channel: preferredChannel,
      subject: `Closing the file for ${lead.name}?`,
      message:
        preferredChannel === "whatsapp"
          ? `Hi ${doctorTitle}, closing out my notes for ${city} healthcare practices this month. Assuming you're fully booked and not looking for additional patient growth right now. If your priorities change down the line, feel free to reach out anytime. Wishing you continued success!`
          : `Hi ${doctorTitle},\n\nI haven't heard back, so I assume improving your website conversion and patient inquiries isn't a priority right now.\n\nI will close out your audit file. If anything changes in the future, please feel free to reach back out.\n\nWishing ${lead.name} continued success!`,
      status: "pending",
    },
  ];

  return {
    id: `seq-${lead.id}`,
    leadId: lead.id,
    title: `5-Touch High-Conversion Sequence for ${lead.name}`,
    status: "active",
    steps,
    currentStepIndex: 0,
    createdAt: new Date().toISOString(),
  };
}
