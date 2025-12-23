export type CurrencyCode = "USD";

export type Money = {
  currency: CurrencyCode;
  amount: number;
};

export type ComponentKind = "cpu" | "gpu" | "motherboard" | "ram" | "psu";

export type Brand =
  | "AMD"
  | "Intel"
  | "NVIDIA"
  | "ASUS"
  | "MSI"
  | "Gigabyte"
  | "Corsair"
  | "Seasonic"
  | "G.Skill"
  | "NZXT"
  | "Hyte"
  | "Zotac"
  | "Palit"
  | "Crucial"
  | "Samsung"
  | "WD"
  | "Lexar"
  | "Noctua"
  | "DeepCool"
  | "Green";

export type CpuSocket = "AM4" | "AM5" | "LGA1700" | "LGA1851";

export type MemoryStandard = "DDR4" | "DDR5";

export type MotherboardFormFactor = "ATX" | "mATX" | "ITX";

export type PcieGeneration = 3 | 4 | 5;

export type EfficiencyRating = "80+ Gold" | "80+ Platinum" | "80+ Titanium";

export type BaseComponent<K extends ComponentKind = ComponentKind> = {
  id: string;
  kind: K;
  name: string;
  brand: Brand;
  price: Money;
};

export type CpuBenchmarks = {
  gamingScore: number;
  singleCoreScore: number;
  multiCoreScore: number;
};

export type GpuBenchmarks = {
  rasterScore: number;
  rayTracingScore: number;
};

export type Cpu = BaseComponent<"cpu"> & {
  socket: CpuSocket;
  cores: number;
  threads: number;
  baseClockGhz: number;
  boostClockGhz: number;
  tdpW: number;
  benchmarks: CpuBenchmarks;
};

export type Gpu = BaseComponent<"gpu"> & {
  vramGb: number;
  tdpW: number;
  benchmarks: GpuBenchmarks;
};

export type Motherboard = BaseComponent<"motherboard"> & {
  socket: CpuSocket;
  chipset: string;
  formFactor: MotherboardFormFactor;
  memoryStandard: MemoryStandard;
  maxMemoryGb: number;
  pcieGen: PcieGeneration;
};

export type Ram = BaseComponent<"ram"> & {
  memoryStandard: MemoryStandard;
  capacityGb: number;
  modules: number;
  speedMhz: number;
  tdpW: number;
};

export type Psu = BaseComponent<"psu"> & {
  wattageW: number;
  efficiencyRating: EfficiencyRating;
  modular: "full" | "semi" | "non";
};

export type PcComponent = Cpu | Gpu | Motherboard | Ram | Psu;

export type Catalog = {
  cpus: Cpu[];
  gpus: Gpu[];
  motherboards: Motherboard[];
  ramKits: Ram[];
  psus: Psu[];
};

export type PcBuild = {
  cpu?: Cpu;
  gpu?: Gpu;
  motherboard?: Motherboard;
  ram?: Ram;
  psu?: Psu;
};

export type PcBuildIds = {
  cpuId?: string;
  gpuId?: string;
  motherboardId?: string;
  ramId?: string;
  psuId?: string;
};
