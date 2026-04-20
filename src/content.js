// content.js
const TAG = "🚀 [SYNC-CORE]";

// 1. 使用外部文件注入方式 (绕过 CSP)
function injectScriptFile() {
    // 核心保护：如果环境还没准备好，等待 document 加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectScriptFile);
        return;
    }

    // 检查是否失效
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
        // 如果失效，提示用户，但不再抛出红字错误
        console.warn(`${TAG} ⚠️ 插件上下文已更新，请手动刷新页面以继续使用。`);
    }
}

// 2. 监听来自 injected.js 的同步请求
window.addEventListener("message", async (event) => {
    if (event.source !== window || event.data?.type !== "DOUBAN_POST_SUCCESS") return;

    const text = event.data.text;
    console.log(`${TAG} 收到同步请求，准备读取存储配置...`);

    // 3. 读取存储 (适配你的 options.js 键名)
    chrome.storage.local.get(['instance', 'token'], async (res) => {
        if (res.instance && res.token) {
            await syncToMastodon(text, res.instance, res.token);
        } else {
            console.error(`${TAG} ❌ 同步失败：未找到配置信息。`);
        }
    });
});

// 4. 执行同步到 Mastodon
async function syncToMastodon(text, instance, token) {
    try {
        const response = await fetch(`${instance}/api/v1/statuses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: text,
                visibility: "public"
            })
        });

        if (response.ok) {
            console.log(`${TAG} 🎉 Mastodon 同步成功！`);
        } else {
            const err = await response.text();
            console.error(`${TAG} ❌ 同步失败:`, response.status, err);
        }
    } catch (err) {
        console.error(`${TAG} ❌ 网络错误:`, err);
    }
}

// 初始化注入
injectScriptFile();