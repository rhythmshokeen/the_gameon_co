"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  Calendar,
  Loader2,
  ChevronDown,
  ExternalLink,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Application {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  competition: {
    id: string;
    title: string;
    sport: string;
    location: string;
    startDate: string;
    endDate: string;
  };
  athlete?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

const STATUS_FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED", "WITHDRAWN"];

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isOrganizer = session?.user?.role === "ORGANIZER";

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "ALL") params.set("status", filter);
      const res = await fetch(`/api/applications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Application ${status.toLowerCase()}`);
        setApplications((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, status } : app
          )
        );
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default" as const;
      case "REJECTED":
        return "destructive" as const;
      case "PENDING":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const counts = {
    ALL: applications.length,
    PENDING: applications.filter((a) => a.status === "PENDING").length,
    APPROVED: applications.filter((a) => a.status === "APPROVED").length,
    REJECTED: applications.filter((a) => a.status === "REJECTED").length,
    WITHDRAWN: applications.filter((a) => a.status === "WITHDRAWN").length,
  };

  const filtered =
    filter === "ALL"
      ? applications
      : applications.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Applications</h1>
        <p className="text-slate-400 mt-1">
          {isOrganizer
            ? "Manage applications to your competitions"
            : "Track your competition applications"}
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors flex items-center gap-2 ${
              filter === status
                ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400"
                : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
            }`}
          >
            {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
            <span className="text-xs opacity-70">
              ({counts[status as keyof typeof counts] || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              No applications found
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {filter !== "ALL"
                ? `No ${filter.toLowerCase()} applications.`
                : isOrganizer
                ? "No one has applied to your competitions yet."
                : "You haven't applied to any competitions yet."}
            </p>
            {!isOrganizer && (
              <Link href="/dashboard/competitions">
                <Button className="mt-4">Browse Competitions</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {statusIcon(app.status)}
                        <Link
                          href={`/dashboard/competitions/${app.competition.id}`}
                          className="text-white font-medium hover:text-indigo-400 transition-colors truncate"
                        >
                          {app.competition.title}
                        </Link>
                        <Badge variant={statusBadgeVariant(app.status)} className="text-xs shrink-0">
                          {app.status}
                        </Badge>
                      </div>

                      {isOrganizer && app.athlete && (
                        <p className="text-sm text-slate-300 mb-1">
                          Applicant: <span className="text-indigo-400">{app.athlete.name}</span>
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {app.competition.sport}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Applied{" "}
                          {new Date(app.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {app.message && (
                        <p className="mt-2 text-sm text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-slate-800">
                          &ldquo;{app.message}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Organizer Actions */}
                    {isOrganizer && app.status === "PENDING" && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => updateStatus(app.id, "APPROVED")}
                          disabled={updatingId === app.id}
                        >
                          {updatingId === app.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(app.id, "REJECTED")}
                          disabled={updatingId === app.id}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
