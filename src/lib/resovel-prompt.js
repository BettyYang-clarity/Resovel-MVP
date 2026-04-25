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
function buildWhitelistText() {
  return Object.entries(BOOK_WHITELIST)
    .map(([title, info]) => {
      const tag = info.tags?.length ? `[${info.tags.join('/')}]` : ''
      return `《${title}》${info.author}${tag}`
    })
    .join('、')
}

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
}

## 精選書單（已驗證繁體中文版）
Phase 1（立即對策）的 optionA/B、Phase 2（系統優化）、MoodCare（心情急救）請優先從以下已驗證書單中選書。只有在書單中完全找不到適合的書時，才可推薦書單以外的書：
${buildWhitelistText()}

【Phase 3 例外規則】Phase 3（根本進化）是 Resovel 最核心的價值，需要針對此 MBTI 的劣勢功能（inferior function）推薦最精準的進化書。如果以上書單中有完全符合的，優先選用；若沒有最精準的，請自由推薦最能幫助此 MBTI 突破人格盲點的書，不受上方書單限制。`
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

/**
 * 白名單查詢（含模糊比對）
 * 解決 Gemini 回傳書名標點略有差異時 miss 的問題
 * 例：'思考快與慢' 也能比對到 '思考，快與慢'
 */
export function lookupWhitelist(title) {
  if (!title) return null

  // 第一層：完全比對（最快）
  if (BOOK_WHITELIST[title]) return BOOK_WHITELIST[title]

  // 第二層：去除標點後比對
  const clean = (s) => s.replace(/[，。！？：、·\s「」《》【】\-]/g, '').toLowerCase()
  const cleanTitle = clean(title)

  const matchedKey = Object.keys(BOOK_WHITELIST).find(
    key => clean(key) === cleanTitle
  )

  if (matchedKey) {
    console.log(`🔍 模糊比對命中：「${title}」→「${matchedKey}」`)
    return BOOK_WHITELIST[matchedKey]
  }

  // 第三層：包含比對（書名是白名單的子字串，或反過來）
  const partialMatch = Object.keys(BOOK_WHITELIST).find(key => {
    const cleanKey = clean(key)
    return cleanKey.includes(cleanTitle) || cleanTitle.includes(cleanKey)
  })

  if (partialMatch) {
    console.log(`🔍 部分比對命中：「${title}」→「${partialMatch}」`)
    return BOOK_WHITELIST[partialMatch]
  }

  return null
}

export const BOOK_WHITELIST = {
  '原子習慣': {
    author: '詹姆斯．克利爾',
    confirmed: true,
    tags: ['SJ', 'SP', 'NT', '習慣', '職涯'],
    summary: '不依靠意志力，用微小改變建立複利習慣系統的實用指南。',
  },
  '被討厭的勇氣': {
    author: '岸見一郎、古賀史健',
    confirmed: true,
    tags: ['NF', 'NT', '心理成長', '人際關係'],
    summary: '以阿德勒心理學為基礎，教你從他人期待中解放，找到真正屬於自己的生活方式。',
  },
  '也許你該找人聊聊': {
    author: '蘿蕊．葛利布',
    confirmed: true,
    tags: ['NF', '心理成長', '情感療癒', '迷茫'],
    summary: '心理治療師自己接受諮商的真實故事，讓你明白脆弱是勇氣，不是弱點。',
  },
  '臣服實驗': {
    author: '米高．辛格',
    confirmed: true,
    tags: ['NF', 'Phase3進化', '靈性成長'],
    summary: '放下自我，讓生命帶著你走，反而發現更大的可能。',
  },
  '刻意練習': {
    author: '安德斯．艾瑞克森',
    confirmed: true,
    tags: ['NT', 'SJ', '職涯', '技能成長'],
    summary: '天才不是天生的，頂尖表現背後是有目的的刻意練習方法論。',
  },
  '心態致勝': {
    author: '卡蘿．杜維克',
    confirmed: true,
    tags: ['NF', 'NT', 'SJ', '成長型思維', '職涯'],
    summary: '成長型思維 vs 固定型思維，決定你面對挑戰時的高度。',
  },
  '解憂雜貨店': {
    author: '東野圭吾',
    confirmed: true,
    tags: ['NF', 'SP', 'MoodCare', '情感療癒'],
    summary: '溫柔的故事，讓你在煩惱的夜晚感受到被理解的溫度。',
  },
  '當下的力量': {
    author: '艾克哈特．托勒',
    confirmed: true,
    tags: ['NF', 'Phase3進化', '情感療癒', '迷茫'],
    summary: '停止與過去和未來糾纏，活在當下就是最深刻的自由。',
  },
  '高敏感是種天賦': {
    author: '伊麗絲．桑德',
    confirmed: true,
    tags: ['NF', 'Phase3進化', '自我認識'],
    summary: '為高度敏感的人重新定義自己的特質，從弱點變成最深的力量。',
  },
  '思考，快與慢': {
    author: '丹尼爾．康納曼',
    confirmed: true,
    tags: ['NT', 'Phase3進化', '底層邏輯'],
    summary: '揭開人類大腦的兩套決策系統，讓你看清思考中的偏誤與盲點。',
  },
  "牧羊少年奇幻之旅": {
    "author": "保羅．科爾賀",
    "confirmed": true,
    "summary": "故事性強，充滿寓意，能輕易觸動你對生命意義的探索，讓你在輕鬆閱讀中找到共鳴。"
  },
  "深夜加油站遇見蘇格拉底": {
    "author": "丹．米爾曼",
    "confirmed": true,
    "summary": "透過師徒對話，引導你思考生命的本質與存在的意義，提供一個溫和的哲學啟迪。"
  },
  "安靜是種超能力": {
    "author": "蘇珊．坎恩",
    "confirmed": true,
    "summary": "這本書能幫助你理解身為內向者的獨特優勢，系統性地梳理你的內在能量，找到與世界互動的平衡點。"
  },
  "小王子": {
    "author": "安東尼．聖修伯里",
    "confirmed": true,
    "summary": "在疲憊時，重溫這個充滿詩意與哲理的故事，能溫柔地滋養你的心靈，提醒你生命中最珍貴的本質。"
  },
  "活出意義來": {
    "author": "維克多．弗蘭克",
    "confirmed": true,
    "summary": "這本書將帶你探索人類在極端困境中如何尋找並創造意義，與你對生命深層價值的追求產生共鳴。"
  },
  "設計你的人生": {
    "author": "比爾．柏內特 / 戴夫．埃文斯",
    "confirmed": true,
    "summary": "這本書以設計思考的彈性框架，引導你系統性地探索與原型化各種人生可能性，而非僵硬的SOP。"
  },
  "蛤蟆先生去看心理師": {
    "author": "羅伯特．狄保德",
    "confirmed": true,
    "summary": "這是一本溫柔而富有洞察力的故事，能讓你以一種被理解的方式，面對內在的情緒與成長課題。"
  },
  "脆弱的力量": {
    "author": "布芮尼．布朗",
    "confirmed": true,
    "summary": "身為一個情感豐富的INFP，這本書將讓你感受到被理解，並看見展現真實自我的勇氣。"
  },
  "依戀關係": {
    "author": "艾米爾．列維、瑞秋．赫勒",
    "confirmed": true,
    "summary": "這本書提供了一套系統性的依戀理論框架，幫助你理解自己在關係中的行為模式，以及為何會吸引特定類型的人。"
  },
  "與成功有約": {
    "author": "史蒂芬．柯維",
    "confirmed": true,
    "tags": ["NF", "SJ"],
    "summary": "INFP 的劣勢功能是「外向思考」（Te），這讓你在面對現實的複雜性或需要明確界線時，容易感到力不從心。這本書能幫助你將內在的價值觀（Fi）轉化為外在的原則與行動（Te），學會如何有策略地為自己和關係設定方向，不再只是被動感受，而是主動創造你所嚮往的連結。"
  },
  '創作，是心靈療癒的旅程': {
    author: '茱莉亞．卡麥隆',
    confirmed: true,
    tags: ['NF', 'SP', '創意', '自我探索'],
    summary: '透過十二週課程療癒內在藝術家，重新找回創作的勇氣和靈感。',
  },
  "影響力": {
    "author": "羅伯特．席爾迪尼",
    "confirmed": true,
    "summary": "你天生擅長與人連結，這本書能幫助你理解人際互動的深層心理機制，符合你對人性的探索慾。"
  },
  "心流": {
    "author": "米哈里．契克森米哈伊",
    "confirmed": true,
    "summary": "你追求意義與深度，這本書能讓你探索在達成目標過程中，如何體驗到最佳的心理狀態與內幾喜悅。"
  },
  "底層邏輯": {
    "author": "劉潤",
    "confirmed": true,
    tags: ['NT', 'SJ', '商業', '底層邏輯'],
    "summary": "這本書將提供你一套系統性的思維框架，幫助你從根本上理解問題、規劃策略，為達成目標建立長期且堅實的護城河。"
  },
  "同理心": {
    "author": "羅曼．克茲納里奇",
    "confirmed": true,
    "summary": "作為一個天生善於連結他人的 ENFP，這本書將帶你探索同理心的力量與深度。"
  },
  "創意自信": {
    "author": "湯姆．凱利, 大衛．凱利",
    "confirmed": true,
    "summary": "ENFP的你擁有豐富的想像力與源源不絕的點子，但有時會苦於如何將這些宏大願景具體化並付諸實踐。這本書能幫助你學習設計思考的實用方法，將抽象的創意轉化為可執行的計畫。"
  },
  "深度工作力": {
    "author": "Cal Newport",
    "confirmed": true,
    tags: ['NT', 'SJ', '職涯', '效率'],
    "summary": "你天生擅長專注與深度思考，這本書能幫助你找回高效能的狀態，重新掌控工作節奏。"
  },
  "原則": {
    "author": "Ray Dalio",
    "confirmed": true,
    "summary": "你追求底層邏輯與系統化思考，這本書能提供一套清晰的決策框架，幫助你釐清複雜問題。"
  },
  "思考的藝術": {
    "author": "羅爾夫．杜伯里",
    "confirmed": true,
    "tags": ["NT"],
    "summary": "這本書能滿足你對清晰思維和邏輯謬誤的分析渴望，以精煉的篇幅直指核心。"
  },
  "雜訊": {
    "author": "丹尼爾．康納曼、奧利維．希波尼、凱斯．桑斯坦",
    "confirmed": true,
    "tags": ["NT"],
    "summary": "它將帶你深入探討系統性錯誤的根源，滿足你對底層機制的探索慾，挑戰既有認知。"
  },
  "人慈": {
    "author": "魯特格．布雷格曼",
    "confirmed": true,
    "tags": ["NT", "NF"],
    "summary": "INTP 傾向於理性分析，有時會忽略人類情感與社會連結的深層影響。這本書將帶你重新審視人性本質，幫助你更全面地理解自己與他人，彌補外向情感的盲點。"
  },
  "孫子兵法": {
    "author": "孫武",
    "confirmed": true,
    "summary": "這部經典能讓你從最深層的戰略思維，理解如何預測、規劃與執行目標，建立一套無懈可擊的系統化解決方案，為你的目標建立長期護城河。"
  },
  "情商": {
    "author": "丹尼爾．高曼",
    "confirmed": true,
    "summary": "ENTJ的你天生具備卓越的邏輯與執行力，但有時在追求目標的過程中，可能會忽略人際互動的細膩情感或內在價值觀的連結。這本書將幫助你理解情緒的運作機制，將情感智慧融入你的領導與決策中，讓你的影響力更全面、更具人性溫度。"
  },
  "非暴力溝通": {
    "author": "馬歇爾．盧森堡",
    "confirmed": true,
    tags: ['NF', 'SJ', '人際關係', '溝通'],
    "summary": "這本書提供了一套明確的溝通框架，幫助你在人際關係中表達真實需求，化解衝突，讓你在各種情境下都能建立健康的連結。"
  },
  "致富心態": {
    "author": "摩根．豪瑟",
    "confirmed": true,
    "tags": ["NT", "財務"],
    "summary": "理財不只是數學問題，更是心理學。本書將帶你探索人類金錢行為背後的底層思維，幫助你跳脫短視，建立長期的護城河。"
  },
  "反脆弱": {
    "author": "納西姆．尼可拉斯．塔雷伯",
    "confirmed": true,
    "summary": "理解並接納世界的不確定性，這本書將教導你如何設計一套系統，不只經得起打擊，還能在波動中獲益與成長。"
  },
  "自卑與超越": {
    "author": "阿爾弗雷德．阿德勒",
    "confirmed": true,
    "summary": "這本經典著作將引導你探索自卑感的根源，並將其轉化為驅動你追求超越與自我實現的強大動力。"
  },
  "第二座山": {
    "author": "大衛．布魯克斯",
    "confirmed": true,
    "summary": "當你達到世俗的成功後感到空虛，這本書將引導你思考人生的第二階段，從「追求自我」轉向「為他人奉獻」，尋找深層的意義。"
  },
  "僧人心態": {
    "author": "傑．謝帝",
    "confirmed": true,
    "summary": "將古老的智慧轉化為現代人可執行的實用習慣，帶領你排除雜音，找回內在的平靜與專注力。"
  },
  "象與騎象人": {
    "author": "強納森．海德特",
    "confirmed": true,
    "summary": "深入探討理智與情感的拉扯，這本書將為你提供一套框架，幫助你更和諧地引導內在的衝突，做出更好的決策。"
  },
  "心靈的傷，身體會記住": {
    "author": "貝索．范德寇",
    "confirmed": true,
    "summary": "如果你感到長期疲憊或莫名焦慮，這本書將帶你理解創傷如何影響大腦與身體，提供一條溫柔的復原之路。"
  },
  "給予": {
    "author": "亞當．格蘭特",
    "confirmed": true,
    "summary": "顛覆傳統的競爭思維，這本書用實證指出，在人際網絡中做一個聰明的「給予者」，往往能帶來更大的成功與滿足感。"
  },
  "最有生產力的一年": {
    "author": "克里斯．貝利",
    "confirmed": true,
    "summary": "這不是枯燥的SOP，而是結合作者親身實驗的結果，能幫助你找到最適合自己的能量管理模式與工作節奏。"
  },
  "人性的弱點": {
    "author": "戴爾．卡內基",
    "confirmed": true,
    "summary": "一本歷久彌新的經典，系統性地剖析人類的社交心理學，幫助你在各種溝通情境中都能得心應手。"
  },
  "你可以不只是上班族": {
    "author": "查爾斯．韓第",
    "confirmed": true,
    "summary": "引導你重新思考工作的意義，探索如何在組織之外，打造具有自主性與創造力的第二曲線。"
  },
  "誰說人是理性的": {
    "author": "丹．艾瑞利",
    "confirmed": true,
    "tags": ["NT", "SP"],
    "summary": "這本書將揭露那些影響我們消費與決策的非理性偏誤，滿足你對探索大腦運作機制的渴望。"
  },
  "習慣致富": {
    "author": "湯姆．柯利, 麥可．雅德尼",
    "confirmed": true,
    "summary": "為你整理出成功人士的具體生活習慣，提供一套明確可執行的行動清單，幫助你系統化地升級自己的人生。"
  },
  "一流的人如何保持顛峰": {
    "author": "布萊德．史托伯格",
    "confirmed": true,
    "summary": "打破「越努力越好」的迷思，這本書分享了頂尖表現者如何交替運用壓力和休息，科學地管理你的身心能量。"
  },
  "為什麼要睡覺？": {
    "author": "馬修．沃克",
    "confirmed": true,
    "summary": "一本徹底改變你對睡眠認知的科學指南，它將從底層邏輯告訴你，為什麼好的睡眠是你最有效能的長期護城河。"
  },

  // ── SP型（生存戰術、立竿見影） ──
  "零秒思考": { "author": "赤羽雄二", "confirmed": true, "summary": "用最簡單的A4紙筆法，讓你在60秒內整理思緒，立即行動。" },
  "超速學習": { "author": "史考特．楊", "confirmed": true, "summary": "用超高效的學習工法在短時間內精通任何技能，適合想快速突破的人。" },
  "5秒法則": { "author": "梅爾．羅賓斯", "confirmed": true, "summary": "用5-4-3-2-1倒數打破拖延迴路，讓行動力立刻提升。" },
  "生時間": { "author": "傑克．娜普、約翰．澤拉斯基", "confirmed": true, "summary": "每天設計一個讓你真正投入的亮點，用系統方法奪回對時間的掌控權。" },
  "複利效應": { "author": "達倫．哈迪", "confirmed": true, "summary": "每天微小的一致性選擇，複利累積出截然不同的人生結果。" },
  "異類": { "author": "麥爾坎．葛拉威爾", "confirmed": true, "summary": "拆解成功背後被忽視的機遇與積累，讓你看清楚自己的優勢從何而來。" },
  "引爆趨勢": { "author": "麥爾坎．葛拉威爾", "confirmed": true, "summary": "小改變如何引發大流行，理解這個機制讓你掌握影響力的槓桿點。" },
  "讓天賦自由": { "author": "肯尼斯．羅賓森", "confirmed": true, "summary": "找到你真正的天賦所在，讓熱情與才能交匯的地方成為你的舞台。" },
  "全新銷售": { "author": "丹尼爾．品克", "confirmed": true, "summary": "每個人都在銷售自己的想法，這本書教你用移動、說服、影響他人的現代技藝。" },

  // ── SJ型（秩序感、SOP、實用指南） ──
  "搞定！": { "author": "大衛．艾倫", "confirmed": true, "summary": "GTD系統：把大腦裡的任務全倒出來，建立可信賴的外部系統，讓你從清單焦慮中解放。" },
  "清單革命": { "author": "阿圖．葛文德", "confirmed": true, "summary": "一張清單如何拯救生命、避免錯誤——這是系統化思維最強大的實踐。" },
  "少，但是更好": { "author": "葛瑞格．麥基昂", "confirmed": true, "summary": "Essentialism：專注最重要的事，精準地去做，而不是努力地把所有事都做。" },
  "最重要的事，只有一件": { "author": "蓋瑞．凱勒", "confirmed": true, "summary": "每次問自己：現在最重要的那一件事是什麼？做好它，其餘的事情自然迎刃而解。" },
  "執行力的修練": { "author": "克里斯．麥切斯尼、西恩．柯維、吉姆．哈林", "confirmed": true, "summary": "4DX執行框架：定義最重要的目標、追蹤引領指標、建立記分板、問責到位。" },
  "管理的實踐": { "author": "彼得．杜拉克", "confirmed": true, "summary": "管理學之父奠定現代管理基礎的經典，讓你理解真正有效管理者的思維框架。" },
  "有效的管理者": { "author": "彼得．杜拉克", "confirmed": true, "summary": "不是靠天賦而是靠習慣成為有效的人——杜拉克最影響深遠的個人效能指南。" },

  // ── NT型補強（底層邏輯、大systems） ──
  "窮查理的普通常識": { "author": "查理．蒙格", "confirmed": true, "summary": "跨領域思維模型的集大成，蒙格用一生積累的心智模型教你做出更好的決策。" },
  "黑天鵝效應": { "author": "納西姆．尼可拉斯．塔雷伯", "confirmed": true, "summary": "我們極度低估了極端罕見事件的衝擊力——這本書讓你重新設計對不確定性的應對。" },
  "21世紀的21堂課": { "author": "尤瓦爾．哈拉瑞", "confirmed": true, "summary": "面對AI、假新聞、氣候危機，21世紀的我們最需要學會的思考工具與生存智慧。" },
  "人類大歷史": { "author": "尤瓦爾．哈拉瑞", "confirmed": true, "summary": "從宇宙誕生到現代社會，一部讓你重新理解自己是誰、從哪裡來的壯闊人類故事。" },
  "有限與無限的遊戲": { "author": "詹姆斯．卡斯", "confirmed": true, "summary": "人生中有兩種遊戲：有限遊戲求勝，無限遊戲為了繼續玩——選擇哪種遊戲，決定了你的人生格局。" },
  "零對一": { "author": "彼得．提爾", "confirmed": true, "summary": "創造全新事物才是真正的進步，這本書教你如何從零建立壟斷性的突破。" },
  "從A到A+": { "author": "吉姆．柯林斯", "confirmed": true, "summary": "為什麼有些企業能從優秀躍升為卓越？底層答案比大多數人想像的更樸實。" },
  "先問，為什麼": { "author": "賽門．西奈克", "confirmed": true, "summary": "從Why開始思考，才能找到真正驅動你和他人的核心動力，而不只是表面的What和How。" },
  "無限賽局": { "author": "賽門．西奈克", "confirmed": true, "summary": "把眼光從短期競爭拉到無限視野，你的對手是昨天的自己，而不是同行。" },

  // ── 劣勢功能進化書（Phase 3補缺） ──
  "正念的奇蹟": { "author": "一行禪師", "confirmed": true, "summary": "用最簡單的洗碗冥想，帶你回到當下這一刻——給慣於活在頭腦裡的人最好的解藥。" },
  "薩提爾的對話練習": { "author": "李儀婷", "confirmed": true, "summary": "台灣最實用的薩提爾模式指南，幫助你在最日常的關係中練習真正的連結與溝通。" },
  "12道人生法則": { "author": "喬丹．彼得森", "confirmed": true, "summary": "為混亂的世界帶來秩序，從神話與心理學提煉出有力量且有責任感的生活原則。" },
  "設計思考改造世界": { "author": "提姆．布朗", "confirmed": true, "summary": "用設計師的思維解決人類最棘手的問題——創意不是天賦，而是一種可以學習的過程。" },
  "創意是一種習慣": { "author": "特維拉．薩普", "confirmed": true, "summary": "百老匯傳奇編舞家的創作秘密：創意不是靈感，而是每天打開盒子的紀律。" },
  "未來在等待的人才": { "author": "丹尼爾．品克", "confirmed": true, "summary": "右腦時代來臨，同理心、設計感、說故事的能力，才是下一個10年最稀缺的競爭優勢。" },

  // ── 情境補充（財務、創業） ──
  "富爸爸窮爸爸": { "author": "羅勃特．清崎", "confirmed": true, "summary": "打破打工心態，理解資產與負債的底層邏輯，讓金錢為你工作。" },
  "有錢人想的和你不一樣": { "author": "T. Harv Eker", "confirmed": true, "summary": "你的財富藍圖決定了你能賺多少錢，這本書幫你重新設定內在的金錢信念。" },
  "精實創業": { "author": "艾瑞克．萊斯", "confirmed": true, "summary": "用最小可行產品快速驗證假設，在真實市場中學習與迭代，而不是盲目執行完整計畫。" },
  "巴比倫最富有的人": { "author": "喬治．克拉森", "confirmed": true, "summary": "用古代巴比倫寓言包裝的永恆財富法則：先支付給自己，讓錢滾錢。" },

  // ── MoodCare 專屬情緒療癒 ──
  "在咖啡冷掉之前": { "author": "川口俊和", "confirmed": true, "summary": "溫柔的時光旅行故事，讓你在一杯咖啡的時間裡，重新審視那些說不出口的遺憾與思念。" },
  "遇見未知的自己": { "author": "張德芬", "confirmed": true, "summary": "透過一個女性的生命旅程，探索潛意識、情緒與真實自我，是台灣最多人讀的心靈成長小說。" },
  "我想跟你好好說話": { "author": "賴佩霞", "confirmed": true, "summary": "學會薩提爾溝通法，讓你在最親近的關係裡，開口就能被理解而不是引爆衝突。" },
  "情緒勒索": { "author": "周慕姿", "confirmed": true, "summary": "辨識並脫離那些讓你長期委屈、自我懷疑的情緒操控關係，重新建立健康的人際邊界。" },
  "一個人的朝聖": { "author": "蕾秋．喬伊斯", "confirmed": true, "summary": "一個普通老人為了信守承諾，憑一雙走路的腳橫越英格蘭──在行走中和解，與自己，與遺憾。" },
  "愛的藝術": { "author": "艾瑞希．佛洛姆", "confirmed": true, "summary": "愛不是一種感覺，而是一種選擇與練習——這本書從根本重新定義了愛的意義與能力。" },
  "廚房": { "author": "吉本芭娜娜", "confirmed": true, "summary": "日本最溫柔的療癒小說，用食物和日常記錄失去與重生，陪你渡過任何說不清楚的悲傷。" },
  "挪威的森林": { "author": "村上春樹", "confirmed": true, "summary": "孤獨、愛與失落的成年禮——當你需要一本書靜靜地陪著你，這本永遠都在。" }
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
