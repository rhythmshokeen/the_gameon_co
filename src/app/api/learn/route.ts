import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const paths = await (prisma.learningPath as any).findMany({
      include: {
        modules: {
          orderBy: { sortOrder: "asc" },
          include: session?.user?.id
            ? {
                progress: {
                  where: { userId: session.user.id },
                  take: 1,
                },
              }
            : undefined,
        },
      },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });

    // Flatten progress for easier frontend consumption
    const result = paths.map((path: any) => ({
      ...path,
      modules: path.modules.map((mod: any) => ({
        ...mod,
        progress: mod.progress?.[0] || null,
      })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/learn error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning paths" },
      { status: 500 }
    );
  }
}
