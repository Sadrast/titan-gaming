"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";

import { useCartStore } from "@/store/cart";

const CartSidebar = () => {
  const isOpen = useCartStore((state) => state.isOpen);
  const items = useCartStore((state) => state.items);
  const close = useCartStore((state) => state.close);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = items.reduce((sum, item) => sum + item.priceUsd * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-cyan-500/40 bg-slate-950/95 p-4 shadow-[0_0_40px_rgba(34,211,238,0.7)] backdrop-blur"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100">Cart</h2>
              <button
                type="button"
                onClick={close}
                className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 p-1 text-slate-300 hover:border-cyan-500 hover:text-cyan-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex h-[60vh] flex-col gap-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 p-3">
              {items.length === 0 ? (
                <p className="text-xs text-slate-500">Your cart is empty. Add a console, build, or accessory to get started.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-2 rounded-lg bg-slate-900/80 p-2 text-xs text-slate-200"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {item.kind === "pc_build" ? "Custom PC Build" : item.kind}
                      </p>
                      <p className="mt-1 text-[11px] text-cyan-200">
                        ${item.priceUsd.toFixed(0)} x {item.quantity}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="mt-1 inline-flex items-center justify-center rounded-md border border-red-500/70 bg-red-500/10 p-1 text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 space-y-2 rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-xs text-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-semibold text-cyan-200">${subtotal.toFixed(0)}</span>
              </div>
              <button
                type="button"
                disabled={items.length === 0}
                className={`w-full rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  items.length === 0
                    ? "cursor-not-allowed bg-slate-900 text-slate-500"
                    : "bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.7)] hover:from-cyan-400 hover:to-purple-500"
                }`}
              >
                Proceed to checkout (mock)
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
