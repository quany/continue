---
title: 💻 安装
description: Continue is the open-source autopilot for software development
keywords: [introduction, intro, continue, autopilot, chatgpt]
---

# 💻 依赖安装

> 安装依赖的时候，它是所有架构的都下载了一遍资源，所以可以针对自己电脑的架构做一些保留删除，去 binary/build.js 把 targe 保留自己电脑上的即可；列如我是 M2 芯片的苹果电脑：
```js
let targets = [
  // "darwin-x64",
  "darwin-arm64",
  // "linux-x64",
  // "linux-arm64",
  // "win32-x64",
];

const targetToLanceDb = {
  "darwin-arm64": "@lancedb/vectordb-darwin-arm64",
  // "darwin-x64": "@lancedb/vectordb-darwin-x64",
  // "linux-arm64": "@lancedb/vectordb-linux-arm64-gnu",
  // "linux-x64": "@lancedb/vectordb-linux-x64-gnu",
  // "win32-x64": "@lancedb/vectordb-win32-x64-msvc",
  // "win32-arm64": "@lancedb/vectordb-win32-x64-msvc", // they don't have a win32-arm64 build
};

```

有较多的外网访问，为了安装顺利在 scripts/install-dependencies.sh 加入 VPN 代理，列如：

```sh
export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890
```
