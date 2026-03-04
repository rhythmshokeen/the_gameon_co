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

    const logs = await (prisma.recoveryLog as any).findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 30,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET /api/recover/logs error:", error);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const log = await (prisma.recoveryLog as any).create({
      data: {
        userId: session.user.id,
        sleepHours: body.sleepHours ?? null,
        sleepQuality: body.sleepQuality ?? null,
        stressLevel: body.stressLevel ?? null,
        muscleSoreness: body.muscleSoreness ?? null,
        energyLevel: body.energyLevel ?? null,
        trainingLoad: body.trainingLoad ?? null,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("POST /api/recover/logs error:", error);
    return NextResponse.json({ error: "Failed to save log" }, { status: 500 });
  }
}
