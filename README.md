# douban-to-mastodon-sync
A Chrome extension to sync Douban status to Mastodon automatically

这是一个基于 Chrome Manifest V3 开发的浏览器扩展，能够在你发布豆瓣广播时，自动将其同步到指定的 Mastodon 实例。并不支持历史广播，仅支持新发布的广播。

✨ 功能特性
自动拦截：自动捕获豆瓣广播发布接口，无需手动点击同步按钮。
双层架构：采用 Main World 拦截请求与 Isolated World 处理逻辑的架构，完美绕过豆瓣严格的 CSP（内容安全策略）。
异步同步：后台自动处理同步，不影响豆瓣页面的正常使用。
配置持久化：通过插件选项页面安全存储你的实例地址和 Access Token。

🚀 快速开始
1. 安装插件
下载本项目代码到本地。
打开 Chrome 浏览器，访问 chrome://extensions/。
开启右上角的 “开发者模式”。
点击 “加载已解压的扩展程序”，选择本项目文件夹。

2. 配置信息
在扩展列表中找到“豆瓣同步助手”，点击其 “选项 (Options)” 或右键图标选择“选项”。
填写你的 Mastodon 实例地址（例如 https://mastodon.social）。
填写你的 Access Token（需在 Mastodon 设置 -> 开发 -> 新建应用中申请，勾选 write:statuses 权限）。
点击 保存。

3. 开始使用
刷新 豆瓣首页。
正常发布一条广播。
在控制台中你可以看到同步成功的日志，你的 Mastodon 也会同步更新该内容。

🛠️ 技术细节
注入机制：利用 web_accessible_resources 声明 injected.js，通过 DOM 注入方式绕过隔离限制。
数据通信：使用 window.postMessage 实现页面环境与插件隔离环境的安全通讯。
API 拦截：重写 XMLHttpRequest.prototype.send 以捕获豆瓣底层的 API 调用数据。

📂 文件结构
Plaintext
├── manifest.json         # 插件配置文件 (MV3)
├── content.js            # 桥梁脚本，负责读取存储并转发同步请求
├── injected.js           # 核心拦截脚本，运行在页面环境拦截 XHR
├── options.html          # 设置页面
├── options.js            # 处理设置保存与读取
└── README.md             # 项目说明文档

⚠️ 注意事项
刷新页面：初次安装或更新插件设置后，必须刷新豆瓣页面，拦截脚本才能生效。
隐私安全：你的 Token 仅存储在浏览器的 chrome.storage.local 中，不会上传到任何第三方服务器。

📄 开源协议
MIT License


Douban to Mastodon Sync (douban-to-mastodon-sync)
A Chrome Extension (Manifest V3) that automatically synchronizes your Douban statuses (broadcasts) to a specified Mastodon instance.

✨ Features
Automatic Interception: Captures Douban's status update API calls automatically. No manual "Sync" button required.

Dual-World Architecture: Utilizes a Main World injection for XHR interception and an Isolated World for logic handling, successfully bypassing Douban's strict Content Security Policy (CSP).

Async Synchronization: Syncing happens in the background without affecting the performance or user experience of the Douban website.

Secure Configuration: Safely stores your Instance URL and Access Token using chrome.storage.local.

🚀 Quick Start
1. Installation
Download or clone this repository to your local machine.

Open Chrome and navigate to chrome://extensions/.

Enable "Developer mode" in the top right corner.

Click "Load unpacked" and select the project folder.

2. Configuration
Find the "Douban to Mastodon Sync" extension in your list and click "Options".

Enter your Mastodon Instance URL (e.g., https://mastodon.social).

Enter your Access Token (Generated in Mastodon: Settings -> Development -> New Application, ensure write:statuses scope is checked).

Click Save.

3. Usage
Refresh your Douban homepage.

Post a status as usual.

Check the console for success logs; your status will appear on Mastodon shortly!

🛠️ Technical Details
Injection Mechanism: Uses web_accessible_resources to declare injected.js, which is then injected into the DOM to bypass environment isolation.

Communication: Implements window.postMessage to bridge the gap between the page environment (Main World) and the extension environment (Isolated World).

API Interception: Overwrites XMLHttpRequest.prototype.send to sniff and capture the raw text content of status updates before they are encrypted or sent.

📂 Project Structure
Plaintext
├── manifest.json         # Extension configuration (MV3)
├── content.js            # Bridge script: reads storage & handles sync requests
├── injected.js           # Core interceptor: runs in page context to catch XHR
├── options.html          # Configuration UI
├── options.js            # Logic for saving/loading settings
└── README.md             # Project documentation
⚠️ Notes
Refresh Required: You must refresh the Douban page after installation or updating settings for the interceptor to initialize properly.

Privacy: Your Access Token is stored locally in your browser via chrome.storage.local and is never uploaded to any third-party servers.

📄 License
MIT License