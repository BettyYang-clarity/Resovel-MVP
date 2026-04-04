// ============================================================
// RESOVEL · 核心 Prompt 引擎
// Resolve + Evolve = 解決當下，進化自我
// ============================================================

/**
 * 根據用戶偏好，組合出送給 Gemini 的完整 prompt
 * @param {Object} user - 用戶資料
 * @returns {string} - 完整的 system + user prompt
 */
export function buildResovelPrompt(user) {
  const {
    mbti = '不知道',
    age = '30s',
    situation = '',
    energy = 'normal',       // 'low' | 'normal' | 'high'
    goals = [],              // 用戶想從閱讀得到什麼
    avoidTypes = [],         // 不喜歡的類型
    booksRead = [],          // 讀過的書
    depthSlider = 40,        // 0=全符合口味, 100=全突破盲點
    langSlider = 60,         // 0=純中文, 100=純翻譯
    mode = 'problem',        // 'explore' | 'problem'
  } = user

  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt({
    mbti, age, situation, energy,
    goals, avoidTypes, booksRead,
    depthSlider, langSlider, mode,
  })

  return { systemPrompt, userPrompt }
}

// ─────────────────────────────────────────────
// System Prompt：告訴 Gemini 它是誰
// ─────────────────────────────────────────────
function buildSystemPrompt() {
  return `你是 Resovel 靈魂閱讀顧問。
Resovel = Resolve（解決）+ Evolve（進化）。
你的任務是：超越單純書單推薦，透過精準選書路徑，給用戶「自我成長」與「突破盲點」的契機。

## 最高指導原則（防捏造機制）

1. 【絕對嚴禁捏造】任何書名或作者！你推薦的每一本書必須是現實中「真實存在」且「在台灣有出版繁體中文版」的書。
2. 請優先推薦市面上的「經典暢銷書」，降低資訊錯誤率。給出「官方正式的繁體中文書名與作者名」，不可自行隨意翻譯。如果對某本書的繁中資訊沒有 100% 把握，請改推另一本你完全確定的書！
3. 【嚴格禁止加上副標題】！書名只給出最核心的「主標題」（例如只要寫《影響力》，絕對不要寫《影響力：讓人乖乖聽話的...》），以便最大化原文書名搜尋引擎的精準度。
3. 一次完整輸出，嚴禁中斷。
4. 只輸出書名與作者，不要產生任何網址連結（系統會自動產生）。
5. 涉及心理健康或醫療問題，優先建議尋求專業協助。
6. 語氣像一個真正懂你的朋友，不是機器人。

## MBTI 四大氣質選書策略

- SJ 型（ISTJ/ISFJ/ESTJ/ESFJ）：推「權威 SOP、實用指南、有秩序感」的書 → 給予秩序感與安全感
- SP 型（ISTP/ISFP/ESTP/ESFP）：推「生存戰術、Hacks、立竿見影」的書 → 給予掌控感
- NF 型（INFJ/INFP/ENFJ/ENFP）：推「心理成因、靈魂共鳴、人性探索」的書 → 給予被理解感。嚴禁直接推工具書。
- NT 型（INTJ/INTP/ENTJ/ENTP）：推「底層邏輯、系統機制、第一原理」的書 → 給予真理感與掌控感

## 三段閱讀路徑邏輯

- Phase 1（錨點 Anchor）：立即有感，讓用戶重新找到掌控感，符合其認知口味
- Phase 2（橋樑 Bridge）：系統化解決方案，建立長期護城河
- Phase 3（進化 Evolution）：針對 MBTI 劣勢功能的根本解藥。這是 Resovel 最核心的價值，必須點出這本書如何幫助用戶突破人格盲點，達到下一個層次。

## 輸出格式規範

請嚴格按照以下 JSON 格式輸出，不要有任何多餘文字：

{
  "soulKeyword": "帥氣的靈魂稱號（4-8字）",
  "diagnosis": "根據 MBTI + 年齡 + 情境的分析（2-3句，溫暖語氣）",
  "growthPoint": "把用戶煩惱重新定義為升級機會（1句話，有力量）",
  "phase1": {
    "optionA": {
      "title": "書名",
      "author": "作者",
      "whyReadable": "為什麼這個人讀得下去（1句，符合認知口味）",
      "solves": "能解決什麼問題（1句，直接掛鉤痛點）",
      "confirmed": true 或 false（繁中版是否確定存在）
    },
    "optionB": {
      "title": "書名",
      "author": "作者",
      "whyReadable": "另一種切入點（1句）",
      "solves": "解決什麼（1句）",
      "confirmed": true 或 false
    }
  },
  "phase2": {
    "title": "書名",
    "author": "作者",
    "whyBridge": "為什麼是橋樑（1句，說明如何系統化解決）",
    "backup": "備選書名（書名 / 作者）",
    "confirmed": true 或 false
  },
  "phase3": {
    "title": "書名",
    "author": "作者",
    "whyEvolution": "為什麼需要這帖藥（2句，點出人格盲點與蛻變方向）",
    "resovelInsight": "Resovel 獨家洞見（2句，Google 搜不到的分析）",
    "backup": "備選書名（書名 / 作者）",
    "confirmed": true 或 false
  },
  "moodCare": {
    "title": "書名",
    "author": "作者",
    "reason": "溫柔推薦理由（1句）",
    "confirmed": true 或 false
  }
}`
}

