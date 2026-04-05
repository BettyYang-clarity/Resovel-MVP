# Resovel · API Key 安全修復任務

## 問題
目前 Gemini API Key 存在前端，任何人打開開發者工具都能看到。
必須在貼到 Threads 之前修復這個問題。

## 修復架構
```
之前：瀏覽器 → 直接呼叫 Gemini（Key 暴露）
之後：瀏覽器 → /api/recommend（後端）→ Gemini（Key 安全）
```

---

## 任務一：建立後端 API

把 `api/recommend.js` 複製進專案（已提供，不需要修改）

---

## 任務二：更新 src/lib/gemini.js

把 `src/lib/gemini.js` 替換成新版本（已提供）

主要改動：
- 移除 `GEMINI_API_KEY` 參數
- `fetch` 改成呼叫 `/api/recommend`
- 不再直接呼叫 Gemini

---

## 任務三：更新 App.jsx 的呼叫方式

找到 `handleSubmit` 裡的：
```jsx
const data = await getResovelRecommendation(user, GEMINI_API_KEY)
```
改成：
```jsx
const data = await getResovelRecommendation(user)
```

找到最上面的：
```jsx
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE'
```
直接刪除這行。

---

## 任務四：設定 Vercel 環境變數

請告知用戶執行以下步驟：

1. 去 Vercel Dashboard → resovel-mvp 專案
2. Settings → Environment Variables
3. 新增：
   - Name: `GEMINI_API_KEY`
   - Value: 你的 Gemini API Key
   - 勾選 Production / Preview / Development
4. 點 Save
5. 重新 Deploy（Deployments → 最新一筆 → Redeploy）

完成後，`VITE_GEMINI_API_KEY` 可以從 `.env` 移除。

---

## 任務五：本地測試

```bash
npm run dev
```

確認推薦功能正常，Network tab 裡看不到任何 Gemini API Key。

---

## 完成後確認清單

- [ ] `npm run dev` 推薦功能正常運作
- [ ] 打開瀏覽器開發者工具 → Network → 找到 `/api/recommend` 的請求
- [ ] 確認請求裡沒有 `key=` 參數（Key 已移到後端）
- [ ] Push 到 GitHub，Vercel 自動重新部署
- [ ] 在 Vercel 設定好 `GEMINI_API_KEY` 環境變數
- [ ] 到 https://resovel-mvp.vercel.app 確認線上版正常運作
