"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FeatureLayout } from "@/components/feature-layout";
import {
  Users,
  UserPlus,
  Search,
  Loader2,
  Shield,
  Globe,
  Lock,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Group {
  id: string;
  name: string;
  description: string | null;
  sport: string | null;
  isPrivate: boolean;
  maxMembers: number;
  creator: { name: string };
  _count: { members: number };
  isMember?: boolean;
}

interface Connection {
  id: string;
  status: string;
  sender: { id: string; name: string; role: string; image: string | null };
  receiver: { id: string; name: string; role: string; image: string | null };
}

export default function ConnectPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<"groups" | "people">("groups");
  const [groups, setGroups] = useState<Group[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [joining, setJoining] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    sport: "",
    isPrivate: false,
  });

  useEffect(() => {
    if (tab === "groups") fetchGroups();
    else fetchConnections();
  }, [tab]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/connect/groups");
      if (res.ok) setGroups(await res.json());
    } catch {
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/connect/people");
      if (res.ok) setConnections(await res.json());
    } catch {
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    setJoining(groupId);
    try {
      const res = await fetch("/api/connect/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });
      if (res.ok) {
        toast.success("Joined group!");
        fetchGroups();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to join group");
      }
    } catch {
      toast.error("Failed to join group");
    } finally {
      setJoining(null);
    }
  };

  const createGroup = async () => {
    if (!newGroup.name) return;
    setCreating(true);
    try {
      const res = await fetch("/api/connect/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup),
      });
      if (res.ok) {
        toast.success("Group created!");
        setShowCreate(false);
        setNewGroup({ name: "", description: "", sport: "", isPrivate: false });
        fetchGroups();
      } else {
        toast.error("Failed to create group");
      }
    } catch {
      toast.error("Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const filteredGroups = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.sport?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <FeatureLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Users className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">CONNECT</h1>
        </div>
        <p className="text-slate-400">
          Join sport-specific groups and build your professional network.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setTab("groups")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "groups"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Groups
        </button>
        <button
          onClick={() => setTab("people")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "people"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          My Connections
        </button>
      </div>

      {/* Groups Tab */}
      {tab === "groups" && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search groups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreate(!showCreate)}
              className="bg-sky-600 hover:bg-sky-500 text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Group
            </Button>
          </div>

          {/* Create Group Form */}
          {showCreate && (
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-6 mb-6 space-y-4">
              <h3 className="font-bold">Create a New Group</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Group Name *</Label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                    placeholder="e.g., Football Training Squad"
                  />
                </div>
                <div>
                  <Label>Sport</Label>
                  <Input
                    value={newGroup.sport}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, sport: e.target.value })
                    }
                    placeholder="e.g., Football"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, description: e.target.value })
                  }
                  placeholder="What's this group about?"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newGroup.isPrivate}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, isPrivate: e.target.checked })
                  }
                  className="rounded border-slate-600"
                />
                <span className="text-sm text-slate-400">Private group</span>
              </div>
              <Button
                onClick={createGroup}
                disabled={creating || !newGroup.name}
                className="bg-sky-600 hover:bg-sky-500 text-white"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Create Group
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-24">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No groups found</h3>
              <p className="text-sm text-slate-500">
                Create a new group to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    {group.isPrivate ? (
                      <Lock className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Globe className="w-4 h-4 text-sky-400" />
                    )}
                    <h3 className="font-bold truncate">{group.name}</h3>
                  </div>
                  {group.description && (
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    {group.sport && (
                      <span className="px-2 py-0.5 bg-slate-800/80 rounded-md">
                        {group.sport}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {group._count.members}/{group.maxMembers}
                    </span>
                  </div>
                  {group.isMember ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Joined
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={joining === group.id}
                      onClick={() => joinGroup(group.id)}
                    >
                      {joining === group.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                          Join
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* People Tab */}
      {tab === "people" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-24">
              <UserPlus className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
              <p className="text-sm text-slate-500">
                Join groups to meet people and build your network.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((conn) => {
                const other =
                  conn.sender.id === session?.user?.id
                    ? conn.receiver
                    : conn.sender;
                return (
                  <div
                    key={conn.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-800/60 bg-slate-900/40"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">
                      {other.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{other.name}</p>
                      <p className="text-xs text-slate-500">{other.role}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-lg ${
                        conn.status === "ACCEPTED"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {conn.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </FeatureLayout>
  );
}
