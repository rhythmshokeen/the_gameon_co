import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/athletes/[id] - Get athlete profile by user ID
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

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, createdAt: true } },
        performanceStats: { orderBy: { recordedAt: "desc" } },
        achievements: { orderBy: { createdAt: "desc" } },
        mediaHighlights: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    // Check connection status
    let connectionStatus = null;
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: id },
          { senderId: id, receiverId: session.user.id },
        ],
      },
    });

    if (connection) {
      connectionStatus = {
        id: connection.id,
        status: connection.status,
        isSender: connection.senderId === session.user.id,
      };
    }

    return NextResponse.json({ profile, connectionStatus });
  } catch (error) {
    console.error("Error fetching athlete:", error);
    return NextResponse.json(
      { error: "Failed to fetch athlete profile" },
      { status: 500 }
    );
  }
}
