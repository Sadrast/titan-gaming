"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cpu, Gamepad2, Headphones, ShoppingCart, X, ExternalLink } from "lucide-react";

import { useCartStore } from "@/store/cart";
import {
  sampleConsoles,
  samplePeripherals,
  samplePrebuiltPcs,
  type StoreProductCategory,
  type BaseStoreProduct,
} from "@shared/sampleData";

const routeCategories = ["consoles", "peripherals", "prebuilt"] as const;

type RouteCategory = (typeof routeCategories)[number];

type CategoryMeta = {
  label: string;
  description: string;
  icon: ReactNode;
};

const metaByRoute: Record<RouteCategory, CategoryMeta> = {
  consoles: {
    label: "Consoles",
    description: "PS5, Xbox Series X and Nintendo Switch ready to plug in and play.",
    icon: <Gamepad2 className="h-4 w-4" />,
  },
  peripherals: {
    label: "Accessories",
    description: "Keyboards, mice and headsets tuned for esports and late-night raids.",
    icon: <Headphones className="h-4 w-4" />,
  },
  prebuilt: {
    label: "Pre-built PCs",
    description: "Curated rigs with balanced CPUs, GPUs and power delivery.",
    icon: <Cpu className="h-4 w-4" />,
  },
};

const mapRouteToStoreCategory = (route: RouteCategory): StoreProductCategory => {
  if (route === "consoles") return "console";
  if (route === "peripherals") return "peripheral";
  return "prebuilt";
};

const getProducts = (route: RouteCategory): BaseStoreProduct[] => {
  switch (route) {
    case "consoles":
      return sampleConsoles;
    case "peripherals":
      return samplePeripherals;
    case "prebuilt":
      return samplePrebuiltPcs;
    default:
      return [];
  }
};

const getCartKindForRoute = (route: RouteCategory) => {
  if (route === "consoles") return "console" as const;
  if (route === "peripherals") return "peripheral" as const;
  return "prebuilt" as const;
};

const amazonSearchUrlForName = (name: string) => {
  const query = encodeURIComponent(`${name} gaming`);
  return `https://www.amazon.com/s?k=${query}`;
};

type ShopCategoryClientProps = {
  category: string;
};

const ShopCategoryClient = ({ category }: ShopCategoryClientProps) => {
  const normalizedCategory = category.toLowerCase();
  const routeCategory = routeCategories.includes(normalizedCategory as RouteCategory)
    ? (normalizedCategory as RouteCategory)
    : null;

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.open);

  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  const meta = routeCategory ? metaByRoute[routeCategory] : null;

  const products = useMemo(
    () => (routeCategory ? getProducts(routeCategory) : []),
    [routeCategory]
  );

  const quickViewProduct =
    quickViewId && products.find((product) => product.id === quickViewId)
      ? products.find((product) => product.id === quickViewId) || null
      : null;

  const handleAddToCart = (product: BaseStoreProduct) => {
    if (!routeCategory) return;

    const kind = getCartKindForRoute(routeCategory);
    addItem(
      {
        id: product.id,
        kind,
        name: product.name,
        priceUsd: product.priceUsd,
        imageUrl: product.imageUrl,
        meta: {
          category: mapRouteToStoreCategory(routeCategory),
          tags: product.tags,
        },
      },
      1
    );
    openCart();
  };

  if (!routeCategory || !meta) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-10 text-center text-sm text-slate-300">
        <p className="mb-2 text-base font-semibold text-slate-100">Category not found</p>
        <p className="max-w-sm text-xs text-slate-400">
          The requested category does not exist. Try visiting Consoles, Accessories or Pre-built PCs from the
          navigation bar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 py-6 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="space-y-3"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-cyan-200">
          {meta.icon}
          <span>{meta.label}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
          {meta.label} catalog
        </h1>
        <p className="max-w-xl text-xs text-slate-400 sm:text-sm">{meta.description}</p>
      </motion.div>

      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4, ease: "easeOut" }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-[0_0_22px_rgba(15,23,42,0.9)]"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.08 + index * 0.03, duration: 0.35, ease: "easeOut" }}
          >
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-50">{product.name}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{product.shortDescription}</p>
                </div>
                <span className="text-[11px] font-semibold text-cyan-200">
                  ${product.priceUsd.toFixed(0)}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-400">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-1 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setQuickViewId(product.id)}
                  className="inline-flex items-center justify-center rounded-md border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-slate-200 hover:border-cyan-400 hover:text-cyan-200"
                >
                  Quick view
                </button>
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-cyan-500 to-purple-600 px-3 py-1.5 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.75)] hover:from-cyan-400 hover:to-purple-500"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Add to cart</span>
                </button>
              </div>
              <a
                href={amazonSearchUrlForName(product.name)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-cyan-300 hover:text-cyan-200"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Check price on Amazon</span>
              </a>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-cyan-500/50 bg-slate-950/95 p-4 shadow-[0_0_36px_rgba(34,211,238,0.8)]"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-50">{quickViewProduct.name}</p>
                  <p className="text-[11px] text-slate-400">{quickViewProduct.shortDescription}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickViewId(null)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 hover:border-cyan-400 hover:text-cyan-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
                <span>Price</span>
                <span className="font-semibold text-cyan-200">
                  ${quickViewProduct.priceUsd.toFixed(0)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1 text-[10px] text-slate-400">
                {quickViewProduct.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex justify-end gap-2 text-[11px]">
                <a
                  href={amazonSearchUrlForName(quickViewProduct.name)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-cyan-200 hover:border-cyan-400 hover:text-cyan-100"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Check price on Amazon</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    handleAddToCart(quickViewProduct);
                    setQuickViewId(null);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-cyan-500 to-purple-600 px-3 py-1.5 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.8)] hover:from-cyan-400 hover:to-purple-500"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span>Add to cart</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopCategoryClient;
