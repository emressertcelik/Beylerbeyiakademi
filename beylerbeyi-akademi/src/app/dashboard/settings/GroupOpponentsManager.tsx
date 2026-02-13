"use client";
import { Trash2 } from "lucide-react";
import { useAppData } from "@/lib/app-data";
import { useState, useEffect } from "react";
import { fetchGroupOpponents, addGroupOpponent, GroupOpponent, deleteGroupOpponent } from "@/lib/supabase/groupOpponents";

export default function GroupOpponentsManager() {
  const { lookups } = useAppData();
  const [season, setSeason] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [groupNumber, setGroupNumber] = useState(1);
  const [opponent, setOpponent] = useState("");
  const [opponents, setOpponents] = useState<GroupOpponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<null | number>(null);

  useEffect(() => {
    if (season && ageGroup) {
      setLoading(true);
      fetchGroupOpponents(season, ageGroup, groupNumber)
        .then(setOpponents)
        .finally(() => setLoading(false));
    } else {
      setOpponents([]);
    }
  }, [season, ageGroup, groupNumber]);

  const handleAdd = async () => {
    if (!season || !ageGroup || !opponent) return;
    setLoading(true);
    await addGroupOpponent({ season, age_group: ageGroup, group_number: groupNumber, opponent });
    setOpponent("");
    fetchGroupOpponents(season, ageGroup, groupNumber)
      .then(setOpponents)
      .finally(() => setLoading(false));
  };

  return (
    <div className="bg-white rounded-xl border p-6 max-w-2xl mx-auto mt-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-xl font-bold text-[#1a1a2e]">Grup Rakipleri Yönetimi</h2>
        <p className="text-sm text-[#8c919a] mt-1">Sezon, yaş grubu ve grup numarası için rakip tanımlayın.</p>
      </div>
      {!lookups ? (
        <div className="flex items-center justify-center min-h-[120px] text-[#8c919a]">
          Yükleniyor...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <select value={season} onChange={e => setSeason(e.target.value)} className="px-3 py-2 rounded-lg border border-[#e2e5e9] text-sm focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20">
              <option value="">Sezon Seç</option>
              {lookups.seasons.map((s: any) => (
                <option key={s.value} value={s.value}>{s.value}</option>
              ))}
            </select>
            <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} className="px-3 py-2 rounded-lg border border-[#e2e5e9] text-sm focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20">
              <option value="">Yaş Grubu Seç</option>
              {lookups.ageGroups.map((ag: any) => (
                <option key={ag.value} value={ag.value}>{ag.value}</option>
              ))}
            </select>
            <input type="number" min={1} value={groupNumber} onChange={e => setGroupNumber(Number(e.target.value))} className="px-3 py-2 rounded-lg border border-[#e2e5e9] text-sm focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20" placeholder="Grup No" />
          </div>
          <div className="flex gap-2 mb-4">
            <input value={opponent} onChange={e => setOpponent(e.target.value)} className="px-3 py-2 rounded-lg border border-[#e2e5e9] text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-[#c4111d]/20" placeholder="Rakip Adı" />
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-[#c4111d] text-white text-sm font-semibold hover:bg-[#a30e17] transition-colors disabled:opacity-50">Ekle</button>
          </div>
          <div className="overflow-x-auto">
            {loading ? <div className="text-center py-8 text-[#8c919a]">Yükleniyor...</div> : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">Rakip</th>
                    <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">Sezon</th>
                    <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">Yaş Grubu</th>
                    <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">Grup No</th>
                    <th className="px-4 py-2.5 text-left border-b border-[#e2e5e9]">Sil</th>
                  </tr>
                </thead>
                <tbody>
                  {opponents.map(o => (
                    <tr key={o.id} className="hover:bg-[#f8f9fb] transition-colors">
                      <td className="align-middle font-medium text-[#1a1a2e]">{o.opponent}</td>
                      <td className="align-middle text-[#8c919a]">{o.season}</td>
                      <td className="align-middle text-[#8c919a]">{o.age_group}</td>
                      <td className="align-middle text-[#8c919a]">{o.group_number}</td>
                      <td className="align-middle">
                        {deleteConfirm === o.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-red-500 mr-1">Emin misiniz?</span>
                            <button
                              onClick={async () => {
                                setLoading(true);
                                await import("@/lib/supabase/groupOpponents").then(mod => mod.deleteGroupOpponent(o.id));
                                fetchGroupOpponents(season, ageGroup, groupNumber)
                                  .then(setOpponents)
                                  .finally(() => setLoading(false));
                                setDeleteConfirm(null);
                              }}
                              className="px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                            >Sil</button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 rounded-lg bg-[#f1f3f5] text-[#5a6170] text-xs font-medium hover:bg-[#e2e5e9] transition-colors"
                            >İptal</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(o.id)}
                            className="p-1.5 rounded-lg text-[#8c919a] opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Sil"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {opponents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-xs text-[#8c919a] py-4 text-center">Tanımlı rakip yok.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
