# Resovel · Onboarding 品牌更新任務

## 你的任務
修改現有 `src/App.jsx` 裡的 `OnboardingScreen` 元件，
套用新的品牌設計與文案。不要動其他畫面和邏輯。

---

## 需要修改的檔案
`src/App.jsx`

---

## 具體修改內容

### 1. 品牌名稱：全部從 `RESOVEL` 改成 `Resovel`

搜尋所有出現 `RESOVEL` 的地方（包含 Loading 畫面的品牌字），
統一改成 `Resovel`。

唯一例外：三個 pill 標籤裡的副標 `RESOLVE + EVOLVE` 刪除，
改成下方新版的三個 pill。

---

### 2. 完整替換 `OnboardingScreen` 元件

把現有的 `OnboardingScreen` function 整個替換成以下程式碼：

```jsx
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
```

---

### 3. 在 `styles` 物件裡新增以下樣式

在現有 `const styles = { ... }` 裡，加入這些新的 key：

```js
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
```

---

### 4. Loading 畫面的品牌字也要改

在 `LoadingScreen` 裡，找到：
```jsx
<div style={styles.brand}>RESOVEL</div>
```
改成：
```jsx
<div style={styles.brand}>Resovel</div>
```

---

### 5. ResultScreen 頂部的品牌字也要改

找到：
```jsx
<div style={styles.brand}>RESOVEL · 你的閱讀路徑</div>
```
改成：
```jsx
<div style={styles.brand}>Resovel · 你的閱讀路徑</div>
```

---

## 修改完成後

請執行：
```bash
npm run dev
```

確認 `http://localhost:5173` 的第一個畫面顯示正確，
品牌名稱是 `Resovel`（首字母大寫），
並有三個 pill 標籤顯示 Resonance / Novel / Elevation。
