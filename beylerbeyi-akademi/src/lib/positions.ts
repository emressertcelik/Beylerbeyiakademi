/**
 * Kısaltma tablosu. DB'deki lookup_positions.abbreviation
 * değerleri initPositionLookups() ile buraya yüklenir.
 * Fallback: ilk kelimenin ilk 3 harfi.
 */
let POSITION_ABBR: Record<string, string> = {
  "Kaleci":               "KL",
  "Stoper":               "STP",
  "Sol Bek":              "SLB",
  "Sağ Bek":              "SĞB",
  "Defans":               "DF",
  "Defansif Orta Saha":   "DO",
  "Orta Saha":            "OS",
  "Kanat Forvet":         "KNT",
  "Forvet":               "FV",
  "Santrafor":            "SNT",
};

export function getPositionAbbr(position: string): string {
  if (POSITION_ABBR[position]) return POSITION_ABBR[position];
  const firstWord = position.trim().split(/\s+/)[0] ?? position;
  return firstWord.slice(0, 3).toUpperCase();
}

/* ── Renk Sistemi ──────────────────────────────────────────────── */

export interface PositionColors {
  /** Tailwind gradient sınıfları — kart/modal header için */
  from: string;
  to: string;
  /** Solid arka plan — rozet/avatar bg için */
  bg: string;
  /** Metin rengi — inline rozet text için */
  text: string;
}

/**
 * Her mevki için renk paleti. Grup ayrımı:
 *   Kaleci       → mat altın
 *   Defans grubu → lacivert / mavi / mor (hue farkı net)
 *   Orta Saha    → teal / orman yeşili
 *   Forvet grubu → amber / gül / koyu kırmızı
 *
 * TÜM Tailwind class'larının tam halde yazılması zorunlu
 * (JIT tree-shaking için).
 */
const POSITION_COLORS: Record<string, PositionColors> = {
  // Kaleci — parlak kehribar
  "Kaleci":             { from: "from-[#F59E0B]", to: "to-[#D97706]", bg: "bg-[#F59E0B]", text: "text-[#D97706]" },
  // Defans grubu — slate / koyu çelik
  "Stoper":             { from: "from-[#374151]", to: "to-[#1F2937]", bg: "bg-[#374151]", text: "text-[#4B5563]" },
  "Sol Bek":            { from: "from-[#374151]", to: "to-[#1F2937]", bg: "bg-[#374151]", text: "text-[#4B5563]" },
  "Sağ Bek":            { from: "from-[#374151]", to: "to-[#1F2937]", bg: "bg-[#374151]", text: "text-[#4B5563]" },
  "Defans":             { from: "from-[#374151]", to: "to-[#1F2937]", bg: "bg-[#374151]", text: "text-[#4B5563]" },
  // Orta saha grubu — koyu teal / orman yeşili
  "Defansif Orta Saha": { from: "from-[#0F766E]", to: "to-[#134E4A]", bg: "bg-[#0F766E]", text: "text-[#0F766E]" },
  "Orta Saha":          { from: "from-[#0F766E]", to: "to-[#134E4A]", bg: "bg-[#0F766E]", text: "text-[#0F766E]" },
  // Forvet grubu — turuncu / gül / kırmızı
  "Kanat Forvet":       { from: "from-[#DC2626]", to: "to-[#B91C1C]", bg: "bg-[#DC2626]", text: "text-[#DC2626]" },
  "Forvet":             { from: "from-[#DC2626]", to: "to-[#B91C1C]", bg: "bg-[#DC2626]", text: "text-[#DC2626]" },
  "Santrafor":          { from: "from-[#DC2626]", to: "to-[#B91C1C]", bg: "bg-[#DC2626]", text: "text-[#DC2626]" },
};

const DEFAULT_COLORS: PositionColors = {
  from: "from-[#8A909E]",
  to:   "to-[#707580]",
  bg:   "bg-[#8A909E]",
  text: "text-[#8A909E]",
};

export function getPositionColors(position: string): PositionColors {
  return POSITION_COLORS[position] ?? DEFAULT_COLORS;
}

/* ── Sıralama ───────────────────────────────────────────────────── */

export const POSITION_ORDER = [
  "Kaleci",
  "Stoper",
  "Sol Bek",
  "Sağ Bek",
  "Defans",
  "Defansif Orta Saha",
  "Orta Saha",
  "Kanat Forvet",
  "Forvet",
  "Santrafor",
];

/** İki pozisyonu POSITION_ORDER'a göre karşılaştırır (sort comparator). */
export function comparePositions(a: string, b: string): number {
  const ai = POSITION_ORDER.indexOf(a);
  const bi = POSITION_ORDER.indexOf(b);
  if (ai !== -1 && bi !== -1) return ai - bi;
  if (ai !== -1) return -1;
  if (bi !== -1) return 1;
  return a.localeCompare(b);
}
