"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  UserPlus,
  UserCheck,
  UserX,
  Users,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  Send,
  Inbox,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

interface Connection {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  sender: { id: string; name: string; email: string; image: string | null; role: string };
  receiver: { id: string; name: string; email: string; image: string | null; role: string };
}

const TABS = [
  { value: "all", label: "All", icon: Users },
  { value: "received", label: "Received", icon: Inbox },
  { value: "sent", label: "Sent", icon: Send },
];

export default function ConnectionsPage() {
  const { data: session } = useSession();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab !== "all") params.set("type", tab);
      const res = await fetch(`/api/connections?${params}`);
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections);
      }
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleAction = async (id: string, action: "ACCEPTED" | "REJECTED") => {
    setActionId(id);
    try {
      const res = await fetch(`/api/connections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      if (res.ok) {
        toast.success(
          action === "ACCEPTED" ? "Connection accepted!" : "Connection rejected"
        );
        setConnections((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: action } : c))
        );
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this connection?")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/connections/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Connection removed");
        setConnections((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast.error("Failed to remove connection");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setActionId(null);
    }
  };

  const getOtherUser = (conn: Connection) => {
    return conn.sender.id === session?.user?.id ? conn.receiver : conn.sender;
  };

  const isSender = (conn: Connection) => conn.sender.id === session?.user?.id;

  const statusCounts = {
    pending: connections.filter((c) => c.status === "PENDING").length,
    accepted: connections.filter((c) => c.status === "ACCEPTED").length,
    total: connections.length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Connections</h1>
        <p className="text-slate-400 mt-1">
          Manage your network of athletes, coaches, and organizers.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{statusCounts.total}</p>
            <p className="text-xs text-slate-500">Total</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{statusCounts.accepted}</p>
            <p className="text-xs text-slate-500">Connected</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{statusCounts.pending}</p>
            <p className="text-xs text-slate-500">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-t-lg transition-colors ${
              tab === value
                ? "bg-slate-800 text-indigo-400 border-b-2 border-indigo-500"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Connections List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : connections.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              No connections yet
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Start building your network by discovering athletes and coaches.
            </p>
            <Link href="/dashboard/discover">
              <Button className="mt-4">Discover People</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {connections.map((conn, index) => {
            const otherUser = getOtherUser(conn);
            const sent = isSender(conn);

            return (
              <motion.div
                key={conn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-medium text-lg shrink-0">
                        {otherUser.image ? (
                          <img
                            src={otherUser.image}
                            alt={otherUser.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          otherUser.name?.[0]?.toUpperCase() || "?"
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-white truncate">
                            {otherUser.name}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {otherUser.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 truncate">
                          {otherUser.email}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            {sent ? (
                              <>
                                <Send className="h-3 w-3" />
                                Sent
                              </>
                            ) : (
                              <>
                                <Inbox className="h-3 w-3" />
                                Received
                              </>
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(conn.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <Badge
                            variant={
                              conn.status === "ACCEPTED"
                                ? "default"
                                : conn.status === "PENDING"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {conn.status}
                          </Badge>
                        </div>
                        {conn.message && (
                          <p className="mt-2 text-sm text-slate-400 bg-slate-800/50 rounded p-2 border border-slate-800">
                            &ldquo;{conn.message}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        {conn.status === "PENDING" && !sent && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAction(conn.id, "ACCEPTED")}
                              disabled={actionId === conn.id}
                            >
                              {actionId === conn.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              )}
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(conn.id, "REJECTED")}
                              disabled={actionId === conn.id}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(conn.id)}
                          disabled={actionId === conn.id}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
