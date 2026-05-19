import React, { useState, useMemo, useEffect } from "react";
import {
  Sparkles, Loader2, RefreshCw, X, Search, Brain, AlertTriangle,
  Star, Trophy, Globe, ArrowRight, Menu, Calendar, CheckCircle,
  BarChart2, List, Layers
} from "lucide-react";

// Robust JSON parser
function parseFlexibleJSON(text: string): any {
  let cleaned = text.replace(/```json|```/g, "").trim();
  try { return JSON.parse(cleaned); } catch (e) {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    let jsonStr = match[0];
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1");
    try { return JSON.parse(jsonStr); } catch (e) {}
  }
  throw new Error("Invalid JSON from AI. Try again.");
}


// =============================================================================
// BM8 AI — Football Prediction App (FINAL)
// =============================================================================
// Trilingual: English / 中文 / Bahasa Melayu
// Powered by Claude Sonnet 4 (branded as "BM8 AI")
//
// !!! IMPORTANT !!!
// Put your two images in your project's public/ folder:
//   - public/bm8-logo.png     (your official BM8 logo)
//   - public/football.jpg     (your football visual)
// They will be referenced as "/bm8-logo.png" and "/football.jpg"
// =============================================================================

// ---- Image paths ----
const BM8_LOGO = "/bm8-logo.png";
const FOOTBALL_IMG = "/football.jpg";

// API key is safely stored on the backend (see api/gemini.js)
// Frontend calls our own /api/gemini endpoint instead

// ---- Translations ----
const T = {
  en: {
    tagline: "MR.EDGE",
    nav: { fixtures: "Fixtures", results: "Results", insights: "Insights", standings: "Standings", parlay: "Parlay" },
    heroLabel: "REAL FIXTURES · LIVE PREDICTIONS",
    heroTitle1: "READ THE GAME.",
    heroTitleEm: "WIN",
    heroTitle2: "THE BET.",
    heroSub: "Real bookmaker odds, live statistics and AI-powered analysis — combined into one clear, decisive prediction.",
    // Live Predictions page
    liveHeroLabel: "LIVE · HAPPENING NOW",
    liveHeroTitle: "TODAY'S HOT MATCHES",
    liveHeroSub: "Matches happening today or in the next 24 hours. AI predicts every one of them instantly.",
    livePredictAll: "Predict all matches",
    livePredicting: "AI analyzing all matches...",
    // Results page
    resultsHeroLabel: "RESULTS · FINAL SCORES",
    resultsHeroTitle: "RECENT RESULTS",
    resultsHeroSub: "Review the latest completed matches. Tap any to see the AI's breakdown of what happened and why.",
    noResults: "No completed matches yet.",
    // Insights page
    insightsHeroLabel: "INSIGHTS · DATA & TRENDS",
    insightsHeroTitle: "LEAGUE INSIGHTS",
    insightsHeroSub: "Statistics, league activity, and AI-powered trend analysis across all tracked competitions.",
    statsLeagues: "Leagues tracked",
    statsUpcoming: "Upcoming matches",
    statsRecent: "Recent results",
    statsSample: "Sample fixtures",
    leagueBreakdown: "Matches per league",
    askAi: "Ask AI about trends",
    aiAnalyzing: "AI is analyzing trends...",
    aiPlaceholder: "E.g. 'Who has the best form this week?' or 'Compare Arsenal vs Man City'",
    ask: "Ask",
    searchPlaceholder: "Search team, league, or date — e.g. 'Arsenal', 'EPL', '25 Apr'...",
    upcoming: "Upcoming Matches", today: "Today's Matches", recent: "Completed Matches", all: "All", allLeagues: "All Leagues",
    refresh: "Refresh from web", refreshing: "Refreshing...",
    statusInitial: "Showing sample fixtures. Click 'Refresh from web' for the latest.",
    statusSearching: "MR.EDGE is searching the web for fixtures...",
    statusRefreshed: (time, count, leagues) => `Refreshed at ${time} · ${count} matches · ${leagues} leagues`,
    statusFailed: (msg) => `Refresh failed: ${msg}`,
    noMatches: "No matches in this view.",
    noSearchResults: (q) => `No matches found for "${q}".`,
    predict: "Predict", analyze: "Analyze", predicting: "Predicting...", analyzing: "Analyzing...",
    ft: "FT", vs: "VS",
    aiPrediction: "MR.EDGE PREDICTION", aiAnalysis: "MR.EDGE MATCH ANALYSIS",
    confidence: "confidence", high: "High", medium: "Medium", low: "Low",
    close: "Close", predictedLikely: "PREDICTED · LIKELY", fullTime: "FULL TIME",
    outcomeProb: "OUTCOME PROBABILITY", aiReasoning: "MR.EDGE AI REASONING",
    keyFactors: "KEY FACTORS", watchOut: "WATCH OUT FOR",
    starPlayer: "STAR PLAYER", keyMoments: "KEY MOMENTS",
    analysis: "ANALYSIS", whatThisMeans: "WHAT THIS MEANS",
    win: "WIN", draw: "DRAW", drawCap: "Draw",
    hide: "Hide",
    homeWin: "Home Win",
    awayWin: "Away Win",
    estGoals: "Est. Goals",
    matchType: "Match Type",
    overUnderGoals: "Goals Over/Under 2.5",
    analysingMatch: (h, a) => `MR.EDGE is analysing ${h} vs ${a}...`,
    failedMsg: (msg) => `Failed: ${msg}`,
    concurrentError: "Another prediction is in progress. Please wait.",
    footer1: "FIXTURES · WEB SEARCH", footer2: "ANALYSIS · MR.EDGE AI", footer3: "FOR ENTERTAINMENT",
    watchLive: "Watch Live",
    chatTitle: "MR.EDGE",
    chatSubtitle: "How can I help you today?",
    chatSelect: "Select a section to get started:",
    chatQ1: "How accurate are MR.EDGE predictions?",
    chatQ2: "Need Help?",
    chatBack: "‹ Back to questions",
    chatAccuracyRate: "Accuracy Rate",
    chatAccuracyBased: "Based on historical data",
    chatAccuracyDesc: "MR.EDGE predictions have an accuracy rate of approximately 87% based on historical data.",
    chatAccuracyDisclaimer: "However, sports outcomes can be unpredictable. We recommend using MR.EDGE as one factor in your decision-making process.",
    chatHelpDesc: "You can reach out to MR.EDGE livechat:",
    chatLiveChat: "Contact Live Chat",
    chatLiveChatSub: "We're here to help!",
    chatOpHours: "Operation Hours:",
    chatOpTime: "24 Hours",
    chatBetDesc: "Please click the link below to bet now:",
    chatBetBtn: "Bet Now",
    chatQ3: "Need Help?",
    chatQ4: "Follow Us",
    chatFollowDesc: "Follow us on social media:",
    playerWatch: "KEY PLAYERS TO WATCH",
    injuriesSusp: "INJURIES & SUSPENSIONS",
    homeTeam: "Home",
    awayTeam: "Away",
    // Parlay page
    parlayHeroLabel: "PARLAY · AI DOUBLE STRATEGY",
    parlayHeroTitle: "AI DOUBLE PICKS",
    parlayHeroSub: "MR.EDGE AI scans all upcoming fixtures and picks the 2 best same-type matches for a parlay — structured by big goals, draw/under, or comeback patterns.",
    parlayStrategy1Title: "Big Goals",
    parlayStrategy1Sub: "Eredivisie · Bundesliga DNA",
    parlayStrategy1Desc: "Open, attack-heavy leagues. AI picks 2 games where both sides have weak backlines and must attack.",
    parlayStrategy2Title: "Draw / Under",
    parlayStrategy2Sub: "Tactical · Mid-table grind",
    parlayStrategy2Desc: "No-stakes mid-table clashes with high draw rates and low expected goals. Best return for small stake.",
    parlayStrategy3Title: "Comeback Kings",
    parlayStrategy3Sub: "2nd-half explosion",
    parlayStrategy3Desc: "Teams that start slow but dominate after 60'. AI finds pairs where opponents are weak-roster underdogs.",
    parlayGenerate: "Generate AI Double Picks",
    parlayGenerating: "AI scanning fixtures...",
    parlayPick: "Pick",
    parlayBetType: "Bet Type",
    parlayComboWhy: "WHY THIS DOUBLE WORKS",
    parlayEstOdds: "Est. Combined Odds",
    parlayRiskNote: "Risk Note",
    parlayConfidence: "Confidence",
    parlayNoMatches: "Not enough upcoming matches to generate a parlay. Refresh fixtures first.",
    parlayError: "Could not generate parlay. Try again.",
    parlayRegenerate: "New Picks",
  },
  zh: {
    tagline: "锋先生",
    nav: { fixtures: "赛程", results: "结果", insights: "洞察", standings: "积分榜", parlay: "二串一" },
    heroLabel: "真实赛程 · 实时预测",
    heroTitle1: "读懂比赛。",
    heroTitleEm: "赢",
    heroTitle2: "得投注。",
    heroSub: "真实庄家赔率、实时数据与 AI 分析——汇聚成一个清晰、决定性的预测。",
    // Live
    liveHeroLabel: "直播 · 正在进行",
    liveHeroTitle: "今日热门比赛",
    liveHeroSub: "今天或未来 24 小时内的比赛。AI 即时为每一场分析预测。",
    livePredictAll: "预测所有比赛",
    livePredicting: "AI 正在分析所有比赛...",
    // Results
    resultsHeroLabel: "结果 · 最终比分",
    resultsHeroTitle: "最新结果",
    resultsHeroSub: "查看最近完成的比赛。点击任意一场,让 AI 为你剖析比赛过程与关键。",
    noResults: "暂无已完成的比赛。",
    // Insights
    insightsHeroLabel: "洞察 · 数据与趋势",
    insightsHeroTitle: "联赛洞察",
    insightsHeroSub: "统计数据、联赛活动与 AI 趋势分析,覆盖所有追踪的赛事。",
    statsLeagues: "追踪联赛",
    statsUpcoming: "即将开赛",
    statsRecent: "近期结果",
    statsSample: "示例赛程",
    leagueBreakdown: "各联赛比赛数",
    askAi: "询问 AI 趋势",
    aiAnalyzing: "AI 正在分析趋势...",
    aiPlaceholder: "例如:「本周状态最好的球队?」或「对比 Arsenal 和 Man City」",
    ask: "提问",
    searchPlaceholder: "搜索球队、联赛或日期——例如 'Arsenal'、'EPL'、'25 Apr'...",
    upcoming: "即将开赛", today: "今日赛事", recent: "已完成", all: "全部", allLeagues: "所有联赛",
    refresh: "从网络刷新", refreshing: "刷新中...",
    statusInitial: "显示示例赛程。点击「从网络刷新」获取最新数据。",
    statusSearching: "锋先生 正在搜索最新赛程...",
    statusRefreshed: (time, count, leagues) => `${time} 已刷新 · ${count} 场比赛 · ${leagues} 个联赛`,
    statusFailed: (msg) => `刷新失败:${msg}`,
    noMatches: "此视图中没有比赛。",
    noSearchResults: (q) => `未找到「${q}」的比赛。`,
    predict: "预测", analyze: "分析", predicting: "预测中...", analyzing: "分析中...",
    ft: "完场", vs: "VS",
    aiPrediction: "锋先生 预测", aiAnalysis: "锋先生 赛事分析",
    confidence: "信心", high: "高", medium: "中", low: "低",
    close: "关闭", predictedLikely: "预测 · 最可能", fullTime: "全场结束",
    outcomeProb: "胜负概率", aiReasoning: "锋先生 推理",
    keyFactors: "关键因素", watchOut: "需要注意",
    starPlayer: "明星球员", keyMoments: "关键时刻",
    analysis: "分析", whatThisMeans: "这意味着",
    win: "胜", draw: "平", drawCap: "平局",
    hide: "收起",
    homeWin: "主胜",
    awayWin: "客胜",
    estGoals: "预期进球",
    matchType: "比赛类型",
    overUnderGoals: "大小球 2.5",
    analysingMatch: (h, a) => `锋先生 正在分析 ${h} vs ${a}...`,
    failedMsg: (msg) => `失败:${msg}`,
    concurrentError: "另一个预测正在进行中，请稍候。",
    footer1: "赛程 · 网络搜索", footer2: "分析 · 锋先生", footer3: "仅供娱乐",
    watchLive: "观看直播",
    chatTitle: "锋先生",
    chatSubtitle: "今天有什么可以帮你？",
    chatSelect: "选择一个版块开始：",
    chatQ1: "锋先生的预测准确率如何？",
    chatQ2: "需要帮助？",
    chatBack: "‹ 返回问题",
    chatAccuracyRate: "准确率",
    chatAccuracyBased: "基于历史数据",
    chatAccuracyDesc: "锋先生的预测准确率约为 87%，基于历史数据。",
    chatAccuracyDisclaimer: "然而，体育赛事结果难以预测。我们建议将锋先生作为决策参考之一。",
    chatHelpDesc: "您可以通过锋先生在线客服联系我们：",
    chatLiveChat: "联系在线客服",
    chatLiveChatSub: "我们随时为您服务！",
    chatOpHours: "服务时间：",
    chatOpTime: "24小时",
    chatBetDesc: "请点击以下链接立即投注：",
    chatBetBtn: "立即投注",
    chatQ3: "需要帮助？",
    chatQ4: "关注我们",
    chatFollowDesc: "在社交媒体上关注我们：",
    playerWatch: "关键球员观察",
    injuriesSusp: "伤病 / 停赛",
    homeTeam: "主队",
    awayTeam: "客队",
    // Parlay page
    parlayHeroLabel: "二串一 · AI 串关策略",
    parlayHeroTitle: "AI 二串一推荐",
    parlayHeroSub: "锋先生扫描所有即将开赛的比赛，从大球、小球平局、逆转三套思路中挑出最强两场配对，帮你做有依据的串关。",
    parlayStrategy1Title: "大球",
    parlayStrategy1Sub: "荷甲 · 德甲基因",
    parlayStrategy1Desc: "进攻型联赛，全攻全守。AI 挑两场防守松散、进球密集的对决。",
    parlayStrategy2Title: "平局 / 小球",
    parlayStrategy2Sub: "战术型 · 中游无欲",
    parlayStrategy2Desc: "中游球队互碰，平局率高，总进球最多1球。小资金高回报。",
    parlayStrategy3Title: "逆转王",
    parlayStrategy3Sub: "下半场爆发",
    parlayStrategy3Desc: "上半场慢热、下半场转化率极高的球队，对手是弱旅。走反反胜路线。",
    parlayGenerate: "AI 生成二串一",
    parlayGenerating: "AI 正在扫描赛程...",
    parlayPick: "推荐",
    parlayBetType: "投注类型",
    parlayComboWhy: "为什么这两场配对",
    parlayEstOdds: "预估综合赔率",
    parlayRiskNote: "风险提示",
    parlayConfidence: "信心",
    parlayNoMatches: "即将开赛的比赛不足，无法生成串关。请先刷新赛程。",
    parlayError: "生成串关失败，请重试。",
    parlayRegenerate: "重新生成",
  },
  ms: {
    tagline: "MR.EDGE",
    nav: { fixtures: "Perlawanan", results: "Keputusan", insights: "Analisis", standings: "Kedudukan", parlay: "Parlay" },
    heroLabel: "PERLAWANAN SEBENAR · RAMALAN LANGSUNG",
    heroTitle1: "Baca permainan.",
    heroTitleEm: "Menang",
    heroTitle2: "pertaruhan.",
    heroSub: "Odds dari 40+ jurubook, statistik langsung dan analisis berkuasa AI — digabung menjadi satu ramalan yang jelas dan muktamad.",
    // Live
    liveHeroLabel: "LANGSUNG · SEDANG BERLANGSUNG",
    liveHeroTitle: "PERLAWANAN HANGAT HARI INI",
    liveHeroSub: "Perlawanan yang berlangsung hari ini atau dalam 24 jam akan datang. AI meramal setiap satu serta-merta.",
    livePredictAll: "Ramal semua perlawanan",
    livePredicting: "AI sedang menganalisis...",
    // Results
    resultsHeroLabel: "KEPUTUSAN · SKOR AKHIR",
    resultsHeroTitle: "KEPUTUSAN TERKINI",
    resultsHeroSub: "Semak perlawanan yang baru tamat. Ketik mana-mana untuk melihat analisis AI mengenai apa yang berlaku.",
    noResults: "Belum ada perlawanan yang tamat.",
    // Insights
    insightsHeroLabel: "ANALISIS · DATA & TRENDA",
    insightsHeroTitle: "ANALISIS LIGA",
    insightsHeroSub: "Statistik, aktiviti liga, dan analisis trenda dikuasakan AI merentasi semua pertandingan.",
    statsLeagues: "Liga dijejak",
    statsUpcoming: "Akan datang",
    statsRecent: "Keputusan terkini",
    statsSample: "Contoh perlawanan",
    leagueBreakdown: "Perlawanan ikut liga",
    askAi: "Tanya AI tentang trenda",
    aiAnalyzing: "AI sedang menganalisis trenda...",
    aiPlaceholder: "Cth: 'Pasukan mana paling bagus minggu ini?' atau 'Bandingkan Arsenal dan Man City'",
    ask: "Tanya",
    searchPlaceholder: "Cari pasukan, liga, atau tarikh — cth. 'Arsenal', 'EPL', '25 Apr'...",
    upcoming: "Perlawanan Akan Datang", today: "Perlawanan Hari Ini", recent: "Perlawanan Selesai", all: "Semua", allLeagues: "Semua Liga",
    refresh: "Muat semula dari web", refreshing: "Memuat semula...",
    statusInitial: "Menunjukkan contoh perlawanan. Klik 'Muat semula' untuk data terkini.",
    statusSearching: "MR.EDGE sedang mencari perlawanan terkini...",
    statusRefreshed: (time, count, leagues) => `Dimuat semula pada ${time} · ${count} perlawanan · ${leagues} liga`,
    statusFailed: (msg) => `Muat semula gagal: ${msg}`,
    noMatches: "Tiada perlawanan dalam paparan ini.",
    noSearchResults: (q) => `Tiada perlawanan dijumpai untuk "${q}".`,
    predict: "Ramal", analyze: "Analisis", predicting: "Meramal...", analyzing: "Menganalisis...",
    ft: "TM", vs: "VS",
    aiPrediction: "RAMALAN MR.EDGE", aiAnalysis: "ANALISIS PERLAWANAN MR.EDGE",
    confidence: "keyakinan", high: "Tinggi", medium: "Sederhana", low: "Rendah",
    close: "Tutup", predictedLikely: "DIRAMAL · BERKEMUNGKINAN", fullTime: "TAMAT MASA",
    outcomeProb: "KEBARANGKALIAN KEPUTUSAN", aiReasoning: "PENAAKULAN MR.EDGE",
    keyFactors: "FAKTOR UTAMA", watchOut: "PERLU DIPERHATIKAN",
    starPlayer: "PEMAIN BINTANG", keyMoments: "DETIK PENTING",
    analysis: "ANALISIS", whatThisMeans: "APA INI BERMAKNA",
    win: "MENANG", draw: "SERI", drawCap: "Seri",
    hide: "Tutup",
    homeWin: "Tuan Rumah",
    awayWin: "Tetamu",
    estGoals: "Anggaran Gol",
    matchType: "Jenis Perlawanan",
    overUnderGoals: "Gol Atas/Bawah 2.5",
    analysingMatch: (h, a) => `MR.EDGE sedang menganalisis ${h} vs ${a}...`,
    failedMsg: (msg) => `Gagal: ${msg}`,
    concurrentError: "Ramalan lain sedang diproses. Sila tunggu.",
    footer1: "PERLAWANAN · CARIAN WEB", footer2: "ANALISIS · MR.EDGE", footer3: "UNTUK HIBURAN",
    watchLive: "Tonton Langsung",
    chatTitle: "MR.EDGE",
    chatSubtitle: "Apa yang boleh saya bantu hari ini?",
    chatSelect: "Pilih bahagian untuk bermula:",
    chatQ1: "Seberapa tepat ramalan MR.EDGE?",
    chatQ2: "Perlukan Bantuan?",
    chatBack: "‹ Kembali ke soalan",
    chatAccuracyRate: "Kadar Ketepatan",
    chatAccuracyBased: "Berdasarkan data sejarah",
    chatAccuracyDesc: "Ramalan MR.EDGE mempunyai kadar ketepatan kira-kira 87% berdasarkan data sejarah.",
    chatAccuracyDisclaimer: "Walau bagaimanapun, keputusan sukan sukar diramal. Kami mengesyorkan menggunakan MR.EDGE sebagai salah satu faktor dalam proses membuat keputusan anda.",
    chatHelpDesc: "Anda boleh menghubungi livechat MR.EDGE:",
    chatLiveChat: "Hubungi Live Chat",
    chatLiveChatSub: "Kami sedia membantu!",
    chatOpHours: "Waktu Operasi:",
    chatOpTime: "24 Jam",
    chatBetDesc: "Sila klik pautan di bawah untuk bet sekarang:",
    chatBetBtn: "Bet Sekarang",
    chatQ3: "Perlukan Bantuan?",
    chatQ4: "Ikuti Kami",
    chatFollowDesc: "Ikuti kami di media sosial:",
    playerWatch: "PEMAIN KUNCI",
    injuriesSusp: "KECEDERAAN & PENGGANTUNGAN",
    homeTeam: "Tuan Rumah",
    awayTeam: "Tetamu",
    // Parlay page
    parlayHeroLabel: "PARLAY · STRATEGI DOUBLE AI",
    parlayHeroTitle: "PILIHAN DOUBLE AI",
    parlayHeroSub: "MR.EDGE mengimbas semua perlawanan akan datang dan memilih 2 perlawanan terbaik untuk parlay — berdasarkan corak gol tinggi, seri/rendah, atau pusingan balik.",
    parlayStrategy1Title: "Gol Tinggi",
    parlayStrategy1Sub: "DNA Eredivisie · Bundesliga",
    parlayStrategy1Desc: "Liga serangan terbuka. AI pilih 2 perlawanan dengan barisan pertahanan lemah dan kedua-dua pihak perlu menyerang.",
    parlayStrategy2Title: "Seri / Bawah",
    parlayStrategy2Sub: "Taktikal · Pasukan tengah",
    parlayStrategy2Desc: "Pasukan tengah jadual tanpa tekanan, kadar seri tinggi dan jangkaan gol rendah. Pulangan tinggi modal kecil.",
    parlayStrategy3Title: "Raja Pusingan Balik",
    parlayStrategy3Sub: "Letupan separuh masa ke-2",
    parlayStrategy3Desc: "Pasukan lambat panas tapi dominan selepas 60 minit. AI cari pasangan dengan lawan yang lemah.",
    parlayGenerate: "Jana Pilihan Double AI",
    parlayGenerating: "AI mengimbas perlawanan...",
    parlayPick: "Pilihan",
    parlayBetType: "Jenis Pertaruhan",
    parlayComboWhy: "KENAPA DOUBLE INI SESUAI",
    parlayEstOdds: "Anggaran Odds Gabungan",
    parlayRiskNote: "Nota Risiko",
    parlayConfidence: "Keyakinan",
    parlayNoMatches: "Perlawanan akan datang tidak mencukupi. Sila muat semula perlawanan dahulu.",
    parlayError: "Gagal menjana parlay. Cuba lagi.",
    parlayRegenerate: "Jana Semula",
  },
};

