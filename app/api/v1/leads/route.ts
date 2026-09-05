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

    return NextResponse.json({
      success: true,
      version: "v1",
      data: [
        {
          id: "lead-01",
          name: "Smile Studio Dental Clinic",
          category: "Dentist",
          city: "Bandra, Mumbai",
          rating: 4.7,
          reviews: 142,
          opportunityScore: 88,
          healthGrade: "High Opportunity",
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "External API Error" }, { status: 500 });
  }
}
