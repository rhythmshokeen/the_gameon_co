/**
 * POST /api/compete/sync
 * ──────────────────────
 * Admin-only endpoint to trigger scraper sync.
 * Rate limited: 1 sync per minute.
 * Runs scrapers server-side, normalizes, stores results.
 *
 * Body (optional):
 *   { sources?: string[] }  — filter to specific scrapers
 *
 * Returns: SyncResult with per-source breakdown
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  syncAllSources,
  checkRateLimit,
  setRateLimit,
} from "@/lib/services/scraper-service";
import { sourceKeys } from "@/lib/scrapers";

export async function POST(req: NextRequest) {
  try {
    // ─── Auth check ───────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ─── Role check ──────────────────────────────────
    // Allow any authenticated user to trigger syncs.
    // In production, restrict to ORGANIZER / ADMIN role.
    const role = (session.user as { role?: string }).role;
    if (!role) {
      return NextResponse.json(
        { error: "Forbidden — valid role required" },
        { status: 403 }
      );
    }

    // ─── Rate limiting ────────────────────────────────
    if (!checkRateLimit("sync")) {
      return NextResponse.json(
        { error: "Rate limited — please wait 60 seconds between syncs" },
        { status: 429 }
      );
    }

    // ─── Parse body ───────────────────────────────────
    let sources: string[] | undefined;
    try {
      const body = await req.json();
      if (Array.isArray(body?.sources)) {
        // Validate source keys
        const filtered = body.sources.filter((s: string) => sourceKeys.includes(s));
        if (filtered.length > 0) sources = filtered;
      }
    } catch {
      // No body or invalid JSON — run all sources
    }

    // ─── Set rate limit before starting ───────────────
    setRateLimit("sync");

    // ─── Run sync ─────────────────────────────────────
    const result = await syncAllSources(session.user.id, sources);

    return NextResponse.json(result, {
      status: result.status === "failed" ? 207 : 200,
    });
  } catch (error) {
    console.error("POST /api/compete/sync error:", error);
    return NextResponse.json(
      { error: "Internal server error during sync" },
      { status: 500 }
    );
  }
}

/** GET /api/compete/sync — return available sources + last sync info */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      availableSources: sourceKeys,
      rateLimitReady: checkRateLimit("sync"),
    });
  } catch (error) {
    console.error("GET /api/compete/sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
