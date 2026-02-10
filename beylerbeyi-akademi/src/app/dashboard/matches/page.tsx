"use client";

import { useAgeGroup } from "@/context/AgeGroupContext";
import { getMatchesByAgeGroup } from "@/lib/mock-data";

const R: Record<string, string> = { G: "bg-[#1b6e2a] text-white", M: "bg-[#c4111d] text-white", B: "bg-[#f59e0b] text-white" };

export default function MatchesPage() {
  const { selectedAge } = useAgeGroup();
  const matches = getMatchesByAgeGroup(selectedAge);

  if (matches.length === 0) return <Empty label={selectedAge} />;

  return (
    <div>
      <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">Fikstür & Sonuçlar</h1>
      <p className="text-sm text-[#6e7781] mb-5">{selectedAge} · 2024-2025</p>
      <div className="space-y-3">
        {matches.map((m) => {
          const bs = m.is_home ? m.home_score : m.away_score;
          const os = m.is_home ? m.away_score : m.home_score;
          const r = m.status !== "played" ? null : bs > os ? "G" : bs < os ? "M" : "B";
          return (
            <div key={m.id} className="bg-white border border-[#e5e7eb] rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#f6f8fa] flex items-center justify-center text-xs font-bold text-[#8b949e]">{m.week}</div>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{m.is_home ? "Beylerbeyi" : m.opponent} <span className="text-[#8b949e] font-normal mx-1">vs</span> {m.is_home ? m.opponent : "Beylerbeyi"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[#8b949e]">{new Date(m.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.is_home ? "bg-[#dafbe1] text-[#116329]" : "bg-[#f6f8fa] text-[#57606a]"}`}>{m.is_home ? "İÇ SAHA" : "DIŞ SAHA"}</span>
                  </div>
                </div>
              </div>
              {r ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#1a1a1a]">{m.home_score}-{m.away_score}</span>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${R[r]}`}>{r}</span>
                </div>
              ) : (
                <span className="text-xs font-semibold text-[#8b949e] bg-[#f6f8fa] px-3 py-1.5 rounded-lg">Oynanmadı</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-full bg-[#f6f8fa] flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-[#8b949e]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </div>
      <h3 className="text-[#1a1a1a] font-bold mb-1">{label} için veri bulunamadı</h3>
      <p className="text-[#6e7781] text-sm">Bu yaş grubuna henüz maç eklenmemiş.</p>
    </div>
  );
}
