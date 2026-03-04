"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { FeatureLayout } from "@/components/feature-layout";
import {
  Send,
  MapPin,
  Calendar,
  Building,
  DollarSign,
  Users,
  Search,
  Filter,
  Loader2,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Opportunity {
  id: string;
  title: string;
  type: string;
  sport: string;
  location: string;
  description: string | null;
  requirements: string | null;
  deadline: string;
  organization: string;
  stipend: string | null;
  slots: number | null;
  isActive: boolean;
  creator: { name: string };
  _count: { applications: number };
  hasApplied?: boolean;
  applicationStatus?: string;
}

const typeFilters = [
  "All",
  "SCHOLARSHIP",
  "TEAM_TRIAL",
  "CLUB_CONTRACT",
  "INTERNSHIP",
  "CAMP",
];

export default function ApplyPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"browse" | "my">("browse");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "All") params.set("type", typeFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/apply?${params}`);
      if (res.ok) setOpportunities(await res.json());
    } catch {
      toast.error("Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, search]);

  const fetchMyApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/apply/my");
      if (res.ok) setMyApplications(await res.json());
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "browse") fetchOpportunities();
    else fetchMyApplications();
  }, [tab, fetchOpportunities]);

  const handleApply = async (opportunityId: string) => {
    setApplying(opportunityId);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      });
      if (res.ok) {
        toast.success("Application submitted!");
        fetchOpportunities();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to apply");
      }
    } catch {
      toast.error("Failed to apply");
    } finally {
      setApplying(null);
    }
  };

  const typeLabel = (t: string) =>
    t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <FeatureLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Send className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">APPLY</h1>
        </div>
        <p className="text-slate-400">
          Browse scholarships, team trials, club contracts, and internships.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setTab("browse")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "browse"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Browse Opportunities
        </button>
        <button
          onClick={() => setTab("my")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "my"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          My Applications
        </button>
      </div>

      {tab === "browse" && (
        <>
          {/* Filters */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search opportunities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Filter className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex flex-wrap gap-2">
              {typeFilters.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    typeFilter === t
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:border-slate-600"
                  }`}
                >
                  {t === "All" ? "All Types" : typeLabel(t)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            </div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-24">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No opportunities found
              </h3>
              <p className="text-sm text-slate-500">
                Try adjusting your filters or check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">
                        {typeLabel(opp.type)}
                      </span>
                      <h3 className="text-lg font-bold mt-1">{opp.title}</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-xs font-medium text-slate-300">
                      {opp.sport}
                    </span>
                  </div>

                  {opp.description && (
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {opp.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-5 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      {opp.organization}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {opp.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Deadline:{" "}
                      {new Date(opp.deadline).toLocaleDateString()}
                    </div>
                    {opp.stipend && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        {opp.stipend}
                      </div>
                    )}
                    {opp.slots && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {opp._count.applications}/{opp.slots} applied
                      </div>
                    )}
                  </div>

                  {opp.hasApplied ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Applied
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleApply(opp.id)}
                      disabled={applying === opp.id}
                      className="bg-amber-600 hover:bg-amber-500 text-white"
                    >
                      {applying === opp.id ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Apply Now
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* My Applications Tab */}
      {tab === "my" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            </div>
          ) : myApplications.length === 0 ? (
            <div className="text-center py-24">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No applications yet
              </h3>
              <p className="text-sm text-slate-500">
                Browse opportunities and submit your first application.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center gap-4 p-5 rounded-xl border border-slate-800/60 bg-slate-900/40"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">
                      {app.opportunity.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {app.opportunity.organization} · {app.opportunity.sport}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      app.status === "ACCEPTED"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : app.status === "REJECTED"
                        ? "bg-red-500/10 text-red-400"
                        : app.status === "SUBMITTED"
                        ? "bg-sky-500/10 text-sky-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {app.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    {app.submittedAt
                      ? new Date(app.submittedAt).toLocaleDateString()
                      : "Draft"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </FeatureLayout>
  );
}
