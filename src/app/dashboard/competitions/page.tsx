"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Competition {
  id: string;
  title: string;
  description: string;
  sport: string;
  location: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  registrationDeadline: string;
  status: string;
  _count: { applications: number };
  organizer: { id: string; name: string; image: string | null };
}

const SPORTS = [
  "All Sports",
  "Football",
  "Basketball",
  "Cricket",
  "Tennis",
  "Swimming",
  "Athletics",
  "Badminton",
  "Hockey",
  "Volleyball",
  "Boxing",
  "Wrestling",
  "Martial Arts",
  "Other",
];

export default function CompetitionsPage() {
  const { data: session } = useSession();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCompetitions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "9",
      });
      if (searchQuery) params.set("search", searchQuery);
      if (selectedSport !== "All Sports") params.set("sport", selectedSport);

      const res = await fetch(`/api/competitions?${params}`);
      const data = await res.json();

      if (res.ok) {
        setCompetitions(data.competitions);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch competitions:", error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedSport]);

  useEffect(() => {
    const timer = setTimeout(fetchCompetitions, 300);
    return () => clearTimeout(timer);
  }, [fetchCompetitions]);

  const isOrganizer = session?.user?.role === "ORGANIZER";
  const isDeadlinePassed = (deadline: string) => new Date(deadline) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Competitions</h1>
          <p className="text-slate-400 mt-1">
            {total > 0 ? `${total} competitions found` : "Discover opportunities"}
          </p>
        </div>
        {isOrganizer && (
          <Link href="/dashboard/competitions/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Competition
            </Button>
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search competitions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {selectedSport !== "All Sports" && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  1
                </Badge>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-slate-800 mt-4">
                  <p className="text-sm font-medium text-slate-300 mb-3">Sport</p>
                  <div className="flex flex-wrap gap-2">
                    {SPORTS.map((sport) => (
                      <button
                        key={sport}
                        onClick={() => {
                          setSelectedSport(sport);
                          setPage(1);
                        }}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          selectedSport === sport
                            ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400"
                            : "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                        }`}
                      >
                        {sport}
                      </button>
                    ))}
                  </div>
                  {selectedSport !== "All Sports" && (
                    <button
                      onClick={() => {
                        setSelectedSport("All Sports");
                        setPage(1);
                      }}
                      className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Clear filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Competition Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-5">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : competitions.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="py-16 text-center">
            <Trophy className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              No competitions found
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              {searchQuery || selectedSport !== "All Sports"
                ? "Try adjusting your search or filters to find more competitions."
                : "No competitions are available right now. Check back later!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitions.map((comp, index) => (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/dashboard/competitions/${comp.id}`}>
                <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group cursor-pointer h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge
                        variant={
                          comp.status === "OPEN"
                            ? "default"
                            : comp.status === "UPCOMING"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {comp.status}
                      </Badge>
                      {isDeadlinePassed(comp.registrationDeadline) && (
                        <Badge variant="destructive" className="text-xs">
                          Closed
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {comp.title}
                    </h3>

                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {comp.description}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Trophy className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{comp.sport}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span className="truncate">{comp.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span>
                          {new Date(comp.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          -{" "}
                          {new Date(comp.endDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Users className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span>
                          {comp._count.applications}/{comp.maxParticipants} spots
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 font-medium">
                          {comp.organizer.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="text-xs text-slate-500 truncate max-w-[120px]">
                          {comp.organizer.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(comp.registrationDeadline).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`h-8 w-8 rounded text-sm transition-colors ${
                    page === pageNum
                      ? "bg-indigo-500 text-white"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
