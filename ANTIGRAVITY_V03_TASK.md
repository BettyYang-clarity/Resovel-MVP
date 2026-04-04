# Resovel v0.3 · Agent 任務指令

## 你的任務概覽
在現有專案的 `src/App.jsx` 裡，新增以下三個功能：
1. MBTI 快速診斷 Quiz（6 題）
2. 書卡 Feedback 按鈕
3. 書單狀態管理（待讀 · 閱讀中 · 已讀完）

不要重寫整個檔案。只新增和修改下面指定的部分。

---

## 任務一：新增 MBTI Quiz 元件

### 1-A 在 `src/App.jsx` 最底部，styles 物件之前，貼上以下完整元件：

```jsx
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
          <button style={styles.secondaryBtn} onClick={prev}>← 上一題</button>
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
```

### 1-B 在 `PreferencesScreen` 裡，找到 MBTI ChipGroup 的部分：

```jsx
<Section label="你的 MBTI">
  <ChipGroup
    options={MBTI_OPTIONS}
    selected={[user.mbti]}
    onToggle={v => update('mbti', v)}
    single
  />
</Section>
```

替換成：

```jsx
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
```

### 1-C 在 `getDefaultUser()` 函式裡，新增 `showMBTIQuiz: false`：

```js
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
    showMBTIQuiz: false, // 新增這行
  }
}
```

---

## 任務二：書卡 Feedback 按鈕

### 2-A 在 `src/App.jsx` 最上面，`export default function App()` 之前，新增這個 hook：

```jsx
function useBookshelf() {
  const [shelf, setShelf] = useState({})
  const setStatus = (title, status) =>
    setShelf(prev => ({ ...prev, [title]: status }))
  const getStatus = (title) => shelf[title] || null
  return { shelf, setStatus, getStatus }
}
```

### 2-B 在 `App()` 主元件裡，`const [error, setError] = useState(null)` 下面新增：

```jsx
const bookshelf = useBookshelf()
```

### 2-C 把 `bookshelf` 傳進 `ResultScreen`，找到：

```jsx
{screen === 'result' && result && (
  <ResultScreen
    result={result}
    user={user}
    onAdjust={() => setScreen('preferences')}
    onReset={() => { setResult(null); setScreen('onboarding') }}
  />
)}
```

改成：

```jsx
{screen === 'result' && result && (
  <ResultScreen
    result={result}
    user={user}
    bookshelf={bookshelf}
    onAdjust={() => setScreen('preferences')}
    onReset={() => { setResult(null); setScreen('onboarding') }}
  />
)}
```

### 2-D 在 `ResultScreen` 的 function 簽名裡，新增 `bookshelf`：

```jsx
function ResultScreen({ result, user, bookshelf, onAdjust, onReset }) {
```

### 2-E 把所有 `<BookCard ... />` 都加上 `bookshelf` prop，例如：

```jsx
<BookCard book={result.phase1?.optionA} tag="選項 A" color="purple" bookshelf={bookshelf} />
<BookCard book={result.phase1?.optionB} tag="選項 B" color="purple" bookshelf={bookshelf} />
<BookCard book={result.phase2} tag="橋樑書" color="teal" bookshelf={bookshelf} />
<BookCard book={result.phase3} tag="進化書" color="coral" showInsight bookshelf={bookshelf} />
<BookCard book={result.moodCare} tag="情緒補給" color="pink" bookshelf={bookshelf} />
```

### 2-F 找到 `BookCard` 元件，在 `bookLink` 的 `<a>` 標籤後面，新增 Feedback 按鈕區塊：

找到：
```jsx
function BookCard({ book, tag, color, showInsight }) {
```
改成：
```jsx
function BookCard({ book, tag, color, showInsight, bookshelf }) {
```

然後在 `bookLink` 的 `<a>` 後面（整個 return 的最後一個元素之前）加入：

```jsx
{bookshelf && book?.title && (
  <FeedbackBar
    title={book.title}
    status={bookshelf.getStatus(book.title)}
    onSet={(s) => bookshelf.setStatus(book.title, s)}
  />
)}
```

### 2-G 新增 `FeedbackBar` 元件（放在 `BookCard` 元件上方）：

```jsx
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
```

---

## 任務三：書單狀態管理頁面

### 3-A 在 `App()` 的 screen state 新增 bookshelf 頁面的入口

找到：
```jsx
const [screen, setScreen] = useState('onboarding')
```

在 return 的最後一個 screen 之後，新增：

```jsx
{screen === 'bookshelf' && (
  <BookshelfScreen
    bookshelf={bookshelf}
    onBack={() => setScreen('result')}
  />
)}
```

### 3-B 在 `ResultScreen` 底部的按鈕區，新增「我的書單」按鈕：

找到 `onAdjust` 按鈕那一行，在它上面新增：

```jsx
<button style={styles.secondaryBtn} onClick={() => setScreen('bookshelf')}>
  我的書單 →
</button>
```

注意：`setScreen` 需要從 ResultScreen 的 props 傳入，找到 ResultScreen 的 function 簽名，新增 `setScreen`：

```jsx
function ResultScreen({ result, user, bookshelf, setScreen, onAdjust, onReset }) {
```

並在 App() 裡傳入：
```jsx
<ResultScreen
  result={result}
  user={user}
  bookshelf={bookshelf}
  setScreen={setScreen}
  onAdjust={() => setScreen('preferences')}
  onReset={() => { setResult(null); setScreen('onboarding') }}
/>
```

### 3-C 新增 `BookshelfScreen` 元件（放在 `ResultScreen` 下方）：

```jsx
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
```

---

## 任務四：新增所有需要的樣式

在 `const styles = {` 裡，新增以下 key（加在最後一個樣式之前）：

```js
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
```

---

## 完成後確認清單

Agent 請執行以下確認：

- [ ] 執行 `npm run dev`，確認無 compile error
- [ ] 在偏好設定頁，點選「不知道」，確認 Quiz 出現
- [ ] 完成 Quiz 6 題，確認結果頁顯示 MBTI 和四條維度進度條
- [ ] 按「用 XXXX 開始推薦」，確認 MBTI 欄位更新
- [ ] 在結果頁書卡底部，確認 Feedback 按鈕列出現（❤️ 想讀 · 📖 閱讀中 · ✓ 已讀完 · ✕ 不適合）
- [ ] 按任一 Feedback 按鈕，確認按鈕變色（active 狀態）
- [ ] 在結果頁，確認「我的書單」按鈕出現
- [ ] 點「我的書單」，確認跳到書單管理頁
- [ ] 書單管理頁顯示統計數字和分組清單
- [ ] 按 × 可以移除書單裡的書
