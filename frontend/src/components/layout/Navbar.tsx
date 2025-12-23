"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Gamepad2, LogIn, LogOut, ShoppingCart } from "lucide-react";

import { useCartStore } from "@/store/cart";

const links = [
  { href: "/", label: "Home" },
  { href: "/builder", label: "PC Builder" },
  { href: "/shop/consoles", label: "Consoles" },
  { href: "/shop/peripherals", label: "Accessories" },
  { href: "/shop/prebuilt", label: "Pre-built PCs" },
  { href: "/dashboard", label: "Dashboard" },
];

const Navbar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const toggle = useCartStore((state) => state.toggle);
  const count = useCartStore(
    (state) => state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-cyan-500/30 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-cyan-200">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.7)]">
            <Gamepad2 className="h-4 w-4" />
          </span>
          <span className="hidden text-xs uppercase tracking-[0.25em] text-slate-300 sm:inline">
            TitanGaming
          </span>
        </Link>

        <nav className="hidden items-center gap-4 text-xs font-medium text-slate-300 md:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  "relative px-2 py-1 transition-colors " +
                  (active
                    ? "text-cyan-200"
                    : "text-slate-400 hover:text-cyan-200")
                }
              >
                {active && (
                  <span className="absolute inset-x-1 -bottom-1 h-px bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400" />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {status !== "loading" && (
            <button
              type="button"
              onClick={() =>
                status === "authenticated" ? signOut() : signIn("google")
              }
              className="hidden items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-[11px] font-medium text-slate-200 hover:border-cyan-400 hover:text-cyan-100 sm:inline-flex"
            >
              {status === "authenticated" ? (
                <>
                  {session?.user?.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.user.image}
                      alt={session.user.name ?? "Profile"}
                      className="h-5 w-5 rounded-full border border-cyan-500/70 object-cover"
                    />
                  )}
                  <span className="max-w-[8rem] truncate text-[10px] text-slate-300">
                    {session?.user?.name ?? "Signed in"}
                  </span>
                  <LogOut className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={toggle}
            className="relative inline-flex items-center gap-2 rounded-full border border-cyan-500/60 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.5)] transition-colors hover:bg-cyan-500/10"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="inline-flex min-w-[1.25rem] justify-center rounded-full bg-cyan-500 px-1 text-[10px] font-semibold text-slate-950">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
