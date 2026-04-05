# Resovel v0.5 · 書單頁面全面升級任務

## 任務概覽
升級現有的 `BookshelfScreen` 元件，加入：
1. 頂部統計卡（想讀、閱讀中、已讀完數量）
2. 書卡視覺升級（狀態更明顯、操作更清楚）
3. 「標記讀完」功能 → 觸發心得填寫 Modal
4. 心得 Modal（喜不喜歡 + 評分 + 文字 + 公開分享）
5. 已讀完的書顯示評分和心得

不要動其他畫面。只修改 `BookshelfScreen` 和相關子元件。

---

## 任務一：替換整個 BookshelfScreen 元件

找到現有的 `BookshelfScreen` function，整個替換成以下程式碼：

```jsx
function BookshelfScreen({ bookshelf, onBack }) {
  const [reviewTarget, setReviewTarget] = useState(null) // 正在寫心得的書名
  const [reviews, setReviews] = useState({}) // 書名 → 心得資料

  const STATUS_CONFIG = {
    want:    { label: '想讀',   bg: '#FBEAF0', color: '#993556' },
    reading: { label: '閱讀中', bg: '#E1F5EE', color: '#085041' },
    done:    { label: '已讀完', bg: '#EEEDFE', color: '#3C3489' },
    skip:    { label: '不適合', bg: '#F1EFE8', color: '#5F5E5A' },
  }

  // 把書依狀態分組
  const groups = { want: [], reading: [], done: [], skip: [] }
  Object.entries(bookshelf.shelf).forEach(([title, status]) => {
    if (groups[status]) groups[title] = status // 暫存
    if (groups[status]) groups[status].push(title)
  })

  const counts = {
    want: groups.want.length,
    reading: groups.reading.length,
    done: groups.done.length,
  }
  const total = counts.want + counts.reading + counts.done

  const handleMarkDone = (title) => {
    bookshelf.setStatus(title, 'done')
    setReviewTarget(title) // 打開心得 Modal
  }

  const handleSubmitReview = (title, reviewData) => {
    setReviews(prev => ({ ...prev, [title]: reviewData }))
    setReviewTarget(null)
  }

  return (
    <div style={styles.screen}>
      <div style={styles.brand}>Resovel · 我的書單</div>

      {/* 統計卡 */}
      {total > 0 && (
        <div style={styles.shelfStats}>
          {[
            { label: '想讀', count: counts.want, color: '#993556', bg: '#FBEAF0' },
            { label: '閱讀中', count: counts.reading, color: '#085041', bg: '#E1F5EE' },
            { label: '已讀完', count: counts.done, color: '#3C3489', bg: '#EEEDFE' },
          ].map(s => (
            <div key={s.label} style={{ ...styles.statCard, background: s.bg }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 11, color: s.color, opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 空狀態 */}
      {total === 0 && (
        <div style={styles.emptyShelf}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📚</div>
          <div style={{ fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            還沒有書單<br />回到推薦結果，對書卡按 ❤️ 開始收藏
          </div>
          <button style={{ ...styles.primaryBtn, marginTop: 20 }} onClick={onBack}>
            去找書 →
          </button>
        </div>
      )}

      {/* 閱讀中（優先顯示） */}
      {groups.reading.length > 0 && (
        <ShelfGroup
          label="閱讀中"
          books={groups.reading}
          status="reading"
          config={STATUS_CONFIG.reading}
          reviews={reviews}
          bookshelf={bookshelf}
          onMarkDone={handleMarkDone}
        />
      )}

      {/* 想讀 */}
      {groups.want.length > 0 && (
        <ShelfGroup
          label="想讀"
          books={groups.want}
          status="want"
          config={STATUS_CONFIG.want}
          reviews={reviews}
          bookshelf={bookshelf}
          onMarkDone={handleMarkDone}
        />
      )}

      {/* 已讀完 */}
      {groups.done.length > 0 && (
        <ShelfGroup
          label="已讀完"
          books={groups.done}
          status="done"
          config={STATUS_CONFIG.done}
          reviews={reviews}
          bookshelf={bookshelf}
          onMarkDone={handleMarkDone}
        />
      )}

      <button style={styles.secondaryBtn} onClick={onBack}>← 返回</button>

      {/* 心得 Modal */}
      {reviewTarget && (
        <ReviewModal
          bookTitle={reviewTarget}
          onSubmit={(data) => handleSubmitReview(reviewTarget, data)}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  )
}
```

---

## 任務二：新增 ShelfGroup 元件

在 `BookshelfScreen` 下方新增：

