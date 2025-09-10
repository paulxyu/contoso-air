"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  // Compute nav items based on auth state
  const navItems = [
    { href: "/book", label: "Book" },
    ...(isAuthenticated ? [{ href: "/booked", label: "My Booked" }] : []),
  ];

  const linkBase =
    "transition-colors hover:text-cyan-400 focus:outline-none focus:text-cyan-400";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#091324]">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 text-lg font-medium text-white md:gap-12 md:px-10 md:py-6 md:text-xl"
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
            onClick={() => setOpen(false)}
            aria-label="Contoso Air Home"
          >
            <Image
              src="/images/logo.svg"
              alt="Contoso Air"
              width={190}
              height={44}
              priority
              className="h-10 w-auto sm:h-12 select-none"
            />
          </Link>
        </div>

        {/* Desktop Nav */}
        <ul className="hidden items-center gap-14 md:flex text-lg md:text-xl">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={linkBase}>
                {item.label}
              </Link>
            </li>
          ))}
          <li className="font-semibold">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  try {
                    logout();
                  } catch {}
                }}
                className="whitespace-nowrap hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded px-1"
                title="Sign out"
              >
                Hi, {user?.username || "Traveler"}
              </button>
            ) : (
              <Link href="/login" className={linkBase}>
                Login
              </Link>
            )}
          </li>
        </ul>

        {/* Mobile toggle */}
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-11 w-11 items-center justify-center rounded border border-white/20 bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <span className="sr-only">Menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              {open ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden border-b border-white/10 bg-[#091324]">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 pb-5 pt-3 text-lg font-medium">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded px-3 py-2 transition-colors hover:bg-white/5 focus:bg-white/10 focus:outline-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-white/10 pt-2 px-3 font-semibold">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    try {
                      logout();
                      setOpen(false);
                    } catch {}
                  }}
                  className="whitespace-nowrap w-full text-left hover:text-cyan-300 focus:outline-none focus:text-cyan-300"
                  title="Sign out"
                >
                  Hi, {user?.username || "Traveler"}
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="transition-colors hover:text-cyan-400 focus:outline-none focus:text-cyan-400"
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
