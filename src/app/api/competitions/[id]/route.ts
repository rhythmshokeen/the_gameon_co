import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/competitions/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const competition = await prisma.competition.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, name: true, image: true } },
        applications: {
          include: {
            athlete: {
              include: { user: { select: { id: true, name: true, image: true } } },
            },
          },
        },
        _count: { select: { applications: true } },
      },
    });

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    // Check if current user has applied (for athletes)
    let userApplication = null;
    if (session.user.role === "ATHLETE") {
      const profile = await prisma.athleteProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (profile) {
        userApplication = await prisma.application.findUnique({
          where: {
            competitionId_athleteId: {
              competitionId: id,
              athleteId: profile.id,
            },
          },
        });
      }
    }

    return NextResponse.json({ competition, userApplication });
  } catch (error) {
    console.error("Error fetching competition:", error);
    return NextResponse.json(
      { error: "Failed to fetch competition" },
      { status: 500 }
    );
  }
}

// PUT /api/competitions/[id] - Update competition (organizer only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const competition = await prisma.competition.findUnique({
      where: { id },
    });

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    if (competition.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to edit this competition" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updated = await prisma.competition.update({
      where: { id },
      data: {
        title: body.title,
        sport: body.sport,
        location: body.location,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        level: body.level,
        description: body.description,
        maxParticipants: body.maxParticipants,
        entryFee: body.entryFee,
        prizeInfo: body.prizeInfo,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating competition:", error);
    return NextResponse.json(
      { error: "Failed to update competition" },
      { status: 500 }
    );
  }
}

// DELETE /api/competitions/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const competition = await prisma.competition.findUnique({ where: { id } });
    if (!competition) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (competition.organizerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.competition.delete({ where: { id } });
    return NextResponse.json({ message: "Competition deleted" });
  } catch (error) {
    console.error("Error deleting competition:", error);
    return NextResponse.json(
      { error: "Failed to delete competition" },
      { status: 500 }
    );
  }
}
