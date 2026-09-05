import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json().catch(() => ({}));
    const { html, leadName, leadId, token: passedToken } = body;

    if (!html || typeof html !== "string") {
      return NextResponse.json({ error: "Missing HTML content for deployment." }, { status: 400 });
    }

    // Resolve Vercel Token:
    // 1. Passed in request body (optional override)
    // 2. User's saved token in DB
    // 3. Environment variable VERCEL_TOKEN
    let vercelToken = passedToken?.trim() || "";

    if (!vercelToken && user?.id) {
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { vercelToken: true },
      });
      if (dbUser?.vercelToken) {
        vercelToken = dbUser.vercelToken.trim();
      }
    }

    if (!vercelToken && process.env.VERCEL_TOKEN) {
      vercelToken = process.env.VERCEL_TOKEN.trim();
    }

    if (!vercelToken) {
      return NextResponse.json(
        {
          error: "NO_TOKEN",
          message:
            "Vercel Personal Access Token is required for 1-click deployment. Please add your token in Workspace Settings or set VERCEL_TOKEN in environment variables.",
        },
        { status: 400 }
      );
    }

    // Generate safe project name (lowercase letters, numbers, hyphens only, max 50 chars)
    const rawName = (leadName || "prospect-demo")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 45);

    const projectName = `demo-${rawName || "landing-page"}`;

    // Payload for Vercel Deployments API v13
    const vercelPayload = {
      name: projectName,
      files: [
        {
          file: "index.html",
          data: html,
        },
        {
          file: "vercel.json",
          data: JSON.stringify({
            cleanUrls: true,
            headers: [
              {
                source: "/(.*)",
                headers: [
                  { key: "X-Frame-Options", value: "ALLOWALL" },
                  { key: "Access-Control-Allow-Origin", value: "*" },
                ],
              },
            ],
          }),
        },
      ],
      projectSettings: {
        framework: null,
      },
      target: "production",
    };

    const vercelRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vercelPayload),
    });

    const deployData = await vercelRes.json().catch(() => ({}));

    if (!vercelRes.ok) {
      const errMsg =
        deployData?.error?.message ||
        deployData?.message ||
        `Vercel API error (${vercelRes.status} ${vercelRes.statusText})`;
      return NextResponse.json(
        {
          error: "DEPLOY_FAILED",
          message: errMsg,
          details: deployData,
        },
        { status: vercelRes.status || 500 }
      );
    }

    // Determine the public live URL
    const rawUrl = deployData.url || (deployData.alias && deployData.alias[0]) || "";
    const liveUrl = rawUrl
      ? rawUrl.startsWith("http")
        ? rawUrl
        : `https://${rawUrl}`
      : `https://${projectName}.vercel.app`;

    return NextResponse.json({
      success: true,
      liveUrl,
      deploymentId: deployData.id,
      name: deployData.name || projectName,
      readyState: deployData.readyState || "READY",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "SERVER_ERROR", message: error?.message || "Failed to process deployment" },
      { status: 500 }
    );
  }
}
