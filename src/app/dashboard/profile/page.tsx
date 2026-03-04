"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User,
  Camera,
  Save,
  Plus,
  Trash2,
  Trophy,
  BarChart3,
  Star,
  Video,
  Loader2,
  Edit2,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Profile {
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
    recordedAt: string;
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
}

const SPORTS = [
  "Football", "Basketball", "Cricket", "Tennis", "Swimming",
  "Athletics", "Badminton", "Hockey", "Volleyball", "Boxing",
  "Wrestling", "Martial Arts", "Other",
];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state
  const [form, setForm] = useState({
    sport: "",
    position: "",
    bio: "",
    dateOfBirth: "",
    height: "",
    weight: "",
    experience: "",
    location: "",
  });

  // New stat form
  const [newStat, setNewStat] = useState({ statName: "", statValue: "", unit: "" });
  const [addingStat, setAddingStat] = useState(false);

  // New achievement form
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    description: "",
    dateAchieved: "",
    category: "",
  });
  const [addingAchievement, setAddingAchievement] = useState(false);

  // New media form
  const [newMedia, setNewMedia] = useState({
    title: "",
    url: "",
    type: "VIDEO" as string,
    description: "",
  });
  const [addingMedia, setAddingMedia] = useState(false);

  const [showStatForm, setShowStatForm] = useState(false);
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [showMediaForm, setShowMediaForm] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        if (data.profile) {
          setForm({
            sport: data.profile.sport || "",
            position: data.profile.position || "",
            bio: data.profile.bio || "",
            dateOfBirth: data.profile.dateOfBirth
              ? new Date(data.profile.dateOfBirth).toISOString().split("T")[0]
              : "",
            height: data.profile.height?.toString() || "",
            weight: data.profile.weight?.toString() || "",
            experience: data.profile.experience?.toString() || "",
            location: data.profile.location || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport: form.sport,
          position: form.position || undefined,
          bio: form.bio || undefined,
          dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined,
          height: form.height ? parseFloat(form.height) : undefined,
          weight: form.weight ? parseFloat(form.weight) : undefined,
          experience: form.experience ? parseInt(form.experience) : undefined,
          location: form.location || undefined,
        }),
      });
      if (res.ok) {
        toast.success("Profile updated!");
        setEditing(false);
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleAddStat = async () => {
    if (!newStat.statName || !newStat.statValue) return;
    setAddingStat(true);
    try {
      const res = await fetch("/api/profile/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStat),
      });
      if (res.ok) {
        toast.success("Stat added!");
        setNewStat({ statName: "", statValue: "", unit: "" });
        setShowStatForm(false);
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add stat");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAddingStat(false);
    }
  };

  const handleDeleteStat = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/stats?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Stat removed");
        fetchProfile();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleAddAchievement = async () => {
    if (!newAchievement.title) return;
    setAddingAchievement(true);
    try {
      const res = await fetch("/api/profile/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAchievement,
          dateAchieved: newAchievement.dateAchieved
            ? new Date(newAchievement.dateAchieved).toISOString()
            : undefined,
        }),
      });
      if (res.ok) {
        toast.success("Achievement added!");
        setNewAchievement({ title: "", description: "", dateAchieved: "", category: "" });
        setShowAchievementForm(false);
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add achievement");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAddingAchievement(false);
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/achievements?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Achievement removed");
        fetchProfile();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleAddMedia = async () => {
    if (!newMedia.title || !newMedia.url) return;
    setAddingMedia(true);
    try {
      const res = await fetch("/api/profile/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMedia),
      });
      if (res.ok) {
        toast.success("Media added!");
        setNewMedia({ title: "", url: "", type: "VIDEO", description: "" });
        setShowMediaForm(false);
        fetchProfile();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add media");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAddingMedia(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      const res = await fetch(`/api/profile/media?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Media removed");
        fetchProfile();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    const total = 8;
    if (profile.sport) score++;
    if (profile.position) score++;
    if (profile.bio) score++;
    if (profile.dateOfBirth) score++;
    if (profile.location) score++;
    if (profile.performanceStats.length > 0) score++;
    if (profile.achievements.length > 0) score++;
    if (profile.mediaHighlights.length > 0) score++;
    return Math.round((score / total) * 100);
  };

  if (session?.user?.role !== "ATHLETE") {
    return (
      <div className="text-center py-16">
        <User className="h-12 w-12 mx-auto text-slate-600 mb-4" />
        <h3 className="text-lg font-medium text-slate-300">
          Athlete profile is only available for athletes
        </h3>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const completion = calculateCompletion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-slate-400 mt-1">
            Manage your athlete profile and showcase your talents.
          </p>
        </div>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Profile Completion */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-300">Profile Completion</h3>
            <span className="text-sm font-medium text-indigo-400">{completion}%</span>
          </div>
          <Progress value={completion} className="h-2" />
          {completion < 100 && (
            <p className="text-xs text-slate-500 mt-2">
              Complete your profile to get discovered by coaches and scouts.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-400" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sport *</Label>
                  <select
                    value={form.sport}
                    onChange={(e) => setForm({ ...form, sport: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select sport</option>
                    {SPORTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    placeholder="e.g., Forward, Goalkeeper"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell coaches and scouts about yourself..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="[color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="City, Country"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                    placeholder="180"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    placeholder="75"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Experience (years)</Label>
                  <Input
                    type="number"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="5"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="Sport" value={profile?.sport} />
              <InfoItem label="Position" value={profile?.position} />
              <InfoItem
                label="Date of Birth"
                value={
                  profile?.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : undefined
                }
              />
              <InfoItem label="Location" value={profile?.location} />
              <InfoItem label="Height" value={profile?.height ? `${profile.height} cm` : undefined} />
              <InfoItem label="Weight" value={profile?.weight ? `${profile.weight} kg` : undefined} />
              <InfoItem
                label="Experience"
                value={profile?.experience ? `${profile.experience} years` : undefined}
              />
              <InfoItem
                label="Verification"
                value={profile?.verificationStatus}
                badge
              />
              {profile?.bio && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Bio</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">
                    {profile.bio}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            Performance Stats
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowStatForm(!showStatForm)}>
            {showStatForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-1" />}
            {showStatForm ? "" : "Add Stat"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showStatForm && (
            <div className="p-4 border border-slate-800 rounded-lg space-y-3 bg-slate-950/50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  placeholder="Stat name (e.g., Sprint Speed)"
                  value={newStat.statName}
                  onChange={(e) => setNewStat({ ...newStat, statName: e.target.value })}
                />
                <Input
                  placeholder="Value (e.g., 11.2)"
                  value={newStat.statValue}
                  onChange={(e) => setNewStat({ ...newStat, statValue: e.target.value })}
                />
                <Input
                  placeholder="Unit (e.g., sec)"
                  value={newStat.unit}
                  onChange={(e) => setNewStat({ ...newStat, unit: e.target.value })}
                />
              </div>
              <Button size="sm" onClick={handleAddStat} disabled={addingStat}>
                {addingStat ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Add Stat
              </Button>
            </div>
          )}

          {profile?.performanceStats && profile.performanceStats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {profile.performanceStats.map((stat) => (
                <div
                  key={stat.id}
                  className="p-3 border border-slate-800 rounded-lg bg-slate-950/50 flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs text-slate-500">{stat.statName}</p>
                    <p className="text-lg font-bold text-white">
                      {stat.statValue}
                      {stat.unit && (
                        <span className="text-xs text-slate-400 ml-1">{stat.unit}</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteStat(stat.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !showStatForm && (
              <p className="text-sm text-slate-500 text-center py-4">
                No stats yet. Add your performance metrics!
              </p>
            )
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-indigo-400" />
            Achievements
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAchievementForm(!showAchievementForm)}
          >
            {showAchievementForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-1" />}
            {showAchievementForm ? "" : "Add"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAchievementForm && (
            <div className="p-4 border border-slate-800 rounded-lg space-y-3 bg-slate-950/50">
              <Input
                placeholder="Achievement title"
                value={newAchievement.title}
                onChange={(e) =>
                  setNewAchievement({ ...newAchievement, title: e.target.value })
                }
              />
              <Textarea
                placeholder="Description (optional)"
                value={newAchievement.description}
                onChange={(e) =>
                  setNewAchievement({ ...newAchievement, description: e.target.value })
                }
                rows={2}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={newAchievement.dateAchieved}
                  onChange={(e) =>
                    setNewAchievement({ ...newAchievement, dateAchieved: e.target.value })
                  }
                  className="[color-scheme:dark]"
                />
                <Input
                  placeholder="Category (e.g., Gold Medal)"
                  value={newAchievement.category}
                  onChange={(e) =>
                    setNewAchievement({ ...newAchievement, category: e.target.value })
                  }
                />
              </div>
              <Button size="sm" onClick={handleAddAchievement} disabled={addingAchievement}>
                {addingAchievement ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Add Achievement
              </Button>
            </div>
          )}

          {profile?.achievements && profile.achievements.length > 0 ? (
            <div className="space-y-3">
              {profile.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-3 border border-slate-800 rounded-lg bg-slate-950/50 flex items-start justify-between group"
                >
                  <div className="flex items-start gap-3">
                    <Trophy className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-white">{ach.title}</p>
                      {ach.description && (
                        <p className="text-sm text-slate-400 mt-0.5">{ach.description}</p>
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
                  <button
                    onClick={() => handleDeleteAchievement(ach.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !showAchievementForm && (
              <p className="text-sm text-slate-500 text-center py-4">
                No achievements yet. Showcase your wins!
              </p>
            )
          )}
        </CardContent>
      </Card>

      {/* Media Highlights */}
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="h-4 w-4 text-indigo-400" />
            Media Highlights
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMediaForm(!showMediaForm)}
          >
            {showMediaForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4 mr-1" />}
            {showMediaForm ? "" : "Add"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showMediaForm && (
            <div className="p-4 border border-slate-800 rounded-lg space-y-3 bg-slate-950/50">
              <Input
                placeholder="Title"
                value={newMedia.title}
                onChange={(e) => setNewMedia({ ...newMedia, title: e.target.value })}
              />
              <Input
                placeholder="URL (YouTube, Vimeo, etc.)"
                value={newMedia.url}
                onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newMedia.type}
                  onChange={(e) => setNewMedia({ ...newMedia, type: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="VIDEO">Video</option>
                  <option value="IMAGE">Image</option>
                  <option value="DOCUMENT">Document</option>
                </select>
                <Input
                  placeholder="Description (optional)"
                  value={newMedia.description}
                  onChange={(e) => setNewMedia({ ...newMedia, description: e.target.value })}
                />
              </div>
              <Button size="sm" onClick={handleAddMedia} disabled={addingMedia}>
                {addingMedia ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Add Media
              </Button>
            </div>
          )}

          {profile?.mediaHighlights && profile.mediaHighlights.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.mediaHighlights.map((media) => (
                <div
                  key={media.id}
                  className="p-3 border border-slate-800 rounded-lg bg-slate-950/50 flex items-start justify-between group"
                >
                  <div className="flex items-start gap-3 min-w-0">
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
                        <p className="text-xs text-slate-500 truncate">{media.description}</p>
                      )}
                      <a
                        href={media.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:underline"
                      >
                        View →
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMedia(media.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !showMediaForm && (
              <p className="text-sm text-slate-500 text-center py-4">
                No media yet. Share your highlight reels!
              </p>
            )
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfoItem({
  label,
  value,
  badge = false,
}: {
  label: string;
  value: string | null | undefined;
  badge?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      {badge ? (
        <Badge
          variant={value === "VERIFIED" ? "default" : "secondary"}
          className="text-xs"
        >
          {value || "—"}
        </Badge>
      ) : (
        <p className="text-sm text-slate-300">{value || "—"}</p>
      )}
    </div>
  );
}
