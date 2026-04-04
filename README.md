# Resovel · 靈魂閱讀顧問

> Resolve（解決）+ Evolve（進化）= Resovel
> 根據你的 MBTI、當下狀態與成長目標，為你規劃一條閱讀路徑。

---

## 在 Antigravity 開啟這個專案

### 第一步：開啟專案
1. 打開 Antigravity
2. File → Open Folder → 選擇這個 `resovel` 資料夾

### 第二步：設定 API Key
1. 複製 `.env.example`，重新命名為 `.env`
2. 去 [Google AI Studio](https://aistudio.google.com/apikey) 取得免費 API Key
3. 貼到 `.env` 裡：
   ```
   VITE_GEMINI_API_KEY=你的key貼這裡
   ```

### 第三步：安裝套件
在 Antigravity 終端機執行：
```bash
npm install
```

### 第四步：啟動
```bash
npm run dev
```

打開瀏覽器 `http://localhost:5173` 就能看到 Resovel！

---

## 專案結構

```
resovel/
├── src/
│   ├── App.jsx              ← 主程式（所有畫面都在這裡）
│   ├── main.jsx             ← React 入口點
│   └── lib/
│       ├── resovel-prompt.js  ← 核心 Prompt 引擎 + 白名單
│       └── gemini.js          ← Gemini API 呼叫器（含快取）
├── index.html
├── package.json
├── vite.config.js
├── .env.example             ← 複製這個，改名為 .env
└── .gitignore
```

---

## 核心功能說明

### Prompt 引擎（`src/lib/resovel-prompt.js`）
- 根據用戶的 MBTI、年齡、情境、能量狀態、偏好滑桿，自動組合送給 Gemini 的 prompt
- 書籍白名單：熱門書預先確認繁中版存在，命中白名單不需額外驗證

### Gemini API（`src/lib/gemini.js`）
- 自動快取：相同條件 24 小時內不重複呼叫 API，節省費用
- JSON 格式輸出：要求 Gemini 直接輸出結構化 JSON，方便前端渲染
- 錯誤處理：API 失敗時顯示友善錯誤訊息

### 三段閱讀路徑
- **Phase 1（錨點）**：今天就能讀，立即有感
- **Phase 2（橋樑）**：系統化解決方案
- **Phase 3（進化）**：突破 MBTI 盲點的根本解藥

---

## 之後可以加的功能

- [ ] Supabase 資料庫：儲存用戶偏好、閱讀紀錄
- [ ] 每週推薦：定期推播新書單
- [ ] 社群功能：看看同 MBTI 的人在讀什麼
- [ ] 買書導流：博客來 / Readmoo 聯盟行銷
- [ ] 訂閱付費牆：免費 3 次，之後需訂閱

---

## 免費額度說明

Gemini 1.5 Flash 每天免費 1,500 次請求，初期完全夠用。
等用戶超過 1,000 人/天再考慮升級。

API Key 申請：https://aistudio.google.com/apikey
