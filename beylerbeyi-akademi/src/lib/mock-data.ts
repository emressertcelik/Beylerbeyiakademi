import type { Player, PlayerMatchStat, Match } from "@/types/player";

export const U15_PLAYERS: Player[] = [
  { id: "u15-1", first_name: "Efe", last_name: "Yıldırım", jersey_number: 1, position: "Kaleci", foot: "Sağ", birth_date: "2010-03-15", status: "active", blood_type: "A+", height: 172, weight: 58, previous_teams: ["Üsküdar Spor", "Kadıköy FK"], technical: { reflexes: 8, positioning: 7, distribution: 6, communication: 7, oneOnOne: 8 }, physical: { speed: 5, stamina: 7, strength: 6, agility: 7, jumping: 8 } },
  { id: "u15-2", first_name: "Kaan", last_name: "Arslan", jersey_number: 2, position: "Defans", foot: "Sağ", birth_date: "2010-05-22", status: "active", blood_type: "B+", height: 168, weight: 55, previous_teams: ["Fenerbahçe"], technical: { tackle: 8, marking: 7, heading: 7, passing: 6, positioning: 8 }, physical: { speed: 7, stamina: 8, strength: 7, agility: 6, jumping: 7 } },
  { id: "u15-3", first_name: "Berat", last_name: "Çelik", jersey_number: 3, position: "Defans", foot: "Sol", birth_date: "2010-01-10", status: "active", blood_type: "0+", height: 170, weight: 57, previous_teams: [], technical: { tackle: 7, marking: 8, heading: 6, passing: 7, positioning: 7 }, physical: { speed: 6, stamina: 7, strength: 7, agility: 6, jumping: 6 } },
  { id: "u15-4", first_name: "Yusuf", last_name: "Demir", jersey_number: 4, position: "Defans", foot: "Sağ", birth_date: "2010-08-03", status: "active", blood_type: "A+", height: 175, weight: 60, previous_teams: ["Galatasaray", "Sarıyer SK"], technical: { tackle: 8, marking: 8, heading: 8, passing: 7, positioning: 8 }, physical: { speed: 6, stamina: 8, strength: 8, agility: 6, jumping: 8 } },
  { id: "u15-5", first_name: "Emirhan", last_name: "Kaya", jersey_number: 5, position: "Defans", foot: "Sağ", birth_date: "2010-11-28", status: "active", blood_type: "AB+", height: 171, weight: 56, previous_teams: ["Beşiktaş JK"], technical: { tackle: 7, marking: 7, heading: 6, passing: 6, positioning: 7 }, physical: { speed: 7, stamina: 7, strength: 6, agility: 7, jumping: 6 } },
  { id: "u15-6", first_name: "Arda", last_name: "Şahin", jersey_number: 6, position: "Orta Saha", foot: "Her İki", birth_date: "2010-02-14", status: "active", blood_type: "0-", height: 166, weight: 52, previous_teams: ["Kadıköy Gençlik"], technical: { passing: 9, vision: 8, dribbling: 7, shooting: 6, ballControl: 8 }, physical: { speed: 7, stamina: 9, strength: 5, agility: 8, jumping: 5 } },
  { id: "u15-7", first_name: "Can", last_name: "Öztürk", jersey_number: 7, position: "Orta Saha", foot: "Sol", birth_date: "2010-07-19", status: "S", blood_type: "A+", height: 169, weight: 54, previous_teams: [], technical: { passing: 7, vision: 7, dribbling: 8, shooting: 7, ballControl: 8 }, physical: { speed: 8, stamina: 7, strength: 5, agility: 8, jumping: 5 } },
  { id: "u15-8", first_name: "Mert", last_name: "Aydın", jersey_number: 8, position: "Orta Saha", foot: "Sağ", birth_date: "2010-04-25", status: "active", blood_type: "B-", height: 167, weight: 53, previous_teams: ["Üsküdar Spor"], technical: { passing: 8, vision: 7, dribbling: 6, shooting: 7, ballControl: 7 }, physical: { speed: 6, stamina: 8, strength: 6, agility: 7, jumping: 6 } },
  { id: "u15-9", first_name: "Ali", last_name: "Yılmaz", jersey_number: 9, position: "Forvet", foot: "Sağ", birth_date: "2010-09-08", status: "active", blood_type: "A+", height: 173, weight: 59, previous_teams: ["Fenerbahçe", "Galatasaray"], technical: { finishing: 9, positioning: 8, heading: 7, dribbling: 7, firstTouch: 8 }, physical: { speed: 8, stamina: 7, strength: 7, agility: 8, jumping: 7 } },
  { id: "u15-10", first_name: "Kerem", last_name: "Güneş", jersey_number: 10, position: "Orta Saha", foot: "Sol", birth_date: "2010-06-30", status: "active", blood_type: "0+", height: 165, weight: 51, previous_teams: ["Beşiktaş JK", "Kadıköy FK"], technical: { passing: 9, vision: 9, dribbling: 8, shooting: 7, ballControl: 9 }, physical: { speed: 7, stamina: 7, strength: 4, agility: 9, jumping: 5 } },
  { id: "u15-11", first_name: "Mehmet", last_name: "Koç", jersey_number: 11, position: "Forvet", foot: "Sağ", birth_date: "2010-12-05", status: "active", blood_type: "A-", height: 174, weight: 58, previous_teams: [], technical: { finishing: 8, positioning: 7, heading: 6, dribbling: 8, firstTouch: 7 }, physical: { speed: 9, stamina: 7, strength: 6, agility: 8, jumping: 6 } },
  { id: "u15-12", first_name: "Burak", last_name: "Erdem", jersey_number: 14, position: "Orta Saha", foot: "Sağ", birth_date: "2010-10-17", status: "active", blood_type: "B+", height: 168, weight: 54, previous_teams: ["Sarıyer SK"], technical: { passing: 7, vision: 6, dribbling: 6, shooting: 6, ballControl: 7 }, physical: { speed: 6, stamina: 8, strength: 6, agility: 6, jumping: 6 } },
  { id: "u15-13", first_name: "Berkay", last_name: "Tunç", jersey_number: 16, position: "Defans", foot: "Sağ", birth_date: "2010-03-22", status: "KY", blood_type: "0+", height: 172, weight: 57, previous_teams: ["Galatasaray"], technical: { tackle: 6, marking: 6, heading: 7, passing: 5, positioning: 6 }, physical: { speed: 6, stamina: 6, strength: 7, agility: 5, jumping: 7 } },
  { id: "u15-14", first_name: "Deniz", last_name: "Kara", jersey_number: 17, position: "Kaleci", foot: "Sağ", birth_date: "2010-08-11", status: "active", blood_type: "AB+", height: 176, weight: 62, previous_teams: [], technical: { reflexes: 7, positioning: 6, distribution: 7, communication: 6, oneOnOne: 7 }, physical: { speed: 5, stamina: 6, strength: 7, agility: 6, jumping: 7 } },
];

