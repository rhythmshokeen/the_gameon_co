"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search as SearchIcon,
  Users,
  Trophy,
  MapPin,
  Briefcase,
  Calendar,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SearchResults {
  athletes: Array<{
    id: string;
    sport: string;
    position: string | null;
    location: string | null;
    user: { id: string; name: string; image: string | null };
  }>;
  competitions: Array<{
    id: string;
    title: string;
    sport: string;
    location: string;
    startDate: string;
    status: string;
  }>;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery ?? query;
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const totalResults =
    (results?.athletes?.length || 0) + (results?.competitions?.length || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <p className="text-slate-400 mt-1">
          Find athletes, competitions, and more.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <Input
            placeholder="Search for athletes, competitions, sports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-11 h-12 text-base"
            autoFocus
          />
        </div>
        <Button onClick={() => handleSearch()} disabled={loading} className="h-12 px-6">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : searched && results ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <p className="text-sm text-slate-400">
            {totalResults} result{totalResults !== 1 ? "s" : ""} found for &ldquo;{query}&rdquo;
          </p>

          {/* Athletes */}
          {results.athletes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-400" />
                Athletes ({results.athletes.length})
              </h2>
              <div className="space-y-2">
                {results.athletes.map((athlete) => (
                  <Link
                    key={athlete.id}
                    href={`/dashboard/athletes/${athlete.user.id}`}
                  >
                    <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-medium text-lg shrink-0">
                          {athlete.user.image ? (
                            <img
                              src={athlete.user.image}
                              alt={athlete.user.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            athlete.user.name?.[0]?.toUpperCase() || "?"
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white">
                            {athlete.user.name}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {athlete.sport}
                            </span>
                            {athlete.position && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {athlete.position}
                              </span>
                            )}
                            {athlete.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {athlete.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Competitions */}
          {results.competitions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-indigo-400" />
                Competitions ({results.competitions.length})
              </h2>
              <div className="space-y-2">
                {results.competitions.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/dashboard/competitions/${comp.id}`}
                  >
                    <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                          <Trophy className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-medium text-white truncate">
                              {comp.title}
                            </p>
                            <Badge
                              variant={
                                comp.status === "OPEN"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs shrink-0"
                            >
                              {comp.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-400">
                            <span>{comp.sport}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {comp.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(comp.startDate).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="py-16 text-center">
                <SearchIcon className="h-12 w-12 mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  No results found
                </h3>
                <p className="text-slate-500">
                  Try different keywords or check for typos.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      ) : (
        !searched && (
          <Card className="border-slate-800 bg-slate-900/50">
            <CardContent className="py-16 text-center">
              <SearchIcon className="h-12 w-12 mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                Start searching
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                Search for athletes by name, sport, or position. Find competitions by title, location, or sport.
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
