
(function() {
    const TAG = "🚀 [SYNC-ACTIVE]";
    
    // --- 配置区域 ---
    const MASTODON_TOKEN = "";
    const MASTODON_INSTANCE = ""; // 例如 https://cmx.im
    // ----------------

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method, url) {
        this._debugUrl = url;
        return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(data) {
        const url = this._debugUrl || "";
        
        // 匹配主页和话题发布接口
        if (url.includes('topic/post') || url.includes('rexxar/api/v2/status')) {
            try {
                let rawText = "";
                if (typeof data === 'string' && data.trim().startsWith('{')) {
                    const bodyObj = JSON.parse(data);
                    if (bodyObj.content) {
                        const contentObj = JSON.parse(bodyObj.content);
                        rawText = contentObj.blocks.map(b => b.text).join('\n');
                    }
                }

                if (rawText) {
                    console.log(`${TAG} ✨ 捕获到内容:`, rawText);

                    this.addEventListener('load', function() {
                        if (this.status >= 200 && this.status < 300) {
                            console.log(`${TAG} ✅ 豆瓣发布成功，正在同步...`);
                            syncToMastodon(rawText);
                        }
                    });
                }
            } catch (e) {
                console.error(`${TAG} 解析失败:`, e);
            }
        }
        return originalSend.apply(this, arguments);
    };

    async function syncToMastodon(text) {
        try {
            const response = await fetch(`${MASTODON_INSTANCE}/api/v1/statuses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${MASTODON_TOKEN}`,
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
                console.error(`${TAG} ❌ 同步失败，状态码:`, response.status);
            }
        } catch (err) {
            console.error(`${TAG} ❌ 网络错误:`, err);
        }
    }
})();