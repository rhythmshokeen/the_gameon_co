"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { FeatureLayout } from "@/components/feature-layout";
import {
  MapPin,
  Calendar,
  Users,
  Shield,
  ExternalLink,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  BadgeCheck,
  Clock,
  DollarSign,
  Trophy,
  User,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────

interface CompetitionDetail {
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
  sourceId: string | null;
  organizerName: string | null;
  imageUrl: string | null;
  lastSyncedAt: string | null;
  createdAt: string;
  organizer: { id: string; name: string; image: string | null } | null;
  _count: { applications: number };
  hasApplied: boolean;
  applicationStatus: string | null;
}

// ─── Helpers ───────────────────────────────────────────

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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ═══════════════════════════════════════════════════════
// COMPETITION DETAIL PAGE
// ═══════════════════════════════════════════════════════

export default function CompetitionDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [competition, setCompetition] = useState<CompetitionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const isAthlete = (session?.user as { role?: string } | undefined)?.role === "ATHLETE";

  useEffect(() => {
    if (!id) return;
    fetchCompetition();
  }, [id]);

  const fetchCompetition = async () => {
    try {
      const res = await fetch(`/api/compete/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCompetition(data);
      } else if (res.status === 404) {
        toast.error("Competition not found");
        router.push("/compete");
      }
    } catch {
      toast.error("Failed to load competition");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!competition) return;
    setApplying(true);
    try {
      const res = await fetch("/api/compete/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitionId: competition.id }),
      });
      if (res.ok) {
        toast.success("Application submitted successfully!");
        fetchCompetition();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to apply");
      }
    } catch {
      toast.error("Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  // ─── Loading State ──────────────────────────────────

  if (loading) {
    return (
      <FeatureLayout>
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-4" />
          <p className="text-sm text-slate-500">Loading competition details...</p>
        </div>
      </FeatureLayout>
    );
  }

  if (!competition) {
    return (
      <FeatureLayout>
        <div className="flex flex-col items-center justify-center py-32">
          <Shield className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Competition not found</h3>
          <Button variant="outline" onClick={() => router.push("/compete")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to competitions
          </Button>
        </div>
      </FeatureLayout>
    );
  }

  const comp = competition;
  const isSameDay = comp.startDate === comp.endDate ||
    formatShortDate(comp.startDate) === formatShortDate(comp.endDate);

  // ─── Render ─────────────────────────────────────────

  return (
    <FeatureLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push("/compete")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to competitions
        </button>

        {/* ─── Header Section ───────────────────────────── */}
        <div className="mb-8">
          {/* Image banner */}
          {comp.imageUrl && (
            <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-6">
              <img
                src={comp.imageUrl}
                alt={comp.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-transparent to-transparent" />
            </div>
          )}

          {/* Badges row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verified
            </span>

            {comp.source && (
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-semibold uppercase tracking-wider ${sourceColor(comp.source)}`}
              >
                {sourceLabel(comp.source)}
              </span>
            )}

            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800/60 text-xs font-medium text-slate-400 uppercase tracking-wider">
              {comp.competitionType}
            </span>

            {comp.scoutAttendance && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Scout Presence
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            {comp.title}
          </h1>

          {/* Sport */}
          <span className="inline-block px-3 py-1 rounded-lg bg-slate-800/80 text-sm font-medium text-slate-300 mb-4">
            {comp.sport}
          </span>
        </div>

        {/* ─── Metadata Row ─────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <MetadataCard
            icon={Calendar}
            label="Date"
            value={
              isSameDay
                ? formatShortDate(comp.startDate)
                : `${formatShortDate(comp.startDate)} — ${formatShortDate(comp.endDate)}`
            }
          />
          <MetadataCard
            icon={MapPin}
            label="Location"
            value={comp.location}
          />
          <MetadataCard
            icon={Shield}
            label="Level"
            value={comp.level}
          />
          <MetadataCard
            icon={Users}
            label="Applications"
            value={
              comp.maxParticipants
                ? `${comp._count.applications} / ${comp.maxParticipants}`
                : `${comp._count.applications} applied`
            }
          />
        </div>

        {/* ─── Description Block ────────────────────────── */}
        {comp.description && (
          <div className="mb-8 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
              About this Competition
            </h2>
            <div className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
              {comp.description}
            </div>
          </div>
        )}

        {/* ─── Details Grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {comp.entryFee != null && comp.entryFee > 0 && (
            <DetailRow icon={DollarSign} label="Entry Fee" value={`₹${comp.entryFee}`} />
          )}
          {comp.prizeInfo && (
            <DetailRow icon={Trophy} label="Prize" value={comp.prizeInfo} />
          )}
          {(comp.organizerName || comp.organizer?.name) && (
            <DetailRow
              icon={User}
              label="Organizer"
              value={comp.organizerName || comp.organizer?.name || "—"}
            />
          )}
          {comp.lastSyncedAt && (
            <DetailRow
              icon={Clock}
              label="Last Synced"
              value={new Date(comp.lastSyncedAt).toLocaleString("en-IN")}
            />
          )}
        </div>

        {/* ─── Source Attribution ────────────────────────── */}
        {comp.source && (
          <div className="mb-8 p-4 rounded-xl bg-slate-900/30 border border-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-xs text-slate-500">
                  Imported from <span className="text-slate-400 font-medium">{sourceLabel(comp.source)}</span>
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Data verified and normalized by GameOn Co.
                </p>
              </div>
            </div>
            {comp.sourceUrl && (
              <a
                href={comp.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-400 transition-colors"
              >
                View original
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* ─── Action Section ───────────────────────────── */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60">
          {isAthlete ? (
            comp.hasApplied ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">Application Submitted</p>
                    <p className="text-xs text-slate-500">
                      Status: <span className="text-slate-400 capitalize">{comp.applicationStatus?.toLowerCase() || "applied"}</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-1">Ready to compete?</h3>
                  <p className="text-xs text-slate-500">
                    Submit your application to participate in this competition.
                  </p>
                </div>
                <Button
                  onClick={handleApply}
                  disabled={applying}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/10"
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Apply Now"
                  )}
                </Button>
              </div>
            )
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-slate-500">
                Only athletes can apply to competitions.
              </p>
            </div>
          )}
        </div>
      </div>
    </FeatureLayout>
  );
}

// ═══════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

function MetadataCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-300 leading-snug">{value}</p>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/30 border border-slate-800/40">
      <Icon className="w-4 h-4 text-slate-600 flex-shrink-0" />
      <div>
        <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wider block">
          {label}
        </span>
        <span className="text-sm text-slate-300">{value}</span>
      </div>
    </div>
  );
}
