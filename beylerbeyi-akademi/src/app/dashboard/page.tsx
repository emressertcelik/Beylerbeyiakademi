"use client";

import { Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-[#1a1a1a] tracking-tight mb-2">Hoş Geldiniz</h1>
        <p className="text-base text-[#6e7781] mt-1">Beylerbeyi Futbol Akademi Yönetim Paneli</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link
          href="/dashboard/players"
          className="group bg-gradient-to-br from-white via-[#f6f8fa] to-[#eaf0f6] border border-[#e5e7eb]/60 rounded-2xl p-8 hover:border-[#c4111d]/30 hover:shadow-xl transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-xl bg-[#c4111d]/10 flex items-center justify-center mb-4 group-hover:bg-[#c4111d]/20 transition-colors">
            <Users size={32} className="text-[#c4111d]" />
          </div>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-1">Oyuncular</h2>
          <p className="text-sm text-[#6e7781]">Tüm oyuncuları görüntüle, ekle ve düzenle</p>
        </Link>

        <div className="bg-gradient-to-br from-white via-[#f6f8fa] to-[#eaf0f6] border border-[#e5e7eb]/60 rounded-2xl p-8 opacity-50 cursor-not-allowed">
          <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
            <TrendingUp size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-1">İstatistikler</h2>
          <p className="text-sm text-[#6e7781]">Yakında eklenecek</p>
        </div>
      </div>
    </div>
  );
}
