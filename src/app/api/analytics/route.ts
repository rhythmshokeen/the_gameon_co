import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ApplicationStatus, ConnectionStatus } from "@/generated/prisma";

// GET /api/analytics - Get analytics data for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const role = session.user.role;

    let totalCompetitions = 0;
    let totalApplications = 0;
    let pendingApplications = 0;
    let approvedApplications = 0; // actually ACCEPTED in schema
    let rejectedApplications = 0;

    if (role === "ORGANIZER") {
      // Organizer: count their competitions and all applications to them
      totalCompetitions = await prisma.competition.count({
        where: { organizerId: userId },
      });

      const competitionIds = await prisma.competition.findMany({
        where: { organizerId: userId },
        select: { id: true },
      });

      const ids = competitionIds.map((c: { id: string }) => c.id);

      if (ids.length > 0) {
        totalApplications = await prisma.application.count({
          where: { competitionId: { in: ids } },
        });
        pendingApplications = await prisma.application.count({
          where: { competitionId: { in: ids }, status: ApplicationStatus.PENDING },
        });
        approvedApplications = await prisma.application.count({
          where: { competitionId: { in: ids }, status: ApplicationStatus.ACCEPTED },
        });
        rejectedApplications = await prisma.application.count({
          where: { competitionId: { in: ids }, status: ApplicationStatus.REJECTED },
        });
      }
    } else {
      // Athlete/Coach: count their own applications
      totalApplications = await prisma.application.count({
        where: { athleteId: userId },
      });
      pendingApplications = await prisma.application.count({
        where: { athleteId: userId, status: ApplicationStatus.PENDING },
      });
      approvedApplications = await prisma.application.count({
        where: { athleteId: userId, status: ApplicationStatus.ACCEPTED },
      });
      rejectedApplications = await prisma.application.count({
        where: { athleteId: userId, status: ApplicationStatus.REJECTED },
      });
    }

    const totalConnections = await prisma.connection.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: ConnectionStatus.ACCEPTED,
      },
    });

    const recentActivity = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      totalCompetitions,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalConnections,
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
