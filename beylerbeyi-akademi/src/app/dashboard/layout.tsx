"use client";

import Link from "next/link";
import Image from "next/image";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f8fa] via-[#f9fafc] to-[#eaf0f6] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-[#e5e7eb]/60 shadow-lg flex flex-col fixed h-full z-30 animate-slide-in-left">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[#e5e7eb]/60">
          <Image src="/Logo_S.png" alt="Logo" width={36} height={36} className="object-contain drop-shadow-md" />
          <div>
            <p className="text-sm font-bold text-[#1a1a1a] leading-tight">Beylerbeyi</p>
            <p className="text-[10px] text-[#6e7781] font-medium">Futbol Akademi</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-[#c4111d]/10 to-[#c4111d]/5 text-[#c4111d] shadow-md"
                    : "text-[#57606a] hover:bg-[#f6f8fa] hover:text-[#1a1a1a]"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-[#e5e7eb]/60">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#57606a] hover:bg-gradient-to-r hover:from-red-50 hover:to-[#c4111d]/10 hover:text-[#c4111d] transition-all duration-300 w-full"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-64 animate-fade-in">
        {/* Top bar */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-[#e5e7eb]/60 flex items-center px-8 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-6 rounded-full bg-[#c4111d]" />
            <div className="h-1.5 w-3 rounded-full bg-[#1b6e2a]" />
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
