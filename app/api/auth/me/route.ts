import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const res = NextResponse.json({
      authenticated: true,
      user,
    });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, error: error?.message || "Failed to fetch session" },
      { status: 500 }
    );
  }
}
