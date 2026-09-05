import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, attachAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = "FREELANCER", agencyName } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    // Fresh signups start on Starter Free tier
    const plan = "FREE";

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: role.toUpperCase() === "AGENCY" ? "AGENCY" : "FREELANCER",
        plan,
        agencyName: agencyName ? agencyName.trim() : null,
      },
    });

    // Create a starter default campaign
    await db.campaign.create({
      data: {
        userId: user.id,
        title: "Default Lead Pipeline",
        niche: "Dentists & Medical Clinics",
        location: "Mumbai",
      },
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

    // Set HTTP-only secure cookie
    await attachAuthCookie(response, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
