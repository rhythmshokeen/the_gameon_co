"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LogOut,
  LayoutDashboard,
  Swords,
  GraduationCap,
  Users,
  Send,
  HeartPulse,
  BarChart3,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const navLinks = [
  { label: "Hub", href: "/hub", icon: LayoutDashboard },
  { label: "Compete", href: "/compete", icon: Swords },
  { label: "Learn", href: "/learn", icon: GraduationCap },
  { label: "Connect", href: "/connect", icon: Users },
  { label: "Apply", href: "/apply", icon: Send },
  { label: "Recover", href: "/recover", icon: HeartPulse },
  { label: "Track", href: "/track", icon: BarChart3 },
];

export function FeatureLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0b0d14]">
        <div className="h-16 border-b border-slate-800/60" />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0b0d14] grid-pattern">
      {/* Navigation */}
      <nav className="border-b border-slate-800/60 bg-[#0b0d14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/hub" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="GameOn Co."
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-base font-bold tracking-tight hidden sm:block">
                GameOn Co.
              </span>
            </Link>
            <div className="h-5 w-px bg-slate-800 hidden lg:block" />
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:block">
              {session.user.name}
            </span>
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

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
