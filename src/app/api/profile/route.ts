import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { athleteProfileSchema } from "@/lib/validations";

// GET /api/profile - Get current user's athlete profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { name: true, email: true, image: true } },
        performanceStats: { orderBy: { recordedAt: "desc" } },
        achievements: { orderBy: { createdAt: "desc" } },
        mediaHighlights: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update athlete profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ATHLETE") {
      return NextResponse.json(
        { error: "Only athletes have profiles" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = athleteProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const profile = await prisma.athleteProfile.upsert({
      where: { userId: session.user.id },
      update: result.data,
      create: {
        userId: session.user.id,
        ...result.data,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
