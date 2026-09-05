import type { Lead, AuditResult } from "./types";

export interface CopilotQueryResponse {
  answer: string;
  suggestedAction?: string;
  sourceConfidence: "high" | "medium" | "inferred";
}

export function answerCopilotQuery(
  question: string,
  lead: Lead,
  audit?: AuditResult
): CopilotQueryResponse {
  const q = question.toLowerCase();
  const name = lead.name;
  const city = lead.city || "their local market";
  const category = lead.category || "business";
  const rating = lead.rating || 4.5;
  const revs = lead.reviewsCount || 0;
  const hasWebsite = audit?.hasWebsite ?? !!lead.website;
  const pageSpeed = audit?.pageSpeedScore ?? 0;
  const lostMonthly = (audit?.estLostRevenuePerMonth || 45000).toLocaleString("en-IN");
  const doctorTitle = name.includes("Dr.") ? name.split(",")[0] : name;

  // 1. "Why should I contact this business?"
  if (q.includes("why should i contact") || q.includes("why contact") || q.includes("why is this lead valuable")) {
    const reasons = [
      `1. High Social Proof: ${name} already has ${rating}★ from ${revs} verified Google reviews, showing proven customer satisfaction and demand.`,
      hasWebsite
        ? `2. Serious Digital Gap: Their current website scores only ${pageSpeed}/100 on PageSpeed and lacks 1-click WhatsApp booking, hurting mobile conversion.`
        : `2. Zero Dedicated Website: Despite strong demand, they have no website to capture local searchers in ${city}.`,
      `3. Commercial Leakage: Leaking an estimated ₹${lostMonthly}/month in potential client inquiries to nearby competitors who rank higher or offer instant booking.`,
      `4. High Closing Likelihood: Active businesses with great reviews and poor websites are the highest-converting agency client profile.`,
    ];
    return {
      answer: `Here is why you should contact ${name} immediately:\n\n${reasons.join("\n\n")}`,
      suggestedAction: "Send a personalized WhatsApp audit teaser",
      sourceConfidence: "high",
    };
  }

  // 2. "What should I sell them?" / "Recommended services"
  if (q.includes("what should i sell") || q.includes("what service") || q.includes("recommend")) {
    const pkg = !hasWebsite
      ? `### Primary Recommended Offer: Turnkey Website & Patient Booking System (₹45,000 – ₹75,000)
• High-performance mobile website (Next.js / Tailwind) with sub-second loading
• Sticky 1-click WhatsApp appointment booking button
• Local SEO Schema markup to conquer Google Maps search in ${city}
• Automated Google reviews showcase widget

### Upsell Offer: Local SEO & Google Maps Rank Retainer (₹10,000 – ₹15,000/mo)
• Ongoing citation building and Google Business Profile optimization to dominate the Google 3-Pack.`
      : `### Primary Recommended Offer: Website Speed & Conversion Optimization (₹35,000 – ₹60,000)
• Core Web Vitals speed overhaul (boost PageSpeed from ${pageSpeed}/100 to 90+)
• Sticky 1-click WhatsApp booking integration (currently missing)
• LocalBusiness JSON-LD schema markup for rich search cards

### Upsell Offer: Google 3-Pack SEO Retainer (₹12,000/mo)
• Dominating 'best ${category} in ${city}' search queries.`;

    return {
      answer: pkg,
      suggestedAction: "Generate a custom AI proposal with the Website + SEO bundle",
      sourceConfidence: "high",
    };
  }

  // 3. "Biggest website problems?"
  if (q.includes("biggest problem") || q.includes("website problem") || q.includes("audit issue")) {
    if (!hasWebsite) {
      return {
        answer: `${name} has NO active website listed. Their biggest problems are:\n1. Complete invisibility to clients searching via Google Search (outside of Google Maps).\n2. No automated booking or lead capture after business hours.\n3. Unable to showcase their ${rating}★ reputation with ${revs} reviews on their own digital domain.`,
        suggestedAction: "Pitch an instant launch Next.js demo website",
        sourceConfidence: "high",
      };
    }
    return {
      answer: `Key digital bottlenecks identified for ${name}:\n1. PageSpeed score is ${pageSpeed}/100 with a ${audit?.loadTimeMs ? (audit.loadTimeMs/1000).toFixed(1) + "s" : "4.5s"} load time, leading to high mobile bounce.\n2. No direct WhatsApp click-to-chat CTA above the fold.\n3. Missing LocalBusiness Schema markup, hindering Google Maps rich results.`,
      suggestedAction: "Send before/after PageSpeed comparison",
      sourceConfidence: "high",
    };
  }

  // 4. "Write WhatsApp message"
  if (q.includes("whatsapp") || q.includes("text message")) {
    const waMsg = `Namaste ${doctorTitle}! 👋\n\nI came across ${name} in ${city} — your ${rating}★ rating from ${revs}+ verified reviews is truly impressive!\n\nI noticed when prospective clients search on mobile, there is no direct WhatsApp appointment button, so many inquiries leak to nearby competitors. We built a fast 30-sec demo showing what your custom mobile portal could look like.\n\nOpen to taking a quick look? Takes just 30 seconds to review.`;
    return {
      answer: `Here is a high-converting WhatsApp message customized for ${name}:\n\n---\n${waMsg}\n---`,
      suggestedAction: "Click 'Open WhatsApp' in the Lead Profile to launch chat",
      sourceConfidence: "high",
    };
  }

  // 5. "Write email"
  if (q.includes("email") || q.includes("write an email")) {
    if (!lead.email) {
      return {
        answer: `Note: No direct email address was found in the Google listing for ${name}. However, here is a cold email template you can send if you acquire their email or send via their contact form:\n\nSubject: Quick question regarding ${name}'s online inquiries\n\nDear ${doctorTitle},\n\nI was researching top ${category} practices in ${city} and was impressed by your ${rating}★ rating from over ${revs} reviews.\n\nI noticed when clients search online in ${city}, your digital funnel has an estimated ₹${lostMonthly}/mo leakage due to ${hasWebsite ? "slow mobile loading speeds and missing WhatsApp booking" : "operating without a dedicated mobile website"}.\n\nWe put together a complimentary interactive demo customized for ${name}. Would you be open to reviewing it this Thursday?`,
        suggestedAction: "Check WhatsApp or call their reception to confirm the decision-maker's email",
        sourceConfidence: "medium",
      };
    }
    const emailMsg = `Subject: Quick question regarding ${name}'s online inquiries in ${city}\n\nDear ${doctorTitle},\n\nI was researching top ${category} practices in ${city} and was really impressed by your ${rating}★ rating from over ${revs} client reviews.\n\nI noticed that prospective clients searching on mobile often struggle to book directly with you, resulting in an estimated ₹${lostMonthly}/month in missed appointments.\n\nTo show what's possible, our agency built a quick, modern demo website specifically tailored for ${name} with 1-click WhatsApp booking.\n\nWould you have 5 minutes this Thursday for a brief chat to review the demo?\n\nBest regards,\n[Your Name]\n[Your Agency]`;
    return {
      answer: `Here is a personalized cold email for ${lead.email}:\n\n---\n${emailMsg}\n---`,
      suggestedAction: "Copy script and send via your email client",
      sourceConfidence: "high",
    };
  }

  // 6. "Handle price objection"
  if (q.includes("objection") || q.includes("too expensive") || q.includes("price") || q.includes("cost")) {
    return {
      answer: `When ${name} says "A website is too expensive" or "We already get enough word-of-mouth", reply with this consultative framework:

"Doctor/Sir, I completely understand your focus on managing expenses. But right now, you are already paying for a website—you are just paying for it in lost revenue. 

With your ${rating}★ rating and ${revs} reviews, dozens of prospective patients search for ${category} in ${city} every week. When they can't book in 10 seconds via WhatsApp, they tap the next clinic on Google Maps. 

If this new system recovers just 2 to 3 consultations per month, it completely pays for itself within 60 days. Everything after that is pure profit for your practice. Would it make sense to test the prototype first before deciding?"`,
      suggestedAction: "Offer a phased payment option (50% upfront, 50% post-launch)",
      sourceConfidence: "high",
    };
  }

  // 7. "Discovery call agenda"
  if (q.includes("agenda") || q.includes("discovery call") || q.includes("meeting")) {
    return {
      answer: `### 15-Minute Discovery Call Agenda with ${name}:
1. **Rapport & Verification (2 mins)**: "Congratulations on your ${rating}★ rating from ${revs} clients. How has patient inflow been this quarter?"
2. **Problem Exploration (4 mins)**: "When a potential patient searches for ${category} in ${city} at 9 PM, what is their exact experience trying to book with you?"
3. **Showcase Demo / Audit Proof (5 mins)**: Walk them through the 3 biggest gaps and show the interactive mobile demo with 1-click WhatsApp booking.
4. **Economics & ROI (2 mins)**: "If this brings in just 3 extra consultations per month, that's ₹25,000–₹50,000 in additional revenue."
5. **Next Step & Closing (2 mins)**: "We can have this live on your domain by next Wednesday. Shall we proceed with the proposal?"`,
      suggestedAction: "Log call scheduled in CRM Pipeline",
      sourceConfidence: "high",
    };
  }

  // Default: General summary
  return {
    answer: `### Executive Summary for ${name}:
• **Category & City**: ${category} in ${city}
• **Reputation**: ${rating}★ across ${revs} Google reviews
• **Digital Presence**: ${hasWebsite ? `Active website with ${pageSpeed}/100 PageSpeed` : "No website"}
• **Estimated Leakage**: ₹${lostMonthly}/month
• **Recommended Offer**: ${hasWebsite ? "Speed & WhatsApp Conversion Overhaul" : "Turnkey Mobile Website & Booking Engine"}
• **Available Contacts**: Phone: ${lead.phone || "Not listed"}, Email: ${lead.email || "Not listed"}`,
    suggestedAction: "Pick an action: Send WhatsApp pitch or Generate Proposal",
    sourceConfidence: "high",
  };
}
