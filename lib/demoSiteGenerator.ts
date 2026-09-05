import type { RankedLead } from "./types";

export type DemoSiteTheme = "modern" | "editorial" | "corporate" | "vibrant";

interface DemoSiteOptions {
  theme?: DemoSiteTheme;
  customHeading?: string;
  customCta?: string;
}

export function generateDemoSiteHtml(lead: RankedLead, options: DemoSiteOptions = {}): string {
  const theme = options.theme || "modern";
  const name = lead.name || "Premier Business";
  const city = (lead.city || "Mumbai").split(",")[0].trim();
  const category = lead.category || "Professional Services";
  const phone = lead.phone || "+91 98765 43210";
  const cleanPhone = phone.replace(/\D/g, "");
  const wa = (lead.whatsapp || lead.phone || "919876543210").replace(/\D/g, "");
  const formattedWa = wa.length === 10 ? "91" + wa : wa;
  const rating = lead.rating || 4.9;
  const reviews = lead.reviewsCount || 120;
  const years = lead.yearsInBusiness || 8;
  const address = lead.address || `${city}, India`;

  // Theme palettes
  const themes = {
    modern: {
      bodyBg: "bg-slate-950 text-slate-100",
      cardBg: "bg-slate-900/90 border-slate-800 text-slate-200",
      headerBg: "bg-slate-950/85 border-slate-800",
      primaryBtn: "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold",
      secondaryBtn: "border-slate-700 text-slate-200 hover:bg-slate-800",
      accentBadge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      highlightText: "text-emerald-400",
      trustBg: "bg-slate-900 border-slate-800",
      fontClass: "font-sans",
    },
    editorial: {
      bodyBg: "bg-[#fbf7ee] text-stone-900",
      cardBg: "bg-[#f5efe6] border-stone-300 text-stone-800",
      headerBg: "bg-[#fbf7ee]/90 border-stone-200",
      primaryBtn: "bg-stone-900 hover:bg-stone-800 text-amber-50 font-medium",
      secondaryBtn: "border-stone-400 text-stone-800 hover:bg-stone-200/60",
      accentBadge: "bg-amber-900/10 text-amber-900 border-amber-900/20",
      highlightText: "text-stone-700 font-serif italic",
      trustBg: "bg-[#ede4d3] border-stone-300",
      fontClass: "font-serif",
    },
    corporate: {
      bodyBg: "bg-slate-50 text-slate-900",
      cardBg: "bg-white border-slate-200 text-slate-800 shadow-sm",
      headerBg: "bg-white/90 border-slate-200",
      primaryBtn: "bg-blue-600 hover:bg-blue-700 text-white font-semibold",
      secondaryBtn: "border-slate-300 text-slate-700 hover:bg-slate-100",
      accentBadge: "bg-blue-50 text-blue-700 border-blue-200",
      highlightText: "text-blue-600",
      trustBg: "bg-blue-900 text-white border-blue-800",
      fontClass: "font-sans",
    },
    vibrant: {
      bodyBg: "bg-neutral-950 text-neutral-100",
      cardBg: "bg-neutral-900/90 border-neutral-800 text-neutral-200",
      headerBg: "bg-neutral-950/85 border-neutral-800",
      primaryBtn: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold",
      secondaryBtn: "border-neutral-700 text-neutral-200 hover:bg-neutral-800",
      accentBadge: "bg-violet-500/10 text-violet-400 border-violet-500/30",
      highlightText: "text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400",
      trustBg: "bg-neutral-900 border-neutral-800",
      fontClass: "font-sans",
    },
  };

  const currentTheme = themes[theme] || themes.modern;

  // Category specific services generator
  const getServices = () => {
    const cat = category.toLowerCase();
    if (cat.includes("dental") || cat.includes("dentist")) {
      return [
        { title: "Root Canal Treatment", desc: "Painless single-sitting root canals using advanced rotary equipment." },
        { title: "Dental Implants", desc: "Permanent, natural-looking replacement for missing teeth with lifetime warranty." },
        { title: "Teeth Whitening & Veneers", desc: "Instant smile makeover with certified cosmetic laser whitening." },
        { title: "Invisible Aligners", desc: "Straighten teeth discreetly without metal wires or braces." },
        { title: "Pediatric Dentistry", desc: "Gentle dental care specially designed for children and infants." },
        { title: "Emergency Dental Care", desc: "Immediate relief for severe toothaches, chipped teeth, and trauma." }
      ];
    } else if (cat.includes("salon") || cat.includes("spa") || cat.includes("beauty")) {
      return [
        { title: "Hair Styling & Color", desc: "Signature haircuts, balayage, keratin treatments, and botox therapies." },
        { title: "Bridal Makeovers", desc: "Complete luxury HD and airbrush bridal makeup and grooming." },
        { title: "Skin Rejuvenation", desc: "Hydra facials, microdermabrasion, and anti-aging glow therapy." },
        { title: "Relaxing Spa Therapy", desc: "Full body Swedish massage, aromatherapy, and detox scrubs." },
        { title: "Nail Art & Extensions", desc: "Gel extensions, chrome finishes, and customized nail art designs." },
        { title: "Men's Luxury Grooming", desc: "Precision beard shaping, beard spas, and modern fades." }
      ];
    } else if (cat.includes("restaurant") || cat.includes("cafe")) {
      return [
        { title: "Dine-In Experience", desc: "Authentic culinary dishes prepared fresh by master chefs daily." },
        { title: "Private Table Booking", desc: "Reserve cozy private dining for family celebrations and anniversaries." },
        { title: "Outdoor Garden Seating", desc: "Enjoy our signature appetizers and specialty brewed coffee in open air." },
        { title: "Event & Party Catering", desc: "Custom curated menus for corporate events, birthdays, and parties." },
        { title: "Chef's Tasting Specials", desc: "Seasonal menu combinations pairing handcrafted desserts." },
        { title: "Fast Curbside Takeaway", desc: "Pack your favorite meals fresh and hot in under 15 minutes." }
      ];
    }
    return [
      { title: "Comprehensive Consultation", desc: "In-depth personalized evaluation tailored to your specific requirements." },
      { title: "Premium Service Execution", desc: "Delivered with highest standards of professionalism, precision, and care." },
      { title: "Verified Customer Guarantee", desc: "100% satisfaction commitment backed by thousands of happy clients." },
      { title: "Modern Online Booking", desc: "Instant appointment confirmations directly to your WhatsApp." },
      { title: "Transparent Pricing", desc: "No hidden charges, zero surprises, upfront clear estimates." },
      { title: "Ongoing Support & Care", desc: "Dedicated follow-ups ensuring long-term results and peace of mind." }
    ];
  };

  const services = getServices();

  return `<!doctype html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${name} — Premier ${category} in ${city}</title>
  <meta name="description" content="Official website of ${name}. Rated ${rating}★ on Google with ${reviews}+ reviews. Book instant appointments on WhatsApp.">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-serif { font-family: 'Newsreader', serif; }
  </style>
</head>
<body class="${currentTheme.bodyBg} min-h-screen antialiased selection:bg-emerald-500/20">

  <!-- Top Announcement Bar -->
  <div class="py-2 px-4 text-center text-xs font-semibold bg-emerald-600 text-white tracking-wide">
    🎉 Welcoming New Clients in ${city} · Instant 10% First Visit Courtesy · Book on WhatsApp Below
  </div>

  <!-- Header -->
  <header class="sticky top-0 z-40 backdrop-blur-xl border-b ${currentTheme.headerBg}">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
      <a href="#" class="flex items-center gap-2">
        <span class="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-base">★</span>
        <div>
          <span class="font-extrabold text-base sm:text-lg tracking-tight block leading-none">${name}</span>
          <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">${category} · ${city}</span>
        </div>
      </a>

      <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
        <a href="#services" class="hover:text-emerald-400 transition">Services</a>
        <a href="#about" class="hover:text-emerald-400 transition">About</a>
        <a href="#reviews" class="hover:text-emerald-400 transition">Reviews</a>
        <a href="#contact" class="hover:text-emerald-400 transition">Contact</a>
      </nav>

      <div class="flex items-center gap-2.5">
        <a href="tel:${cleanPhone}" class="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border ${currentTheme.secondaryBtn} transition">
          📞 ${phone}
        </a>
        <a href="https://wa.me/${formattedWa}?text=Hi%20${encodeURIComponent(name)},%20I%20saw%20your%20website%20and%20would%20like%20to%20book%20an%20appointment." target="_blank" class="inline-flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl shadow-lg ${currentTheme.primaryBtn} transition">
          <span>Book on WhatsApp</span> →
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="py-16 sm:py-24 relative overflow-hidden">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold mb-6 ${currentTheme.accentBadge}">
        <span>🏆 Ranked #1 ${category} in ${city}</span> · <span>${rating}★ (${reviews}+ Reviews)</span>
      </div>

      <div class="grid lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-7 space-y-6">
          <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08]">
            World-Class Care.<br/>
            <span class="${currentTheme.highlightText}">Trusted for ${years}+ Years</span><br/>
            Right Here in ${city}.
          </h1>
          <p class="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
            Experience exceptional ${category.toLowerCase()} services tailored to your comfort. Over ${reviews}+ five-star verified patient reviews across Google.
          </p>

          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <a href="https://wa.me/${formattedWa}?text=Hello%20${encodeURIComponent(name)},%20I%20would%20like%20to%20inquire%20about%20your%20services." target="_blank" class="px-7 py-3.5 rounded-xl text-center text-sm ${currentTheme.primaryBtn} shadow-xl transition flex items-center justify-center gap-2">
              <span>💬 Book Instant Appointment on WhatsApp</span>
            </a>
            <a href="tel:${cleanPhone}" class="px-6 py-3.5 rounded-xl text-center text-sm border ${currentTheme.secondaryBtn} transition flex items-center justify-center gap-2">
              <span>📞 Call Us Directly</span>
            </a>
          </div>

          <!-- Trust Badges -->
          <div class="pt-4 flex items-center gap-6 text-xs text-slate-400 flex-wrap">
            <div class="flex items-center gap-1.5">
              <span class="text-emerald-400 font-bold">✓</span> Verified Business Listing
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-emerald-400 font-bold">✓</span> No Long Wait Times
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-emerald-400 font-bold">✓</span> 100% Sanitized & Modern
            </div>
          </div>
        </div>

        <!-- Hero Card Mockup -->
        <div class="lg:col-span-5">
          <div class="rounded-3xl border p-6 sm:p-8 relative backdrop-blur-xl ${currentTheme.cardBg}">
            <div class="flex items-center justify-between pb-6 border-b border-slate-800">
              <div>
                <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Inquiries</div>
                <div class="text-xl font-bold mt-0.5">Schedule Today</div>
              </div>
              <div class="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                ${rating}★
              </div>
            </div>

            <form onsubmit="event.preventDefault(); window.open('https://wa.me/${formattedWa}?text=' + encodeURIComponent('Hi, my name is ' + document.getElementById('qname').value + '. I want to book: ' + document.getElementById('qserv').value), '_blank');" class="space-y-4 pt-6">
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Your Full Name</label>
                <input id="qname" required type="text" placeholder="e.g. Rahul Sharma" class="w-full h-11 px-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm focus:outline-none focus:border-emerald-500 transition" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">Service Needed</label>
                <select id="qserv" class="w-full h-11 px-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm focus:outline-none focus:border-emerald-500 transition">
                  ${services.map(s => `<option value="${s.title}">${s.title}</option>`).join("")}
                </select>
              </div>
              <button type="submit" class="w-full py-3 rounded-xl text-sm font-bold ${currentTheme.primaryBtn} transition mt-2">
                Reserve via WhatsApp Now →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Numbers Trust Strip -->
  <section class="border-y ${currentTheme.trustBg} py-10">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
      <div>
        <div class="text-3xl sm:text-4xl font-extrabold tracking-tight ${currentTheme.highlightText}">${rating}★</div>
        <div class="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Google Rating</div>
      </div>
      <div>
        <div class="text-3xl sm:text-4xl font-extrabold tracking-tight ${currentTheme.highlightText}">${reviews}+</div>
        <div class="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Verified Reviews</div>
      </div>
      <div>
        <div class="text-3xl sm:text-4xl font-extrabold tracking-tight ${currentTheme.highlightText}">${years}+</div>
        <div class="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Years in ${city}</div>
      </div>
      <div>
        <div class="text-3xl sm:text-4xl font-extrabold tracking-tight ${currentTheme.highlightText}">100%</div>
        <div class="text-xs text-slate-400 uppercase tracking-wider mt-1 font-semibold">Client Satisfaction</div>
      </div>
    </div>
  </section>

  <!-- Services Grid -->
  <section id="services" class="py-20 max-w-6xl mx-auto px-4 sm:px-6">
    <div class="text-center max-w-2xl mx-auto mb-14">
      <div class="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Our Expertise</div>
      <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">Services Designed for Excellence</h2>
      <p class="text-sm text-slate-400 mt-3">From routine visits to specialized care, we employ the highest standards in ${city}.</p>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${services.map((s, idx) => `
        <div class="rounded-2xl border p-6 hover:-translate-y-1 transition duration-200 ${currentTheme.cardBg}">
          <div class="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
            0${idx + 1}
          </div>
          <h3 class="font-bold text-lg text-slate-100 mb-2">${s.title}</h3>
          <p class="text-xs text-slate-400 leading-relaxed mb-4">${s.desc}</p>
          <a href="https://wa.me/${formattedWa}?text=Hello,%20I%20am%20interested%20in%20${encodeURIComponent(s.title)}%20service." target="_blank" class="text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1">
            Book Service →
          </a>
        </div>
      `).join("")}
    </div>
  </section>

  <!-- Reviews Showcase -->
  <section id="reviews" class="py-16 bg-slate-900/60 border-y border-slate-800">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="text-center max-w-xl mx-auto mb-12">
        <div class="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Client Testimonials</div>
        <h2 class="text-3xl font-extrabold">Loved by Patients & Clients</h2>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <div class="text-amber-400 text-sm">★★★★★</div>
          <p class="text-xs text-slate-300 leading-relaxed">"Dr. and the staff at ${name} were incredibly welcoming and polite. The entire procedure was completely pain-free. Highly recommended in ${city}!"</p>
          <div class="text-xs font-bold text-slate-100 pt-2 border-t border-slate-800">Pooja Sharma · Google Review</div>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <div class="text-amber-400 text-sm">★★★★★</div>
          <p class="text-xs text-slate-300 leading-relaxed">"Very clean clinic, modern equipment, and no waiting time when you book in advance on WhatsApp. One of the best in ${city}."</p>
          <div class="text-xs font-bold text-slate-100 pt-2 border-t border-slate-800">Vikram Malhotra · Google Review</div>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-3">
          <div class="text-amber-400 text-sm">★★★★★</div>
          <p class="text-xs text-slate-300 leading-relaxed">"Transparent consultation and reasonable pricing. They explained all steps clearly. Truly a 5-star experience."</p>
          <div class="text-xs font-bold text-slate-100 pt-2 border-t border-slate-800">Ananya Sen · Google Review</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Location & Contact -->
  <section id="contact" class="py-20 max-w-6xl mx-auto px-4 sm:px-6">
    <div class="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 sm:p-12">
      <div class="grid md:grid-cols-2 gap-8 items-center">
        <div class="space-y-4">
          <div class="text-xs font-bold uppercase tracking-widest text-emerald-400">Visit Our Center</div>
          <h2 class="text-3xl font-extrabold">${name}</h2>
          <p class="text-sm text-slate-400 leading-relaxed">
            📍 ${address}
          </p>
          <div class="space-y-2 text-xs text-slate-300 pt-2">
            <div><strong>Hours:</strong> Mon – Sat: 9:30 AM – 8:30 PM | Sunday: By Appointment</div>
            <div><strong>Contact:</strong> ${phone}</div>
          </div>
          <div class="pt-4 flex gap-3">
            <a href="https://maps.google.com/?q=${encodeURIComponent(name + ' ' + address)}" target="_blank" class="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-800 text-slate-200 transition">
              View on Google Maps ↗
            </a>
            <a href="tel:${cleanPhone}" class="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition">
              Call Now
            </a>
          </div>
        </div>

        <div class="rounded-2xl bg-slate-950 border border-slate-800 p-6 text-center space-y-4">
          <div class="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-xl">📱</div>
          <h3 class="font-bold text-lg text-slate-100">Direct WhatsApp Assistance</h3>
          <p class="text-xs text-slate-400 max-w-xs mx-auto">Have a quick question about treatments, timings, or prices? Chat with us directly.</p>
          <a href="https://wa.me/${formattedWa}?text=Hi,%20I%20have%20a%20query%20regarding%20${encodeURIComponent(name)}" target="_blank" class="inline-block px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition">
            Start WhatsApp Chat →
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Floating WhatsApp CTA Button -->
  <a href="https://wa.me/${formattedWa}?text=Hello%20${encodeURIComponent(name)},%20I%20would%20like%20to%20book%20an%20appointment." target="_blank" class="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center text-2xl shadow-2xl hover:scale-105 transition duration-200 border-2 border-white/20" title="Chat on WhatsApp">
    💬
  </a>

  <!-- Footer -->
  <footer class="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
    <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>© ${new Date().getFullYear()} ${name}. All rights reserved. ${address}</div>
      <div class="text-[11px] text-slate-600">Designed & Redesigned with Lead → Launch OS</div>
    </div>
  </footer>

</body>
</html>`;
}
