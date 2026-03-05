/**
 * GET /api/cron/sync
 * ──────────────────
 * Vercel Cron Job endpoint — runs all scrapers automatically.
 *
 * Security: Vercel sends `Authorization: Bearer <CRON_SECRET>` header
 * on every cron invocation. We verify it here so the endpoint can't
 * be called by random visitors.
 *
 * Schedule is configured in vercel.json (daily at 06:00 UTC).
 */

import { NextRequest, NextResponse } from "next/server";
import { syncAllSources } from "@/lib/services/scraper-service";

export const maxDuration = 300; // allow up to 5 min for scrapers
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // ─── Verify cron secret ───────────────────────────
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[Cron] CRON_SECRET env variable is not set");
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ─── Run all scrapers ─────────────────────────────
    console.log("[Cron] Starting scheduled scraper sync...");
    const result = await syncAllSources("cron");

    console.log(
      `[Cron] Sync complete: inserted=${result.totalInserted} skipped=${result.totalSkipped} failed=${result.totalFailed} duration=${result.durationMs}ms`
    );

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error("[Cron] Sync failed:", error);
    return NextResponse.json(
      { error: "Cron sync failed", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
