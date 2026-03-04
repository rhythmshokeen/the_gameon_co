"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  UserPlus,
  MapPin,
  Trophy,
  Briefcase,
  Clock,
  Loader2,
  Users,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

interface Athlete {
  id: string;
  sport: string;
  position: string | null;
  bio: string | null;
  location: string | null;
  experience: number | null;
  verificationStatus: string;
  user: { id: string; name: string; image: string | null };
  _count: { performanceStats: number; achievements: number };
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

export default function DiscoverPage() {
  const { data: session } = useSession();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const fetchAthletes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });
      if (searchQuery) params.set("search", searchQuery);
      if (selectedSport !== "All Sports") params.set("sport", selectedSport);

      const res = await fetch(`/api/athletes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAthletes(data.athletes);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch athletes:", error);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedSport]);

  useEffect(() => {
    const timer = setTimeout(fetchAthletes, 300);
    return () => clearTimeout(timer);
  }, [fetchAthletes]);

  const handleConnect = async (userId: string) => {
    setConnectingId(userId);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: userId,
          message: "I'd like to connect with you!",
        }),
      });
      if (res.ok) {
        toast.success("Connection request sent!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send request");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Discover Athletes</h1>
        <p className="text-slate-400 mt-1">
          {total > 0
            ? `${total} athletes found`
            : "Find and connect with talented athletes"}
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by name, sport, position..."
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

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
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
        </CardContent>
      </Card>

      {/* Athletes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-5 text-center">
                <Skeleton className="h-16 w-16 rounded-full mx-auto mb-3" />
                <Skeleton className="h-4 w-24 mx-auto mb-2" />
                <Skeleton className="h-3 w-16 mx-auto mb-3" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : athletes.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              No athletes found
            </h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {athletes.map((athlete, index) => (
            <motion.div
              key={athlete.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group h-full">
                <CardContent className="p-5">
                  <div className="text-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl mx-auto mb-3">
                      {athlete.user.image ? (
                        <img
                          src={athlete.user.image}
                          alt={athlete.user.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        athlete.user.name?.[0]?.toUpperCase() || "?"
                      )}
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {athlete.user.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {athlete.sport}
                      </Badge>
                      {athlete.verificationStatus === "VERIFIED" && (
                        <Badge variant="default" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                    {athlete.position && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3 w-3" />
                        <span>{athlete.position}</span>
                      </div>
                    )}
                    {athlete.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{athlete.location}</span>
                      </div>
                    )}
                    {athlete.experience && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{athlete.experience} yrs experience</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 pt-1">
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        {athlete._count.achievements} achievements
                      </span>
                    </div>
                  </div>

                  {athlete.bio && (
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                      {athlete.bio}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/athletes/${athlete.user.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                    {session?.user?.id !== athlete.user.id && (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(athlete.user.id)}
                        disabled={connectingId === athlete.user.id}
                      >
                        {connectingId === athlete.user.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <UserPlus className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
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