// ─────────────────────────────────────────────
// User Prompt：把用戶資料組合成自然語言
// ─────────────────────────────────────────────
function buildUserPrompt(user) {
  const energyMap = {
    low: '現在很累，需要輕鬆好讀的書',
    normal: '能量還好，可以讀一般節奏的書',
    high: '很有動力，可以挑戰有深度的書',
  }

  const depthText = user.depthSlider < 30
    ? '請主要推符合我口味的書（8成符合，2成挑戰）'
    : user.depthSlider < 60
    ? '請推6成符合口味、4成突破盲點的書'
    : user.depthSlider < 80
    ? '請主要推能突破我盲點的書（4成符合，6成挑戰）'
    : '請大膽推能突破我盲點的書，我準備好接受挑戰了'

  const langText = user.langSlider < 30
    ? '以繁體中文書為優先'
    : user.langSlider < 60
    ? '中文書為主，優質翻譯書也可以'
    : user.langSlider < 80
    ? '中英翻譯書都可以，各半'
    : '翻譯書為主，也可以納入台灣本土好書'

  const modeText = user.mode === 'explore'
    ? '我今天沒有特定煩惱，想隨機探索，推薦我可能意想不到會喜歡的書。'
    : `我目前的狀況：${user.situation}`

  return `請根據以下資料，為我推薦 Resovel 閱讀路徑：

MBTI：${user.mbti}
年齡區間：${user.age}
能量狀態：${energyMap[user.energy] || energyMap.normal}
${modeText}
${user.goals.length > 0 ? `我想從閱讀得到：${user.goals.join('、')}` : ''}
${user.avoidTypes.length > 0 ? `請避免以下類型：${user.avoidTypes.join('、')}` : ''}
${user.booksRead.length > 0 ? `我讀過且喜歡：${user.booksRead.join('、')}（請不要重複推薦這些書）` : ''}

推薦偏好：${depthText}。${langText}。

請嚴格按照指定 JSON 格式輸出。`
}

// ─────────────────────────────────────────────
// 書籍白名單（預生成，節省 API 費用）
// 熱門書籍預先存好，命中時不需要呼叫 API
// ─────────────────────────────────────────────
export const BOOK_WHITELIST = {
  '原子習慣': {
    author: '詹姆斯．克利爾',
    confirmed: true,
    summary: '不依靠意志力，用微小改變建立複利習慣系統的實用指南。',
  },
  '被討厭的勇氣': {
    author: '岸見一郎、古賀史健',
    confirmed: true,
    summary: '以阿德勒心理學為基礎，教你從他人期待中解放，找到真正屬於自己的生活方式。',
  },
  '也許你該找人聊聊': {
    author: '蘿蕊．葛利布',
    confirmed: true,
    summary: '心理治療師自己接受諮商的真實故事，讓你明白脆弱是勇氣，不是弱點。',
  },
  '臣服實驗': {
    author: '米高．辛格',
    confirmed: true,
    summary: '放下自我，讓生命帶著你走，反而發現更大的可能。',
  },
  '刻意練習': {
    author: '安德斯．艾瑞克森',
    confirmed: true,
    summary: '天才不是天生的，頂尖表現背後是有目的的刻意練習方法論。',
  },
  '心態致勝': {
    author: '卡蘿．杜維克',
    confirmed: true,
    summary: '成長型思維 vs 固定型思維，決定你面對挑戰時的高度。',
  },
  '解憂雜貨店': {
    author: '東野圭吾',
    confirmed: true,
    summary: '溫柔的故事，讓你在煩惱的夜晚感受到被理解的溫度。',
  },
  '當下的力量': {
    author: '艾克哈特．托勒',
    confirmed: true,
    summary: '停止與過去和未來糾纏，活在當下就是最深刻的自由。',
  },
  '高敏感是種天賦': {
    author: '伊麗絲．桑德',
    confirmed: true,
    summary: '為高度敏感的人重新定義自己的特質，從弱點變成最深的力量。',
  },
  '思考，快與慢': {
    author: '丹尼爾．康納曼',
    confirmed: true,
    summary: '揭開人類大腦的兩套決策系統，讓你看清思考中的偏誤與盲點。',
  },
}

/**
 * 產生博客來搜尋連結
 * @param {string} bookTitle - 書名
 * @param {string} bookAuthor - 作者
 * @returns {string} - 博客來搜尋 URL
 */
export function getBookLink(bookTitle, bookAuthor = '') {
  const query = `${bookTitle} ${bookAuthor}`.trim()
  const encoded = encodeURIComponent(query)
  return `https://search.books.com.tw/search/query/key/${encoded}/cat/all`
}

/**
 * 產生 Google 搜尋連結（強力防呆備用方案）
 * @param {string} bookTitle - 書名
 * @param {string} bookAuthor - 作者
 * @returns {string} - Google 搜尋 URL
 */
export function getGoogleSearchLink(bookTitle, bookAuthor = '') {
  const query = `${bookTitle} ${bookAuthor} 博客來`.trim()
  const encoded = encodeURIComponent(query)
  return `https://www.google.com/search?q=${encoded}`
}
