/**
 * SharedAds — 統一廣告系統模組
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

    function _setupTopBanner() {
        const el = document.getElementById('ad-top');
        if (!el) return;
        el.className = 'ad-banner-top';
        if (!el.textContent.trim()) el.textContent = 'ADVERTISEMENT';
    }

    function _setupInlineSlots() {
        document.querySelectorAll('.ad-slot-inline').forEach(el => {
            if (!el.textContent.trim()) el.textContent = 'AD';
        });
    }

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

        overlay.classList.add('active');
        skipBtn.disabled = true;
        let countdown = options.countdown || 5;
        skipBtn.textContent = `Skip in ${countdown}s`;

        interstitialTimer = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(interstitialTimer);
                skipBtn.disabled = false;
                skipBtn.textContent = 'Skip Ad ▶';
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

    async function checkAdFree(uid, toolId) {
        if (!uid || !toolId || typeof SharedFirebase === 'undefined') return false;
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

    function hideAllAds() {
        document.querySelectorAll('.ad-banner-top, .ad-banner-bottom, .ad-slot-inline, .interstitial-overlay, #ad-top').forEach(el => {
            el.style.display = 'none';
        });
        console.log("[SharedAds] All ads hidden");
    }

    async function initWithAdFreeCheck(toolId) {
        init();
        if (typeof SharedFirebase !== 'undefined' && SharedFirebase.auth) {
            SharedFirebase.auth.onAuthStateChanged(async (user) => {
                if (user) {
                    const isAdFree = await checkAdFree(user.uid, toolId);
                    if (isAdFree) hideAllAds();
                }
            });
        }
    }

    return { init, showInterstitial, checkAdFree, hideAllAds, initWithAdFreeCheck };
})();
