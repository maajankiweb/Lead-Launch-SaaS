import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db, User, Campaign, Lead, Deal, Payment, connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    await connectDB();

    const [totalUsers, totalCampaigns, totalLeads, totalDeals, totalPayments, totalRevenue] =
      await Promise.all([
        User.countDocuments({}),
        Campaign.countDocuments({}),
        Lead.countDocuments({}),
        Deal.countDocuments({}),
        Payment.countDocuments({}),
        db.payment.totalRevenue(),
      ]);

    const planStats = await User.aggregate([
      { $group: { _id: "$plan", count: { $sum: 1 } } },
    ]);

    const roleStats = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .select("-passwordHash")
      .lean();

    const recentPayments = await Payment.find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCampaigns,
        totalLeads,
        totalDeals,
        totalPayments,
        totalRevenue,
      },
      planStats: planStats.reduce((acc: any, cur: any) => {
        acc[cur._id || "FREE"] = cur.count;
        return acc;
      }, {}),
      roleStats: roleStats.reduce((acc: any, cur: any) => {
        acc[cur._id || "FREELANCER"] = cur.count;
        return acc;
      }, {}),
      recentUsers: recentUsers.map((u: any) => ({ ...u, id: u.id || u._id.toString() })),
      recentPayments: recentPayments.map((p: any) => ({ ...p, id: p.id || p._id.toString() })),
    });
  } catch (error: any) {
    console.error("Admin overview error:", error);
    return NextResponse.json({ error: error.message || "Failed to load admin overview" }, { status: 500 });
  }
}
