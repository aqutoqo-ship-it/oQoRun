/**
 * SharedAuth — 統一 Google 登入模組
 * 
 * 依賴：firebase-init.js（必須先載入）
 * 
 * 使用方法：
 *   <script src="../shared/auth.js"></script>
 *   SharedAuth.init();   // 自動監聽登入狀態、更新 UI
 *   SharedAuth.login();  // 觸發 Google 登入
 *   SharedAuth.logout(); // 登出
 *   SharedAuth.getUser(); // 取得當前用戶（或 null）
 * 
 * HTML 要求（可選，有就自動處理）：
 *   <button id="loginBtnNav">Login</button>
 *   <div id="userInfoBlock" class="hidden">
 *       <img id="userAvatar" src="" alt="User">
 *       <span id="userName">User</span>
 *       <button id="logoutBtn">Logout</button>
 *   </div>
 *   <div id="loginModal" class="modal">...</div>
 */
const SharedAuth = (function () {
    let currentUser = null;
    let onLoginCallback = null;
    let onLogoutCallback = null;

    function init(options = {}) {
        if (options.onLogin) onLoginCallback = options.onLogin;
        if (options.onLogout) onLogoutCallback = options.onLogout;

        SharedFirebase.auth.onAuthStateChanged(user => {
            currentUser = user;
            if (user) {
                _updateUI(true, user);
                if (onLoginCallback) onLoginCallback(user);
            } else {
                _updateUI(false, null);
                if (onLogoutCallback) onLogoutCallback();
            }
        });
    }

    function login() {
        const provider = new firebase.auth.GoogleAuthProvider();
        SharedFirebase.auth.signInWithPopup(provider)
            .then(() => {
                const modal = document.getElementById('loginModal');
                if (modal) modal.classList.remove('active');
            })
            .catch(err => {
                console.error("[SharedAuth] Login error:", err.message);
                alert("Login failed: " + err.message);
            });
    }

    function logout() {
        SharedFirebase.auth.signOut().then(() => {
            console.log("[SharedAuth] Logged out");
        });
    }

    function getUser() {
        return currentUser;
    }

    function showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) modal.classList.add('active');
    }

    function _updateUI(loggedIn, user) {
        const loginBtn = document.getElementById('loginBtnNav');
        const userInfo = document.getElementById('userInfoBlock');
        const avatar = document.getElementById('userAvatar');
        const name = document.getElementById('userName');

        if (loggedIn && user) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (userInfo) {
                userInfo.classList.remove('hidden');
                userInfo.style.display = 'flex';
            }
            if (avatar) avatar.src = user.photoURL || '';
            if (name) name.textContent = user.displayName || 'User';
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (userInfo) {
                userInfo.classList.add('hidden');
                userInfo.style.display = 'none';
            }
        }
    }

    return { init, login, logout, getUser, showLoginModal };
})();
