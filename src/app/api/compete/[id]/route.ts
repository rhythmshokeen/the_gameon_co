/**
 * GET /api/compete/[id]
 * ─────────────────────
 * Fetch a single competition with full details.
 * Returns competition + organizer + application count + user's application status.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Competition ID is required" },
        { status: 400 }
      );
    }

    const competition = await (prisma.competition as any).findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, name: true, image: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      );
    }

    // Check if current user has applied
    const session = await getServerSession(authOptions);
    let hasApplied = false;
    let applicationStatus: string | null = null;

    if (session?.user?.id) {
      const profile = await (prisma.athleteProfile as any).findUnique({
        where: { userId: session.user.id },
      });

      if (profile) {
        const application = await (prisma.application as any).findUnique({
          where: {
            competitionId_athleteId: {
              competitionId: id,
              athleteId: profile.id,
            },
          },
          select: { status: true },
        });

        if (application) {
          hasApplied = true;
          applicationStatus = application.status;
        }
      }
    }

    return NextResponse.json({
      ...competition,
      hasApplied,
      applicationStatus,
    });
  } catch (error) {
    console.error("GET /api/compete/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch competition" },
      { status: 500 }
    );
  }
}
