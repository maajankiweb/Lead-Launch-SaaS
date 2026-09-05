import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { Payment, connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    await connectDB();

    const payments = await Payment.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const totalRev = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return NextResponse.json({
      payments: payments.map((p: any) => ({ ...p, id: p.id || p._id.toString() })),
      totalRevenue: totalRev[0]?.total || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load payment logs" }, { status: 500 });
  }
}
