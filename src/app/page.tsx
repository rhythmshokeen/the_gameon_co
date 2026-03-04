"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Users,
  Target,
  Shield,
  ArrowRight,
  ChevronRight,
  BarChart3,
  Zap,
  Globe,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0d14] text-slate-100">
      {/* ─── Navigation ──────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="GameOn Co." width={36} height={36} className="rounded-lg" />
            <span className="text-lg font-bold tracking-tight">
              GameOn Co.
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
              How It Works
            </a>
            <a href="#roles" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
              For You
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 grid-pattern" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />

        <motion.div
          className="relative max-w-5xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeIn} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 text-sm text-slate-400 mb-8">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              The future of sports talent discovery
            </div>
          </motion.div>

          <motion.h1
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            Turn Talent Into{" "}
            <span className="text-gradient">Opportunity</span>
          </motion.h1>

          <motion.p
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The professional marketplace connecting athletes, coaches, and
            academies through verified competitions and structured performance
            profiles. No noise. Just results.
          </motion.p>

          <motion.div
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/auth/register">
              <Button size="xl" className="min-w-[200px]">
                Start Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="xl" className="min-w-[200px]">
                Learn More
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 pt-8 border-t border-slate-800"
          >
            {[
              { value: "10K+", label: "Athletes" },
              { value: "500+", label: "Competitions" },
              { value: "200+", label: "Academies" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Features Section ────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-4">
              Built for Serious Athletes
            </motion.h2>
            <motion.p variants={fadeIn} className="text-slate-400 max-w-2xl mx-auto">
              Every feature is designed to give athletes a professional edge and give
              scouts the data they need to make informed decisions.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Target, title: "Performance Profiles", description: "Structured athlete profiles with verified stats, achievements, and highlight media. No guesswork." },
              { icon: Trophy, title: "Verified Competitions", description: "Browse and apply to competitions with verified status, ensuring legitimacy at every level." },
              { icon: BarChart3, title: "Data-Driven Insights", description: "Track performance metrics over time. Coaches see the numbers that matter." },
              { icon: Users, title: "Direct Connections", description: "Coaches and scouts connect directly with athletes. No middlemen, no noise." },
              { icon: Shield, title: "Role-Based Access", description: "Athletes, coaches, and organizers each get tailored experiences with proper permissions." },
              { icon: Globe, title: "Global Reach", description: "Discover talent and opportunities worldwide. Geography shouldn't limit potential." },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeIn}
                className="group p-6 rounded-xl border border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 hover:border-slate-700 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
                  <feature.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900/20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </motion.h2>
            <motion.p variants={fadeIn} className="text-slate-400">
              Three simple steps to transform your career trajectory.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { step: "01", title: "Create Your Profile", description: "Build a comprehensive performance profile with stats, achievements, and highlight media." },
              { step: "02", title: "Discover & Compete", description: "Browse verified competitions, apply directly, and showcase your abilities on a real stage." },
              { step: "03", title: "Get Noticed", description: "Coaches and scouts find you through your data. Real connections, real opportunities." },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeIn} className="relative p-6 rounded-xl border border-slate-800 bg-slate-900/30">
                <div className="text-5xl font-bold text-indigo-500/10 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Roles Section ───────────────────────────────── */}
      <section id="roles" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-4">
              Built For Everyone in Sports
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { title: "Athletes", items: ["Build a verified performance profile", "Apply to competitions directly", "Track your stats over time", "Get discovered by coaches and scouts"] },
              { title: "Coaches & Scouts", items: ["Discover athletes by sport and position", "Access verified performance data", "Connect with athletes directly", "Filter by experience and metrics"] },
              { title: "Academies & Organizers", items: ["Create and manage competitions", "Review and manage applications", "Get verified status", "Track competition analytics"] },
            ].map((role) => (
              <motion.div key={role.title} variants={fadeIn} className="p-8 rounded-xl border border-slate-800 bg-slate-900/30 hover:border-indigo-500/30 transition-all duration-300">
                <h3 className="text-xl font-bold mb-6">{role.title}</h3>
                <ul className="space-y-3">
                  {role.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Section ─────────────────────────────────── */}
      <section className="py-24 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center p-12 rounded-2xl border border-slate-800 bg-slate-900/30 animate-pulse-glow"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Level Up?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Join thousands of athletes, coaches, and organizers already using GameOn Co. to turn talent into opportunity.
          </p>
          <Link href="/auth/register">
            <Button size="xl">
              Create Your Account
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="GameOn Co." width={30} height={30} className="rounded-lg" />
            <span className="font-semibold">GameOn Co.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
          </div>
          <p className="text-sm text-slate-600">© 2026 GameOn Co. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
