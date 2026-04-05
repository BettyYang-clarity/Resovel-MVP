// ============================================================
// RESOVEL · Gemini API 呼叫器（v2 · 安全版）
// 改成呼叫自己的後端，不再直接暴露 API Key
// ============================================================

import { buildResovelPrompt, BOOK_WHITELIST, getGoogleSearchLink } from './resovel-prompt.js'

export async function getResovelRecommendation(user) {
  const cacheKey = buildCacheKey(user)
  const cached = getCache(cacheKey)
  if (cached) {
    console.log('✅ 快取命中')
    return cached
  }

  const { systemPrompt, userPrompt } = buildResovelPrompt(user)

  // 呼叫後端，不再直接呼叫 Gemini
  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error || '推薦服務暫時無法使用')
  }

  const { result } = await response.json()
  const enriched = enrichResult(result)
  setCache(cacheKey, enriched)
  return enriched
}

function enrichResult(parsed) {
  const enrichBook = (book) => {
    if (!book?.title) return book
    const whitelist = BOOK_WHITELIST[book.title]
    return {
      ...book,
      bookLink: getBookLink(book.title),
      googleLink: getGoogleSearchLink(book.title, book.author),
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

function buildCacheKey(user) {
  return `resovel_${user.mbti}_${user.age}_${user.energy}_${user.mode}_${user.depthSlider}_${user.langSlider}`
    .replace(/\s+/g, '_').toLowerCase()
}

function getCache(key) {
  try {
    const item = sessionStorage.getItem(key)
    if (!item) return null
    const { data, expiry } = JSON.parse(item)
    if (Date.now() > expiry) { sessionStorage.removeItem(key); return null }
    return data
  } catch { return null }
}

function setCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({
      data, expiry: Date.now() + 24 * 60 * 60 * 1000,
    }))
  } catch { }
}

function getBookLink(title) {
  return `https://search.books.com.tw/search/query/key/${encodeURIComponent(title)}/cat/all`
}
