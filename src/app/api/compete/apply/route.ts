import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { competitionId, message } = await req.json();
    if (!competitionId) {
      return NextResponse.json(
        { error: "Competition ID is required" },
        { status: 400 }
      );
    }

    // Get athlete profile
    const profile = await (prisma.athleteProfile as any).findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Athlete profile required to apply" },
        { status: 400 }
      );
    }

    // Check for existing application
    const existing = await (prisma.application as any).findUnique({
      where: {
        competitionId_athleteId: {
          competitionId,
          athleteId: profile.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already applied to this competition" },
        { status: 409 }
      );
    }

    const application = await (prisma.application as any).create({
      data: {
        competitionId,
        athleteId: profile.id,
        message: message || null,
      },
    });

    // Log activity
    await (prisma.activityLog as any).create({
      data: {
        userId: session.user.id,
        action: "COMPETITION_APPLICATION",
        details: `Applied to competition ${competitionId}`,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("POST /api/compete/apply error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
