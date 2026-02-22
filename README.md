# 📦 oQoRun Website — 工具架構與開發紀錄

## 📖 工具介紹
**oQoRun** 是一款專為低配硬件設計的本地 AI 模型啟動器（Launcher）。它提供了 OpenAI 兼容的 API 接口，並支持即時的 UI 代碼預覽功能，讓舊筆記本也能輕鬆變身為 AI Agent 的後端引擎。

## 🏗️ 核心架構
- **前端技術**: 純 HTML5 + Vanilla CSS + JavaScript (ES6)。
- **共用模組**: 
    - 整合了全域的 `shared/` 資源，包括 `firebase-init.js`、`ads.js` 與 `style-base.css`。
    - 使用相對路徑 `./shared/` 以確保在自定義域名（GitHub Pages）環境下的連通性。
- **數據同步**: 使用 Firebase Firestore (Compat SDK 10.7.1) 進行實時下載量與點贊量統計。
- **廣告系統**: 使用 `SharedAds` 模組，在下載前強制插入 5 秒插頁式廣告，實現商業變現。

## ✨ 主要功能
1. **實時計數器**: 自動同步並顯示全網 `Likes` 與 `Downloads` 數據。
2. **圖片輪播 (Carousel)**: 
    - 位於頁面中部，展示軟體介面截圖（1.png - 6.png）。
    - 支援每 5 秒自動播放。
    - 提供手動左右切換按鈕及導航圓點。
    - **智能暫停**: 滑鼠懸停時自動停止播放，移開後恢復。
3. **容錯設計**: 
    - 腳本採用分離式架構，即使 Firebase 或廣告資源加載失敗，輪播功能依然能正常工作。
4. **GitHub Pages 優化**: 
    - 包含 `.nojekyll` 檔案，確保 GitHub 不會過濾 `shared` 等資源文件夾。

## 🛠️ 開發修復紀錄 (2026-02-22)
1. **路徑修復**: 
    - 將 `../shared/` 遷移為 `./shared/` 並物理搬遷目錄，解決了線上自定義域名導致的 404 資源缺失問題。
2. **連結修復**: 
    - 修正了 `oQoRun.zip` 的下載路徑。
    - 驗證並更換了無效的 `Buy me a coffee` 佔位連結。
3. **功能實現**: 從零開發了響應式的圖片輪播組件。
4. **部署優化**: 解決了引發 404 的 Jekyll 緩存過濾問題，確保全量部署。

---
*本文件由 Antigravity AI 整理，作為 AQutoQo 架構的一部分。*
