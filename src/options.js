document.getElementById('save').onclick = async () => {
  const instance = document.getElementById('instance').value.replace(/\/$/, "");
  const token = document.getElementById('token').value;
  const status = document.getElementById('status');

  const oldData = await chrome.storage.local.get(['instance']);
  const oldOrigin = oldData.instance ? oldData.instance + '/*' : null;
  const newOrigin = instance + '/*';

  const granted = await chrome.permissions.request({ origins: [newOrigin] });
  if (!granted) {
    status.textContent = '❌ 需要授权才能访问该实例，请重试。';
    setTimeout(() => status.textContent = '', 3000);
    return;
  }

  if (oldOrigin && oldOrigin !== newOrigin) {
    await chrome.permissions.remove({ origins: [oldOrigin] });
  }

  chrome.storage.local.set({ instance, token }, () => {
    status.textContent = '✅ 设置已保存！请刷新豆瓣页面生效。';
    setTimeout(() => status.textContent = '', 2000);
  });
};

chrome.storage.local.get(['instance', 'token'], (res) => {
  if (res.instance) document.getElementById('instance').value = res.instance;
  if (res.token) document.getElementById('token').value = res.token;
});