export const U19_PLAYERS: Player[] = [
  { id: "u19-1", first_name: "Oğuzhan", last_name: "Aktaş", jersey_number: 1, position: "Kaleci", foot: "Sağ", birth_date: "2006-01-20", status: "active", blood_type: "A+", height: 185, weight: 76, technical: { reflexes: 8, positioning: 8, distribution: 7, communication: 8, oneOnOne: 8 }, physical: { speed: 6, stamina: 7, strength: 8, agility: 7, jumping: 9 } },
  { id: "u19-2", first_name: "Serkan", last_name: "Yıldız", jersey_number: 2, position: "Defans", foot: "Sağ", birth_date: "2006-04-11", status: "active", blood_type: "0+", height: 180, weight: 72, technical: { tackle: 8, marking: 8, heading: 8, passing: 7, positioning: 8 }, physical: { speed: 7, stamina: 8, strength: 8, agility: 6, jumping: 8 } },
  { id: "u19-3", first_name: "Batuhan", last_name: "Polat", jersey_number: 3, position: "Defans", foot: "Sol", birth_date: "2006-07-05", status: "active", blood_type: "B+", height: 182, weight: 74, technical: { tackle: 7, marking: 8, heading: 7, passing: 7, positioning: 7 }, physical: { speed: 7, stamina: 8, strength: 8, agility: 6, jumping: 7 } },
  { id: "u19-4", first_name: "Onur", last_name: "Çetin", jersey_number: 4, position: "Defans", foot: "Sağ", birth_date: "2006-02-28", status: "active", blood_type: "A-", height: 183, weight: 75, technical: { tackle: 9, marking: 8, heading: 9, passing: 6, positioning: 8 }, physical: { speed: 6, stamina: 8, strength: 9, agility: 6, jumping: 9 } },
  { id: "u19-5", first_name: "Furkan", last_name: "Doğan", jersey_number: 5, position: "Orta Saha", foot: "Sağ", birth_date: "2006-09-14", status: "active", blood_type: "0+", height: 177, weight: 69, technical: { passing: 8, vision: 7, dribbling: 7, shooting: 7, ballControl: 8 }, physical: { speed: 7, stamina: 9, strength: 7, agility: 7, jumping: 6 } },
  { id: "u19-6", first_name: "Hakan", last_name: "Özdemir", jersey_number: 6, position: "Orta Saha", foot: "Her İki", birth_date: "2006-05-30", status: "S", blood_type: "AB+", height: 175, weight: 68, technical: { passing: 9, vision: 8, dribbling: 8, shooting: 6, ballControl: 8 }, physical: { speed: 7, stamina: 8, strength: 6, agility: 8, jumping: 6 } },
  { id: "u19-7", first_name: "Umut", last_name: "Korkmaz", jersey_number: 7, position: "Forvet", foot: "Sol", birth_date: "2006-11-22", status: "active", blood_type: "B-", height: 179, weight: 71, technical: { finishing: 8, positioning: 8, heading: 6, dribbling: 9, firstTouch: 8 }, physical: { speed: 9, stamina: 7, strength: 7, agility: 9, jumping: 6 } },
  { id: "u19-8", first_name: "Caner", last_name: "Toprak", jersey_number: 8, position: "Orta Saha", foot: "Sağ", birth_date: "2006-03-16", status: "active", blood_type: "A+", height: 176, weight: 70, technical: { passing: 8, vision: 7, dribbling: 7, shooting: 8, ballControl: 7 }, physical: { speed: 7, stamina: 9, strength: 7, agility: 7, jumping: 6 } },
  { id: "u19-9", first_name: "Tarık", last_name: "Acar", jersey_number: 9, position: "Forvet", foot: "Sağ", birth_date: "2006-06-08", status: "active", blood_type: "0-", height: 181, weight: 73, technical: { finishing: 9, positioning: 9, heading: 8, dribbling: 7, firstTouch: 8 }, physical: { speed: 8, stamina: 7, strength: 8, agility: 7, jumping: 8 } },
  { id: "u19-10", first_name: "Emre", last_name: "Şen", jersey_number: 10, position: "Orta Saha", foot: "Sol", birth_date: "2006-08-25", status: "active", blood_type: "A+", height: 174, weight: 67, technical: { passing: 9, vision: 9, dribbling: 9, shooting: 8, ballControl: 9 }, physical: { speed: 8, stamina: 7, strength: 5, agility: 9, jumping: 5 } },
  { id: "u19-11", first_name: "Semih", last_name: "Bal", jersey_number: 11, position: "Forvet", foot: "Sağ", birth_date: "2006-10-13", status: "active", blood_type: "B+", height: 178, weight: 70, technical: { finishing: 8, positioning: 7, heading: 7, dribbling: 8, firstTouch: 7 }, physical: { speed: 9, stamina: 8, strength: 7, agility: 8, jumping: 7 } },
];

