import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/profile/stats - Add a performance stat
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ATHLETE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { metricName, metricValue, unit } = body;

    if (!metricName || !metricValue) {
      return NextResponse.json(
        { error: "Metric name and value are required" },
        { status: 400 }
      );
    }

    const stat = await prisma.performanceStat.create({
      data: {
        athleteId: profile.id,
        metricName,
        metricValue,
        unit,
      },
    });

    return NextResponse.json(stat, { status: 201 });
  } catch (error) {
    console.error("Error adding stat:", error);
    return NextResponse.json({ error: "Failed to add stat" }, { status: 500 });
  }
}

// DELETE /api/profile/stats?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ATHLETE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Verify ownership
    const stat = await prisma.performanceStat.findUnique({
      where: { id },
      include: { athlete: true },
    });

    if (!stat || stat.athlete.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.performanceStat.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting stat:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
