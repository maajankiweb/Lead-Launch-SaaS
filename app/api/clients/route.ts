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
      clients: [
        {
          id: "client-01",
          name: "Dr. Rohan Kapoor",
          company: "Kapoor Skin & Cosmetology",
          email: "drrohan.kapoor@gmail.com",
          status: "active",
          projectTitle: "Turnkey Healthcare Portal & WhatsApp Booking Engine",
          progressPercent: 75,
          totalContractValue: 95000,
          portalAccessKey: "portal_kapoor_89a3f2",
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { deal, name, company, email, projectTitle, totalContractValue } = body;

    const client = {
      id: "client-" + Date.now(),
      name: name || deal?.clientName || "Client Contact",
      company: company || deal?.company || "Business",
      email: email || `${(company || "client").toLowerCase().replace(/[^a-z]/g, "")}@example.com`,
      status: "active",
      projectTitle: projectTitle || deal?.service || "Website Redesign & SEO Growth",
      progressPercent: 10,
      milestones: [
        { id: "m1", title: "Project Scope & Contract Sign-off", completed: true, dueDate: "Done" },
        { id: "m2", title: "Content & Assets Gathering", completed: false, dueDate: "In Progress" },
        { id: "m3", title: "Figma UI/UX Mockup Approval", completed: false, dueDate: "Week 1" },
        { id: "m4", title: "Development & Integrations", completed: false, dueDate: "Week 2" },
        { id: "m5", title: "Client Staging Review & Live Cutover", completed: false, dueDate: "Week 3" },
      ],
      totalContractValue: totalContractValue || deal?.value || 45000,
      portalAccessKey: `portal_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, client });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create client" }, { status: 500 });
  }
}
