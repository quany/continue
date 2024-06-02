---
title: 💻 运行
description: 扩展插件支持 idea 和 vscode
keywords: [introduction, intro, continue, autopilot, chatgpt]
---

# 💻 说明

> 总得来说，也是分前后端，后端服务在 core 里面，前端是在 gui 里面，插件都是用 webview 加载了 gui 的前端，插件提供了环境，底层的 api 给gui 调用；

### 运行服务 Core Binary

- 跑起来会有个问题，需要把 binary/bin下面的 node_sqlite3.node 拷贝到 binary/build/下