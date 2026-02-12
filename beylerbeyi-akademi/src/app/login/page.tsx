"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Bir hata oluştu";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sol panel — kırmızı-yeşil gradient */}
      <div className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden">
        {/* Üst kırmızı alan */}
        <div className="flex-1 bg-[#c4111d] relative flex items-end justify-center pb-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#d42630] to-[#a50e18]" />
          <div className="relative z-10 text-center pb-10">
            <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-6">
              <Image
                src="/Logo_S.png"
                alt="Beylerbeyi Futbol Akademi"
                width={112}
                height={112}
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>
        </div>

        {/* Alt yeşil alan */}
        <div className="flex-1 bg-[#1b6e2a] relative flex items-start justify-center pt-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1b6e2a] to-[#145220]" />
          <div className="relative z-10 text-center pt-8 px-12">
            <h1 className="text-white text-3xl xl:text-4xl font-bold leading-tight mb-2">
              Beylerbeyi
            </h1>
            <h2 className="text-white/80 text-xl font-semibold mb-4">
              Futbol Akademi
            </h2>
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-8 bg-white/30" />
              <span className="text-white/40 text-[11px] font-bold tracking-[0.3em] uppercase">
                Yönetim Sistemi
              </span>
              <div className="h-px w-8 bg-white/30" />
            </div>
            <p className="text-white/35 text-sm max-w-[260px] mx-auto leading-relaxed">
              Geleceğin futbolcularını yetiştiriyoruz.
            </p>

            <div className="mt-10 flex items-center justify-center gap-2 text-white/20 text-xs">
              <div className="w-2 h-2 rounded-full bg-[#c4111d]" />
              <span className="font-medium">1911</span>
              <div className="w-2 h-2 rounded-full bg-white/30" />
            </div>
          </div>
        </div>

        {/* Ortadaki beyaz şerit */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-white z-20" />
      </div>

      {/* Sağ panel (form) */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 w-full max-w-full">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-[#e2e5e9]"
        >
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <Image
                  src="/Logo_S.png"
                  alt="Beylerbeyi"
                  width={80}
                  height={80}
                  className="object-contain drop-shadow-md"
                  priority
                />
              </div>
              <h1 className="text-[#1a1a1a] text-lg font-bold">Beylerbeyi Akademi</h1>
              <p className="text-[#6e7781] text-xs mt-0.5">Yönetim Sistemi</p>
            </div>

            <div className="mb-7">
              <h2 className="text-[#1a1a1a] text-xl font-bold mb-1">Giriş Yap</h2>
              <p className="text-[#6e7781] text-sm">Panele erişmek için giriş yapın</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-[13px] font-semibold text-[#24292f] mb-1.5">
                  E-posta
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                  className="w-full px-3 py-2.5 bg-white border border-[#d0d7de] rounded-lg text-[#1a1a1a] text-sm placeholder-[#8b949e] focus:outline-none focus:border-[#1b6e2a] focus:ring-2 focus:ring-[#1b6e2a]/15 transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[13px] font-semibold text-[#24292f] mb-1.5">
                  Şifre
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 bg-white border border-[#d0d7de] rounded-lg text-[#1a1a1a] text-sm placeholder-[#8b949e] focus:outline-none focus:border-[#1b6e2a] focus:ring-2 focus:ring-[#1b6e2a]/15 transition-all"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3 bg-[#fff1f0] border border-[#c4111d]/20 rounded-lg">
                  <svg className="w-4 h-4 text-[#c4111d] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[#82071e] text-sm leading-snug">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-1 bg-[#c4111d] hover:bg-[#a50e18] active:bg-[#8a0b14] text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-[#c4111d]/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Giriş yapılıyor...
                  </span>
                ) : (
                  "Giriş Yap"
                )}
              </button>
            </form>

            <div className="mt-12 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#c4111d]/30" />
              <p className="text-[#8b949e] text-[11px]">
                &copy; {new Date().getFullYear()} Beylerbeyi Futbol Akademi
              </p>
              <div className="w-2 h-2 rounded-full bg-[#1b6e2a]/30" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
