#!/usr/bin/env node
/**
 * BookMyShow Sports Scraper — CLI Runner
 * ----------------------------------------
 * Run with:
 *   npx tsx scripts/scrape-bms.ts
 *   -- or --
 *   npm run scrape:bms
 *
 * Output:
 *   • Pretty-printed JSON to stdout
 *   • scrape-output.json written to project root
 *
 * No Next.js server required.
 * No DB writes.
 */

import { writeFileSync } from "fs";
import { resolve } from "path";

// The scraper module uses native fetch (Node 18+). Ensure you're on Node >= 18.
// tsx handles the TypeScript compilation automatically.

// Import from relative path (we are in /scripts, scraper is in /src/lib)
import { scrape } from "../src/lib/scrapers/bookmyshow";

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    const startTime = Date.now();

    console.log("╔══════════════════════════════════════════╗");
    console.log("║  BookMyShow Sports Scraper — CLI Runner  ║");
    console.log("╚══════════════════════════════════════════╝");
    console.log(`Started at: ${new Date().toISOString()}\n`);

    const result = await scrape();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n─────────────────────────────────────────────");
    console.log(`  Result     : ${result.success ? "✅ SUCCESS" : "❌ FAILED"}`);
    console.log(`  Method     : ${result.method.toUpperCase()}`);
    console.log(`  Events     : ${result.count}`);
    console.log(`  Duration   : ${elapsed}s`);
    console.log(`  Scraped at : ${result.scrapedAt}`);
    if (result.error) {
        console.log(`  Error      : ${result.error}`);
    }
    console.log("─────────────────────────────────────────────\n");

    if (result.success && result.events.length > 0) {
        console.log("📋 SAMPLE OUTPUT (first 3 events):\n");
        console.log(JSON.stringify(result.events.slice(0, 3), null, 2));
    }

    // Write full output to file
    const outputPath = resolve(process.cwd(), "bms-output.json");
    writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`\n💾 Full JSON output written to: ${outputPath}`);

    if (!result.success) {
        process.exit(1);
    }
}

main().catch((err) => {
    console.error("\n[FATAL]", err instanceof Error ? err.message : err);
    process.exit(1);
});