export const U15_MATCHES: Match[] = [
  { id: "m-u15-1", week: 1, date: "2024-09-14", opponent: "Üsküdar Spor", venue: "Ev", home_score: 3, away_score: 0, is_home: true, status: "played" },
  { id: "m-u15-2", week: 2, date: "2024-09-21", opponent: "Fenerbahçe", venue: "Deplasman", home_score: 1, away_score: 2, is_home: false, status: "played" },
  { id: "m-u15-3", week: 3, date: "2024-09-28", opponent: "Galatasaray", venue: "Ev", home_score: 2, away_score: 2, is_home: true, status: "played" },
  { id: "m-u15-4", week: 4, date: "2024-10-05", opponent: "Beşiktaş JK", venue: "Deplasman", home_score: 4, away_score: 1, is_home: false, status: "played" },
  { id: "m-u15-5", week: 5, date: "2024-10-12", opponent: "Kadıköy Gençlik", venue: "Ev", home_score: 3, away_score: 1, is_home: true, status: "played" },
  { id: "m-u15-6", week: 6, date: "2024-10-19", opponent: "Sarıyer SK", venue: "Deplasman", home_score: 0, away_score: 0, is_home: false, status: "scheduled" },
];

export const U19_MATCHES: Match[] = [
  { id: "m-u19-1", week: 1, date: "2024-09-14", opponent: "Kadıköy FK", venue: "Ev", home_score: 2, away_score: 1, is_home: true, status: "played" },
  { id: "m-u19-2", week: 2, date: "2024-09-21", opponent: "Beşiktaş JK", venue: "Deplasman", home_score: 0, away_score: 2, is_home: false, status: "played" },
  { id: "m-u19-3", week: 3, date: "2024-09-28", opponent: "Sarıyer GK", venue: "Ev", home_score: 3, away_score: 0, is_home: true, status: "played" },
  { id: "m-u19-4", week: 4, date: "2024-10-05", opponent: "Galatasaray", venue: "Deplasman", home_score: 1, away_score: 1, is_home: false, status: "played" },
  { id: "m-u19-5", week: 5, date: "2024-10-12", opponent: "Fenerbahçe", venue: "Ev", home_score: 2, away_score: 3, is_home: true, status: "played" },
];

