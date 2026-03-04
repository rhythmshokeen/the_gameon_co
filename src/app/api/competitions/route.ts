import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { competitionSchema } from "@/lib/validations";

// GET /api/competitions - List competitions with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sport = searchParams.get("sport");
    const location = searchParams.get("location");
    const level = searchParams.get("level");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const organizerId = searchParams.get("organizerId");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (sport) where.sport = { contains: sport, mode: "insensitive" };
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (level) where.level = level;
    if (organizerId) where.organizerId = organizerId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { sport: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const [competitions, total] = await Promise.all([
      prisma.competition.findMany({
        where,
        include: {
          organizer: { select: { id: true, name: true, image: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { startDate: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.competition.count({ where }),
    ]);

    return NextResponse.json({
      competitions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching competitions:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitions" },
      { status: 500 }
    );
  }
}

// POST /api/competitions - Create a competition (organizers only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ORGANIZER") {
      return NextResponse.json(
        { error: "Only organizers can create competitions" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = competitionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = result.data;

    const competition = await prisma.competition.create({
      data: {
        title: data.title,
        sport: data.sport,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        level: data.level,
        description: data.description,
        maxParticipants: data.maxParticipants,
        entryFee: data.entryFee,
        prizeInfo: data.prizeInfo,
        organizerId: session.user.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "COMPETITION_CREATED",
        details: `Created competition: ${competition.title}`,
      },
    });

    return NextResponse.json(competition, { status: 201 });
  } catch (error) {
    console.error("Error creating competition:", error);
    return NextResponse.json(
      { error: "Failed to create competition" },
      { status: 500 }
    );
  }
}
