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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bb-dark via-bb-dark-light to-bb-dark relative overflow-hidden">
      {/* Dekoratif arka plan elementleri */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-bb-red/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-bb-green/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-bb-dark-card/30 blur-3xl" />
      </div>

      {/* Kırmızı-Yeşil çizgi deseni */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #E30A17 0px, #E30A17 2px, transparent 2px, transparent 20px, #00843D 20px, #00843D 22px, transparent 22px, transparent 40px)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Logo & Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
            <Image
              src="/logo.jpg"
              alt="Beylerbeyi Futbol Akademi"
              width={96}
              height={96}
              className="drop-shadow-2xl"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Beylerbeyi Futbol Akademi
          </h1>
          <p className="mt-1 text-sm font-medium text-bb-green-light tracking-widest uppercase">
            Yönetim Sistemi
          </p>
          <p className="mt-3 text-slate-400 text-sm">
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Form Kartı */}
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Kart üst kırmızı-yeşil şerit */}
          <div className="absolute top-0 left-0 right-0 h-1 flex">
            <div className="flex-1 bg-bb-red" />
            <div className="flex-1 bg-bb-green" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {/* E-posta */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-bb-green/50 focus:border-bb-green/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-bb-green/50 focus:border-bb-green/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-bb-red/10 border border-bb-red/20 rounded-xl text-red-300 text-sm">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-bb-red to-bb-red-dark hover:from-bb-red-dark hover:to-bb-red text-white font-semibold rounded-xl shadow-lg shadow-bb-red/25 focus:outline-none focus:ring-2 focus:ring-bb-red/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                  >
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
                  <span>Giriş yapılıyor...</span>
                </div>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>
        </div>

        {/* Alt bilgi */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs">
            Est. <span className="text-bb-green-light font-semibold">1911</span>
          </p>
          <p className="text-slate-600 text-xs mt-1">
            &copy; {new Date().getFullYear()} Beylerbeyi Futbol Akademi. Tüm
            hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
}
