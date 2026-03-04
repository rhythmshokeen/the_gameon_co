"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FeatureLayout } from "@/components/feature-layout";
import {
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LearningModule {
  id: string;
  title: string;
  description: string | null;
  level: string;
  durationMins: number;
  sortOrder: number;
  progress?: { completed: boolean; progress: number } | null;
}

interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  sport: string | null;
  category: string;
  modules: LearningModule[];
}

export default function LearnPage() {
  const { data: session } = useSession();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [updatingModule, setUpdatingModule] = useState<string | null>(null);

  useEffect(() => {
    fetchPaths();
  }, []);

  const fetchPaths = async () => {
    try {
      const res = await fetch("/api/learn");
      if (res.ok) {
        const data = await res.json();
        setPaths(data);
      }
    } catch {
      toast.error("Failed to load learning paths");
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (moduleId: string, progress: number) => {
    setUpdatingModule(moduleId);
    try {
      const res = await fetch("/api/learn/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, progress }),
      });
      if (res.ok) {
        toast.success(
          progress >= 100 ? "Module completed! 🎉" : "Progress updated"
        );
        fetchPaths();
      } else {
        toast.error("Failed to update progress");
      }
    } catch {
      toast.error("Failed to update progress");
    } finally {
      setUpdatingModule(null);
    }
  };

  const getPathProgress = (path: LearningPath) => {
    if (path.modules.length === 0) return 0;
    const completed = path.modules.filter(
      (m) => m.progress?.completed
    ).length;
    return Math.round((completed / path.modules.length) * 100);
  };

  const categories = [...new Set(paths.map((p) => p.category))];

  return (
    <FeatureLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">LEARN</h1>
        </div>
        <p className="text-slate-400">
          Structured learning paths for sport fundamentals, nutrition, mental
          training, and more.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        </div>
      ) : paths.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No learning paths yet</h3>
          <p className="text-sm text-slate-500">
            Learning content is being prepared. Check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="text-lg font-bold mb-4 text-slate-200">
                {category}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {paths
                  .filter((p) => p.category === category)
                  .map((path) => {
                    const progress = getPathProgress(path);
                    const isExpanded = expandedPath === path.id;

                    return (
                      <div
                        key={path.id}
                        className="rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden"
                      >
                        {/* Path Header */}
                        <button
                          onClick={() =>
                            setExpandedPath(isExpanded ? null : path.id)
                          }
                          className="w-full p-6 text-left hover:bg-slate-800/20 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-base font-bold mb-1">
                                {path.title}
                              </h3>
                              {path.description && (
                                <p className="text-xs text-slate-400 line-clamp-2">
                                  {path.description}
                                </p>
                              )}
                            </div>
                            <ChevronRight
                              className={`w-5 h-5 text-slate-500 transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </div>

                          {/* Progress bar */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-400">
                              {progress}%
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {path.modules.length} modules
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {path.modules.reduce(
                                (sum, m) => sum + m.durationMins,
                                0
                              )}{" "}
                              min
                            </span>
                            {path.sport && (
                              <span className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3" />
                                {path.sport}
                              </span>
                            )}
                          </div>
                        </button>

                        {/* Expanded Modules */}
                        {isExpanded && (
                          <div className="border-t border-slate-800/60 px-6 py-4 space-y-3">
                            {path.modules.map((mod, idx) => {
                              const modProgress =
                                mod.progress?.progress ?? 0;
                              const isCompleted =
                                mod.progress?.completed ?? false;

                              return (
                                <div
                                  key={mod.id}
                                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                                    isCompleted
                                      ? "border-emerald-500/20 bg-emerald-500/5"
                                      : "border-slate-800/60 bg-slate-800/20"
                                  }`}
                                >
                                  {/* Step number */}
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                      isCompleted
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-slate-800 text-slate-400"
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                      idx + 1
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {mod.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                      <span>{mod.level}</span>
                                      <span>·</span>
                                      <span>{mod.durationMins} min</span>
                                      {modProgress > 0 && !isCompleted && (
                                        <>
                                          <span>·</span>
                                          <span>{modProgress}%</span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {session && !isCompleted && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={
                                        updatingModule === mod.id
                                      }
                                      onClick={() =>
                                        updateProgress(
                                          mod.id,
                                          modProgress >= 50 ? 100 : 50
                                        )
                                      }
                                      className="text-xs"
                                    >
                                      {updatingModule === mod.id ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : modProgress >= 50 ? (
                                        "Complete"
                                      ) : (
                                        "Start"
                                      )}
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </FeatureLayout>
  );
}
