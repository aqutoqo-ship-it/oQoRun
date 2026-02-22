/**
 * SharedFirebase — 統一 Firebase 初始化模組
 * 所有工具共用同一個 Firebase 項目
 * 
 * 使用方法：
 *   <script src="../shared/firebase-init.js"></script>
 *   const { db, auth } = SharedFirebase;
 */
const SharedFirebase = (function () {
    const config = {
        apiKey: "AIzaSyCDrqPK_AiDv2GngbVgA4IxUmJLI9jNQ6Y",
        authDomain: "aqutoqos.firebaseapp.com",
        projectId: "aqutoqos",
        storageBucket: "aqutoqos.firebasestorage.app",
        messagingSenderId: "1043970378673",
        appId: "1:1043970378673:web:6c50c0a95a5f635c2e4b90",
        measurementId: "G-EDZXWFC6K7"
    };

    let db = null;
    let auth = null;

    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }
        db = firebase.firestore();
        
        // Ensure auth component is loaded
        if (typeof firebase.auth === 'function') {
            auth = firebase.auth();
            console.log("[SharedFirebase] Init OK (with Auth)");
        } else {
            console.warn("[SharedFirebase] Auth module not detected. Auth features disabled.");
        }
    } catch (e) {
        console.error("[SharedFirebase] Error:", e.message);
    }

    return { db, auth, config };
})();
