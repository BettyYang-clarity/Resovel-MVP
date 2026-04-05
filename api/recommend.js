// ============================================================
// RESOVEL · Vercel Serverless Function
// API Key 保護層：把 Gemini API Key 藏在後端
// 檔案路徑：api/recommend.js
// ============================================================

export default async function handler(req, res) {

  // 只允許 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 防止濫用：檢查來源
  const origin = req.headers.origin || ''
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  // 簡單的 Rate Limiting（每個 IP 每分鐘最多 5 次）
  // 之後可以換成 Upstash Redis 做更完整的限流
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const rateLimitKey = `${ip}_${Math.floor(Date.now() / 60000)}`
  if (!global._rateLimit) global._rateLimit = {}
  global._rateLimit[rateLimitKey] = (global._rateLimit[rateLimitKey] || 0) + 1
  if (global._rateLimit[rateLimitKey] > 5) {
    return res.status(429).json({ error: '請求太頻繁，請稍後再試' })
  }

  try {
    const { systemPrompt, userPrompt } = req.body

    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: '缺少必要參數' })
    }

    const cacheKey = buildPromptCacheKey(systemPrompt, userPrompt)
    const cached = getPromptCache(cacheKey)
    if (cached) {
      return res.status(200).json({ result: cached })
    }

    const pending = getPendingPromptRequest(cacheKey)
    if (pending) {
      const result = await pending
      return res.status(200).json({ result })
    }

    // API Key 在後端，前端永遠看不到
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

    const result = await withPendingPromptRequest(cacheKey, async () => {
      const response = await fetch(GEMINI_URL, {
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
            temperature: 0.5,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || 'Gemini API 錯誤')
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) {
        throw new Error('Gemini 沒有回傳內容')
      }

      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setPromptCache(cacheKey, parsed)
      return parsed
    })

    return res.status(200).json({ result })

  } catch (error) {
    console.error('recommend handler error:', error)
    return res.status(500).json({ error: '伺服器錯誤，請稍後再試' })
  }
}

function buildPromptCacheKey(systemPrompt, userPrompt) {
  return hashString(`${normalizePrompt(systemPrompt)}\n---\n${normalizePrompt(userPrompt)}`)
}

function getPromptCache(key) {
  if (!global._promptCache) global._promptCache = {}
  const entry = global._promptCache[key]
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    delete global._promptCache[key]
    return null
  }
  return entry.data
}

function setPromptCache(key, data) {
  if (!global._promptCache) global._promptCache = {}
  global._promptCache[key] = {
    data,
    expiry: Date.now() + 10 * 60 * 1000,
  }
}

function hashString(input) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i)
    hash |= 0
  }
  return String(Math.abs(hash))
}

function normalizePrompt(input = '') {
  return String(input)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function isAllowedOrigin(origin) {
  if (!origin) return true

  return [
    'http://localhost:5173',
    'https://resovel-mvp.vercel.app',
  ].includes(origin) || /^https:\/\/resovel-[a-z0-9-]+\.vercel\.app$/i.test(origin)
}

function getPendingPromptRequest(key) {
  if (!global._pendingPromptCache) global._pendingPromptCache = {}
  return global._pendingPromptCache[key] || null
}

async function withPendingPromptRequest(key, factory) {
  if (!global._pendingPromptCache) global._pendingPromptCache = {}
  const promise = Promise.resolve().then(factory)
  global._pendingPromptCache[key] = promise

  try {
    return await promise
  } finally {
    delete global._pendingPromptCache[key]
  }
}
