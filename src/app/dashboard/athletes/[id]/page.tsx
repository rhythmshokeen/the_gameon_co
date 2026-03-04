"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Trophy,
  Briefcase,
  Clock,
  BarChart3,
  Star,
  Video,
  Camera,
  UserPlus,
  UserCheck,
  Loader2,
  Calendar,
  Ruler,
  Weight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface AthleteProfile {
  profile: {
    id: string;
    sport: string;
    position: string | null;
    bio: string | null;
    dateOfBirth: string | null;
    height: number | null;
    weight: number | null;
    experience: number | null;
    location: string | null;
    verificationStatus: string;
    user: { id: string; name: string; email: string; image: string | null; createdAt: string };
    performanceStats: Array<{
      id: string;
      statName: string;
      statValue: string;
      unit: string | null;
    }>;
    achievements: Array<{
      id: string;
      title: string;
      description: string | null;
      dateAchieved: string | null;
      category: string | null;
    }>;
    mediaHighlights: Array<{
      id: string;
      title: string;
      url: string;
      type: string;
      description: string | null;
    }>;
  };
  connectionStatus: {
    id: string;
    status: string;
    isSender: boolean;
  } | null;
}

export default function AthleteDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    async function fetchAthlete() {
      try {
        const res = await fetch(`/api/athletes/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch athlete:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAthlete();
  }, [params.id]);

  const handleConnect = async () => {
    if (!data) return;
    setConnecting(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: data.profile.user.id,
          message: "I'd like to connect!",
        }),
      });
      if (res.ok) {
        toast.success("Connection request sent!");
        const json = await res.json();
        setData({
          ...data,
          connectionStatus: {
            id: json.connection.id,
            status: "PENDING",
            isSender: true,
          },
        });
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to connect");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <Trophy className="h-12 w-12 mx-auto text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-300">Athlete not found</h3>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          Go back
        </Button>
      </div>
    );
  }

  const { profile, connectionStatus } = data;
  const isOwn = session?.user?.id === profile.user.id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back</span>
      </button>

      {/* Profile Header */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-3xl shrink-0">
              {profile.user.image ? (
                <img
                  src={profile.user.image}
                  alt={profile.user.name}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                profile.user.name?.[0]?.toUpperCase() || "?"
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">
                  {profile.user.name}
                </h1>
                {profile.verificationStatus === "VERIFIED" && (
                  <Badge variant="default">Verified</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline">{profile.sport}</Badge>
                {profile.position && (
                  <Badge variant="secondary">{profile.position}</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </span>
                )}
                {profile.experience && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {profile.experience} yrs experience
                  </span>
                )}
                {profile.height && (
                  <span className="flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5" />
                    {profile.height} cm
                  </span>
                )}
                {profile.weight && (
                  <span className="flex items-center gap-1">
                    <Weight className="h-3.5 w-3.5" />
                    {profile.weight} kg
                  </span>
                )}
                {profile.dateOfBirth && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>

            {!isOwn && (
              <div className="shrink-0">
                {connectionStatus?.status === "ACCEPTED" ? (
                  <Button variant="outline" disabled>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Connected
                  </Button>
                ) : connectionStatus?.status === "PENDING" ? (
                  <Button variant="outline" disabled>
                    <Clock className="h-4 w-4 mr-2" />
                    Pending
                  </Button>
                ) : (
                  <Button onClick={handleConnect} disabled={connecting}>
                    {connecting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Connect
                  </Button>
                )}
              </div>
            )}
          </div>

          {profile.bio && (
            <>
              <Separator className="my-6" />
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Performance Stats */}
      {profile.performanceStats.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              Performance Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {profile.performanceStats.map((stat) => (
                <div
                  key={stat.id}
                  className="p-3 border border-slate-800 rounded-lg bg-slate-950/50 text-center"
                >
                  <p className="text-xs text-slate-500 mb-1">{stat.statName}</p>
                  <p className="text-xl font-bold text-white">
                    {stat.statValue}
                    {stat.unit && (
                      <span className="text-xs text-slate-400 ml-1">{stat.unit}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {profile.achievements.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-indigo-400" />
              Achievements ({profile.achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {profile.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-start gap-3 p-3 border border-slate-800 rounded-lg bg-slate-950/50"
                >
                  <Trophy className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-white">{ach.title}</p>
                    {ach.description && (
                      <p className="text-sm text-slate-400 mt-0.5">
                        {ach.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-1">
                      {ach.category && (
                        <Badge variant="outline" className="text-xs">
                          {ach.category}
                        </Badge>
                      )}
                      {ach.dateAchieved && (
                        <span className="text-xs text-slate-500">
                          {new Date(ach.dateAchieved).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media */}
      {profile.mediaHighlights.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="h-4 w-4 text-indigo-400" />
              Media Highlights ({profile.mediaHighlights.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.mediaHighlights.map((media) => (
                <a
                  key={media.id}
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 border border-slate-800 rounded-lg bg-slate-950/50 flex items-start gap-3 hover:border-indigo-500/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded bg-indigo-500/10 flex items-center justify-center shrink-0">
                    {media.type === "VIDEO" ? (
                      <Video className="h-5 w-5 text-indigo-400" />
                    ) : media.type === "IMAGE" ? (
                      <Camera className="h-5 w-5 text-indigo-400" />
                    ) : (
                      <Star className="h-5 w-5 text-indigo-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{media.title}</p>
                    {media.description && (
                      <p className="text-xs text-slate-500 truncate">
                        {media.description}
                      </p>
                    )}
                    <span className="text-xs text-indigo-400">View →</span>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Member Since */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="p-4 text-center">
          <p className="text-xs text-slate-500">
            Member since{" "}
            {new Date(profile.user.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