```jsx
function ShelfGroup({ label, books, status, config, reviews, bookshelf, onMarkDone }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={styles.shelfGroupLabel}>{label}</div>
      {books.map(title => (
        <ShelfBookCard
          key={title}
          title={title}
          status={status}
          config={config}
          review={reviews[title]}
          bookshelf={bookshelf}
          onMarkDone={onMarkDone}
        />
      ))}
    </div>
  )
}
```

---

## 任務三：新增 ShelfBookCard 元件

```jsx
function ShelfBookCard({ title, status, config, review, bookshelf, onMarkDone }) {
  const bookLink = `https://search.books.com.tw/search/query/key/${encodeURIComponent(title)}/cat/all`
  const googleLink = `https://www.google.com/search?q=${encodeURIComponent(title + ' 書評')}`

  return (
    <div style={styles.shelfCard}>
      {/* 頂部：狀態 + 刪除 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{
          fontSize: 11, fontWeight: 500,
          padding: '3px 10px', borderRadius: 99,
          background: config.bg, color: config.color,
        }}>
          {config.label}
        </span>
        <button
          style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', fontSize: 16, cursor: 'pointer', padding: '0 4px' }}
          onClick={() => bookshelf.setStatus(title, null)}
        >
          ×
        </button>
      </div>

      {/* 書名 */}
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 12 }}>
        {title}
      </div>

      {/* 已讀完：顯示評分和心得 */}
      {status === 'done' && review && (
        <div style={styles.reviewDisplay}>
          <div style={{ fontSize: 15, marginBottom: 4 }}>
            {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </div>
          {review.liked !== null && (
            <span style={{
              fontSize: 11, fontWeight: 500,
              padding: '2px 8px', borderRadius: 99,
              background: review.liked ? '#E1F5EE' : '#FCEBEB',
              color: review.liked ? '#085041' : '#A32D2D',
              marginBottom: 6, display: 'inline-block',
            }}>
              {review.liked ? '❤️ 喜歡' : '👎 不太喜歡'}
            </span>
          )}
          {review.note && (
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginTop: 6 }}>
              {review.note}
            </div>
          )}
        </div>
      )}

      {/* 操作按鈕 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>

        {/* 想讀 → 開始閱讀 */}
        {status === 'want' && (
          <button
            style={styles.shelfActionBtn}
            onClick={() => bookshelf.setStatus(title, 'reading')}
          >
            開始閱讀
          </button>
        )}

        {/* 閱讀中 → 讀完了 */}
        {status === 'reading' && (
          <button
            style={{ ...styles.shelfActionBtn, ...styles.shelfActionBtnPrimary }}
            onClick={() => onMarkDone(title)}
          >
            ✓ 讀完了，寫心得
          </button>
        )}

        {/* 已讀完 → 編輯心得 */}
        {status === 'done' && (
          <button
            style={styles.shelfActionBtn}
            onClick={() => onMarkDone(title)}
          >
            {review ? '編輯心得' : '寫心得'}
          </button>
        )}

        {/* 博客來 */}
        <a
          href={bookLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...styles.shelfActionBtn, textDecoration: 'none', textAlign: 'center' }}
        >
          在博客來搜尋
        </a>

        {/* Google */}
        <a
          href={googleLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...styles.shelfActionBtn, textDecoration: 'none', textAlign: 'center' }}
        >
          Google 搜尋
        </a>
      </div>
    </div>
  )
}
```

---

## 任務四：新增 ReviewModal 元件

```jsx
function ReviewModal({ bookTitle, onSubmit, onClose }) {
  const [liked, setLiked] = useState(null)       // true | false | null
  const [rating, setRating] = useState(0)        // 1~5
  const [note, setNote] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  const canSubmit = rating > 0

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalBox}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
          讀完了！說說感想
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
          《{bookTitle}》
        </div>

        {/* 喜不喜歡 */}
        <div style={styles.modalSectionLabel}>你喜歡這本書嗎？</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { val: true,  label: '❤️ 喜歡',     activeStyle: { background: '#E1F5EE', borderColor: '#1D9E75', color: '#085041' } },
            { val: false, label: '👎 不太喜歡', activeStyle: { background: '#FCEBEB', borderColor: '#E24B4A', color: '#A32D2D' } },
          ].map(o => (
            <button
              key={String(o.val)}
              style={{
                flex: 1, padding: '10px', borderRadius: 10,
                border: '0.5px solid var(--color-border-secondary)',
                background: 'transparent', fontSize: 13, cursor: 'pointer',
                fontWeight: liked === o.val ? 500 : 400,
                ...(liked === o.val ? o.activeStyle : {}),
              }}
              onClick={() => setLiked(liked === o.val ? null : o.val)}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* 評分 */}
        <div style={styles.modalSectionLabel}>評分（必填）</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[1,2,3,4,5].map(n => (
            <span
              key={n}
              style={{ fontSize: 26, cursor: 'pointer', opacity: rating >= n ? 1 : 0.25, transition: 'opacity .1s' }}
              onClick={() => setRating(n)}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* 文字心得 */}
        <div style={styles.modalSectionLabel}>簡短心得（選填）</div>
        <textarea
          style={{
            ...styles.textarea,
            marginBottom: 14,
            fontSize: 13,
            minHeight: 72,
          }}
          placeholder="這本書對你有什麼影響？一句話也可以..."
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
        />

        {/* 公開分享 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>公開分享給其他讀者</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>讓同 MBTI 的人看到你的心得</div>
          </div>
          <div
            style={{
              width: 40, height: 22, borderRadius: 99, cursor: 'pointer',
              background: isPublic ? '#534AB7' : 'var(--color-border-secondary)',
              position: 'relative', transition: 'background .2s',
            }}
            onClick={() => setIsPublic(!isPublic)}
          >
            <div style={{
              position: 'absolute', top: 2,
              left: isPublic ? 20 : 2,
              width: 18, height: 18,
              background: '#fff', borderRadius: '50%',
              transition: 'left .2s',
            }} />
          </div>
        </div>

        {/* 按鈕 */}
        <button
          style={{ ...styles.primaryBtn, opacity: canSubmit ? 1 : 0.4 }}
          disabled={!canSubmit}
          onClick={() => onSubmit({ liked, rating, note, isPublic })}
        >
          送出心得 →
        </button>
        <button
          style={{ ...styles.secondaryBtn, marginTop: 10 }}
          onClick={onClose}
        >
          之後再寫
        </button>
      </div>
    </div>
  )
}
```

---

## 任務五：在 styles 物件新增樣式

在現有 `styles` 物件裡新增以下 key：

```js
// 書單頁升級樣式
shelfCard: {
  background: 'var(--color-background-primary)',
  border: '0.5px solid var(--color-border-tertiary)',
  borderRadius: 14,
  padding: '14px',
  marginBottom: 10,
},
shelfActionBtn: {
  padding: '7px 14px',
  borderRadius: 99,
  border: '0.5px solid var(--color-border-secondary)',
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  fontSize: 12,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
},
shelfActionBtnPrimary: {
  background: '#534AB7',
  color: '#EEEDFE',
  borderColor: '#534AB7',
  fontWeight: 500,
},
reviewDisplay: {
  background: 'var(--color-background-secondary)',
  borderRadius: 10,
  padding: '10px 12px',
  marginBottom: 12,
},
modalOverlay: {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'flex-end',
  zIndex: 100,
},
modalBox: {
  background: 'var(--color-background-primary)',
  borderRadius: '16px 16px 0 0',
  padding: '20px 20px 36px',
  width: '100%',
  maxHeight: '85vh',
  overflowY: 'auto',
},
modalSectionLabel: {
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: 'var(--color-text-tertiary)',
  marginBottom: 10,
  textTransform: 'uppercase',
},
```

---

## 任務六：App 最外層容器加上 position: relative

找到：
```jsx
const styles = {
  app: {
    maxWidth: 480,
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#FAFAF8',
    fontFamily: "'Noto Sans TC', sans-serif",
  },
```

改成：
```jsx
const styles = {
  app: {
    maxWidth: 480,
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#FAFAF8',
    fontFamily: "'Noto Sans TC', sans-serif",
    position: 'relative', // Modal 定位需要這個
  },
```

---

## 完成後確認清單

- [ ] `npm run dev` 無 compile error
- [ ] 書單頁頂部顯示三個統計卡（想讀 / 閱讀中 / 已讀完）
- [ ] 書卡顯示正確的狀態標籤（顏色對應）
- [ ] 「閱讀中」的書顯示「✓ 讀完了，寫心得」按鈕（紫色）
- [ ] 點「讀完了，寫心得」→ 從底部滑出 Modal
- [ ] Modal 可以選喜不喜歡、評分（必填）、寫心得、設定是否公開
- [ ] 送出後 Modal 關閉，書卡更新為「已讀完」並顯示評分
- [ ] 「想讀」的書有「開始閱讀」按鈕，點了變成「閱讀中」
- [ ] × 按鈕可以從書單移除書
- [ ] 博客來和 Google 搜尋連結正常運作
