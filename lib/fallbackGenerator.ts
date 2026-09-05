import type { Lead, AuditResult, RankedLead, BuildPromptResult, OutreachResult, OutreachChannel, OutreachLanguage } from "./types";

export function generateAuditFallback(leads: Lead[]): Record<string, AuditResult> {
  const audits: Record<string, AuditResult> = {};

  for (const lead of leads) {
    const hasWebsite = Boolean(lead.website && lead.website.trim().length > 0);
    const url = lead.website ?? "";
    const isFreeBuilder = /weebly|wixsite|business\.site|wordpress\.com|site123|blogspot/i.test(url);
    const rating = lead.rating ?? 4.0;
    const pageSpeedScore = hasWebsite ? (isFreeBuilder ? 32 : (rating >= 4.8 ? 58 : 44)) : 0;
    const revCount = lead.reviewsCount || 35;
    const estLostRevenuePerMonth = Math.max(25000, revCount * 400 + (hasWebsite ? 0 : 30000));

    let gaps: string[] = [];
    let biggestGap = "";

    if (!hasWebsite) {
      gaps = [
        "No website at all",
        "No direct appointment / booking system",
        "Zero Google organic SEO presence",
        "Reviews not leveraged on dedicated web domain",
        "No online treatment menu or transparent pricing",
      ];
      biggestGap = `${rating}★ rating with ${revCount} reviews in ${lead.city || "the city"}, but zero website means losing dozens of high-value direct inquiries every month to competitors ranking on Google.`;
    } else if (isFreeBuilder) {
      gaps = [
        "Free generic template builder",
        "Missing custom brand identity",
        "Not optimized for mobile touch screens",
        "No direct WhatsApp booking integration",
        "Slow load speeds & high visitor bounce rate",
      ];
      biggestGap = `Free template site looks generic and slow. Patients searching online compare multiple clinics and bounce immediately to modern competitors.`;
    } else {
      gaps = [
        "No instant WhatsApp appointment booking widget",
        "Missing before/after patient case gallery",
        "Missing LocalBusiness JSON-LD schema markup",
        "Weak local search ranking for key treatment keywords",
      ];
      biggestGap = `Existing site lacks conversion-focused WhatsApp booking and before/after proof, causing potential patients to drop off without taking action.`;
    }

    audits[lead.id] = {
      leadId: lead.id,
      pageSpeedScore,
      hasWebsite,
      mobileFriendly: hasWebsite && !isFreeBuilder,
      https: hasWebsite && url.startsWith("https"),
      hasSchema: false,
      loadTimeMs: hasWebsite ? (pageSpeedScore < 40 ? 7400 : 3600) : 0,
      gaps,
      biggestGap,
      estLostRevenuePerMonth,
    };
  }

  return audits;
}

