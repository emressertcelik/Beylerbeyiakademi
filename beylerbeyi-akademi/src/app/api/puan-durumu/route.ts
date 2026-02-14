import { NextRequest, NextResponse } from "next/server";

// Age group → URL + target group heading mapping
const AGE_GROUP_CONFIG: Record<string, { url: string; group: string }> = {
  U14: { url: "https://bakhaberinolsun.com/gelisim-ligi-u-14/", group: "GELİŞİM 5.GRUP" },
  U15: { url: "https://bakhaberinolsun.com/gelisim-ligi-u-15/", group: "GELİŞİM 5.GRUP" },
  U16: { url: "https://bakhaberinolsun.com/gelisim-ligi-u-16/", group: "GELİŞİM 4.GRUP" },
  U17: { url: "https://bakhaberinolsun.com/gelisim-ligleri-u-17/", group: "GELİŞİM 4.GRUP" },
  U19: { url: "https://bakhaberinolsun.com/gelisim-ligleri-u-19/", group: "U-19 GELİŞİM 3.GRUP" },
};

// Simple in-memory cache: { [age]: { data, fetchedAt } }
const cache: Record<string, { data: Array<Array<string | number>>; fetchedAt: number }> = {};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

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
      // Strip HTML tags and trim
      const cellText = tdMatch[1].replace(/<[^>]*>/g, "").trim();
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
    return NextResponse.json({ age, group: config.group, data: cached.data, cached: true });
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
    
    if (data.length === 0) {
      return NextResponse.json(
        { error: "Puan durumu tablosu bulunamadı. Sayfa yapısı değişmiş olabilir.", age, group: config.group },
        { status: 404 }
      );
    }
    
    // Update cache
    cache[age] = { data, fetchedAt: Date.now() };
    
    return NextResponse.json({ age, group: config.group, data, cached: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error(`[puan-durumu] ${age} fetch error:`, message);
    
    // Return cached data if available even if stale
    if (cached) {
      return NextResponse.json({ age, group: config.group, data: cached.data, cached: true, stale: true });
    }
    
    return NextResponse.json(
      { error: `Veri alınamadı: ${message}` },
      { status: 502 }
    );
  }
}