const TEAM_LOGOS = {
  // EPL
  "Arsenal": "359", "Aston Villa": "362", "Bournemouth": "349", "Brentford": "337",
  "Brighton": "331", "Brighton & Hove Albion": "331", "Burnley": "379",
  "Chelsea": "363", "Crystal Palace": "384", "Everton": "368", "Fulham": "370",
  "Leeds": "357", "Leeds United": "357", "Liverpool": "364",
  "Man City": "382", "Man. City": "382", "Manchester City": "382",
  "Man United": "360", "Man Utd": "360", "Man. United": "360", "Manchester United": "360",
  "Newcastle": "361", "Newcastle United": "361", "Nottingham Forest": "393",
  "Nott'm Forest": "393", "Nottm Forest": "393",
  "Sunderland": "366", "Tottenham": "367", "Spurs": "367", "Tottenham Hotspur": "367",
  "West Ham": "371", "West Ham United": "371", "Wolves": "380", "Wolverhampton": "380",
  "Leicester": "375", "Leicester City": "375", "Southampton": "394", "Ipswich": "396", "Ipswich Town": "396",
  // La Liga
  "Real Madrid": "86", "Barcelona": "83", "Barça": "83",
  "Atletico Madrid": "1068", "Atlético Madrid": "1068", "Atleti": "1068", "Atlético de M.": "1068",
  "Sevilla": "243", "Valencia": "94", "Villarreal": "102", "Real Sociedad": "89", "R. Sociedad": "89",
  "Athletic Bilbao": "93", "Athletic Club": "93", "Athletic": "93",
  "Real Betis": "244", "R. Betis": "244", "Girona": "9812", "Osasuna": "97",
  "Celta Vigo": "85", "Celta": "85", "Mallorca": "84", "RCD Mallorca": "84",
  "Getafe": "2922", "Rayo Vallecano": "101", "Rayo": "101",
  "Espanyol": "88", "RCD Espanyol": "88",
  "Alaves": "96", "Alavés": "96", "Alavés CF": "96",
  "Levante": "99", "Elche": "98", "Oviedo": "100", "Las Palmas": "7939",
  "Valladolid": "9906", "Leganes": "5564", "Leganés": "5564",
  // Serie A
  "Juventus": "111", "Juve": "111",
  "Inter Milan": "110", "Inter": "110", "FC Internazionale": "110",
  "AC Milan": "103", "Milan": "103",
  "Napoli": "114", "Roma": "104", "Lazio": "105", "Atalanta": "798", "Fiorentina": "109",
  "Bologna": "107", "Torino": "106", "Toro": "106",
  "Udinese": "115", "Sassuolo": "112", "Genoa": "2884",
  "Cagliari": "2920", "Lecce": "118", "Hellas Verona": "117", "Verona": "117",
  "Como": "2954", "Parma": "120", "Venezia": "4056", "Monza": "9901",
  "Cremonese": "4050", "AC Pisa": "3956", "Pisa": "3956",
  // Bundesliga
  "Bayern Munich": "132", "Bayern": "132", "FC Bayern": "132",
  "Borussia Dortmund": "124", "Dortmund": "124", "BVB": "124",
  "RB Leipzig": "11420", "Leipzig": "11420",
  "Bayer Leverkusen": "131", "Leverkusen": "131", "B04": "131",
  "Stuttgart": "134", "VfB Stuttgart": "134",
  "Eintracht Frankfurt": "125", "Frankfurt": "125", "SGE": "125",
  "Hoffenheim": "7911", "TSG Hoffenheim": "7911",
  "Borussia Mönchengladbach": "133", "Gladbach": "133", "M'gladbach": "133",
  "Wolfsburg": "138", "Freiburg": "127", "Mainz": "129", "Augsburg": "9911",
  "Werder Bremen": "137", "Werder": "137",
  "Union Berlin": "598", "FC Köln": "122", "Köln": "122",
  "Hamburger SV": "128", "HSV": "128", "St. Pauli": "270", "FC St. Pauli": "270",
  "Heidenheim": "6418", "Darmstadt": "9779",
  // Ligue 1
  "Paris Saint-Germain": "160", "PSG": "160",
  "Marseille": "176", "Olympique Marseille": "176", "OM": "176",
  "Olympique Lyonnais": "166", "Olympique Lyon": "166", "Lyon": "166", "OL": "166",
  "AS Monaco": "174", "Monaco": "174",
  "Lille": "165", "LOSC Lille": "165",
  "Nice": "164", "OGC Nice": "164",
  "Stade Rennes": "171", "Rennes": "171",
  "Strasbourg": "180", "RC Strasbourg": "180",
  "RC Lens": "175", "Lens": "175",
  "Toulouse": "186", "Toulouse FC": "186",
  "FC Nantes": "159", "Nantes": "159",
  "Brest": "6997", "Stade Brestois": "6997",
  "Le Havre": "189", "Le Havre AC": "189",
  "FC Metz": "169", "Metz": "169",
  "Auxerre": "172", "AJ Auxerre": "172",
  "Angers": "162", "Lorient": "168", "Paris FC": "9777",
  "Reims": "9847", "Montpellier": "172",
};

const getLogo = (n) => TEAM_LOGOS[n] ? `https://a.espncdn.com/i/teamlogos/soccer/500/${TEAM_LOGOS[n]}.png` : null;

// Generates placeholder fixtures with dates always relative to today.
function getDefaultMatches() {
  const now = new Date();
  const DS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmt = (d: Date) => `${DS[d.getDay()]} ${d.getDate()} ${MS[d.getMonth()]}`;
  const add = (n: number) => { const d = new Date(now); d.setDate(d.getDate() + n); return d; };
  const sub = (n: number) => { const d = new Date(now); d.setDate(d.getDate() - n); return d; };
  return [
    { id:1,  status:"upcoming", date:fmt(add(1)), time:"12:30", league:"EPL",        home:"Fulham",             away:"Aston Villa"        },
    { id:2,  status:"upcoming", date:fmt(add(1)), time:"15:00", league:"EPL",        home:"Liverpool",          away:"Crystal Palace"     },
    { id:3,  status:"upcoming", date:fmt(add(1)), time:"17:30", league:"EPL",        home:"Arsenal",            away:"Newcastle"          },
    { id:4,  status:"upcoming", date:fmt(add(3)), time:"20:00", league:"EPL",        home:"Man United",         away:"Brentford"          },
    { id:5,  status:"upcoming", date:fmt(add(1)), time:"16:15", league:"LaLiga",     home:"Barcelona",          away:"Real Betis"         },
    { id:6,  status:"upcoming", date:fmt(add(2)), time:"21:00", league:"LaLiga",     home:"Real Madrid",        away:"Athletic Bilbao"    },
    { id:7,  status:"upcoming", date:fmt(add(2)), time:"18:30", league:"LaLiga",     home:"Atletico Madrid",    away:"Villarreal"         },
    { id:8,  status:"upcoming", date:fmt(add(1)), time:"18:00", league:"SerieA",     home:"Inter Milan",        away:"Roma"               },
    { id:9,  status:"upcoming", date:fmt(add(2)), time:"20:45", league:"SerieA",     home:"Juventus",           away:"Napoli"             },
    { id:10, status:"upcoming", date:fmt(add(2)), time:"15:00", league:"SerieA",     home:"AC Milan",           away:"Fiorentina"         },
    { id:11, status:"upcoming", date:fmt(add(1)), time:"15:30", league:"Bundesliga", home:"Bayern Munich",      away:"RB Leipzig"         },
    { id:12, status:"upcoming", date:fmt(add(1)), time:"18:30", league:"Bundesliga", home:"Bayer Leverkusen",   away:"Borussia Dortmund"  },
    { id:13, status:"upcoming", date:fmt(add(1)), time:"21:00", league:"Ligue1",     home:"Paris Saint-Germain",away:"Marseille"          },
    { id:14, status:"upcoming", date:fmt(add(2)), time:"17:00", league:"Ligue1",     home:"Monaco",             away:"Lyon"               },
    { id:15, status:"upcoming", date:fmt(add(5)), time:"21:00", league:"UCL",        home:"Real Madrid",        away:"Arsenal"            },
    { id:16, status:"upcoming", date:fmt(add(6)), time:"21:00", league:"UCL",        home:"Bayern Munich",      away:"Paris Saint-Germain"},
    { id:17, status:"recent",   date:fmt(sub(4)), league:"EPL",        home:"Brighton",          away:"Chelsea",       homeScore:3, awayScore:0 },
    { id:18, status:"recent",   date:fmt(sub(3)), league:"EPL",        home:"Burnley",           away:"Man City",      homeScore:0, awayScore:1 },
    { id:19, status:"recent",   date:fmt(sub(4)), league:"LaLiga",     home:"Sevilla",           away:"Girona",        homeScore:2, awayScore:1 },
    { id:20, status:"recent",   date:fmt(sub(5)), league:"SerieA",     home:"Lazio",             away:"Parma",         homeScore:2, awayScore:0 },
    { id:21, status:"recent",   date:fmt(sub(6)), league:"Bundesliga", home:"Borussia Dortmund", away:"Werder Bremen", homeScore:3, awayScore:2 },
    { id:22, status:"recent",   date:fmt(sub(5)), league:"Ligue1",     home:"Paris Saint-Germain",away:"Nantes",       homeScore:4, awayScore:1 },
  ];
}

const LEAGUES = ["EPL", "Championship", "LaLiga", "SerieA", "Bundesliga", "Ligue1", "Eredivisie", "PrimeiraLiga", "UCL", "UEL", "Brasileirao", "WorldCup"];
const LEAGUE_LABELS = {
  EPL: "EPL", Championship: "Championship", LaLiga: "La Liga", SerieA: "Serie A",
  Bundesliga: "Bundesliga", Ligue1: "Ligue 1", Eredivisie: "Eredivisie",
  PrimeiraLiga: "Primeira Liga", UCL: "UCL", UEL: "Europa League",
  CopaLib: "Copa Libertadores", Brasileirao: "Brasileirão", WorldCup: "World Cup",
};

