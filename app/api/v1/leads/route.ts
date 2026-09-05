import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const apiKey = req.headers.get("x-api-key");

    if (!authHeader && !apiKey) {
      const user = await getCurrentUser(req);
      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized. Provide Bearer token or x-api-key header." },
          { status: 401 }
        );
      }
    }

    // Fetch real leads from database
    const leads = await db.lead.findMany({});

    const data = (leads || []).map((l: any) => ({
      id: l.id,
      name: l.name,
      category: l.category || "General",
      city: l.address?.split(",")?.[1]?.trim() || "India",
      rating: l.rating || 0,
      reviews: l.reviews || 0,
      opportunityScore: l.opportunityScore || 50,
      healthGrade: (l.opportunityScore && l.opportunityScore >= 75) ? "High Opportunity" : "Standard Opportunity",
    }));

    return NextResponse.json({
      success: true,
      version: "v1",
      data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "External API Error" }, { status: 500 });
  }
}
