import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/search?q=xxx&type=all
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "all";

    if (!query || query.length < 1) {
      return NextResponse.json({ athletes: [], competitions: [], users: [] });
    }

    const results: Record<string, unknown> = {};

    if (type === "all" || type === "athletes") {
      results.athletes = await prisma.athleteProfile.findMany({
        where: {
          OR: [
            { user: { name: { contains: query, mode: "insensitive" } } },
            { sport: { contains: query, mode: "insensitive" } },
            { position: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        take: 20,
      });
    }

    if (type === "all" || type === "competitions") {
      results.competitions = await prisma.competition.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { sport: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          organizer: { select: { name: true } },
        },
        take: 20,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