// ============================== APP ==========================================
export default function BM8Predictor() {
  const [lang, setLang] = useState("en");
  const [activeNav, setActiveNav] = useState("fixtures");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const t = T[lang];

  const [matches, setMatches] = useState(() => getDefaultMatches());
  const [filter, setFilter] = useState("upcoming");
  const [league, setLeague] = useState("all");
  const [predFilter, setPredFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]   = useState("");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [statusMsg, setStatusMsg] = useState(t.statusInitial);
  const [statusError, setStatusError] = useState(false);
  const [predictingId, setPredictingId] = useState(null);
  const [liveScores, setLiveScores] = useState<Map<string, any>>(new Map());
  const [predHistory, setPredHistory] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("mr-edge-predictions") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const r = await fetch("/api/livescores");
        const data = await r.json();
        const map = new Map();
        for (const m of data.live || []) map.set(`${m.home}|${m.away}`, m);
        setLiveScores(map);
      } catch {}
    };
    fetchLive();
    const iv = setInterval(fetchLive, 60000);
    return () => clearInterval(iv);
  }, []);
  const [expandedResults, setExpandedResults] = useState({}); // { matchId: { match, result?, error?, loading?, fromCache? } }
  const [expandedIds, setExpandedIds] = useState(new Set());  // currently expanded match ids

  React.useEffect(() => {
    const defaults = [T.en.statusInitial, T.zh.statusInitial, T.ms.statusInitial];
    if (defaults.includes(statusMsg)) setStatusMsg(t.statusInitial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, t.statusInitial]);

  // Auto-fetch real fixtures on mount, then every 30 minutes
  React.useEffect(() => {
    fetchRealFixtures();
    const interval = setInterval(fetchRealFixtures, 30 * 60 * 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredMatches = useMemo(() => {
    const MONTHS2 = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    const todayStr = (() => { const n=new Date(); return `${n.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][n.getMonth()]}`; })();

    // Parse "Mon 27 Apr" → Date (midnight local)
    const parseMatchDate = (dateStr: string): Date | null => {
      const parts = dateStr.trim().split(/\s+/);
      if (parts.length < 3) return null;
      const day = parseInt(parts[1]);
      const mon = MONTHS2[parts[2]];
      if (isNaN(day) || mon === undefined) return null;
      return new Date(new Date().getFullYear(), mon, day);
    };

    let list = filter === "all" ? matches
      : filter === "today" ? matches.filter((m) => m.date.includes(todayStr))
      : matches.filter((m) => m.status === filter);
    if (league !== "all") list = list.filter((m) => m.league === league);
    if (predFilter === "predicted") list = list.filter((m) => (expandedResults as any)[m.id]?.result);

    // Parse "YYYY-MM-DD" as LOCAL midnight (avoids UTC timezone shift)
    const parseLocalDate = (str: string): Date | null => {
      const parts = str.split("-").map(Number);
      if (parts.length !== 3) return null;
      return new Date(parts[0], parts[1] - 1, parts[2]); // local midnight
    };

    // Date range filter
    if (dateFrom) {
      const from = parseLocalDate(dateFrom);
      if (from) list = list.filter((m) => { const d = parseMatchDate(m.date); return d ? d >= from : true; });
    }
    if (dateTo) {
      const to = parseLocalDate(dateTo);
      if (to) {
        to.setDate(to.getDate() + 1); // make inclusive (up to end of selected day)
        list = list.filter((m) => { const d = parseMatchDate(m.date); return d ? d < to : true; });
      }
    }

    if (search.trim()) {
      const needles = search.toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter((m) => {
        const hay = `${m.home} ${m.away} ${m.league} ${m.date} ${m.time || ""}`.toLowerCase();
        return needles.every((n) => hay.includes(n));
      });
    }
    return list;
  }, [matches, filter, league, search, dateFrom, dateTo]);

  const fetchRealFixtures = async () => {
    setRefreshing(true); setStatusError(false); setStatusMsg(t.statusSearching);
    setExpandedIds(new Set()); setExpandedResults({});
    try {
      const res = await fetch("/api/fixtures");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `API ${res.status}`);
      }
      const data = await res.json();
      if (!data.matches?.length) throw new Error("No matches returned");
      setMatches(data.matches);
      const lgs = [...new Set(data.matches.map((m) => m.league))];
      setStatusMsg(t.statusRefreshed(new Date().toLocaleTimeString(), data.matches.length, lgs.length));
    } catch (e: any) {
      setStatusMsg(t.statusFailed(e.message || String(e)));
      setStatusError(true);
    } finally { setRefreshing(false); }
  };

  const refresh = fetchRealFixtures;

  // ====================== CACHE HELPERS ======================
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  const CACHE_VERSION = "v3"; // bump this to invalidate all old caches
  const getCacheKey = (match, language) => {
    return `bm8_pred_${CACHE_VERSION}_${language}_${match.league}_${match.home}_${match.away}_${match.date}`;
  };

  const readCache = (match, language) => {
    try {
      const raw = localStorage.getItem(getCacheKey(match, language));
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (Date.now() - entry.ts > CACHE_TTL_MS) {
        localStorage.removeItem(getCacheKey(match, language));
        return null;
      }
      return entry.result;
    } catch (e) {
      return null;
    }
  };

  const writeCache = (match, language, result) => {
    try {
      localStorage.setItem(
        getCacheKey(match, language),
        JSON.stringify({ ts: Date.now(), result })
      );
    } catch (e) {
      // Ignore (quota exceeded, etc.)
    }
  };

  const setResult = (matchId, data) => {
    setExpandedResults((prev) => ({ ...prev, [matchId]: data }));
    setExpandedIds((prev) => new Set(prev).add(matchId));
  };

  const toggleExpanded = (matchId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(matchId)) next.delete(matchId);
      else next.add(matchId);
      return next;
    });
  };

  // ====================== STANDINGS CACHE (for prediction enrichment) ======================
  const standingsCacheRef = React.useRef<Map<string, { standings: any[]; fetchedAt: number }>>(new Map());

  const fetchStandingsForMatch = async (league: string): Promise<any[] | null> => {
    const cache = standingsCacheRef.current;
    const hit = cache.get(league);
    if (hit && Date.now() - hit.fetchedAt < 30 * 60 * 1000) return hit.standings;
    try {
      const r = await fetch(`/api/standings?league=${encodeURIComponent(league)}`);
      if (!r.ok) return null;
      const data = await r.json();
      if (!data.standings?.length) return null;
      cache.set(league, { standings: data.standings, fetchedAt: Date.now() });
      return data.standings;
    } catch { return null; }
  };

  const buildTeamStatsLine = (row: any, name: string, isHome: boolean) => {
    if (!row) return `${name}: No standings data available`;
    const formStr = row.form ? row.form.split(",").slice(-5).join("-") : "N/A";
    // Attack/defense strength (pseudo-xG) — overall season average
    const atkPPG = row.played > 0 ? (row.gf / row.played).toFixed(2) : "N/A";
    const defPPG = row.played > 0 ? (row.ga / row.played).toFixed(2) : "N/A";
    let splitStr = "";
    let venueFormStr = "";
    if (isHome && row.homePlayed != null && row.homePlayed > 0) {
      const homeAtk = (row.homeGf / row.homePlayed).toFixed(2);
      const homeDef = (row.homeGa / row.homePlayed).toFixed(2);
      splitStr = ` | AT HOME: ${row.homeWon}W-${row.homeDraw}D-${row.homeLost}L — scores ${homeAtk} goals/game, concedes ${homeDef}/game`;
      if (row.homeForm) venueFormStr = ` | Home form (oldest→newest): ${row.homeForm.split(",").join("-")}`;
    } else if (!isHome && row.awayPlayed != null && row.awayPlayed > 0) {
      const awayAtk = (row.awayGf / row.awayPlayed).toFixed(2);
      const awayDef = (row.awayGa / row.awayPlayed).toFixed(2);
      splitStr = ` | AWAY: ${row.awayWon}W-${row.awayDraw}D-${row.awayLost}L — scores ${awayAtk} goals/game, concedes ${awayDef}/game`;
      if (row.awayForm) venueFormStr = ` | Away form (oldest→newest): ${row.awayForm.split(",").join("-")}`;
    }
    return `${name}: #${row.position} | ${row.points}pts | ${row.played}P ${row.won}W-${row.draw}D-${row.lost}L | Season avg: ${atkPPG} scored/g, ${defPPG} conceded/g | Last 5: ${formStr}${splitStr}${venueFormStr}`;
  };

  const calcDaysRest = (teamName: string, matchRawDate: string, allMatches: any[]): number | null => {
    const norm = (n: string) => n.toLowerCase().trim();
    const teamNorm = norm(teamName);
    const matchDate = new Date(matchRawDate);
    const prev = allMatches
      .filter(m => m.status === "recent" &&
        (norm(m.home) === teamNorm || norm(m.away) === teamNorm) &&
        m.rawDate && new Date(m.rawDate) < matchDate)
      .sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
    if (!prev.length) return null;
    const days = Math.floor((matchDate.getTime() - new Date(prev[0].rawDate).getTime()) / 86400000);
    return days;
  };

  const savePredHistory = (match: any, result: any) => {
    const prob = result.winProbability || {};
    const predictedWinner = prob.home > prob.away && prob.home > prob.draw ? "home"
      : prob.away > prob.draw ? "away" : "draw";
    const record = {
      id: `${match.home}-${match.away}-${match.rawDate || match.date}`,
      home: match.home, away: match.away, league: match.league,
      date: match.date, rawDate: match.rawDate,
      predictedScore: result.predictedScore,
      predictedWinner, winProbability: prob,
      savedAt: new Date().toISOString(),
    };
    const newHistory = [...predHistory.filter((p: any) => p.id !== record.id), record].slice(-200);
    setPredHistory(newHistory);
    localStorage.setItem("mr-edge-predictions", JSON.stringify(newHistory));
  };
  const getAccuracyStats = () => {
    const completed = matches.filter((m: any) => m.status === "recent");
    let correct = 0, scoreCorrect = 0, total = 0;
    for (const pred of predHistory) {
      const actual = completed.find((m: any) =>
        m.home.toLowerCase() === pred.home.toLowerCase() &&
        m.away.toLowerCase() === pred.away.toLowerCase()
      );
      if (!actual || actual.homeScore === undefined) continue;
      total++;
      const actualWinner = actual.homeScore > actual.awayScore ? "home"
        : actual.awayScore > actual.homeScore ? "away" : "draw";
      if (actualWinner === pred.predictedWinner) correct++;
      if (pred.predictedScore && actual.homeScore === pred.predictedScore.home && actual.awayScore === pred.predictedScore.away) scoreCorrect++;
    }
    return { correct, scoreCorrect, total, pct: total > 0 ? Math.round((correct / total) * 100) : null };
  };

  // ====================== TOP SCORERS CACHE ======================
  const scorersCacheRef = React.useRef<Map<string, { scorers: any[]; fetchedAt: number }>>(new Map());

  const fetchTopScorers = async (league: string): Promise<any[] | null> => {
    // World Cup / UCL/UEL have scorers but endpoint works; skip if no LEAGUE_CODE_MAP entry
    const unsupported = ["WorldCup"];
    if (unsupported.includes(league)) return null;
    const cache = scorersCacheRef.current;
    const hit = cache.get(league);
    if (hit && Date.now() - hit.fetchedAt < 60 * 60 * 1000) return hit.scorers; // 1h TTL
    try {
      const r = await fetch(`/api/topscorers?league=${encodeURIComponent(league)}`);
      if (!r.ok) return null;
      const data = await r.json();
      if (!data.scorers?.length) return null;
      cache.set(league, { scorers: data.scorers, fetchedAt: Date.now() });
      return data.scorers;
    } catch { return null; }
  };

  // ====================== TEAM STATS CACHE (Sofascore) ======================
  const statsCacheRef = React.useRef<Map<string, { stats: any; fetchedAt: number }>>(new Map());

  const fetchTeamStats = async (home: string, away: string): Promise<{ home: any; away: any }> => {
    const key = `${home}__${away}`;
    const cache = statsCacheRef.current;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.fetchedAt < 60 * 60 * 1000) return hit.stats;
    try {
      const r = await fetch(`/api/teamstats?home=${encodeURIComponent(home)}&away=${encodeURIComponent(away)}`);
      if (!r.ok) return { home: null, away: null };
      const data = await r.json();
      const stats = { home: data.home || null, away: data.away || null };
      cache.set(key, { stats, fetchedAt: Date.now() });
      return stats;
    } catch { return { home: null, away: null }; }
  };


  const fetchApiFootball = async (match: any) => {
    try {
      const r = await fetch(`/api/apifootball?home=${encodeURIComponent(match.home)}&away=${encodeURIComponent(match.away)}&date=${encodeURIComponent(match.rawDate || match.date || '')}&league=${encodeURIComponent(match.league)}`);
      if (!r.ok) return { injuries: null, prediction: null };
      return r.json();
    } catch { return { injuries: null, prediction: null }; }
  };

  const fetchLineups = async (match: any) => {
    if (!match.matchId) return { lineup: null };
    try {
      const r = await fetch(`/api/lineups?matchId=${match.matchId}`);
      if (!r.ok) return { lineup: null };
      return r.json();
    } catch { return { lineup: null }; }
  };

  const fetchWeather = async (match: any) => {
    try {
      const r = await fetch(`/api/weather?home=${encodeURIComponent(match.home)}&date=${encodeURIComponent(match.rawDate || match.date || '')}`);
      if (!r.ok) return { weather: null };
      return r.json();
    } catch { return { weather: null }; }
  };

  // ====================== ODDS CACHE ======================
  const oddsCacheRef = React.useRef<Map<string, { odds: any[]; fetchedAt: number }>>(new Map());

  const fetchOddsForLeague = async (league: string): Promise<any[]> => {
    const unsupported = ["WorldCup"];
    if (unsupported.includes(league)) return [];
    const cache = oddsCacheRef.current;
    const hit = cache.get(league);
    if (hit && Date.now() - hit.fetchedAt < 60 * 60 * 1000) return hit.odds;
    try {
      const r = await fetch(`/api/odds?league=${encodeURIComponent(league)}`);
      if (!r.ok) return [];
      const data = await r.json();
      const odds = data.odds || [];
      cache.set(league, { odds, fetchedAt: Date.now() });
      return odds;
    } catch { return []; }
  };

  const predictMatch = async (match) => {
    // 1. Check cache first
    const cached = readCache(match, lang);
    const isRecent = match.status === "recent";
    if (cached) {
      setResult(match.id, { match, result: cached, isRecent, loading: false, fromCache: true });
      return;
    }

    // 2. Prevent concurrent predictions
    if (predictingId !== null) {
      setResult(match.id, { match, error: t.concurrentError, loading: false });
      return;
    }

    setPredictingId(match.id);
    setResult(match.id, { match, loading: true });
    try {
      const langName = lang === "zh" ? "CHINESE (Simplified)" : lang === "ms" ? "BAHASA MELAYU" : "ENGLISH";

      // 3. Fetch real standings + top scorers + odds + team stats in parallel (upcoming matches only)
      let standingsBlock = "";
      let scorersBlock = "";
      let oddsBlock = "";
      let teamStatsBlock = "";
      let injuriesBlock = "";
      let lineupBlock = "";
      let weatherBlock = "";
      let capturedTeamStats: { home: any; away: any } = { home: null, away: null };
      let capturedOddsFound: any = null;
      let homeFormArr: string[] = [];
      let awayFormArr: string[] = [];
      if (!isRecent) {
        const [standings, allScorers, leagueOdds, teamStats, apiFootball, lineupsData, weatherData] = await Promise.all([
          fetchStandingsForMatch(match.league),
          fetchTopScorers(match.league),
          fetchOddsForLeague(match.league),
          fetchTeamStats(match.home, match.away),
          fetchApiFootball(match),
          fetchLineups(match),
          fetchWeather(match),
        ]);

        if (standings?.length) {
          const normalizeTeam = (n: string) => n.toLowerCase().trim();
          const homeRow = standings.find((s: any) => normalizeTeam(s.team) === normalizeTeam(match.home));
          const awayRow = standings.find((s: any) => normalizeTeam(s.team) === normalizeTeam(match.away));
          if (homeRow || awayRow) {
            standingsBlock = `
REAL-TIME STANDINGS DATA (use this — it is more accurate than your training data):
${buildTeamStatsLine(homeRow, match.home, true)}
${buildTeamStatsLine(awayRow, match.away, false)}
`;
          }
          // Extract real form for homeForm/awayForm arrays
          if (homeRow?.form) homeFormArr = homeRow.form.split(",").slice(-5).map((x: string) => x.trim()).filter(Boolean);
          if (awayRow?.form) awayFormArr = awayRow.form.split(",").slice(-5).map((x: string) => x.trim()).filter(Boolean);
        }

        // Build top scorers block filtered to home and away teams
        if (allScorers?.length) {
          const normHome = match.home.toLowerCase().trim();
          const normAway = match.away.toLowerCase().trim();
          const homeScorers = allScorers.filter((s: any) => s.team.toLowerCase().trim() === normHome).slice(0, 3);
          const awayScorers = allScorers.filter((s: any) => s.team.toLowerCase().trim() === normAway).slice(0, 3);
          const fmt = (s: any) => `${s.name} (${s.goals}G/${s.assists}A in ${s.played} games)`;
          const lines: string[] = [];
          if (homeScorers.length) lines.push(`${match.home} top scorers: ${homeScorers.map(fmt).join(", ")}`);
          if (awayScorers.length) lines.push(`${match.away} top scorers: ${awayScorers.map(fmt).join(", ")}`);
          if (lines.length) {
            scorersBlock = `
TOP SCORERS THIS SEASON (real data — factor these players into your playerWatch and reasoning):
${lines.join("\n")}
`;
          }
        }

        // Build bookmaker odds block
        if (leagueOdds.length) {
          const normStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
          const mHome = normStr(match.home);
          const mAway = normStr(match.away);
          const found = leagueOdds.find((o: any) => {
            const oHome = normStr(o.home);
            const oAway = normStr(o.away);
            return (oHome.includes(mHome) || mHome.includes(oHome)) &&
                   (oAway.includes(mAway) || mAway.includes(oAway));
          });
          if (found?.homeOdds) {
            capturedOddsFound = found;
            const toImpl = (x: number) => Math.round(100 / x);
            const fmtMove = (open: number | null, curr: number, pct: number | null, signal: string) => {
              if (!open || pct === null || Math.abs(pct) < 1) return `${curr}`;
              return `${open}→${curr} (${pct > 0 ? "+" : ""}${pct}% ${pct < 0 ? "▼" : "▲"} ${signal})`;
            };
            const hasMovement = found.openingHome && found.openingHome !== found.homeOdds;
            oddsBlock = `
REAL BOOKMAKER ODDS (averaged across major EU bookmakers — market consensus is highly predictive):
1X2 Decimal: Home ${found.homeOdds} | Draw ${found.drawOdds} | Away ${found.awayOdds}
Implied win probability: Home ${toImpl(found.homeOdds)}% | Draw ${toImpl(found.drawOdds)}% | Away ${toImpl(found.awayOdds)}%
${hasMovement ? `ODDS MOVEMENT (sharp money signal):
  Home: ${fmtMove(found.openingHome, found.homeOdds, found.homeMove, found.homeSignal || "")}
  Draw: ${fmtMove(found.openingDraw, found.drawOdds, found.drawMove, found.drawSignal || "")}
  Away: ${fmtMove(found.openingAway, found.awayOdds, found.awayMove, found.awaySignal || "")}
  Shortened odds = sharp money backing that outcome. Drifting odds = market fading that side.` : ""}
Use these exact values in the matchOdds JSON field.
`;
          }
        }

        // Build advanced team statistics block (Sofascore xG-level data)
        const fmtStats = (s: any, name: string) => {
          if (!s) return `${name}: stats unavailable`;
          const parts = [`${s.games} games`];
          if (s.possession != null) parts.push(`possession ${s.possession}%`);
          if (s.onTargetPG != null) parts.push(`shots-on-target/game ${s.onTargetPG}`);
          if (s.bigChancesPG != null) parts.push(`big chances created/game ${s.bigChancesPG}`);
          if (s.goalsPG != null) parts.push(`goals/game ${s.goalsPG}`);
          if (s.concededPG != null) parts.push(`conceded/game ${s.concededPG}`);
          if (s.cleanSheets != null) parts.push(`clean sheets ${s.cleanSheets}`);
          if (s.avgRating != null) parts.push(`avg Sofascore rating ${s.avgRating}`);
          return `${name}: ${parts.join(" | ")}`;
        };
        capturedTeamStats = teamStats;
        if (teamStats.home || teamStats.away) {
          teamStatsBlock = `
ADVANCED TEAM STATISTICS THIS SEASON (Sofascore real data — use for xG-style analysis):
${fmtStats(teamStats.home, match.home + " (Home)")}
${fmtStats(teamStats.away, match.away + " (Away)")}
`;
        }


        // Build injuries block from API-Football (via RapidAPI)
        if (apiFootball?.injuries || apiFootball?.prediction) {
          const inj = apiFootball.injuries;
          const pred = apiFootball.prediction;
          const lines: string[] = [];
          if (inj?.home?.length) lines.push(`${match.home} missing: ${inj.home.slice(0,5).join(", ")}`);
          else if (inj) lines.push(`${match.home}: no injury concerns reported`);
          if (inj?.away?.length) lines.push(`${match.away} missing: ${inj.away.slice(0,5).join(", ")}`);
          else if (inj) lines.push(`${match.away}: no injury concerns reported`);
          if (pred) {
            if (pred.advice) lines.push(`API-Football prediction: ${pred.advice}`);
            if (pred.percent) lines.push(`Market-implied: Home ${pred.percent.home} | Draw ${pred.percent.draw} | Away ${pred.percent.away}`);
            if (pred.homeForm) lines.push(`${match.home} last-5 form: ${pred.homeForm} (att: ${pred.homeAtt || '?'}, def: ${pred.homeDef || '?'})`);
            if (pred.awayForm) lines.push(`${match.away} last-5 form: ${pred.awayForm} (att: ${pred.awayAtt || '?'}, def: ${pred.awayDef || '?'})`);
            if (pred.homeGoalsFor) lines.push(`${match.home} avg goals: ${pred.homeGoalsFor} scored / ${pred.homeGoalsAgainst} conceded per game`);
            if (pred.awayGoalsFor) lines.push(`${match.away} avg goals: ${pred.awayGoalsFor} scored / ${pred.awayGoalsAgainst} conceded per game`);
          }
          if (lines.length) {
            injuriesBlock = `\nINJURIES & TEAM FORM (API-Football real data):\n${lines.join("\n")}\n`;
          }
        }

        // Build lineup block
        const lu = lineupsData?.lineup;
        if (lu) {
          const fmtPlayers = (players: any[]) => players.map(p => `${p.name} (${p.position})`).join(", ");
          const lines: string[] = [];
          if (lu.home?.formation) lines.push(`${match.home} formation: ${lu.home.formation}`);
          if (lu.home?.starting?.length) lines.push(`${match.home} XI: ${fmtPlayers(lu.home.starting)}`);
          if (lu.home?.bench?.length) lines.push(`${match.home} bench: ${fmtPlayers(lu.home.bench)}`);
          if (lu.away?.formation) lines.push(`${match.away} formation: ${lu.away.formation}`);
          if (lu.away?.starting?.length) lines.push(`${match.away} XI: ${fmtPlayers(lu.away.starting)}`);
          if (lu.away?.bench?.length) lines.push(`${match.away} bench: ${fmtPlayers(lu.away.bench)}`);
          if (lines.length) lineupBlock = `\nCONFIRMED LINEUPS (use these — key absences or unexpected selections heavily impact outcome):\n${lines.join("\n")}\n`;
        }

        // Build weather block
        const w = weatherData?.weather;
        if (w) {
          const rainNote = w.rain > 0 ? `, rain ${w.rain}mm` : '';
          const windNote = w.windSpeed > 30 ? ` (strong wind — affects long balls, crosses, set pieces)` : '';
          weatherBlock = `\nMATCH VENUE WEATHER (${w.city}): ${w.temp}°C, ${w.condition}, wind ${w.windSpeed}km/h${windNote}${rainNote}, humidity ${w.humidity}%\n`;
        }
      }

      const homeFormHint = homeFormArr.length
        ? `Use this real form for homeForm (oldest→newest, pad with "?" if <5): [${homeFormArr.map(x => `"${x}"`).join(", ")}]`
        : `Estimate homeForm from your knowledge.`;
      const awayFormHint = awayFormArr.length
        ? `Use this real form for awayForm (oldest→newest, pad with "?" if <5): [${awayFormArr.map(x => `"${x}"`).join(", ")}]`
        : `Estimate awayForm from your knowledge.`;

      // Days rest — squad freshness
      let daysRestBlock = "";
      if (match.rawDate) {
        const homeDays = calcDaysRest(match.home, match.rawDate, matches);
        const awayDays = calcDaysRest(match.away, match.rawDate, matches);
        const fmtRest = (team: string, days: number | null) => {
          if (days === null) return null;
          const fatigue = days <= 3 ? " ⚠️ FATIGUE RISK — likely tired legs" : days <= 5 ? " (normal turnaround)" : " (well rested)";
          return `  ${team}: ${days} days since last match${fatigue}`;
        };
        const lines = [fmtRest(match.home, homeDays), fmtRest(match.away, awayDays)].filter(Boolean);
        if (lines.length) daysRestBlock = `\nSQUAD FRESHNESS (factor this into prediction):\n${lines.join("\n")}\n`;
      }

      // 4. Fetch H2H history (upcoming matches only, requires matchId)
      let h2hBlock = "";
      if (!isRecent && match.matchId) {
        try {
          const h2hRes = await fetch(`/api/h2h?matchId=${match.matchId}`);
          if (h2hRes.ok) {
            const h2hData = await h2hRes.json();
            const h2h = h2hData.h2h;
            if (h2h && h2h.matches?.length) {
              const recent = h2h.matches
                .map((m: any) => `  ${m.home} ${m.homeScore}-${m.awayScore} ${m.away} (${m.date})`)
                .join("\n");
              h2hBlock = `
HEAD-TO-HEAD HISTORY (last ${h2h.matches.length} meetings — use this real data):
${recent}
Overall record: ${match.home} ${h2h.homeWins}W · ${h2h.draws}D · ${h2h.awayWins}W ${match.away} (from ${h2h.total} meetings)
`;
            }
          }
        } catch { /* H2H is optional, never block prediction */ }
      }

      const prompt = isRecent
        ? `You are an expert football analyst. The match was played.
MATCH: ${match.home} ${match.homeScore}-${match.awayScore} ${match.away}
COMPETITION: ${match.league} · DATE: ${match.date}
Explain the result using your knowledge of these clubs.
Respond ONLY with valid JSON:
{"verdict":"<one sentence>","keyMoments":[{"label":"<short>","detail":"<one sentence>"}],"starPlayer":{"name":"<standout>","team":"${match.home} | ${match.away}","why":"<one sentence>"},"reasoning":"<2-3 sentences>","context":"<what this means>"}
3-4 keyMoments. RESPOND IN ${langName}.`
        : `You are an expert football analyst with deep knowledge of betting markets, xG (expected goals), and team form. Predict this match using the real data provided AND your football knowledge.
MATCH: ${match.home} (HOME) vs ${match.away} (AWAY)
COMPETITION: ${match.league} · DATE: ${match.date} ${match.time || ""}
${standingsBlock}${scorersBlock}${h2hBlock}${oddsBlock}${teamStatsBlock}${injuriesBlock}${lineupBlock}${weatherBlock}${daysRestBlock}
Consider: home advantage, league position gap, recent form, head-to-head patterns, bookmaker odds, possession/shooting stats, big chances created, injuries/suspensions to key players, and weather conditions if relevant.

Respond ONLY with valid JSON in this EXACT structure:
{
  "predictedScore": {"home": <int>, "away": <int>},
  "winProbability": {"home": <num>, "draw": <num>, "away": <num>},
  "confidencePercent": <num 0-100>,
  "riskLevel": "Low|Medium|High",
  "matchOdds": {"home": "<decimal odds e.g. 2.45>", "draw": "<e.g. 3.20>", "away": "<e.g. 2.85>"},
  "estGoals": "<total expected goals e.g. 2.5>",
  "bttsChance": <int 0-100>,
  "matchType": "<one phrase: e.g. High-scoring | Tactical | Open | Defensive | Cagey | End-to-end>",
  "overUnder25": {"over": "<odds e.g. 2.10>", "under": "<odds e.g. 1.75>"},
  "htPrediction": {"home": <int>, "away": <int>},
  "scorelineProbabilities": [{"score": "1-0", "prob": <int>}, {"score": "0-0", "prob": <int>}, {"score": "2-1", "prob": <int>}],
  "homeForm": ["W|L|D", "W|L|D", "W|L|D", "W|L|D", "W|L|D"],
  "awayForm": ["W|L|D", "W|L|D", "W|L|D", "W|L|D", "W|L|D"],
  "keyFactors": [{"label": "<short>", "favors": "home|away|neutral", "detail": "<one sentence>"}],
  "reasoning": "<3-4 sentences explaining the prediction using the standings data and market/xG terms>",
  "watchOut": "<one risk to be aware of>",
  "playerWatch": [{"name": "<player name>", "team": "home|away", "role": "<position/role e.g. Striker>", "impact": "<one sentence on why they are key to this match>"}],
  "injuries": [{"name": "<player name>", "team": "home|away", "status": "Doubtful|Out|Suspended", "impact": "<one sentence on how their absence affects the team>"}]
}

Rules:
- predictedScore MUST be realistic and conservative:
  * Most football matches (70%+) end with 2 or fewer total goals — DO NOT over-predict goals
  * Even heavy favourites at home rarely win by more than 2 goals: prefer 1-0 or 2-0 over 3-0
  * If the away team has a solid defensive record (conceding < 1.2 goals/game) or is defensive by style, cap away goals conceded at 1
  * Use estGoals (xG-based) as your anchor: if xG suggests ~1.5 total goals, predict 1-0 or 1-1, NOT 3-0
  * Never predict a scoreline where total goals > 4 unless xG data or H2H history strongly supports it
  * Typical EPL scorelines by match type — Defensive/Cagey: 1-0, 0-0; Balanced: 1-0, 1-1, 2-1; Open/End-to-end: 2-1, 2-2; High-scoring: 3-1, 3-2
- winProbability values must sum to 100
- confidencePercent calibration (cross-reference ALL available data before deciding):
  * 80-90%: Strong favourite — clear standings gap (5+ positions), positive H2H record (4+ wins in last 6), good recent form (3W+ in last 5). Example: top-4 team vs bottom-3 team at home.
  * 68-79%: Moderate favourite — meaningful standings gap OR H2H edge OR good form (not all three). Example: mid-table team with 3W H2H record vs struggling away side.
  * 55-67%: Slight edge — small standings gap, mixed H2H, inconsistent form. Example: two teams within 3 positions of each other.
  * 42-54%: Even match — similar positions, balanced H2H, similar form. Genuine toss-up.
  * 30-41%: Underdog scenario — lower-ranked team with strong home form or specific H2H advantage over superior opponent.
  * DO NOT default to 50-55% for all matches. Use the real data to differentiate clearly.
- riskLevel: Low if confident in prediction, Medium for unclear matches, High for upsets/unknowns
- ${homeFormHint}
- ${awayFormHint}
- 3-5 keyFactors — reference real standings data in at least one factor, H2H history in at least one factor if available, top scorers in at least one factor if data provided
- playerWatch: 2-4 players who will be decisive in this match — prioritise the top scorers listed above (one or two from each side)
- injuries: list known or likely injuries/suspensions based on your knowledge; empty array [] if none known
- bttsChance: integer 0-100 representing % probability both teams score
- htPrediction: conservative half-time score prediction (usually 0-0, 1-0, or 0-1); total HT goals should typically be ≤ predictedScore total
- scorelineProbabilities: top 3 most likely exact scores with % probability; all probs should sum ≤ 100; anchor to predictedScore and estGoals
- RESPOND IN ${langName} for all sentence fields. Keep "W"/"L"/"D" as English letters, riskLevel/status fields in English.`;
      // Try Claude (Opus 4.7) first, fall back to Gemini
      const callAI = async (endpoint: string, body: object, timeoutMs = 55000) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const r = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          if (!r.ok) throw new Error(`API ${r.status}`);
          return r.json();
        } finally {
          clearTimeout(timer);
        }
      };

      let data: any;
      let usedEndpoint = "Claude";
      try {
        data = await callAI("/api/claude", { prompt });
      } catch {
        data = await callAI("/api/gemini", { prompt, json: true });
        usedEndpoint = "Gemini";
      }
      const text = (data.text || "").replace(/```json|```/g, "").trim();
      const usedModel = data.model || usedEndpoint;
      const result = parseFlexibleJSON(text);
      writeCache(match, lang, result);
      if (!isRecent) savePredHistory(match, result);
      setResult(match.id, { match, result, isRecent, loading: false, fromCache: false, usedModel, lang, teamStats: capturedTeamStats, oddsFound: capturedOddsFound });
    } catch (e: any) {
      let errMsg = e.message || String(e);
      if (errMsg.includes("429")) errMsg = "Too many requests — please wait 60 seconds and try again.";
      else if (errMsg.includes("503")) errMsg = "AI service is temporarily busy. Please try again in a moment.";
      else if (errMsg.includes("400")) errMsg = "Request failed.";
      else if (errMsg.includes("403")) errMsg = "API key issue (contact admin).";
      setResult(match.id, { match, error: errMsg, loading: false });
    } finally { setPredictingId(null); }
  };

  return (
    <div style={styles.app}>
      <style>{globalCSS}</style>

      {/* TOP NAV */}
      <header style={styles.topNav}>
        <div className="bm8-nav-inner" style={styles.navInner}>
          {/* Logo */}
          <div style={styles.brandBlock}>
            <img src="/mr-edge-logo.png" alt="MR.EDGE" style={{ height: 58, width: "auto", display: "block", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {lang === "zh"
                ? <span style={styles.tagline}><span style={{ color: "#F0B429" }}>锋</span>先生</span>
                : <span style={styles.tagline}>MR<span style={{ color: "#fff" }}>.</span><span style={{ color: "#F0B429" }}>EDGE</span></span>
              }
              <span style={styles.navSubtitle}>AI PREDICTIVE INTELLIGENCE</span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="desktop-nav" style={styles.navLinks}>
            {([
              { key: "fixtures",  icon: <Calendar size={14} />,     label: t.nav.fixtures },
              { key: "results",   icon: <CheckCircle size={14} />,  label: t.nav.results },
              { key: "insights",  icon: <BarChart2 size={14} />,    label: t.nav.insights },
              { key: "standings", icon: <List size={14} />,         label: t.nav.standings },
              { key: "parlay",    icon: <Layers size={14} />,       label: t.nav.parlay },
            ] as { key: string; icon: React.ReactNode; label: string }[]).map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => { setActiveNav(key); setExpandedIds(new Set()); setSearch(""); }}
                style={{ ...styles.navLink, ...(activeNav === key ? styles.navLinkActive : {}), display: "flex", alignItems: "center", gap: 6 }}
              >
                {icon}{label}
              </button>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={styles.menuBtn}
          >
            <Menu size={22} />
          </button>

          {/* Language selector — hidden on mobile */}
          <div className="lang-selector-desktop" style={{ position: "relative", flexShrink: 0 }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setLangDropdownOpen(false); }}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              style={styles.langDropdownBtn}
            >
              <Globe size={13} color="#aaa" />
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 12, letterSpacing: "0.05em" }}>{lang.toUpperCase()}</span>
              <span style={{ color: "#666", fontSize: 10 }}>▾</span>
            </button>
            {langDropdownOpen && (
              <div style={styles.langDropdownMenu}>
                {[{ c: "en", l: "English", code: "EN" }, { c: "zh", l: "中文", code: "CN" }, { c: "ms", l: "Melayu", code: "MS" }].map((x) => (
                  <button
                    key={x.c}
                    onClick={() => { setLang(x.c); setExpandedResults({}); setLangDropdownOpen(false); }}
                    style={{ ...styles.langDropdownItem, ...(lang === x.c ? styles.langDropdownItemActive : {}) }}
                  >
                    {x.l} <span style={{ color: "#666", fontSize: 10 }}>({x.code})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-menu" style={styles.mobileMenu}>
            {([
              { key: "fixtures",  icon: <Calendar size={20} />,     label: t.nav.fixtures },
              { key: "results",   icon: <CheckCircle size={20} />,  label: t.nav.results },
              { key: "insights",  icon: <BarChart2 size={20} />,    label: t.nav.insights },
              { key: "standings", icon: <List size={20} />,         label: t.nav.standings },
              { key: "parlay",    icon: <Layers size={20} />,       label: t.nav.parlay },
            ] as { key: string; icon: React.ReactNode; label: string }[]).map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => { setActiveNav(key); setMobileMenuOpen(false); setExpandedIds(new Set()); setSearch(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 18px", borderRadius: 10, border: "none",
                  cursor: "pointer", fontFamily: "inherit", fontSize: 15, width: "100%", textAlign: "left",
                  fontWeight: activeNav === key ? 700 : 400,
                  background: activeNav === key ? "linear-gradient(135deg, #C9A84C, #F0B429)" : "transparent",
                  color: activeNav === key ? "#000" : "#ccc",
                }}
              >
                {icon}{label}
              </button>
            ))}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 8, paddingTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
              <Globe size={14} color="#8a8a8a" />
              {[{ c: "en", l: "EN" }, { c: "zh", l: "中" }, { c: "ms", l: "MS" }].map((x) => (
                <button
                  key={x.c}
                  onClick={() => { setLang(x.c); setExpandedResults({}); setMobileMenuOpen(false); }}
                  style={{ ...styles.langBtn, ...(lang === x.c ? styles.langBtnActive : {}) }}
                >
                  {x.l}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="bm8-hero" style={styles.hero}>
        {/* Background image — scaled 20% for zoom effect */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
          <div className="bm8-hero-bg" style={{ position: "absolute", inset: 0, backgroundImage: "url('/hero.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", transform: "scale(1.0)", transformOrigin: "center" }} />
        </div>
        {/* dark overlay so text stays readable over any photo */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,15,0.62)", zIndex: 1 }} />
        <div style={{ ...styles.heroContent, position: "relative", zIndex: 2 }}>
          <div className="bm8-hero-label" style={styles.heroLabel}>
            <span style={styles.heroDot} />
            {activeNav === "results" ? t.resultsHeroLabel :
             activeNav === "insights" ? t.insightsHeroLabel :
             activeNav === "standings" ? (lang === "zh" ? "积分榜 · 联赛排名" : lang === "ms" ? "KEDUDUKAN · JADUAL LIGA" : "STANDINGS · LEAGUE TABLE") :
             activeNav === "parlay" ? (t as any).parlayHeroLabel :
             t.heroLabel}
          </div>
          <h1 className="bm8-hero-title" style={styles.heroTitle}>
            {activeNav === "results" ? (
              <>{t.resultsHeroTitle}</>
            ) : activeNav === "insights" ? (
              <>{t.insightsHeroTitle}</>
            ) : activeNav === "standings" ? (
              <>{lang === "zh" ? "联赛积分榜" : lang === "ms" ? "JADUAL LIGA" : "LEAGUE STANDINGS"}</>
            ) : activeNav === "parlay" ? (
              <>{(t as any).parlayHeroTitle}</>
            ) : (
              <>
                {t.heroTitle1}<br />
                <span style={styles.heroEm}>{t.heroTitleEm}</span> {t.heroTitle2}
              </>
            )}
          </h1>
          <p className="bm8-hero-sub" style={styles.heroSub}>
            {activeNav === "results" ? t.resultsHeroSub :
             activeNav === "insights" ? t.insightsHeroSub :
             activeNav === "standings" ? (lang === "zh" ? "查看各大联赛的最新积分榜排名、胜负数据和近期状态。" : lang === "ms" ? "Semak jadual terkini semua liga utama — kedudukan, mata, dan prestasi terkini pasukan." : "Check the latest standings for all major leagues — positions, points, and recent team form.") :
             activeNav === "parlay" ? (t as any).parlayHeroSub :
             t.heroSub}
          </p>
        </div>
      </section>

      {/* LEAGUE TAB BAR */}
      {(activeNav === "fixtures" || activeNav === "results") && (
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#0A0A0F", position: "sticky", top: 56, zIndex: 40 }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", display: "flex", gap: 0, overflowX: "auto" }}>
            {[
              { key: "all", label: "All" },
              { key: "EPL", label: "EPL" },
              { key: "LaLiga", label: "La Liga" },
              { key: "SerieA", label: "Serie A" },
              { key: "Bundesliga", label: "Bundesliga" },
              { key: "Ligue1", label: "Ligue 1" },
              { key: "UCL", label: "UCL" },
              { key: "UEL", label: "Europa League" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setLeague(tab.key); setExpandedIds(new Set()); }}
                style={{
                  fontSize: 12, color: league === tab.key ? "#F0B429" : "#555",
                  padding: "12px 16px", cursor: "pointer",
                  borderTop: "none", borderLeft: "none", borderRight: "none",
                  borderBottom: `2px solid ${league === tab.key ? "#F0B429" : "transparent"}`,
                  background: "transparent", transition: "all 0.15s",
                  whiteSpace: "nowrap" as const, fontFamily: "inherit",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="bm8-main" style={styles.main}>
        {/* ========== FIXTURES TAB ========== */}
        {activeNav === "fixtures" && (
          <>
            {/* Search + Refresh */}
            <div className="bm8-search-row" style={styles.searchRow}>
              <div style={styles.searchWrap}>
                <Search size={16} style={styles.searchIcon} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  style={styles.searchInput}
                />
                {search && (
                  <button onClick={() => setSearch("")} style={styles.searchClear}>
                    <X size={14} />
                  </button>
                )}
              </div>
              <button onClick={refresh} disabled={refreshing} className="refresh-btn bm8-refresh-btn" style={styles.refreshBtn}>
                {refreshing
                  ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  : <RefreshCw size={16} />}
                <span>{refreshing ? t.refreshing : t.refresh}</span>
              </button>
            </div>

            {/* Filter tabs */}
            <div className="bm8-filter-tabs" style={styles.filterTabs}>
              {[
                { key: "upcoming", label: t.upcoming },
                { key: "today", label: (t as any).today },
                { key: "recent", label: t.recent },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setFilter(tab.key); setExpandedIds(new Set()); }}
                  className="bm8-filter-tab"
                  style={{ ...styles.filterTab, ...(filter === tab.key ? styles.filterTabActive : {}) }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filter dropdowns */}
            <div className="bm8-filter-row" style={styles.filterRow}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>League</label>
                <select value={league} onChange={(e) => { setLeague(e.target.value); setExpandedIds(new Set()); }} style={styles.filterSelect}>
                  <option value="all">{t.allLeagues}</option>
                  {LEAGUES.map(lg => <option key={lg} value={lg}>{LEAGUE_LABELS[lg]}</option>)}
                </select>
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>{lang === "zh" ? "开始日期" : lang === "ms" ? "Dari Tarikh" : "From Date"}</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  onClick={(e) => { try { (e.target as any).showPicker(); } catch {} }}
                  style={{ ...styles.filterSelect, colorScheme: "dark", cursor: "pointer" }}
                />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>{lang === "zh" ? "结束日期" : lang === "ms" ? "Hingga Tarikh" : "To Date"}</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  onClick={(e) => { try { (e.target as any).showPicker(); } catch {} }}
                  style={{ ...styles.filterSelect, colorScheme: "dark", cursor: "pointer" }}
                />
              </div>
            </div>

            <div className="bm8-status-bar" style={{ ...styles.statusBar, color: statusError ? "#ff6b6b" : "#8a8a8a", ...(refreshing ? { animation: "pulse 1.4s ease-in-out infinite" } : {}) }}>
              {statusMsg}
            </div>

            <div style={styles.matchList}>
              {filteredMatches.length === 0 ? (
                <div style={styles.empty}>{search ? t.noSearchResults(search) : t.noMatches}</div>
              ) : (
                (() => {
                  const grouped: Record<string, typeof filteredMatches> = {};
                  filteredMatches.forEach((m) => {
                    const key = m.date || "Unknown";
                    if (!grouped[key]) grouped[key] = [];
                    grouped[key].push(m);
                  });
                  return Object.entries(grouped).map(([date, dateMatches]) => (
                    <div key={date}>
                      <div className="bm8-date-header" style={styles.dateHeader}>
                        <span>{date}</span>
                        <div style={styles.dateHeaderLine} />
                        <span>{dateMatches.length} {dateMatches.length === 1 ? (lang === "zh" ? "场" : lang === "ms" ? "perlawanan" : "match") : (lang === "zh" ? "场" : lang === "ms" ? "perlawanan" : "matches")}</span>
                      </div>
                      {dateMatches.map((match) => (
                        <MatchRow
                          key={match.id}
                          match={match}
                          onClick={() => predictMatch(match)}
                          isPredicting={predictingId === match.id}
                          t={t}
                          expandedData={expandedResults[match.id]}
                          isExpanded={expandedIds.has(match.id)}
                          onToggle={() => toggleExpanded(match.id)}
                          liveScores={liveScores}
                        />
                      ))}
                    </div>
                  ));
                })()
              )}
            </div>
          </>
        )}

        {/* ========== LIVE PREDICTIONS TAB ========== */}
        {/* ========== RESULTS TAB ========== */}
        {activeNav === "results" && (
          <ResultsView
            matches={matches.filter((m) => m.status === "recent")}
            onPredictMatch={predictMatch}
            predictingId={predictingId}
            t={t}
            expandedResults={expandedResults}
            expandedIds={expandedIds}
            onToggleExpanded={toggleExpanded}
          />
        )}

        {/* ========== INSIGHTS TAB ========== */}
        {activeNav === "insights" && (
          <InsightsView matches={matches} t={t} lang={lang} getAccuracyStats={getAccuracyStats} />
        )}

        {/* ========== STANDINGS TAB ========== */}
        {activeNav === "standings" && (
          <StandingsView lang={lang} />
        )}

        {/* ========== PARLAY TAB ========== */}
        {activeNav === "parlay" && (
          <ParlayView
            matches={matches.filter((m) => m.status === "upcoming")}
            lang={lang}
            t={t}
          />
        )}
      </main>

      <footer className="bm8-footer" style={styles.footer}>
        <span>{t.footer1}</span><span style={styles.footerDot}>●</span>
        <span>{t.footer2}</span><span style={styles.footerDot}>●</span>
        <span>{t.footer3}</span>
      </footer>

    </div>
  );
}

// ============================== PARLAY VIEW ==================================
const PARLAY_STRATEGIES = [
  {
    key: "BIG_GOALS",
    icon: "🔥",
    color: "#ff6b2b",
    gradient: "linear-gradient(135deg, rgba(255,107,43,0.18), rgba(255,48,48,0.08))",
    border: "rgba(255,107,43,0.35)",
    leagues: ["Eredivisie","Bundesliga","EPL","LaLiga","SerieA"],
    prompt: `STRATEGY: BIG GOALS (大球)
Find 2 upcoming matches where total goals are highly likely to be 2.5+/3.5+.
Prioritise:
- Teams with weak defensive records (high GA, bottom-half standings)
- Eredivisie and Bundesliga — leagues with open, attacking play
- Both teams needing goals (relegation battle, title race, must-win)
- Strong home attacks vs poor away defences
- H2H history of high-scoring games`,
    betTypes: ["Over 2.5 Goals", "Over 3.5 Goals", "Both Teams To Score", "Over 1.5 Goals HT"],
  },
  {
    key: "DRAW_UNDER",
    icon: "🧊",
    color: "#29b6f6",
    gradient: "linear-gradient(135deg, rgba(41,182,246,0.18), rgba(0,100,180,0.08))",
    border: "rgba(41,182,246,0.35)",
    leagues: ["Championship","Ligue1","PrimeiraLiga","SerieA","Bundesliga"],
    prompt: `STRATEGY: DRAW / UNDER (平局/小球)
Find 2 upcoming matches likely to end in a draw or with under 2.5 total goals.
Prioritise:
- Mid-table teams with nothing to play for — no relegation fear, no title race
- Sides with strong defensive records and low scoring rates
- Teams with high draw rates (3+ draws in last 6 games)
- Away teams content with a point
- Historically low-scoring H2H matchups`,
    betTypes: ["Draw", "Under 2.5 Goals", "Under 1.5 Goals", "0-0 / 1-1 Correct Score"],
  },
  {
    key: "COMEBACK",
    icon: "⚡",
    color: "#ab47bc",
    gradient: "linear-gradient(135deg, rgba(171,71,188,0.18), rgba(100,0,150,0.08))",
    border: "rgba(171,71,188,0.35)",
    leagues: ["EPL","Bundesliga","LaLiga","UCL","UEL"],
    prompt: `STRATEGY: COMEBACK KINGS (逆转王)
Find 2 upcoming matches where the favoured team is likely to win, but the match will be decided in the SECOND HALF.
Prioritise:
- Teams with significantly more 2nd-half goals than 1st-half in their stats
- Favourites facing relegation-threatened or clearly weaker opposition
- Teams with superior fitness/depth who "switch on" after half-time
- Situations where the underdog often parks the bus in the first half
Bet type focus: 2nd Half Result, Match Winner (full time), Asian Handicap`,
    betTypes: ["Home Win (FT)", "Away Win (FT)", "2nd Half Home Win", "Asian Handicap -0.5"],
  },
];

function ParlayView({ matches, lang, t }: { matches: any[]; lang: string; t: any }) {
  const [strategy, setStrategy] = useState("BIG_GOALS");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const upcomingCount = matches.length;
  const strat = PARLAY_STRATEGIES.find((s) => s.key === strategy)!;

  const generate = async () => {
    if (upcomingCount < 4) { setError((t as any).parlayNoMatches); return; }
    setLoading(true); setError(null); setResult(null);

    const langName = lang === "zh" ? "CHINESE (Simplified)" : lang === "ms" ? "BAHASA MELAYU" : "ENGLISH";

    // Format match list concisely
    const matchList = matches
      .slice(0, 40)
      .map((m, i) => `${i + 1}. [${m.league}] ${m.home} vs ${m.away} — ${m.date}${m.time ? " " + m.time : ""}`)
      .join("\n");

    const prompt = `You are a football betting analyst expert in parlay/accumulator strategy. Your task: select the 2 BEST matches from the list below that fit the given strategy, then build a high-value double.

${strat.prompt}

UPCOMING MATCHES:
${matchList}

INSTRUCTIONS:
- Choose ONLY 2 matches from the list above
- They must be from DIFFERENT leagues (no same-league doubles)
- Each pick must have a specific bet type
- Confidence 0–100 per pick (be realistic, not all 80s)
- RESPOND IN ${langName} for all descriptive text fields

Return ONLY valid JSON, no extra text:
{
  "pick1": {
    "matchNum": <number from list>,
    "home": "<home team>",
    "away": "<away team>",
    "league": "<league>",
    "date": "<date>",
    "betType": "<specific bet from: ${strat.betTypes.join(" | ")}>",
    "confidence": <50-88>,
    "keyReason": "<2 sentences why this match fits the strategy>"
  },
  "pick2": {
    "matchNum": <number from list>,
    "home": "<home team>",
    "away": "<away team>",
    "league": "<league>",
    "date": "<date>",
    "betType": "<specific bet>",
    "confidence": <50-88>,
    "keyReason": "<2 sentences>"
  },
  "comboReasoning": "<2-3 sentences explaining why THESE TWO together are a strong same-type parlay>",
  "estimatedCombinedOdds": "<e.g. ~4.2x>",
  "riskNote": "<one sentence on the main risk>"
}`;

    const callAI = async (endpoint: string, body: object, timeoutMs = 55000) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const r = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      } finally { clearTimeout(timer); }
    };

    try {
      let data: any;
      try {
        data = await callAI("/api/claude", { prompt });
      } catch {
        data = await callAI("/api/gemini", { prompt, json: true });
      }
      const text = (data.text || "").replace(/```json|```/g, "").trim();
      const parsed = parseFlexibleJSON(text);
      setResult(parsed);
    } catch (e: any) {
      setError((t as any).parlayError + " " + (e.message || ""));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>

      {/* Strategy selector */}
      <div className="parlay-strategy-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
        {PARLAY_STRATEGIES.map((s) => (
          <button
            key={s.key}
            onClick={() => { setStrategy(s.key); setResult(null); setError(null); }}
            style={{
              background: strategy === s.key ? s.gradient : "rgba(255,255,255,0.03)",
              border: `1.5px solid ${strategy === s.key ? s.border : "rgba(255,255,255,0.08)"}`,
              borderRadius: 14, padding: "14px 12px", cursor: "pointer", textAlign: "left" as const,
              transition: "all 0.2s", position: "relative" as const,
              boxShadow: strategy === s.key ? `0 4px 20px ${s.color}22` : "none",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ color: strategy === s.key ? s.color : "#e8e8e8", fontWeight: 700, fontSize: 14, marginBottom: 3, fontFamily: "inherit" }}>
              {(t as any)[`parlayStrategy${PARLAY_STRATEGIES.indexOf(s) + 1}Title`]}
            </div>
            <div style={{ color: strategy === s.key ? s.color + "bb" : "#666", fontSize: 11, fontFamily: "inherit", marginBottom: 6 }}>
              {(t as any)[`parlayStrategy${PARLAY_STRATEGIES.indexOf(s) + 1}Sub`]}
            </div>
            <div style={{ color: "#8a8a8a", fontSize: 11, lineHeight: 1.5, fontFamily: "inherit" }}>
              {(t as any)[`parlayStrategy${PARLAY_STRATEGIES.indexOf(s) + 1}Desc`]}
            </div>
            {strategy === s.key && (
              <div style={{ position: "absolute" as const, top: 10, right: 10, width: 8, height: 8, borderRadius: "50%", background: s.color }} />
            )}
          </button>
        ))}
      </div>

      {/* Generate button */}
      <button
        onClick={result ? () => { setResult(null); generate(); } : generate}
        disabled={loading}
        style={{
          width: "100%", padding: "15px 24px", borderRadius: 12,
          background: loading ? "rgba(255,255,255,0.05)" : `linear-gradient(135deg, ${strat.color}, ${strat.color}bb)`,
          border: `1.5px solid ${strat.border}`, color: loading ? "#666" : "#fff",
          fontWeight: 700, fontSize: 15, fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          boxShadow: loading ? "none" : `0 4px 24px ${strat.color}44`,
          transition: "all 0.2s", marginBottom: 28,
        }}
      >
        {loading ? (
          <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> {(t as any).parlayGenerating}</>
        ) : result ? (
          <><RefreshCw size={18} /> {(t as any).parlayRegenerate}</>
        ) : (
          <><Brain size={18} /> {strat.icon} {(t as any).parlayGenerate}</>
        )}
      </button>

      {/* Fixtures count hint */}
      {!result && !loading && (
        <div style={{ fontSize: 12, color: "#555", textAlign: "center" as const, marginTop: -18, marginBottom: 28 }}>
          {upcomingCount} {lang === "zh" ? "场即将开赛的比赛可用" : lang === "ms" ? "perlawanan akan datang tersedia" : "upcoming matches available"}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 10, padding: "12px 16px", color: "#ff6b6b", fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16 }}>

          {/* Two pick cards */}
          <div className="parlay-picks-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[result.pick1, result.pick2].map((pick, idx) => pick && (
              <div key={idx} style={{
                background: strat.gradient, border: `1.5px solid ${strat.border}`,
                borderRadius: 16, padding: "18px 16px",
                boxShadow: `0 4px 20px ${strat.color}18`,
              }}>
                {/* Pick label */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <div style={{
                    background: strat.color, color: "#fff", borderRadius: 6,
                    fontSize: 10, fontWeight: 800, padding: "2px 8px", fontFamily: "inherit",
                  }}>
                    {(t as any).parlayPick} {idx + 1}
                  </div>
                  <div style={{ fontSize: 11, color: "#666", fontFamily: "inherit" }}>{pick.league}</div>
                </div>

                {/* Teams */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <TeamBadge name={pick.home} crest="" size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#e8e8e8", fontWeight: 700, fontSize: 13, fontFamily: "inherit", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {pick.home}
                    </div>
                    <div style={{ color: "#555", fontSize: 10, fontFamily: "inherit" }}>vs</div>
                    <div style={{ color: "#e8e8e8", fontWeight: 700, fontSize: 13, fontFamily: "inherit", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {pick.away}
                    </div>
                  </div>
                  <TeamBadge name={pick.away} crest="" size={28} />
                </div>

                {/* Date */}
                <div style={{ color: "#666", fontSize: 11, fontFamily: "inherit", marginBottom: 10 }}>📅 {pick.date}</div>

                {/* Bet type */}
                <div style={{
                  background: `${strat.color}22`, border: `1px solid ${strat.color}44`,
                  borderRadius: 8, padding: "7px 10px", marginBottom: 10,
                }}>
                  <div style={{ color: "#8a8a8a", fontSize: 10, fontFamily: "inherit", marginBottom: 2 }}>{(t as any).parlayBetType}</div>
                  <div style={{ color: strat.color, fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>{pick.betType}</div>
                </div>

                {/* Confidence */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#666", fontFamily: "inherit" }}>{(t as any).parlayConfidence}</div>
                  <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${pick.confidence || 65}%`, height: "100%", background: strat.color, borderRadius: 2 }} />
                  </div>
                  <div style={{ color: strat.color, fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>{pick.confidence || 65}%</div>
                </div>

                {/* Key reason */}
                <div style={{ color: "#9a9a9a", fontSize: 11, lineHeight: 1.55, fontFamily: "inherit" }}>
                  {pick.keyReason}
                </div>
              </div>
            ))}
          </div>

          {/* Combo reasoning card */}
          <div style={{
            background: "rgba(255,255,255,0.03)", border: `1px solid ${strat.border}`,
            borderRadius: 14, padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 3, height: 20, background: strat.color, borderRadius: 2, flexShrink: 0 }} />
              <div style={{ color: strat.color, fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", fontFamily: "inherit" }}>
                {(t as any).parlayComboWhy}
              </div>
            </div>
            <p style={{ color: "#c0c0c0", fontSize: 13, lineHeight: 1.65, margin: 0, fontFamily: "inherit" }}>
              {result.comboReasoning}
            </p>
          </div>

          {/* Stats strip */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ color: "#555", fontSize: 11, fontFamily: "inherit", marginBottom: 4 }}>{(t as any).parlayEstOdds}</div>
              <div style={{ color: strat.color, fontWeight: 800, fontSize: 22, fontFamily: "inherit" }}>
                {result.estimatedCombinedOdds || "~4x"}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ color: "#555", fontSize: 11, fontFamily: "inherit", marginBottom: 4 }}>{(t as any).parlayRiskNote}</div>
              <div style={{ color: "#c0c0c0", fontSize: 12, lineHeight: 1.5, fontFamily: "inherit" }}>
                {result.riskNote || "—"}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ fontSize: 11, color: "#444", textAlign: "center" as const, paddingTop: 4, fontFamily: "inherit", lineHeight: 1.6 }}>
            {lang === "zh"
              ? "⚠️ 仅供娱乐参考，不构成投注建议。请理性博彩。"
              : lang === "ms"
              ? "⚠️ Untuk hiburan sahaja. Judi secara bertanggungjawab."
              : "⚠️ For entertainment only. Please gamble responsibly."}
          </div>
        </div>
      )}
    </div>
  );
}

function TeamBadge({ name, crest, size = 40 }) {
  const [stage, setStage] = useState(0); // 0=crest, 1=espn, 2=trophy
  const espn = getLogo(name);
  const url = stage === 0 ? (crest || espn) : stage === 1 ? espn : null;
  const onErr = () => setStage((s) => s + 1);
  if (!url || stage >= 2) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "rgba(240,180,41,0.08)", color: "#F0B429",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, border: "1px solid rgba(240,180,41,0.2)",
      }}>
        <Trophy size={size * 0.5} />
      </div>
    );
  }
  return (
    <img key={url} src={url} alt={name} onError={onErr}
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, background: "rgba(255,255,255,0.07)", borderRadius: "50%", padding: 2 }} />
  );
}

// ============================== LIVE PREDICTIONS VIEW ========================
function LivePredictionsView({ matches, onPredictMatch, predictingId, t, expandedResults, expandedIds, onToggleExpanded }) {
  const [filter, setFilter] = useState("today");

  const MONTHS = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
  const parseMatchDate = (dateStr) => {
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length < 3) return null;
    const day = parseInt(parts[1]);
    const month = MONTHS[parts[2]];
    if (isNaN(day) || month === undefined) return null;
    const now = new Date();
    return new Date(now.getFullYear(), month, day);
  };

  // Parse dates and filter to "today" or "this week"
  const filtered = useMemo(() => {
    if (filter === "week") return matches;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    return matches.filter((m) => {
      const d = parseMatchDate(m.date);
      if (!d) return false;
      return d >= todayStart && d < tomorrowStart;
    });
  }, [matches, filter]);

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => setFilter("today")}
          style={{ ...styles.filterTab, ...(filter === "today" ? styles.filterTabActive : {}) }}
        >
          Today · 今日 · Hari Ini
        </button>
        <button
          onClick={() => setFilter("week")}
          style={{ ...styles.filterTab, ...(filter === "week" ? styles.filterTabActive : {}) }}
        >
          This week · 本周 · Minggu Ini
        </button>
      </div>

      <div style={{ fontSize: 12, color: "#8a8a8a", marginBottom: 20, fontFamily: "inherit", paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {filtered.length} match{filtered.length !== 1 ? "es" : ""} · Tap any to get instant AI prediction
      </div>

      <div style={styles.matchList}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>No live matches right now.</div>
        ) : (
          filtered.map((match) => (
            <MatchRow
              key={match.id}
              match={match}
              onClick={() => onPredictMatch(match)}
              isPredicting={predictingId === match.id}
              t={t}
              expandedData={expandedResults?.[match.id]}
              isExpanded={expandedIds?.has(match.id)}
              onToggle={() => onToggleExpanded?.(match.id)}
            />
          ))
        )}
      </div>
    </>
  );
}

// ============================== RESULTS VIEW =================================
function ResultsView({ matches, onPredictMatch, predictingId, t, expandedResults, expandedIds, onToggleExpanded }) {
  const [leagueFilter, setLeagueFilter] = useState("all");

  const filtered = useMemo(() => {
    if (leagueFilter === "all") return matches;
    return matches.filter((m) => m.league === leagueFilter);
  }, [matches, leagueFilter]);

  const leaguesWithResults = [...new Set(matches.map((m) => m.league))];

  if (matches.length === 0) {
    return <div style={styles.empty}>{t.noResults}</div>;
  }

  const totalGoals = matches.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0);
  const avgGoals = (totalGoals / matches.length).toFixed(2);
  const draws = matches.filter((m) => m.homeScore === m.awayScore).length;
  const homeWins = matches.filter((m) => m.homeScore > m.awayScore).length;
  const awayWins = matches.filter((m) => m.awayScore > m.homeScore).length;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Matches" value={matches.length} color="#ff3030" />
        <StatCard label="Total Goals" value={totalGoals} color="#fff" />
        <StatCard label="Avg Goals/Match" value={avgGoals} color="#fff" />
        <StatCard label="Home Wins" value={homeWins} color="#ff3030" />
        <StatCard label="Draws" value={draws} color="#8a8a8a" />
        <StatCard label="Away Wins" value={awayWins} color="#fff" />
      </div>

      <div style={styles.leagueRow}>
        <button
          onClick={() => setLeagueFilter("all")}
          style={{ ...styles.leagueChip, ...(leagueFilter === "all" ? styles.leagueChipActive : {}) }}
        >
          All
        </button>
        {leaguesWithResults.map((lg) => (
          <button
            key={lg}
            onClick={() => setLeagueFilter(lg)}
            style={{ ...styles.leagueChip, ...(leagueFilter === lg ? styles.leagueChipActive : {}) }}
          >
            {LEAGUE_LABELS[lg] || lg}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "#8a8a8a", marginBottom: 20, fontFamily: "inherit", paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        Showing {filtered.length} completed matches
      </div>

      <div style={styles.matchList}>
        {filtered.map((match) => (
          <MatchRow
            key={match.id}
            match={match}
            onClick={() => onPredictMatch(match)}
            isPredicting={predictingId === match.id}
            t={t}
            expandedData={expandedResults?.[match.id]}
            isExpanded={expandedIds?.has(match.id)}
            onToggle={() => onToggleExpanded?.(match.id)}
          />
        ))}
      </div>
    </>
  );
}

// ============================== INSIGHTS VIEW ================================
function InsightsView({ matches, t, lang, getAccuracyStats }) {
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const upcoming = matches.filter((m) => m.status === "upcoming");
  const recent = matches.filter((m) => m.status === "recent");
  const leaguesCount = [...new Set(matches.map((m) => m.league))].length;

  const byLeague = {};
  matches.forEach((m) => {
    byLeague[m.league] = (byLeague[m.league] || 0) + 1;
  });
  const leagueEntries = Object.entries(byLeague).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...Object.values(byLeague), 1);

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAiError("");
    setAiAnswer("");
    try {
      const langName = lang === "zh" ? "CHINESE (Simplified)" : lang === "ms" ? "BAHASA MELAYU" : "ENGLISH";
      const matchSummary = matches.slice(0, 20).map((m) =>
        m.status === "recent"
          ? `${m.home} ${m.homeScore}-${m.awayScore} ${m.away} (${m.league}, ${m.date})`
          : `${m.home} vs ${m.away} (${m.league}, ${m.date} ${m.time || ""})`
      ).join("\n");

      const prompt = `You are an expert football analyst. Based on the following matches and your general knowledge of football in the current season, answer the user's question.

MATCHES AVAILABLE:
${matchSummary}

USER QUESTION: ${question}

Provide a clear, informative answer in 2-4 paragraphs. Use bullet points or short lines where helpful. RESPOND IN ${langName}.`;

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-token": "" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      const text = data.text || "";
      if (!text) throw new Error("Empty response");
      setAiAnswer(text);
    } catch (e: any) {
      let msg = e.message || String(e);
      if (msg.includes("429")) msg = "Rate limit. Wait 60s and try again.";
      setAiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
        <StatCard label={t.statsLeagues} value={leaguesCount} color="#ff3030" />
        <StatCard label={t.statsUpcoming} value={upcoming.length} color="#fff" />
        <StatCard label={t.statsRecent} value={recent.length} color="#8a8a8a" />
        <StatCard label={t.statsSample} value={matches.length} color="#fff" />
      </div>

      {(() => {
        try {
          if (typeof getAccuracyStats !== "function") return null;
          const acc = getAccuracyStats();
          if (!acc || !acc.total) return null;
          return (
            <div style={{ padding: "14px 16px", background: "rgba(240,180,41,0.05)", border: "1px solid rgba(240,180,41,0.15)", borderRadius: 10, marginTop: 4, marginBottom: 28 }}>
              <div style={{ fontSize: 9, color: "#F0B429", letterSpacing: "0.2em", fontWeight: 700, marginBottom: 6 }}>MY PREDICTION ACCURACY</div>
              <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontFamily: "inherit", fontSize: 28, fontWeight: 800, color: "#F0B429", lineHeight: 1 }}>{acc.pct}%</div>
                  <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>Win/Draw/Loss</div>
                </div>
                <div>
                  <div style={{ fontFamily: "inherit", fontSize: 20, fontWeight: 700, color: "#888", lineHeight: 1 }}>{acc.correct}/{acc.total}</div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>Correct outcomes</div>
                </div>
                {acc.scoreCorrect > 0 && <div>
                  <div style={{ fontFamily: "inherit", fontSize: 20, fontWeight: 700, color: "#555", lineHeight: 1 }}>{acc.scoreCorrect}</div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>Exact scores</div>
                </div>}
              </div>
            </div>
          );
        } catch { return null; }
      })()}

      <div style={{ marginBottom: 32 }}>
        <div style={styles.sectionTitle}>{t.leagueBreakdown}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {leagueEntries.map(([lg, count]) => {
            const pct = (count / maxCount) * 100;
            return (
              <div key={lg} style={{ display: "grid", gridTemplateColumns: "140px 1fr 40px", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#e8e8e8", fontFamily: "inherit" }}>
                  {LEAGUE_LABELS[lg] || lg}
                </span>
                <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "#F0B429", borderRadius: 4, transition: "width 0.8s ease" }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", textAlign: "right" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={styles.sectionTitle}>
          <Sparkles size={11} style={{ verticalAlign: "middle", marginRight: 6 }} />
          {t.askAi}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") askAI(); }}
            placeholder={t.aiPlaceholder}
            style={{ flex: 1, minWidth: 240, padding: "13px 16px", background: "#111117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#e2e2e2", fontSize: 13, fontFamily: "inherit" }}
          />
          <button
            onClick={askAI}
            disabled={loading || !question.trim()}
            style={{ ...styles.refreshBtn, minWidth: 120, justifyContent: "center", opacity: loading || !question.trim() ? 0.5 : 1 }}
          >
            {loading
              ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> <span>...</span></>
              : <><Sparkles size={16} /> <span>{t.ask}</span></>}
          </button>
        </div>

        {aiAnswer && (
          <div style={{ marginTop: 16, padding: "18px 22px", background: "#16161E", borderLeft: "3px solid #F0B429", borderRadius: "0 8px 8px 0", fontSize: 13, lineHeight: 1.75, color: "#888", whiteSpace: "pre-wrap" }}>
            {aiAnswer}
          </div>
        )}
        {aiError && (
          <div style={{ marginTop: 16, padding: 14, background: "rgba(240,180,41,0.06)", border: "1px solid rgba(240,180,41,0.2)", borderRadius: 8, fontSize: 13, color: "#c9922a" }}>
            {aiError}
          </div>
        )}
        {loading && !aiAnswer && (
          <div style={{ marginTop: 16, padding: "30px 20px", textAlign: "center", color: "#8a8a8a", fontSize: 13 }} className="pulsing">
            {t.aiAnalyzing}
          </div>
        )}
      </div>
    </>
  );
}

// ============================== STANDINGS VIEW ================================
const STANDINGS_LEAGUES = ["EPL", "Championship", "LaLiga", "SerieA", "Bundesliga", "Ligue1", "Eredivisie", "PrimeiraLiga", "UCL", "Brasileirao"];
const STANDINGS_LABELS = {
  EPL: "EPL", Championship: "Championship", LaLiga: "La Liga", SerieA: "Serie A",
  Bundesliga: "Bundesliga", Ligue1: "Ligue 1", Eredivisie: "Eredivisie",
  PrimeiraLiga: "Primeira Liga", UCL: "UCL", Brasileirao: "Brasileirão",
};

// How many top/bottom spots to highlight per league
const ZONE_CONFIG: Record<string, { ucl?: number; uel?: number; conf?: number; rel?: number }> = {
  EPL:          { ucl: 4, uel: 1, conf: 1, rel: 3 },
  Championship: { ucl: 2, uel: 4, rel: 3 },
  LaLiga:       { ucl: 4, uel: 2, rel: 3 },
  SerieA:       { ucl: 4, uel: 2, conf: 1, rel: 3 },
  Bundesliga:   { ucl: 4, uel: 1, conf: 1, rel: 3 },
  Ligue1:       { ucl: 2, uel: 2, conf: 1, rel: 3 },
  Eredivisie:   { ucl: 1, uel: 3, rel: 3 },
  PrimeiraLiga: { ucl: 1, uel: 2, conf: 1, rel: 3 },
  UCL:          { ucl: 8 },
  Brasileirao:  { ucl: 6, rel: 4 },
};

function getRowZone(pos: number, league: string) {
  const z = ZONE_CONFIG[league] || {};
  if (z.ucl && pos <= z.ucl) return "ucl";
  if (z.uel && pos <= (z.ucl || 0) + z.uel) return "uel";
  if (z.conf && pos <= (z.ucl || 0) + (z.uel || 0) + z.conf) return "conf";
  return "none";
}
function isRelegation(pos: number, total: number, league: string) {
  const z = ZONE_CONFIG[league] || {};
  return z.rel ? pos > total - z.rel : false;
}

function FormDot({ result }: { result: string }) {
  const color = result === "W" ? "#22c55e" : result === "D" ? "#eab308" : result === "L" ? "#ef4444" : "#444";
  const label = result === "W" ? "W" : result === "D" ? "D" : result === "L" ? "L" : "?";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 18, height: 18, borderRadius: "50%", background: color,
      fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>{label}</span>
  );
}

function StandingsBadge({ crest, name, size = 22 }) {
  const [stage, setStage] = useState(0);
  const espn = getLogo(name);
  const url = stage === 0 ? (crest || espn) : stage === 1 ? espn : null;
  if (!url || stage >= 2) {
    return <div style={{ width: size, height: size, borderRadius: "50%", background: "rgba(240,180,41,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#F0B429" }}><Trophy size={size * 0.5} /></div>;
  }
  return <img key={url} src={url} alt={name} onError={() => setStage(s => s + 1)} style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, background: "rgba(255,255,255,0.07)", borderRadius: "50%", padding: 1 }} />;
}

function StandingsView({ lang }) {
  const [selectedLeague, setSelectedLeague] = useState("EPL");
  const [standings, setStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStandings = async (league: string) => {
    setLoading(true);
    setError("");
    setStandings([]);
    try {
      const r = await fetch(`/api/standings?league=${league}`);
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setStandings(data.standings || []);
    } catch (e: any) {
      setError(e.message || "Failed to load standings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStandings(selectedLeague); }, [selectedLeague]);

  const zoneLabel = (zone: string) => {
    if (zone === "ucl") return { text: lang === "zh" ? "欧冠" : "UCL", color: "#3b82f6" };
    if (zone === "uel") return { text: lang === "zh" ? "欧联" : "UEL", color: "#f97316" };
    if (zone === "conf") return { text: "UECL", color: "#8b5cf6" };
    return null;
  };

  const colStyle = (w: string | number, right = false): React.CSSProperties => ({
    width: typeof w === "number" ? w : undefined,
    minWidth: typeof w === "number" ? w : undefined,
    flexShrink: 0,
    textAlign: right ? "right" : "center",
    fontSize: 12,
    color: "#e8e8e8",
  });

  return (
    <>
      {/* League tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {STANDINGS_LEAGUES.map(lg => (
          <button
            key={lg}
            onClick={() => setSelectedLeague(lg)}
            style={{
              ...styles.leagueChip,
              ...(selectedLeague === lg ? styles.leagueChipActive : {}),
            }}
          >
            {STANDINGS_LABELS[lg]}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#8a8a8a", fontSize: 13 }} className="pulsing">
          {lang === "zh" ? "加载中..." : lang === "ms" ? "Memuatkan..." : "Loading standings..."}
        </div>
      )}

      {error && (
        <div style={{ padding: 16, background: "rgba(240,180,41,0.06)", border: "1px solid rgba(240,180,41,0.2)", borderRadius: 8, color: "#c9922a", fontSize: 13 }}>
          {error}
        </div>
      )}

      {!loading && !error && standings.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          {/* Zone legend */}
          <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
            {[
              { color: "rgba(59,130,246,0.25)", label: lang === "zh" ? "欧冠资格" : lang === "ms" ? "Layak UCL" : "UCL Qualification" },
              { color: "rgba(249,115,22,0.2)", label: lang === "zh" ? "欧联资格" : lang === "ms" ? "Layak UEL" : "UEL Qualification" },
              { color: "rgba(239,68,68,0.15)", label: lang === "zh" ? "降级区" : lang === "ms" ? "Zon Penurunan" : "Relegation Zone" },
            ].map(z => (
              <div key={z.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: z.color, border: "1px solid rgba(255,255,255,0.15)" }} />
                <span style={{ fontSize: 11, color: "#6a6a6a" }}>{z.label}</span>
              </div>
            ))}
          </div>

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 2 }}>
            <div style={{ ...colStyle(28) }}>#</div>
            <div style={{ flex: 1, fontSize: 11, color: "#6a6a6a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {lang === "zh" ? "球队" : lang === "ms" ? "Pasukan" : "Team"}
            </div>
            {[
              { label: "P", title: "Played" },
              { label: "W", title: "Won" },
              { label: "D", title: "Draw" },
              { label: "L", title: "Lost" },
              { label: "GD", title: "Goal Difference" },
              { label: "Pts", title: "Points" },
            ].map(col => (
              <div key={col.label} style={{ ...colStyle(32, true), fontSize: 11, color: "#6a6a6a", textTransform: "uppercase", letterSpacing: "0.08em" }} title={col.title}>
                {col.label}
              </div>
            ))}
            <div style={{ width: 100, flexShrink: 0, fontSize: 11, color: "#6a6a6a", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>
              {lang === "zh" ? "近况" : lang === "ms" ? "Prestasi" : "Form"}
            </div>
          </div>

          {/* Rows */}
          {standings.map((row, idx) => {
            const zone = getRowZone(row.position, selectedLeague);
            const isRel = isRelegation(row.position, standings.length, selectedLeague);
            const zl = zoneLabel(zone);
            const form = row.form ? row.form.split(",").filter(Boolean).slice(-5) : [];
            const rowBg = zone === "ucl" ? "rgba(59,130,246,0.08)"
              : zone === "uel" ? "rgba(249,115,22,0.07)"
              : zone === "conf" ? "rgba(139,92,246,0.07)"
              : isRel ? "rgba(239,68,68,0.07)"
              : idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent";
            const leftBorder = zone === "ucl" ? "2px solid #3b82f6"
              : zone === "uel" ? "2px solid #f97316"
              : zone === "conf" ? "2px solid #8b5cf6"
              : isRel ? "2px solid #ef4444"
              : "2px solid transparent";
            return (
              <div key={row.position} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 10px",
                background: rowBg,
                borderLeft: leftBorder,
                borderRadius: 4,
                marginBottom: 1,
              }}>
                {/* Pos */}
                <div style={{ ...colStyle(28), fontWeight: zone !== "none" || isRel ? 700 : 400, color: zone === "ucl" ? "#3b82f6" : zone === "uel" ? "#f97316" : zone === "conf" ? "#8b5cf6" : isRel ? "#ef4444" : "#8a8a8a" }}>
                  {row.position}
                </div>

                {/* Badge + Name */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <StandingsBadge crest={row.crest} name={row.team} size={22} />
                  <span style={{ fontSize: 13, color: "#e8e8e8", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {row.team}
                  </span>
                  {zl && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: zl.color, background: `${zl.color}22`, border: `1px solid ${zl.color}44`, borderRadius: 4, padding: "1px 5px", flexShrink: 0 }}>
                      {zl.text}
                    </span>
                  )}
                </div>

                {/* Stats */}
                {[row.played, row.won, row.draw, row.lost].map((v, i) => (
                  <div key={i} style={{ ...colStyle(32, true), color: i === 1 ? "#22c55e" : i === 3 ? "#ef4444" : "#c0c0c0" }}>
                    {v}
                  </div>
                ))}
                <div style={{ ...colStyle(32, true), color: row.gd > 0 ? "#22c55e" : row.gd < 0 ? "#ef4444" : "#8a8a8a" }}>
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </div>
                <div style={{ ...colStyle(32, true), fontWeight: 700, color: "#fff" }}>
                  {row.points}
                </div>

                {/* Form */}
                <div style={{ width: 100, flexShrink: 0, display: "flex", gap: 2, justifyContent: "center" }}>
                  {form.length > 0 ? form.map((r, i) => <FormDot key={i} result={r} />) : <span style={{ color: "#444", fontSize: 11 }}>—</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !error && standings.length === 0 && (
        <div style={styles.empty}>
          {lang === "zh" ? "暂无积分榜数据。" : lang === "ms" ? "Tiada data kedudukan." : "No standings data available."}
        </div>
      )}
    </>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      padding: "16px 18px",
      background: "#111117",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#8a8a8a", fontFamily: "inherit", marginBottom: 8, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: "inherit" }}>
        {value}
      </div>
    </div>
  );
}

function MatchRow({ match, onClick, isPredicting, t, expandedData, isExpanded, onToggle, liveScores }) {
  const isRecent = match.status === "recent";
  const liveData = liveScores?.get(`${match.home}|${match.away}`);
  return (
    <div className="match-row-wrap" style={{ marginBottom: 0 }}>
      <div className="match-row" style={{
        ...styles.matchRow,
        marginBottom: isExpanded ? 0 : 8,
        ...(isPredicting ? { opacity: 0.7 } : {}),
        ...(isExpanded ? { borderColor: "rgba(240,180,41,0.3)", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : {}),
      }}>
        {/* Time */}
        <div className="bm8-m-time" style={styles.mTime}>{isRecent ? t.ft : (match.time || "—")}</div>

        {/* Teams centered */}
        <div className="bm8-m-teams" style={styles.mTeams}>
          {/* Home team */}
          <div className="bm8-m-home" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
            <span className="bm8-team-name" style={{
              ...styles.mTeamName,
              color: isRecent && match.homeScore > match.awayScore ? "#fff" : "#ccc",
              fontWeight: isRecent && match.homeScore > match.awayScore ? 700 : 600,
            }}>{match.home}</span>
            <TeamBadge name={match.home} crest={match.homeCrest} size={26} />
          </div>

          {liveData ? (
            <div style={{ textAlign: "center" as const, flexShrink: 0 }}>
              <div className="pulsing" style={{ color: "#FF3333", fontSize: 9, fontWeight: 800, letterSpacing: 1, marginBottom: 2 }}>
                ● LIVE{liveData.minute ? ` ${liveData.minute}'` : liveData.liveStatus === "HALF_TIME" ? " HT" : ""}
              </div>
              <div style={styles.scoreBadge}>{liveData.homeScore} – {liveData.awayScore}</div>
            </div>
          ) : isRecent ? (
            <div style={{ ...styles.scoreBadge, flexShrink: 0 }}>{match.homeScore} – {match.awayScore}</div>
          ) : (
            <div style={{ ...styles.vsChip, flexShrink: 0 }}>{t.vs}</div>
          )}

          {/* Away team */}
          <div className="bm8-m-away" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start" }}>
            <TeamBadge name={match.away} crest={match.awayCrest} size={26} />
            <span className="bm8-team-name" style={{
              ...styles.mTeamName,
              color: isRecent && match.awayScore > match.homeScore ? "#fff" : "#ccc",
              fontWeight: isRecent && match.awayScore > match.homeScore ? 700 : 600,
            }}>{match.away}</span>
          </div>
        </div>

        {/* Right: league + button */}
        <div className="bm8-m-right" style={styles.mRight}>
          <span className="bm8-league-tag" style={styles.mLeagueTag}>{LEAGUE_LABELS[match.league] || match.league}</span>
          <button
            onClick={isExpanded ? onToggle : onClick}
            disabled={isPredicting}
            className="predict-btn bm8-predict-btn"
            style={styles.predictBtn}
          >
            {isPredicting ? (
              <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />{isRecent ? t.analyzing : t.predicting}</>
            ) : isExpanded ? (
              <>{t.hide || "Hide"}<X size={13} /></>
            ) : (
              <>{isRecent ? t.analyze : t.predict}<ArrowRight size={13} /></>
            )}
          </button>
        </div>
      </div>

      {/* INLINE EXPANSION */}
      {isExpanded && expandedData && (
        <div style={{
          padding: "20px 22px",
          background: "linear-gradient(180deg, rgba(240,180,41,0.03) 0%, transparent 40%)",
          border: "1px solid rgba(240,180,41,0.25)",
          borderTop: "none",
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          animation: "fadeUp 0.3s ease-out",
        }}>
          {expandedData.loading && (
            <div style={{ padding: 30, textAlign: "center", color: "#8a8a8a", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
              <span>{t.analysingMatch(match.home, match.away)}</span>
            </div>
          )}
          {expandedData.error && (
            <div style={{ padding: 16, background: "rgba(240,180,41,0.06)", border: "1px solid rgba(240,180,41,0.2)", borderRadius: 8, color: "#c9922a", fontSize: 13 }}>
              {t.failedMsg(expandedData.error)}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {expandedData.fromCache && (
              <div style={{ fontSize: 9, padding: "3px 10px", background: "rgba(107, 182, 168, 0.15)", color: "#6bb6a8", borderRadius: 3, letterSpacing: "0.2em", fontWeight: 700 }}>
                CACHED
              </div>
            )}
          </div>
          {expandedData.result && isRecent && <RecentAnalysis match={match} result={expandedData.result} t={t} />}
          {expandedData.result && !isRecent && <UpcomingPrediction match={match} result={expandedData.result} t={t} lang={expandedData.lang || "en"} teamStats={expandedData.teamStats} oddsFound={expandedData.oddsFound} />}
        </div>
      )}
    </div>
  );
}

function UpcomingPrediction({ match, result, t, lang = "en", teamStats, oddsFound }: any) {
  const {
    predictedScore, winProbability,
    confidence, confidencePercent, riskLevel,
    matchOdds, estGoals, bttsChance, matchType, overUnder25,
    homeForm, awayForm,
    keyFactors, reasoning, watchOut,
    playerWatch, injuries, htPrediction, scorelineProbabilities
  } = result;

  const confPct = typeof confidencePercent === "number" ? confidencePercent
    : confidence === "High" ? 80 : confidence === "Medium" ? 60 : 40;
  const risk = riskLevel || (confPct >= 70 ? "Low" : confPct >= 50 ? "Medium" : "High");
  const riskColor = risk === "Low" ? "#22c55e" : risk === "Medium" ? "#facc15" : "#ff3030";

  const prob = winProbability || { home: 0, draw: 0, away: 0 };
  const winner = prob.home > prob.away && prob.home > prob.draw
    ? match.home : prob.away > prob.draw ? match.away : t.drawCap;
  const winnerProb = Math.round(
    prob.home > prob.away && prob.home > prob.draw ? prob.home
    : prob.away > prob.draw ? prob.away : prob.draw
  );

  return (
    <>
      <div style={{ fontSize: 11, color: "#444", marginBottom: 14, letterSpacing: "0.05em" }}>
        {match.date}{match.time ? ` · ${match.time}` : ""}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center", marginBottom: 18, padding: "16px 12px", background: "#111117", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <TeamBadge name={match.home} crest={match.homeCrest} size={50} />
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", textAlign: "center" }}>{match.home}</div>
          {homeForm && <FormBadges form={homeForm} />}
        </div>
        <div style={{ fontFamily: "inherit", color: "#8a8a8a", fontSize: 14 }}>VS</div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <TeamBadge name={match.away} crest={match.awayCrest} size={50} />
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", textAlign: "center" }}>{match.away}</div>
          {awayForm && <FormBadges form={awayForm} />}
        </div>
      </div>

      <div style={{ padding: "16px 18px", background: "rgba(240,180,41,0.04)", borderLeft: "3px solid #F0B429", borderRadius: "0 8px 8px 0", marginBottom: 16 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: "#F0B429", background: "rgba(240,180,41,0.1)", border: "1px solid rgba(240,180,41,0.2)", padding: "3px 10px", borderRadius: 20, letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
          ▲ {winner === t.drawCap ? t.drawCap : `${winner} win predicted`}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "inherit", fontSize: 40, color: "#fff", fontWeight: 800, lineHeight: 1, letterSpacing: "0.05em" }}>
              {predictedScore.home} — {predictedScore.away}
            </div>
            <div style={{ fontSize: 10, color: "#444", marginTop: 6, letterSpacing: "0.15em", textTransform: "uppercase" as const }}>
              Predicted Score
            </div>
          </div>
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontFamily: "inherit", fontSize: 44, color: "#F0B429", fontWeight: 800, lineHeight: 1 }}>
              {confPct}<span style={{ fontSize: 20 }}>%</span>
            </div>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.15em", textTransform: "uppercase" as const, marginTop: 2 }}>Confidence</div>
            <span style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, display: "inline-block", marginTop: 6, letterSpacing: "0.1em", fontWeight: 700, background: riskColor + "18", color: riskColor, border: `1px solid ${riskColor}40` }}>{risk} RISK</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 18, padding: "14px 16px", background: "#16161E", borderLeft: "3px solid #F0B429", borderRadius: "0 8px 8px 0", fontSize: 13, lineHeight: 1.75, color: "#888" }}>
        {reasoning}
      </div>

      {htPrediction && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#111117", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 10, color: "#666", letterSpacing: "0.12em", fontWeight: 700 }}>HT PREDICTION</span>
          <span style={{ fontFamily: "inherit", fontSize: 20, fontWeight: 800, color: "#F0B429" }}>{htPrediction.home} — {htPrediction.away}</span>
        </div>
      )}

      {matchOdds && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
          <OddsCell label={t.homeWin || "Home"} odd={matchOdds.home} />
          <OddsCell label={t.drawCap || "Draw"} odd={matchOdds.draw} />
          <OddsCell label={t.awayWin || "Away"} odd={matchOdds.away} />
        </div>
      )}

      {(() => {
        const realOdds = oddsFound?.homeOdds ? { home: oddsFound.homeOdds, draw: oddsFound.drawOdds, away: oddsFound.awayOdds } : matchOdds;
        if (!realOdds || !prob.home) return null;
        const VALUE_THRESHOLD = 7;
        const bets = [
          { label: match.home, aiProb: prob.home, odds: realOdds.home },
          { label: t.drawCap || "Draw", aiProb: prob.draw, odds: realOdds.draw },
          { label: match.away, aiProb: prob.away, odds: realOdds.away },
        ].map(b => ({ ...b, implied: b.odds ? parseFloat((100 / b.odds).toFixed(1)) : 0, edge: b.odds ? parseFloat((b.aiProb - 100 / b.odds).toFixed(1)) : 0 }))
         .filter(b => b.edge >= VALUE_THRESHOLD)
         .sort((a, b) => b.edge - a.edge);
        if (!bets.length) return <div style={{ fontSize: 10, color: "#444", textAlign: "center", marginBottom: 16, letterSpacing: "0.1em" }}>NO VALUE BETS DETECTED</div>;
        return (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#22c55e", letterSpacing: "0.2em", marginBottom: 6 }}>⚡ VALUE BET{bets.length > 1 ? "S" : ""} DETECTED</div>
            {bets.map((b, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 6, marginBottom: 4 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{b.label}</span>
                  <span style={{ fontSize: 10, color: "#666" }}>AI: {Math.round(b.aiProb)}% · Mkt: {b.implied}% · Odds: {b.odds?.toFixed(2)}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#22c55e" }}>+{b.edge}%</div>
                  <div style={{ fontSize: 9, color: "#22c55e", letterSpacing: "0.1em" }}>EDGE</div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <div style={{ marginBottom: 20 }}>
        <div style={{ ...styles.sectionTitle, display: "flex", alignItems: "center", gap: 8 }}>
          📊 {t.outcomeProb}
          <span style={{ fontSize: 9, color: "#ff3030", letterSpacing: "0.15em" }}>(AI ENHANCED)</span>
        </div>
        <ProbBar label={match.home} value={prob.home} color="#F0B429" />
        <ProbBar label={t.drawCap} value={prob.draw} color="#444" />
        <ProbBar label={match.away} value={prob.away} color="#FF3333" />
      </div>

      {(estGoals || bttsChance || matchType) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 20 }}>
          {estGoals && <MiniStatCard icon="⚡" label={t.estGoals || "Est. Goals"} value={estGoals} />}
          {bttsChance !== undefined && bttsChance !== null && <MiniStatCard icon="🎯" label="BTTS" value={typeof bttsChance === "number" ? `${bttsChance}%` : bttsChance} />}
          {matchType && <MiniStatCard icon="🔥" label={t.matchType || "Match Type"} value={matchType} />}
        </div>
      )}

      {overUnder25 && (
        <div style={{ marginBottom: 20 }}>
          <div style={styles.sectionTitle}>{t.overUnderGoals || "Goals Over/Under 2.5"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ padding: "14px 16px", background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.3)", borderRadius: 6, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#8a8a8a", marginBottom: 4 }}>Over 2.5</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#22c55e", fontFamily: "inherit" }}>{overUnder25.over}</div>
            </div>
            <div style={{ padding: "14px 16px", background: "rgba(96, 165, 250, 0.08)", border: "1px solid rgba(96, 165, 250, 0.3)", borderRadius: 6, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#8a8a8a", marginBottom: 4 }}>Under 2.5</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#60a5fa", fontFamily: "inherit" }}>{overUnder25.under}</div>
            </div>
          </div>
        </div>
      )}

      {scorelineProbabilities && scorelineProbabilities.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={styles.sectionTitle}>🎯 TOP SCORELINES</div>
          {scorelineProbabilities.slice(0, 3).map((s: any, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 700, color: "#fff", minWidth: 36 }}>{s.score}</span>
              <div style={{ flex: 1, background: "#1a1a22", borderRadius: 4, height: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(s.prob * 2.5, 100)}%`, background: i === 0 ? "#F0B429" : i === 1 ? "#888" : "#555", borderRadius: 4, transition: "width 0.6s ease" }} />
              </div>
              <span style={{ fontSize: 12, color: "#F0B429", fontWeight: 700, minWidth: 36, textAlign: "right" }}>{s.prob}%</span>
            </div>
          ))}
        </div>
      )}

      {keyFactors && keyFactors.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={styles.sectionTitle}>{t.keyFactors}</div>
          {keyFactors.map((f, i) => <FactorRow key={i} factor={f} match={match} />)}
        </div>
      )}

      {playerWatch && playerWatch.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={styles.sectionTitle}>
            <Star size={11} style={{ verticalAlign: "middle", marginRight: 6 }} />
            {t.playerWatch}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {playerWatch.map((p: any, i: number) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, padding: "10px 14px", background: "#111117", borderRadius: 8, borderLeft: `3px solid ${p.team === "home" ? "#F0B429" : "#60a5fa"}` }}>
                <div style={{ textAlign: "center", minWidth: 44 }}>
                  <div style={{ fontSize: 13, color: p.team === "home" ? "#F0B429" : "#60a5fa" }}>⭐</div>
                  <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{p.team === "home" ? t.homeTeam : t.awayTeam}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{p.name} <span style={{ fontSize: 10, color: "#8a8a8a", fontWeight: 400 }}>· {p.role}</span></div>
                  <div style={{ fontSize: 12, color: "#b0b0b0", marginTop: 3, lineHeight: 1.5 }}>{p.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {injuries && injuries.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={styles.sectionTitle}>
            <AlertTriangle size={11} style={{ verticalAlign: "middle", marginRight: 6 }} />
            {t.injuriesSusp}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {injuries.map((p: any, i: number) => {
              const statusColor = p.status === "Out" ? "#ff3030" : p.status === "Suspended" ? "#facc15" : "#f97316";
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, padding: "10px 14px", background: "#111117", borderRadius: 8, borderLeft: `3px solid ${statusColor}` }}>
                  <div style={{ textAlign: "center", minWidth: 44 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: statusColor, padding: "2px 6px", background: statusColor + "20", borderRadius: 4 }}>{p.status}</div>
                    <div style={{ fontSize: 9, color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>{p.team === "home" ? t.homeTeam : t.awayTeam}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#b0b0b0", marginTop: 3, lineHeight: 1.5 }}>{p.impact}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(teamStats?.home || teamStats?.away || oddsFound?.homeOdds) && (
        <div style={{ marginBottom: 18, padding: "12px 16px", background: "rgba(240,180,41,0.03)", border: "1px solid rgba(240,180,41,0.08)", borderRadius: 8 }}>
          <div style={{ fontSize: 9, color: "#F0B429", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8, fontWeight: 700, opacity: 0.5 }}>📡 Data Sources</div>
          {oddsFound?.homeOdds && (
            <div style={{ fontSize: 11, color: "#8a8a8a", marginBottom: 6 }}>
              <span style={{ color: "#facc15" }}>💰</span> Bookmaker odds: Home <span style={{ color: "#e2e2e2" }}>{oddsFound.homeOdds}</span> · Draw <span style={{ color: "#e2e2e2" }}>{oddsFound.drawOdds}</span> · Away <span style={{ color: "#e2e2e2" }}>{oddsFound.awayOdds}</span>
            </div>
          )}
          {teamStats?.home && (
            <div style={{ fontSize: 11, color: "#8a8a8a", marginBottom: 4 }}>
              <span style={{ color: "#F0B429" }}>🏠</span> {match.home}: {[
                teamStats.home.possession != null && `${teamStats.home.possession}% poss`,
                teamStats.home.onTargetPG != null && `${teamStats.home.onTargetPG} SoT/g`,
                teamStats.home.bigChancesPG != null && `${teamStats.home.bigChancesPG} BC/g`,
                teamStats.home.cleanSheets != null && `${teamStats.home.cleanSheets} CS`,
              ].filter(Boolean).join(" · ")}
            </div>
          )}
          {teamStats?.away && (
            <div style={{ fontSize: 11, color: "#8a8a8a" }}>
              <span style={{ color: "#60a5fa" }}>✈️</span> {match.away}: {[
                teamStats.away.possession != null && `${teamStats.away.possession}% poss`,
                teamStats.away.onTargetPG != null && `${teamStats.away.onTargetPG} SoT/g`,
                teamStats.away.bigChancesPG != null && `${teamStats.away.bigChancesPG} BC/g`,
                teamStats.away.cleanSheets != null && `${teamStats.away.cleanSheets} CS`,
              ].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      )}

      {watchOut && (
        <div style={{ marginBottom: 8 }}>
          <div style={styles.sectionTitle}>
            <AlertTriangle size={11} style={{ verticalAlign: "middle", marginRight: 6 }} />
            {t.watchOut}
          </div>
          <div style={styles.watchOutBox}>{watchOut}</div>
        </div>
      )}

    </>
  );
}

function FormBadges({ form }) {
  const colors = { W: "#22c55e", L: "#ef4444", D: "#facc15" };
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {form.slice(0, 5).map((r, i) => (
        <span key={i} style={{
          width: 22, height: 22, borderRadius: "50%",
          background: colors[r] || "#666",
          color: r === "D" ? "#222" : "#fff",
          fontSize: 11, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "inherit",
        }}>{r}</span>
      ))}
    </div>
  );
}

function OddsCell({ label, odd }) {
  return (
    <div style={{ padding: "14px 10px", background: "#16161E", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, textAlign: "center", transition: "border-color 0.15s" }}>
      <div style={{ fontSize: 10, color: "#444", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "inherit" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#F0B429", fontFamily: "inherit" }}>{odd}</div>
    </div>
  );
}

function MiniStatCard({ icon, label, value }) {
  return (
    <div style={{ padding: "12px 10px", background: "#16161E", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em", marginBottom: 6, textTransform: "uppercase", fontFamily: "inherit" }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0" }}>
        <span style={{ marginRight: 4 }}>{icon}</span>{value}
      </div>
    </div>
  );
}

function RecentAnalysis({ match, result, t }) {
  const { verdict, keyMoments, starPlayer, reasoning, context } = result;
  return (
    <>
      <div className="bm8-scoreboard" style={styles.scoreboard}>
        <div style={styles.sbTeam}><TeamBadge name={match.home} crest={match.homeCrest} size={56} /><div style={styles.sbName}>{match.home}</div></div>
        <div style={styles.sbNumbers}>
          <span className="bm8-score-num" style={styles.sbNum}>{match.homeScore}</span>
          <span style={styles.sbDash}>—</span>
          <span className="bm8-score-num" style={styles.sbNum}>{match.awayScore}</span>
        </div>
        <div style={styles.sbTeam}><TeamBadge name={match.away} crest={match.awayCrest} size={56} /><div style={styles.sbName}>{match.away}</div></div>
      </div>
      <div style={styles.predLabel}>{t.fullTime} · {match.date}</div>

      <div style={styles.section}><div style={styles.verdictBox}>{verdict}</div></div>
      {starPlayer && (
      <div style={styles.section}>
        <div style={styles.sectionTitle}><Star size={11} style={{ verticalAlign: "middle", marginRight: 6 }} />{t.starPlayer}</div>
        <div style={styles.starPlayerBox}>
          <div style={styles.spName}>{starPlayer.name} <span style={styles.spTeam}>· {starPlayer.team}</span></div>
          <div style={styles.spWhy}>{starPlayer.why}</div>
        </div>
      </div>
      )}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>{t.keyMoments}</div>
        {(keyMoments || []).map((km, i) => (
          <div key={i} style={styles.momentRow}>
            <div style={styles.momentLabel}>{km.label}</div>
            <div style={styles.momentDetail}>{km.detail}</div>
          </div>
        ))}
      </div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}><Brain size={11} style={{ verticalAlign: "middle", marginRight: 6 }} />{t.analysis}</div>
        <div style={styles.reasoningBox}>{reasoning}</div>
      </div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>{t.whatThisMeans}</div>
        <div style={styles.contextBox}>{context}</div>
      </div>
    </>
  );
}

function ProbBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#666" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#777" }}>{Math.round(value)}%</span>
      </div>
      <div style={{ width: "100%", height: 5, background: "#16161E", borderRadius: 3, overflow: "hidden" }}>
        <div className="bar-fill" style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

function FactorRow({ factor, match }) {
  const tagColor = factor.favors === "home" ? "#F0B429" : factor.favors === "away" ? "#60a5fa" : "#666";
  const tagBg = factor.favors === "home" ? "rgba(240,180,41,0.12)" :
    factor.favors === "away" ? "rgba(96,165,250,0.12)" : "rgba(100,100,100,0.12)";
  const arrow = factor.favors === "home" ? `← ${match.home}` :
    factor.favors === "away" ? `${match.away} →` : "—";
  return (
    <div style={styles.factorRow}>
      <div style={styles.factorHead}>
        <span style={styles.factorLabel}>{factor.label}</span>
        <span style={{ ...styles.factorTag, color: tagColor, background: tagBg }}>{arrow}</span>
      </div>
      <div style={styles.factorDetail}>{factor.detail}</div>
    </div>
  );
}

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&family=Playfair+Display:wght@700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A0A0F; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fillBar { from { width: 0; } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes chatBounce {
    0%, 100% { transform: scale(1); }
    30%      { transform: scale(1.2); }
    60%      { transform: scale(0.95); }
  }
  @keyframes octopusPlay {
    0%   { transform: translateY(0px)   rotate(-3deg) scaleX(1);    }
    20%  { transform: translateY(-10px) rotate(0deg)  scaleX(1.04); }
    40%  { transform: translateY(-16px) rotate(3deg)  scaleX(1);    }
    60%  { transform: translateY(-10px) rotate(1deg)  scaleX(0.96); }
    80%  { transform: translateY(-4px)  rotate(-2deg) scaleX(1.02); }
    100% { transform: translateY(0px)   rotate(-3deg) scaleX(1);    }
  }
  @keyframes octopusGlow {
    0%, 100% { filter: drop-shadow(0 0 12px rgba(240,180,41,0.5)); }
    50%       { filter: drop-shadow(0 0 22px rgba(240,180,41,0.9)); }
  }
  .chat-icon { animation: chatBounce 1.8s ease-in-out infinite; }
  .octopus-btn { animation: octopusPlay 3.5s ease-in-out infinite, octopusGlow 2s ease-in-out infinite; }
  .octopus-btn:hover { animation-play-state: paused; transform: scale(1.12); transition: transform 0.2s; }
  .bar-fill { animation: fillBar 1s cubic-bezier(0.16, 1, 0.3, 1); }
  .pulsing { animation: pulse 1.4s ease-in-out infinite; }
  .match-row:hover { border-color: rgba(240, 180, 41, 0.35) !important; background: rgba(240, 180, 41, 0.025) !important; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
  .refresh-btn:hover:not(:disabled) { background: #F0B429 !important; color: #000 !important; box-shadow: 0 0 20px rgba(240,180,41,0.4); }
  .refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .predict-btn:hover:not(:disabled) { box-shadow: 0 0 20px rgba(240,180,41,0.5) !important; transform: translateY(-1px); }
  input:focus { outline: none; border-color: rgba(240, 180, 41, 0.5) !important; }

  .mobile-menu-btn { display: none; }
  .lang-selector-desktop { display: flex; }

  @media (max-width: 1024px) {
    .desktop-nav { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
    .lang-selector-desktop { display: none !important; }
  }

  @media (max-width: 768px) {
    /* Nav */
    .bm8-nav-inner { padding: 0 14px !important; gap: 10px !important; }

    /* Hero — keep enough height so background-size:cover shows same zoom as desktop */
    .bm8-hero { padding: 28px 16px 24px !important; min-height: 220px !important; }
    .bm8-hero-bg { transform: scale(1.0) !important; }
    .bm8-hero-title { font-size: clamp(22px, 6vw, 30px) !important; margin-bottom: 8px !important; }
    .bm8-hero-sub { font-size: 12px !important; max-width: 100% !important; }
    .bm8-hero-label { font-size: 10px !important; margin-bottom: 10px !important; }

    /* Main content */
    .bm8-main { padding: 0 12px 28px !important; }

    /* Search row */
    .bm8-search-row { flex-direction: row !important; gap: 8px !important; margin-bottom: 12px !important; }
    .bm8-search-row > div:first-child { flex: 1; min-width: 0 !important; }
    .bm8-refresh-btn { padding: 10px 14px !important; flex-shrink: 0; }
    .bm8-refresh-btn span { display: none !important; }

    /* Filter tabs (Upcoming / Today / Completed) */
    .bm8-filter-tabs { margin-bottom: 12px !important; }
    .bm8-filter-tab { font-size: 11px !important; padding: 9px 4px !important; }

    /* Hide date dropdowns — league is already in tab bar */
    .bm8-filter-row { display: none !important; }

    /* Status bar */
    .bm8-status-bar { font-size: 10px !important; margin-bottom: 10px !important; padding-bottom: 10px !important; }

    /* Date headers */
    .bm8-date-header { font-size: 10px !important; padding: 12px 0 6px !important; }

    /* Match rows — symmetrical grid layout */
    .match-row { padding: 10px 10px !important; gap: 6px !important; margin-bottom: 6px !important; }
    .bm8-m-teams {
      display: grid !important;
      grid-template-columns: 1fr 38px 1fr !important;
      gap: 2px !important;
      align-items: center !important;
    }
    .bm8-m-home {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 5px !important;
      overflow: hidden !important;
      min-width: 0 !important;
    }
    .bm8-m-away {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 5px !important;
      overflow: hidden !important;
      min-width: 0 !important;
    }
    .bm8-team-name {
      font-size: 12px !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      min-width: 0 !important;
      flex-shrink: 1 !important;
    }
    .bm8-league-tag { display: none !important; }
    .bm8-m-right { gap: 0 !important; }
    .bm8-predict-btn { padding: 7px 11px !important; font-size: 11px !important; }
    .bm8-m-time { font-size: 11px !important; min-width: 36px !important; }

    /* Modal */
    .bm8-modal-overlay { padding: 16px 10px !important; }
    .bm8-modal-body { padding: 16px !important; }
    .bm8-scoreboard { padding: 20px 10px !important; gap: 8px !important; }
    .bm8-score-num { font-size: clamp(38px, 13vw, 60px) !important; }
    .bm8-footer { padding: 16px 12px !important; gap: 8px !important; flex-wrap: wrap !important; }
    .parlay-strategy-grid { grid-template-columns: 1fr !important; }
    .parlay-picks-grid { grid-template-columns: 1fr !important; }
  }
`;

const styles = {
  app: { minHeight: "100vh", background: "#0A0A0F", color: "#e2e2e2", fontFamily: "-apple-system, 'Inter', 'Segoe UI', 'Noto Sans SC', sans-serif" },

  topNav: { background: "rgba(10,10,15,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "0", position: "sticky", top: 0, zIndex: 50, height: 56 },
  navInner: { maxWidth: 1400, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 24, height: "100%" },
  brandBlock: { display: "flex", alignItems: "center", gap: 1, flexShrink: 0 },
  logoImg: { height: 46, width: "auto", display: "block" },
  tagline: { fontFamily: "'Playfair Display', serif", fontSize: 25, fontWeight: 700, color: "#fff", letterSpacing: "0.08em", whiteSpace: "nowrap" as const },
  navSubtitle: { fontSize: 8, fontWeight: 500, color: "#fff", letterSpacing: "0.22em", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const },

  navLinks: { display: "flex", gap: 4, flex: 1, justifyContent: "center" },
  navLink: { background: "transparent", border: "none", color: "#888", fontSize: 12, fontFamily: "inherit", cursor: "pointer", padding: "7px 16px", borderRadius: 8, position: "relative", transition: "all 0.15s", whiteSpace: "nowrap" as const, fontWeight: 500 },
  navLinkActive: { color: "#000", background: "linear-gradient(135deg, #C9A84C, #F0B429)", fontWeight: 700, boxShadow: "0 2px 10px rgba(240,180,41,0.4)" },
  navLinkUnderline: { display: "none" },

  menuBtn: { display: "none", background: "linear-gradient(135deg, #C9A84C, #F0B429)", border: "none", color: "#000", padding: 8, borderRadius: 6, cursor: "pointer", alignItems: "center", justifyContent: "center", marginLeft: "auto", boxShadow: "0 2px 10px rgba(240,180,41,0.4)" },

  mobileMenu: { position: "absolute", top: "100%", left: 0, right: 0, background: "#0D0D12", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "12px 12px", display: "flex", flexDirection: "column", gap: 4 },
  mobileNavLink: { background: "transparent", border: "none", color: "#8a8a8a", fontSize: 14, fontFamily: "inherit", cursor: "pointer", padding: "12px 8px", textAlign: "left", borderRadius: 6 },
  mobileNavLinkActive: { color: "#F0B429", background: "rgba(240,180,41,0.1)", fontWeight: 500 },

  langSelector: { display: "flex", alignItems: "center", gap: 4, padding: "4px 6px 4px 10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, flexShrink: 0 },
  langBtn: { padding: "4px 9px", background: "transparent", border: "none", color: "#555", fontSize: 11, fontFamily: "inherit", letterSpacing: "0.05em", fontWeight: 600, cursor: "pointer", borderRadius: 4, transition: "all 0.15s" },
  langBtnActive: { background: "rgba(240,180,41,0.15)", color: "#F0B429" },
  langDropdownBtn: { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" },
  langDropdownMenu: { position: "absolute" as const, top: "calc(100% + 6px)", right: 0, background: "#1a1a22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden", zIndex: 999, minWidth: 150, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" },
  langDropdownItem: { display: "block", width: "100%", padding: "10px 16px", background: "transparent", border: "none", color: "#ccc", fontSize: 13, fontFamily: "inherit", cursor: "pointer", textAlign: "left" as const, transition: "background 0.1s" },
  langDropdownItemActive: { color: "#F0B429", background: "rgba(240,180,41,0.08)" },

  hero: { maxWidth: 1400, margin: "0 auto", padding: "40px 24px 32px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" as const, position: "relative", overflow: "hidden" },
  heroContent: { flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center" },
  heroLabel: { display: "inline-flex", alignItems: "center", gap: 10, fontSize: 12, letterSpacing: "0.35em", color: "#F0B429", fontFamily: "inherit", marginBottom: 18, fontWeight: 500, textTransform: "uppercase" as const, opacity: 0.8 },
  heroDot: { width: 7, height: 7, borderRadius: "50%", background: "#F0B429", boxShadow: "0 0 8px rgba(240,180,41,0.6)" },
  heroTitle: { fontFamily: "inherit", fontSize: "clamp(32px, 4.6vw, 53px)", lineHeight: 1.1, letterSpacing: "-0.01em", fontWeight: 800, marginBottom: 14, color: "#fff" },
  heroEm: { fontStyle: "italic", background: "linear-gradient(90deg, #F0B429, #ff9500)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  heroSub: { fontSize: 15, lineHeight: 1.65, color: "#aaa", maxWidth: 440 },
  heroStats: { display: "flex", gap: 16, flexShrink: 0 },
  heroStat: { textAlign: "center" as const, padding: "16px 24px", background: "#111117", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10 },
  heroStatVal: { fontSize: 26, fontWeight: 800, color: "#F0B429" },
  heroStatLbl: { fontSize: 10, color: "#555", letterSpacing: "0.1em", marginTop: 4 },

  main: { maxWidth: 1400, margin: "0 auto", padding: "0 24px 48px" },

  searchRow: { display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" },
  searchWrap: { position: "relative", flex: 1, minWidth: 280 },
  searchIcon: { position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" },
  searchInput: { width: "100%", padding: "13px 48px", background: "#111117", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#e2e2e2", fontSize: 13, fontFamily: "inherit", transition: "all 0.15s" },
  searchClear: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", width: 26, height: 26, padding: 0, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", color: "#8a8a8a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  refreshBtn: { display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", background: "transparent", border: "1.5px solid rgba(240,180,41,0.5)", color: "#F0B429", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", borderRadius: 8, transition: "all 0.15s", whiteSpace: "nowrap" as const },

  filterTabs: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginBottom: 18, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" },
  filterTab: { padding: "12px 8px", background: "#111117", border: "none", borderRight: "1px solid rgba(255,255,255,0.06)", fontSize: 13, fontWeight: 500, color: "#555", fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s", textAlign: "center" as const },
  filterTabActive: { background: "rgba(240,180,41,0.1)", color: "#F0B429", fontWeight: 600 },

  leagueRow: { display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" },
  leagueChip: { padding: "6px 14px", background: "transparent", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6, fontSize: 12, color: "#555", fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s" },
  leagueChipActive: { borderColor: "#F0B429", color: "#F0B429", background: "rgba(240,180,41,0.08)" },
  filterRow: { display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" as const },
  filterGroup: { display: "flex", flexDirection: "column" as const, gap: 6, flex: 1, minWidth: 180 },
  filterLabel: { fontSize: 11, fontWeight: 600, color: "#555", letterSpacing: "0.05em" },
  filterSelect: { padding: "10px 14px", background: "#111117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#e2e2e2", fontSize: 13, fontFamily: "inherit", cursor: "pointer", appearance: "auto" as const },

  statusBar: { fontSize: 11, fontFamily: "inherit", letterSpacing: "0.05em", marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#aaa" },

  matchList: { display: "flex", flexDirection: "column", gap: 0 },
  dateHeader: { display: "flex", alignItems: "center", gap: 14, padding: "18px 0 8px", fontSize: 12, color: "#fff", letterSpacing: "0.15em", textTransform: "uppercase" as const },
  dateHeaderLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.04)" },
  matchRow: { display: "flex", alignItems: "center", padding: "14px 18px", background: "#111117", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, transition: "all 0.15s", animation: "fadeUp 0.4s ease-out both", gap: 16, marginBottom: 8 },

  mTime: { fontSize: 13, color: "#fff", minWidth: 42, fontVariantNumeric: "tabular-nums" as const },
  mTeams: { display: "flex", alignItems: "center", gap: 14, flex: 1, justifyContent: "center" },
  mTeamName: { fontFamily: "inherit", fontSize: 16, color: "#fff", fontWeight: 600 },
  vsChip: { fontSize: 11, color: "#F0B429", background: "#16161E", padding: "3px 8px", borderRadius: 4, fontWeight: 700 },
  scoreBadge: { fontFamily: "inherit", fontSize: 16, color: "#fff", fontWeight: 700, padding: "4px 14px", background: "rgba(240,180,41,0.08)", border: "1px solid rgba(240,180,41,0.2)", borderRadius: 6 },

  mRight: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  mLeagueTag: { fontSize: 11, padding: "4px 10px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, fontFamily: "inherit", letterSpacing: "0.1em", fontWeight: 500, color: "#fff" },
  predictBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", background: "linear-gradient(135deg, #C9A84C, #F0B429)", color: "#000", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.08em", boxShadow: "0 2px 12px rgba(240,180,41,0.35)" },

  empty: { textAlign: "center", padding: 60, color: "#444", fontSize: 14 },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 100, padding: "40px 16px", overflowY: "auto" },
  modalPanel: { background: "#111117", border: "1px solid rgba(240,180,41,0.15)", borderRadius: 12, width: "100%", maxWidth: 760, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", animation: "fadeUp 0.3s ease-out" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  modalLabel: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 10, letterSpacing: "0.25em", color: "#F0B429", fontFamily: "inherit", fontWeight: 600 },
  closeBtn: { background: "transparent", border: "none", color: "#555", cursor: "pointer", padding: 6, display: "flex", borderRadius: 4 },
  modalBody: { padding: "24px" },
  loadingBox: { display: "flex", alignItems: "center", justifyContent: "center", gap: 14, padding: "60px 20px", fontSize: 14, color: "#666" },
  errorBox: { padding: 16, background: "rgba(240,180,41,0.06)", border: "1px solid rgba(240,180,41,0.2)", borderRadius: 8, fontSize: 13, color: "#F0B429" },

  confidenceRow: { display: "flex", justifyContent: "flex-end", marginBottom: 16 },
  confidenceBadge: { fontSize: 10, letterSpacing: "0.3em", fontFamily: "inherit", fontWeight: 700, padding: "5px 14px", border: "1px solid", borderRadius: 3 },

  scoreboard: { display: "flex", alignItems: "center", padding: "32px 20px", background: "linear-gradient(135deg, rgba(240,180,41,0.05) 0%, transparent 60%)", border: "1px solid rgba(240,180,41,0.12)", borderRadius: 10, marginBottom: 12, gap: 16 },
  sbTeam: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" },
  sbName: { fontFamily: "inherit", fontSize: 16, lineHeight: 1.2, color: "#e0e0e0", fontWeight: 600 },
  sbNumbers: { display: "flex", alignItems: "center", gap: 14, fontFamily: "inherit", flex: 1.2, justifyContent: "center" },
  sbNum: { fontSize: "clamp(52px, 9vw, 88px)", lineHeight: 1, color: "#fff", fontWeight: 800 },
  sbDash: { fontSize: "clamp(38px, 7vw, 62px)", color: "#F0B429", lineHeight: 1 },
  predLabel: { fontSize: 10, letterSpacing: "0.3em", color: "#444", fontFamily: "inherit", textAlign: "center", marginBottom: 28, textTransform: "uppercase" as const },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 10, letterSpacing: "0.25em", color: "#555", fontFamily: "inherit", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.05)", fontWeight: 700, textTransform: "uppercase" as const },

  reasoningBox: { padding: "16px 18px", background: "#16161E", borderLeft: "3px solid #F0B429", borderRadius: "0 8px 8px 0", fontSize: 13, lineHeight: 1.75, color: "#888" },
  factorRow: { padding: "14px 16px", background: "#111117", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, marginBottom: 8 },
  factorHead: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 6, flexWrap: "wrap" },
  factorLabel: { fontFamily: "inherit", fontSize: 14, color: "#e0e0e0", fontWeight: 600 },
  factorTag: { fontSize: 10, letterSpacing: "0.1em", padding: "2px 8px", borderRadius: 4, fontFamily: "inherit", fontWeight: 600 },
  factorDetail: { fontSize: 12, lineHeight: 1.6, color: "#666" },
  watchOutBox: { padding: "14px 18px", background: "rgba(240,180,41,0.05)", border: "1px solid rgba(240,180,41,0.18)", borderRadius: 8, fontSize: 13, lineHeight: 1.6, color: "#b09050" },
  verdictBox: { padding: "16px 18px", background: "rgba(240,180,41,0.04)", border: "1px solid rgba(240,180,41,0.1)", borderRadius: 8, fontSize: 14, lineHeight: 1.65, color: "#e0e0e0" },
  starPlayerBox: { padding: "16px 18px", background: "rgba(240,180,41,0.05)", border: "1px solid rgba(240,180,41,0.12)", borderRadius: 8 },
  spName: { fontFamily: "inherit", fontSize: 17, color: "#fff", marginBottom: 4, fontWeight: 700 },
  spTeam: { fontSize: 11, color: "#555", fontFamily: "inherit", letterSpacing: "0.1em", fontStyle: "normal", fontWeight: 400 },
  spWhy: { fontSize: 12, lineHeight: 1.6, color: "#777" },
  momentRow: { padding: "12px 16px", background: "#16161E", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 8, marginBottom: 6 },
  momentLabel: { fontFamily: "inherit", fontSize: 13, color: "#e0e0e0", marginBottom: 3, fontWeight: 600 },
  momentDetail: { fontSize: 12, lineHeight: 1.5, color: "#666" },
  contextBox: { padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, fontSize: 13, lineHeight: 1.6, color: "#777" },

  footer: { maxWidth: 1400, margin: "60px auto 0", padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "center", alignItems: "center", gap: 12, fontSize: 10, letterSpacing: "0.2em", color: "#333", fontFamily: "inherit", flexWrap: "wrap" },
  footerDot: { fontSize: 5, color: "#F0B429" },
};
