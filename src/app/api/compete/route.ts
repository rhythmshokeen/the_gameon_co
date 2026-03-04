import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    const sport = searchParams.get("sport");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const source = searchParams.get("source");
    const level = searchParams.get("level");
    const location = searchParams.get("location");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};

    // Only show verified competitions
    where.verificationStatus = "VERIFIED";

    if (sport) where.sport = sport;
    if (type) where.competitionType = type;
    if (source) where.source = source;
    if (level) where.level = level;

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { sport: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      where.startDate = dateFilter;
    }

    const competitions = await (prisma.competition as any).findMany({
      where,
      include: {
        organizer: { select: { id: true, name: true, image: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { startDate: "asc" },
    });

    // Check if current user has already applied
    if (session?.user?.id) {
      const profile = await (prisma.athleteProfile as any).findUnique({
        where: { userId: session.user.id },
      });

      if (profile) {
        const applications = await (prisma.application as any).findMany({
          where: { athleteId: profile.id },
          select: { competitionId: true },
        });
        const appliedSet = new Set(
          applications.map((a: { competitionId: string }) => a.competitionId)
        );
        return NextResponse.json(
          competitions.map((c: Competition) => ({
            ...c,
            hasApplied: appliedSet.has(c.id),
          }))
        );
      }
    }

    return NextResponse.json(competitions);
  } catch (error) {
    console.error("GET /api/compete error:", error);
    return NextResponse.json(
      { error: "Failed to fetch competitions" },
      { status: 500 }
    );
  }
}

interface Competition {
  id: string;
  [key: string]: unknown;
}
