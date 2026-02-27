---
title: OpenClaw 配置指南
desc: 按照以下步骤操作，即可在几分钟内让 Agent 具备记忆能力。
---

## MemOS Cloud 两步安装

### 1. 快速启动 (Quick Start)

只需 3 步，即可让你的 Agent 具备基础记忆能力。

#### 1.1 安装 OpenClaw

确保你的系统中已安装 OpenClaw 环境：

```bash
# 安装最新版
npm install -g openclaw@latest

# 初始化并配置启动
openclaw onboard
```

### 2. 获取并配置 API Key

#### 2.1 获取 Key

登陆/注册 MemOS Cloud 获取你的 API Key 🔗 [MemOS Cloud](https://memos-dashboard.openmem.net/cn/apikeys/)

#### 2.2 设置变量

终端中一键完成最简配置：

```bash
mkdir -p ~/.openclaw && echo "MEMOS_API_KEY=mpg-..." > ~/.openclaw/.env
```

#### 2.3 安装插件并测试

##### 2.3.1 安装

```bash
openclaw plugins install github:MemTensor/MemOS-Cloud-OpenClaw-Plugin
openclaw gateway restart
```

##### 2.3.2 插件会自动开始运行

- **运行前**: 从 MemOS Cloud 检索相关记忆并注入上下文
- **运行后**: 将本次对话保存至 MemOS Cloud

现在，我们就完成配置啦！可以开始进行测试了～

## 开源项目进阶配置

如果希望进一步解锁更多可能性，还可以通过 MemOS Github 项目进行进一步探索和配置！

### 环境变量深度定制

除了必需的 API Key，你还可以通过环境变量调整插件行为。

更多细节配置项可以见 [MemTensor GitHub 官方插件仓库](https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin)

## 测试记忆功能

现在，可以与你的 Agent 进行多轮对话，例如:

**第一次会话:**
- "我最喜欢的编程语言是 Python"
- "我正在开发一个电商项目"

**第二次会话(新启动):**
- "你还记得我喜欢用什么编程语言吗?"
- "我之前说的项目进展如何?"

现在，你的 OpenClaw 会从 MemOS Cloud 中检索记忆并给出准确回答啦～
