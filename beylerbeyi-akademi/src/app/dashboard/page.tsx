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
      <div className="min-h-screen flex items-center justify-center bg-bb-dark">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo.png"
            alt="Beylerbeyi"
            width={64}
            height={64}
            className="animate-pulse"
          />
          <div className="flex items-center gap-3 text-slate-400">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Yükleniyor...</span>
          </div>
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
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bb-dark via-bb-dark-light to-bb-dark">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/[0.03] backdrop-blur-xl">
        {/* Üst kırmızı-yeşil şerit */}
        <div className="h-1 flex">
          <div className="flex-1 bg-bb-red" />
          <div className="flex-1 bg-bb-green" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Beylerbeyi"
                width={36}
                height={36}
              />
              <div>
                <span className="text-white font-semibold text-lg leading-tight block">
                  Beylerbeyi Akademi
                </span>
                <span className="text-bb-green-light text-[10px] font-medium tracking-widest uppercase leading-tight">
                  Yönetim Sistemi
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {role && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-bb-green/10 text-bb-green-light border border-bb-green/20">
                  {ROLE_LABELS[role]}
                </span>
              )}
              <span className="text-slate-400 text-sm hidden sm:block">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-bb-red/20 border border-white/10 hover:border-bb-red/30 rounded-lg transition-all duration-200"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* İçerik */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Hoş Geldiniz!</h1>
          <p className="mt-2 text-slate-400">
            Beylerbeyi Futbol Akademi yönetim paneline başarıyla giriş
            yaptınız.
          </p>
        </div>

        {/* Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Kullanıcı Bilgisi */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-bb-green/20 transition-all duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-bb-green opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-bb-green/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-bb-green-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-medium">Kullanıcı Bilgisi</h3>
            </div>
            <p className="text-slate-400 text-sm">{user.email}</p>
            <p className="text-slate-500 text-xs mt-1">
              ID: {user.id.slice(0, 8)}...
            </p>
          </div>

          {/* Rol */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-bb-red/20 transition-all duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-bb-red opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-bb-red/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-bb-red-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-medium">Rol</h3>
            </div>
            <p className="text-slate-400 text-sm">
              {role ? ROLE_LABELS[role] : "Yükleniyor..."}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Yetki seviyesi: {role || "-"}
            </p>
          </div>

          {/* Durum */}
          <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-bb-green/20 transition-all duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-bb-green opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-medium">Durum</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-bb-green animate-pulse" />
              <p className="text-bb-green-light text-sm font-medium">Aktif</p>
            </div>
            <p className="text-slate-500 text-xs mt-1">Oturum açık</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} Beylerbeyi Futbol Akademi
          </p>
          <p className="text-slate-700 text-xs">
            Est. 1911
          </p>
        </div>
      </footer>
    </div>
  );
}
