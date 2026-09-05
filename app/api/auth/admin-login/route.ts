import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, signJWT, AUTH_COOKIE_NAME, AUTH_MAX_AGE_SECONDS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "").trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // 1. Ultra-fast Master Admin bypass (<10ms instant response)
    const masterEmail = (process.env.ADMIN_EMAIL || "admin@maajankiweb.com").toLowerCase().trim();
    const masterPass = process.env.ADMIN_PASSWORD || "Admin@2026!";

    if (email === masterEmail && password === masterPass) {
      const adminPayload = {
        userId: "admin-root-master",
        email: masterEmail,
        name: process.env.ADMIN_NAME || "Super Admin (MaaJanki)",
        role: "ADMIN",
        plan: "AGENCY_SCALE",
      };

      const token = await signJWT(adminPayload);

      const res = NextResponse.json({
        success: true,
        user: adminPayload,
      });

      res.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: AUTH_MAX_AGE_SECONDS, // 24 hours
        path: "/",
      });

      return res;
    }

    // 2. Standard DB Admin check
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Invalid admin email or password" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid admin email or password" }, { status: 401 });
    }

    if (user.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json(
        { error: "Access Denied: Your account does not have Super Admin permissions." },
        { status: 403 }
      );
    }

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        plan: user.plan,
      },
    });

    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_MAX_AGE_SECONDS, // 24 hours
      path: "/",
    });

    return res;
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: error.message || "Admin authentication failed" }, { status: 500 });
  }
}
