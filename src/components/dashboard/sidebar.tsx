"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Swords,
  FileText,
  Users,
  Search,
  PlusCircle,
  BarChart3,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: string;
}

const roleNavigation: Record<string, Array<{ label: string; href: string; icon: React.ElementType }>> = {
  ATHLETE: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Profile", href: "/dashboard/profile", icon: User },
    { label: "Competitions", href: "/dashboard/competitions", icon: Swords },
    { label: "My Applications", href: "/dashboard/applications", icon: FileText },
    { label: "Connections", href: "/dashboard/connections", icon: Users },
    { label: "Search", href: "/dashboard/search", icon: Search },
  ],
  COACH: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Discover Athletes", href: "/dashboard/discover", icon: Search },
    { label: "Competitions", href: "/dashboard/competitions", icon: Swords },
    { label: "Connections", href: "/dashboard/connections", icon: Users },
    { label: "Search", href: "/dashboard/search", icon: Search },
  ],
  ORGANIZER: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Competitions", href: "/dashboard/competitions", icon: Swords },
    { label: "Create Competition", href: "/dashboard/competitions/create", icon: PlusCircle },
    { label: "Applications", href: "/dashboard/applications", icon: FileText },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Search", href: "/dashboard/search", icon: Search },
  ],
};

export function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navigation = roleNavigation[role] || [];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800 bg-slate-900/30">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="GameOn Co." width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-bold tracking-tight">GameOn Co.</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Role indicator */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/30">
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500 capitalize">
            {role.toLowerCase()} view
          </span>
        </div>
      </div>
    </aside>
  );
}
