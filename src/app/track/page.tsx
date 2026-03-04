"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FeatureLayout } from "@/components/feature-layout";
import {
  BarChart3,
  Plus,
  Loader2,
  Timer,
  Flame,
  Gauge,
  Activity,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TrainingSession {
  id: string;
  date: string;
  type: string;
  sport: string | null;
  durationMins: number;
  intensityRpe: number | null;
  caloriesBurned: number | null;
  speedAvg: number | null;
  distanceKm: number | null;
  heartRateAvg: number | null;
  skillAccuracy: number | null;
  notes: string | null;
}

export default function TrackPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newSession, setNewSession] = useState({
    type: "Training",
    sport: "",
    durationMins: "",
    intensityRpe: "",
    caloriesBurned: "",
    distanceKm: "",
    heartRateAvg: "",
    skillAccuracy: "",
    notes: "",
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/track");
      if (res.ok) setSessions(await res.json());
    } catch {
      toast.error("Failed to load training sessions");
    } finally {
      setLoading(false);
    }
  };

  const addSession = async () => {
    if (!newSession.durationMins) {
      toast.error("Duration is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newSession.type,
          sport: newSession.sport || null,
          durationMins: parseInt(newSession.durationMins),
          intensityRpe: newSession.intensityRpe
            ? parseInt(newSession.intensityRpe)
            : null,
          caloriesBurned: newSession.caloriesBurned
            ? parseInt(newSession.caloriesBurned)
            : null,
          distanceKm: newSession.distanceKm
            ? parseFloat(newSession.distanceKm)
            : null,
          heartRateAvg: newSession.heartRateAvg
            ? parseInt(newSession.heartRateAvg)
            : null,
          skillAccuracy: newSession.skillAccuracy
            ? parseFloat(newSession.skillAccuracy)
            : null,
          notes: newSession.notes || null,
        }),
      });
      if (res.ok) {
        toast.success("Session logged!");
        setShowAdd(false);
        setNewSession({
          type: "Training",
          sport: "",
          durationMins: "",
          intensityRpe: "",
          caloriesBurned: "",
          distanceKm: "",
          heartRateAvg: "",
          skillAccuracy: "",
          notes: "",
        });
        fetchSessions();
      }
    } catch {
      toast.error("Failed to log session");
    } finally {
      setSubmitting(false);
    }
  };

  // Compute stats
  const last7 = sessions.filter((s) => {
    const d = new Date(s.date);
    const week = new Date();
    week.setDate(week.getDate() - 7);
    return d >= week;
  });

  const last30 = sessions.filter((s) => {
    const d = new Date(s.date);
    const month = new Date();
    month.setDate(month.getDate() - 30);
    return d >= month;
  });

  const totalMinutes7 = last7.reduce((s, t) => s + t.durationMins, 0);
  const totalSessions7 = last7.length;
  const avgIntensity7 =
    last7.filter((s) => s.intensityRpe).length > 0
      ? (
          last7.reduce((s, t) => s + (t.intensityRpe || 0), 0) /
          last7.filter((s) => s.intensityRpe).length
        ).toFixed(1)
      : "—";
  const totalCalories7 = last7.reduce(
    (s, t) => s + (t.caloriesBurned || 0),
    0
  );
  const totalDistance30 = last30
    .reduce((s, t) => s + (t.distanceKm || 0), 0)
    .toFixed(1);

  // Consistency score: (days trained in last 7 / 7) * 100
  const uniqueDays7 = new Set(
    last7.map((s) => new Date(s.date).toDateString())
  ).size;
  const consistencyScore = Math.round((uniqueDays7 / 7) * 100);

  return (
    <FeatureLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">TRACK</h1>
        </div>
        <p className="text-slate-400">
          Performance analytics, session logs, and consistency scoring.
        </p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 text-center">
          <Timer className="w-4 h-4 mx-auto mb-1 text-purple-400" />
          <p className="text-xl font-bold">{totalMinutes7}</p>
          <p className="text-[10px] text-slate-500">Minutes (7d)</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 text-center">
          <Calendar className="w-4 h-4 mx-auto mb-1 text-purple-400" />
          <p className="text-xl font-bold">{totalSessions7}</p>
          <p className="text-[10px] text-slate-500">Sessions (7d)</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 text-center">
          <Gauge className="w-4 h-4 mx-auto mb-1 text-purple-400" />
          <p className="text-xl font-bold">{avgIntensity7}</p>
          <p className="text-[10px] text-slate-500">Avg RPE (7d)</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 text-center">
          <Flame className="w-4 h-4 mx-auto mb-1 text-purple-400" />
          <p className="text-xl font-bold">{totalCalories7}</p>
          <p className="text-[10px] text-slate-500">Calories (7d)</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 text-center">
          <Activity className="w-4 h-4 mx-auto mb-1 text-purple-400" />
          <p className="text-xl font-bold">{totalDistance30}</p>
          <p className="text-[10px] text-slate-500">km (30d)</p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 text-center">
          <Target className="w-4 h-4 mx-auto mb-1 text-purple-400" />
          <p className="text-xl font-bold">{consistencyScore}%</p>
          <p className="text-[10px] text-slate-500">Consistency</p>
        </div>
      </div>

      {/* Consistency Visual */}
      <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 mb-8">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          7-Day Activity
        </h3>
        <div className="flex items-end gap-2 h-24">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toDateString();
            const daySessions = sessions.filter(
              (s) => new Date(s.date).toDateString() === dateStr
            );
            const totalMins = daySessions.reduce(
              (sum, s) => sum + s.durationMins,
              0
            );
            const maxHeight = 96;
            const height = Math.min(
              (totalMins / 120) * maxHeight,
              maxHeight
            );

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    totalMins > 0
                      ? "bg-purple-500/40 border border-purple-500/30"
                      : "bg-slate-800/40 border border-slate-800/30"
                  }`}
                  style={{ height: Math.max(height, 4) }}
                />
                <span className="text-[10px] text-slate-500">
                  {date.toLocaleDateString("en-US", { weekday: "narrow" })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Session */}
      <Button
        size="sm"
        onClick={() => setShowAdd(!showAdd)}
        className="mb-6 bg-purple-600 hover:bg-purple-500 text-white"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Log Session
      </Button>

      {showAdd && (
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 mb-6 space-y-4">
          <h3 className="font-bold">New Training Session</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label>Type</Label>
              <select
                value={newSession.type}
                onChange={(e) =>
                  setNewSession({ ...newSession, type: e.target.value })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-sm text-white"
              >
                <option>Training</option>
                <option>Match</option>
                <option>Recovery</option>
              </select>
            </div>
            <div>
              <Label>Sport</Label>
              <Input
                value={newSession.sport}
                onChange={(e) =>
                  setNewSession({ ...newSession, sport: e.target.value })
                }
                placeholder="e.g., Football"
              />
            </div>
            <div>
              <Label>Duration (min) *</Label>
              <Input
                type="number"
                value={newSession.durationMins}
                onChange={(e) =>
                  setNewSession({
                    ...newSession,
                    durationMins: e.target.value,
                  })
                }
                placeholder="60"
              />
            </div>
            <div>
              <Label>Intensity RPE (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={newSession.intensityRpe}
                onChange={(e) =>
                  setNewSession({
                    ...newSession,
                    intensityRpe: e.target.value,
                  })
                }
                placeholder="7"
              />
            </div>
            <div>
              <Label>Calories Burned</Label>
              <Input
                type="number"
                value={newSession.caloriesBurned}
                onChange={(e) =>
                  setNewSession({
                    ...newSession,
                    caloriesBurned: e.target.value,
                  })
                }
                placeholder="500"
              />
            </div>
            <div>
              <Label>Distance (km)</Label>
              <Input
                type="number"
                step="0.1"
                value={newSession.distanceKm}
                onChange={(e) =>
                  setNewSession({
                    ...newSession,
                    distanceKm: e.target.value,
                  })
                }
                placeholder="5.0"
              />
            </div>
            <div>
              <Label>Avg Heart Rate</Label>
              <Input
                type="number"
                value={newSession.heartRateAvg}
                onChange={(e) =>
                  setNewSession({
                    ...newSession,
                    heartRateAvg: e.target.value,
                  })
                }
                placeholder="145"
              />
            </div>
            <div>
              <Label>Skill Accuracy (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newSession.skillAccuracy}
                onChange={(e) =>
                  setNewSession({
                    ...newSession,
                    skillAccuracy: e.target.value,
                  })
                }
                placeholder="85"
              />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Input
              value={newSession.notes}
              onChange={(e) =>
                setNewSession({ ...newSession, notes: e.target.value })
              }
              placeholder="Session details..."
            />
          </div>
          <Button
            onClick={addSession}
            disabled={submitting || !newSession.durationMins}
            className="bg-purple-600 hover:bg-purple-500 text-white"
          >
            {submitting && (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            )}
            Save Session
          </Button>
        </div>
      )}

      {/* Session History */}
      <h3 className="font-bold mb-4">Session History</h3>
      {sessions.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No sessions logged yet
          </h3>
          <p className="text-sm text-slate-500">
            Log your first training session to start tracking.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-800/60 bg-slate-900/40"
            >
              <div
                className={`p-2 rounded-lg ${
                  s.type === "Match"
                    ? "bg-amber-500/10 text-amber-400"
                    : s.type === "Recovery"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-purple-500/10 text-purple-400"
                }`}
              >
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {s.type}
                  {s.sport ? ` — ${s.sport}` : ""}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(s.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>{s.durationMins} min</span>
                {s.intensityRpe && <span>RPE {s.intensityRpe}</span>}
                {s.distanceKm && <span>{s.distanceKm} km</span>}
                {s.caloriesBurned && <span>{s.caloriesBurned} cal</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </FeatureLayout>
  );
}
