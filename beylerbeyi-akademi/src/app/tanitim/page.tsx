"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Users,
  Shield,
  BarChart3,
  Calendar,
  Trophy,
  Target,
  Star,
  ChevronRight,
  Smartphone,
  Monitor,
  Lock,
  TrendingUp,
  Activity,
  Award,
  ClipboardList,
  UserCheck,
  Settings,
  Eye,
  Zap,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";

/* ───── helpers ───── */
function useCountUp(end: number, duration = 2000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [end, duration]);
  return val;
}

function StatCard({ icon: Icon, value, label, suffix = "" }: { icon: React.ElementType; value: number; label: string; suffix?: string }) {
  const count = useCountUp(value);
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/10 hover:bg-white/15 transition-all group">
      <Icon className="mx-auto mb-3 text-white/70 group-hover:text-white transition-colors" size={24} />
      <p className="text-3xl font-black text-white">{count}{suffix}</p>
      <p className="text-white/60 text-xs font-medium mt-1">{label}</p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: { icon: React.ElementType; title: string; description: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e2e5e9] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon size={22} className="text-white" />
      </div>
      <h3 className="text-[#1a1a2e] font-bold text-base mb-2">{title}</h3>
      <p className="text-[#5a6170] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function RoleCard({ icon: Icon, role, color, colorBg, features }: { icon: React.ElementType; role: string; color: string; colorBg: string; features: string[] }) {
  return (
    <div className={`rounded-2xl p-6 border-2 ${colorBg} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
        <h3 className="font-bold text-[#1a1a2e] text-base">{role}</h3>
      </div>
      <ul className="space-y-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#3a3f4b]">
            <ChevronRight size={14} className="text-[#c4111d] mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScreenPreview({ title, description, items }: { title: string; description: string; items: { icon: React.ElementType; label: string }[] }) {
  return (
    <div className="bg-[#f8f9fb] rounded-2xl p-5 border border-[#e2e5e9]">
      <h4 className="font-bold text-[#1a1a2e] text-sm mb-1">{title}</h4>
      <p className="text-[#5a6170] text-xs mb-3">{description}</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-[#3a3f4b] bg-white rounded-lg px-3 py-2 border border-[#e2e5e9]">
            <item.icon size={12} className="text-[#c4111d] shrink-0" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───── main ───── */
export default function TanitimPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* ════════ NAV ════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[#e2e5e9]" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2">
            <Image src="/Logo_S.png" alt="Beylerbeyi" width={32} height={32} className="rounded-lg" />
            <span className={`font-bold text-sm hidden sm:inline transition-colors ${scrolled ? "text-[#1a1a2e]" : "text-white"}`}>
              Beylerbeyi Akademi
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/kilavuz"
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${scrolled ? "text-[#5a6170] hover:text-[#1a1a2e] hover:bg-[#f1f3f5]" : "text-white/70 hover:text-white hover:bg-white/10"}`}
            >
              Kılavuz
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#c4111d] text-white hover:bg-[#a50e18] transition-colors shadow-sm"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </nav>

      {/* ════════ HERO ════════ */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#2a1a1e] to-[#1a1a2e]" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/10 mb-6">
                <Zap size={12} className="text-[#c4111d]" />
                Geleceğin Yıldızlarını Yetiştiriyoruz
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
                <span className="text-[#c4111d]">Beylerbeyi</span> Spor
                <br />Akademi Ailesi
              </h1>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-lg mb-8">
                Sporcularımızın gelişimini yakından takip edin, maç performanslarını inceleyin, antrenör değerlendirmelerini görün.
                Beylerbeyi ailesi olarak yöneticiler, antrenörler ve sporcular için özel olarak tasarlandı.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-[#c4111d] hover:bg-[#a50e18] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-[#c4111d]/20"
                >
                  Sisteme Giriş <ArrowRight size={16} />
                </Link>
                <Link
                  href="/kilavuz"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium px-5 py-3 rounded-xl transition-colors border border-white/10"
                >
                  Kullanım Kılavuzu
                </Link>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-4 mt-10">
                <div className="flex items-center gap-1.5 text-white/40 text-[10px]">
                  <Smartphone size={12} />
                  <span>Mobil Uyumlu (PWA)</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/40 text-[10px]">
                  <Lock size={12} />
                  <span>Rol Bazlı Erişim</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/40 text-[10px]">
                  <Activity size={12} />
                  <span>Canlı Veriler</span>
                </div>
              </div>
            </div>

            {/* Right — mockup card */}
            <div className="hidden lg:block">
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 shadow-2xl">
                <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden">
                  {/* Browser bar */}
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0f0f1e]">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-white/10 rounded-md px-4 py-1 text-[10px] text-white/40 font-mono">
                        beylerbeyi-akademi.vercel.app
                      </div>
                    </div>
                  </div>
                  {/* Content preview */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#c4111d] flex items-center justify-center">
                          <LayoutDashboard size={12} className="text-white" />
                        </div>
                        <span className="text-white text-xs font-semibold">Dashboard</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-medium">Canlı</span>
                      </div>
                    </div>
                    {/* Mini stats */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Oyuncu", val: "87", color: "bg-blue-500/20 text-blue-400" },
                        { label: "Maç", val: "52", color: "bg-emerald-500/20 text-emerald-400" },
                        { label: "Gol", val: "134", color: "bg-amber-500/20 text-amber-400" },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-lg p-2.5 text-center ${s.color}`}>
                          <p className="text-lg font-black">{s.val}</p>
                          <p className="text-[9px] opacity-70">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    {/* Mini chart bars */}
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-[9px] text-white/40 mb-2">Haftalık Performans</p>
                      <div className="flex items-end gap-1 h-12">
                        {[65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-[#c4111d] to-[#e84455] rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].map((d) => (
                          <span key={d} className="text-[7px] text-white/30 flex-1 text-center">{d}</span>
                        ))}
                      </div>
                    </div>
                    {/* Mini match cards */}
                    <div className="space-y-1.5">
                      {[
                        { opp: "Beylerbeyi U16", score: "3-1", result: "G" },
                        { opp: "Beylerbeyi U17", score: "2-2", result: "B" },
                      ].map((m) => (
                        <div key={m.opp} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                          <span className="text-[10px] text-white/70">{m.opp}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white font-bold">{m.score}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                              m.result === "G" ? "bg-emerald-500/20 text-emerald-400" :
                              m.result === "B" ? "bg-amber-500/20 text-amber-400" :
                              "bg-red-500/20 text-red-400"
                            }`}>{m.result}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-14 sm:mt-20">
            <StatCard icon={Users} value={4} label="Yaş Grubu" />
            <StatCard icon={Shield} value={87} label="Kayıtlı Oyuncu" suffix="+" />
            <StatCard icon={Calendar} value={52} label="Maç Kaydı" suffix="+" />
            <StatCard icon={BarChart3} value={12} label="İstatistik Kategorisi" />
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L48 35C96 30 192 20 288 25C384 30 480 50 576 55C672 60 768 50 864 40C960 30 1056 20 1152 25C1248 30 1344 50 1392 55L1440 60V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0V40Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[#c4111d] bg-[#c4111d]/5 px-3 py-1.5 rounded-full mb-3">
              Özellikler
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a2e] mb-3">Akademimizin Dijital Kalbi</h2>
            <p className="text-[#5a6170] text-sm sm:text-base max-w-xl mx-auto">
              Beylerbeyi Spor altyapısında her şey şeffaf ve takip edilebilir. Sporcularımızın gelişimini, antrenörler kadro performansını, yöneticiler tüm akademiyi bu sistemden yönetir.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              icon={Users}
              title="Oyuncu Takibi"
              description="Sporcunuzun boy-kilo gelişimi, pozisyon bilgisi, beceri değerlendirmesi ve geçmiş takım bilgileri tek ekranda."
              color="bg-blue-500"
            />
            <FeatureCard
              icon={Shield}
              title="Maç & Kadro"
              description="Haftalık maç planları, İlk 11 kadrosu, gol-asist-süre kayıtları ve detaylı maç raporları."
              color="bg-emerald-500"
            />
            <FeatureCard
              icon={BarChart3}
              title="Performans Raporu"
              description="Gol ve asist krallığı, oyuncu karşılaştırmaları, sezon bazlı gelişim grafikleri."
              color="bg-purple-500"
            />
            <FeatureCard
              icon={Trophy}
              title="Canlı Puan Durumu"
              description="Beylerbeyi'nin her yaş grubundaki lig sıralamasını canlı olarak takip edin."
              color="bg-amber-500"
            />
            <FeatureCard
              icon={Star}
              title="Beceri Değerlendirmesi"
              description="Antrenörlerimiz 16 farklı taktik ve atletik parametreyle her sporcuyu düzenli olarak değerlendirir."
              color="bg-rose-500"
            />
            <FeatureCard
              icon={Smartphone}
              title="Cebinizde Taşıyın"
              description="Telefonunuza kurun, saha kenarından maç bilgilerine ve istatistiklere anında ulaşın."
              color="bg-cyan-500"
            />
          </div>
        </div>
      </section>

      {/* ════════ PAGES / SCREENS ════════ */}
      <section className="py-16 sm:py-24 bg-[#f8f9fb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[#c4111d] bg-[#c4111d]/5 px-3 py-1.5 rounded-full mb-3">
              Ekranlar
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a2e] mb-3">Sistemin İçinden</h2>
            <p className="text-[#5a6170] text-sm sm:text-base max-w-xl mx-auto">
              Beylerbeyi akademisinin günlük işleyişini kolaylaştıran 5 ana ekran.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <ScreenPreview
              title="Ana Sayfa"
              description="Genel bakış ve haftalık özet"
              items={[
                { icon: Trophy, label: "Haftanın Panoraması" },
                { icon: TrendingUp, label: "Canlı Puan Durumu" },
                { icon: Calendar, label: "Haftalık Maç Takvimi" },
                { icon: Award, label: "Gol & Asist Krallığı" },
              ]}
            />
            <ScreenPreview
              title="Oyuncular"
              description="Kadro ve oyuncu detayları"
              items={[
                { icon: Users, label: "Oyuncu Kartları & Arama" },
                { icon: Eye, label: "Detaylı Profil Modalı" },
                { icon: Star, label: "Taktik & Atletik Beceriler" },
                { icon: ClipboardList, label: "Vücut Ölçümü Takibi" },
              ]}
            />
            <ScreenPreview
              title="Takımlar (Maçlar)"
              description="Maç ve takım istatistikleri"
              items={[
                { icon: Shield, label: "Maç Kartları & Filtreler" },
                { icon: UserCheck, label: "Kadro Yönetimi" },
                { icon: Target, label: "Oyuncu İstatistik Girişi" },
                { icon: Activity, label: "Takım Performans Özeti" },
              ]}
            />
            <ScreenPreview
              title="Raporlar"
              description="Detaylı performans analizi"
              items={[
                { icon: BarChart3, label: "İstatistik Tablosu & Sıralama" },
                { icon: Award, label: "En İyi Performans Kartları" },
                { icon: TrendingUp, label: "Bireysel Oyuncu Raporu" },
              ]}
            />
            <ScreenPreview
              title="Ayarlar"
              description="Sistem yapılandırması"
              items={[
                { icon: Settings, label: "Pozisyon, Ayak, Yaş Grupları" },
                { icon: Users, label: "Sezon & Grup Rakipleri" },
                { icon: UserCheck, label: "Kullanıcı Davet & Rol Atama" },
              ]}
            />
            <ScreenPreview
              title="Kılavuz"
              description="Kullanım rehberi"
              items={[
                { icon: Eye, label: "Rol Bazlı Erişim Tabloları" },
                { icon: Smartphone, label: "PWA Kurulum Talimatları" },
                { icon: ClipboardList, label: "Adım Adım Özellik Rehberi" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ════════ ROLES ════════ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[#c4111d] bg-[#c4111d]/5 px-3 py-1.5 rounded-full mb-3">
              Roller
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a2e] mb-3">Herkes İçin Ayrı Deneyim</h2>
            <p className="text-[#5a6170] text-sm sm:text-base max-w-xl mx-auto">
              Yöneticiler, antrenörler ve sporcular kendi rollerine özel ekranları görür. Herkes sadece ihtiyacı olan bilgiye erişir.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            <RoleCard
              icon={Lock}
              role="Yönetici"
              color="bg-purple-600"
              colorBg="bg-purple-50 border-purple-200"
              features={[
                "Tüm yaş gruplarının tam kontrolü",
                "Oyuncu ve maç ekleme, düzenleme, silme",
                "Kullanıcı daveti ve rol atama",
                "Detaylı performans raporları",
                "Sistem ayarları ve lookup yönetimi",
                "Sezon ve grup rakipleri tanımlama",
              ]}
            />
            <RoleCard
              icon={Shield}
              role="Antrenör"
              color="bg-blue-600"
              colorBg="bg-blue-50 border-blue-200"
              features={[
                "Kendi yaş grubunda tam düzenleme yetkisi",
                "Oyuncu bilgileri ve beceri değerlendirmesi",
                "Maç kadrosu oluşturma ve istatistik girişi",
                "Performans raporlarını inceleme",
                "Diğer yaş gruplarını görüntüleme",
              ]}
            />
            <RoleCard
              icon={Eye}
              role="Oyuncu"
              color="bg-emerald-600"
              colorBg="bg-emerald-50 border-emerald-200"
              features={[
                "Kendi yaş grubunun maç sonuçları",
                "Oyuncu kartları ve profil bilgileri",
                "Puan durumu ve maç takvimi",
                "Gol-asist krallığı sıralamaları",
                "Haftalık panorama ve istatistikler",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ════════ TECH / PWA ════════ */}
      <section className="py-16 sm:py-24 bg-[#1a1a2e] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='20' cy='20' r='1.5'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-[#c4111d] bg-[#c4111d]/10 px-3 py-1.5 rounded-full mb-4">
                Teknoloji
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mb-4">Sahada ve Evde, Her An Yanınızda</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Telefonunuza uygulama olarak kurun. Saha kenarından antrenörler kadro girişi yapsın,
                sporcular maç performanslarını takip etsin.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Smartphone, label: "PWA", desc: "Telefonunuza kurun, normal uygulama gibi kullanın" },
                  { icon: Monitor, label: "Responsive", desc: "Bilgisayar, tablet ve telefonda sorunsuz çalışır" },
                  { icon: Lock, label: "Güvenli", desc: "Herkes sadece kendi yetkisi dahilindeki bilgilere erişir" },
                  { icon: Zap, label: "Anlık", desc: "Maç sonuçları ve istatistikler anında güncellenir" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                      <item.icon size={16} className="text-[#c4111d]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{item.label}</p>
                      <p className="text-white/50 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone mockup */}
            <div className="flex justify-center">
              <div className="relative w-[260px] sm:w-[280px]">
                <div className="bg-[#2a2a3e] rounded-[2.5rem] p-3 shadow-2xl border border-white/10">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#2a2a3e] rounded-b-2xl z-10" />
                  <div className="bg-[#0f0f1e] rounded-[2rem] overflow-hidden">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-6 py-2 text-[8px] text-white/40">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-1.5 border border-white/40 rounded-sm"><div className="w-2 h-full bg-emerald-400 rounded-sm" /></div>
                      </div>
                    </div>
                    {/* App header */}
                    <div className="px-4 pb-3 pt-1 bg-gradient-to-b from-[#c4111d] to-[#a50e18]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                          <Image src="/Logo_S.png" alt="" width={16} height={16} />
                        </div>
                        <span className="text-white text-[10px] font-bold">Beylerbeyi Akademi</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { n: "12", l: "Gol" },
                          { n: "8", l: "Asist" },
                          { n: "5", l: "Galibiyet" },
                        ].map((s) => (
                          <div key={s.l} className="bg-white/10 rounded-lg py-1.5 text-center">
                            <p className="text-white text-sm font-black">{s.n}</p>
                            <p className="text-white/50 text-[7px]">{s.l}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="px-3 py-3 space-y-2">
                      <p className="text-[8px] text-white/30 font-bold uppercase tracking-wider">Maç Takvimi</p>
                      {[
                        { d: "15 Şub", t: "Beylerbeyi U16", s: "14:00", tag: "U16" },
                        { d: "16 Şub", t: "Beylerbeyi U17", s: "11:00", tag: "U17" },
                      ].map((m) => (
                        <div key={m.t} className="bg-white/5 rounded-lg px-2.5 py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-center">
                              <p className="text-[8px] text-white/50">{m.d}</p>
                              <p className="text-[9px] text-white font-bold">{m.s}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-white font-semibold">{m.t}</p>
                            </div>
                          </div>
                          <span className="text-[7px] bg-[#c4111d]/20 text-[#c4111d] px-1.5 py-0.5 rounded-full font-bold">{m.tag}</span>
                        </div>
                      ))}
                    </div>
                    {/* Bottom nav */}
                    <div className="flex items-center justify-around px-2 py-2.5 border-t border-white/5">
                      {[
                        { icon: LayoutDashboard, l: "Ana Sayfa", active: true },
                        { icon: Users, l: "Oyuncular", active: false },
                        { icon: Shield, l: "Takımlar", active: false },
                        { icon: BarChart3, l: "Raporlar", active: false },
                      ].map((n) => (
                        <div key={n.l} className="flex flex-col items-center gap-0.5">
                          <n.icon size={12} className={n.active ? "text-[#c4111d]" : "text-white/30"} />
                          <span className={`text-[6px] font-medium ${n.active ? "text-[#c4111d]" : "text-white/30"}`}>{n.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Image src="/Logo_S.png" alt="Beylerbeyi" width={64} height={64} className="mx-auto mb-6 rounded-xl" />
          <h2 className="text-2xl sm:text-3xl font-black text-[#1a1a2e] mb-3">Beylerbeyi Ailesine Katılın</h2>
          <p className="text-[#5a6170] text-sm sm:text-base mb-8 max-w-md mx-auto">
            Hesabınızla giriş yaparak sporcularımızın gelişimini takip edin, maç programlarını görün ve akademimizin dijital dünyasına adım atın.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#c4111d] hover:bg-[#a50e18] text-white text-sm font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-[#c4111d]/20"
            >
              Giriş Yap <ArrowRight size={16} />
            </Link>
            <Link
              href="/kilavuz"
              className="inline-flex items-center gap-2 bg-[#f1f3f5] hover:bg-[#e2e5e9] text-[#1a1a2e] text-sm font-medium px-6 py-3.5 rounded-xl transition-colors"
            >
              Kullanım Kılavuzu
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="bg-[#f8f9fb] border-t border-[#e2e5e9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/Logo_S.png" alt="Beylerbeyi" width={24} height={24} className="rounded" />
              <span className="text-xs text-[#5a6170] font-medium">Beylerbeyi Spor Kulübü — Futbol Akademi</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/kilavuz" className="text-xs text-[#5a6170] hover:text-[#1a1a2e] transition-colors">Kılavuz</Link>
              <Link href="/login" className="text-xs text-[#5a6170] hover:text-[#1a1a2e] transition-colors">Giriş</Link>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#e2e5e9] text-center">
            <p className="text-[10px] text-[#8c919a]">&copy; {new Date().getFullYear()} Beylerbeyi Spor Kulübü. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
