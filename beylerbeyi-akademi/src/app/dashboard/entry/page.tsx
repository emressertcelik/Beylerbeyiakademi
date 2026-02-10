"use client";

import { useState } from "react";
import { useAgeGroup } from "@/context/AgeGroupContext";
import { getPlayersByAgeGroup } from "@/lib/mock-data";
import { PLAYER_STATUS_MAP } from "@/types/player";

interface EntryRow {
  player_id: string;
  minutes: string;
  goals: string;
  assists: string;
  yellow: string;
  red: string;
  status: string;
}

export default function EntryPage() {
  const { selectedAge } = useAgeGroup();
  const players = getPlayersByAgeGroup(selectedAge);
  const [week, setWeek] = useState("6");
  const [rows, setRows] = useState<EntryRow[]>(
    players.map((p) => ({ player_id: p.id, minutes: "", goals: "", assists: "", yellow: "", red: "", status: "played" }))
  );

  if (players.length === 0) {
    return <div className="text-center py-20"><p className="text-[#8b949e] text-sm">{selectedAge} için veri bulunamadı.</p></div>;
  }

  const updateRow = (idx: number, field: keyof EntryRow, value: string) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const handleSave = () => {
    alert(`Hafta ${week} verileri kaydedildi! (Demo — Supabase entegrasyonu sonra eklenecek)`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Veri Girişi</h1>
          <p className="text-sm text-[#6e7781]">{selectedAge} · Maç istatistikleri</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#57606a]">Hafta:</label>
            <input type="number" value={week} onChange={(e) => setWeek(e.target.value)} min="1" max="34"
              className="w-16 px-2 py-1.5 bg-white border border-[#d0d7de] rounded-lg text-sm text-center focus:outline-none focus:border-[#1b6e2a]" />
          </div>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-[#1b6e2a] hover:bg-[#15591f] rounded-lg transition-colors">Kaydet</button>
        </div>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f6f8fa]">
                <th className="text-left py-2.5 px-3 text-[10px] font-bold text-[#8b949e] uppercase">#</th>
                <th className="text-left py-2.5 px-3 text-[10px] font-bold text-[#8b949e] uppercase">Oyuncu</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-bold text-[#8b949e] uppercase">Durum</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-bold text-[#8b949e] uppercase">Dk</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-bold text-[#8b949e] uppercase">Gol</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-bold text-[#8b949e] uppercase">Asist</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-bold text-[#8b949e] uppercase">🟡</th>
                <th className="text-center py-2.5 px-2 text-[10px] font-bold text-[#8b949e] uppercase">🔴</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, idx) => (
                <tr key={p.id} className="border-b border-[#f0f0f0] last:border-0 hover:bg-[#fafafa]">
                  <td className="py-2 px-3 font-bold text-[#8b949e]">{p.jersey_number}</td>
                  <td className="py-2 px-3 font-semibold text-[#1a1a1a] whitespace-nowrap">{p.first_name} {p.last_name}</td>
                  <td className="py-2 px-2">
                    <select value={rows[idx]?.status} onChange={(e) => updateRow(idx, "status", e.target.value)}
                      className="w-full px-1.5 py-1 border border-[#d0d7de] rounded text-xs bg-white focus:outline-none focus:border-[#1b6e2a]">
                      {Object.entries(PLAYER_STATUS_MAP).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-2"><input type="number" value={rows[idx]?.minutes} onChange={(e) => updateRow(idx, "minutes", e.target.value)} disabled={rows[idx]?.status !== "played"} className="w-14 px-1.5 py-1 border border-[#d0d7de] rounded text-xs text-center bg-white disabled:bg-[#f0f0f0] focus:outline-none focus:border-[#1b6e2a]" /></td>
                  <td className="py-2 px-2"><input type="number" value={rows[idx]?.goals} onChange={(e) => updateRow(idx, "goals", e.target.value)} disabled={rows[idx]?.status !== "played"} className="w-12 px-1.5 py-1 border border-[#d0d7de] rounded text-xs text-center bg-white disabled:bg-[#f0f0f0] focus:outline-none focus:border-[#1b6e2a]" /></td>
                  <td className="py-2 px-2"><input type="number" value={rows[idx]?.assists} onChange={(e) => updateRow(idx, "assists", e.target.value)} disabled={rows[idx]?.status !== "played"} className="w-12 px-1.5 py-1 border border-[#d0d7de] rounded text-xs text-center bg-white disabled:bg-[#f0f0f0] focus:outline-none focus:border-[#1b6e2a]" /></td>
                  <td className="py-2 px-2"><input type="number" value={rows[idx]?.yellow} onChange={(e) => updateRow(idx, "yellow", e.target.value)} disabled={rows[idx]?.status !== "played"} className="w-10 px-1.5 py-1 border border-[#d0d7de] rounded text-xs text-center bg-white disabled:bg-[#f0f0f0] focus:outline-none focus:border-[#1b6e2a]" /></td>
                  <td className="py-2 px-2"><input type="number" value={rows[idx]?.red} onChange={(e) => updateRow(idx, "red", e.target.value)} disabled={rows[idx]?.status !== "played"} className="w-10 px-1.5 py-1 border border-[#d0d7de] rounded text-xs text-center bg-white disabled:bg-[#f0f0f0] focus:outline-none focus:border-[#1b6e2a]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
