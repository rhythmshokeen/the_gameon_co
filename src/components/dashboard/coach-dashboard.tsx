import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Search,
  ArrowRight,
  UserCheck,
  UserPlus,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

interface CoachDashboardProps {
  userId: string;
}

export async function CoachDashboard({ userId }: CoachDashboardProps) {
  const [connections, recentAthletes, pendingConnections] = await Promise.all([
    prisma.connection.count({
      where: {
        OR: [
          { senderId: userId, status: "ACCEPTED" },
          { receiverId: userId, status: "ACCEPTED" },
        ],
      },
    }),
    prisma.athleteProfile.findMany({
      include: { user: true },
      orderBy: { user: { createdAt: "desc" } },
      take: 6,
    }) as any,
    prisma.connection.count({
      where: { receiverId: userId, status: "PENDING" },
    }),
  ]);

  const sentConnectionsCount = await prisma.connection.count({
    where: { senderId: userId },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Coach Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Discover and connect with top athletes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Connections</p>
                <p className="text-2xl font-bold mt-1">{connections}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending Requests</p>
                <p className="text-2xl font-bold mt-1">{pendingConnections}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Sent Requests</p>
                <p className="text-2xl font-bold mt-1">{sentConnectionsCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/dashboard/discover">
          <Card className="hover:border-indigo-500/30 transition-all cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold">Discover Athletes</h3>
                <p className="text-sm text-slate-400">
                  Search and filter athletes by sport, position, and experience
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/connections">
          <Card className="hover:border-indigo-500/30 transition-all cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Manage Connections</h3>
                <p className="text-sm text-slate-400">
                  View and manage your athlete connections
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Athletes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Athletes</CardTitle>
          <Link href="/dashboard/discover">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentAthletes.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No athletes registered yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAthletes.map((athlete: any) => (
                <Link
                  key={athlete.id}
                  href={`/dashboard/athletes/${athlete.userId}`}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-800/20 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(athlete.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {athlete.user.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {athlete.sport || "Sport not set"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {athlete.position && (
                      <Badge variant="secondary" className="text-[10px]">
                        {athlete.position}
                      </Badge>
                    )}
                    {athlete.experienceYears && (
                      <Badge variant="outline" className="text-[10px]">
                        {athlete.experienceYears}yr exp
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
