import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, signJWT, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { role = "FREELANCER" } = await req.json();

    const isAgency = role.toUpperCase() === "AGENCY";
    const email = isAgency ? "demo.agency@lead-to-launch.io" : "demo.freelancer@lead-to-launch.io";
    const name = isAgency ? "Apex Growth Agency" : "Alex Rivera (Freelancer)";
    const agencyName = isAgency ? "Apex Digital & Web Studio" : null;
    const plan = isAgency ? "AGENCY_SCALE" : "PRO";

    let user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      const defaultPasswordHash = await hashPassword("demo123456");
      user = await db.user.create({
        data: {
          email,
          name,
          passwordHash: defaultPasswordHash,
          role: isAgency ? "AGENCY" : "FREELANCER",
          plan,
          agencyName,
        },
      });

      // Create rich demo campaign & CRM deals
      const campaign = await db.campaign.create({
        data: {
          userId: user.id,
          title: isAgency ? "Austin High-Ticket Dental Clinics" : "Miami Boutique Gyms & Spas",
          niche: isAgency ? "Dental & Orthodontics" : "Fitness & Wellness",
          location: isAgency ? "Austin, TX" : "Miami, FL",
        },
      });

      // Add sample CRM Deals
      await db.deal.createMany({
        data: [
          {
            userId: user.id,
            clientName: "Dr. Robert Vance",
            company: "Vance Family Dental",
            service: "Modern Next.js Website & Local SEO Package",
            value: 2800,
            stage: "proposal",
            notes: "Sent high-converting audit report and video walkthrough. Meeting booked for Thursday.",
          },
          {
            userId: user.id,
            clientName: "Sarah Jenkins",
            company: "Elevate Pilates Studio",
            service: "Complete Website Redesign & Booking Engine",
            value: 3500,
            stage: "meeting",
            notes: "Expressed interest in mobile responsiveness and online booking speed.",
          },
          {
            userId: user.id,
            clientName: "Marcus Sterling",
            company: "Sterling Law Group",
            service: "Retainer - SEO & Content Optimization",
            value: 1800,
            stage: "won",
            notes: "Closed 3-month retainer contract! First invoice paid.",
          },
        ],
      });
    }

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
        agencyName: user.agencyName,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.warn("MongoDB unavailable for demo session, using instant fallback session:", error?.message);
    
    // Instant fallback demo user without blocking on DB
    const body = await req.json().catch(() => ({}));
    const isAgency = (body.role || "").toUpperCase() === "AGENCY";
    const demoId = isAgency ? "demo-agency-instant" : "demo-freelancer-instant";
    const demoEmail = isAgency ? "demo.agency@lead-to-launch.io" : "demo.freelancer@lead-to-launch.io";
    const demoName = isAgency ? "Apex Growth Agency" : "Alex Rivera (Freelancer)";
    const demoAgency = isAgency ? "Apex Digital & Web Studio" : null;
    const demoPlan = isAgency ? "AGENCY_SCALE" : "PRO";

    const token = await signJWT({
      userId: demoId,
      email: demoEmail,
      name: demoName,
      role: isAgency ? "AGENCY" : "FREELANCER",
      plan: demoPlan,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: demoId,
        email: demoEmail,
        name: demoName,
        role: isAgency ? "AGENCY" : "FREELANCER",
        plan: demoPlan,
        agencyName: demoAgency,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  }
}
