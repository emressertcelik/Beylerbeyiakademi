"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppDataProvider, useAppData } from "@/lib/app-data";
import { ToastProvider } from "@/components/Toast";
import { Users, LogOut, Home, Menu, X, ChevronRight, Shield, Settings, BarChart3, User, Binoculars, CalendarDays, ClipboardList } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Ana Sayfa", icon: Home },
  { href: "/dashboard/players", label: "Oyuncular", icon: Users },
  { href: "/dashboard/teams", label: "Takımlar", icon: Shield },
];

// Antrenör bölümünün alt sekmeler
const ANTRENOR_SUB_ITEMS = [
  { href: "/dashboard/antrenor/antrenman-programi", label: "Antrenman Programı", icon: CalendarDays },
  { href: "/dashboard/antrenor/antrenman-raporu", label: "Antrenman Raporu", icon: BarChart3 },
  { href: "/dashboard/player-pool", label: "Oyuncu İzleme", icon: Binoculars },
  { href: "/dashboard/reports", label: "Oyuncu Raporları", icon: BarChart3 },
];

// Antrenör bölümü ana nav linki
const ANTRENOR_HREF = "/dashboard/antrenor/antrenman-programi";

// Antrenör bölümüne dahil path'ler (aktiflik kontrolü için)
function isAntrenorPath(pathname: string | null): boolean {
  return !!(
    pathname?.startsWith("/dashboard/antrenor") ||
    pathname?.startsWith("/dashboard/player-pool") ||
    pathname?.startsWith("/dashboard/reports")
  );
}


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
                    : pathname?.startsWith(item.href);
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
              <AntrenorNavTab pathname={pathname} />
            </nav>
          </div>

          {/* Right: User Info + Settings + Logout */}
          <div className="flex items-center gap-1">
            <div className="hidden md:block">
              <UserInfoBadge />
            </div>
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

        {/* Antrenör Alt Navigasyon (Antrenör bölümündeyken göster) */}
        <AntrenorSubNav pathname={pathname} />

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#e2e5e9] bg-white animate-slide-up">
            <nav className="p-3 space-y-1">
              {/* Kullanıcı bilgisi */}
              <div className="px-4 py-2 mb-1">
                <UserInfoBadge />
              </div>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname?.startsWith(item.href);
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
              <MobileAntrenorSection pathname={pathname} setMenuOpen={setMenuOpen} />
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
function SettingsMenuButton({ pathname }: { pathname: string | null }) {
  const { userRole } = useAppData();
  if (userRole?.role === "oyuncu") return null;
  return (
    <Link
      href="/dashboard/settings"
      className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        pathname?.startsWith("/dashboard/settings")
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
function MobileNavItems({ pathname }: { pathname: string | null }) {
  const { userRole } = useAppData();
  return (
    <>
      {NAV_ITEMS.filter(item => item.href !== "/dashboard/settings").map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname?.startsWith(item.href);
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
      {/* Antrenör ikonu - sadece oyuncu dışı */}
      {userRole?.role !== "oyuncu" && (
        <Link
          href={ANTRENOR_HREF}
          className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
            isAntrenorPath(pathname)
              ? "bg-[#c4111d] text-white shadow-sm shadow-[#c4111d]/25"
              : "text-[#5a6170] hover:text-[#1a1a2e] hover:bg-[#f1f3f5]"
          }`}
        >
          <ClipboardList size={18} />
        </Link>
      )}
      {/* Ayarlar sadece oyuncu dışı */}
      {userRole?.role !== "oyuncu" && (
        <Link
          href="/dashboard/settings"
          className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
            pathname?.startsWith("/dashboard/settings")
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
function MobileSettingsMenuLink({ pathname, setMenuOpen }: { pathname: string | null, setMenuOpen: (v: boolean) => void }) {
  const { userRole } = useAppData();
  if (userRole?.role === "oyuncu") return null;
  return (
    <Link
      href="/dashboard/settings"
      className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        pathname?.startsWith("/dashboard/settings")
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

// Desktop'ta Antrenör nav sekmesi (sadece antrenör ve yönetici için)
function AntrenorNavTab({ pathname }: { pathname: string | null }) {
  const { userRole } = useAppData();
  if (userRole?.role === "oyuncu") return null;
  const isActive = isAntrenorPath(pathname);
  return (
    <Link
      href={ANTRENOR_HREF}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? "bg-[#c4111d] text-white shadow-sm shadow-[#c4111d]/25"
          : "text-[#5a6170] hover:text-[#1a1a2e] hover:bg-[#f1f3f5]"
      }`}
    >
      <ClipboardList size={18} />
      Antrenör
    </Link>
  );
}

// Antrenör bölümü alt navigasyonu (ana nav'ın altında şerit olarak gösterilir)
function AntrenorSubNav({ pathname }: { pathname: string | null }) {
  const { userRole } = useAppData();
  if (userRole?.role === "oyuncu") return null;
  if (!isAntrenorPath(pathname)) return null;

  return (
    <div className="border-t border-[#e2e5e9] bg-[#fafbfc]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-hide">
          {ANTRENOR_SUB_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-[#c4111d]/10 text-[#c4111d] font-semibold"
                    : "text-[#5a6170] hover:text-[#1a1a2e] hover:bg-[#f1f3f5]"
                }`}
              >
                <item.icon size={13} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Mobile Antrenör bölümü (gruplandırılmış gösterim)
function MobileAntrenorSection({
  pathname,
  setMenuOpen,
}: {
  pathname: string | null;
  setMenuOpen: (v: boolean) => void;
}) {
  const { userRole } = useAppData();
  if (userRole?.role === "oyuncu") return null;

  const isAntrenorActive = isAntrenorPath(pathname);

  return (
    <div>
      {/* Ana Antrenör başlığı */}
      <Link
        href={ANTRENOR_HREF}
        onClick={() => setMenuOpen(false)}
        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isAntrenorActive
            ? "bg-[#c4111d] text-white"
            : "text-[#5a6170] hover:bg-[#f1f3f5]"
        }`}
      >
        <div className="flex items-center gap-3">
          <ClipboardList size={20} />
          Antrenör
        </div>
        <ChevronRight size={16} className="opacity-40" />
      </Link>

      {/* Alt sekmeler — Antrenör bölümündeyken görünür */}
      {isAntrenorActive && (
        <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-[#c4111d]/20 pl-3">
          {ANTRENOR_SUB_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "text-[#c4111d] bg-red-50 font-semibold"
                    : "text-[#5a6170] hover:bg-[#f1f3f5]"
                }`}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Kullanıcı bilgi badge'i
function UserInfoBadge() {
  const { userRole, userEmail } = useAppData();

  const roleLabel =
    userRole?.role === "yonetici"
      ? "Yönetici"
      : userRole?.role === "antrenor"
      ? "Antrenör"
      : userRole?.role === "oyuncu"
      ? "Oyuncu"
      : "";

  const displayName = userEmail || "Yükleniyor...";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f1f3f5] text-xs">
      <User size={14} className="text-[#5a6170] shrink-0" />
      <div className="flex flex-col leading-tight">
        <span className="font-medium text-[#1a1a2e] truncate max-w-[140px]">{displayName}</span>
        {roleLabel && (
          <span className="text-[10px] text-[#c4111d] font-semibold uppercase">{roleLabel}{userRole?.age_group ? ` · ${userRole.age_group}` : ""}</span>
        )}
      </div>
    </div>
  );
}
