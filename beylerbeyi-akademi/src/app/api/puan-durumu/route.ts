import { NextRequest, NextResponse } from "next/server";

// Age group → URL + target group heading mapping
const AGE_GROUP_CONFIG: Record<string, { url: string; group: string }> = {
  U14: { url: "https://bakhaberinolsun.com/gelisim-ligi-u-14/", group: "GELİŞİM 5.GRUP" },
  U15: { url: "https://bakhaberinolsun.com/gelisim-ligi-u-15/", group: "GELİŞİM 5.GRUP" },
  U16: { url: "https://bakhaberinolsun.com/gelisim-ligi-u-16/", group: "GELİŞİM 4.GRUP" },
  U17: { url: "https://bakhaberinolsun.com/gelisim-ligleri-u-17/", group: "GELİŞİM 4.GRUP" },
  U19: { url: "https://bakhaberinolsun.com/gelisim-ligleri-u-19/", group: "U-19 GELİŞİM 3.GRUP" },
};

// Simple in-memory cache: { [age]: { data, matches, week, fetchedAt } }
const cache: Record<string, { data: Array<Array<string | number>>; matches: MatchResult[]; week: number; fetchedAt: number }> = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface MatchResult {
  date: string;       // e.g. "15.02.2026"
  venue: string;      // e.g. "GÖLCÜK"
  time: string;       // e.g. "13.00"
  homeTeam: string;   // e.g. "GÖLCÜKSPOR"
  awayTeam: string;   // e.g. "BULVARSPOR"
  score: string;      // e.g. "2 – 1" or "" (not played yet)
  week: number;       // e.g. 21
}

/** Decode common HTML entities */
function decodeEntities(text: string): string {
  return text
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));
}

/**
 * Parses the match schedule ("HAFTA PROĞRAMI") table for the specified group.
 * Returns all matches with date, venue, time, teams and score.
 */
function parseMatchSchedule(html: string, targetGroup: string): { week: number; matches: MatchResult[] } {
  const matches: MatchResult[] = [];
  let week = 0;

  // Find the target group section
  const normalizedTarget = targetGroup.replace(/\s+/g, "\\s*").replace(/\./g, "\\.?");
  const groupRegex = new RegExp(normalizedTarget, "i");
  const groupMatch = groupRegex.exec(html);
  if (!groupMatch) return { week, matches };

  // Get content between this group and the next group or "PUAN DURUMU"
  const afterGroup = html.substring(groupMatch.index);
  
  // Find "PUAN DURUMU" to limit our search area (schedule is before it)
  const puanMatch = /PUAN\s+DURUMU/i.exec(afterGroup);
  const scheduleArea = puanMatch ? afterGroup.substring(0, puanMatch.index) : afterGroup.substring(0, 5000);

  // Extract week number from "XX.HAFTA PROĞRAMI" or "XX.HAFTA"
  const weekMatch = /(\d+)\s*\.\s*HAFTA/i.exec(scheduleArea);
  if (weekMatch) {
    week = parseInt(weekMatch[1]);
  }

  // Find the schedule table (TARİH | SAHA | SAAT | EV SAHİBİ | MİSAFİR | SKOR)
  const tableMatch = /<table[^>]*>([\s\S]*?)<\/table>/i.exec(scheduleArea);
  if (!tableMatch) return { week, matches };

  const tableHtml = tableMatch[1];
  const tbodyMatch = /<tbody[^>]*>([\s\S]*?)<\/tbody>/i.exec(tableHtml);
  const rowsHtml = tbodyMatch ? tbodyMatch[1] : tableHtml;

  // Parse each <tr>
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;

  while ((trMatch = trRegex.exec(rowsHtml)) !== null) {
    const trContent = trMatch[1];

    // Skip header rows
    if (/<th/i.test(trContent)) continue;

    const cells: string[] = [];
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let tdMatch;
    while ((tdMatch = tdRegex.exec(trContent)) !== null) {
      const cellText = decodeEntities(tdMatch[1].replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim());
      cells.push(cellText);
    }

    // Expected: TARİH, SAHA, SAAT, EV SAHİBİ, MİSAFİR, SKOR (6 columns)
    if (cells.length >= 5) {
      const date = cells[0].trim();
      const venue = cells[1].trim();
      const time = cells[2].trim();
      const homeTeam = cells[3].trim();
      const awayTeam = cells[4].trim();
      // Score: decode entities and clean up
      const rawScore = (cells[5] || "").replace(/\s+/g, " ").trim();
      // Normalize score: "4. – 1" → "4 – 1", remove trailing period from numbers
      const score = rawScore.replace(/(\d)\.\s*([–-])/g, "$1 $2").trim();

      // Skip rows that look like headers (TARİH in first cell)
      if (date.toUpperCase() === "TARİH") continue;
      // Skip rows with no team names
      if (!homeTeam && !awayTeam) continue;

      matches.push({
        date,
        venue,
        time,
        homeTeam,
        awayTeam,
        score,
        week,
      });
    }
  }

  return { week, matches };
}

/**
 * Parses the HTML of bakhaberinolsun.com pages to extract the standings table
 * for the specified group.
 */
