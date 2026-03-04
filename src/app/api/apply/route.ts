import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { isActive: true };
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
        { sport: { contains: search, mode: "insensitive" } },
      ];
    }

    const opportunities = await (prisma.opportunity as any).findMany({
      where,
      include: {
        creator: { select: { name: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { deadline: "asc" },
    });

    if (session?.user?.id) {
      const apps = await (prisma.opportunityApplication as any).findMany({
        where: { userId: session.user.id },
        select: { opportunityId: true, status: true },
      });
      const appMap = new Map(apps.map((a: any) => [a.opportunityId, a.status]));
      return NextResponse.json(
        opportunities.map((o: any) => ({
          ...o,
          hasApplied: appMap.has(o.id),
          applicationStatus: appMap.get(o.id) || null,
        }))
      );
    }

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("GET /api/apply error:", error);
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { opportunityId, coverLetter } = await req.json();
    if (!opportunityId) {
      return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 });
    }

    const existing = await (prisma.opportunityApplication as any).findUnique({
      where: {
        opportunityId_userId: {
          opportunityId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already applied" }, { status: 409 });
    }

    const application = await (prisma.opportunityApplication as any).create({
      data: {
        opportunityId,
        userId: session.user.id,
        status: "SUBMITTED",
        coverLetter: coverLetter || null,
        submittedAt: new Date(),
      },
    });

    await (prisma.activityLog as any).create({
      data: {
        userId: session.user.id,
        action: "OPPORTUNITY_APPLICATION",
        details: `Applied to opportunity ${opportunityId}`,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("POST /api/apply error:", error);
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
}
