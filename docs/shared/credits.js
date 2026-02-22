/**
 * SharedCredits — 統一點數/付費系統
 * 處理 Credits 餘額查詢、消費、充值跳轉
 * 
 * 依賴：SharedFirebase（必須先載入 firebase-init.js）
 * 
 * 使用方法：
 *   <script src="../shared/credits.js"></script>
 *   SharedCredits.init();
 *   SharedCredits.getBalance();         // 取得餘額
 *   SharedCredits.useCredits(10);       // 消費 10 點
 *   SharedCredits.showTopupModal();     // 顯示充值 Modal
 */
const SharedCredits = (function () {
    const COLLECTION = "user_credits";

    /**
     * 取得用戶點數餘額
     * @param {string} uid - 用戶 ID
     * @returns {Promise<number>} 餘額
     */
    async function getBalance(uid) {
        if (!uid) {
            console.warn("[SharedCredits] No UID provided");
            return 0;
        }
        try {
            const doc = await SharedFirebase.db.collection(COLLECTION).doc(uid).get();
            if (doc.exists) {
                return doc.data().balance || 0;
            }
            return 0;
        } catch (e) {
            console.error("[SharedCredits] getBalance error:", e);
            return 0;
        }
    }

    /**
     * 消費點數
     * @param {string} uid - 用戶 ID
     * @param {number} amount - 消費點數
     * @param {string} reason - 消費原因（例如 "ai_analysis", "content_boost"）
     * @returns {Promise<{success: boolean, balance: number, message: string}>}
     */
    async function useCredits(uid, amount, reason = "usage") {
        if (!uid || amount <= 0) {
            return { success: false, balance: 0, message: "Invalid parameters" };
        }
        try {
            const ref = SharedFirebase.db.collection(COLLECTION).doc(uid);
            const doc = await ref.get();
            const currentBalance = doc.exists ? (doc.data().balance || 0) : 0;

            if (currentBalance < amount) {
                return { success: false, balance: currentBalance, message: "餘額不足" };
            }

            const newBalance = currentBalance - amount;
            await ref.set({
                balance: newBalance,
                lastUsed: firebase.firestore.FieldValue.serverTimestamp(),
                lastReason: reason
            }, { merge: true });

            // 記錄消費日誌
            await ref.collection("transactions").add({
                type: "debit",
                amount: -amount,
                reason: reason,
                balanceAfter: newBalance,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log(`[SharedCredits] Used ${amount} credits. Balance: ${newBalance}`);
            return { success: true, balance: newBalance, message: "OK" };
        } catch (e) {
            console.error("[SharedCredits] useCredits error:", e);
            return { success: false, balance: 0, message: e.message };
        }
    }

    /**
     * 增加點數（充值成功後調用）
     * @param {string} uid - 用戶 ID
     * @param {number} amount - 增加點數
     * @param {string} source - 來源（例如 "stripe_purchase", "bonus"）
     */
    async function addCredits(uid, amount, source = "purchase") {
        if (!uid || amount <= 0) return;
        try {
            const ref = SharedFirebase.db.collection(COLLECTION).doc(uid);
            await ref.set({
                balance: firebase.firestore.FieldValue.increment(amount),
                lastTopup: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // 記錄充值日誌
            const doc = await ref.get();
            await ref.collection("transactions").add({
                type: "credit",
                amount: amount,
                source: source,
                balanceAfter: doc.data().balance,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log(`[SharedCredits] Added ${amount} credits.`);
        } catch (e) {
            console.error("[SharedCredits] addCredits error:", e);
        }
    }

    /**
     * 建立充值 Modal（自動插入 DOM）
     * 可自訂套餐
     */
    function createTopupModal(options = {}) {
        const packages = options.packages || [
            { id: "basic", credits: 100, price: "$1.99", label: "入門" },
            { id: "pro", credits: 500, price: "$7.99", label: "🔥 最受歡迎", popular: true },
            { id: "premium", credits: 1500, price: "$19.99", label: "專業" }
        ];

        const modal = document.createElement("div");
        modal.id = "topupModal";
        modal.className = "modal";
        modal.innerHTML = `
            <div class="modal-content" style="max-width:550px;">
                <span class="modal-close" onclick="SharedCredits.hideTopupModal()">×</span>
                <h2 style="color:#ffd700; margin-bottom:8px;">💰 充值點數</h2>
                <p style="color:#999; font-size:0.9rem; margin-bottom:20px;">
                    目前餘額：<span id="topupBalanceDisplay" style="color:#ffd700; font-weight:700;">--</span> 點
                </p>
                <div style="display:grid; gap:12px;">
                    ${packages.map(pkg => `
                        <div onclick="SharedCredits._selectPackage('${pkg.id}')" 
                             id="pkg-${pkg.id}"
                             style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15);
                                    border-radius:12px; padding:16px; cursor:pointer; display:flex;
                                    justify-content:space-between; align-items:center;
                                    transition: border-color 0.2s;
                                    ${pkg.popular ? 'border-color:rgba(255,215,0,0.5);' : ''}">
                            <div>
                                <div style="font-size:1.1rem; font-weight:700;">${pkg.credits} 點</div>
                                <div style="font-size:0.8rem; color:#888;">${pkg.label}</div>
                            </div>
                            <div style="font-size:1.2rem; font-weight:700; color:#ffd700;">${pkg.price}</div>
                        </div>
                    `).join("")}
                </div>
                <button id="topupConfirmBtn" class="btn-primary" 
                        style="width:100%; margin-top:18px; opacity:0.5; pointer-events:none;"
                        onclick="SharedCredits._confirmPurchase()">
                    選擇套餐
                </button>
                <p style="color:#555; font-size:0.7rem; margin-top:10px;">
                    付款由 Stripe 安全處理。購買後點數立即到帳。
                </p>
            </div>
        `;
        document.body.appendChild(modal);
    }

    let _selectedPackage = null;
    let _onPurchaseCallback = null;

    function _selectPackage(id) {
        _selectedPackage = id;
        // 高亮選中套餐
        document.querySelectorAll("[id^='pkg-']").forEach(el => {
            el.style.borderColor = "rgba(255,255,255,0.15)";
        });
        const selected = document.getElementById("pkg-" + id);
        if (selected) selected.style.borderColor = "#ffd700";

        const btn = document.getElementById("topupConfirmBtn");
        if (btn) {
            btn.style.opacity = "1";
            btn.style.pointerEvents = "auto";
            btn.textContent = "確認購買";
        }
    }

    function _confirmPurchase() {
        if (!_selectedPackage) return;
        if (_onPurchaseCallback) {
            _onPurchaseCallback(_selectedPackage);
        } else {
            alert("付費功能即將推出！請期待。");
        }
    }

    /**
     * 顯示充值 Modal
     * @param {Function} onPurchase - 用戶確認購買後的回調，接收 packageId
     */
    async function showTopupModal(onPurchase) {
        _onPurchaseCallback = onPurchase || null;
        _selectedPackage = null;

        if (!document.getElementById("topupModal")) {
            createTopupModal();
        }

        // 更新餘額顯示
        const user = SharedAuth.getUser();
        if (user) {
            const balance = await getBalance(user.uid);
            const el = document.getElementById("topupBalanceDisplay");
            if (el) el.textContent = balance.toLocaleString();
        }

        // 重置按鈕
        const btn = document.getElementById("topupConfirmBtn");
        if (btn) {
            btn.style.opacity = "0.5";
            btn.style.pointerEvents = "none";
            btn.textContent = "選擇套餐";
        }

        document.getElementById("topupModal").classList.add("active");
    }

    function hideTopupModal() {
        const modal = document.getElementById("topupModal");
        if (modal) modal.classList.remove("active");
    }

    return {
        getBalance,
        useCredits,
        addCredits,
        showTopupModal,
        hideTopupModal,
        createTopupModal,
        _selectPackage,
        _confirmPurchase
    };
})();
