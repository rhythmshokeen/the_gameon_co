"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FeatureLayout } from "@/components/feature-layout";
import {
  Search,
  Loader2,
  CheckCircle2,
  MapPin,
  Calendar,
  Shield,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  Users,
  BadgeCheck,
  ArrowRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────

interface Competition {
  id: string;
  title: string;
  sport: string;
  location: string;
  startDate: string;
  endDate: string;
  level: string;
  competitionType: string;
  description: string | null;
  maxParticipants: number | null;
  entryFee: number | null;
  prizeInfo: string | null;
  scoutAttendance: boolean;
  verificationStatus: string;
  source: string | null;
  sourceUrl: string | null;
  organizerName: string | null;
  imageUrl: string | null;
  lastSyncedAt: string | null;
  organizer: { id: string; name: string; image: string | null } | null;
  _count: { applications: number };
  hasApplied?: boolean;
}

// ─── Filter Constants ──────────────────────────────────

const SPORTS = [
  "All Sports",
  "Cricket",
  "Football",
  "Basketball",
  "Tennis",
  "Badminton",
  "Swimming",
  "Athletics",
  "Boxing",
  "Kabaddi",
  "Hockey",
  "Volleyball",
  "Chess",
  "Table Tennis",
  "Fitness",
  "General Sports",
];

const LEVELS = ["All Levels", "Open", "Beginner", "Intermediate", "Advanced", "Professional"];

const SOURCES = [
  { key: "all", label: "All Sources" },
  { key: "bookmyshow", label: "BookMyShow" },
  { key: "townscript", label: "Townscript" },
  { key: "tournaments360", label: "Tournaments360" },
  { key: "manual", label: "Manual" },
];

// ─── Source badge color map ────────────────────────────

function sourceColor(source: string | null): string {
  switch (source) {
    case "bookmyshow":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    case "townscript":
      return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    case "tournaments360":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

function sourceLabel(source: string | null): string {
  switch (source) {
    case "bookmyshow": return "BookMyShow";
    case "townscript": return "Townscript";
    case "tournaments360": return "Tournaments360";
    default: return source || "Manual";
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ═══════════════════════════════════════════════════════
// COMPETE PAGE
// ═══════════════════════════════════════════════════════

export default function CompetePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("All Sports");
  const [level, setLevel] = useState("All Levels");
  const [source, setSource] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const isAdmin = !!session?.user;

  const activeFilterCount = [
    sport !== "All Sports",
    level !== "All Levels",
    source !== "all",
    locationFilter !== "",
    dateFrom !== "",
    dateTo !== "",
  ].filter(Boolean).length;

  // ─── Fetch competitions ──────────────────────────────

  const fetchCompetitions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sport !== "All Sports") params.set("sport", sport);
      if (level !== "All Levels") params.set("level", level);
      if (source !== "all") params.set("source", source);
      if (search) params.set("search", search);
      if (locationFilter) params.set("location", locationFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/compete?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCompetitions(data);
      }
    } catch {
      toast.error("Failed to load competitions");
    } finally {
      setLoading(false);
    }
  }, [sport, level, source, search, locationFilter, dateFrom, dateTo]);

  useEffect(() => {
    const debounce = setTimeout(fetchCompetitions, 300);
    return () => clearTimeout(debounce);
  }, [fetchCompetitions]);

  // ─── Sync handler (admin only) ───────────────────────

  const handleSync = async () => {
    if (!isAdmin) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/compete/sync", { method: "POST" });
      const data = await res.json();

      if (res.status === 429) {
        toast.error("Please wait 60 seconds between syncs");
        return;
      }

      if (res.ok || res.status === 207) {
        const inserted = data.totalInserted || 0;
        const failed = data.totalFailed || 0;
        if (inserted > 0) {
          toast.success(`Sync complete — ${inserted} competition${inserted !== 1 ? "s" : ""} imported`);
        } else if (failed > 0) {
          toast.error(`Sync completed with ${failed} failure${failed !== 1 ? "s" : ""}`);
        } else {
          toast.info("Sync complete — no new competitions found");
        }
        fetchCompetitions();
      } else {
        toast.error(data.error || "Sync failed");
      }
    } catch {
      toast.error("Failed to trigger sync");
    } finally {
      setSyncing(false);
    }
  };

  // ─── Apply handler ──────────────────────────────────

  const handleApply = async (competitionId: string) => {
    setApplying(competitionId);
    try {
      const res = await fetch("/api/compete/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitionId }),
      });
      if (res.ok) {
        toast.success("Application submitted successfully!");
        fetchCompetitions();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to apply");
      }
    } catch {
      toast.error("Failed to submit application");
    } finally {
      setApplying(null);
    }
  };

  // ─── Clear all filters ──────────────────────────────

  const clearFilters = () => {
    setSport("All Sports");
    setLevel("All Levels");
    setSource("all");
    setLocationFilter("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <FeatureLayout>
      <div className="max-w-7xl mx-auto">
        {/* ─── Hero Section ─────────────────────────────── */}
        <div className="mb-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase">
                    Verified
                  </span>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
                Verified Competitions
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
                Curated and verified competition listings aggregated from trusted sources.
                Every event is validated before listing.
              </p>
            </div>

            {/* Admin Sync Button */}
            {isAdmin && (
              <Button
                onClick={handleSync}
                disabled={syncing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/10 transition-all"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing Sources...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Sources
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* ─── Search & Filter Bar ──────────────────────── */}
        <div className="mb-8 space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search competitions, sports, locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 bg-slate-900/60 border-slate-800/60 rounded-xl text-sm placeholder:text-slate-600 focus:border-emerald-500/40 focus:ring-emerald-500/10"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 h-12 px-4 rounded-xl border text-sm font-medium transition-all ${
                showFilters || activeFilterCount > 0
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-slate-900/60 border-slate-800/60 text-slate-400 hover:border-slate-700"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Filter Competitions</span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Sport */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">Sport</label>
                  <div className="relative">
                    <select
                      value={sport}
                      onChange={(e) => setSport(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 appearance-none cursor-pointer focus:border-emerald-500/40 focus:outline-none"
                    >
                      {SPORTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">Level</label>
                  <div className="relative">
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 appearance-none cursor-pointer focus:border-emerald-500/40 focus:outline-none"
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">Source</label>
                  <div className="relative">
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 appearance-none cursor-pointer focus:border-emerald-500/40 focus:outline-none"
                    >
                      {SOURCES.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <Input
                      placeholder="City or venue..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="pl-9 h-10 bg-slate-800/60 border-slate-700/50 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Date From */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">From Date</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-10 bg-slate-800/60 border-slate-700/50 rounded-lg text-sm text-slate-300"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 font-medium">To Date</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-10 bg-slate-800/60 border-slate-700/50 rounded-lg text-sm text-slate-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Results count ────────────────────────────── */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              {competitions.length} competition{competitions.length !== 1 ? "s" : ""} found
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* ─── Competition Grid ─────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-4" />
            <p className="text-sm text-slate-500">Loading competitions...</p>
          </div>
        ) : competitions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-5">
              <Shield className="w-7 h-7 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No competitions found</h3>
            <p className="text-sm text-slate-500 max-w-sm text-center mb-6">
              {activeFilterCount > 0
                ? "Try adjusting your filters to see more results."
                : "No verified competitions available yet. Check back soon."}
            </p>
            {isAdmin && (
              <Button
                onClick={handleSync}
                disabled={syncing}
                variant="outline"
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync from sources
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {competitions.map((comp) => (
              <CompetitionCard
                key={comp.id}
                competition={comp}
                isAthlete={(session?.user as { role?: string } | undefined)?.role === "ATHLETE"}
                applying={applying === comp.id}
                onApply={() => handleApply(comp.id)}
                onView={() => router.push(`/compete/${comp.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </FeatureLayout>
  );
}

// ═══════════════════════════════════════════════════════
// COMPETITION CARD COMPONENT
// ═══════════════════════════════════════════════════════

function CompetitionCard({
  competition: comp,
  isAthlete,
  applying,
  onApply,
  onView,
}: {
  competition: Competition;
  isAthlete: boolean;
  applying: boolean;
  onApply: () => void;
  onView: () => void;
}) {
  return (
    <div
      className="group relative rounded-2xl border border-slate-800/60 bg-slate-900/30 overflow-hidden hover:border-slate-700/60 hover:shadow-xl hover:shadow-slate-950/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
      onClick={onView}
    >
      {/* Image banner or gradient fallback */}
      {comp.imageUrl ? (
        <div className="relative h-40 overflow-hidden">
          <img
            src={comp.imageUrl}
            alt={comp.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>
      ) : (
        <div className="h-3 bg-gradient-to-r from-emerald-500/20 via-slate-800/40 to-slate-800/0" />
      )}

      <div className="p-5">
        {/* Top row: badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {/* Verified badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
            <BadgeCheck className="w-3 h-3" />
            Verified
          </span>

          {/* Source badge */}
          {comp.source && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-semibold uppercase tracking-wider ${sourceColor(comp.source)}`}
            >
              {sourceLabel(comp.source)}
            </span>
          )}

          {/* Scout badge */}
          {comp.scoutAttendance && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
              Scouts
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold leading-snug mb-1.5 group-hover:text-white transition-colors line-clamp-2">
          {comp.title}
        </h3>

        {/* Sport tag */}
        <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-800/80 text-[11px] font-medium text-slate-400 mb-3">
          {comp.sport}
        </span>

        {/* Description */}
        {comp.description && (
          <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
            {comp.description}
          </p>
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <span className="truncate">{comp.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <span>{formatDate(comp.startDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <span>
              {comp._count.applications} applied
              {comp.maxParticipants ? ` / ${comp.maxParticipants}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            <span>{comp.level}</span>
          </div>
        </div>

        {/* Entry fee */}
        {comp.entryFee != null && comp.entryFee > 0 && (
          <p className="text-xs text-slate-500 mb-4">
            Entry fee: <span className="text-slate-300 font-medium">₹{comp.entryFee}</span>
          </p>
        )}

        {/* Footer: actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/40">
          {isAthlete ? (
            comp.hasApplied ? (
              <div className="flex items-center gap-1.5 text-sm text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium">Applied</span>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply();
                }}
                disabled={applying}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 rounded-lg shadow-sm shadow-emerald-500/10"
              >
                {applying ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "Apply Now"
                )}
              </Button>
            )
          ) : (
            <span className="text-[10px] text-slate-600 uppercase tracking-wider font-medium">
              {comp.competitionType}
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-400 transition-colors"
          >
            View details
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Source link (subtle) */}
        {comp.sourceUrl && (
          <div className="mt-3 pt-2 border-t border-slate-800/30">
            <a
              href={comp.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              View on {sourceLabel(comp.source)}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
