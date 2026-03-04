import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moduleId, progress } = await req.json();
    if (!moduleId || progress === undefined) {
      return NextResponse.json(
        { error: "moduleId and progress are required" },
        { status: 400 }
      );
    }

    const completed = progress >= 100;

    const record = await (prisma.userModuleProgress as any).upsert({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId,
        },
      },
      update: {
        progress: Math.min(progress, 100),
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        userId: session.user.id,
        moduleId,
        progress: Math.min(progress, 100),
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("POST /api/learn/progress error:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
