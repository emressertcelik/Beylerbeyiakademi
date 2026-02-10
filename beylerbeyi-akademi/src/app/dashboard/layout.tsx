"use client";

import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/types/roles";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AgeGroupProvider, useAgeGroup } from "@/context/AgeGroupContext";

const AGE_GROUPS = ["U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18", "U19"];

const NAV_ITEMS = [
  { href: "/dashboard", label: "Genel Bakış", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" },
  { href: "/dashboard/players", label: "Kadro", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/dashboard/matches", label: "Fikstür", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/dashboard/standings", label: "Puan Durumu", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
  { href: "/dashboard/leaders", label: "Liderler", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { href: "/dashboard/stats", label: "İstatistikler", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
];

const COACH_NAV = [
  { href: "/dashboard/entry", label: "Veri Girişi", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
];

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, role, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { selectedAge, setSelectedAge } = useAgeGroup();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Image src="/Logo_S.png" alt="Beylerbeyi" width={56} height={56} className="object-contain animate-pulse mb-4" />
        <span className="text-sm text-[#6e7781]">Yükleniyor...</span>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = role === "oyuncu"
    ? NAV_ITEMS.filter((i) => ["/dashboard", "/dashboard/stats"].includes(i.href))
    : role === "antrenor"
    ? [...NAV_ITEMS, ...COACH_NAV]
    : [...NAV_ITEMS, ...COACH_NAV];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <div className="h-1 flex flex-shrink-0">
        <div className="flex-1 bg-[#c4111d]" />
        <div className="w-0.5 bg-white" />
        <div className="flex-1 bg-[#1b6e2a]" />
      </div>

      <header className="bg-white border-b border-[#e5e7eb] shadow-sm sticky top-0 z-50">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1 text-[#57606a]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <Image src="/Logo_S.png" alt="Beylerbeyi" width={30} height={30} className="object-contain" />
                <span className="text-[#1a1a1a] font-bold text-sm hidden sm:block">Beylerbeyi Akademi</span>
              </Link>
              {role !== "oyuncu" && (
                <div className="hidden md:flex items-center gap-0.5 ml-4 bg-[#f6f8fa] rounded-lg p-0.5">
                  {AGE_GROUPS.map((ag) => (
                    <button key={ag} onClick={() => setSelectedAge(ag)}
                      className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                        selectedAge === ag ? "bg-[#1b6e2a] text-white shadow-sm" : "text-[#57606a] hover:text-[#1a1a1a]"
                      }`}>{ag}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {role && (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                  role === "yonetici" ? "bg-[#c4111d] text-white" : role === "antrenor" ? "bg-[#1b6e2a] text-white" : "bg-[#f0f0f0] text-[#24292f]"
                }`}>{ROLE_LABELS[role]}</span>
              )}
              <span className="text-[#57606a] text-xs hidden md:block">{user.email}</span>
              <button onClick={handleSignOut} className="px-3 py-1.5 text-xs font-semibold text-[#c4111d] hover:bg-[#fff1f0] border border-[#c4111d]/30 rounded-lg transition-colors">
                Çıkış
              </button>
            </div>
          </div>
          {role !== "oyuncu" && (
            <div className="md:hidden flex gap-0.5 pb-2 overflow-x-auto scrollbar-hide">
              {AGE_GROUPS.map((ag) => (
                <button key={ag} onClick={() => setSelectedAge(ag)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md whitespace-nowrap ${
                    selectedAge === ag ? "bg-[#1b6e2a] text-white" : "bg-[#f6f8fa] text-[#57606a]"
                  }`}>{ag}</button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block w-52 bg-white border-r border-[#e5e7eb] fixed lg:sticky top-[57px] h-[calc(100vh-57px)] z-40 overflow-y-auto`}>
          <nav className="p-2.5 space-y-0.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    active ? "bg-[#1b6e2a]/10 text-[#1b6e2a]" : "text-[#57606a] hover:bg-[#f6f8fa] hover:text-[#1a1a1a]"
                  }`}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-3 left-0 right-0 px-4">
            <div className="flex items-center gap-1.5 text-[#8b949e] text-[10px]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c4111d]" />
              <span>2024-2025</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#1b6e2a]" />
            </div>
          </div>
        </aside>
        {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgeGroupProvider>
      <DashboardInner>{children}</DashboardInner>
    </AgeGroupProvider>
  );
}