export const U15_STATS: PlayerMatchStat[] = [
  { player_id: "u15-9", match_id: "m-u15-1", match_week: 1, minutes_played: 90, goals: 2, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-9", match_id: "m-u15-2", match_week: 2, minutes_played: 90, goals: 1, assists: 0, yellow_cards: 1, red_cards: 0, status: "played" },
  { player_id: "u15-9", match_id: "m-u15-3", match_week: 3, minutes_played: 70, goals: 1, assists: 1, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-9", match_id: "m-u15-4", match_week: 4, minutes_played: 90, goals: 2, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-9", match_id: "m-u15-5", match_week: 5, minutes_played: 85, goals: 1, assists: 1, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-10", match_id: "m-u15-1", match_week: 1, minutes_played: 90, goals: 1, assists: 2, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-10", match_id: "m-u15-2", match_week: 2, minutes_played: 80, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-10", match_id: "m-u15-3", match_week: 3, minutes_played: 90, goals: 0, assists: 1, yellow_cards: 1, red_cards: 0, status: "played" },
  { player_id: "u15-10", match_id: "m-u15-4", match_week: 4, minutes_played: 60, goals: 1, assists: 2, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-10", match_id: "m-u15-5", match_week: 5, minutes_played: 90, goals: 0, assists: 1, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-11", match_id: "m-u15-1", match_week: 1, minutes_played: 45, goals: 0, assists: 1, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-11", match_id: "m-u15-2", match_week: 2, minutes_played: 90, goals: 0, assists: 1, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-11", match_id: "m-u15-3", match_week: 3, minutes_played: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "S" },
  { player_id: "u15-11", match_id: "m-u15-4", match_week: 4, minutes_played: 75, goals: 1, assists: 0, yellow_cards: 1, red_cards: 0, status: "played" },
  { player_id: "u15-11", match_id: "m-u15-5", match_week: 5, minutes_played: 90, goals: 2, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-7", match_id: "m-u15-1", match_week: 1, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-7", match_id: "m-u15-2", match_week: 2, minutes_played: 65, goals: 0, assists: 0, yellow_cards: 1, red_cards: 0, status: "played" },
  { player_id: "u15-7", match_id: "m-u15-3", match_week: 3, minutes_played: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "S" },
  { player_id: "u15-7", match_id: "m-u15-4", match_week: 4, minutes_played: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "S" },
  { player_id: "u15-7", match_id: "m-u15-5", match_week: 5, minutes_played: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "S" },
  { player_id: "u15-1", match_id: "m-u15-1", match_week: 1, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-1", match_id: "m-u15-2", match_week: 2, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-1", match_id: "m-u15-3", match_week: 3, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-1", match_id: "m-u15-4", match_week: 4, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-1", match_id: "m-u15-5", match_week: 5, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 1, red_cards: 0, status: "played" },
  { player_id: "u15-6", match_id: "m-u15-1", match_week: 1, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-6", match_id: "m-u15-2", match_week: 2, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-6", match_id: "m-u15-3", match_week: 3, minutes_played: 90, goals: 1, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-6", match_id: "m-u15-4", match_week: 4, minutes_played: 90, goals: 1, assists: 1, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-6", match_id: "m-u15-5", match_week: 5, minutes_played: 80, goals: 0, assists: 1, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-2", match_id: "m-u15-1", match_week: 1, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-2", match_id: "m-u15-2", match_week: 2, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 1, red_cards: 0, status: "played" },
  { player_id: "u15-2", match_id: "m-u15-3", match_week: 3, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-2", match_id: "m-u15-4", match_week: 4, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-2", match_id: "m-u15-5", match_week: 5, minutes_played: 90, goals: 0, assists: 1, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-4", match_id: "m-u15-1", match_week: 1, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-4", match_id: "m-u15-2", match_week: 2, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-4", match_id: "m-u15-3", match_week: 3, minutes_played: 90, goals: 1, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-4", match_id: "m-u15-4", match_week: 4, minutes_played: 90, goals: 0, assists: 1, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-4", match_id: "m-u15-5", match_week: 5, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-8", match_id: "m-u15-1", match_week: 1, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-8", match_id: "m-u15-2", match_week: 2, minutes_played: 70, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-8", match_id: "m-u15-3", match_week: 3, minutes_played: 90, goals: 0, assists: 1, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u15-8", match_id: "m-u15-4", match_week: 4, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 1, red_cards: 0, status: "played" },
  { player_id: "u15-8", match_id: "m-u15-5", match_week: 5, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
];

export const U19_STATS: PlayerMatchStat[] = [
  { player_id: "u19-9", match_id: "m-u19-1", match_week: 1, minutes_played: 90, goals: 1, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-9", match_id: "m-u19-2", match_week: 2, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 1, red_cards: 0, status: "played" },
  { player_id: "u19-9", match_id: "m-u19-3", match_week: 3, minutes_played: 90, goals: 2, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-9", match_id: "m-u19-4", match_week: 4, minutes_played: 80, goals: 1, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-9", match_id: "m-u19-5", match_week: 5, minutes_played: 90, goals: 1, assists: 1, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-10", match_id: "m-u19-1", match_week: 1, minutes_played: 90, goals: 1, assists: 1, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-10", match_id: "m-u19-2", match_week: 2, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-10", match_id: "m-u19-3", match_week: 3, minutes_played: 90, goals: 0, assists: 2, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-10", match_id: "m-u19-4", match_week: 4, minutes_played: 70, goals: 0, assists: 1, yellow_cards: 1, red_cards: 0, status: "played" },
  { player_id: "u19-10", match_id: "m-u19-5", match_week: 5, minutes_played: 90, goals: 1, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-7", match_id: "m-u19-1", match_week: 1, minutes_played: 75, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-7", match_id: "m-u19-2", match_week: 2, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-7", match_id: "m-u19-3", match_week: 3, minutes_played: 90, goals: 1, assists: 1, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-7", match_id: "m-u19-4", match_week: 4, minutes_played: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "S" },
  { player_id: "u19-7", match_id: "m-u19-5", match_week: 5, minutes_played: 60, goals: 1, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-11", match_id: "m-u19-1", match_week: 1, minutes_played: 60, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-11", match_id: "m-u19-2", match_week: 2, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 1, red_cards: 0, status: "played" },
  { player_id: "u19-11", match_id: "m-u19-3", match_week: 3, minutes_played: 45, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-11", match_id: "m-u19-4", match_week: 4, minutes_played: 90, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
  { player_id: "u19-11", match_id: "m-u19-5", match_week: 5, minutes_played: 90, goals: 2, assists: 0, yellow_cards: 0, red_cards: 0, status: "played" },
];

// Helpers
export function getPlayersByAgeGroup(ag: string): Player[] {
  if (ag === "U15") return U15_PLAYERS;
  if (ag === "U19") return U19_PLAYERS;
  return [];
}
export function getMatchesByAgeGroup(ag: string): Match[] {
  if (ag === "U15") return U15_MATCHES;
  if (ag === "U19") return U19_MATCHES;
  return [];
}
export function getStatsByAgeGroup(ag: string): PlayerMatchStat[] {
  if (ag === "U15") return U15_STATS;
  if (ag === "U19") return U19_STATS;
  return [];
}
export function getPlayerSeasonSummary(playerId: string, stats: PlayerMatchStat[]) {
  const ps = stats.filter((s) => s.player_id === playerId);
  return {
    total_minutes: ps.reduce((a, s) => a + s.minutes_played, 0),
    total_goals: ps.reduce((a, s) => a + s.goals, 0),
    total_assists: ps.reduce((a, s) => a + s.assists, 0),
    total_yellow: ps.reduce((a, s) => a + s.yellow_cards, 0),
    total_red: ps.reduce((a, s) => a + s.red_cards, 0),
    matches_played: ps.filter((s) => s.status === "played").length,
    weekly_stats: ps,
  };
}
