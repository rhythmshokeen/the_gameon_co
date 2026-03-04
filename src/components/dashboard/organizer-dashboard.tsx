import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  PlusCircle,
  FileText,
  BarChart3,
  ArrowRight,
  Calendar,
  Users,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface OrganizerDashboardProps {
  userId: string;
}

export async function OrganizerDashboard({ userId }: OrganizerDashboardProps) {
  const [competitions, totalApps, recentApps] = await Promise.all([
    prisma.competition.findMany({
      where: { organizerId: userId },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }) as any,
    prisma.application.count({
      where: { competition: { organizerId: userId } },
    }),
    prisma.application.findMany({
      where: { competition: { organizerId: userId } },
      include: {
        athlete: { include: { user: true } },
        competition: true,
      },
      orderBy: { appliedAt: "desc" },
      take: 5,
    }) as any,
  ]);

  const totalComps = await prisma.competition.count({
    where: { organizerId: userId },
  });

  const verifiedComps = await prisma.competition.count({
    where: { organizerId: userId, verificationStatus: "VERIFIED" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizer Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your competitions and review applications
          </p>
        </div>
        <Link href="/dashboard/competitions/create">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Competition
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Competitions</p>
                <p className="text-2xl font-bold mt-1">{totalComps}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Verified</p>
                <p className="text-2xl font-bold mt-1">{verifiedComps}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Applications</p>
                <p className="text-2xl font-bold mt-1">{totalApps}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Apps/Comp</p>
                <p className="text-2xl font-bold mt-1">
                  {totalComps > 0 ? Math.round(totalApps / totalComps) : 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Competitions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">My Competitions</CardTitle>
            <Link href="/dashboard/competitions">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {competitions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No competitions yet.{" "}
                <Link href="/dashboard/competitions/create" className="text-indigo-400">
                  Create your first
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {competitions.map((comp: any) => (
                  <Link
                    key={comp.id}
                    href={`/dashboard/competitions/${comp.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{comp.title}</p>
                        <Badge
                          variant={
                            comp.verificationStatus === "VERIFIED"
                              ? "success"
                              : comp.verificationStatus === "REJECTED"
                              ? "destructive"
                              : "warning"
                          }
                          className="text-[10px]"
                        >
                          {comp.verificationStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(comp.startDate)}
                        <span>•</span>
                        <span>{comp._count.applications} applicants</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
            {recentApps.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                No applications received yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentApps.map((app: any) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-800"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {app.athlete.user.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Applied to {app.competition.title}
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
      </div>
    </div>
  );
}
