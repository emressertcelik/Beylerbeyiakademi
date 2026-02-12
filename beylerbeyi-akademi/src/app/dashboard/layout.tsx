"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppDataProvider, useAppData } from "@/lib/app-data";
import { ToastProvider } from "@/components/Toast";
import { Users, LogOut, Home, Menu, X, ChevronRight, Shield, Settings, BarChart3 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Ana Sayfa", icon: Home },
  { href: "/dashboard/players", label: "Oyuncular", icon: Users },
  { href: "/dashboard/teams", label: "Takımlar", icon: Shield },
  { href: "/dashboard/reports", label: "Raporlar", icon: BarChart3 },
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

  return (
    <AppDataProvider>
    <ToastProvider>
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white/95 backdrop-blur-lg border-b border-[#e2e5e9] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="relative">
                <Image
                  src="/Logo_S.png"
                  alt="Logo"
                  width={36}
                  height={36}
                  className="object-contain drop-shadow-sm transition-transform group-hover:scale-105"
                />
              </div>
              <div>
                <p className="text-[15px] font-bold text-[#1a1a2e] leading-tight tracking-tight">
                  Beylerbeyi
                </p>
                <p className="text-[10px] text-[#c4111d] font-semibold uppercase tracking-widest">
                  Akademi
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#c4111d] text-white shadow-sm shadow-[#c4111d]/25"
                        : "text-[#5a6170] hover:text-[#1a1a2e] hover:bg-[#f1f3f5]"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Settings + Logout */}
          <div className="flex items-center gap-1">
            <SettingsMenuButton pathname={pathname} />
            <nav className="flex md:hidden items-center gap-1">
              <MobileNavItems pathname={pathname} />
            </nav>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#5a6170] hover:text-[#c4111d] hover:bg-red-50 transition-all duration-200"
            >
              <LogOut size={16} />
              <span>Çıkış</span>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-[#5a6170] hover:bg-[#f1f3f5] transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#e2e5e9] bg-white animate-slide-up">
            <nav className="p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#c4111d] text-white"
                        : "text-[#5a6170] hover:bg-[#f1f3f5]"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      {item.label}
                    </div>
                    <ChevronRight size={16} className="opacity-40" />
                  </Link>
                );
              })}
              <MobileSettingsMenuLink pathname={pathname} setMenuOpen={setMenuOpen} />
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#c4111d] hover:bg-red-50 transition-all duration-200"
              >
                <LogOut size={20} />
                Çıkış Yap
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
    </ToastProvider>
    </AppDataProvider>
  );
}

// Ayarlar butonunu context ile kontrol eden ayrı bir component
function SettingsMenuButton({ pathname }: { pathname: string }) {
  const { userRole } = useAppData();
  if (userRole?.role === "oyuncu") return null;
  return (
    <Link
      href="/dashboard/settings"
      className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        pathname.startsWith("/dashboard/settings")
          ? "text-[#c4111d] bg-red-50"
          : "text-[#5a6170] hover:text-[#1a1a2e] hover:bg-[#f1f3f5]"
      }`}
    >
      <Settings size={16} />
      <span>Ayarlar</span>
    </Link>
  );
}

// Mobile nav items contextli component
function MobileNavItems({ pathname }: { pathname: string }) {
  const { userRole } = useAppData();
  return (
    <>
      {NAV_ITEMS.filter(item => item.href !== "/dashboard/settings").map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
              isActive
                ? "bg-[#c4111d] text-white shadow-sm shadow-[#c4111d]/25"
                : "text-[#5a6170] hover:text-[#1a1a2e] hover:bg-[#f1f3f5]"
            }`}
          >
            <item.icon size={18} />
          </Link>
        );
      })}
      {/* Ayarlar sadece oyuncu dışı */}
      {userRole?.role !== "oyuncu" && (
        <Link
          href="/dashboard/settings"
          className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
            pathname.startsWith("/dashboard/settings")
              ? "bg-[#c4111d] text-white shadow-sm shadow-[#c4111d]/25"
              : "text-[#5a6170] hover:text-[#1a1a2e] hover:bg-[#f1f3f5]"
          }`}
        >
          <Settings size={18} />
        </Link>
      )}
    </>
  );
}

// Mobile settings menu link contextli component
function MobileSettingsMenuLink({ pathname, setMenuOpen }: { pathname: string, setMenuOpen: (v: boolean) => void }) {
  const { userRole } = useAppData();
  if (userRole?.role === "oyuncu") return null;
  return (
    <Link
      href="/dashboard/settings"
      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        pathname.startsWith("/dashboard/settings")
          ? "bg-[#c4111d] text-white"
          : "text-[#5a6170] hover:bg-[#f1f3f5]"
      }`}
      onClick={() => setMenuOpen(false)}
    >
      <div className="flex items-center gap-3">
        <Settings size={20} />
        Ayarlar
      </div>
      <ChevronRight size={16} className="opacity-40" />
    </Link>
  );
}
