/**
 * U19 Maç Kayıtları Seed Script
 *
 * Kullanım: npx tsx scripts/seed-u19-matches.ts
 *
 * .env.local dosyasındaki Supabase bilgilerini kullanır.
 */

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

// .env.local dosyasını oku
const envPath = path.resolve(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const [key, ...vals] = line.split("=");
  if (key && vals.length) {
    envVars[key.trim()] = vals.join("=").trim();
  }
});

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SUPABASE_KEY = envVars["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Supabase URL veya Key bulunamadı. .env.local dosyasını kontrol edin.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface MatchInsert {
  id: string;
  date: string;
  season: string;
  age_group: string;
  opponent: string;
  home_away: string;
  status: string;
  score_home: number;
  score_away: number;
  result: string;
  week: number;
  squad: string;
}

const u19Matches: MatchInsert[] = [
  {
    id: randomUUID(),
    date: "2025-09-17",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Sancaktepe Spor",
    home_away: "home",
    status: "played",
    score_home: 0,
    score_away: 3,
    result: "L",
    week: 1,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-09-24",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Gölcükspor",
    home_away: "away",
    status: "played",
    score_home: 1,
    score_away: 3,
    result: "L",
    week: 2,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-10-01",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Kestel Çilek",
    home_away: "home",
    status: "played",
    score_home: 1,
    score_away: 1,
    result: "D",
    week: 3,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-10-08",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Bulvarspor",
    home_away: "away",
    status: "played",
    score_home: 1,
    score_away: 3,
    result: "L",
    week: 4,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-10-15",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Kartal Spor.",
    home_away: "home",
    status: "played",
    score_home: 1,
    score_away: 2,
    result: "L",
    week: 5,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-10-22",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Sultanbeyli Belediye Spor",
    home_away: "away",
    status: "played",
    score_home: 0,
    score_away: 1,
    result: "L",
    week: 6,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-10-29",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Dudullu",
    home_away: "home",
    status: "played",
    score_home: 1,
    score_away: 1,
    result: "D",
    week: 7,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-11-05",
    season: "2025-2026",
    age_group: "U19",
    opponent: "İnkılap Spor",
    home_away: "away",
    status: "played",
    score_home: 5,
    score_away: 3,
    result: "W",
    week: 8,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-11-12",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Gebze Spor",
    home_away: "home",
    status: "played",
    score_home: 0,
    score_away: 1,
    result: "L",
    week: 9,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-11-19",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Paşabahçe",
    home_away: "away",
    status: "played",
    score_home: 2,
    score_away: 1,
    result: "W",
    week: 10,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-11-26",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Karacabey Belediye",
    home_away: "home",
    status: "played",
    score_home: 0,
    score_away: 0,
    result: "D",
    week: 11,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-12-03",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Kullar 1975 Spor",
    home_away: "away",
    status: "played",
    score_home: 1,
    score_away: 0,
    result: "W",
    week: 12,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-12-10",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Yalova FK 77 Spor",
    home_away: "home",
    status: "played",
    score_home: 1,
    score_away: 1,
    result: "D",
    week: 13,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-12-17",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Maltepespor",
    home_away: "away",
    status: "played",
    score_home: 1,
    score_away: 0,
    result: "W",
    week: 14,
    squad: "[]",
  },
  {
    id: randomUUID(),
    date: "2025-12-24",
    season: "2025-2026",
    age_group: "U19",
    opponent: "Beykoz Anadolu Spor",
    home_away: "home",
    status: "played",
    score_home: 1,
    score_away: 1,
    result: "D",
    week: 15,
    squad: "[]",
  },
];

async function seed() {
  console.log(`${u19Matches.length} adet U19 maç kaydı ekleniyor...`);

  const { data, error } = await supabase
    .from("matches")
    .insert(u19Matches)
    .select();

  if (error) {
    console.error("Hata:", error.message);
    process.exit(1);
  }

  console.log(`${data.length} maç başarıyla eklendi!`);
  console.log("\nÖzet:");
  console.log(`  Galibiyet: ${u19Matches.filter((m) => m.result === "W").length}`);
  console.log(`  Beraberlik: ${u19Matches.filter((m) => m.result === "D").length}`);
  console.log(`  Mağlubiyet: ${u19Matches.filter((m) => m.result === "L").length}`);
  console.log(`  Atılan gol: ${u19Matches.reduce((s, m) => s + m.score_home, 0)}`);
  console.log(`  Yenilen gol: ${u19Matches.reduce((s, m) => s + m.score_away, 0)}`);
}

seed();
