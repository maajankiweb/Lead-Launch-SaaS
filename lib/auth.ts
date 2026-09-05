import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "./db";
import { logger } from "./logger";
import { normalizePlanKey, normalizePlanType } from "./plans";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "lead-to-launch-jwt-secret-secure-key-2026";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET_STRING);
export const AUTH_COOKIE_NAME = "l2l_session";

export interface UserSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  plan: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signJWT(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET_KEY);
}

export async function verifyJWT(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
      plan: payload.plan as string,
    };
  } catch {
    return null;
  }
}

/**
 * Sets the signed JWT session cookie onto a NextResponse.
 */
export async function attachAuthCookie(
  response: NextResponse,
  payload: UserSessionPayload
): Promise<string> {
  const token = await signJWT(payload);
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  return token;
}

export async function getCurrentUser(request?: NextRequest) {
  try {
    let token: string | undefined;

    if (request) {
      token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (!token) {
        const authHeader = request.headers.get("authorization");
        if (authHeader?.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    }

    if (!token) return null;

    const payload = await verifyJWT(token);
    if (!payload?.userId) return null;

    if (payload.userId === "admin-root-master" || payload.role === "ADMIN") {
      return {
        id: payload.userId || "admin-root-master",
        email: payload.email || "admin@maajankiweb.com",
        name: payload.name || "Super Admin (MaaJanki)",
        role: "ADMIN",
        plan: payload.plan || "AGENCY_SCALE",
        agencyName: "MaaJanki Web Tech HQ",
        agencyLogo: null,
        createdAt: new Date().toISOString(),
        _count: {
          campaigns: 0,
          deals: 0,
        },
      };
    }

    if (payload.userId.startsWith("demo-")) {
      const isAgency = payload.role === "AGENCY";
      return {
        id: payload.userId,
        email: payload.email || (isAgency ? "demo.agency@lead-to-launch.io" : "demo.freelancer@lead-to-launch.io"),
        name: payload.name || (isAgency ? "Apex Growth Agency" : "Alex Rivera (Freelancer)"),
        role: isAgency ? "AGENCY" : "FREELANCER",
        plan: payload.plan || (isAgency ? "AGENCY_SCALE" : "PRO"),
        agencyName: isAgency ? "Apex Digital & Web Studio" : null,
        agencyLogo: null,
        createdAt: new Date().toISOString(),
        _count: {
          campaigns: 1,
          deals: 3,
        },
      };
    }

    // Always fetch fresh live record from MongoDB Atlas to prevent stale JWT session claims
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        planUpdatedAt: true,
        agencyName: true,
        agencyLogo: true,
        createdAt: true,
        _count: {
          select: {
            campaigns: true,
            deals: true,
          },
        },
      },
    });

    if (!user) return null;

    // Detect and log session vs live DB tier mismatch
    if (payload.plan && user.plan !== payload.plan) {
      logger.tierMismatch({
        userId: user.id,
        planReadFromDB: user.plan,
        planReadFromSession: payload.plan,
      });
    }

    return user;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}
