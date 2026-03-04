import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await (prisma.trainingSession as any).findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 50,
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("GET /api/track error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.durationMins) {
      return NextResponse.json({ error: "Duration is required" }, { status: 400 });
    }

    const trainingSession = await (prisma.trainingSession as any).create({
      data: {
        userId: session.user.id,
        type: body.type || "Training",
        sport: body.sport ?? null,
        durationMins: body.durationMins,
        intensityRpe: body.intensityRpe ?? null,
        caloriesBurned: body.caloriesBurned ?? null,
        speedAvg: body.speedAvg ?? null,
        speedMax: body.speedMax ?? null,
        distanceKm: body.distanceKm ?? null,
        heartRateAvg: body.heartRateAvg ?? null,
        heartRateMax: body.heartRateMax ?? null,
        skillAccuracy: body.skillAccuracy ?? null,
        notes: body.notes ?? null,
      },
    });

    await (prisma.activityLog as any).create({
      data: {
        userId: session.user.id,
        action: "TRAINING_SESSION_LOGGED",
        details: `Logged ${body.type || "Training"} session — ${body.durationMins} min`,
      },
    });

    return NextResponse.json(trainingSession, { status: 201 });
  } catch (error) {
    console.error("POST /api/track error:", error);
    return NextResponse.json({ error: "Failed to log session" }, { status: 500 });
  }
}
