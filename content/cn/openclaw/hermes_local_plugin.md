---
title: Hermes 本地插件
desc: 为 Hermes Agent 提供完全本地化的持久记忆、智能任务总结、技能自动进化和多智能体协同。
---

MemOS Hermes 本地插件为 **Hermes Agent** 提供完全本地化的持久记忆能力。所有数据存储在本机 SQLite（`~/.hermes/memos-state/`），零云依赖。Viewer 仅监听 127.0.0.1，密码保护。

## 核心特性

| 特性 | 说明 |
|------|------|
| 💾 全量记忆写入 | 每次对话自动捕获，语义分片后持久化。 |
| ⚡ 任务总结与技能进化 | 碎片对话归纳为结构化任务，再提炼为可复用技能并持续升级。 |
| 🔍 混合检索 | FTS5 + 向量，RRF，MMR，时间衰减。 |
| 🧠 全量可视化 | 记忆/任务/技能/分析/日志/导入/设置 7 个管理页。 |
| 💰 分级模型 | Embedding/摘要/技能可独立配置不同模型。 |
| 🤝 多智能体协同 | 记忆隔离 + 公共记忆 + 技能共享，多 Agent 协同进化。 |
| 🐍 Python 原生集成 | 通过 MemoryProvider 接口原生集成 Hermes Agent，无需额外配置网关。 |
| 👥 团队共享中心 | Hub-Client 架构，跨实例共享记忆/任务/技能。审批流程、角色管理、实时通知。 |
| 🔗 LLM 智能降级 | 技能模型 → 摘要模型 → Hermes 原生模型三级自动降级，零手动干预。 |

---

## 系统架构

Hermes Agent 通过 Python MemoryProvider 接口与 MemOS 桥接守护进程通信。四条流水线：记忆写入 → 任务总结与技能进化（异步）→ 智能检索 → 协同共享。每个 Agent 拥有独立记忆空间，通过公共记忆和技能共享实现协同进化。

```
流水线 1：写入
Hermes Agent → Bridge Daemon (TCP :18992) → Ingest (chunk→summary→embed→dedup) → SQLite+FTS5

流水线 2：任务 & 技能（异步）
Task Processor (话题检测 → 摘要) → Skill Evolver (评估 → 生成/升级)

流水线 3：自动召回
prefetch (auto-recall) → Recall (FTS+Vector) → LLM filter → Inject context

流水线 4：按需检索
Agent (memory_search) → RRF→MMR→Decay → LLM filter → excerpts+chunkId/task_id
→ task_summary / skill_get / memory_timeline
```

### 数据流

#### 写入
1. `sync_turn` → Bridge Daemon → Chunk → LLM Summary → Embed → Dedup → Store
2. 异步：任务检测 → 任务摘要 → 技能评估 → 技能生成/升级

#### 检索
1. 每轮自动：`prefetch` 用用户消息检索 → LLM 过滤相关 → 注入 system 上下文；无结果时提示 agent 自生成 query 调 `memory_search`。
2. `memory_search` → FTS5+Vector → RRF → MMR → Decay → LLM filter → excerpts + chunkId/task_id
3. `task_summary` / `skill_get`(skillId|taskId) / `memory_timeline`(chunkId) / `skill_install`

---

## 快速开始

### 前置条件

- **Node.js** ≥ 18
- **Python 3**
- **Hermes Agent** 已安装（`~/.hermes/hermes-agent` 或本地仓库）
- Embedding / Summarizer API 可选，不配自动用本地模型

### Step 1：一键安装（推荐）

一条命令完成所有安装，无需手动操作：

```bash
curl -fsSL https://raw.githubusercontent.com/MemTensor/MemOS/openclaw-local-plugin-20260408/apps/memos-local-plugin/install.sh | bash
```

#### 通过 npm 安装

```bash
mkdir -p ~/.hermes/memos-plugin && cd ~/.hermes/memos-plugin && npm pack @memtensor/memos-local-hermes-plugin && tar xzf *.tgz && mv package/* . && rm -rf package *.tgz && bash install.sh
```

::note
安装器做了什么？ 自动检测并安装 Node.js（如缺失）→ 从 npm 下载插件包 → 安装依赖 → 创建 `memtensor` 软链接到 Hermes 插件目录 → 更新 `~/.hermes/config.yaml` → 验证插件加载 → 启动 Bridge 守护进程和 Memory Viewer。
::

::warning
安装失败？最常见的问题是 `better-sqlite3` 原生模块编译失败。确保已安装编译工具链（`gcc`, `make`, `python3`）。在 Ubuntu/Debian 上：`apt install build-essential`。
::

### Step 2：开始使用

```bash
hermes chat
```

安装脚本会自动启动 Memory Viewer。之后每次运行 `hermes chat`，daemon 会自动拉起（如果尚未运行）。退出 hermes 后 daemon 继续后台运行。

::tip
安装后每次对话自动存入记忆。访问 `http://127.0.0.1:18901` 查看 Memory Viewer。
::

### Step 3：配置

**两种方式**：编辑 `~/.hermes/config.yaml` 或通过 Viewer 网页面板在线修改。支持分级模型。

#### 基本配置 (config.yaml)

```yaml
# ~/.hermes/config.yaml
memory:
  memory_enabled: true
  user_profile_enabled: true
  provider: memtensor
```

#### 模型分级配置（通过环境变量）

```bash
# Embedding — 轻量模型
export MEMOS_EMBEDDING_PROVIDER="openai_compatible"
export MEMOS_EMBEDDING_API_KEY="sk-••••••"
export MEMOS_EMBEDDING_ENDPOINT="https://your-api-endpoint/v1"

# 自定义端口
export MEMOS_DAEMON_PORT=18992
export MEMOS_VIEWER_PORT=18901

# 自定义数据目录
export MEMOS_STATE_DIR="/custom/path/memos-state"
```

