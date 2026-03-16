---
title: 云插件 vs 本地插件：对比与选型指南
desc: 两款插件都能为 OpenClaw 提供持久记忆能力，但面向的场景截然不同。本文将帮你快速理解两者的核心差异，找到最适合自己的方案。
---

## 插件简介

### ☁️ Cloud 版

将记忆托管于 **MemOS Cloud**，配置一个 API Key 即可使用，支持多 Agent 跨设备共享记忆，经基准测试可降低约 **72% 的 Token 消耗**，适合快速上手或团队协作场景。

### 🖥️ 本地版

将记忆完整存储于**本地机器（SQLite）**，零云依赖，支持混合检索（FTS5 + 向量）、Task 自动摘要与 Skill 自我进化，并附带本地 Memory Viewer 管理界面（7 个管理页面）。适合对隐私、安全或本地化运行有更高要求的开发者。

---

## 核心区别对比

| 对比维度 | ☁️ Cloud 版 | 🖥️ 本地版 |
| --- | --- | --- |
| 💾 **记忆存储位置** | MemOS Cloud 托管服务（云端） | 本地机器（SQLite 文件） |
| 🔑 **API Key** | MemOS Cloud API Key（MemOS 提供） | Embedding 模型 API Key（自备，可配置本地模型免 Key） |
| 🔍 **检索能力** | 云端语义向量检索 | FTS5 全文 + 向量混合检索（RRF + MMR + 时间衰减） |
| 🧠 **技能演化** | ❌ 不支持 | ✅ 支持 Task 自动摘要 & Skill 自我进化 |
| 👥 **多 Agent** | ✅ 支持（`multiAgentMode`，数据隔离） | ✅ 支持（内存隔离 + 公共记忆 + 技能共享） |
| 🛠️ **配置复杂度** | 低（填写 API Key 即可启用） | 较高（需部署本地环境，含编译依赖） |

---

## 功能详细对比

### 记忆检索

| | ☁️ Cloud 版 | 🖥️ 本地版 |
| --- | --- | --- |
| 检索方式 | 云端语义向量检索 | FTS5 全文 + 向量双路召回，RRF 融合 |
| 重排策略 | — | MMR（兼顾相关性与多样性）|
| 时间衰减 | — | ✅（默认半衰期 14 天）|
| LLM 相关性过滤 | — | ✅（过滤无效候选，判断是否充分）|

### 记忆写入

两款插件均通过相同的生命周期钩子工作：

- **`before_agent_start`** → 从记忆库检索相关内容，注入 Agent 上下文（用户不可见）
- **`agent_end`** → 将本轮对话写入记忆持久化存储

本地版额外支持：内容哈希去重（SHA-256，防止同一会话重复写入）、语义分片、LLM 逐块摘要。

### 任务摘要与技能进化（仅本地版）

本地版在记忆写入之上，额外提供两条进化流水线：

**任务生成**：将碎片对话自动归纳为结构化任务记录（目标 → 步骤 → 结果 → 关键细节），便于 Agent 通过 `task_summary` 快速定位完整经验，而不仅仅是碎片 chunk。

**技能进化**：已完成的任务自动触发技能评估——若与已有技能相关（置信度 ≥ 0.7），则升级现有技能；若无相关技能，则新建技能并打分（≥ 6 分自动安装）。Agent 每次遇到类似问题时，直接复用沉淀的 Skill，速度更快、更省 Token。

---

## 适用场景选型

| 使用场景 | ☁️ Cloud 版 | 🖥️ 本地版 |
| --- | --- | --- |
| 个人开发者 / 快速原型验证 | ✅ **推荐** | ⚪ 可用 |
| 多 Agent 跨机器共享记忆 | ✅ **推荐** | ❌ 不适合 |
| 高度隐私 / 敏感数据（金融、医疗、法律） | ❌ 不适合 | ✅ **推荐** |
| 离线 / 内网隔离环境 | ❌ 不适合 | ✅ **推荐** |
| 需要 Skill 自动演化与 Task 摘要 | ❌ 不支持 | ✅ **推荐** |
| 本地开发调试，需可视化管理界面 | ⚪ 可用 | ✅ **推荐** |
| 希望零运维、开箱即用 | ✅ **推荐** | ❌ 不适合 |

---

## 安装速览

### ☁️ Cloud 版（3 步完成）
```bash
# 1. 安装插件
openclaw plugins install @memtensor/memos-cloud-openclaw-plugin@latest

# 2. 配置 API Key
mkdir -p ~/.openclaw && echo "MEMOS_API_KEY=mpg-..." > ~/.openclaw/.env

# 3. 重启 gateway
openclaw gateway restart
```

获取 API Key：[MemOS Cloud Dashboard](https://memos-dashboard.openmem.net/cn/apikeys/)

> 更多信息请参考 [Openclaw 云插件文档](/cn/openclaw/guide)。

### 🖥️ 本地版（需先准备编译环境）
```bash
# macOS
xcode-select --install
# Linux
sudo apt install build-essential python3

# 安装插件
openclaw plugins install @memtensor/memos-local-openclaw-plugin

# 重启 gateway
openclaw gateway stop && openclaw gateway start
```

安装完成后，Memory Viewer 将在 `http://127.0.0.1:18799` 上线。

> 完整配置（Embedding、Summarizer、Skill Evolution 分级模型）请参考 [OpenClaw 本地插件文档](/cn/openclaw/local_plugin)。
