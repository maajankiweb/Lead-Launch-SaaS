import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      tasks: [
        {
          id: "task-1",
          title: "Send WhatsApp audit teaser link to Dr. Ananya Sharma",
          dueDate: new Date().toISOString().split("T")[0],
          priority: "urgent",
          status: "pending",
          nextActionTag: "WhatsApp Outreach",
        },
        {
          id: "task-2",
          title: "15-Minute discovery call with Vikram Malhotra",
          dueDate: new Date().toISOString().split("T")[0],
          priority: "high",
          status: "pending",
          nextActionTag: "Scheduled Meeting",
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, dueDate, priority = "medium", nextActionTag = "Follow-up" } = body;

    if (!title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const task = {
      id: "task-" + Date.now(),
      title: title.trim(),
      dueDate: dueDate || new Date().toISOString().split("T")[0],
      priority,
      status: "pending",
      nextActionTag,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create task" }, { status: 500 });
  }
}
