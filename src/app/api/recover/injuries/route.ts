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

    const injuries = await (prisma.injuryRecord as any).findMany({
      where: { userId: session.user.id },
      orderBy: { occurredAt: "desc" },
    });

    return NextResponse.json(injuries);
  } catch (error) {
    console.error("GET /api/recover/injuries error:", error);
    return NextResponse.json({ error: "Failed to fetch injuries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bodyPart, description, severity } = await req.json();
    if (!bodyPart) {
      return NextResponse.json({ error: "Body part is required" }, { status: 400 });
    }

    const injury = await (prisma.injuryRecord as any).create({
      data: {
        userId: session.user.id,
        bodyPart,
        description: description || null,
        severity: severity || "MINOR",
      },
    });

    return NextResponse.json(injury, { status: 201 });
  } catch (error) {
    console.error("POST /api/recover/injuries error:", error);
    return NextResponse.json({ error: "Failed to record injury" }, { status: 500 });
  }
}
