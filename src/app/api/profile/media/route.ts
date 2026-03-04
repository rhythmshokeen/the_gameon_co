import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/profile/media
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
    const { mediaUrl, mediaType, title } = body;

    if (!mediaUrl || !mediaType) {
      return NextResponse.json(
        { error: "Media URL and type are required" },
        { status: 400 }
      );
    }

    const media = await prisma.mediaHighlight.create({
      data: {
        athleteId: profile.id,
        mediaUrl,
        mediaType,
        title,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Error adding media:", error);
    return NextResponse.json({ error: "Failed to add media" }, { status: 500 });
  }
}

// DELETE /api/profile/media?id=xxx
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

    const media = await prisma.mediaHighlight.findUnique({
      where: { id },
      include: { athlete: true },
    });

    if (!media || media.athlete.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.mediaHighlight.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
