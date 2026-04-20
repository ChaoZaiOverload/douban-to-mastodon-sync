document.getElementById('save').onclick = () => {
  const instance = document.getElementById('instance').value.replace(/\/$/, ""); // 去掉末尾斜杠
  const token = document.getElementById('token').value;
  chrome.storage.local.set({ instance, token }, () => {
    const status = document.getElementById('status');
    status.textContent = '✅ 设置已保存！请刷新豆瓣页面生效。';
    setTimeout(() => status.textContent = '', 2000);
  });
};

chrome.storage.local.get(['instance', 'token'], (res) => {
  if (res.instance) document.getElementById('instance').value = res.instance;
  if (res.token) document.getElementById('token').value = res.token;
});