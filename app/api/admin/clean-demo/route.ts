import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { User, Campaign, Lead, Deal, connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    await connectDB();

    // 1. Delete all demo users (e.g. demo-freelancer, demo-agency, etc.)
    const demoDeleteRes = await User.deleteMany({
      $or: [
        { email: { $regex: /demo.*@/i } },
        { name: { $regex: /demo/i } },
        { id: { $regex: /demo/i } },
      ],
      email: { $ne: "admin@maajankiweb.com" },
    });

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${demoDeleteRes.deletedCount} dummy/demo records. Only authentic registered users and Super Admin remain in MongoDB Atlas.`,
      deletedUsersCount: demoDeleteRes.deletedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to clean demo data" }, { status: 500 });
  }
}
