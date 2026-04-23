const TAG = "🚀 [SYNC-CORE]";

// 1. 使用外部文件注入方式 (绕过 CSP)
function injectScriptFile() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectScriptFile);
        return;
    }

    try {
        if (!chrome.runtime || !chrome.runtime.getURL) {
            throw new Error("Context invalidated");
        }

        const s = document.createElement('script');
        s.src = chrome.runtime.getURL('injected.js');
        s.onload = () => s.remove();
        (document.head || document.documentElement).appendChild(s);
        console.log(`${TAG} ✅ 注入成功`);
    } catch (e) {
        console.warn(`${TAG} ⚠️ 插件上下文已更新，请手动刷新页面以继续使用。`);
    }
}

// 2. 检查并显示待显示的结果（加载时 + 监听后续写入）
function checkAndShowToast() {
    chrome.storage.local.get(['pendingToast'], (res) => {
        if (res.pendingToast && Date.now() - res.pendingToast.at < 30000) {
            chrome.storage.local.remove('pendingToast');
            showToast(res.pendingToast.message, res.pendingToast.success);
        }
    });
}

checkAndShowToast();

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.pendingToast?.newValue) {
        chrome.storage.local.remove('pendingToast');
        const { message, success } = changes.pendingToast.newValue;
        showToast(message, success);
    }
});

// 3. 监听来自 injected.js 的同步请求，转发给 background
window.addEventListener("message", async (event) => {
    if (event.source !== window || event.data?.type !== "DOUBAN_POST_SUCCESS") return;

    const { text, doubanId, syncedAt } = event.data;
    console.log(`${TAG} 收到同步请求 doubanId=${doubanId} syncedAt=${syncedAt}，准备读取存储配置...`);

    chrome.storage.local.get(['instance', 'token'], (res) => {
        if (res.instance && res.token) {
            chrome.runtime.sendMessage({
                type: "SYNC_TO_MASTODON",
                text,
                instance: res.instance,
                token: res.token,
                doubanId,
                syncedAt
            });
        } else {
            console.error(`${TAG} ❌ 同步失败：未找到配置信息。`);
            chrome.storage.local.set({ pendingToast: { message: '同步失败：请先配置实例和令牌', success: false, at: Date.now() } });
        }
    });
});

// 4. 在页面上显示结果提示
function showToast(message, success) {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed',
        top: '24px',
        left: '24px',
        padding: '10px 18px',
        borderRadius: '6px',
        background: success ? '#2e7d32' : '#c62828',
        color: '#fff',
        fontSize: '14px',
        fontFamily: 'sans-serif',
        zIndex: '2147483647',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        transition: 'opacity 0.4s',
        opacity: '1',
    });
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// 初始化注入
injectScriptFile();
