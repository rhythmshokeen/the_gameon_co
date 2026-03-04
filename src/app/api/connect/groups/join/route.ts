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

    const { groupId } = await req.json();
    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    // Check if already member
    const existing = await (prisma.groupMember as any).findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already a member" }, { status: 409 });
    }

    const member = await (prisma.groupMember as any).create({
      data: {
        groupId,
        userId: session.user.id,
        role: "MEMBER",
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("POST /api/connect/groups/join error:", error);
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
  }
}
