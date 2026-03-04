"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FeatureLayout } from "@/components/feature-layout";
import {
  HeartPulse,
  Plus,
  Loader2,
  AlertTriangle,
  Activity,
  Moon,
  Zap,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface InjuryRecord {
  id: string;
  bodyPart: string;
  description: string | null;
  severity: string;
  status: string;
  occurredAt: string;
  recoveredAt: string | null;
}

interface RecoveryLog {
  id: string;
  date: string;
  sleepHours: number | null;
  sleepQuality: number | null;
  stressLevel: number | null;
  muscleSoreness: number | null;
  energyLevel: number | null;
  trainingLoad: number | null;
  notes: string | null;
}

export default function RecoverPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"overview" | "injuries" | "log">("overview");
  const [injuries, setInjuries] = useState<InjuryRecord[]>([]);
  const [logs, setLogs] = useState<RecoveryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddInjury, setShowAddInjury] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newInjury, setNewInjury] = useState({
    bodyPart: "",
    description: "",
    severity: "MINOR",
  });

  const [newLog, setNewLog] = useState({
    sleepHours: "",
    sleepQuality: "",
    stressLevel: "",
    muscleSoreness: "",
    energyLevel: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [injRes, logRes] = await Promise.all([
        fetch("/api/recover/injuries"),
        fetch("/api/recover/logs"),
      ]);
      if (injRes.ok) setInjuries(await injRes.json());
      if (logRes.ok) setLogs(await logRes.json());
    } catch {
      toast.error("Failed to load recovery data");
    } finally {
      setLoading(false);
    }
  };

  const addInjury = async () => {
    if (!newInjury.bodyPart) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/recover/injuries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInjury),
      });
      if (res.ok) {
        toast.success("Injury recorded");
        setShowAddInjury(false);
        setNewInjury({ bodyPart: "", description: "", severity: "MINOR" });
        fetchData();
      }
    } catch {
      toast.error("Failed to record injury");
    } finally {
      setSubmitting(false);
    }
  };

  const addLog = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/recover/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sleepHours: newLog.sleepHours ? parseFloat(newLog.sleepHours) : null,
          sleepQuality: newLog.sleepQuality ? parseInt(newLog.sleepQuality) : null,
          stressLevel: newLog.stressLevel ? parseInt(newLog.stressLevel) : null,
          muscleSoreness: newLog.muscleSoreness ? parseInt(newLog.muscleSoreness) : null,
          energyLevel: newLog.energyLevel ? parseInt(newLog.energyLevel) : null,
          notes: newLog.notes || null,
        }),
      });
      if (res.ok) {
        toast.success("Recovery log saved");
        setShowAddLog(false);
        setNewLog({
          sleepHours: "",
          sleepQuality: "",
          stressLevel: "",
          muscleSoreness: "",
          energyLevel: "",
          notes: "",
        });
        fetchData();
      }
    } catch {
      toast.error("Failed to save log");
    } finally {
      setSubmitting(false);
    }
  };

  const activeInjuries = injuries.filter((i) => i.status === "ACTIVE");
  const recentLogs = logs.slice(0, 7);

  const avgSleep =
    recentLogs.length > 0
      ? (
          recentLogs.reduce((s, l) => s + (l.sleepHours || 0), 0) /
          recentLogs.filter((l) => l.sleepHours).length
        ).toFixed(1)
      : "—";

  const avgEnergy =
    recentLogs.length > 0
      ? (
          recentLogs.reduce((s, l) => s + (l.energyLevel || 0), 0) /
          recentLogs.filter((l) => l.energyLevel).length
        ).toFixed(1)
      : "—";

  const avgSoreness =
    recentLogs.length > 0
      ? (
          recentLogs.reduce((s, l) => s + (l.muscleSoreness || 0), 0) /
          recentLogs.filter((l) => l.muscleSoreness).length
        ).toFixed(1)
      : "—";

  return (
    <FeatureLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <HeartPulse className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">RECOVER</h1>
        </div>
        <p className="text-slate-400">
          Track injuries, monitor recovery metrics, and manage training load.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6">
        {(["overview", "injuries", "log"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t === "log" ? "Daily Log" : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/40">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Active Injuries
                  </div>
                  <p className="text-2xl font-bold">{activeInjuries.length}</p>
                </div>
                <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/40">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                    <Moon className="w-3.5 h-3.5" />
                    Avg Sleep (hrs)
                  </div>
                  <p className="text-2xl font-bold">{avgSleep}</p>
                </div>
                <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/40">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                    <Zap className="w-3.5 h-3.5" />
                    Avg Energy
                  </div>
                  <p className="text-2xl font-bold">{avgEnergy}/10</p>
                </div>
                <div className="p-5 rounded-2xl border border-slate-800/60 bg-slate-900/40">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                    <Activity className="w-3.5 h-3.5" />
                    Avg Soreness
                  </div>
                  <p className="text-2xl font-bold">{avgSoreness}/10</p>
                </div>
              </div>

              {/* Recent Log Entries */}
              <div>
                <h3 className="font-bold mb-3">Recent Recovery Logs</h3>
                {recentLogs.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No logs yet. Start tracking your daily recovery.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-slate-800/60 bg-slate-900/40 text-sm"
                      >
                        <span className="text-xs text-slate-500 w-24">
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-4 flex-1 text-xs text-slate-400">
                          {log.sleepHours && (
                            <span>💤 {log.sleepHours}h</span>
                          )}
                          {log.energyLevel && (
                            <span>⚡ {log.energyLevel}/10</span>
                          )}
                          {log.muscleSoreness && (
                            <span>💪 {log.muscleSoreness}/10</span>
                          )}
                          {log.stressLevel && (
                            <span>🧠 {log.stressLevel}/10</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Injuries Tab */}
          {tab === "injuries" && (
            <div>
              <Button
                size="sm"
                onClick={() => setShowAddInjury(!showAddInjury)}
                className="mb-6 bg-rose-600 hover:bg-rose-500 text-white"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Log Injury
              </Button>

              {showAddInjury && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 mb-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Body Part *</Label>
                      <Input
                        value={newInjury.bodyPart}
                        onChange={(e) =>
                          setNewInjury({ ...newInjury, bodyPart: e.target.value })
                        }
                        placeholder="e.g., Left Knee"
                      />
                    </div>
                    <div>
                      <Label>Severity</Label>
                      <select
                        value={newInjury.severity}
                        onChange={(e) =>
                          setNewInjury({ ...newInjury, severity: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-sm text-white"
                      >
                        <option value="MINOR">Minor</option>
                        <option value="MODERATE">Moderate</option>
                        <option value="SEVERE">Severe</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={newInjury.description}
                      onChange={(e) =>
                        setNewInjury({
                          ...newInjury,
                          description: e.target.value,
                        })
                      }
                      placeholder="What happened?"
                    />
                  </div>
                  <Button
                    onClick={addInjury}
                    disabled={submitting || !newInjury.bodyPart}
                    className="bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    {submitting && (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    )}
                    Save Injury
                  </Button>
                </div>
              )}

              {injuries.length === 0 ? (
                <div className="text-center py-16">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No injuries recorded
                  </h3>
                  <p className="text-sm text-slate-500">Stay healthy! 💪</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {injuries.map((injury) => (
                    <div
                      key={injury.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border ${
                        injury.status === "ACTIVE"
                          ? "border-rose-500/20 bg-rose-500/5"
                          : injury.status === "RECOVERING"
                          ? "border-amber-500/20 bg-amber-500/5"
                          : "border-emerald-500/20 bg-emerald-500/5"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          injury.status === "ACTIVE"
                            ? "bg-rose-500/10 text-rose-400"
                            : injury.status === "RECOVERING"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {injury.status === "ACTIVE" ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : injury.status === "RECOVERING" ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{injury.bodyPart}</p>
                        <p className="text-xs text-slate-400">
                          {injury.severity} · Since{" "}
                          {new Date(injury.occurredAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          injury.status === "ACTIVE"
                            ? "bg-rose-500/10 text-rose-400"
                            : injury.status === "RECOVERING"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {injury.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Daily Log Tab */}
          {tab === "log" && (
            <div>
              <Button
                size="sm"
                onClick={() => setShowAddLog(!showAddLog)}
                className="mb-6 bg-rose-600 hover:bg-rose-500 text-white"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                New Entry
              </Button>

              {showAddLog && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 mb-6 space-y-4">
                  <h3 className="font-bold">Today&apos;s Recovery Check-In</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Sleep Hours</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={newLog.sleepHours}
                        onChange={(e) =>
                          setNewLog({ ...newLog, sleepHours: e.target.value })
                        }
                        placeholder="7.5"
                      />
                    </div>
                    <div>
                      <Label>Sleep Quality (1-10)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={newLog.sleepQuality}
                        onChange={(e) =>
                          setNewLog({ ...newLog, sleepQuality: e.target.value })
                        }
                        placeholder="8"
                      />
                    </div>
                    <div>
                      <Label>Stress Level (1-10)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={newLog.stressLevel}
                        onChange={(e) =>
                          setNewLog({ ...newLog, stressLevel: e.target.value })
                        }
                        placeholder="3"
                      />
                    </div>
                    <div>
                      <Label>Muscle Soreness (1-10)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={newLog.muscleSoreness}
                        onChange={(e) =>
                          setNewLog({
                            ...newLog,
                            muscleSoreness: e.target.value,
                          })
                        }
                        placeholder="4"
                      />
                    </div>
                    <div>
                      <Label>Energy Level (1-10)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={newLog.energyLevel}
                        onChange={(e) =>
                          setNewLog({ ...newLog, energyLevel: e.target.value })
                        }
                        placeholder="7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input
                      value={newLog.notes}
                      onChange={(e) =>
                        setNewLog({ ...newLog, notes: e.target.value })
                      }
                      placeholder="How are you feeling?"
                    />
                  </div>
                  <Button
                    onClick={addLog}
                    disabled={submitting}
                    className="bg-rose-600 hover:bg-rose-500 text-white"
                  >
                    {submitting && (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    )}
                    Save Entry
                  </Button>
                </div>
              )}

              {logs.length === 0 ? (
                <div className="text-center py-16">
                  <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No recovery logs yet
                  </h3>
                  <p className="text-sm text-slate-500">
                    Start tracking your daily recovery metrics.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl border border-slate-800/60 bg-slate-900/40"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {new Date(log.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-xs text-slate-400">
                        {log.sleepHours != null && (
                          <div>
                            <span className="block text-slate-600">Sleep</span>
                            {log.sleepHours}h
                          </div>
                        )}
                        {log.sleepQuality != null && (
                          <div>
                            <span className="block text-slate-600">Quality</span>
                            {log.sleepQuality}/10
                          </div>
                        )}
                        {log.stressLevel != null && (
                          <div>
                            <span className="block text-slate-600">Stress</span>
                            {log.stressLevel}/10
                          </div>
                        )}
                        {log.muscleSoreness != null && (
                          <div>
                            <span className="block text-slate-600">Soreness</span>
                            {log.muscleSoreness}/10
                          </div>
                        )}
                        {log.energyLevel != null && (
                          <div>
                            <span className="block text-slate-600">Energy</span>
                            {log.energyLevel}/10
                          </div>
                        )}
                      </div>
                      {log.notes && (
                        <p className="mt-2 text-xs text-slate-500">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </FeatureLayout>
  );
}
