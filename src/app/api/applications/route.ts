import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/applications - Apply to a competition
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ATHLETE") {
      return NextResponse.json(
        { error: "Only athletes can apply to competitions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { competitionId, message } = body;

    if (!competitionId) {
      return NextResponse.json(
        { error: "Competition ID is required" },
        { status: 400 }
      );
    }

    // Get athlete profile
    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Please complete your athlete profile first" },
        { status: 400 }
      );
    }

    // Check if competition exists
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    // Check for duplicate application
    const existing = await prisma.application.findUnique({
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

    // Check max participants
    if (competition.maxParticipants) {
      const currentApps = await prisma.application.count({
        where: {
          competitionId,
          status: { in: ["APPLIED", "ACCEPTED", "PENDING"] },
        },
      });

      if (currentApps >= competition.maxParticipants) {
        return NextResponse.json(
          { error: "This competition has reached its maximum participants" },
          { status: 400 }
        );
      }
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        competitionId,
        athleteId: profile.id,
        message,
        status: "APPLIED",
      },
      include: { competition: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "APPLICATION_SUBMITTED",
        details: `Applied to: ${competition.title}`,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}

// GET /api/applications - List applications
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const competitionId = searchParams.get("competitionId");

    let applications;

    if (session.user.role === "ATHLETE") {
      const profile = await prisma.athleteProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!profile) {
        return NextResponse.json({ applications: [] });
      }

      const where: Record<string, unknown> = { athleteId: profile.id };
      if (status) where.status = status;

      applications = await prisma.application.findMany({
        where,
        include: {
          competition: {
            include: {
              organizer: { select: { name: true } },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
      });
    } else if (session.user.role === "ORGANIZER") {
      const where: Record<string, unknown> = {
        competition: { organizerId: session.user.id },
      };
      if (status) where.status = status;
      if (competitionId) where.competitionId = competitionId;

      applications = await prisma.application.findMany({
        where,
        include: {
          athlete: {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
          },
          competition: true,
        },
        orderBy: { appliedAt: "desc" },
      });
    } else {
      return NextResponse.json({ applications: [] });
    }

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
