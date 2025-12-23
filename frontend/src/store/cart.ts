"use client";

import { create } from "zustand";

export type CartItemKind = "pc_build" | "console" | "peripheral" | "prebuilt";

export type CartItem = {
  id: string;
  kind: CartItemKind;
  name: string;
  priceUsd: number;
  quantity: number;
  imageUrl?: string;
  meta?: Record<string, unknown>;
};

export type CartState = {
  isOpen: boolean;
  items: CartItem[];
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  isOpen: false,
  items: [],
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  addItem: (item, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            ...item,
            quantity,
          },
        ],
      };
    }),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
  clear: () => set({ items: [] }),
}));
