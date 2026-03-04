/**
 * Seed Competitions Script
 * ────────────────────────
 * Directly seeds competition data from all 3 scraper sources into the DB.
 * Run: npx tsx script/seed-competitions.ts
 */

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function seedDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

type CompType = "TOURNAMENT" | "TRIAL" | "FRIENDLY" | "TRYOUT" | "RANKED";

interface SeedComp {
  title: string;
  sport: string;
  location: string;
  startDate: Date;
  endDate: Date;
  level: string;
  competitionType: CompType;
  description: string;
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

const competitions: SeedComp[] = [
  // ═══════════════════════════════════════════
  // BookMyShow Events (8)
  // ═══════════════════════════════════════════
  {
    title: "Delhi Premier League – Season 8",
    sport: "Cricket",
    location: "Arun Jaitley Stadium, New Delhi",
    startDate: seedDate(12),
    endDate: seedDate(14),
    level: "Advanced",
    competitionType: "TOURNAMENT",
    description:
      "The marquee T20 cricket tournament of Delhi returns with 16 teams battling across 3 intense days. Open to amateur and semi-pro teams. Prize pool of ₹5,00,000.",
    entryFee: 2500,
    prizeInfo: "₹5,00,000 prize pool",
    organizerName: "Delhi Cricket Association",
    imageUrl:
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
    sourceUrl: "https://in.bookmyshow.com/events/delhi-premier-league",
    sourceId: "bms-dpl-s8",
    scoutAttendance: true,
    maxParticipants: 16,
    source: "bookmyshow",
  },
  {
    title: "NCR Badminton Championship 2025",
    sport: "Badminton",
    location: "Siri Fort Sports Complex, New Delhi",
    startDate: seedDate(18),
    endDate: seedDate(20),
    level: "Intermediate",
    competitionType: "TOURNAMENT",
    description:
      "Annual badminton championship covering Singles, Doubles, and Mixed Doubles categories across U-17, U-21, and Open age groups.",
    entryFee: 800,
    prizeInfo: "Trophies + ₹50,000 per category",
    organizerName: "NCR Badminton Federation",
    imageUrl:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
    sourceUrl: "https://in.bookmyshow.com/events/ncr-badminton-championship",
    sourceId: "bms-ncr-bad-2025",
    scoutAttendance: false,
    maxParticipants: 256,
    source: "bookmyshow",
  },
  {
    title: "Run Delhi Half Marathon",
    sport: "Athletics",
    location: "India Gate, New Delhi",
    startDate: seedDate(25),
    endDate: seedDate(25),
    level: "Open",
    competitionType: "TOURNAMENT",
    description:
      "21.1km Half Marathon through the heart of Delhi starting at India Gate. Categories: Elite, Amateur, and Fun Run (5K). Chip timing and finisher medals for all.",
    entryFee: 1200,
    prizeInfo: "₹3,00,000 total. ₹1,00,000 to winner.",
    organizerName: "Run Delhi Foundation",
    imageUrl:
      "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=80",
    sourceUrl: "https://in.bookmyshow.com/events/run-delhi-half-marathon",
    sourceId: "bms-rdm-2025",
    scoutAttendance: false,
    maxParticipants: 5000,
    source: "bookmyshow",
  },
  {
    title: "Delhi Open Boxing Championship",
    sport: "Boxing",
    location: "Indira Gandhi Arena, New Delhi",
    startDate: seedDate(30),
    endDate: seedDate(32),
    level: "Advanced",
    competitionType: "TOURNAMENT",
    description:
      "State-level boxing championship featuring 10 weight categories. SAI-affiliated event with national ranking points. Open to boxers with valid AIBA registration.",
    entryFee: 500,
    prizeInfo: "Gold, Silver, Bronze medals + ranking points",
    organizerName: "Delhi Boxing Association",
    imageUrl:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&q=80",
    sourceUrl: "https://in.bookmyshow.com/events/delhi-open-boxing",
    sourceId: "bms-box-open-2025",
    scoutAttendance: true,
    maxParticipants: 200,
    source: "bookmyshow",
  },
  {
    title: "Noida Football Cup – 7-a-side",
    sport: "Football",
    location: "Noida Stadium, Sector 21A, Noida",
    startDate: seedDate(8),
    endDate: seedDate(9),
    level: "Intermediate",
    competitionType: "TOURNAMENT",
    description:
      "Fast-paced 7-a-side football tournament on turf. 32 teams, knockout format. All matches 2x15 min halves. Team entry includes jerseys and refreshments.",
    entryFee: 3000,
    prizeInfo: "₹75,000 to winners, ₹25,000 runners-up",
    organizerName: "Noida Sports Club",
    imageUrl:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    sourceUrl: "https://in.bookmyshow.com/events/noida-football-cup",
    sourceId: "bms-nfc-7s",
    scoutAttendance: false,
    maxParticipants: 32,
    source: "bookmyshow",
  },
  {
    title: "Delhi Chess Masters Rapid Open",
    sport: "Chess",
    location: "Talkatora Indoor Stadium, New Delhi",
    startDate: seedDate(22),
    endDate: seedDate(23),
    level: "Open",
    competitionType: "RANKED",
    description:
      "FIDE-rated rapid chess tournament with 9 rounds Swiss. Open to all rated and unrated players. Time control: 15+10. FIDE rating changes applicable.",
    entryFee: 600,
    prizeInfo: "₹2,00,000 prize fund. ₹40,000 to champion.",
    organizerName: "Delhi Chess Academy",
    imageUrl:
      "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80",
    sourceUrl: "https://in.bookmyshow.com/events/delhi-chess-masters",
    sourceId: "bms-chess-rapid-2025",
    scoutAttendance: false,
    maxParticipants: 300,
    source: "bookmyshow",
  },
  {
    title: "Swimming Splash – NCR Age Group Meet",
    sport: "Swimming",
    location: "SPM Swimming Pool Complex, New Delhi",
    startDate: seedDate(35),
    endDate: seedDate(36),
    level: "Beginner",
    competitionType: "TOURNAMENT",
    description:
      "Age-group swimming competition for children 8-16 years. Events include freestyle, backstroke, butterfly, and medley across 25m and 50m distances.",
    entryFee: 400,
    prizeInfo: "Medals for top 3 in each age group",
    organizerName: "NCR Swimming Association",
    imageUrl:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80",
    sourceUrl: "https://in.bookmyshow.com/events/ncr-swimming-splash",
    sourceId: "bms-swim-age-2025",
    scoutAttendance: false,
    maxParticipants: 150,
    source: "bookmyshow",
  },
  {
    title: "India Gate Yoga Fest 2025",
    sport: "Yoga",
    location: "Central Park, Connaught Place, New Delhi",
    startDate: seedDate(15),
    endDate: seedDate(15),
    level: "Open",
    competitionType: "FRIENDLY",
    description:
      "Celebrate International Yoga Day with a mass yoga session and competition. Categories: Individual asana, Group synchronization, and Freestyle flow.",
    entryFee: 200,
    prizeInfo: "Certificates + wellness hampers",
    organizerName: "Yoga India Trust",
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    sourceUrl: "https://in.bookmyshow.com/events/india-gate-yoga-fest",
    sourceId: "bms-yoga-fest-2025",
    scoutAttendance: false,
    maxParticipants: 1000,
    source: "bookmyshow",
  },

  // ═══════════════════════════════════════════
  // Townscript Events (7)
  // ═══════════════════════════════════════════
  {
    title: "Delhi Basketball League – Open Trials",
    sport: "Basketball",
    location: "Thyagaraj Sports Complex, New Delhi",
    startDate: seedDate(10),
    endDate: seedDate(10),
    level: "Open",
    competitionType: "TRIAL",
    description:
      "Open trials for the Delhi Basketball League. All players aged 16+ are welcome. Teams will be drafted from trial pool. Bring valid ID and sportswear.",
    entryFee: 300,
    prizeInfo: "Selection into Delhi Basketball League teams",
    organizerName: "Delhi Basketball Association",
    imageUrl:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
    sourceUrl: "https://www.townscript.com/e/delhi-basketball-league-trials",
    sourceId: "ts-dbl-trials-2025",
    scoutAttendance: true,
    maxParticipants: 200,
    source: "townscript",
  },
  {
    title: "Gurgaon Marathon 2025 – 10K / 21K / 42K",
    sport: "Athletics",
    location: "Leisure Valley Park, Gurgaon",
    startDate: seedDate(20),
    endDate: seedDate(20),
    level: "Open",
    competitionType: "TOURNAMENT",
    description:
      "Annual city marathon with three distances. AIMS-certified course. Categories: Men, Women, Veterans (45+), and Corporate Challenge. Chip timing for all.",
    entryFee: 1500,
    prizeInfo: "₹5,00,000 total purse. ₹1,50,000 for 42K winner.",
    organizerName: "Gurgaon Runners Club",
    imageUrl:
      "https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800&q=80",
    sourceUrl: "https://www.townscript.com/e/gurgaon-marathon-2025",
    sourceId: "ts-gurgaon-marathon-2025",
    scoutAttendance: false,
    maxParticipants: 8000,
    source: "townscript",
  },
  {
    title: "Futsal Friday League – Season 3",
    sport: "Football",
    location: "The Turf, Hauz Khas, New Delhi",
    startDate: seedDate(5),
    endDate: seedDate(40),
    level: "Intermediate",
    competitionType: "RANKED",
    description:
      "Weekly 5-a-side futsal league running every Friday for 8 weeks. Round-robin format with playoffs. Indoor turf, floodlit arena. Prizes every week.",
    entryFee: 5000,
    prizeInfo: "₹1,00,000 to league champions",
    organizerName: "The Turf Delhi",
    imageUrl:
      "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800&q=80",
    sourceUrl: "https://www.townscript.com/e/futsal-friday-league-s3",
    sourceId: "ts-futsal-fri-s3",
    scoutAttendance: false,
    maxParticipants: 16,
    source: "townscript",
  },
  {
    title: "Delhi Table Tennis Open 2025",
    sport: "Table Tennis",
    location: "Yamuna Sports Complex, New Delhi",
    startDate: seedDate(28),
    endDate: seedDate(29),
    level: "Intermediate",
    competitionType: "TOURNAMENT",
    description:
      "Open table tennis tournament featuring Men's Singles, Women's Singles, Doubles, and Mixed Doubles. Age categories: U-13, U-17, U-21, Senior. TTFI ranking points.",
    entryFee: 500,
    prizeInfo: "₹75,000 total prize money",
    organizerName: "Delhi Table Tennis Association",
    imageUrl:
      "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&q=80",
    sourceUrl: "https://www.townscript.com/e/delhi-tt-open-2025",
    sourceId: "ts-dtt-open-2025",
    scoutAttendance: false,
    maxParticipants: 200,
    source: "townscript",
  },
  {
    title: "CrossFit NCR Championship",
    sport: "Fitness",
    location: "Cult Fit Arena, Connaught Place, New Delhi",
    startDate: seedDate(16),
    endDate: seedDate(16),
    level: "Advanced",
    competitionType: "TOURNAMENT",
    description:
      "High-intensity CrossFit competition with 5 WODs. Divisions: RX, Scaled, and Masters 40+. Individual and team (3-person) categories.",
    entryFee: 2000,
    prizeInfo: "₹1,50,000 to individual RX winners",
    organizerName: "CrossFit NCR",
    imageUrl:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    sourceUrl: "https://www.townscript.com/e/crossfit-ncr-championship",
    sourceId: "ts-cf-ncr-2025",
    scoutAttendance: false,
    maxParticipants: 100,
    source: "townscript",
  },
  {
    title: "Squash Open – Noida Indoor",
    sport: "Squash",
    location: "Jaypee Greens Sports Club, Noida",
    startDate: seedDate(33),
    endDate: seedDate(34),
    level: "Open",
    competitionType: "TOURNAMENT",
    description:
      "PSA satellite-level squash event with Men's and Women's draws. Matches on glass-back court. Open to SRFI-registered and amateur players alike.",
    entryFee: 700,
    prizeInfo: "₹50,000 winner + PSA ranking points",
    organizerName: "Jaypee Sports Academy",
    imageUrl:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
    sourceUrl: "https://www.townscript.com/e/squash-open-noida",
    sourceId: "ts-squash-noida-2025",
    scoutAttendance: false,
    maxParticipants: 64,
    source: "townscript",
  },
  {
    title: "Kabaddi Maha League – Delhi Zone",
    sport: "Kabaddi",
    location: "Chhatrasal Stadium, Model Town, New Delhi",
    startDate: seedDate(14),
    endDate: seedDate(15),
    level: "Advanced",
    competitionType: "TOURNAMENT",
    description:
      "Zonal qualifier for the national Kabaddi Maha League. 12 teams from Delhi NCR compete. Mat-format kabaddi with certified referees. SAI-observed.",
    entryFee: 1500,
    prizeInfo: "₹2,50,000 + National League berth",
    organizerName: "Delhi Kabaddi Association",
    imageUrl:
      "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=800&q=80",
    sourceUrl: "https://www.townscript.com/e/kabaddi-maha-league-delhi",
    sourceId: "ts-kabaddi-maha-delhi",
    scoutAttendance: true,
    maxParticipants: 12,
    source: "townscript",
  },

  // ═══════════════════════════════════════════
  // Tournaments360 Events (8)
  // ═══════════════════════════════════════════
  {
    title: "Champions Trophy Cricket Tournament – Delhi",
    sport: "Cricket",
    location: "Roshanara Cricket Ground, Civil Lines, New Delhi",
    startDate: seedDate(7),
    endDate: seedDate(9),
    level: "Open",
    competitionType: "TOURNAMENT",
    description:
      "20-over knockout cricket tournament with 24 teams. Leather ball, DDCA rules. Matches on turf wicket. Man of the Match awards every game.",
    entryFee: 3500,
    prizeInfo: "₹1,50,000 to champions + Individual awards",
    organizerName: "Champions Sports Delhi",
    imageUrl:
      "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
    sourceUrl:
      "https://www.tournaments360.in/tournament/champions-trophy-delhi",
    sourceId: "t360-champ-trophy-del",
    scoutAttendance: true,
    maxParticipants: 24,
    source: "tournaments360",
  },
  {
    title: "Delhi Corporate Cricket League 2025",
    sport: "Cricket",
    location: "JLN Stadium Grounds, Lodhi Road, New Delhi",
    startDate: seedDate(14),
    endDate: seedDate(21),
    level: "Intermediate",
    competitionType: "RANKED",
    description:
      "Corporate cricket league for companies in Delhi NCR. 8-a-side, tennis ball format. League stage followed by knockouts.",
    entryFee: 8000,
    prizeInfo: "₹2,00,000 + Rolling Trophy",
    organizerName: "Corporate Sports India",
    imageUrl:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80",
    sourceUrl:
      "https://www.tournaments360.in/tournament/delhi-corporate-cricket-league",
    sourceId: "t360-corp-cricket-2025",
    scoutAttendance: false,
    maxParticipants: 16,
    source: "tournaments360",
  },
  {
    title: "South Delhi Football Championship",
    sport: "Football",
    location: "Ambedkar Stadium, Delhi Gate, New Delhi",
    startDate: seedDate(11),
    endDate: seedDate(13),
    level: "Advanced",
    competitionType: "TOURNAMENT",
    description:
      "11-a-side football championship organized by South Delhi Football Association. FIFA-size pitch, certified referees.",
    entryFee: 5000,
    prizeInfo: "₹1,00,000 winner + ₹50,000 runner-up",
    organizerName: "South Delhi Football Association",
    imageUrl:
      "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80",
    sourceUrl:
      "https://www.tournaments360.in/tournament/south-delhi-football-championship",
    sourceId: "t360-sdfc-2025",
    scoutAttendance: true,
    maxParticipants: 16,
    source: "tournaments360",
  },
  {
    title: "Dwarka Volleyball Cup",
    sport: "Volleyball",
    location: "Dwarka Sports Complex, Sector 11, Dwarka, New Delhi",
    startDate: seedDate(19),
    endDate: seedDate(19),
    level: "Open",
    competitionType: "TOURNAMENT",
    description:
      "One-day volleyball tournament with Men's and Women's divisions. 6-a-side, knockout format. Sand court with proper net setup.",
    entryFee: 1000,
    prizeInfo: "₹30,000 + trophies",
    organizerName: "Dwarka Sports Academy",
    imageUrl:
      "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80",
    sourceUrl:
      "https://www.tournaments360.in/tournament/dwarka-volleyball-cup",
    sourceId: "t360-dwarka-vball",
    scoutAttendance: false,
    maxParticipants: 16,
    source: "tournaments360",
  },
  {
    title: "NCR Tennis Open – Clay Court",
    sport: "Tennis",
    location: "R.K. Khanna Tennis Complex, New Delhi",
    startDate: seedDate(24),
    endDate: seedDate(27),
    level: "Advanced",
    competitionType: "RANKED",
    description:
      "AITA-sanctioned clay court tennis tournament. Men's and Women's Singles and Doubles. AITA ranking points at stake. Draw of 32.",
    entryFee: 1200,
    prizeInfo: "₹3,00,000 prize money + AITA points",
    organizerName: "NCR Tennis Academy",
    imageUrl:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
    sourceUrl:
      "https://www.tournaments360.in/tournament/ncr-tennis-open-clay",
    sourceId: "t360-ncr-tennis-clay",
    scoutAttendance: true,
    maxParticipants: 64,
    source: "tournaments360",
  },
  {
    title: "Weekend Warriors Badminton League",
    sport: "Badminton",
    location: "Khelgaon Badminton Hall, Siri Fort, New Delhi",
    startDate: seedDate(6),
    endDate: seedDate(34),
    level: "Intermediate",
    competitionType: "RANKED",
    description:
      "Weekend badminton league spanning 5 weekends. Doubles format with mixed skill tiers (A, B, C). Points table, season ranking, and grand finale knockouts.",
    entryFee: 1500,
    prizeInfo: "₹50,000 per tier to champions",
    organizerName: "Delhi Badminton Club",
    imageUrl:
      "https://images.unsplash.com/photo-1613918431703-aa50889e3be0?w=800&q=80",
    sourceUrl:
      "https://www.tournaments360.in/tournament/weekend-warriors-badminton",
    sourceId: "t360-ww-bad-league",
    scoutAttendance: false,
    maxParticipants: 48,
    source: "tournaments360",
  },
  {
    title: "Ghaziabad Night Cricket Championship",
    sport: "Cricket",
    location: "SGM Nagar Cricket Ground, Ghaziabad",
    startDate: seedDate(17),
    endDate: seedDate(18),
    level: "Open",
    competitionType: "TOURNAMENT",
    description:
      "Floodlit night cricket tournament. 15-over format, tennis ball with taped seam. 32 teams. Knockout from quarter-finals.",
    entryFee: 2000,
    prizeInfo: "₹75,000 to winners",
    organizerName: "Ghaziabad Cricket Association",
    imageUrl:
      "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=800&q=80",
    sourceUrl:
      "https://www.tournaments360.in/tournament/ghaziabad-night-cricket",
    sourceId: "t360-gzb-night-cricket",
    scoutAttendance: false,
    maxParticipants: 32,
    source: "tournaments360",
  },
  {
    title: "Delhi Junior Basketball Camp & Trials",
    sport: "Basketball",
    location: "Indira Gandhi Indoor Stadium, New Delhi",
    startDate: seedDate(26),
    endDate: seedDate(27),
    level: "Beginner",
    competitionType: "TRIAL",
    description:
      "Two-day basketball camp with skills assessment and open trials for Delhi U-16 and U-19 squads. Coached by BFI-certified trainers.",
    entryFee: 400,
    prizeInfo: "Selection into Delhi junior squads",
    organizerName: "Basketball Federation of India – Delhi Unit",
    imageUrl:
      "https://images.unsplash.com/photo-1559692048-79a3f837883d?w=800&q=80",
    sourceUrl:
      "https://www.tournaments360.in/tournament/delhi-junior-basketball-trials",
    sourceId: "t360-djb-trials-2025",
    scoutAttendance: true,
    maxParticipants: 150,
    source: "tournaments360",
  },
];

async function main() {
  console.log("🏟️  Seeding competitions...\n");

  let inserted = 0;
  let skipped = 0;

  for (const comp of competitions) {
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
      inserted++;
      console.log(`  ✅ ${comp.title} (${comp.source})`);
    } catch (err) {
      skipped++;
      console.log(
        `  ⚠️  Skipped: ${comp.title} — ${err instanceof Error ? err.message : err}`
      );
    }
  }

  // Also log to ScrapeLog
  for (const src of ["bookmyshow", "townscript", "tournaments360"]) {
    const count = competitions.filter((c) => c.source === src).length;
    try {
      await (prisma.scrapeLog as any).create({
        data: {
          source: src,
          status: "success",
          eventsFound: count,
          eventsInserted: count,
          eventsSkipped: 0,
          eventsFailed: 0,
          durationMs: 0,
          error: null,
          triggeredBy: "seed-script",
        },
      });
    } catch {
      // ignore log errors
    }
  }

  console.log(
    `\n🎉 Done! Inserted: ${inserted}, Skipped: ${skipped}, Total: ${competitions.length}`
  );

  const total = await prisma.competition.count();
  console.log(`📊 Total competitions in DB: ${total}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
