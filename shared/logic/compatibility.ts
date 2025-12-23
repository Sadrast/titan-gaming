import type { Catalog, PcBuild, PcBuildIds } from "../types";

export type CompatibilityIssueSeverity = "error" | "warning";

export type CompatibilityIssueCode =
  | "missing_cpu"
  | "missing_gpu"
  | "missing_motherboard"
  | "missing_ram"
  | "missing_psu"
  | "cpu_socket_mismatch"
  | "ram_standard_mismatch"
  | "psu_insufficient_wattage";

export type CompatibilityIssue = {
  severity: CompatibilityIssueSeverity;
  code: CompatibilityIssueCode;
  message: string;
};

export type BuildPowerSummary = {
  cpuTdpW: number;
  gpuTdpW: number;
  ramTdpW: number;
  baseSystemW: number;
  totalTdpW: number;
  recommendedPsuW: number;
};

export type CompatibilityReport = {
  ok: boolean;
  issues: CompatibilityIssue[];
  power: BuildPowerSummary;
};

export const DEFAULT_BASE_SYSTEM_W = 60;
export const DEFAULT_PSU_HEADROOM_FACTOR = 1.5;

const roundUpToNearest = (value: number, step: number): number => {
  if (step <= 0) return Math.ceil(value);
  return Math.ceil(value / step) * step;
};

export const calculatePowerSummary = (
  build: PcBuild,
  options: {
    baseSystemW?: number;
    psuHeadroomFactor?: number;
  } = {}
): BuildPowerSummary => {
  const baseSystemW = options.baseSystemW ?? DEFAULT_BASE_SYSTEM_W;
  const psuHeadroomFactor = options.psuHeadroomFactor ?? DEFAULT_PSU_HEADROOM_FACTOR;

  const cpuTdpW = build.cpu?.tdpW ?? 0;
  const gpuTdpW = build.gpu?.tdpW ?? 0;
  const ramTdpW = build.ram?.tdpW ?? 0;

  const totalTdpW = cpuTdpW + gpuTdpW + ramTdpW + baseSystemW;

  const recommendedPsuW = roundUpToNearest(totalTdpW * psuHeadroomFactor, 50);

  return {
    cpuTdpW,
    gpuTdpW,
    ramTdpW,
    baseSystemW,
    totalTdpW,
    recommendedPsuW,
  };
};

export const checkCompatibility = (
  build: PcBuild,
  options: {
    baseSystemW?: number;
    psuHeadroomFactor?: number;
  } = {}
): CompatibilityReport => {
  const issues: CompatibilityIssue[] = [];

  if (!build.cpu) {
    issues.push({
      severity: "warning",
      code: "missing_cpu",
      message: "Select a CPU to validate socket compatibility and estimate FPS.",
    });
  }

  if (!build.gpu) {
    issues.push({
      severity: "warning",
      code: "missing_gpu",
      message: "Select a GPU to estimate FPS and power requirements.",
    });
  }

  if (!build.motherboard) {
    issues.push({
      severity: "warning",
      code: "missing_motherboard",
      message: "Select a motherboard to validate CPU socket and memory standard.",
    });
  }

  if (!build.ram) {
    issues.push({
      severity: "warning",
      code: "missing_ram",
      message: "Select RAM to validate memory standard (DDR4/DDR5).",
    });
  }

  if (!build.psu) {
    issues.push({
      severity: "warning",
      code: "missing_psu",
      message: "Select a PSU to validate power headroom.",
    });
  }

  if (build.cpu && build.motherboard && build.cpu.socket !== build.motherboard.socket) {
    issues.push({
      severity: "error",
      code: "cpu_socket_mismatch",
      message: `CPU socket (${build.cpu.socket}) does not match motherboard socket (${build.motherboard.socket}).`,
    });
  }

  if (build.ram && build.motherboard && build.ram.memoryStandard !== build.motherboard.memoryStandard) {
    issues.push({
      severity: "error",
      code: "ram_standard_mismatch",
      message: `RAM standard (${build.ram.memoryStandard}) does not match motherboard memory standard (${build.motherboard.memoryStandard}).`,
    });
  }

  const power = calculatePowerSummary(build, options);

  if (build.psu && build.psu.wattageW < power.recommendedPsuW) {
    issues.push({
      severity: "error",
      code: "psu_insufficient_wattage",
      message: `PSU wattage (${build.psu.wattageW}W) is below the recommended ${power.recommendedPsuW}W for this build.`,
    });
  }

  const ok = !issues.some((issue) => issue.severity === "error");

  return { ok, issues, power };
};

const findById = <T extends { id: string }>(items: T[], id?: string): T | undefined => {
  if (!id) return undefined;
  return items.find((item) => item.id === id);
};

export const buildFromIds = (ids: PcBuildIds, catalog: Catalog): PcBuild => {
  return {
    cpu: findById(catalog.cpus, ids.cpuId),
    gpu: findById(catalog.gpus, ids.gpuId),
    motherboard: findById(catalog.motherboards, ids.motherboardId),
    ram: findById(catalog.ramKits, ids.ramId),
    psu: findById(catalog.psus, ids.psuId),
  };
};
