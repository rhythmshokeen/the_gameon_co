"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Swords,
  GraduationCap,
  Users,
  Send,
  HeartPulse,
  BarChart3,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

const features = [
  {
    title: "COMPETE",
    description:
      "Enter tournaments, trials, and ranked competitions. Track your competitive journey and get discovered by scouts.",
    icon: Swords,
    href: "/compete",
    gradient: "from-indigo-500/20 to-violet-500/20",
    border: "border-indigo-500/30",
    iconColor: "text-indigo-400",
    tag: "Competitions",
  },
  {
    title: "LEARN",
    description:
      "Structured learning paths for sport fundamentals, nutrition, mental training, and performance science.",
    icon: GraduationCap,
    href: "/learn",
    gradient: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    tag: "Education",
  },
  {
    title: "CONNECT",
    description:
      "Find coaches, teammates, and mentors. Join sport-specific groups and build your professional network.",
    icon: Users,
    href: "/connect",
    gradient: "from-sky-500/20 to-cyan-500/20",
    border: "border-sky-500/30",
    iconColor: "text-sky-400",
    tag: "Networking",
  },
  {
    title: "APPLY",
    description:
      "Browse scholarships, team trials, club contracts, and internships. Submit applications and track status.",
    icon: Send,
    href: "/apply",
    gradient: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
    tag: "Opportunities",
  },
  {
    title: "RECOVER",
    description:
      "Log injuries, track rehabilitation progress, monitor sleep quality, and manage training load.",
    icon: HeartPulse,
    href: "/recover",
    gradient: "from-rose-500/20 to-pink-500/20",
    border: "border-rose-500/30",
    iconColor: "text-rose-400",
    tag: "Health",
  },
  {
    title: "TRACK",
    description:
      "Performance analytics dashboard with session logs, consistency scores, and progress visualizations.",
    icon: BarChart3,
    href: "/track",
    gradient: "from-purple-500/20 to-fuchsia-500/20",
    border: "border-purple-500/30",
    iconColor: "text-purple-400",
    tag: "Analytics",
  },
];

export default function HubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0b0d14] grid-pattern">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <Skeleton className="h-12 w-72 mb-4" />
          <Skeleton className="h-6 w-96 mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const firstName = session.user.name?.split(" ")[0] || "Athlete";

  return (
    <div className="min-h-screen bg-[#0b0d14] grid-pattern">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800/60 bg-[#0b0d14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/hub" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="GameOn Co."
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="text-lg font-bold tracking-tight">GameOn Co.</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <span className="text-sm text-slate-400">{session.user.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Command Center
          </span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3">
          Welcome back,{" "}
          <span className="text-gradient">{firstName}</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl">
          Your central hub for training, competing, learning, and growing as an
          athlete. Select a module to get started.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.title}
                href={feature.href}
                className={`group relative overflow-hidden rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.gradient} p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/5`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none" />

                <div className="relative z-10">
                  {/* Tag */}
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-4">
                    {feature.tag}
                  </span>

                  {/* Icon + Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 ${feature.iconColor}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">
                      {feature.title}
                    </h2>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                    <span>Open</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
