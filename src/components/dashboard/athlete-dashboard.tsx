import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  FileText,
  BarChart3,
  Target,
  ArrowRight,
  Calendar,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { formatDate, calculateProfileCompletion } from "@/lib/utils";

interface AthleteDashboardProps {
  userId: string;
}

export async function AthleteDashboard({ userId }: AthleteDashboardProps) {
  // Fetch all athlete data in parallel
  const [profile, applications, upcomingComps, stats] = await Promise.all([
    prisma.athleteProfile.findUnique({
      where: { userId },
      include: {
        performanceStats: { orderBy: { recordedAt: "desc" }, take: 5 },
        achievements: { orderBy: { createdAt: "desc" }, take: 3 },
      },
    }) as any,
    prisma.application.findMany({
      where: { athlete: { userId } },
      include: { competition: true },
      orderBy: { appliedAt: "desc" },
      take: 5,
    }) as any,
    prisma.competition.findMany({
      where: {
        startDate: { gte: new Date() },
        verificationStatus: "VERIFIED",
      },
      orderBy: { startDate: "asc" },
      take: 5,
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: { athlete: { userId } },
      _count: { status: true },
    }) as any,
  ]);

  const profileCompletion = profile
    ? calculateProfileCompletion(profile as unknown as Record<string, unknown>)
    : 0;

  const statusCounts: Record<string, number> = {};
  stats.forEach((s: { status: string; _count: { status: number } }) => {
    statusCounts[s.status] = s._count.status;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Athlete Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Track your progress and discover new opportunities
        </p>
      </div>

      {/* Profile Completion */}
      {profileCompletion < 100 && (
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm">Complete Your Profile</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  A complete profile helps coaches find you
                </p>
              </div>
              <span className="text-2xl font-bold text-indigo-400">
                {profileCompletion}%
              </span>
            </div>
            <Progress value={profileCompletion} />
            <Link href="/dashboard/profile">
              <Button size="sm" className="mt-4">
                Complete Profile <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Applications</p>
                <p className="text-2xl font-bold mt-1">{applications.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Accepted</p>
                <p className="text-2xl font-bold mt-1">
                  {statusCounts["ACCEPTED"] || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending</p>
                <p className="text-2xl font-bold mt-1">
                  {(statusCounts["APPLIED"] || 0) + (statusCounts["PENDING"] || 0)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Performance Metrics</p>
                <p className="text-2xl font-bold mt-1">
                  {profile?.performanceStats.length || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Applications</CardTitle>
            <Link href="/dashboard/applications">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No applications yet.{" "}
                <Link href="/dashboard/competitions" className="text-indigo-400">
                  Browse competitions
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app: any) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {app.competition.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        Applied {formatDate(app.appliedAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        app.status === "ACCEPTED"
                          ? "success"
                          : app.status === "REJECTED"
                          ? "destructive"
                          : "warning"
                      }
                    >
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Competitions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Suggested Competitions</CardTitle>
            <Link href="/dashboard/competitions">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingComps.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No upcoming competitions available
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingComps.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/dashboard/competitions/${comp.id}`}
                    className="flex items-start justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {comp.title}
                        </p>
                        {comp.verificationStatus === "VERIFIED" && (
                          <Badge variant="success" className="text-[10px]">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(comp.startDate)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          {comp.location}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary">{comp.sport}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
