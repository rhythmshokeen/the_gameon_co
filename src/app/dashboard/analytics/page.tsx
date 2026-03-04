"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Trophy,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
  totalCompetitions: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalConnections: number;
  recentActivity: Array<{
    id: string;
    action: string;
    details: string | null;
    createdAt: string;
  }>;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const isOrganizer = session?.user?.role === "ORGANIZER";
  const isAthlete = session?.user?.role === "ATHLETE";

  const stats = [
    {
      label: isOrganizer ? "My Competitions" : "Applications",
      value: isOrganizer
        ? analytics?.totalCompetitions || 0
        : analytics?.totalApplications || 0,
      icon: isOrganizer ? Trophy : FileText,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
    },
    {
      label: "Pending",
      value: analytics?.pendingApplications || 0,
      icon: Calendar,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Approved",
      value: analytics?.approvedApplications || 0,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Connections",
      value: analytics?.totalConnections || 0,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
  ];

  const approvalRate =
    analytics && analytics.totalApplications > 0
      ? Math.round(
          (analytics.approvedApplications / analytics.totalApplications) * 100
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">
          Track your performance and activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              Application Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Total Applications</span>
                <span className="text-sm font-medium text-white">
                  {analytics?.totalApplications || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Approval Rate</span>
                <span
                  className={`text-sm font-medium flex items-center gap-1 ${
                    approvalRate >= 50 ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {approvalRate >= 50 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {approvalRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Rejected</span>
                <span className="text-sm font-medium text-red-400">
                  {analytics?.rejectedApplications || 0}
                </span>
              </div>

              {/* Visual Bar */}
              <div className="pt-2">
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  {analytics && analytics.totalApplications > 0 && (
                    <>
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{
                          width: `${
                            (analytics.approvedApplications /
                              analytics.totalApplications) *
                            100
                          }%`,
                        }}
                      />
                      <div
                        className="h-full bg-yellow-500 transition-all"
                        style={{
                          width: `${
                            (analytics.pendingApplications /
                              analytics.totalApplications) *
                            100
                          }%`,
                        }}
                      />
                      <div
                        className="h-full bg-red-500 transition-all"
                        style={{
                          width: `${
                            (analytics.rejectedApplications /
                              analytics.totalApplications) *
                            100
                          }%`,
                        }}
                      />
                    </>
                  )}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Approved
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    Pending
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Rejected
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isAthlete && (
                <>
                  <div className="p-3 border border-slate-800 rounded-lg bg-slate-950/50">
                    <p className="text-sm text-slate-300">
                      You have{" "}
                      <span className="text-indigo-400 font-medium">
                        {analytics?.pendingApplications || 0}
                      </span>{" "}
                      pending applications waiting for review.
                    </p>
                  </div>
                  <div className="p-3 border border-slate-800 rounded-lg bg-slate-950/50">
                    <p className="text-sm text-slate-300">
                      Your approval rate is{" "}
                      <span
                        className={`font-medium ${
                          approvalRate >= 50
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {approvalRate}%
                      </span>
                      {approvalRate >= 70
                        ? " — Great job! Keep applying."
                        : approvalRate >= 40
                        ? " — Good, keep improving your profile!"
                        : " — Consider enhancing your profile for better results."}
                    </p>
                  </div>
                </>
              )}
              {isOrganizer && (
                <>
                  <div className="p-3 border border-slate-800 rounded-lg bg-slate-950/50">
                    <p className="text-sm text-slate-300">
                      You have{" "}
                      <span className="text-indigo-400 font-medium">
                        {analytics?.totalCompetitions || 0}
                      </span>{" "}
                      active competitions with{" "}
                      <span className="text-yellow-400 font-medium">
                        {analytics?.pendingApplications || 0}
                      </span>{" "}
                      pending applications to review.
                    </p>
                  </div>
                  <div className="p-3 border border-slate-800 rounded-lg bg-slate-950/50">
                    <p className="text-sm text-slate-300">
                      Total applicants:{" "}
                      <span className="text-white font-medium">
                        {analytics?.totalApplications || 0}
                      </span>
                    </p>
                  </div>
                </>
              )}
              <div className="p-3 border border-slate-800 rounded-lg bg-slate-950/50">
                <p className="text-sm text-slate-300">
                  You have{" "}
                  <span className="text-blue-400 font-medium">
                    {analytics?.totalConnections || 0}
                  </span>{" "}
                  connections in your network.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {analytics?.recentActivity && analytics.recentActivity.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border border-slate-800 rounded-lg bg-slate-950/50"
                >
                  <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">{activity.action}</p>
                    {activity.details && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activity.details}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 mt-1">
                      {new Date(activity.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
