"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Clock,
  Globe,
  DollarSign,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  Edit,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Competition {
  id: string;
  title: string;
  description: string;
  sport: string;
  location: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  registrationDeadline: string;
  status: string;
  requirements: string | null;
  prizes: string | null;
  entryFee: number | null;
  contactEmail: string | null;
  website: string | null;
  createdAt: string;
  _count: { applications: number };
  organizer: { id: string; name: string; email: string; image: string | null };
  userApplication?: {
    id: string;
    status: string;
    message: string | null;
    createdAt: string;
  } | null;
}

export default function CompetitionDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchCompetition() {
      try {
        const res = await fetch(`/api/competitions/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setCompetition(data);
        } else if (res.status === 404) {
          router.push("/dashboard/competitions");
        }
      } catch (error) {
        console.error("Failed to fetch competition:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCompetition();
  }, [params.id, router]);

  const handleApply = async () => {
    if (!competition) return;
    setApplying(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitionId: competition.id,
          message: message || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Application submitted successfully!");
        setShowApplyForm(false);
        setCompetition({
          ...competition,
          userApplication: data.application,
          _count: {
            ...competition._count,
            applications: competition._count.applications + 1,
          },
        });
      } else {
        toast.error(data.error || "Failed to apply");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async () => {
    if (!competition || !confirm("Are you sure you want to delete this competition? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/competitions/${competition.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Competition deleted");
        router.push("/dashboard/competitions");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="text-center py-16">
        <Trophy className="h-12 w-12 mx-auto text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-300">Competition not found</h3>
      </div>
    );
  }

  const isOwner = session?.user?.id === competition.organizer.id;
  const isAthlete = session?.user?.role === "ATHLETE";
  const deadlinePassed = new Date(competition.registrationDeadline) < new Date();
  const isFull = competition._count.applications >= competition.maxParticipants;
  const canApply = isAthlete && !competition.userApplication && !deadlinePassed && !isFull;

  const statusColor = {
    PENDING: "text-yellow-400 bg-yellow-400/10",
    APPROVED: "text-green-400 bg-green-400/10",
    REJECTED: "text-red-400 bg-red-400/10",
    WITHDRAWN: "text-slate-400 bg-slate-400/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back to competitions</span>
      </button>

      {/* Main Info */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge
                  variant={
                    competition.status === "OPEN"
                      ? "default"
                      : competition.status === "UPCOMING"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {competition.status}
                </Badge>
                {deadlinePassed && (
                  <Badge variant="destructive">Registration Closed</Badge>
                )}
                {isFull && <Badge variant="destructive">Full</Badge>}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {competition.title}
              </h1>
            </div>
            {isOwner && (
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/dashboard/competitions/${competition.id}/edit`)
                  }
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Delete
                </Button>
              </div>
            )}
          </div>

          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {competition.description}
          </p>

          <Separator className="my-6" />

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Sport</p>
                <p className="text-sm font-medium text-white">{competition.sport}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm font-medium text-white">{competition.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Dates</p>
                <p className="text-sm font-medium text-white">
                  {new Date(competition.startDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(competition.endDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Registration Deadline</p>
                <p className="text-sm font-medium text-white">
                  {new Date(competition.registrationDeadline).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" }
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Participants</p>
                <p className="text-sm font-medium text-white">
                  {competition._count.applications} / {competition.maxParticipants}
                </p>
              </div>
            </div>
            {competition.entryFee !== null && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Entry Fee</p>
                  <p className="text-sm font-medium text-white">
                    {competition.entryFee === 0
                      ? "Free"
                      : `$${competition.entryFee.toFixed(2)}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requirements & Prizes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competition.requirements && (
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-base">Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {competition.requirements}
              </p>
            </CardContent>
          </Card>
        )}
        {competition.prizes && (
          <Card className="border-slate-800 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-base">Prizes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">
                {competition.prizes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contact Info */}
      {(competition.contactEmail || competition.website) && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {competition.contactEmail && (
              <p className="text-sm text-slate-300">
                Email:{" "}
                <a
                  href={`mailto:${competition.contactEmail}`}
                  className="text-indigo-400 hover:underline"
                >
                  {competition.contactEmail}
                </a>
              </p>
            )}
            {competition.website && (
              <p className="text-sm text-slate-300 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <a
                  href={competition.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline"
                >
                  {competition.website}
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Organizer Info */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-medium">
            {competition.organizer.name?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-xs text-slate-500">Organized by</p>
            <p className="text-sm font-medium text-white">
              {competition.organizer.name}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Application Status / Apply */}
      {isAthlete && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-6">
            {competition.userApplication ? (
              <div className="flex items-center gap-4">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    statusColor[competition.userApplication.status as keyof typeof statusColor] || statusColor.PENDING
                  }`}
                >
                  {competition.userApplication.status === "APPROVED" ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : competition.userApplication.status === "REJECTED" ? (
                    <XCircle className="h-6 w-6" />
                  ) : (
                    <Clock className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-white">
                    Application {competition.userApplication.status.toLowerCase()}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Submitted on{" "}
                    {new Date(
                      competition.userApplication.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ) : showApplyForm ? (
              <div className="space-y-4">
                <h3 className="font-medium text-white">Apply to this competition</h3>
                <Textarea
                  placeholder="Add a message (optional) — tell the organizer why you're a great fit..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={handleApply} disabled={applying}>
                    {applying ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Submit Application
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowApplyForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Interested?</h3>
                  <p className="text-sm text-slate-400">
                    {canApply
                      ? "Apply now to secure your spot"
                      : deadlinePassed
                      ? "Registration deadline has passed"
                      : isFull
                      ? "This competition is full"
                      : ""}
                  </p>
                </div>
                <Button
                  onClick={() => setShowApplyForm(true)}
                  disabled={!canApply}
                >
                  Apply Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
