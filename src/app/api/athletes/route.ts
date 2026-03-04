import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/athletes - List athletes with filters (for coaches)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sport = searchParams.get("sport");
    const position = searchParams.get("position");
    const minExperience = searchParams.get("minExperience");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = {};

    if (sport) where.sport = { contains: sport, mode: "insensitive" };
    if (position) where.position = { contains: position, mode: "insensitive" };
    if (minExperience) where.experienceYears = { gte: parseInt(minExperience) };
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { sport: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    const [athletes, total] = await Promise.all([
      prisma.athleteProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true, createdAt: true } },
          performanceStats: { take: 3, orderBy: { recordedAt: "desc" } },
          _count: { select: { achievements: true, mediaHighlights: true } },
        },
        orderBy: { user: { createdAt: "desc" } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.athleteProfile.count({ where }),
    ]);

    return NextResponse.json({
      athletes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching athletes:", error);
    return NextResponse.json(
      { error: "Failed to fetch athletes" },
      { status: 500 }
    );
  }
}
