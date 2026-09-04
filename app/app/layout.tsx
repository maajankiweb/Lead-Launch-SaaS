import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/AuthContext";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lead-to-launch.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lead → Launch | AI Client Acquisition SaaS for Agencies & Freelancers",
    template: "%s | Lead → Launch",
  },
  description:
    "The #1 AI Client Acquisition OS for web designers, digital marketing agencies, SEO consultants, and IT service firms. Scrape verified Google Maps leads, run instant Core Web Vitals audits, quantify client revenue loss, build AI redesign mockups, and send high-converting WhatsApp & cold email pitches.",
  keywords: [
    "AI client acquisition",
    "Google Maps lead scraper",
    "website audit tool for agencies",
    "local business lead generator",
    "automated web design pitch generator",
    "how to get web design clients",
    "cold outreach WhatsApp scripts",
    "white label website audit tool",
    "freelancer client acquisition software",
    "digital marketing agency sales pipeline",
    "agency deals CRM",
    "Core Web Vitals website speed audit",
    "AI website redesign generator",
    "Next.js website redesign mockup",
    "client revenue leakage calculator",
    "Lovable Bolt Claude Code prompts",
    "B2B sales outbound automation",
    "local SEO lead generation",
  ],
  authors: [{ name: "Lead to Launch Engineering Team" }],
  creator: "Lead to Launch",
  publisher: "Lead to Launch Technologies",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Lead → Launch | AI Client Acquisition OS for Web Agencies & Freelancers",
    description:
      "Turn underperforming local websites into high-paying web design retainers. Scrape leads, run instant technical audits, generate working Next.js mockups, and close deals with proof-of-work pitches.",
    url: siteUrl,
    siteName: "Lead to Launch SaaS",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lead → Launch | AI Client Acquisition OS",
    description:
      "Automated Google Maps lead scraping, 3-second website audits, AI redesign prototypes, and high-converting proof-first pitches.",
    creator: "@lead2launch",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#software`,
        name: "Lead → Launch",
        url: siteUrl,
        headline: "AI Client Acquisition SaaS & Local Business Lead Audit OS",
        description:
          "Turn underperforming local business websites into high-ticket client retainers. Automate Google Maps lead scraping, Core Web Vitals audits, AI Next.js redesign mockups, and proof-first WhatsApp & cold email outreach.",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, Cloud, All Modern Browsers",
        softwareVersion: "2.5.0",
        offers: [
          {
            "@type": "Offer",
            name: "Starter Free Plan",
            price: "0",
            priceCurrency: "USD",
            description: "Free prospecting with 15 leads per scrape, basic website audits, and Deals CRM.",
          },
          {
            "@type": "Offer",
            name: "Freelancer Pro",
            price: "29",
            priceCurrency: "USD",
            description: "100 leads per scrape, full Core Web Vitals audits, AI redesign prompts, and 150 CRM deals.",
          },
          {
            "@type": "Offer",
            name: "Agency Scale",
            price: "99",
            priceCurrency: "USD",
            description: "White-label agency reports, 300 leads/run, 100 saved campaigns, and 2,000 active deals.",
          },
          {
            "@type": "Offer",
            name: "Enterprise IT Firm",
            price: "149",
            priceCurrency: "USD",
            description: "1,000 leads per scrape, 500 campaigns, 10,000 deals pipeline, API access, and multi-seat access.",
          },
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "342",
          bestRating: "5",
          worstRating: "1",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Lead to Launch Technologies",
        url: siteUrl,
        logo: `${siteUrl}/favicon.ico`,
        description: "Modern AI solutions for B2B client acquisition, website speed audits, and digital agency workflows.",
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Can any freelancer, web agency, digital marketer, or IT firm use Lead to Launch?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Lead to Launch is built specifically for solo web designers, freelance developers, digital marketing agencies, SEO consultancies, and IT service firms to find qualified local business prospects, uncover technical speed flaws, and generate proof-of-work redesign pitches.",
            },
          },
          {
            "@type": "Question",
            name: "How does the estimated client revenue loss calculation work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The platform cross-references the business's Google Maps review count, average local search traffic in their vertical, and Google Core Web Vitals speed penalties (where mobile load times above 3 seconds cause 53% visitor drop-off) to calculate defensible monthly revenue leakage.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need coding skills to build client demo websites?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No coding skills are required. The Phase 4 engine analyzes the client's current website and generates ready-to-run prompts for AI app builders like Lovable.dev, Bolt.new, v0.dev, and Claude Code CLI.",
            },
          },
          {
            "@type": "Question",
            name: "Can agencies manage multiple campaigns with private databases?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Built on MongoDB Atlas multi-tenant architecture, every registered agency has isolated workspaces, private saved campaigns, audit histories, and Deals CRM pipelines.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary"
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
