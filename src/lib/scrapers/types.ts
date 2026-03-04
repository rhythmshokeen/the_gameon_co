/**
 * Scraper Type Definitions
 * ─────────────────────────
 * Shared interfaces for all scraper modules.
 * Every scraper must return data conforming to these contracts.
 */

// ─── Raw event shape returned by individual scrapers ───

export interface ScrapedEvent {
  title: string;
  sport?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  level?: string | null;
  competitionType?: string | null;
  description?: string | null;
  maxParticipants?: number | null;
  entryFee?: number | null;
  prizeInfo?: string | null;
  organizerName?: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  sourceId?: string | null;
  scoutAttendance?: boolean;
  [key: string]: unknown; // allow extra fields per scraper
}

// ─── Result envelope returned by each scraper's scrape() ───

export interface ScraperResult {
  success: boolean;
  method: string;
  count: number;
  events: ScrapedEvent[];
  scrapedAt: string;
  error?: string;
}

// ─── Normalized event ready for DB upsert ───

export interface NormalizedCompetition {
  title: string;
  sport: string;
  location: string;
  startDate: Date;
  endDate: Date;
  level: string;
  competitionType: "TOURNAMENT" | "TRIAL" | "FRIENDLY" | "TRYOUT" | "RANKED";
  description: string | null;
  maxParticipants: number | null;
  entryFee: number | null;
  prizeInfo: string | null;
  organizerName: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  sourceId: string | null;
  scoutAttendance: boolean;
  source: string;
}

// ─── Scraper module contract ───

export interface ScraperModule {
  /** Human-readable name of the source */
  name: string;
  /** Slug used in DB source field */
  sourceKey: string;
  /** Execute the scrape and return raw results */
  scrape: () => Promise<ScraperResult>;
}

// ─── Sync result per source ───

export interface SyncSourceResult {
  source: string;
  status: "success" | "partial" | "failed";
  eventsFound: number;
  eventsInserted: number;
  eventsSkipped: number;
  eventsFailed: number;
  durationMs: number;
  error?: string;
}

// ─── Full sync result ───

export interface SyncResult {
  status: "success" | "partial" | "failed";
  sources: SyncSourceResult[];
  totalInserted: number;
  totalSkipped: number;
  totalFailed: number;
  durationMs: number;
}

// ─── Validation error ───

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}
