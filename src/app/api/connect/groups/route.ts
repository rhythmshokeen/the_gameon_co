import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const groups = await (prisma.group as any).findMany({
      include: {
        creator: { select: { name: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (session?.user?.id) {
      const memberships = await (prisma.groupMember as any).findMany({
        where: { userId: session.user.id },
        select: { groupId: true },
      });
      const memberSet = new Set(memberships.map((m: { groupId: string }) => m.groupId));
      return NextResponse.json(
        groups.map((g: { id: string; [key: string]: unknown }) => ({
          ...g,
          isMember: memberSet.has(g.id),
        }))
      );
    }

    return NextResponse.json(groups);
  } catch (error) {
    console.error("GET /api/connect/groups error:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, sport, isPrivate } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const group = await (prisma.group as any).create({
      data: {
        name,
        description: description || null,
        sport: sport || null,
        isPrivate: isPrivate ?? false,
        creatorId: session.user.id,
        members: {
          create: { userId: session.user.id, role: "ADMIN" },
        },
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("POST /api/connect/groups error:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}
