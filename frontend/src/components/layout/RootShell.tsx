"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import Navbar from "@/components/layout/Navbar";
import CartSidebar from "@/components/cart/CartSidebar";

type RootShellProps = {
  children: ReactNode;
};

const RootShell = ({ children }: RootShellProps) => {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#020617,_#020617_45%,_#000000_100%)] text-slate-100">
        <Navbar />
        <CartSidebar />
        <main className="mx-auto flex max-w-6xl flex-col px-4 pb-12 pt-20 lg:px-8">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
};

export default RootShell;
