// ============================================================
// RESOVEL · MVP 主程式
// 用法：把這個檔案放到 Antigravity 專案裡
// 需要安裝：npm install react react-dom
// ============================================================

import { useState, useEffect } from 'react'
import { getResovelRecommendation } from './lib/gemini.js'

// ── 你的 Gemini API Key（之後移到 .env 檔）
// 在 Google AI Studio 取得：https://aistudio.google.com/apikey
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE'

function useBookshelf() {
  const [shelf, setShelf] = useState({})
  const setStatus = (title, status) =>
    setShelf(prev => ({ ...prev, [title]: status }))
  const getStatus = (title) => shelf[title] || null
  return { shelf, setStatus, getStatus }
}

// ══════════════════════════════════════════════
// 主 App
// ══════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState('onboarding') // onboarding | preferences | loading | result
  const [user, setUser] = useState(getDefaultUser())
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const bookshelf = useBookshelf()

  const handleSubmit = async () => {
    setScreen('loading')
    setError(null)
    try {
      const data = await getResovelRecommendation(user, GEMINI_API_KEY)
      setResult(data)
      setScreen('result')
    } catch (err) {
      setError(err.message)
      setScreen('preferences')
    }
  }

  return (
    <div style={styles.app}>
      {screen === 'onboarding' && (
        <OnboardingScreen onNext={() => setScreen('preferences')} />
      )}
      {screen === 'preferences' && (
        <PreferencesScreen
          user={user}
          setUser={setUser}
          onSubmit={handleSubmit}
          error={error}
        />
      )}
      {screen === 'loading' && (
        <LoadingScreen />
      )}
      {screen === 'bookshelf' && (
        <BookshelfScreen
          bookshelf={bookshelf}
          onBack={() => setScreen('result')}
        />
      )}
      {screen === 'result' && result && (
        <ResultScreen
          result={result}
          user={user}
          bookshelf={bookshelf}
          setScreen={setScreen}
          onAdjust={() => setScreen('preferences')}
          onReset={() => { setResult(null); setScreen('onboarding') }}
        />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════
// 畫面一：歡迎頁
// ══════════════════════════════════════════════
function OnboardingScreen({ onNext }) {
  return (
    <div style={styles.screen}>

      {/* 品牌名稱 */}
      <div style={styles.wordmark}>
        Re<span style={{ color: '#534AB7' }}>so</span>vel
      </div>

      {/* 三個品牌 pill */}
      <div style={styles.pillRow}>
        <span style={{ ...styles.pill, ...styles.pillR }}>Resonance 共鳴</span>
        <span style={{ ...styles.pill, ...styles.pillN }}>Novel 新篇章</span>
        <span style={{ ...styles.pill, ...styles.pillE }}>Elevation 升級</span>
      </div>

      {/* 主標題 */}
      <h1 style={styles.heroTitle}>
        與自己共鳴，<br />
        翻開新篇章，<br />
        成為更好的你。
      </h1>

      {/* 副標 */}
      <p style={styles.heroSub}>
        不只是書單推薦。Resovel 根據你的 MBTI 與當下狀態，<br />
        為你規劃一條從「解決問題」到「靈魂升級」的閱讀旅程。
      </p>

      {/* 分隔線 */}
      <div style={styles.dividerLine} />

      {/* 三個核心價值 */}
      <div style={styles.threeList}>

        <div style={styles.threeItem}>
          <div style={{ ...styles.threeDot, background: '#EEEDFE', color: '#534AB7' }}>R</div>
          <div>
            <div style={styles.threeLabel}>Resonance · 共鳴</div>
            <div style={styles.threeDesc}>找到真正說中你內心的書，不是隨機推薦</div>
          </div>
        </div>

        <div style={styles.threeItem}>
          <div style={{ ...styles.threeDot, background: '#E1F5EE', color: '#0F6E56' }}>N</div>
          <div>
            <div style={styles.threeLabel}>Novel · 新篇章</div>
            <div style={styles.threeDesc}>每個人生階段都有屬於那個時刻的閱讀路徑</div>
          </div>
        </div>

        <div style={styles.threeItem}>
          <div style={{ ...styles.threeDot, background: '#FAECE7', color: '#993C1D' }}>E</div>
          <div>
            <div style={styles.threeLabel}>Elevation · 升級</div>
            <div style={styles.threeDesc}>突破 MBTI 盲點，抵達下一個層次的自己</div>
          </div>
        </div>

      </div>

      {/* CTA 按鈕 */}
      <button style={styles.primaryBtn} onClick={onNext}>
        開始我的靈魂診斷 →
      </button>
      <p style={styles.hint}>約 2 分鐘 · 完全免費</p>

    </div>
  )
}

// ══════════════════════════════════════════════
// 畫面二：偏好設定
// ══════════════════════════════════════════════
function PreferencesScreen({ user, setUser, onSubmit, error }) {
  const update = (key, val) => setUser(prev => ({ ...prev, [key]: val }))
  const toggleArr = (key, val) => setUser(prev => ({
    ...prev,
    [key]: prev[key].includes(val)
      ? prev[key].filter(v => v !== val)
      : [...prev[key], val],
  }))

  const isReady = user.situation.trim().length > 5 || user.mode === 'explore'

  return (
    <div style={styles.screen}>
      <div style={styles.brand}>Resovel · 靈魂診斷</div>

      {/* MBTI */}
      <Section label="你的 MBTI">
        <ChipGroup
          options={MBTI_OPTIONS}
          selected={[user.mbti]}
          onToggle={v => {
            if (v === '不知道') {
              update('showMBTIQuiz', true)
            } else {
              update('mbti', v)
              update('showMBTIQuiz', false)
            }
          }}
          single
        />
        {user.showMBTIQuiz && (
          <div style={styles.quizBox}>
            <div style={styles.quizBoxTitle}>6 題快速判斷你的 MBTI 傾向</div>
            <MBTIQuiz
              onComplete={(mbti) => {
                update('mbti', mbti)
                update('showMBTIQuiz', false)
              }}
            />
          </div>
        )}
      </Section>

      {/* 年齡 */}
      <Section label="年齡區間">
        <ChipGroup
          options={['20s', '30s', '40s', '50s+']}
          selected={[user.age]}
          onToggle={v => update('age', v)}
          single
        />
      </Section>

      {/* 探索 or 解決問題 */}
      <Section label="今天的閱讀模式">
        <div style={styles.modeRow}>
          <ModeCard
            selected={user.mode === 'explore'}
            onClick={() => update('mode', 'explore')}
            icon="🌊"
            title="隨機探索"
            desc="沒有特定煩惱，想發現意想不到的好書"
          />
          <ModeCard
            selected={user.mode === 'problem'}
            onClick={() => update('mode', 'problem')}
            icon="🎯"
            title="解決問題"
            desc="有具體的煩惱或目標想透過閱讀突破"
          />
        </div>
      </Section>

      {/* 情境輸入（解決問題模式才顯示） */}
      {user.mode === 'problem' && (
        <Section label="你現在的狀況">
          <textarea
            style={styles.textarea}
            placeholder="例如：剛換工作，感覺很迷茫，不確定方向..."
            value={user.situation}
            onChange={e => update('situation', e.target.value)}
            rows={3}
          />
        </Section>
      )}

      {/* 能量狀態 */}
      <Section label="現在的能量狀態">
        <div style={styles.modeRow}>
          {[
            { key: 'low', icon: '🪶', label: '好累' },
            { key: 'normal', icon: '📖', label: '還好' },
            { key: 'high', icon: '🔥', label: '很有幹勁' },
          ].map(e => (
            <ModeCard
              key={e.key}
              selected={user.energy === e.key}
              onClick={() => update('energy', e.key)}
              icon={e.icon}
              title={e.label}
              desc=""
            />
          ))}
        </div>
      </Section>

      {/* 想從閱讀得到什麼 */}
      <Section label="我想從閱讀得到（可多選）">
        <ChipGroup
          options={GOAL_OPTIONS}
          selected={user.goals}
          onToggle={v => toggleArr('goals', v)}
        />
      </Section>

      {/* 不喜歡的類型 */}
      <Section label="不想看到的類型（可多選）">
        <ChipGroup
          options={AVOID_OPTIONS}
          selected={user.avoidTypes}
          onToggle={v => toggleArr('avoidTypes', v)}
          accent="red"
        />
      </Section>

      {/* 讀過的書 */}
      <Section label="讀過且喜歡的書">
        <BookInput
          books={user.booksRead}
          onChange={books => update('booksRead', books)}
        />
      </Section>

      {/* 深度 & 語言 slider */}
      <Section label="推薦風格">
        <SliderRow
          left="符合口味"
          right="突破盲點"
          value={user.depthSlider}
          onChange={v => update('depthSlider', v)}
        />
        <SliderRow
          left="中文書優先"
          right="翻譯書也OK"
          value={user.langSlider}
          onChange={v => update('langSlider', v)}
        />
        <PreviewText user={user} />
      </Section>

      {error && <div style={styles.errorBox}>⚠️ {error}</div>}

      <button
        style={{ ...styles.primaryBtn, opacity: isReady ? 1 : 0.5 }}
        onClick={isReady ? onSubmit : undefined}
        disabled={!isReady}
      >
        幫我找書 →
      </button>
      {!isReady && (
        <p style={styles.hint}>請描述你目前的狀況（至少 5 個字）</p>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════
// 畫面三：Loading
// ══════════════════════════════════════════════
function LoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0)
  const msgs = [
    '正在分析你的靈魂狀態...',
    '翻閱數千本書的記憶...',
    '為你規劃成長路徑...',
    '即將揭曉...',
  ]

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIdx(i => (i + 1) % msgs.length)
    }, 1800)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ ...styles.screen, textAlign: 'center', paddingTop: 80 }}>
      <div style={styles.loader} />
      <div style={styles.brand}>Resovel</div>
      <p style={{ ...styles.heroSub, marginTop: 16 }}>{msgs[msgIdx]}</p>
    </div>
  )
}

