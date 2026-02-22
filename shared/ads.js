/**
 * SharedAds — 統一廣告系統模組
 * 
 * 使用方法：
 *   <script src="../shared/ads.js"></script>
 *   SharedAds.init();
 *   SharedAds.showInterstitial(() => { /* 跳過後執行 */ });
 * 
 * HTML 要求：
 * 頂部 Banner: <div id="ad-top"></div>
    * Modal 內: <div class="ad-slot-inline"></div>（可多個）
 * 插頁式: 自動生成，不需要手動加 HTML
    */
const SharedAds = (function () {
    let interstitialTimer = null;
    let skipCallback = null;

    function init() {
        _setupTopBanner();
        _setupInlineSlots();
        _createInterstitial();
        console.log("[SharedAds] Init OK");
    }

    // --- 頂部 Banner ---
    function _setupTopBanner() {
        const el = document.getElementById('ad-top');
        if (!el) return;
        el.className = 'ad-banner-top';
        if (!el.textContent.trim()) el.textContent = 'ADVERTISEMENT';
    }

    // --- Modal 內 Banner ---
    function _setupInlineSlots() {
        document.querySelectorAll('.ad-slot-inline').forEach(el => {
            if (!el.textContent.trim()) el.textContent = 'AD';
        });
    }

    // --- 插頁式廣告 ---
    function _createInterstitial() {
        if (document.getElementById('sharedInterstitialAd')) return;

        const overlay = document.createElement('div');
        overlay.id = 'sharedInterstitialAd';
        overlay.className = 'interstitial-overlay';
        overlay.innerHTML = `
            <p style="color:#ffd700; margin-bottom:15px; font-size:1.1rem;">✨ Preparing...</p>
            <div class="interstitial-ad-box">ADVERTISEMENT — Interstitial</div>
            <button id="sharedInterstitialSkipBtn" class="interstitial-skip" disabled>Skip in 5s</button>
        `;
        document.body.appendChild(overlay);

        document.getElementById('sharedInterstitialSkipBtn').addEventListener('click', _skipInterstitial);
    }

    function showInterstitial(callback, options = {}) {
        skipCallback = callback;
        const overlay = document.getElementById('sharedInterstitialAd');
        const skipBtn = document.getElementById('sharedInterstitialSkipBtn');
        if (!overlay || !skipBtn) { if (callback) callback(); return; }

        // 自定義提示文字
        const hint = overlay.querySelector('p');
        if (hint && options.message) hint.textContent = options.message;

        overlay.classList.add('active');
        skipBtn.disabled = true;
        skipBtn.style.borderColor = '#555';
        skipBtn.style.color = '#888';

        let countdown = options.countdown || 5;
        skipBtn.textContent = `Skip in ${countdown}s`;

        interstitialTimer = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(interstitialTimer);
                skipBtn.disabled = false;
                skipBtn.textContent = 'Skip Ad ▶';
                skipBtn.style.borderColor = '#ffd700';
                skipBtn.style.color = '#ffd700';
            } else {
                skipBtn.textContent = `Skip in ${countdown}s`;
            }
        }, 1000);
    }

    function _skipInterstitial() {
        if (interstitialTimer) clearInterval(interstitialTimer);
        const overlay = document.getElementById('sharedInterstitialAd');
        if (overlay) overlay.classList.remove('active');
        if (skipCallback) {
            skipCallback();
            skipCallback = null;
        }
    }

    /**
     * 檢查用戶是否已購買某工具的去廣告
     * @param {string} uid - 用戶 ID
     * @param {string} toolId - 工具 ID（例如 "instant-tarot"）
     * @returns {Promise<boolean>} 是否已去廣告
     */
    async function checkAdFree(uid, toolId) {
        if (!uid || !toolId) return false;
        try {
            const doc = await SharedFirebase.db.collection('user_credits').doc(uid).get();
            if (doc.exists) {
                const data = doc.data();
                const toolData = data.ad_free_tools && data.ad_free_tools[toolId];
                if (toolData && toolData.expires_at) {
                    const expiresAt = toolData.expires_at.toDate ? toolData.expires_at.toDate() : new Date(toolData.expires_at);
                    return expiresAt > new Date();
                }
            }
            return false;
        } catch (e) {
            console.error("[SharedAds] checkAdFree error:", e);
            return false;
        }
    }

    /**
     * 隱藏頁面上所有廣告元素
     */
    function hideAllAds() {
        document.querySelectorAll(
            '.ad-banner-top, .ad-banner-bottom, .ad-slot-inline, .interstitial-overlay, #ad-top'
        ).forEach(el => {
            el.style.display = 'none';
        });
        console.log("[SharedAds] All ads hidden (ad-free user)");
    }

    /**
     * 初始化時自動檢查去廣告狀態
     * 在 SharedAuth.init() 之後調用
     * @param {string} toolId - 當前工具的 ID
     */
    async function initWithAdFreeCheck(toolId) {
        init();
        // 監聽登入狀態，登入後自動檢查
        SharedFirebase.auth.onAuthStateChanged(async (user) => {
            if (user) {
                const isAdFree = await checkAdFree(user.uid, toolId);
                if (isAdFree) {
                    hideAllAds();
                }
            }
        });
    }

    return { init, showInterstitial, checkAdFree, hideAllAds, initWithAdFreeCheck };
})();
