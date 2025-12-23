"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Transition } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clipboard,
  Cpu,
  Monitor,
  ShieldCheck,
  Zap,
  ExternalLink,
} from "lucide-react";

import { useCartStore } from "@/store/cart";
import { catalog } from "@shared/catalog";
import { sampleCpus, sampleGpus } from "@shared/sampleData";
import type { Catalog as PcCatalog, PcBuildIds } from "@shared/types";
import {
  FPSPredictor,
  type FpsEstimate,
  type GraphicsPreset,
  type Resolution,
  buildFromIds,
  checkCompatibility,
} from "@shared/logic";

type BuilderCardProps = {
  title: string;
  icon: ReactNode;
  glitch?: boolean;
  children: ReactNode;
};

const BuilderCard = ({ title, icon, glitch, children }: BuilderCardProps) => {
  const animate = glitch
    ? {
        x: [0, -1.5, 1.5, -0.5, 0],
        boxShadow: [
          "0 0 0px rgba(0,0,0,0)",
          "0 0 18px rgba(0,229,255,0.9)",
          "0 0 22px rgba(255,77,253,0.9)",
          "0 0 12px rgba(0,229,255,0.75)",
          "0 0 0px rgba(0,0,0,0)",
        ],
      }
    : {
        x: 0,
        boxShadow: "0 0 26px rgba(0,229,255,0.14)",
      };

  const glitchTransition: Transition = {
    duration: 0.65,
    repeat: Infinity,
    repeatType: "loop",
    ease: "easeInOut",
  };

  const subtleTransition: Transition = {
    duration: 0.25,
  };

  return (
    <motion.div
      className="rounded-xl border border-cyan-500/40 bg-slate-950/70 p-4 shadow-[0_0_26px_rgba(0,229,255,0.16)] backdrop-blur"
      animate={animate}
      transition={glitch ? glitchTransition : subtleTransition}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-cyan-200">
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </motion.div>
  );
};

const PowerBar = ({ ratio }: { ratio: number | null }) => {
  const safeRatio = ratio && Number.isFinite(ratio) ? ratio : 0;
  const percent = Math.max(0, Math.min(130, Math.round(safeRatio * 100)));
  const color =
    ratio == null ? "bg-slate-700" : ratio > 0.8 ? "bg-red-500" : ratio > 0.6 ? "bg-yellow-400" : "bg-emerald-400";

  return (
    <div className="mt-3 space-y-1">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>Dynamic power load</span>
        {ratio != null && <span>{Math.round(safeRatio * 100)}%</span>}
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-900/80">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percent)}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 26 }}
        />
      </div>
    </div>
  );
};

const fpsSummaryText = (estimate: FpsEstimate | null) => {
  if (!estimate) return "Select a CPU and GPU to estimate Battlefield 2042 FPS.";
  const target = estimate.resolution === "1080p" ? "esports" : estimate.resolution === "4k" ? "cinematic" : "high-refresh";
  return `${estimate.avgFps} FPS avg at ${estimate.resolution.toUpperCase()} ${estimate.preset.toUpperCase()} (${target})`;
};

const bottleneckLabel = (estimate: FpsEstimate | null) => {
  if (!estimate || estimate.bottleneck === "unknown") return "Balanced or unknown bottleneck.";
  if (estimate.bottleneck === "balanced") return "CPU and GPU are well balanced for this workload.";
  const side = estimate.bottleneck === "cpu" ? "CPU-bound" : "GPU-bound";
  if (estimate.significantBottleneck) {
    return `Significant ${side} bottleneck (${estimate.bottleneckPercent ?? 0}% mismatch across tiers).`;
  }
  return `${side} with mild bottleneck (${estimate.bottleneckPercent ?? 0}% mismatch).`;
};

const resolutions: Resolution[] = ["1080p", "1440p", "4k"];
const presets: GraphicsPreset[] = ["low", "medium", "high", "ultra"];