// ══════════════════════════════════════════════
// 畫面四：結果頁
// ══════════════════════════════════════════════
function ResultScreen({ result, user, bookshelf, setScreen, onAdjust, onReset }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={styles.screen}>
      <div style={styles.brand}>Resovel · 你的閱讀路徑</div>

      {/* 靈魂診斷 */}
      <div style={styles.diagnosisBox}>
        <div style={styles.soulKeywordLabel}>你的靈魂關鍵字</div>
        <div style={styles.soulKeyword}>{result.soulKeyword}</div>
        <p style={styles.diagnosisText}>{result.diagnosis}</p>
        <div style={styles.growthPoint}>
          <div style={styles.growthLabel}>成長契機</div>
          <div style={styles.growthText}>{result.growthPoint}</div>
        </div>
      </div>

      {/* Phase 1 */}
      <PhaseLabel number="1" title="立即對策" subtitle="今天就能開始讀的書，選一本：" />
      <BookCard book={result.phase1?.optionA} tag="選項 A" color="purple" bookshelf={bookshelf} />
      <BookCard book={result.phase1?.optionB} tag="選項 B" color="purple" bookshelf={bookshelf} />

      {/* Phase 2 & 3（預設收合，避免太長） */}
      {!expanded ? (
        <button style={styles.expandBtn} onClick={() => setExpanded(true)}>
          查看完整閱讀路徑（系統優化 + 根本進化）↓
        </button>
      ) : (
        <>
          <PhaseLabel number="2" title="系統優化" subtitle="穩住之後，建立長期護城河：" />
          <BookCard book={result.phase2} tag="橋樑書" color="teal" bookshelf={bookshelf} />

          <PhaseLabel number="3" title="根本進化" subtitle="準備好的時候，這是 Resovel 真正想給你的書：" />
          <BookCard book={result.phase3} tag="進化書" color="coral" showInsight bookshelf={bookshelf} />

          <PhaseLabel number="♡" title="心情急救包" subtitle="有時候你只需要被故事擁抱：" />
          <BookCard book={result.moodCare} tag="情緒補給" color="pink" bookshelf={bookshelf} />
        </>
      )}

      {/* 行動按鈕 */}
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button style={styles.secondaryBtn} onClick={() => setScreen('bookshelf')}>
          我的書單 →
        </button>
        <button style={styles.primaryBtn} onClick={onAdjust}>
          調整偏好，重新推薦 →
        </button>
        <button style={styles.secondaryBtn} onClick={onReset}>
          重新開始
        </button>
      </div>
      <p style={{ ...styles.hint, marginTop: 12 }}>書單已儲存 · 下週一會有新推薦</p>
    </div>
  )
}

