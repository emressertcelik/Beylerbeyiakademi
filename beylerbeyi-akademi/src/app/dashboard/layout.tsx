"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Users, LogOut, Home } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Ana Sayfa", icon: Home },
  { href: "/dashboard/players", label: "Oyuncular", icon: Users },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const [menuOpen, setMenuOpen] = useState(false);
  // Mock user info for display
  const user = { name: "Mehmet Yılmaz", email: "mehmetyilmaz@example.com" };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c4111d]/20 via-[#f9fafc] to-[#c4111d]/40 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white shadow-md border-b border-[#e5e7eb]/60 sticky top-0 z-30">
        <div className="flex items-center px-2 py-2 md:px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src="/Logo_S.png" alt="Logo" width={28} height={28} className="object-contain drop-shadow-md" />
            <div>
              <p className="text-sm font-bold text-[#c4111d] leading-tight">Beylerbeyi</p>
              <p className="text-[10px] text-[#c4111d] font-medium">Futbol Akademi</p>
            </div>
          </div>
          {/* Hamburger for mobile */}
          <button className="md:hidden ml-auto p-1 rounded-lg bg-[#c4111d] text-white shadow-sm transition-all duration-300 border border-[#c4111d]/60" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>
        <div className="w-full flex items-center mt-1">
          <nav className="hidden md:flex gap-1 bg-[#c4111d]/30 rounded-lg px-1 py-1 shadow-sm mx-auto max-w-xs border border-[#c4111d]/30">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all duration-300 font-sans border-2 ${
                    isActive
                      ? "bg-[#c4111d] text-white border-[#c4111d] shadow-md"
                      : "text-[#c4111d] border-transparent hover:bg-[#c4111d]/40 hover:text-white hover:border-[#c4111d]"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={handleLogout}
            className="ml-auto flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold text-white bg-[#c4111d] hover:bg-[#a50e18] shadow-md transition-all duration-300 font-sans focus:ring-2 focus:ring-[#c4111d]/20 border-2 border-[#c4111d]"
          >
            <div className="flex flex-col items-end mr-1">
              <span className="text-[11px] font-medium text-white">{user.name}</span>
              <span className="text-[10px] text-white/80">{user.email}</span>
            </div>
            <LogOut size={16} />
            Çıkış
          </button>
        </div>
        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden flex flex-col gap-2 px-2 pb-3 bg-[#c4111d]/20 rounded-lg mt-2 shadow-sm max-w-xs mx-auto border border-[#c4111d]/30">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-semibold transition-all duration-300 font-sans ${
                    isActive
                      ? "bg-[#c4111d] text-white shadow-md"
                      : "text-[#c4111d] hover:bg-[#c4111d]/30 hover:text-white"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => { setMenuOpen(false); handleLogout(); }}
              className="ml-auto flex items-center gap-2 px-3 py-1 rounded-md text-sm font-semibold text-white bg-[#c4111d] hover:bg-[#a50e18] shadow-md transition-all duration-300 font-sans focus:ring-2 focus:ring-[#c4111d]/20"
            >
              <div className="flex flex-col items-end mr-1">
                <span className="text-[11px] font-medium text-white">{user.name}</span>
                <span className="text-[10px] text-white/80">{user.email}</span>
              </div>
              <LogOut size={16} />
              Çıkış
            </button>
          </nav>
        )}
      </header>
      {/* Content */}
      <main className="flex-1 w-full animate-fade-in bg-[#f9fafc]">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