export function generateRankFallback(leads: Lead[], audits: Record<string, AuditResult>): RankedLead[] {
  const auditable = leads.filter((l) => audits[l.id]);

  return auditable
    .map((lead) => {
      const audit = audits[lead.id];
      let score = 50;

      // Signals weighting
      if (!audit.hasWebsite) score += 25;
      else if (audit.pageSpeedScore < 45) score += 15;

      const revs = lead.reviewsCount || 0;
      if (revs > 100) score += 15;
      else if (revs > 50) score += 10;
      else if (revs > 20) score += 5;

      const rating = lead.rating ?? 4.0;
      if (rating >= 4.8) score += 8;
      else if (rating >= 4.5) score += 5;

      if (lead.whatsapp || lead.phone) score += 6;
      if (lead.email) score += 4;

      score = Math.min(98, Math.max(35, score));

      let scoreReasoning = "";
      if (!audit.hasWebsite) {
        scoreReasoning = `Top opportunity: ${lead.rating}★ (${revs} reviews) with zero web presence and accessible WhatsApp. High closing potential.`;
      } else if (audit.pageSpeedScore < 45) {
        scoreReasoning = `Slow/underperforming site (${audit.pageSpeedScore}/100) on active practice (${revs} reviews). Immediate modernization upside.`;
      } else {
        scoreReasoning = `Active business with ${revs} reviews. Opportunity to add direct WhatsApp booking flow and local SEO dominance.`;
      }

      return {
        ...lead,
        audit,
        score,
        scoreReasoning,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function generateBuildPromptFallback(lead: RankedLead, platform: string): BuildPromptResult {
  const doctorName = lead.name.includes("Dr.") ? lead.name.split(",")[0].trim() : lead.name;
  const waNum = (lead.whatsapp || lead.phone || "").replace(/[^0-9]/g, "");

  const prompt = `Build a modern, high-converting, mobile-first website for "${lead.name}", a premier ${lead.category || "practice"} located in ${lead.address || lead.city} (${lead.rating}★ rating with ${lead.reviewsCount || 50}+ verified patient reviews).

### Key Features & Design System:
- Color Scheme: Modern deep clinical slate (#0F172A), crisp background white, and high-trust medical turquoise (#0EA5E9) with gold accents for 5-star ratings.
- Mobile First: Above-the-fold hero CTA specifically tailored for 375px mobile screens.
- Header: Sticky header with Clinic Branding, Navigation Links, Click-to-Call (+91 ${lead.phone || ""}) and "Book Appointment" primary CTA.
- Floating Action: Fixed bottom-right WhatsApp chat bubble linked to https://wa.me/${waNum}?text=Hi%2C%20I%20would%20like%20to%20inquire%20about%20booking%20an%20appointment.

### 9 Core Sections:
1. HERO SECTION:
   - Headline: "${lead.city || "Top"}'s Trusted ${lead.category || "Healthcare"} Center"
   - Subheadline: "Delivering gentle, world-class treatments backed by ${lead.rating}★ patient satisfaction and ${lead.reviewsCount || 100}+ verified reviews."
   - Dual CTAs: "Book Instant Consultation" (Primary) + "WhatsApp Chat" (Secondary)
   - Trust Badges: "${lead.rating}★ Google Rated (${lead.reviewsCount || 100}+ Reviews)" | "Modern Painless Technology" | "Experienced Specialists"

2. BEFORE & AFTER CASE GALLERY:
   - Side-by-side interactive visual showcase of successful treatments and transformations.

3. SERVICES & SPECIALTIES GRID:
   - Interactive feature cards with icons detailing comprehensive services and specialty procedures.

4. DOCTOR & TEAM PROFILE:
   - Credential highlights for ${doctorName}, detailing certifications, patient-first philosophy, and hygienic sterilization protocols.

5. VERIFIED PATIENT REVIEWS CAROUSEL:
   - Real patient testimonials highlighting punctual appointments, gentle care, and successful outcomes.

6. INTERACTIVE APPOINTMENT BOOKING FORM:
   - Simple 3-step intake form (Select Treatment, Choose Preferred Date/Time, Enter Name & WhatsApp Number).

7. FREQUENTLY ASKED QUESTIONS (FAQ):
   - Accordion answering common patient questions about treatments, recovery times, pricing, and insurance.

8. LOCATION, HOURS & GOOGLE MAP:
   - Clinic Address: ${lead.address || lead.city}
   - Hours: Monday – Saturday (9:30 AM – 8:00 PM) with 1-click Google Maps directions button.

9. FOOTER & LOCAL SEO JSON-LD:
   - Embedded LocalBusiness / MedicalClinic Schema.org JSON-LD markup with geolocation and phone.

OUTPUT TARGET: ${platform.toUpperCase()}`;

  const pitchPoints = [
    `Converts the clinic's stellar ${lead.rating}★ reputation (${lead.reviewsCount || 50}+ reviews) into direct patient appointments with 1-click WhatsApp booking.`,
    `Delivers instant sub-second mobile loading speeds, eliminating the bounce rate of slow competitor websites.`,
    `Equipped with local SEO schema to ensure the practice dominates "best ${lead.category || "clinic"} in ${lead.city}" Google searches.`,
  ];

  return { prompt, pitchPoints };
}

export function generateOutreachFallback(
  lead: RankedLead,
  channel: OutreachChannel,
  language: OutreachLanguage,
): OutreachResult {
  const isDoctor = lead.name.toLowerCase().includes("dr.") || lead.category.toLowerCase().includes("dental") || lead.category.toLowerCase().includes("clinic");
  const greeting = isDoctor ? "Doctor sir" : "Sir/Ma'am";
  const demoUrl = `https://lead-launch.demo/${lead.id}`;
  const revs = lead.reviewsCount || 50;

  if (channel === "call") {
    const isHinglish = language === "hinglish";
    const hook = isHinglish
      ? `Namaste ${greeting}! Kya main ${lead.name} ke owner/decision-maker se baat kar raha hoon? Sir, main local businesses ko online patient/client conversions boost karne me help karta hoon. Sirf 45 seconds lagenge aapka time.`
      : `Hello ${greeting}! Am I speaking with the business owner or clinic manager at ${lead.name}? I help local businesses in ${lead.city} turn Google searches into booked appointments. Do you have 45 seconds?`;

    const observation = isHinglish
      ? `Maine Google pe dekha ki aapka ${lead.rating || "4.8"}★ rating aur ${revs}+ reviews bohot strong hain! Lekin jab log ${lead.city} me search karte hain, toh aapki koi modern mobile-friendly website nahi milti ya direct WhatsApp booking button nahi hai, jiski wajah se estimated ₹${(lead.audit.estLostRevenuePerMonth || 45000).toLocaleString("en-IN")}/mahina ka business competitors ke paas chala jaata hai.`
      : `I noticed your ${lead.rating || "4.8"}★ Google profile with ${revs}+ reviews is stellar. However, prospective clients searching in ${lead.city} either encounter no website or a slow mobile experience with no instant WhatsApp booking, leaking an estimated ₹${(lead.audit.estLostRevenuePerMonth || 45000).toLocaleString("en-IN")}/month.`;

    const offer = isHinglish
      ? `Maine specially aapke liye ek live redesigned demo website banayi hai, jisme click-to-WhatsApp booking aur verified reviews ready hain. Main chahta hoon ki main aapko WhatsApp pe link share karun — dekhne me sirf 1 minute lagega. Kya main aapke is number pe WhatsApp bhej doon?`
      : `To demonstrate what's possible, I've already prepared a free, personalized demo website for ${lead.name} with instant booking and mobile optimization. May I send you the direct link on WhatsApp right now to review?`;

    const objectionHandling = [
      {
        objection: isHinglish ? "Humare paas pehle se website / agency hai" : "We already have a website / agency",
        response: isHinglish
          ? "Bilkul samajhta hoon sir! Par agar aap 1 minute nikaal ke hamari live demo dekhein, toh aapko pata chalega ki kaise WhatsApp booking se conversions 3x badh jaate hain. Koi charges nahi hain dekhne ke."
          : "Understood! Many owners tell us that, but after seeing how our instant WhatsApp conversion funnel works, they realize they're capturing 3x more bookings without spending more on ads.",
      },
      {
        objection: isHinglish ? "Abhi time nahi hai / Baad me baat karo" : "I'm busy / Not interested right now",
        response: isHinglish
          ? "No problem at all sir! Main sirf link WhatsApp kar deta hoon. Jab bhi free time mile aap check kar lijiyega."
          : "Completely understand, I know you're busy with clients. Let me just text you the demo link on WhatsApp so you can review at your convenience.",
      },
      {
        objection: isHinglish ? "Cost kitna lagega?" : "How much does this cost?",
        response: isHinglish
          ? "Sir demo dekhna 100% free hai. Agar aapko pasand aaye aur aap live launch karna chahein, toh standard setup ₹15,000 se start hota hai with full support. Pehle aap demo dekh lijiye!"
          : "The demo preview is 100% free with zero obligation. If you love it and want to launch it live, our packages start at just ₹15,000. Let me send you the preview first!",
      },
    ];

    const first = `[COLD CALL SCRIPT FOR ${lead.name.toUpperCase()}]
1. OPENER (10 Sec):
"${hook}"

2. OBSERVATION & PAIN (20 Sec):
"${observation}"

3. THE VALUE OFFER (15 Sec):
"${offer}"`;

    const followUp = `[DAY-3 FOLLOW-UP CALL SCRIPT]
"Namaste ${greeting}, maine 2 din pehle aapko ${lead.name} ke live demo ka WhatsApp link share kiya tha. Kya aapko 2 minute mila use dekhne ka? Agar pasand aaya toh hum is weekend tak live launch kar sakte hain."`;

    return {
      first,
      followUp,
      bestSendTime: "Mon–Fri, 11:30 AM – 1:00 PM or 4:00 PM – 6:00 PM IST",
      callScript: {
        hook,
        observation,
        offer,
        objectionHandling,
      },
    };
  }

  if (channel === "email") {
    const subject = `Quick question regarding ${lead.name}'s website inquiries`;
    const first = `Dear ${lead.name.split(",")[0]},

I was researching top ${lead.category} practices in ${lead.city} and was really impressed by your ${lead.rating}★ rating from over ${revs} patient reviews.

I noticed that when prospective patients search for services in ${lead.city}, you don't have a modern website with instant appointment booking, so many potential patients end up booking with other nearby clinics.

To show what's possible, I put together a quick, modern demo website specifically for ${lead.name}:
👉 Demo: ${demoUrl}

Would you be open to taking a look? If you like it, we can have it live on your domain in 24 hours.

Best regards,
[Your Name]
[Your Contact Number]`;

    const followUp = `Dear ${lead.name.split(",")[0]},

Following up on my note from earlier this week. Local practices in ${lead.city} typically miss out on ₹${(lead.audit.estLostRevenuePerMonth || 50000).toLocaleString("en-IN")}/month in new patient appointments simply due to missing online booking.

Here is the demo link again: ${demoUrl}

Would you have 5 minutes for a brief call this Thursday or Friday?

Best regards,
[Your Name]`;

    return {
      first,
      followUp,
      emailSubject: subject,
      bestSendTime: "Tue–Thu, 10:30 AM – 1:00 PM IST",
    };
  }

  if (language === "hinglish") {
    const first = `Namaste ${greeting}! 👋

Maine aapke clinic (${lead.name}) ke baare mein dekha — Google pe aapka ${lead.rating}★ rating aur ${revs}+ reviews sach mein bohot impressive hai! 🔥

Par notice kiya ki jab new patients Google pe search karte hain, toh online WhatsApp appointment booking na hone ki wajah se kaafi inquiries miss ho jaati hain.

Maine specially ${lead.name} ke liye ek modern demo website design ki hai jismein 1-click WhatsApp booking aur patient reviews integrated hain:

👉 Demo link: ${demoUrl}

Dekhne mein sirf 30 seconds lagenge sir. Agar accha lage toh batayiye, we can connect it to your domain. Agar nahi toh no problem at all!

Regards,
[Your Name]`;

    const followUp = `Namaste ${greeting}, just following up on my previous message.

${lead.city} mein active clinics online appointment booking se easily har mahine ₹${(lead.audit.estLostRevenuePerMonth || 50000).toLocaleString("en-IN")} tak ka extra patient inflow generate kar leti hain.

Kya aapne demo link check karne ka mauka mila?
👉 ${demoUrl}

Agar free ho toh kya hum 5-minute ka quick phone call kar sakte hain?`;

    return { first, followUp, bestSendTime: "Tue–Thu, 11:00 AM – 1:30 PM IST (WhatsApp)" };
  }

  // English WhatsApp
  const first = `Hello ${greeting}! 👋

I came across ${lead.name} in ${lead.city} — your ${lead.rating}★ rating with ${revs}+ verified reviews is truly outstanding! 🔥

I noticed prospective patients searching online can't easily view your treatments or book directly via WhatsApp, which means new patients often slip away to other clinics.

I built a free, modern demo website customized for ${lead.name} with instant WhatsApp booking:

👉 Demo: ${demoUrl}

Takes 30 seconds to review. If you like it, we can launch it in 24 hours. If not, no worries at all!

Best regards,
[Your Name]`;

  const followUp = `Hi ${greeting}, just following up on my earlier message!

Practices in ${lead.city} with 1-click WhatsApp booking typically capture an estimated ₹${(lead.audit.estLostRevenuePerMonth || 50000).toLocaleString("en-IN")}/month in additional treatment consultations.

Did you get a moment to view your demo?
👉 ${demoUrl}

Would love to hop on a quick 5-min call this week if you'd like to take it live!`;

  return { first, followUp, bestSendTime: "Tue–Thu, 11:00 AM – 1:30 PM IST (WhatsApp)" };
}