// ══════════════════════════════════════════════
// 子元件
// ══════════════════════════════════════════════

function Section({ label, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionLabel}>{label}</div>
      {children}
    </div>
  )
}

function ChipGroup({ options, selected, onToggle, single, accent }) {
  return (
    <div style={styles.chipGroup}>
      {options.map(opt => (
        <button
          key={opt}
          style={{
            ...styles.chip,
            ...(selected.includes(opt) ? styles.chipSelected : {}),
            ...(selected.includes(opt) && accent === 'red' ? styles.chipRed : {}),
          }}
          onClick={() => onToggle(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function ModeCard({ selected, onClick, icon, title, desc }) {
  return (
    <div style={{ ...styles.modeCard, ...(selected ? styles.modeCardSelected : {}) }} onClick={onClick}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={styles.modeCardTitle}>{title}</div>
      {desc && <div style={styles.modeCardDesc}>{desc}</div>}
    </div>
  )
}

function BookInput({ books, onChange }) {
  const [input, setInput] = useState('')
  const add = () => {
    const v = input.trim()
    if (v && !books.includes(v)) onChange([...books, v])
    setInput('')
  }
  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          style={{ ...styles.textarea, padding: '8px 12px', flex: 1 }}
          placeholder="輸入書名..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button style={styles.addBtn} onClick={add}>新增</button>
      </div>
      <div style={styles.tagRow}>
        {books.map(b => (
          <span key={b} style={styles.tag}>
            {b}
            <span style={styles.removeTag} onClick={() => onChange(books.filter(x => x !== b))}>×</span>
          </span>
        ))}
      </div>
    </div>
  )
}

function SliderRow({ left, right, value, onChange }) {
  return (
    <div style={styles.sliderRow}>
      <span style={styles.sliderLabel}>{left}</span>
      <input
        type="range" min="0" max="100" step="1"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1 }}
      />
      <span style={{ ...styles.sliderLabel, textAlign: 'right' }}>{right}</span>
    </div>
  )
}

function PreviewText({ user }) {
  const depth = user.depthSlider < 30 ? '主要推符合你口味的書'
    : user.depthSlider < 60 ? '6成符合口味、4成突破盲點'
    : user.depthSlider < 80 ? '主要推能突破盲點的書'
    : '大膽推能突破盲點的書'
  const lang = user.langSlider < 30 ? '以繁體中文書為主'
    : user.langSlider < 60 ? '中文書為主，翻譯書也可以'
    : '中英翻譯各半'
  return (
    <div style={styles.previewBox}>
      <div style={styles.previewLabel}>推薦風格預覽</div>
      <div style={styles.previewText}>Resovel 會為你{depth}，{lang}。</div>
    </div>
  )
}

function PhaseLabel({ number, title, subtitle }) {
  return (
    <div style={{ margin: '24px 0 12px' }}>
      <div style={styles.phaseLabel}>PHASE {number} · {title}</div>
      <div style={styles.phaseSub}>{subtitle}</div>
    </div>
  )
}

const COLOR_MAP = {
  purple: { tag: '#EEEDFE', tagText: '#3C3489', bar: '#7F77DD' },
  teal: { tag: '#E1F5EE', tagText: '#0F6E56', bar: '#1D9E75' },
  coral: { tag: '#FAECE7', tagText: '#993C1D', bar: '#D85A30' },
  pink: { tag: '#FBEAF0', tagText: '#993556', bar: '#D4537E' },
}

function FeedbackBar({ title, status, onSet }) {
  const OPTS = [
    { key: 'want',    label: '想讀',   emoji: '❤️' },
    { key: 'reading', label: '閱讀中', emoji: '📖' },
    { key: 'done',    label: '已讀完', emoji: '✓'  },
    { key: 'skip',    label: '不適合', emoji: '✕'  },
  ]
  return (
    <div style={styles.feedbackBar}>
      {OPTS.map(o => (
        <button
          key={o.key}
          style={{
            ...styles.feedbackBtn,
            ...(status === o.key ? styles.feedbackBtnActive : {}),
          }}
          onClick={() => onSet(status === o.key ? null : o.key)}
        >
          <span style={{ fontSize: 13 }}>{o.emoji}</span>
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  )
}

function BookCard({ book, tag, color, showInsight, bookshelf }) {
  if (!book) return null
  const c = COLOR_MAP[color] || COLOR_MAP.purple
  return (
    <div style={{ ...styles.bookCard, borderLeftColor: c.bar }}>
      <span style={{ ...styles.bookTag, background: c.tag, color: c.tagText }}>{tag}</span>
      <div style={styles.bookTitle}>{book.title}</div>
      <div style={styles.bookAuthor}>{book.author} 著</div>
      {book.whyReadable && <p style={styles.bookReason}>{book.whyReadable}</p>}
      {book.solves && <p style={styles.bookReason}>{book.solves}</p>}
      {book.whyBridge && <p style={styles.bookReason}>{book.whyBridge}</p>}
      {book.whyEvolution && <p style={styles.bookReason}>{book.whyEvolution}</p>}
      {showInsight && book.resovelInsight && (
        <div style={styles.insightBox}>
          <div style={styles.insightLabel}>RESOVEL 洞見</div>
          <div style={styles.insightText}>{book.resovelInsight}</div>
        </div>
      )}
      {book.backup && (
        <div style={styles.backup}>備選：{book.backup}</div>
      )}
      {!book.confirmed && (
        <div style={styles.warnBadge}>⚠️ 建議購買前先確認繁中版</div>
      )}
      {book.confirmed && (
        <div style={styles.confirmedBadge}>✓ 繁中版確認</div>
      )}
      <div style={styles.linkRow}>
        {book.bookLink && (
          <a href={book.bookLink} target="_blank" rel="noopener noreferrer" style={styles.bookLink}>
            在博客來搜尋 →
          </a>
        )}
        {book.googleLink && (
          <a href={book.googleLink} target="_blank" rel="noopener noreferrer" style={styles.googleLink}>
            🔍 用 Google 搜尋
          </a>
        )}
      </div>
      {bookshelf && book?.title && (
        <FeedbackBar
          title={book.title}
          status={bookshelf.getStatus(book.title)}
          onSet={(s) => bookshelf.setStatus(book.title, s)}
        />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════
// 資料常數
// ══════════════════════════════════════════════
const MBTI_OPTIONS = [
  '不知道',
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

const GOAL_OPTIONS = [
  '被理解的感覺', '找到方向', '解決具體問題',
  '純粹放鬆', '拓展視野', '職涯突破',
  '關係與溝通', '認識自己',
]

const AVOID_OPTIONS = [
  '純學術論文風', '宗教靈性類', '過於勵志雞湯',
  '政治相關', '純商業數字', '翻譯腔太重',
]

function getDefaultUser() {
  return {
    mbti: '不知道',
    age: '30s',
    situation: '',
    energy: 'normal',
    goals: [],
    avoidTypes: [],
    booksRead: [],
    depthSlider: 40,
    langSlider: 60,
    mode: 'problem',
    showMBTIQuiz: false,
  }
}

// ══════════════════════════════════════════════
// 書單狀態管理畫面
// ══════════════════════════════════════════════
function BookshelfScreen({ bookshelf, onBack }) {
  const STATUS_LABELS = {
    want:    { label: '想讀',   color: '#FBEAF0', text: '#993556' },
    reading: { label: '閱讀中', color: '#E1F5EE', text: '#0F6E56' },
    done:    { label: '已讀完', color: '#EEEDFE', text: '#3C3489' },
    skip:    { label: '不適合', color: '#F1EFE8', text: '#5F5E5A' },
  }

  const groups = { want: [], reading: [], done: [], skip: [] }
  Object.entries(bookshelf.shelf).forEach(([title, status]) => {
    if (groups[status]) groups[status].push(title)
  })

  const total = Object.values(bookshelf.shelf).length
  const doneCount = groups.done.length

  return (
    <div style={styles.screen}>
      <div style={styles.brand}>Resovel · 我的書單</div>

      {total === 0 ? (
        <div style={styles.emptyShelf}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            還沒有收藏任何書<br />回去對書卡按 ❤️ 開始收藏
          </div>
        </div>
      ) : (
        <>
          <div style={styles.shelfStats}>
            <div style={styles.statCard}>
              <div style={styles.statNum}>{total}</div>
              <div style={styles.statLabel}>本書</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNum}>{doneCount}</div>
              <div style={styles.statLabel}>已讀完</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNum}>{groups.reading.length}</div>
              <div style={styles.statLabel}>閱讀中</div>
            </div>
          </div>

          {Object.entries(groups).map(([status, titles]) => {
            if (titles.length === 0) return null
            const s = STATUS_LABELS[status]
            return (
              <div key={status} style={{ marginBottom: 24 }}>
                <div style={styles.shelfGroupLabel}>{s.label}</div>
                {titles.map(title => (
                  <div key={title} style={styles.shelfItem}>
                    <span
                      style={{ ...styles.shelfStatusBadge, background: s.color, color: s.text }}
                    >
                      {s.label}
                    </span>
                    <span style={styles.shelfTitle}>{title}</span>
                    <button
                      style={styles.shelfRemoveBtn}
                      onClick={() => bookshelf.setStatus(title, null)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )
          })}
        </>
      )}

      <button style={styles.secondaryBtn} onClick={onBack}>← 返回書單</button>
    </div>
  )
}

// ══════════════════════════════════════════════
// MBTI 快速診斷 Quiz
// ══════════════════════════════════════════════
const MBTI_QUESTIONS = [
  {
    dim: 'EI',
    text: '一個充實的週末，你更傾向於？',
    opts: [
      { label: '跟朋友出去，越多人越好', desc: '社交讓我充電，獨處太久會悶', val: 'E' },
      { label: '一個人在家，做自己的事', desc: '獨處才能真正放鬆，人多反而累', val: 'I' },
    ],
  },
  {
    dim: 'SN',
    text: '面對一個新計畫，你第一個想的是？',
    opts: [
      { label: '具體怎麼執行？步驟是什麼？', desc: '先把細節搞清楚，再往前走', val: 'S' },
      { label: '這個計畫能帶來什麼可能性？', desc: '大方向更重要，細節之後再說', val: 'N' },
    ],
  },
  {
    dim: 'TF',
    text: '朋友跟你說他遇到了困難，你的第一反應是？',
    opts: [
      { label: '幫他分析問題，找解決方案', desc: '把事情解決才是真的幫到他', val: 'T' },
      { label: '先聽他說，讓他感覺被理解', desc: '情緒支持比解方更重要', val: 'F' },
    ],
  },
  {
    dim: 'JP',
    text: '你的生活通常是？',
    opts: [
      { label: '有計畫、有結構，按表操課', desc: '事情確定了才安心，臨時改變讓我不舒服', val: 'J' },
      { label: '隨機應變，保持彈性', desc: '計畫太死板，我喜歡保留選項', val: 'P' },
    ],
  },
  {
    dim: 'EI2',
    text: '在一個不認識人的派對，你通常？',
    opts: [
      { label: '主動跟人聊，很快交到朋友', desc: '我享受認識新朋友的過程', val: 'E' },
      { label: '找個熟人待著，或找個角落觀察', desc: '陌生人多的場合讓我有點耗力', val: 'I' },
    ],
  },
  {
    dim: 'SN2',
    text: '你比較相信哪一種？',
    opts: [
      { label: '眼見為憑，實際經驗最可靠', desc: '我信任具體的事實和數據', val: 'S' },
      { label: '直覺有時候比證據更準', desc: '我常靠預感做決定，而且通常對', val: 'N' },
    ],
  },
]

const MBTI_INFO = {
  INTJ: { name: '建築師', desc: '獨立思考、策略性強。你的閱讀偏好往往是底層邏輯和系統性思維。' },
  INTP: { name: '邏輯學家', desc: '對所有事情充滿好奇，喜歡找出背後原理。你喜歡能顛覆認知的書。' },
  ENTJ: { name: '指揮官', desc: '天生領導者，目標導向。你的書單充滿效率、策略和商業洞察。' },
  ENTP: { name: '辯論家', desc: '思維靈活、喜歡挑戰既有觀念。你享受能讓你腦洞大開的書。' },
  INFJ: { name: '提倡者', desc: '有深刻的內心世界，對人性充滿探索慾。你的閱讀往往是心理成長和靈魂共鳴。' },
  INFP: { name: '調停者', desc: '理想主義、重視真實性。你被有情感深度和人文關懷的書深深吸引。' },
  ENFJ: { name: '主人公', desc: '天生的陪伴者，關心他人成長。你的書單圍繞人際關係和社會影響。' },
  ENFP: { name: '競選者', desc: '熱情、富有創造力。你喜歡能點燃靈感、充滿可能性的書。' },
  ISTJ: { name: '物流師', desc: '可靠、務實、重視秩序。你的書單是有條有理的實用指南。' },
  ISFJ: { name: '守衛者', desc: '溫暖、體貼、注重細節。你喜歡能讓你更好照顧自己和他人的書。' },
  ESTJ: { name: '總經理', desc: '高效、組織力強。你的閱讀偏好是能立即應用的管理和系統書。' },
  ESFJ: { name: '執政官', desc: '友善、合作、重視和諧。你被能改善人際關係的書深深吸引。' },
  ISTP: { name: '鑑賞家', desc: '冷靜、觀察力強，喜歡解決問題。你偏好有實際操作性的書。' },
  ISFP: { name: '探險家', desc: '溫和、有藝術感，活在當下。你被有美感和真實情感的書吸引。' },
  ESTP: { name: '企業家', desc: '行動派、靈活應變。你的書要能立竿見影才吸引你。' },
  ESFP: { name: '表演者', desc: '活力充沛、享受當下。你喜歡有故事、有溫度、好讀的書。' },
}

function calculateMBTI(answers) {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  if (answers.EI === 'E') scores.E += 2; else scores.I += 2
  if (answers.EI2 === 'E') scores.E += 1; else scores.I += 1
  if (answers.SN === 'S') scores.S += 2; else scores.N += 2
  if (answers.SN2 === 'S') scores.S += 1; else scores.N += 1
  if (answers.TF === 'T') scores.T += 3; else scores.F += 3
  if (answers.JP === 'J') scores.J += 3; else scores.P += 3
  const e = scores.E >= scores.I ? 'E' : 'I'
  const s = scores.S >= scores.N ? 'S' : 'N'
  const t = scores.T >= scores.F ? 'T' : 'F'
  const j = scores.J >= scores.P ? 'J' : 'P'
  return {
    mbti: e + s + t + j,
    scores,
    pcts: {
      ei: Math.round(scores.E / (scores.E + scores.I) * 100),
      sn: Math.round(scores.N / (scores.S + scores.N) * 100),
      tf: Math.round(scores.F / (scores.T + scores.F) * 100),
      jp: Math.round(scores.P / (scores.J + scores.P) * 100),
    },
  }
}

function MBTIQuiz({ onComplete }) {
  const [cur, setCur] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  const q = MBTI_QUESTIONS[cur]
  const selected = answers[q.dim]
  const isLast = cur === MBTI_QUESTIONS.length - 1

  const pick = (val) => setAnswers(prev => ({ ...prev, [q.dim]: val }))

  const next = () => {
    if (!selected) return
    if (isLast) {
      setResult(calculateMBTI({ ...answers, [q.dim]: selected }))
    } else {
      setCur(c => c + 1)
    }
  }

  const prev = () => { if (cur > 0) setCur(c => c - 1) }

  const retry = () => { setCur(0); setAnswers({}); setResult(null) }

  if (result) {
    const info = MBTI_INFO[result.mbti] || { name: '獨特個體', desc: '你的思維很難被單一類型定義。' }
    return (
      <div>
        <div style={styles.quizResultBox}>
          <div style={styles.quizResultLabel}>你最接近的 MBTI</div>
          <div style={styles.quizResultMBTI}>{result.mbti}</div>
          <div style={styles.quizResultName}>{info.name}</div>
          <div style={styles.quizResultDesc}>{info.desc}</div>
        </div>
        <div style={{ marginBottom: 20 }}>
          {[
            { left: 'E 外向', right: 'I 內向', pct: result.pcts.ei },
            { left: 'N 直覺', right: 'S 實感', pct: result.pcts.sn },
            { left: 'F 情感', right: 'T 思考', pct: result.pcts.tf },
            { left: 'P 感知', right: 'J 判斷', pct: result.pcts.jp },
          ].map((t, i) => (
            <div key={i} style={styles.traitRow}>
              <span style={styles.traitLabel}>{t.left}</span>
              <div style={styles.traitBar}>
                <div style={{ ...styles.traitFill, width: t.pct + '%' }} />
              </div>
              <span style={{ ...styles.traitLabel, textAlign: 'right' }}>{t.right}</span>
            </div>
          ))}
        </div>
        <button style={styles.primaryBtn} onClick={() => onComplete(result.mbti)}>
          用 {result.mbti} 開始推薦 →
        </button>
        <button style={{ ...styles.secondaryBtn, marginTop: 10 }} onClick={retry}>
          重新作答
        </button>
      </div>
    )
  }

  return (
    <div>
      <div style={styles.quizProgressBar}>
        <div style={{ ...styles.quizProgressFill, width: ((cur + 1) / 6 * 100) + '%' }} />
      </div>
      <div style={styles.quizQNum}>問題 {cur + 1} / {MBTI_QUESTIONS.length}</div>
      <div style={styles.quizQText}>{q.text}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {q.opts.map((opt, i) => (
          <div
            key={i}
            style={{ ...styles.quizOpt, ...(selected === opt.val ? styles.quizOptSelected : {}) }}
            onClick={() => pick(opt.val)}
          >
            <div style={styles.quizOptLabel}>{opt.label}</div>
            <div style={styles.quizOptDesc}>{opt.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {cur > 0 && (
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={prev}>← 上一題</button>
        )}
        <button
          style={{ ...styles.primaryBtn, flex: 1, opacity: selected ? 1 : 0.4 }}
          onClick={next}
          disabled={!selected}
        >
          {isLast ? '看結果 →' : '下一題 →'}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════
// 樣式
// ══════════════════════════════════════════════
const styles = {
  app: {
    maxWidth: 480,
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#FAFAF8',
    fontFamily: "'Noto Sans TC', sans-serif",
  },
  screen: {
    padding: '24px 20px 48px',
  },
  wordmark: {
    fontSize: 32,
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  pillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 28,
  },
  pill: {
    fontSize: 11,
    fontWeight: 500,
    padding: '4px 12px',
    borderRadius: 99,
    letterSpacing: '0.04em',
  },
  pillR: {
    background: '#EEEDFE',
    color: '#3C3489',
  },
  pillN: {
    background: '#E1F5EE',
    color: '#085041',
  },
  pillE: {
    background: '#FAECE7',
    color: '#712B13',
  },
  dividerLine: {
    height: 0.5,
    background: '#E8E8E5',
    margin: '20px 0',
  },
  threeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginBottom: 32,
  },
  threeItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
  },
  threeDot: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
    marginTop: 1,
  },
  threeLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  threeDesc: {
    fontSize: 12,
    color: '#888',
    lineHeight: 1.5,
  },
  brand: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.15em',
    color: '#888',
    marginBottom: 20,
  },
  soulBadge: {
    display: 'inline-block',
    background: '#EEEDFE',
    color: '#3C3489',
    fontSize: 13,
    fontWeight: 500,
    padding: '5px 16px',
    borderRadius: 99,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: '#1A1A1A',
    lineHeight: 1.4,
    marginBottom: 12,
  },
  heroSub: {
    fontSize: 15,
    color: '#666',
    lineHeight: 1.7,
    marginBottom: 32,
  },
  primaryBtn: {
    display: 'block',
    width: '100%',
    padding: '14px',
    borderRadius: 99,
    background: '#534AB7',
    color: '#EEEDFE',
    fontSize: 15,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
  },
  secondaryBtn: {
    display: 'block',
    width: '100%',
    padding: '12px',
    borderRadius: 99,
    background: 'transparent',
    color: '#888',
    fontSize: 14,
    border: '0.5px solid #ddd',
    cursor: 'pointer',
  },
  hint: {
    fontSize: 12,
    color: '#AAA',
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: '#AAA',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  chipGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    padding: '7px 14px',
    borderRadius: 99,
    border: '0.5px solid #DDD',
    background: 'transparent',
    color: '#666',
    fontSize: 13,
    cursor: 'pointer',
  },
  chipSelected: {
    background: '#EEEDFE',
    color: '#3C3489',
    borderColor: '#AFA9EC',
    fontWeight: 500,
  },
  chipRed: {
    background: '#FCEBEB',
    color: '#A32D2D',
    borderColor: '#F09595',
  },
  modeRow: {
    display: 'flex',
    gap: 10,
  },
  modeCard: {
    flex: 1,
    border: '0.5px solid #DDD',
    borderRadius: 12,
    padding: '12px 10px',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#FFF',
  },
  modeCardSelected: {
    borderColor: '#7F77DD',
    background: '#EEEDFE',
  },
  modeCardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#1A1A1A',
  },
  modeCardDesc: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
    lineHeight: 1.4,
  },
  textarea: {
    width: '100%',
    border: '0.5px solid #DDD',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 14,
    color: '#1A1A1A',
    fontFamily: "'Noto Sans TC', sans-serif",
    resize: 'vertical',
    background: '#FFF',
    boxSizing: 'border-box',
  },
  addBtn: {
    padding: '8px 16px',
    borderRadius: 10,
    border: '0.5px solid #DDD',
    background: '#FFF',
    color: '#666',
    fontSize: 13,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tag: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#F3F3F0',
    borderRadius: 99,
    padding: '4px 12px',
    fontSize: 13,
    color: '#555',
  },
  removeTag: {
    cursor: 'pointer',
    color: '#AAA',
    fontSize: 14,
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#888',
    minWidth: 64,
    lineHeight: 1.3,
  },
  previewBox: {
    background: '#EEEDFE',
    borderRadius: 12,
    padding: '12px 16px',
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#534AB7',
    letterSpacing: '0.08em',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 13,
    color: '#3C3489',
    lineHeight: 1.6,
  },
  errorBox: {
    background: '#FCEBEB',
    color: '#A32D2D',
    borderRadius: 10,
    padding: '12px 16px',
    fontSize: 13,
    marginBottom: 16,
  },
  loader: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '3px solid #EEEDFE',
    borderTopColor: '#534AB7',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px',
  },
  diagnosisBox: {
    background: '#EEEDFE',
    borderRadius: 16,
    padding: '20px',
    marginBottom: 28,
  },
  soulKeywordLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#534AB7',
    letterSpacing: '0.1em',
    marginBottom: 6,
  },
  soulKeyword: {
    fontSize: 22,
    fontWeight: 700,
    color: '#26215C',
    marginBottom: 10,
  },
  diagnosisText: {
    fontSize: 14,
    color: '#3C3489',
    lineHeight: 1.7,
    marginBottom: 14,
  },
  growthPoint: {
    background: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    padding: '10px 14px',
  },
  growthLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#534AB7',
    marginBottom: 4,
  },
  growthText: {
    fontSize: 13,
    color: '#26215C',
    lineHeight: 1.6,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: '#AAA',
  },
  phaseSub: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    lineHeight: 1.5,
  },
  bookCard: {
    background: '#FFF',
    border: '0.5px solid #E8E8E5',
    borderLeft: '3px solid #7F77DD',
    borderRadius: 12,
    padding: '16px',
    marginBottom: 12,
  },
  bookTag: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 99,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 10,
  },
  bookReason: {
    fontSize: 13,
    color: '#555',
    lineHeight: 1.65,
    marginBottom: 6,
  },
  insightBox: {
    background: '#FAECE7',
    borderRadius: 10,
    padding: '10px 14px',
    marginTop: 10,
  },
  insightLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#993C1D',
    letterSpacing: '0.08em',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: '#71401A',
    lineHeight: 1.65,
  },
  backup: {
    fontSize: 12,
    color: '#AAA',
    marginTop: 8,
  },
  confirmedBadge: {
    display: 'inline-block',
    fontSize: 11,
    color: '#3B6D11',
    background: '#EAF3DE',
    padding: '2px 8px',
    borderRadius: 99,
    marginTop: 8,
  },
  warnBadge: {
    display: 'inline-block',
    fontSize: 11,
    color: '#854F0B',
    background: '#FAEEDA',
    padding: '2px 8px',
    borderRadius: 99,
    marginTop: 8,
  },
  linkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  bookLink: {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 600,
    color: '#EEEDFE',
    background: '#534AB7',
    padding: '6px 14px',
    borderRadius: 8,
    textDecoration: 'none',
  },
  googleLink: {
    display: 'inline-block',
    fontSize: 12,
    color: '#555',
    background: '#E8E8E5',
    padding: '6px 12px',
    borderRadius: 8,
    textDecoration: 'none',
  },
  expandBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: 10,
    border: '0.5px solid #DDD',
    background: '#FFF',
    color: '#666',
    fontSize: 14,
    cursor: 'pointer',
    margin: '16px 0',
  },
  // MBTI Quiz 樣式
  quizBox: {
    marginTop: 16,
    background: 'var(--color-background-secondary, #F5F5F2)',
    borderRadius: 14,
    padding: '16px',
    border: '0.5px solid #E8E8E5',
  },
  quizBoxTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#534AB7',
    marginBottom: 16,
  },
  quizProgressBar: {
    height: 3,
    background: '#E8E8E5',
    borderRadius: 99,
    marginBottom: 16,
    overflow: 'hidden',
  },
  quizProgressFill: {
    height: '100%',
    background: '#534AB7',
    borderRadius: 99,
    transition: 'width 0.4s ease',
  },
  quizQNum: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.1em',
    color: '#AAA',
    marginBottom: 8,
  },
  quizQText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1A1A1A',
    lineHeight: 1.5,
    marginBottom: 16,
  },
  quizOpt: {
    border: '0.5px solid #DDD',
    borderRadius: 12,
    padding: '14px 16px',
    cursor: 'pointer',
    background: '#FFF',
    transition: 'all 0.15s',
    textAlign: 'left',
  },
  quizOptSelected: {
    borderColor: '#7F77DD',
    background: '#EEEDFE',
  },
  quizOptLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1A1A',
    marginBottom: 3,
  },
  quizOptDesc: {
    fontSize: 12,
    color: '#888',
    lineHeight: 1.5,
  },
  quizResultBox: {
    background: '#EEEDFE',
    borderRadius: 16,
    padding: '20px',
    marginBottom: 20,
  },
  quizResultLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: '#534AB7',
    marginBottom: 6,
  },
  quizResultMBTI: {
    fontSize: 32,
    fontWeight: 700,
    color: '#26215C',
    marginBottom: 4,
  },
  quizResultName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#3C3489',
    marginBottom: 8,
  },
  quizResultDesc: {
    fontSize: 13,
    color: '#3C3489',
    lineHeight: 1.65,
  },
  traitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  traitLabel: {
    fontSize: 11,
    color: '#888',
    minWidth: 48,
  },
  traitBar: {
    flex: 1,
    height: 5,
    background: '#E8E8E5',
    borderRadius: 99,
    overflow: 'hidden',
  },
  traitFill: {
    height: '100%',
    background: '#7F77DD',
    borderRadius: 99,
    transition: 'width 0.6s ease',
  },

  // Feedback 樣式
  feedbackBar: {
    display: 'flex',
    gap: 6,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  feedbackBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '5px 10px',
    borderRadius: 99,
    border: '0.5px solid #DDD',
    background: 'transparent',
    color: '#888',
    fontSize: 12,
    cursor: 'pointer',
  },
  feedbackBtnActive: {
    background: '#EEEDFE',
    borderColor: '#7F77DD',
    color: '#3C3489',
    fontWeight: 500,
  },

  // 書單管理樣式
  emptyShelf: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#AAA',
  },
  shelfStats: {
    display: 'flex',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    background: '#F5F5F2',
    borderRadius: 12,
    padding: '14px',
    textAlign: 'center',
  },
  statNum: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#AAA',
  },
  shelfGroupLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: '#AAA',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  shelfItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 0',
    borderBottom: '0.5px solid #E8E8E5',
  },
  shelfStatusBadge: {
    fontSize: 11,
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: 99,
    flexShrink: 0,
  },
  shelfTitle: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  shelfRemoveBtn: {
    background: 'none',
    border: 'none',
    color: '#CCC',
    fontSize: 16,
    cursor: 'pointer',
    padding: '0 4px',
  },
}
