# 变更日志
此项目的所有显著变化都将记录在此文件中。

格式基于 [保持变更日志](https://keepachangelog.com/en/1.0.0/)，
遵循 [语义版本控制](https://semver.org/spec/v2.0.0.html)，
并由 [Changie](https://github.com/miniscruff/changie) 生成。


预发布更改
### 新增
* 支持 Gemini 1.5 Pro

## 0.8.24 - 2024-04-12
### 新增
* 支持改进的检索模型（Voyage 嵌入/重新排序）
* 新的 @code 上下文提供程序
* 个人使用分析

## 0.8.15 - 2024-03-05
### 新增
* Beta 版本的 Tab 自动完成功能

## 0.8.14 - 2024-03-03
### 新增
* 图片支持
* 用于检索的全文搜索索引
* 文档上下文提供程序
* CodeLlama-70b 支持
### 变更
* config.ts 仅在 NodeJS 中运行，不在浏览器中运行
### 修复
* 修复了 config.json 中的代理设置

## v0.8.2 - 2024-01-23
### 新增
* 添加 codellama 和 gemini 到免费试用，使用新服务器
* 使用 LanceDB 的本地代码库同步和嵌入
* 改进的 VS Code 主题匹配
### 变更
* 包装更新以下载适用于当前平台的本地模块（lancedb, sqlite, onnxruntime, tree-sitter wasms）
* 上下文提供程序现在从扩展端运行（在 Node.js 中而不是浏览器 javascript 中）

## v0.8.1 - 2024-01-08

### 新增

- 在 config.json 中添加 disableSessionTitles 选项

### 变更

- 默认使用 Ollama /chat 端点而不是原始补全，并使用 /show 端点收集模型参数，如上下文长度和停止标记

## v0.6.19 - 2024-01-05

### 新增

- 支持在工作区根目录中的 .continuerc.json 来覆盖 config.json
- 内联上下文提供程序
- cmd+shift+L 使用新的差异流式用户界面进行编辑

### 变更

- 允许某些 LLM 服务器处理模板

## v0.6.16 - 2023-12-25

### 变更

- 上下文项目现在作为过去消息的一部分保留，而不是停留在主输入中
- 不再需要 Python 服务器 - Continue 完全在 Typescript 中运行

## v0.6.4 - 2023-11-19

### 变更

- 迁移到 .json 配置文件格式

## v0.6.0 - 2023-11-10

### 新增

- 全屏模式
- 增强网络搜索的 StackOverflow 斜杠命令
- VS Code 上下文菜单：右键单击以将代码添加到上下文，调试终端或分享你的 Continue 会话

### 修复

- 通过与 socket.io 重构保持最新状态，提高 JetBrains 的可靠性

## v0.5.0 - 2023-11-09

### 新增

- 代码库检索：使用 /codebase 或 cmd+enter，Continue 将自动收集最重要的上下文

### 变更

- 从 Websockets 切换到 Socket.io