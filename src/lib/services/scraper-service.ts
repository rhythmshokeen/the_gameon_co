/**
 * Scraper Service Layer
 * ─────────────────────
 * Orchestrates all scrapers: execute, normalize, validate, deduplicate, store, log.
 *
 * This is the production integration point. It:
 *   1. Runs each registered scraper
 *   2. Normalizes raw events to the Competition schema
 *   3. Validates required fields (rejects corrupted data)
 *   4. Upserts into DB with unique constraint (title + startDate + source)
 *   5. Logs results to ScrapeLog table
 *   6. Never crashes — wraps everything in try/catch
 */

import { prisma } from "@/lib/prisma";
import { scrapers, getScraperByKey } from "@/lib/scrapers";
import type {
  ScrapedEvent,
  NormalizedCompetition,
  SyncResult,
  SyncSourceResult,
  ValidationError,
  ScraperModule,
} from "@/lib/scrapers/types";

// ─── Rate Limiting ─────────────────────────────────────

const RATE_LIMIT_MAP = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 30_000; // 30 second cooldown between syncs

export function checkRateLimit(key: string = "global"): boolean {
  const lastRun = RATE_LIMIT_MAP.get(key);
  if (lastRun && Date.now() - lastRun < RATE_LIMIT_WINDOW_MS) {
    return false; // rate limited
  }
  return true;
}

export function setRateLimit(key: string = "global"): void {
  RATE_LIMIT_MAP.set(key, Date.now());
}

// ─── Sport Normalization ───────────────────────────────

const CANONICAL_SPORTS: Record<string, string> = {
  cricket: "Cricket",
  football: "Football",
  soccer: "Football",
  basketball: "Basketball",
  tennis: "Tennis",
  badminton: "Badminton",
  swimming: "Swimming",
  running: "Athletics",
  athletics: "Athletics",
  marathon: "Athletics",
  boxing: "Boxing",
  mma: "MMA",
  wrestling: "Wrestling",
  kabaddi: "Kabaddi",
  hockey: "Hockey",
  volleyball: "Volleyball",
  cycling: "Cycling",
  fitness: "Fitness",
  yoga: "Yoga",
  triathlon: "Triathlon",
  chess: "Chess",
  golf: "Golf",
  archery: "Archery",
  squash: "Squash",
  "table tennis": "Table Tennis",
  "general sports": "General Sports",
};

function normalizeSportName(sport: string): string {
  if (!sport) return "General Sports";
  const key = sport.toLowerCase().trim();
  return CANONICAL_SPORTS[key] || sport.trim();
}

// ─── Date Normalization ────────────────────────────────

function normalizeDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  const cleaned = dateStr.trim();
  if (!cleaned) return null;

  // Try direct parse
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) return parsed;

  // Try common Indian date formats: DD/MM/YYYY, DD-MM-YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(d.getTime())) return d;
  }

  // Try "Month DD, YYYY" or "DD Month YYYY"
  const monthNames = [
    "jan", "feb", "mar", "apr", "may", "jun",
    "jul", "aug", "sep", "oct", "nov", "dec",
  ];
  const monthMatch = cleaned.toLowerCase().match(
    /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{4})/
  );
  if (monthMatch) {
    const [, day, mon, year] = monthMatch;
    const monthIdx = monthNames.indexOf(mon);
    if (monthIdx !== -1) {
      const d = new Date(parseInt(year), monthIdx, parseInt(day));
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

// ─── Location Cleanup ──────────────────────────────────

function normalizeLocation(location: string | null | undefined): string {
  if (!location) return "Delhi NCR";
  return location
    .trim()
    .replace(/\s+/g, " ") // collapse multiple spaces
    .replace(/,\s*,/g, ",") // remove double commas
    .replace(/^,|,$/g, "") // trim leading/trailing commas
    .trim() || "Delhi NCR";
}

// ─── Competition Type Normalization ────────────────────

const VALID_TYPES = ["TOURNAMENT", "TRIAL", "FRIENDLY", "TRYOUT", "RANKED"] as const;
type CompType = typeof VALID_TYPES[number];

function normalizeCompetitionType(type: string | null | undefined): CompType {
  if (!type) return "TOURNAMENT";
  const upper = type.toUpperCase().trim();
  if (VALID_TYPES.includes(upper as CompType)) return upper as CompType;
  return "TOURNAMENT";
}

// ─── Validation ────────────────────────────────────────

function validateEvent(
  event: ScrapedEvent,
  source: string
): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (!event.title?.trim()) {
    errors.push({ field: "title", message: "Title is required", value: event.title });
  }

  const startDate = normalizeDate(event.startDate);
  if (!startDate) {
    errors.push({
      field: "startDate",
      message: "Valid start date is required",
      value: event.startDate,
    });
  }

  // Log validation errors
  if (errors.length > 0) {
    console.warn(
      `[ScraperService] Validation failed for "${event.title}" from ${source}:`,
      errors.map((e) => `${e.field}: ${e.message}`).join(", ")
    );
  }

  return { valid: errors.length === 0, errors };
}

// ─── Normalize ScrapedEvent → NormalizedCompetition ────

function normalizeEvent(event: ScrapedEvent, source: string): NormalizedCompetition | null {
  const { valid } = validateEvent(event, source);
  if (!valid) return null;

  const startDate = normalizeDate(event.startDate)!;
  const endDate = normalizeDate(event.endDate) || startDate;

  return {
    title: event.title.trim().replace(/\s+/g, " "),
    sport: normalizeSportName(event.sport || ""),
    location: normalizeLocation(event.location),
    startDate,
    endDate: endDate < startDate ? startDate : endDate,
    level: event.level?.trim() || "Open",
    competitionType: normalizeCompetitionType(event.competitionType),
    description: event.description?.trim() || null,
    maxParticipants: event.maxParticipants || null,
    entryFee: event.entryFee || null,
    prizeInfo: typeof event.prizeInfo === "string" ? event.prizeInfo.trim() : null,
    organizerName: typeof event.organizerName === "string" ? event.organizerName.trim() : null,
    imageUrl: typeof event.imageUrl === "string" ? event.imageUrl.trim() : null,
    sourceUrl: typeof event.sourceUrl === "string" ? event.sourceUrl.trim() : null,
    sourceId: typeof event.sourceId === "string" ? event.sourceId.trim() : null,
    scoutAttendance: event.scoutAttendance || false,
    source,
  };
}

// ─── Upsert single competition ─────────────────────────

async function upsertCompetition(
  comp: NormalizedCompetition
): Promise<"inserted" | "skipped" | "failed"> {
  try {
    await (prisma.competition as any).upsert({
      where: {
        unique_competition_source: {
          title: comp.title,
          startDate: comp.startDate,
          source: comp.source,
        },
      },
      update: {
        sport: comp.sport,
        location: comp.location,
        endDate: comp.endDate,
        level: comp.level,
        competitionType: comp.competitionType,
        description: comp.description,
        maxParticipants: comp.maxParticipants,
        entryFee: comp.entryFee,
        prizeInfo: comp.prizeInfo,
        organizerName: comp.organizerName,
        imageUrl: comp.imageUrl,
        sourceUrl: comp.sourceUrl,
        sourceId: comp.sourceId,
        scoutAttendance: comp.scoutAttendance,
        verificationStatus: "VERIFIED",
        lastSyncedAt: new Date(),
      },
      create: {
        title: comp.title,
        sport: comp.sport,
        location: comp.location,
        startDate: comp.startDate,
        endDate: comp.endDate,
        level: comp.level,
        competitionType: comp.competitionType,
        description: comp.description,
        maxParticipants: comp.maxParticipants,
        entryFee: comp.entryFee,
        prizeInfo: comp.prizeInfo,
        organizerName: comp.organizerName,
        imageUrl: comp.imageUrl,
        sourceUrl: comp.sourceUrl,
        sourceId: comp.sourceId,
        scoutAttendance: comp.scoutAttendance,
        source: comp.source,
        verificationStatus: "VERIFIED",
        lastSyncedAt: new Date(),
      },
    });
    return "inserted";
  } catch (error) {
    console.error(
      `[ScraperService] Failed to upsert "${comp.title}" from ${comp.source}:`,
      error instanceof Error ? error.message : error
    );
    return "failed";
  }
}

// ─── Run single scraper source ─────────────────────────

async function runSingleSource(scraper: ScraperModule): Promise<SyncSourceResult> {
  const start = Date.now();
  const result: SyncSourceResult = {
    source: scraper.sourceKey,
    status: "success",
    eventsFound: 0,
    eventsInserted: 0,
    eventsSkipped: 0,
    eventsFailed: 0,
    durationMs: 0,
  };

  try {
    console.log(`[ScraperService] Running ${scraper.name} scraper...`);
    const scraperResult = await scraper.scrape();
    result.eventsFound = scraperResult.count;

    if (!scraperResult.success) {
      result.status = "failed";
      result.error = scraperResult.error || "Scraper returned success=false";
      result.durationMs = Date.now() - start;
      return result;
    }

    // Normalize and upsert each event
    for (const rawEvent of scraperResult.events) {
      const normalized = normalizeEvent(rawEvent, scraper.sourceKey);
      if (!normalized) {
        result.eventsSkipped++;
        continue;
      }

      const outcome = await upsertCompetition(normalized);
      if (outcome === "inserted") result.eventsInserted++;
      else if (outcome === "skipped") result.eventsSkipped++;
      else result.eventsFailed++;
    }

    // Determine final status
    if (result.eventsFailed > 0 && result.eventsInserted === 0) {
      result.status = "failed";
    } else if (result.eventsFailed > 0) {
      result.status = "partial";
    }

    console.log(
      `[ScraperService] ${scraper.name}: found=${result.eventsFound} inserted=${result.eventsInserted} skipped=${result.eventsSkipped} failed=${result.eventsFailed}`
    );
  } catch (error) {
    result.status = "failed";
    result.error = error instanceof Error ? error.message : String(error);
    console.error(`[ScraperService] ${scraper.name} crashed:`, result.error);
  }

  result.durationMs = Date.now() - start;
  return result;
}

// ─── Log results to ScrapeLog table ────────────────────

async function logSyncResult(
  result: SyncSourceResult,
  triggeredBy: string
): Promise<void> {
  try {
    await (prisma.scrapeLog as any).create({
      data: {
        source: result.source,
        status: result.status,
        eventsFound: result.eventsFound,
        eventsInserted: result.eventsInserted,
        eventsSkipped: result.eventsSkipped,
        eventsFailed: result.eventsFailed,
        durationMs: result.durationMs,
        error: result.error || null,
        triggeredBy,
      },
    });
  } catch (err) {
    console.error("[ScraperService] Failed to log scrape result:", err);
  }
}

// ═══════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════

/**
 * Run all registered scrapers and store results.
 * @param triggeredBy - userId or "cron"
 * @param sourceFilter - optional: run only specific sources
 */
export async function syncAllSources(
  triggeredBy: string,
  sourceFilter?: string[]
): Promise<SyncResult> {
  const start = Date.now();

  // Determine which scrapers to run
  const toRun = sourceFilter
    ? scrapers.filter((s) => sourceFilter.includes(s.sourceKey))
    : scrapers;

  if (toRun.length === 0) {
    return {
      status: "failed",
      sources: [],
      totalInserted: 0,
      totalSkipped: 0,
      totalFailed: 0,
      durationMs: 0,
    };
  }

  // Run scrapers sequentially to avoid overwhelming targets
  const sourceResults: SyncSourceResult[] = [];
  for (const scraper of toRun) {
    const result = await runSingleSource(scraper);
    sourceResults.push(result);
    // Log each source result to DB
    await logSyncResult(result, triggeredBy);
  }

  // Aggregate
  const totalInserted = sourceResults.reduce((s, r) => s + r.eventsInserted, 0);
  const totalSkipped = sourceResults.reduce((s, r) => s + r.eventsSkipped, 0);
  const totalFailed = sourceResults.reduce((s, r) => s + r.eventsFailed, 0);

  const allFailed = sourceResults.every((r) => r.status === "failed");
  const anyFailed = sourceResults.some((r) => r.status === "failed" || r.status === "partial");

  return {
    status: allFailed ? "failed" : anyFailed ? "partial" : "success",
    sources: sourceResults,
    totalInserted,
    totalSkipped,
    totalFailed,
    durationMs: Date.now() - start,
  };
}

/**
 * Run a specific scraper by source key.
 */
export async function syncSource(
  sourceKey: string,
  triggeredBy: string
): Promise<SyncSourceResult | null> {
  const scraper = getScraperByKey(sourceKey);
  if (!scraper) return null;

  const result = await runSingleSource(scraper);
  await logSyncResult(result, triggeredBy);
  return result;
}

/**
 * Get latest scrape logs.
 */
export async function getLatestLogs(limit: number = 20) {
  return (prisma.scrapeLog as any).findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
