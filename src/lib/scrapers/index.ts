/**
 * Scraper Registry
 * ─────────────────
 * Central registry of all scraper modules.
 * Add new scrapers here to integrate them automatically.
 */

import type { ScraperModule } from "./types";

import bookmyshowScraper from "./bookmyshow";
import townscriptScraper from "./townscript";
import tournaments360Scraper from "./tournaments360";

/** All registered scraper modules */
export const scrapers: ScraperModule[] = [
  bookmyshowScraper,
  townscriptScraper,
  tournaments360Scraper,
];

/** Look up a scraper by source key */
export function getScraperByKey(key: string): ScraperModule | undefined {
  return scrapers.find((s) => s.sourceKey === key);
}

/** All available source keys */
export const sourceKeys = scrapers.map((s) => s.sourceKey);

export type { ScraperModule, ScraperResult, ScrapedEvent, NormalizedCompetition } from "./types";
