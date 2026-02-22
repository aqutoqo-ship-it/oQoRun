# Shared Modules — 共用模組技術文檔

> 本資料夾包含所有工具共用的模組。新工具只需引入這些檔案即可獲得登入、廣告、樣式功能。

## 檔案清單

| 檔案 | 功能 | 大小 |
|---|---|---|
| `firebase-init.js` | Firebase 初始化（統一配置） | ~1KB |
| `auth.js` | Google 登入/登出 + UI 自動更新 | ~3KB |
| `ads.js` | 廣告系統（Banner + 插頁式） | ~3KB |
| `style-base.css` | 深色主題基礎樣式 | ~4KB |

## 快速開始

### 1. HTML 引入順序（順序很重要）

```html
<!-- CSS -->
<link href="../shared/style-base.css" rel="stylesheet">

<!-- Firebase SDK（必須在共用模組之前） -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

<!-- 共用模組 -->
<script src="../shared/firebase-init.js"></script>
<script src="../shared/auth.js"></script>
<script src="../shared/ads.js"></script>
```

### 2. JavaScript 初始化

```javascript
// 取得 Firebase 實例
const { db, auth } = SharedFirebase;

// 初始化登入（自動處理 UI）
SharedAuth.init({
    onLogin: (user) => { console.log("Logged in:", user.displayName); },
    onLogout: () => { console.log("Logged out"); }
});

// 初始化廣告（自動插入所有廣告位）
SharedAds.init();
```

### 3. 顯示插頁式廣告

```javascript
// 在執行主要操作前顯示
SharedAds.showInterstitial(() => {
    // 用戶跳過廣告後執行的代碼
    startMyFunction();
}, {
    message: "✨ Preparing your result...",
    countdown: 5
});
```

## API 參考

### SharedFirebase
| 屬性/方法 | 說明 |
|---|---|
| `.db` | Firestore 實例 |
| `.auth` | Firebase Auth 實例 |
| `.config` | Firebase 配置對象 |

### SharedAuth
| 方法 | 說明 |
|---|---|
| `.init(options?)` | 初始化，可選 `{ onLogin, onLogout }` 回調 |
| `.login()` | 觸發 Google 登入彈窗 |
| `.logout()` | 登出 |
| `.getUser()` | 返回當前用戶對象或 `null` |
| `.showLoginModal()` | 顯示登入 Modal（需要 `#loginModal` 元素） |

### SharedAds
| 方法 | 說明 |
|---|---|
| `.init()` | 初始化所有廣告位 |
| `.showInterstitial(callback, options?)` | 顯示插頁式廣告，跳過後調用 callback |

options 參數：
- `message` (string): 自定義提示文字，預設 "✨ Preparing..."
- `countdown` (number): 倒計時秒數，預設 5
