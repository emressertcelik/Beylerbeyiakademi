"use client";

import { useAgeGroup } from "@/context/AgeGroupContext";

const STANDINGS: Record<string, { team: string; p: number; w: number; d: number; l: number; gf: number; ga: number; pts: number; ours: boolean }[]> = {
  U15: [
    { team: "Beylerbeyi SK", p: 5, w: 3, d: 1, l: 1, gf: 13, ga: 5, pts: 10, ours: true },
    { team: "Fenerbahçe", p: 5, w: 3, d: 1, l: 1, gf: 11, ga: 6, pts: 10, ours: false },
    { team: "Galatasaray", p: 5, w: 2, d: 2, l: 1, gf: 9, ga: 7, pts: 8, ours: false },
    { team: "Beşiktaş JK", p: 5, w: 2, d: 1, l: 2, gf: 8, ga: 9, pts: 7, ours: false },
    { team: "Kadıköy Gençlik", p: 5, w: 1, d: 2, l: 2, gf: 6, ga: 8, pts: 5, ours: false },
    { team: "Üsküdar Spor", p: 5, w: 1, d: 1, l: 3, gf: 5, ga: 10, pts: 4, ours: false },
  ],
  U19: [
    { team: "Fenerbahçe", p: 5, w: 4, d: 0, l: 1, gf: 14, ga: 5, pts: 12, ours: false },
    { team: "Beylerbeyi SK", p: 5, w: 2, d: 1, l: 2, gf: 8, ga: 7, pts: 7, ours: true },
    { team: "Galatasaray", p: 5, w: 2, d: 1, l: 2, gf: 7, ga: 8, pts: 7, ours: false },
    { team: "Beşiktaş JK", p: 5, w: 2, d: 0, l: 3, gf: 6, ga: 9, pts: 6, ours: false },
    { team: "Sarıyer GK", p: 5, w: 1, d: 1, l: 3, gf: 4, ga: 10, pts: 4, ours: false },
    { team: "Kadıköy FK", p: 5, w: 1, d: 1, l: 3, gf: 5, ga: 11, pts: 4, ours: false },
  ],
};

export default function StandingsPage() {
  const { selectedAge } = useAgeGroup();
  const data = STANDINGS[selectedAge];

  if (!data) {
    return <div className="text-center py-20"><p className="text-[#8b949e] text-sm">{selectedAge} için puan durumu bulunamadı.</p></div>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">Puan Durumu</h1>
      <p className="text-sm text-[#6e7781] mb-5">{selectedAge} Ligi · 2024-2025</p>
      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f6f8fa]">
                {["#", "Takım", "O", "G", "B", "M", "AG", "YG", "Av", "P"].map((h) => (
                  <th key={h} className={`py-2.5 px-3 text-[10px] font-bold text-[#8b949e] uppercase tracking-wider ${h === "Takım" ? "text-left" : "text-center"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={r.team} className={`border-b border-[#f0f0f0] last:border-0 ${r.ours ? "bg-[#1b6e2a]/5" : "hover:bg-[#f6f8fa]"}`}>
                  <td className="py-2.5 px-3 text-center font-bold text-[#8b949e]">{i + 1}</td>
                  <td className="py-2.5 px-3 font-semibold">
                    {r.ours && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c4111d] mr-1.5" />}
                    <span className={r.ours ? "text-[#1b6e2a]" : "text-[#1a1a1a]"}>{r.team}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-[#57606a]">{r.p}</td>
                  <td className="py-2.5 px-3 text-center text-[#116329] font-medium">{r.w}</td>
                  <td className="py-2.5 px-3 text-center text-[#9a6700] font-medium">{r.d}</td>
                  <td className="py-2.5 px-3 text-center text-[#c4111d] font-medium">{r.l}</td>
                  <td className="py-2.5 px-3 text-center text-[#57606a]">{r.gf}</td>
                  <td className="py-2.5 px-3 text-center text-[#57606a]">{r.ga}</td>
                  <td className="py-2.5 px-3 text-center font-medium">{r.gf - r.ga > 0 ? `+${r.gf - r.ga}` : r.gf - r.ga}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#1a1a1a]">{r.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
