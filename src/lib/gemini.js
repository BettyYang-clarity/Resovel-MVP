// ============================================================
// RESOVEL · Gemini API 呼叫器
// 含白名單快取邏輯，節省 API 費用
// ============================================================

import { buildResovelPrompt, BOOK_WHITELIST, getBookLink, getGoogleSearchLink } from './resovel-prompt.js'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent'

/**
 * 主要呼叫函式：先查快取，再呼叫 API
 * @param {Object} user - 用戶資料
 * @param {string} apiKey - 你的 Gemini API Key
 * @returns {Object} - Resovel 書單結果
 */
export async function getResovelRecommendation(user, apiKey) {
  // ── Step 1：建立快取 key（根據關鍵用戶資料）
  const cacheKey = buildCacheKey(user)

  // ── Step 2：查 localStorage 快取（同樣條件24小時內不重複呼叫）
  const cached = getCache(cacheKey)
  if (cached) {
    console.log('✅ 快取命中，節省一次 API 呼叫')
    return cached
  }

  // ── Step 3：呼叫 Gemini API
  const { systemPrompt, userPrompt } = buildResovelPrompt(user)

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [{
        role: 'user',
        parts: [{ text: userPrompt }],
      }],
      generationConfig: {
        temperature: 0.7,        // 稍微有創意，但不要太隨機
        maxOutputTokens: 8192,
        responseMimeType: 'application/json', // 直接要求 JSON 輸出
      },
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(`Gemini API 錯誤：${err.error?.message || response.status}`)
  }

  const data = await response.json()
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!rawText) throw new Error('Gemini 沒有回傳內容')

  // ── Step 4：解析 JSON，補上博客來連結
  const result = parseAndEnrich(rawText)

  // ── Step 5：存入快取 24 小時
  setCache(cacheKey, result)

  return result
}

// ─────────────────────────────────────────────
// 解析 Gemini 輸出的 JSON，補上額外資訊
// ─────────────────────────────────────────────
function parseAndEnrich(rawText) {
  let parsed
  try {
    // 🔍 強化版清理：直接抓取第一個 { 和最後一個 } 之間的內容
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const clean = jsonMatch ? jsonMatch[0] : rawText;
    parsed = JSON.parse(clean)
  } catch (e) {
    console.error('Gemini Raw Output:', rawText);
    throw new Error('Gemini 輸出格式錯誤，無法解析 JSON')
  }

  // 幫每本書加上博客來連結 + 白名單資料
  const enrichBook = (book) => {
    if (!book || !book.title) return book
    const whitelist = BOOK_WHITELIST[book.title]
    return {
      ...book,
      bookLink: getBookLink(book.title, book.author),
      googleLink: getGoogleSearchLink(book.title, book.author),
      // 白名單的書確認度更高
      confirmed: whitelist ? true : book.confirmed,
      whitelistSummary: whitelist?.summary || null,
    }
  }

  return {
    ...parsed,
    phase1: {
      optionA: enrichBook(parsed.phase1?.optionA),
      optionB: enrichBook(parsed.phase1?.optionB),
    },
    phase2: enrichBook(parsed.phase2),
    phase3: enrichBook(parsed.phase3),
    moodCare: enrichBook(parsed.moodCare),
    generatedAt: new Date().toISOString(),
  }
}

// ─────────────────────────────────────────────
// 快取工具函式
// ─────────────────────────────────────────────
function buildCacheKey(user) {
  // 只用影響推薦結果的關鍵欄位產生 key，加入 v2 強制清除舊快取
  const key = `resovel_v2_${user.mbti}_${user.age}_${user.energy}_${user.mode}_${user.depthSlider}_${user.langSlider}`
  return key.replace(/\s+/g, '_').toLowerCase()
}

function getCache(key) {
  try {
    const item = sessionStorage.getItem(key) // 用 sessionStorage，關掉分頁就清除
    if (!item) return null
    const { data, expiry } = JSON.parse(item)
    if (Date.now() > expiry) {
      sessionStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCache(key, data) {
  try {
    const expiry = Date.now() + 24 * 60 * 60 * 1000 // 24小時
    sessionStorage.setItem(key, JSON.stringify({ data, expiry }))
  } catch {
    // sessionStorage 滿了就不快取，不影響主流程
  }
}


