import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user deals that have reached outreach, proposal, meeting, or closed stages
    const deals = await db.deal.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    const activeStages = ["pitch_sent", "contacted", "proposal_sent", "meeting_scheduled", "won", "closed_won"];
    const outreachDeals = (deals || []).filter((d: any) => activeStages.includes(d.stage));

    const clients = outreachDeals.map((deal: any) => {
      const isWon = deal.stage === "won" || deal.stage === "closed_won";
      return {
        id: `client-${deal.id}`,
        name: deal.clientName,
        company: deal.company,
        email: `${deal.clientName.toLowerCase().replace(/[^a-z0-9]/g, "") || "client"}@gmail.com`,
        phone: deal.leadId || "",
        status: isWon ? "active" : "onboarding",
        projectTitle: deal.service || "Website Redesign & Conversion OS",
        progressPercent: isWon ? 80 : 25,
        milestones: [
          { id: "m1", title: "Outreach & Pitch Sent", completed: true, dueDate: "Done" },
          { id: "m2", title: "Discovery Call & Demo Review", completed: isWon || deal.stage === "meeting_scheduled", dueDate: isWon ? "Done" : "In Progress" },
          { id: "m3", title: "Contract Scope & Deposit Sign-off", completed: isWon, dueDate: isWon ? "Done" : "Upcoming" },
          { id: "m4", title: "Turnkey Next.js Site Delivery", completed: isWon, dueDate: "Upcoming" },
          { id: "m5", title: "Domain Cutover & Live Launch", completed: false, dueDate: "Upcoming" },
        ],
        totalContractValue: deal.value || 35000,
        portalAccessKey: `portal_${deal.id.slice(-6)}`,
        createdAt: deal.createdAt || new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      clients,
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
