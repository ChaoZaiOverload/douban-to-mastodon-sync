const TAG = "🚀 [SYNC-BG]";

chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type !== "SYNC_TO_MASTODON") return;
    const { text, instance, token, doubanId, syncedAt } = message;
    syncToMastodon(text, instance, token, doubanId, syncedAt);
});

async function syncToMastodon(text, instance, token, doubanId, syncedAt) {
    try {
        const response = await fetch(`${instance}/api/v1/statuses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: text, visibility: "public" })
        });

        if (response.ok) {
            const mastodonPost = await response.json();
            console.log(`${TAG} 🎉 同步成功！mastodonId=${mastodonPost.id} doubanId=${doubanId} syncedAt=${syncedAt}`);
            await chrome.storage.session.set({ pendingToast: { message: '已同步到 Mastodon ✓', success: true } });
        } else {
            const err = await response.text();
            console.error(`${TAG} ❌ 同步失败:`, response.status, err);
            await chrome.storage.session.set({ pendingToast: { message: `同步失败 (${response.status})`, success: false } });
        }
    } catch (err) {
        console.error(`${TAG} ❌ 网络错误:`, err);
        await chrome.storage.session.set({ pendingToast: { message: '同步失败：网络错误', success: false } });
    }
}