const BuilderPage = () => {
  const [ids, setIds] = useState<PcBuildIds>({});
  const [resolution, setResolution] = useState<Resolution>("1440p");
  const [preset, setPreset] = useState<GraphicsPreset>("high");
  const [rayTracing, setRayTracing] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.open);

  const builderCatalog: PcCatalog = useMemo(
    () => ({
      cpus: sampleCpus,
      gpus: sampleGpus,
      motherboards: catalog.motherboards,
      ramKits: catalog.ramKits,
      psus: catalog.psus,
    }),
    []
  );

  const fpsPredictor = useMemo(() => new FPSPredictor(), []);

  const build = useMemo(() => buildFromIds(ids, builderCatalog), [ids, builderCatalog]);
  const compatibility = useMemo(() => checkCompatibility(build), [build]);

  const fpsEstimate = useMemo(
    () => fpsPredictor.estimateBattlefield2042(build, { resolution, preset, rayTracing }),
    [build, fpsPredictor, resolution, preset, rayTracing]
  );

  const errorCodes = useMemo(
    () => new Set(compatibility.issues.filter((i) => i.severity === "error").map((i) => i.code)),
    [compatibility.issues]
  );

  const powerRatio = build.psu && build.psu.wattageW > 0 ? compatibility.power.totalTdpW / build.psu.wattageW : null;
  const powerDanger = powerRatio != null && powerRatio > 0.8;

  const cpuGlitch =
    errorCodes.has("cpu_socket_mismatch") ||
    (fpsEstimate?.significantBottleneck && fpsEstimate.bottleneck === "cpu");
  const gpuGlitch = fpsEstimate?.significantBottleneck && fpsEstimate.bottleneck === "gpu";
  const motherboardGlitch = errorCodes.has("cpu_socket_mismatch") || errorCodes.has("ram_standard_mismatch");
  const ramGlitch = errorCodes.has("ram_standard_mismatch");
  const psuGlitch = errorCodes.has("psu_insufficient_wattage") || powerDanger;

  const handleIdChange = (key: keyof PcBuildIds, value: string) => {
    setIds((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const currentGpuId = build.gpu?.id;

  const nextTierGpu = useMemo(() => {
    if (!currentGpuId) return null;
    const sorted = [...sampleGpus].sort(
      (a, b) => a.benchmarks.rasterScore - b.benchmarks.rasterScore
    );
    const index = sorted.findIndex((g) => g.id === currentGpuId);
    if (index === -1) return null;
    const candidate = sorted[index + 1];
    return candidate ?? null;
  }, [currentGpuId]);

  const upgradeEstimate = useMemo(() => {
    if (!nextTierGpu || !build.cpu) return null;
    const upgradedBuild = { ...build, gpu: nextTierGpu };
    return fpsPredictor.estimateBattlefield2042(upgradedBuild, {
      resolution,
      preset,
      rayTracing,
    });
  }, [nextTierGpu, build, fpsPredictor, resolution, preset, rayTracing]);

  const fpsDelta =
    fpsEstimate && upgradeEstimate
      ? upgradeEstimate.avgFps - fpsEstimate.avgFps
      : null;

  const allGameEstimates = useMemo(
    () => fpsPredictor.estimateAllGames(build, { resolution, preset, rayTracing }),
    [build, fpsPredictor, resolution, preset, rayTracing]
  );

  const buildPriceUsd = useMemo(() => {
    if (!build.cpu && !build.gpu && !build.motherboard && !build.ram && !build.psu) {
      return 0;
    }

    const sum =
      (build.cpu?.price.amount ?? 0) +
      (build.gpu?.price.amount ?? 0) +
      (build.motherboard?.price.amount ?? 0) +
      (build.ram?.price.amount ?? 0) +
      (build.psu?.price.amount ?? 0);

    return Math.round(sum * 1.08);
  }, [build]);

  const canAddToCart =
    !!build.cpu &&
    !!build.gpu &&
    !!build.motherboard &&
    !!build.ram &&
    !!build.psu &&
    buildPriceUsd > 0;

  const amazonSearchUrlForBuild =
    build.cpu && build.gpu
      ? `https://www.amazon.com/s?k=${encodeURIComponent(
          `${build.cpu.name} ${build.gpu.name} gaming PC`
        )}`
      : null;

  const bottleneckPercent = fpsEstimate?.bottleneckPercent ?? null;

  const isCriticalBottleneck =
    !!fpsEstimate &&
    fpsEstimate.bottleneck !== "balanced" &&
    fpsEstimate.bottleneck !== "unknown" &&
    (bottleneckPercent ?? 0) > 15;

  const isTitanApproved =
    !!fpsEstimate &&
    !isCriticalBottleneck &&
    (fpsEstimate.bottleneck === "balanced" || (bottleneckPercent ?? 0) <= 10);

  const isGodTierBuild =
    !!fpsEstimate &&
    !!build.cpu &&
    !!build.gpu &&
    !isCriticalBottleneck &&
    build.cpu.benchmarks.gamingScore >= 2300 &&
    build.gpu.benchmarks.rasterScore >= 3300;

  const handleAddSystemToCart = () => {
    if (!canAddToCart || !build.cpu || !build.gpu || !build.motherboard || !build.ram || !build.psu) {
      return;
    }

    const cartId = `pc-build-${build.cpu.id}-${build.gpu.id}-${build.motherboard.id}-${build.ram.id}-${build.psu.id}`;
    const name = `${build.cpu.name} + ${build.gpu.name} rig`;

    addItem(
      {
        id: cartId,
        kind: "pc_build",
        name,
        priceUsd: buildPriceUsd,
        imageUrl: "/images/prebuilt/custom-build.png",
        meta: {
          componentIds: {
            cpuId: build.cpu.id,
            gpuId: build.gpu.id,
            motherboardId: build.motherboard.id,
            ramId: build.ram.id,
            psuId: build.psu.id,
          },
          fpsEstimate,
          power: compatibility.power,
        },
      },
      1
    );

    openCart();
  };

  const handleCopyBuildReport = async () => {
    try {
      const lines: string[] = [];
      lines.push("TitanGaming Build Report");
      lines.push("------------------------");
      lines.push(`CPU: ${build.cpu?.name ?? "Not selected"}`);
      lines.push(`GPU: ${build.gpu?.name ?? "Not selected"}`);
      lines.push(`Motherboard: ${build.motherboard?.name ?? "Not selected"}`);
      lines.push(`RAM: ${build.ram?.name ?? "Not selected"}`);
      lines.push(`PSU: ${build.psu?.name ?? "Not selected"}`);
      lines.push("");
      lines.push(
        `Target: ${resolution.toUpperCase()} ${preset.toUpperCase()}${
          rayTracing ? " + Ray Tracing" : ""
        }`
      );

      if (fpsEstimate) {
        lines.push(
          `Battlefield 2042: ${fpsEstimate.avgFps} avg / ${fpsEstimate.low1PercentFps} 1% / ${fpsEstimate.minFps} min FPS`
        );
      }

      if (allGameEstimates.length > 0) {
        lines.push("");
        lines.push("Game Performance:");
        allGameEstimates.forEach((estimate) => {
          lines.push(
            `- ${estimate.game}: ${estimate.avgFps} avg / ${estimate.low1PercentFps} 1% / ${estimate.minFps} min @ ${estimate.resolution.toUpperCase()} ${estimate.preset.toUpperCase()}${
              estimate.rayTracing ? " (RT ON)" : ""
            }`
          );
        });
      }

      if (fpsEstimate) {
        lines.push("");
        lines.push(`Titan Verdict: ${bottleneckLabel(fpsEstimate)}`);
      }

      const report = lines.join("\n");
      await navigator.clipboard.writeText(report);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#020617,_#020617_45%,_#000000_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:py-12 lg:px-8">
        <motion.section
          className="flex-1 space-y-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-cyan-200">
              <Activity className="h-3 w-3" />
              <span>Smart Builder</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              TitanGaming live rig composer
            </h1>
            <p className="max-w-xl text-xs text-slate-400 sm:text-sm">
              Assemble a high-end PC and see live FPS estimates, power draw, and bottleneck analysis tuned for Battlefield 2042.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <BuilderCard title="CPU" icon={<Cpu className="h-4 w-4" />} glitch={cpuGlitch}>
              <select
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950/70 px-3 py-2 text-xs outline-none ring-0 focus:border-cyan-400 focus:bg-slate-900"
                value={ids.cpuId ?? ""}
                onChange={(e) => handleIdChange("cpuId", e.target.value)}
              >
                <option value="">Select a CPU</option>
                {builderCatalog.cpus.map((cpu) => (
                  <option key={cpu.id} value={cpu.id}>
                    {cpu.name} - {cpu.cores}/{cpu.threads} cores - {cpu.tdpW}W
                  </option>
                ))}
              </select>
            </BuilderCard>

            <BuilderCard title="GPU" icon={<Monitor className="h-4 w-4" />} glitch={gpuGlitch}>
              <select
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950/70 px-3 py-2 text-xs outline-none ring-0 focus:border-cyan-400 focus:bg-slate-900"
                value={ids.gpuId ?? ""}
                onChange={(e) => handleIdChange("gpuId", e.target.value)}
              >
                <option value="">Select a GPU</option>
                {builderCatalog.gpus.map((gpu) => (
                  <option key={gpu.id} value={gpu.id}>
                    {gpu.name} - {gpu.vramGb}GB - {gpu.tdpW}W
                  </option>
                ))}
              </select>
            </BuilderCard>

            <BuilderCard title="Motherboard" icon={<Cpu className="h-4 w-4 rotate-90" />} glitch={motherboardGlitch}>
              <select
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950/70 px-3 py-2 text-xs outline-none ring-0 focus:border-cyan-400 focus:bg-slate-900"
                value={ids.motherboardId ?? ""}
                onChange={(e) => handleIdChange("motherboardId", e.target.value)}
              >
                <option value="">Select a motherboard</option>
                {builderCatalog.motherboards.map((mb) => (
                  <option key={mb.id} value={mb.id}>
                    {mb.name} - {mb.socket} - {mb.memoryStandard}
                  </option>
                ))}
              </select>
            </BuilderCard>

            <BuilderCard title="Memory" icon={<BarChart3 className="h-4 w-4" />} glitch={ramGlitch}>
              <select
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950/70 px-3 py-2 text-xs outline-none ring-0 focus:border-cyan-400 focus:bg-slate-900"
                value={ids.ramId ?? ""}
                onChange={(e) => handleIdChange("ramId", e.target.value)}
              >
                <option value="">Select RAM</option>
                {builderCatalog.ramKits.map((ram) => (
                  <option key={ram.id} value={ram.id}>
                    {ram.name} - {ram.capacityGb}GB {ram.memoryStandard} - {ram.speedMhz}MHz
                  </option>
                ))}
              </select>
            </BuilderCard>

            <BuilderCard title="Power supply" icon={<Zap className="h-4 w-4" />} glitch={psuGlitch}>
              <select
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950/70 px-3 py-2 text-xs outline-none ring-0 focus:border-cyan-400 focus:bg-slate-900"
                value={ids.psuId ?? ""}
                onChange={(e) => handleIdChange("psuId", e.target.value)}
              >
                <option value="">Select a PSU</option>
                {builderCatalog.psus.map((psu) => (
                  <option key={psu.id} value={psu.id}>
                    {psu.name} - {psu.wattageW}W
                  </option>
                ))}
              </select>
            </BuilderCard>
          </div>
        </motion.section>

        <motion.aside
          className="w-full max-w-md space-y-4 rounded-2xl border border-cyan-500/40 bg-slate-950/75 p-5 shadow-[0_0_40px_rgba(0,229,255,0.22)] backdrop-blur md:self-stretch"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
                <BarChart3 className="h-3 w-3" />
                <span>Live Performance Dashboard</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Resolution aware FPS predictions using shared TitanGaming engine.
              </p>
            </div>
            <div className="rounded-full border border-cyan-500/40 bg-slate-950/80 px-2.5 py-1 text-[10px] text-cyan-200">
              <span>BF2042</span>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-700/80 bg-slate-950/90 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-100">Projected FPS</p>
                <p className="text-[11px] text-slate-400">{fpsSummaryText(fpsEstimate)}</p>
              </div>
            </div>

            {fpsEstimate && (
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="rounded-md bg-slate-900/80 px-2 py-1.5">
                  <div className="text-[9px] uppercase tracking-wide text-slate-400">Avg</div>
                  <div className="text-sm font-semibold text-cyan-200">{fpsEstimate.avgFps}</div>
                </div>
                <div className="rounded-md bg-slate-900/80 px-2 py-1.5">
                  <div className="text-[9px] uppercase tracking-wide text-slate-400">1% low</div>
                  <div className="text-sm font-semibold text-cyan-200">{fpsEstimate.low1PercentFps}</div>
                </div>
                <div className="rounded-md bg-slate-900/80 px-2 py-1.5">
                  <div className="text-[9px] uppercase tracking-wide text-slate-400">Min</div>
                  <div className="text-sm font-semibold text-cyan-200">{fpsEstimate.minFps}</div>
                </div>
              </div>
            )}

            <div className="mt-1 grid gap-2 text-[11px] sm:grid-cols-3">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-wide text-slate-400">Resolution</label>
                <select
                  className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-[11px] outline-none focus:border-cyan-400"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as Resolution)}
                >
                  {resolutions.map((res) => (
                    <option key={res} value={res}>
                      {res.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-wide text-slate-400">Preset</label>
                <select
                  className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-2 py-1.5 text-[11px] outline-none focus:border-cyan-400"
                  value={preset}
                  onChange={(e) => setPreset(e.target.value as GraphicsPreset)}
                >
                  {presets.map((p) => (
                    <option key={p} value={p}>
                      {p.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setRayTracing((v) => !v)}
                className={`mt-5 inline-flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  rayTracing
                    ? "border-fuchsia-500/80 bg-fuchsia-500/10 text-fuchsia-200"
                    : "border-slate-700 bg-slate-950/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
                }`}
              >
                <Monitor className="h-3 w-3" />
                <span>Ray tracing</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowCompare((v) => !v)}
              disabled={!nextTierGpu || !fpsEstimate}
              className={`mt-2 inline-flex items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-[11px] font-medium transition-colors ${
                !nextTierGpu || !fpsEstimate
                  ? "cursor-not-allowed border-slate-800 bg-slate-900 text-slate-500"
                  : "border-cyan-500/70 bg-slate-950 text-cyan-200 hover:bg-cyan-500/10"
              }`}
            >
              <Zap className="h-3 w-3" />
              <span>Compare performance (next tier GPU)</span>
            </button>

            <AnimatePresence initial={false}>
              {showCompare && nextTierGpu && fpsEstimate && upgradeEstimate && (
                <motion.div
                  className="mt-2 rounded-md border border-cyan-500/40 bg-slate-950/90 p-2 text-[11px] text-slate-200"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-cyan-200">Upgrade preview</p>
                      <p className="text-[11px] text-slate-300">
                        Upgrade GPU to {nextTierGpu.name}.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Avg FPS</p>
                      <p className="text-sm font-semibold text-emerald-300">{upgradeEstimate.avgFps}</p>
                      {fpsDelta !== null && (
                        <p className="text-[10px] text-slate-300">
                          {fpsDelta >= 0 ? "+" : ""}
                          {fpsDelta.toFixed(0)} FPS vs current
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-700/80 bg-slate-950/90 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-100">
                <Zap className="h-3.5 w-3.5 text-emerald-300" />
                <span>Power and stability</span>
              </div>
              {build.psu && (
                <span className="text-[10px] text-slate-400">
                  Total {Math.round(compatibility.power.totalTdpW)}W / PSU {build.psu.wattageW}W
                </span>
              )}
            </div>

            <PowerBar ratio={powerRatio} />

            {build.psu && (
              <p className="text-[11px] text-slate-400">
                Recommended PSU for this draw: {Math.round(compatibility.power.recommendedPsuW)}W.
              </p>
            )}

            <AnimatePresence initial={false}>
              {compatibility.issues.length > 0 && (
                <motion.ul
                  className="mt-2 space-y-1.5 text-[11px]"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                >
                  {compatibility.issues.map((issue) => (
                    <li
                      key={issue.code}
                      className={`flex items-start gap-1.5 rounded-md px-2 py-1 ${
                        issue.severity === "error"
                          ? "bg-red-500/10 text-red-200"
                          : "bg-slate-900/80 text-slate-200"
                      }`}
                    >
                      {issue.severity === "error" && <AlertTriangle className="mt-0.5 h-3 w-3" />}
                      <span>{issue.message}</span>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-3 rounded-xl border border-cyan-500/40 bg-slate-950/90 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-cyan-200">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Game Performance Grid</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Target 144 Hz</span>
            </div>

            {allGameEstimates.length === 0 ? (
              <p className="text-[11px] text-slate-400">
                Select at least a CPU and GPU to see how this rig is expected to perform in GTA VI, Cyberpunk 2077,
                Warzone 3 and Valorant.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {allGameEstimates
                  .filter((estimate) =>
                    [
                      "GTA VI (predicted)",
                      "Cyberpunk 2077",
                      "Warzone 3",
                      "Valorant",
                    ].includes(estimate.game)
                  )
                  .map((estimate) => {
                    const ratio = Math.min(1.5, estimate.avgFps / 144);
                    const percent = Math.round(Math.min(100, (estimate.avgFps / 144) * 100));

                    const barColor =
                      ratio >= 1.1
                        ? "bg-emerald-400"
                        : ratio >= 0.85
                          ? "bg-cyan-400"
                          : ratio >= 0.6
                            ? "bg-amber-300"
                            : "bg-red-400";

                    return (
                      <motion.div
                        key={estimate.game}
                        className="space-y-2 rounded-xl border border-slate-700 bg-slate-950/90 p-3 text-[11px] text-slate-200"
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-slate-50">{estimate.game}</p>
                            <p className="text-[10px] text-slate-400">
                              {estimate.resolution.toUpperCase()} {estimate.preset.toUpperCase()}
                              {estimate.rayTracing ? " · RT ON" : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wide text-slate-400">Avg FPS</p>
                            <p className="text-sm font-semibold text-cyan-200">{estimate.avgFps}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>144 Hz headroom</span>
                            <span className="font-medium text-slate-200">{percent}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900/80">
                            <motion.div
                              className={`h-full ${barColor}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(110, percent)}%` }}
                              transition={{ type: "spring", stiffness: 180, damping: 26 }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>
                            1%: <span className="text-slate-200">{estimate.low1PercentFps}</span>
                          </span>
                          <span>
                            Min: <span className="text-slate-200">{estimate.minFps}</span>
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-slate-700/80 bg-slate-950/90 p-3 text-[11px] text-slate-300">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-100">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
                <span>Titan&apos;s Verdict</span>
              </div>
              {isCriticalBottleneck ? (
                <span className="rounded-full border border-red-500/80 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-300">
                  CRITICAL BOTTLENECK
                </span>
              ) : isGodTierBuild ? (
                <span className="rounded-full border border-fuchsia-500/80 bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-fuchsia-200">
                  GOD MODE
                </span>
              ) : isTitanApproved ? (
                <span className="rounded-full border border-emerald-400/80 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  TITAN APPROVED
                </span>
              ) : (
                <span className="rounded-full border border-slate-600 bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  ANALYZING
                </span>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-slate-300">
                {!fpsEstimate || !build.cpu || !build.gpu
                  ? "Lock in at least a CPU and GPU and Titan will evaluate balance, bottlenecks and real-world FPS."
                  : isGodTierBuild
                    ? "This rig is entering GOD MODE territory. Expect 4K high-refresh gameplay in most titles and enough overhead for heavy ray tracing, streaming and background tasks."
                  : isCriticalBottleneck && fpsEstimate.bottleneck === "cpu"
                    ? (() => {
                        const approxGain =
                          bottleneckPercent != null
                            ? Math.min(45, Math.max(20, bottleneckPercent))
                            : 25;
                        return `Soldier, your GPU is a beast but your CPU is holding it back. Upgrade to a higher-tier Ryzen 7/9 or Core i7/i9 class chip for around ${approxGain.toFixed(
                          0
                        )}% more headroom and smoother frametimes.`;
                      })()
                    : isCriticalBottleneck && fpsEstimate.bottleneck === "gpu"
                      ? (() => {
                          const gainText =
                            fpsDelta && fpsDelta > 0
                              ? `${fpsDelta.toFixed(0)} FPS`
                              : bottleneckPercent != null
                                ? `${Math.min(40, Math.max(15, bottleneckPercent)).toFixed(0)}%`
                                : "significant";
                          const gpuName = nextTierGpu?.name ?? "a higher-tier GPU";
                          return `Your CPU is barely breaking a sweat while the GPU struggles to keep up. Consider stepping up to ${gpuName} for roughly ${gainText} more performance at these settings.`;
                        })()
                      : "Soldier, this configuration keeps CPU and GPU in the same weight class. You should see consistent high-refresh gameplay at your chosen settings."}
              </p>
              <p className="text-[10px] text-slate-500">{bottleneckLabel(fpsEstimate)}</p>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500">
                {build.cpu && build.gpu
                  ? `${build.cpu.name} + ${build.gpu.name} @ ${resolution.toUpperCase()} ${preset.toUpperCase()}${
                      rayTracing ? " · RT ON" : ""
                    }`
                  : "No build locked yet."}
              </span>
              <button
                type="button"
                onClick={handleCopyBuildReport}
                className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/70 bg-slate-950/80 px-3 py-1.5 text-[11px] font-medium text-cyan-200 hover:border-cyan-300 hover:text-cyan-50"
              >
                <Clipboard className="h-3 w-3" />
                <span>
                  {copyStatus === "copied"
                    ? "Report copied!"
                    : copyStatus === "error"
                      ? "Copy failed"
                      : "Copy build report"}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-2 text-[11px] sm:flex-row sm:items-center sm:justify-between">
            <div className="text-slate-400">
              {canAddToCart
                ? `Approx. build value: $${buildPriceUsd.toFixed(0)} USD`
                : "Select CPU, GPU, motherboard, RAM and PSU to add this build to your cart."}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {amazonSearchUrlForBuild && (
                <a
                  href={amazonSearchUrlForBuild}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-[11px] font-medium text-cyan-200 hover:border-cyan-400 hover:text-cyan-100"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Check price on Amazon</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleAddSystemToCart}
                disabled={!canAddToCart}
                className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  canAddToCart
                    ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.7)] hover:from-cyan-400 hover:to-purple-500"
                    : "cursor-not-allowed border border-slate-800 bg-slate-900 text-slate-500"
                }`}
              >
                Add system to cart
              </button>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

export default BuilderPage;
