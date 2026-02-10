"use client";

import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/types/roles";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function DashboardPage() {
  const { user, role, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 animate-pulse">
          <Image src="/logo.png" alt="Beylerbeyi" width={56} height={56} className="object-contain" />
        </div>
        <div className="flex items-center gap-2 text-[#6e7781]">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Yükleniyor...</span>
        </div>
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

  const roleBadgeClass = (() => {
    switch (role) {
      case "yonetici":
        return "bg-[#c4111d] text-white";
      case "antrenor":
        return "bg-[#1b6e2a] text-white";
      default:
        return "bg-[#f0f0f0] text-[#24292f]";
    }
  })();

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Üst şerit */}
      <div className="h-1 flex flex-shrink-0">
        <div className="flex-1 bg-[#c4111d]" />
        <div className="w-1 bg-white" />
        <div className="flex-1 bg-[#1b6e2a]" />
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb] flex-shrink-0 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center">
                <Image src="/Logo_S.png" alt="Beylerbeyi" width={30} height={30} className="object-contain" />
              </div>
              <div className="hidden sm:block">
                <span className="text-[#1a1a1a] font-bold text-sm">Beylerbeyi Akademi</span>
                <span className="text-[#8b949e] text-[10px] ml-1.5 font-medium">Yönetim</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {role && (
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${roleBadgeClass}`}>
                  {ROLE_LABELS[role]}
                </span>
              )}
              <span className="text-[#57606a] text-sm hidden md:block">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-xs font-semibold text-[#c4111d] bg-white hover:bg-[#fff1f0] border border-[#c4111d]/30 hover:border-[#c4111d]/50 rounded-lg transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* İçerik */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Karşılama banner */}
        <div className="bg-gradient-to-r from-[#c4111d] to-[#1b6e2a] rounded-2xl p-6 sm:p-8 mb-6 text-white relative overflow-hidden">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
            <Image src="/Logo_S.png" alt="" width={120} height={120} className="object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold relative z-10">Hoş Geldiniz 👋</h1>
          <p className="mt-1 text-white/70 text-sm relative z-10">
            Beylerbeyi Futbol Akademi yönetim paneli
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Hesap */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center">
                <Image src="/Logo_S.png" alt="Beylerbeyi" width={30} height={30} className="object-contain" />
              </div>
              <h3 className="text-[#1a1a1a] font-semibold text-sm">Hesap</h3>
            </div>
            <p className="text-[#57606a] text-sm truncate">{user.email}</p>
            <p className="text-[#8b949e] text-xs mt-1 font-mono">ID: {user.id.slice(0, 8)}</p>
          </div>

          {/* Yetki */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center">
                <Image src="/Logo_S.png" alt="Beylerbeyi" width={30} height={30} className="object-contain" />
              </div>
              <h3 className="text-[#1a1a1a] font-semibold text-sm">Yetki</h3>
            </div>
            <p className="text-[#57606a] text-sm">{role ? ROLE_LABELS[role] : "—"}</p>
            <p className="text-[#8b949e] text-xs mt-1">Seviye: {role || "—"}</p>
          </div>

          {/* Durum */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center">
                <Image src="/Logo_S.png" alt="Beylerbeyi" width={30} height={30} className="object-contain" />
              </div>
              <h3 className="text-[#1a1a1a] font-semibold text-sm">Durum</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1b6e2a] animate-pulse" />
              <p className="text-[#1b6e2a] text-sm font-semibold">Aktif</p>
            </div>
            <p className="text-[#8b949e] text-xs mt-1">Oturum açık</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb] bg-white flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <p className="text-[#8b949e] text-xs">&copy; {new Date().getFullYear()} Beylerbeyi Futbol Akademi</p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#c4111d]" />
            <span className="text-[#8b949e] text-[11px] font-semibold">1911</span>
            <div className="w-2 h-2 rounded-full bg-[#1b6e2a]" />
          </div>
        </div>
      </footer>
    </div>
  );
}