function parseStandings(html: string, targetGroup: string): Array<Array<string | number>> {
  const rows: Array<Array<string | number>> = [];

  // Find the target group section
  // The group headings appear as bold text like "GELİŞİM 5.GRUP" followed by
  // week schedule and then "PUAN DURUMU" table
  
  // Strategy: Find the target group heading, then find the next "PUAN DURUMU" after it,
  // then parse the table rows until we hit the next group or end of content

  // Normalize the target group for flexible matching
  const normalizedTarget = targetGroup.replace(/\s+/g, "\\s*").replace(/\./g, "\\.?");
  
  // Find the group heading position
  const groupRegex = new RegExp(normalizedTarget, "i");
  const groupMatch = groupRegex.exec(html);
  if (!groupMatch) return rows;
  
  // From the group heading, find the next "PUAN DURUMU" section
  const afterGroup = html.substring(groupMatch.index);
  const puanMatch = /PUAN\s+DURUMU/i.exec(afterGroup);
  if (!puanMatch) return rows;
  
  // Find the table after "PUAN DURUMU"
  const afterPuan = afterGroup.substring(puanMatch.index);
  const tableMatch = /<table[^>]*>([\s\S]*?)<\/table>/i.exec(afterPuan);
  if (!tableMatch) return rows;
  
  const tableHtml = tableMatch[1];
  
  // Extract tbody rows (skip header)
  const tbodyMatch = /<tbody[^>]*>([\s\S]*?)<\/tbody>/i.exec(tableHtml);
  const rowsHtml = tbodyMatch ? tbodyMatch[1] : tableHtml;
  
  // Parse each <tr>
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;
  let isFirstRow = true;
  
  while ((trMatch = trRegex.exec(rowsHtml)) !== null) {
    const trContent = trMatch[1];
    
    // Check if this is a header row (contains <th>)
    if (/<th/i.test(trContent)) {
      continue;
    }
    
    // Extract cell values from <td>
    const cells: string[] = [];
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let tdMatch;
    while ((tdMatch = tdRegex.exec(trContent)) !== null) {
      // Strip HTML tags, decode entities and trim
      const cellText = decodeEntities(tdMatch[1].replace(/<[^>]*>/g, "").trim());
      cells.push(cellText);
    }
    
    // Expected columns: #, TAKIM, O, G, B, M, A, Y, AV, P
    if (cells.length >= 10) {
      const team = cells[1].replace(/&nbsp;/gi, " ").trim();
      
      // Skip header rows where team column is "TAKIM"
      if (team.toUpperCase() === "TAKIM") continue;
      
      const rank = parseInt(cells[0]) || rows.length + 1;
      const o = parseInt(cells[2]) || 0;
      const g = parseInt(cells[3]) || 0;
      const b = parseInt(cells[4]) || 0;
      const m = parseInt(cells[5]) || 0;
      const a = parseInt(cells[6]) || 0;
      const y = parseInt(cells[7]) || 0;
      const av = parseInt(cells[8]) || 0;
      const p = parseInt(cells[9]) || 0;
      
      rows.push([rank, team, o, g, b, m, a, y, av, p]);
    }
  }
  
  return rows;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const age = searchParams.get("age")?.toUpperCase() || "U15";
  
  const config = AGE_GROUP_CONFIG[age];
  if (!config) {
    return NextResponse.json(
      { error: `Geçersiz yaş grubu: ${age}. Desteklenen: ${Object.keys(AGE_GROUP_CONFIG).join(", ")}` },
      { status: 400 }
    );
  }
  
  // Check cache
  const cached = cache[age];
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return NextResponse.json({ age, group: config.group, data: cached.data, matches: cached.matches, week: cached.week, cached: true });
  }
  
  try {
    const response = await fetch(config.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 600 }, // ISR: revalidate every 10 min
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Detect charset from Content-Type header or default to UTF-8
    const contentType = response.headers.get("content-type") || "";
    const charsetMatch = contentType.match(/charset=([\w-]+)/i);
    const charset = charsetMatch ? charsetMatch[1] : "utf-8";
    
    // Read as ArrayBuffer and decode with correct charset for Turkish characters
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder(charset);
    const html = decoder.decode(buffer);
    const data = parseStandings(html, config.group);
    const { week, matches: matchResults } = parseMatchSchedule(html, config.group);
    
    if (data.length === 0) {
      return NextResponse.json(
        { error: "Puan durumu tablosu bulunamadı. Sayfa yapısı değişmiş olabilir.", age, group: config.group },
        { status: 404 }
      );
    }
    
    // Update cache
    cache[age] = { data, matches: matchResults, week, fetchedAt: Date.now() };
    
    return NextResponse.json({ age, group: config.group, data, matches: matchResults, week, cached: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error(`[puan-durumu] ${age} fetch error:`, message);
    
    // Return cached data if available even if stale
    if (cached) {
      return NextResponse.json({ age, group: config.group, data: cached.data, matches: cached.matches, week: cached.week, cached: true, stale: true });
    }
    
    return NextResponse.json(
      { error: `Veri alınamadı: ${message}` },
      { status: 502 }
    );
  }
}
