#!/usr/bin/env node
/**
 * Townscript Sports Scraper — CLI Runner
 * ----------------------------------------
 * Run with:
 *   npm run scrape:ts
 *   -- or --
 *   npx tsx scripts/scrape-townscript.ts
 *
 * Output:
 *   • Pretty-printed sample to stdout
 *   • Full results written to townscript-output.json
 *
 * No Next.js server required. No DB writes.
 */

import { writeFileSync } from "fs";
import { resolve } from "path";
import { scrape } from "../src/lib/scrapers/townscript";

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    const startTime = Date.now();

    console.log("╔══════════════════════════════════════════╗");
    console.log("║  Townscript Sports Scraper — CLI Runner  ║");
    console.log("╚══════════════════════════════════════════╝");
    console.log(`Target  : Townscript Delhi — Sports & Fitness`);
    console.log(`Started : ${new Date().toISOString()}\n`);

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
        console.log("📋 SAMPLE OUTPUT (first 5 events):\n");
        console.log(JSON.stringify(result.events.slice(0, 5), null, 2));
    }

    // Write full output
    const outputPath = resolve(process.cwd(), "townscript-output.json");
    writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
    console.log(`\n💾 Full JSON written to: ${outputPath}`);

    if (!result.success) process.exit(1);
}

main().catch((err) => {
    console.error("\n[FATAL]", err instanceof Error ? err.message : err);
    process.exit(1);
});
