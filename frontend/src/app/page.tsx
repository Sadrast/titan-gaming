"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Cpu, Gamepad2, Headphones, MonitorPlay } from "lucide-react";

const Home = () => {
  return (
    <div className="flex flex-1 flex-col gap-10 py-6 sm:py-10">
      <section className="grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-cyan-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              <span>Next-gen gaming storefront</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
              Build, buy and deploy elite rigs with TitanGaming.
            </h1>
            <p className="max-w-xl text-sm text-slate-400 sm:text-base">
              Curated high-end PCs, consoles and peripherals with live FPS projections from our Smart Builder engine.
              Deep black, neon cyan and electric purple, tuned for gamers who live in night mode.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45, ease: "easeOut" }}
          >
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_26px_rgba(34,211,238,0.8)] hover:from-cyan-400 hover:to-purple-500"
            >
              <Cpu className="h-4 w-4" />
              <span>Launch PC Builder</span>
            </Link>
            <Link
              href="/shop/consoles"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/50 bg-slate-950/80 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10"
            >
              <Gamepad2 className="h-4 w-4" />
              <span>Shop consoles</span>
            </Link>
          </motion.div>

          <div className="mt-4 grid gap-3 text-xs text-slate-300 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 shadow-[0_0_18px_rgba(15,23,42,0.9)]">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-cyan-200">
                <Cpu className="h-3.5 w-3.5" />
                Smart Builder
              </p>
              <p className="text-[11px] text-slate-400">
                Live FPS, power draw and bottleneck analysis for your custom PC builds.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 shadow-[0_0_18px_rgba(15,23,42,0.9)]">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-purple-200">
                <MonitorPlay className="h-3.5 w-3.5" />
                Tiered consoles
              </p>
              <p className="text-[11px] text-slate-400">
                PS5, Xbox Series X and Switch with fast shipping and curated bundles.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 shadow-[0_0_18px_rgba(15,23,42,0.9)]">
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-200">
                <Headphones className="h-3.5 w-3.5" />
                Pro peripherals
              </p>
              <p className="text-[11px] text-slate-400">
                Mechanical keyboards, esports mice and lossless headsets.
              </p>
            </div>
          </div>
        </div>

        <motion.div
          className="relative h-64 rounded-3xl border border-cyan-500/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-[0_0_40px_rgba(34,211,238,0.8)] md:h-80"
          initial={{ opacity: 0, scale: 0.92, rotateX: 8 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ delay: 0.1, duration: 0.55, ease: "easeOut" }}
        >
          <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.4),transparent_55%)]" />
          <div className="relative flex h-full flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="uppercase tracking-[0.2em] text-cyan-200">Live build preview</span>
              <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-400">Battlefield 2042</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="rounded-lg bg-slate-900/80 p-2">
                <div className="text-[9px] uppercase tracking-wide text-slate-400">1440p High</div>
                <div className="text-lg font-semibold text-cyan-200">165</div>
                <div className="text-[9px] text-slate-500">Avg FPS</div>
              </div>
              <div className="rounded-lg bg-slate-900/80 p-2">
                <div className="text-[9px] uppercase tracking-wide text-slate-400">1% Low</div>
                <div className="text-lg font-semibold text-cyan-200">118</div>
                <div className="text-[9px] text-slate-500">FPS</div>
              </div>
              <div className="rounded-lg bg-slate-900/80 p-2">
                <div className="text-[9px] uppercase tracking-wide text-slate-400">Power</div>
                <div className="text-lg font-semibold text-emerald-300">62%</div>
                <div className="text-[9px] text-slate-500">PSU load</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-300">
              <span>7800X3D + RTX 4080 class build</span>
              <Link
                href="/builder"
                className="text-cyan-300 underline-offset-2 hover:text-cyan-200 hover:underline"
              >
                Open in builder
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