#### 高级配置（通过 Bridge 配置 JSON）

```bash
export MEMOS_BRIDGE_CONFIG='{
  "stateDir": "~/.hermes/memos-state",
  "config": {
    "embedding": {
      "provider": "openai_compatible",
      "model": "bge-m3",
      "endpoint": "https://your-api-endpoint/v1",
      "apiKey": "sk-••••••"
    },
    "summarizer": {
      "provider": "openai_compatible",
      "model": "gpt-4o-mini",
      "endpoint": "https://your-api-endpoint/v1",
      "apiKey": "sk-••••••"
    },
    "skillEvolution": {
      "summarizer": {
        "provider": "openai_compatible",
        "model": "claude-4.6-opus",
        "endpoint": "https://your-api-endpoint/v1",
        "apiKey": "sk-••••••"
      }
    },
    "recall": {
      "vectorSearchMaxChunks": 0
    },
    "viewerPort": 18901
  }
}'
```

---

## 模块

### Capture
通过 `sync_turn` 接口捕获每轮 user/assistant 消息，通过 `on_memory_write` 捕获用户画像更新。经 Bridge 守护进程传入 Ingest 管线。

### Ingest
异步队列：语义分片 → LLM 摘要 → 向量化 → 智能去重（Top-5 相似 + LLM 判 DUPLICATE/UPDATE/NEW，UPDATE 合并摘要并追加内容）→ 存储；演化块记录 merge_history。

### 任务总结
异步逐轮检测任务边界：分组为用户回合 → 第一条直接分配 → 后续每条由 LLM 判断话题是否切换（强偏向 SAME，避免过度分割）→ 2h 超时强制切分 → 结构化摘要（目标/步骤/结果）。支持编辑、删除、重试技能生成。

### 技能进化
规则过滤 → LLM 评估（可重复/有价值的任务才生成技能）→ SKILL.md 生成（步骤/警告/脚本）/ 升级 → 质量评分 → 安装。LLM 使用三级降级链（技能模型 → 摘要模型 → Hermes 原生模型）。支持编辑、删除、设为公开/私有。

### Recall
FTS5+Vector → RRF(k=60) → MMR(λ=0.7) → Decay(14d) → Normalize → Filter(≥0.45) → Top-K。自动关联 Task/Skill。

### Viewer
7 页：记忆 CRUD/搜索/演化标识、任务（对话气泡）、技能（版本/下载）、分析、日志（工具调用输入输出）、导入、在线配置。密码保护。默认端口 `18901`。

---

## 检索算法

### RRF（倒数排名融合）

$$\text{RRF}(d) = \sum_i \frac{1}{k + \text{rank}_i(d) + 1}$$

### MMR（最大边际相关）

$$\text{MMR}(d) = \lambda \cdot \text{rel}(d) - (1-\lambda) \cdot \max \text{sim}(d, d_s)$$

### 时间衰减

$$\text{final} = \text{score} \times \bigl(0.3 + 0.7 \times 0.5^{t/14}\bigr)$$

---

## LLM 降级链

所有 LLM 调用（摘要、话题检测、去重、技能生成/升级）均使用三级自动降级机制：

```
skillSummarizer（技能专用模型，可选）→ summarizer（通用摘要模型）→ Hermes Native（自动检测）
```

- 每一级失败后自动尝试下一级，无需手动干预
- `skillSummarizer` 未配置时直接跳到 `summarizer`
- 如果所有模型均失败，回退到规则方法（无 LLM）或跳过该步骤

---

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `MEMOS_STATE_DIR` | `~/.hermes/memos-state` | 记忆数据库位置 |
| `MEMOS_DAEMON_PORT` | `18992` | Bridge 守护进程 TCP 端口 |
| `MEMOS_VIEWER_PORT` | `18901` | Memory Viewer HTTP 端口 |
| `MEMOS_EMBEDDING_PROVIDER` | `local` | Embedding 提供商 |
| `MEMOS_EMBEDDING_API_KEY` | — | Embedding API 密钥 |
| `MEMOS_EMBEDDING_ENDPOINT` | — | 自定义 Embedding 端点 |
| `MEMOS_BRIDGE_CONFIG` | — | 完整 Bridge 配置 JSON |
| `MEMOS_BRIDGE_SCRIPT` | — | Bridge 脚本路径覆盖 |
| `HERMES_HOME` | `~/.hermes` | Hermes 主目录 |

---

## 默认值

| 参数 | 默认 | 说明 |
|------|------|------|
| maxResults | 6 (max 20) | 默认返回数 |
| minScore (tool) | 0.45 | memory_search 最低分 |
| minScore (viewer) | 0.64 | Viewer 搜索向量阈值 |
| rrfK | 60 | RRF 融合常数 |
| mmrLambda | 0.7 | MMR 相关性 vs 多样性 |
| recencyHalfLife | 14d | 时间衰减半衰期 |
| vectorSearchMaxChunks | 0 (all) | 0=搜索全部；大库可设 200k-300k |
| dedup threshold | 0.75 | 语义去重余弦相似度 |
| viewerPort | 18901 | Memory Viewer |
| daemonPort | 18992 | Bridge Daemon TCP |
| owner | hermes | 记忆归属标识 |
| taskIdle | 2h | 任务空闲超时 |

---

## 更多资料

- [GitHub](https://github.com/MemTensor/MemOS/tree/main/apps/memos-local-plugin)
