import type { Cpu, Gpu, PcBuild } from "../types";

export type Resolution = "1080p" | "1440p" | "4k";
export type GraphicsPreset = "low" | "medium" | "high" | "ultra";

export type GameId =
  | "Battlefield 2042"
  | "GTA VI (predicted)"
  | "Cyberpunk 2077"
  | "Warzone 3"
  | "Valorant";

export type BottleneckType = "cpu" | "gpu" | "balanced" | "unknown";

export type BottleneckAnalysis = {
  type: BottleneckType;
  percentage: number;
  cpuTier: number;
  gpuTier: number;
  tierDifference: number;
  significant: boolean;
};

export type FpsEstimate = {
  game: GameId;
  resolution: Resolution;
  preset: GraphicsPreset;
  rayTracing: boolean;
  avgFps: number;
  low1PercentFps: number;
  minFps: number;
  bottleneck: BottleneckType;
  bottleneckPercent: number | null;
  significantBottleneck: boolean;
};

export type FpsPredictorOptions = {
  resolution?: Resolution;
  preset?: GraphicsPreset;
  rayTracing?: boolean;
};

const performanceTierFromIndex = (index: number): number => {
  if (!Number.isFinite(index) || index <= 0) return 0;
  if (index >= 1.6) return 5;
  if (index >= 1.3) return 4;
  if (index >= 1.1) return 3;
  if (index >= 0.9) return 2;
  if (index >= 0.7) return 1;
  return 0;
};

const detectBottleneckFromIndexes = (cpuIndex: number, gpuIndex: number): BottleneckType => {
  if (!Number.isFinite(cpuIndex) || !Number.isFinite(gpuIndex) || gpuIndex === 0) {
    return "unknown";
  }

  const ratio = cpuIndex / gpuIndex;

  if (ratio < 0.85) return "cpu";
  if (ratio > 1.18) return "gpu";
  return "balanced";
};

export const checkBottleneck = (cpu: Cpu, gpu: Gpu): BottleneckAnalysis => {
  const cpuIndex = cpu.benchmarks.gamingScore / 1700;
  const gpuIndex = gpu.benchmarks.rasterScore / 2100;

  const type = detectBottleneckFromIndexes(cpuIndex, gpuIndex);

  const cpuTier = performanceTierFromIndex(cpuIndex);
  const gpuTier = performanceTierFromIndex(gpuIndex);
  const tierDifference = Math.abs(cpuTier - gpuTier);
  const significant = tierDifference > 2;

  const maxIndex = Math.max(cpuIndex, gpuIndex);
  let percentage = 0;

  if (Number.isFinite(maxIndex) && maxIndex > 0) {
    const diff = Math.abs(cpuIndex - gpuIndex);
    percentage = Math.min(100, Math.round((diff / maxIndex) * 100));
  }

  return {
    type,
    percentage,
    cpuTier,
    gpuTier,
    tierDifference,
    significant,
  };
};

export class FPSPredictor {
  estimateBattlefield2042(build: PcBuild, options: FpsPredictorOptions = {}): FpsEstimate | null {
    return this.estimateForGame("Battlefield 2042", build, options);
  }

  estimateForGame(game: GameId, build: PcBuild, options: FpsPredictorOptions = {}): FpsEstimate | null {
    const cpu = build.cpu;
    const gpu = build.gpu;

    if (!cpu || !gpu) return null;

    const resolution: Resolution = options.resolution ?? "1440p";
    const preset: GraphicsPreset = options.preset ?? "high";
    const rayTracing = options.rayTracing ?? false;

    const cpuIndex = cpu.benchmarks.gamingScore / 1700;

    const gpuScore = rayTracing ? gpu.benchmarks.rayTracingScore : gpu.benchmarks.rasterScore;
    const gpuBaseline = rayTracing ? 1800 : 2100;
    const gpuIndex = gpuScore / gpuBaseline;

    const weights = this.weightsForResolution(resolution);
    const compositePerf = weights.cpu * cpuIndex + weights.gpu * gpuIndex;

    const baseFpsAt1080p =
      this.baseFpsAt1080pForPreset(preset) * this.gameDifficultyMultiplier(game);
    const resScale = this.resolutionScale(resolution);
    const rtPenalty = rayTracing ? this.rayTracingPenalty(game) : 1;

    const avg = baseFpsAt1080p * resScale * compositePerf * rtPenalty;

    const bottleneckInfo = checkBottleneck(cpu, gpu);
    const bottleneck = bottleneckInfo.type;

    const low1 = avg * (bottleneck === "cpu" ? 0.72 : bottleneck === "gpu" ? 0.78 : 0.75);
    const min = avg * (bottleneck === "cpu" ? 0.55 : bottleneck === "gpu" ? 0.62 : 0.58);

    return {
      game,
      resolution,
      preset,
      rayTracing,
      avgFps: this.roundFps(avg),
      low1PercentFps: this.roundFps(low1),
      minFps: this.roundFps(min),
      bottleneck,
      bottleneckPercent: bottleneckInfo.percentage,
      significantBottleneck: bottleneckInfo.significant,
    };
  }

  estimateAllGames(build: PcBuild, options: FpsPredictorOptions = {}): FpsEstimate[] {
    const games: GameId[] = [
      "Battlefield 2042",
      "GTA VI (predicted)",
      "Cyberpunk 2077",
      "Warzone 3",
      "Valorant",
    ];

    return games
      .map((game) => this.estimateForGame(game, build, options))
      .filter((e): e is FpsEstimate => e !== null);
  }

  private weightsForResolution(resolution: Resolution): { cpu: number; gpu: number } {
    if (resolution === "1080p") return { cpu: 0.3, gpu: 0.7 };
    if (resolution === "4k") return { cpu: 0.05, gpu: 0.95 };
    return { cpu: 0.15, gpu: 0.85 };
  }

  private baseFpsAt1080pForPreset(preset: GraphicsPreset): number {
    if (preset === "low") return 170;
    if (preset === "medium") return 155;
    if (preset === "ultra") return 120;
    return 140;
  }

  private gameDifficultyMultiplier(game: GameId): number {
    switch (game) {
      case "Valorant":
        return 1.45; // very easy to run
      case "Warzone 3":
        return 0.9; // heavy but better optimised than Cyberpunk
      case "Cyberpunk 2077":
        return 0.7; // extremely demanding
      case "GTA VI (predicted)":
        return 0.78; // heavy open world load
      case "Battlefield 2042":
      default:
        return 1;
    }
  }

  private resolutionScale(resolution: Resolution): number {
    if (resolution === "1080p") return 1;
    if (resolution === "4k") return 0.42;
    return 0.72;
  }

  private rayTracingPenalty(game: GameId): number {
    switch (game) {
      case "Cyberpunk 2077":
        return 0.6;
      case "GTA VI (predicted)":
        return 0.7;
      case "Warzone 3":
        return 0.78;
      case "Valorant":
        return 0.9;
      case "Battlefield 2042":
      default:
        return 0.82;
    }
  }

  private roundFps(value: number): number {
    const clamped = Math.max(5, Math.min(800, value));
    return Math.round(clamped);
  }
}
