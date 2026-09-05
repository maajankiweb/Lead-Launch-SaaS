import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { User, Campaign, Deal, connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    await connectDB();

    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select("-passwordHash")
      .lean();

    // Attach campaign and deal counts for each user
    const enhanced = await Promise.all(
      users.map(async (u: any) => {
        const userId = u.id || u._id.toString();
        const [campaignsCount, dealsCount] = await Promise.all([
          Campaign.countDocuments({ userId }),
          Deal.countDocuments({ userId }),
        ]);
        return {
          ...u,
          id: userId,
          campaignsCount,
          dealsCount,
        };
      })
    );

    return NextResponse.json({ users: enhanced });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load users" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    await connectDB();
    const { userId, plan, role, name, agencyName, newPassword } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updateData: any = {};
    if (plan) updateData.plan = plan;
    if (role) updateData.role = role;
    if (name) updateData.name = name;
    if (agencyName !== undefined) updateData.agencyName = agencyName;
    if (newPassword) {
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updated = await User.findOneAndUpdate({ id: userId }, { $set: updateData }, { new: true })
      .select("-passwordHash")
      .lean();

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (userId === user.id) {
      return NextResponse.json({ error: "Cannot delete your own active admin account." }, { status: 400 });
    }

    await Promise.all([
      User.deleteOne({ id: userId }),
      Campaign.deleteMany({ userId }),
      Deal.deleteMany({ userId }),
    ]);

    return NextResponse.json({ success: true, message: "User account and all associated data deleted." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
