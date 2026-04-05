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

  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userPrompt }),
    })

    const payload = await safeReadJson(response)

    if (!response.ok) {
      throw new Error(payload?.error || '推薦服務暫時無法使用')
    }

    if (!payload?.result) {
      throw new Error('推薦結果格式不完整')
    }

    const enriched = enrichResult(payload.result)
    setCache(cacheKey, enriched)
    return enriched
  } catch (error) {
    if (!isLocalDev()) throw error

    console.warn('Using local mock recommendation for manual QA:', error)
    const enriched = enrichResult(createLocalMockResult(user))
    setCache(cacheKey, enriched)
    return enriched
  }
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
  return [
    normalizeValue(user.mbti),
    normalizeValue(user.age),
    normalizeValue(user.energy),
    normalizeValue(user.mode),
    normalizeSlider(user.depthSlider),
    normalizeSlider(user.langSlider),
    normalizeSituation(user.situation),
    normalizeList(user.goals),
    normalizeList(user.avoidTypes),
    normalizeList(user.booksRead),
  ].join('|')
}

function getCache(key) {
  try {
    const item = sessionStorage.getItem(key)
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
    sessionStorage.setItem(key, JSON.stringify({
      data,
      expiry: Date.now() + 24 * 60 * 60 * 1000,
    }))
  } catch {}
}

function getBookLink(title) {
  return `https://search.books.com.tw/search/query/key/${encodeURIComponent(title)}/cat/all`
}

async function safeReadJson(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    throw new Error('推薦服務回傳格式異常')
  }
}

function isLocalDev() {
  return typeof window !== 'undefined'
    && ['localhost', '127.0.0.1'].includes(window.location.hostname)
}

function createLocalMockResult(user) {
  const moodLabel = {
    low: '需要被安放',
    normal: '正在尋找平衡',
    high: '想把能量導向更值得的地方',
  }[user.energy] || '正在尋找下一步'

  const modeLabel = user.mode === 'problem'
    ? '先整理眼前問題，再找到能走下去的節奏。'
    : '先順著好奇心探索，讓下一本書自己浮出來。'

  const pools = {
    inward: [
      { title: '一間自己的房間', author: 'Virginia Woolf', reason: '適合把感受收回自己身上，重新整理內在空間。' },
      { title: '小王子', author: 'Antoine de Saint-Exupery', reason: '用很輕的方式，把情緒重新安放回心裡。' },
      { title: '挪威的森林', author: '村上春樹', reason: '陪你慢慢辨認孤獨、親密與失落的輪廓。' },
      { title: '在咖啡冷掉之前', author: '川口俊和', reason: '如果你想回望某些遺憾，這本很適合當過渡。' },
    ],
    outward: [
      { title: '被討厭的勇氣', author: '岸見一郎、古賀史健', reason: '很適合整理關係、選擇與自我定位。' },
      { title: '原子習慣', author: 'James Clear', reason: '如果你想立刻調整生活節奏，這本很有推進力。' },
      { title: '逆思維', author: 'Adam Grant', reason: '幫你把既有想法拆開，重新找更好的行動方向。' },
      { title: '深度工作力', author: 'Cal Newport', reason: '適合能量高、想把自己重新聚焦的人。' },
    ],
    intuitive: [
      { title: '牧羊少年奇幻之旅', author: 'Paulo Coelho', reason: '適合正在找方向感的人，把感受轉成前進的勇氣。' },
      { title: '人類大歷史', author: 'Yuval Noah Harari', reason: '如果你想把眼前困惑拉到更大的視角來看，這本很適合。' },
      { title: '薛西弗斯的神話', author: 'Albert Camus', reason: '在意義感搖晃的時候，這本能陪你撐住思考。' },
    ],
    practical: [
      { title: '最高休息法', author: '久賀谷亮', reason: '適合先把注意力與精神狀態穩定下來。' },
      { title: '子彈思考整理術', author: 'Ryder Carroll', reason: '如果你需要結構感，這本能很快幫你回到軌道。' },
      { title: '工作的法則', author: 'Richard Templar', reason: '想讓日常重新有秩序時，這本會很實用。' },
    ],
  }

  const hash = hashString([
    user.mbti,
    user.mode,
    user.energy,
    user.age,
    user.depthSlider,
    user.langSlider,
    ...(user.goals || []),
    ...(user.avoidTypes || []),
  ].join('|'))

  const primaryPool = /I/.test(user.mbti) ? pools.inward : pools.outward
  const secondaryPool = /N/.test(user.mbti) ? pools.intuitive : pools.practical

  const optionA = pickFromPool(primaryPool, hash)
  const optionB = pickFromPool(secondaryPool, hash + 1, optionA.title)
  const phase2 = pickFromPool(primaryPool.concat(secondaryPool), hash + 2, optionA.title, optionB.title)
  const phase3 = pickFromPool(secondaryPool.concat(primaryPool), hash + 3, optionA.title, optionB.title, phase2.title)
  const moodCare = pickFromPool(pools.inward.concat(pools.practical), hash + 4, optionA.title, optionB.title, phase2.title, phase3.title)

  return {
    soulKeyword: `${user.mbti} 的閱讀探索`,
    diagnosis: `這是本地驗收用的示意結果。你現在的狀態像是「${moodLabel}」，適合透過閱讀慢慢整理自己。`,
    growthPoint: modeLabel,
    phase1: {
      optionA,
      optionB,
    },
    phase2,
    phase3: {
      ...phase3,
      insight: '你不一定要立刻解決全部問題，但可以先確認自己想守住什麼。',
    },
    moodCare,
  }
}

function pickFromPool(pool, index, ...excludeTitles) {
  const filtered = pool.filter(book => !excludeTitles.includes(book.title))
  return filtered[index % filtered.length]
}

function hashString(input) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function normalizeValue(value) {
  return String(value || '').trim().toLowerCase()
}

function normalizeList(list = []) {
  return [...list]
    .map(item => normalizeValue(item))
    .filter(Boolean)
    .sort()
    .join(',')
}

function normalizeSlider(value) {
  const num = Number(value || 0)
  return String(Math.round(num / 10) * 10)
}

function normalizeSituation(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .slice(0, 120)
}
