// injected.js
(function() {
    const TAG_ACTIVE = "🚀 [SYNC-ACTIVE]";
    const originalSend = XMLHttpRequest.prototype.send;
    const originalOpen = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function(method, url) {
        this._debugUrl = url;
        return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function(data) {
        const url = this._debugUrl || "";
        // 匹配豆瓣广播/话题发布接口
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
                    this.addEventListener('load', function() {
                        if (this.status >= 200 && this.status < 300) {
                            console.log(TAG_ACTIVE, "✨ 捕获到内容，通过消息隧道发送...");
                            // 发送给 content.js
                            window.postMessage({ type: "DOUBAN_POST_SUCCESS", text: rawText }, "*");
                        }
                    });
                }
            } catch (e) { console.error(TAG_ACTIVE, "解析失败", e); }
        }
        return originalSend.apply(this, arguments);
    };
    console.log(TAG_ACTIVE, "外部拦截脚本已注入并运行");
})();