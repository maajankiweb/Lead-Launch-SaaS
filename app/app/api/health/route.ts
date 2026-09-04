import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const t0 = Date.now();
    await connectDB();
    const latency = Date.now() - t0;
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      latencyMs: latency,
      region: process.env.VERCEL_REGION || "local",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error?.message || "Database connection failed",
        hint: "Check MongoDB Atlas Network Access (0.0.0.0/0) and MONGODB_URI in Vercel Environment Variables.",
      },
      { status: 500 }
    );
  }
}
