---
title: 云插件 vs 本地插件
desc: 两款插件都能为 OpenClaw 提供持久记忆能力，但面向的场景截然不同。本文将帮你快速理解两者的核心差异，找到最适合自己的方案。
---

## 插件简介

### 云插件

将记忆托管于 **MemOS Cloud**，配置一个 API Key 即可使用，支持多 Agent 跨设备共享记忆，经基准测试可降低约 **72% 的 Token 消耗**，适合快速上手或团队协作场景。

### 本地插件

将记忆完整存储于**本地机器（SQLite）**，零云依赖，支持混合检索（FTS5 + 向量）、Task 自动摘要与 Skill 自我进化，并附带本地 Memory Viewer 管理界面（7 个管理页面）。适合对隐私、安全或本地化运行有更高要求的开发者。

---

## 核心区别

| 对比维度 | ☁️&nbsp;MemOS&nbsp;云插件 | 🖥️&nbsp;MemOS&nbsp;本地插件 |
| --- | --- | --- |
| 💾&nbsp;**数据存储与隐私** | **云端存储**：记忆数据存储在 MemOS 云端，便于跨设备、多实例共享。隐私与安全依赖于云服务提供商。 | **本地存储**：所有数据（SQLite + 向量）存储在用户本地，支持完全离线运行，数据 100% 自主控制，满足最高隐私与安全要求。 |
| 🔑&nbsp;**API&nbsp;Key** | MemOS Cloud API Key（由 MemOS 提供） | Embedding 模型 API Key（自备，可配置本地模型免 Key） |
| 🔍&nbsp;**检索能力** | 云端语义向量检索 + 图检索 | FTS5 全文 + 向量混合召回（RRF + MMR + 时间衰减） |
| 🧠&nbsp;**记忆进化** | 由云端服务自动完成：对写入记忆进行结构化处理、去冗余与自然语言纠错 | 碎片对话自动归纳为结构化任务，任务完成后触发技能评估，自动生成或升级可复用 Skill |
| 👥&nbsp;**多&nbsp;Agent** | ✅ 支持（`multiAgentMode`，数据隔离） | ✅ 支持（内存隔离 + 公共记忆 + 技能共享） |
| 💡&nbsp;**额外能力** | • Token 成本降低 72%<br>• 自动记录所有对话<br>• 用户偏好专门分类<br>• 低时延，支持高并发生产环境 | • 全量记忆可视化（Web 管理面板，7 个页面）<br>• 原生记忆一键导入<br>• 分级模型配置（为不同任务分配不同模型） |
| 🛠️&nbsp;**部署与配置** | **极简**：三步完成（安装插件、获取 API Key、配置环境变量），主要依赖云服务。 | **中等**：需准备本地编译环境，自行配置 Embedding、Summarizer 等多个模型（支持本地或云端模型），灵活性高但初始设置稍复杂。 |

---

## 安装速览

### 云插件（3 步完成）

1. **安装插件**
    ```bash
    openclaw plugins install @memtensor/memos-cloud-openclaw-plugin@latest
    ```

2. **获取并配置 API Key**

    获取 API Key：[MemOS Cloud Dashboard](https://memos-dashboard.openmem.net/cn/apikeys/)

    ```bash
    mkdir -p ~/.openclaw && echo "MEMOS_API_KEY=mpg-..." > ~/.openclaw/.env
    ```

3. **重启 gateway**

    ```bash
    openclaw gateway restart
    ```


> 更多信息请参考 [Openclaw 云插件文档](/cn/openclaw/guide#快速开始)

### 本地插件（需先准备编译环境）
```bash
# macOS
xcode-select --install
# Linux
sudo apt install build-essential python3

# 安装插件
curl -fsSL https://cdn.memtensor.com.cn/memos-local-openclaw/install.sh | bash
```

> 构建完成后，将自动启动 openclaw gateway 以及 memos-local-openclaw-plugin 插件。接下来只需打开 http://127.0.0.1:18799 即可访问 Memory Viewer 并配置不同模型。
>
> 完整配置（Embedding、Summarizer、Skill Evolution 分级模型）请参考 [OpenClaw 本地插件文档](/cn/openclaw/local_plugin#快速开始)
