"use client";

import { Users, TrendingUp, Calendar, Award } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#c4111d] to-[#9b0d16] rounded-2xl p-8 md:p-10 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Hoş Geldiniz 👋
          </h1>
          <p className="text-white/75 text-sm md:text-base max-w-md">
            Beylerbeyi Futbol Akademi Yönetim Paneli
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat icon={Users} label="Toplam Oyuncu" value="—" color="text-[#c4111d]" bgColor="bg-red-50" />
        <QuickStat icon={Calendar} label="Bu Ay Maç" value="—" color="text-blue-600" bgColor="bg-blue-50" />
        <QuickStat icon={Award} label="Gol" value="—" color="text-emerald-600" bgColor="bg-emerald-50" />
        <QuickStat icon={TrendingUp} label="Asist" value="—" color="text-amber-600" bgColor="bg-amber-50" />
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-lg font-semibold text-[#1a1a2e] mb-4">Modüller</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/dashboard/players"
            className="group bg-white border border-[#e2e5e9] rounded-xl p-6 hover:border-[#c4111d]/30 hover:shadow-lg hover:shadow-[#c4111d]/5 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-[#c4111d]/15 transition-colors">
                <Users size={24} className="text-[#c4111d]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-[#1a1a2e] group-hover:text-[#c4111d] transition-colors">
                  Oyuncular
                </h3>
                <p className="text-sm text-[#5a6170] mt-1">
                  Tüm oyuncuları görüntüle, ekle ve düzenle
                </p>
              </div>
            </div>
          </Link>

          <div className="bg-white border border-[#e2e5e9] rounded-xl p-6 opacity-50 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <TrendingUp size={24} className="text-slate-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-[#1a1a2e]">
                  İstatistikler
                </h3>
                <p className="text-sm text-[#5a6170] mt-1">
                  Yakında eklenecek
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white border border-[#e2e5e9] rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon size={18} className={color} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-[#8c919a] font-medium mt-0.5">{label}</p>
    </div>
  );
}
