---
title: OpenClaw 本地插件
desc: 为 OpenClaw 提供完全本地化的持久记忆、智能任务总结、技能自动进化和多智能体协同。
---

在发布本地版本之前，我们已经推出过基于 MemOS Cloud 云服务的 [MemOS Cloud OpenClaw 插件](/cn/openclaw/guide)。该插件通过 MemOS 的云端记忆服务，为 OpenClaw 提供跨设备、跨实例的长期记忆能力，适合团队协作或多环境部署。

而本地版 MemOS OpenClaw 插件，所有数据都存储在用户本地，支持离线运行与完全的数据自主控制，适合对隐私、安全或本地化运行有更高要求的开发者。两个版本均已全开源，开发者可根据需求选择最合适的方案。

## 核心特性
| 特性 | 说明 |
|------|------|
| 💾 全量记忆写入 | 每次对话自动捕获，语义分片后持久化。 |
| ⚡ 任务总结与技能进化 | 碎片对话归纳为结构化任务，再提炼为可复用技能并持续升级。 |
| 🔍 混合检索 | FTS5 + 向量，RRF，MMR，时间衰减。 |
| 🧠 全量可视化 | 内置 Web 管理面板，记忆 / 任务 / 技能完全透明可控，共 7 个管理页。 |
| 💰 分级模型 | Embedding 轻量、摘要中等、技能高质量——按需分配，大幅省钱。 |
| 🤝 多智能体协同 | 记忆隔离 + 公共记忆 + 技能共享，多个 Agent 协同进化。 |
| 🦐 原生记忆导入 | 一键迁移 OpenClaw 内置记忆，智能去重、断点续传、实时进度。 |

---

## 工作原理：四条智能流水线
![工作原理](https://cdn.memtensor.com.cn/img/1773300395672_1ee6v8_compressed.png)

### 流水线 1：记忆写入（每轮对话自动触发）
 
```
对话 → Capture（过滤角色，剥离系统提示）
→ 语义分片（代码块、段落、错误栈）
→ 内容哈希去重 → LLM 逐块摘要
→ 向量化 → 存储（SQLite + FTS5 + Vector）
```
 
- 系统消息自动跳过；插件自身工具的调用结果不会被重复存储
- 证据包装块（`[STORED_MEMORY]...[/STORED_MEMORY]`）会被剥离，防止反馈循环
- 内容哈希（SHA-256，前 16 位十六进制）防止同一会话+角色内的重复 chunk 写入
 

### 流水线 2：任务生成（记忆写入后自动触发）
 
```
新 chunks → 按用户轮次分组 → 逐轮处理
→ 热身（第一轮用户消息）：直接分配
→ 后续每轮用户消息：LLM 话题判断（上下文 vs 新消息）
  → "NEW"？→ 结束当前任务，创建新任务
  → "SAME"？→ 归入当前任务
→ 时间间隔 > 2h？→ 无论话题如何，强制分割
→ 收尾：chunks ≥ 4 且 turns ≥ 2？→ LLM 结构化摘要 → status = "completed"
  → 否则 → status = "skipped"（排除在检索之外）
```
 
**为什么任务很重要：**
 
- 原始记忆 chunks 是碎片化的——一段关于「部署 Nginx」的对话可能横跨 20 个 chunk
- 任务摘要将这些碎片整理成结构化记录：目标 → 步骤 → 结果 → 关键细节
- 当 Agent 检索记忆时，可通过 `task_summary` 快速定位完整的经验，而不仅仅是碎片
- 任务摘要完整保留代码、命令、URL、配置和错误信息
 
### 流水线 3：技能进化（任务完成后自动触发）
 
```
已完成的任务 → 规则过滤（最小 chunks 数，排除无意义内容）
→ 检索相关已有技能
  → 找到相关技能（置信度 ≥ 0.7）？
    → 评估升级（refine/extend/fix）→ 合并新经验 → 版本号递增
  → 无相关技能（或置信度 < 0.3）？
    → 评估新建 → 生成 SKILL.md + 脚本 + 验证项
    → 质量评分（0–10）→ 分数 ≥ 6 则自动安装
```
 
**为什么技能很重要：**
 
- 没有技能，Agent 每次遇到类似问题都要重新摸索解决方案
- 技能将成功的执行过程固化为可复用的指南，包含步骤、踩坑警告和验证检查项
- 当新任务带来更优方案时，技能自动升级——速度更快、更准确、更省 Token
- 进化是全自动的：任务完成 → 评估 → 新建/升级 → 安装
 
 
### 流水线 4：智能检索
 
**自动召回（每轮触发）：** 插件挂载 `before_agent_start` 钩子，用用户消息执行一次记忆检索，再通过 LLM 过滤哪些候选记忆真正相关、是否足以回答当前问题。过滤后的记忆注入 Agent 的 system context（用户不可见）。若未检索到记忆，或查询过长/不清晰，则提示 Agent 自行生成简短 query 并调用 `memory_search`。
 
**按需检索（`memory_search`）：**
 
```
查询 → FTS5 + 向量双路召回 → RRF 融合 → MMR 重排
→ 时间衰减 → 分数过滤 → Top-K（如 20 条）
→ LLM 相关性过滤（最小信息量）→ 按摘录重叠去重
→ 返回 excerpts + chunkId / task_id（不含摘要）
  → sufficient=false → 建议调用 task_summary(taskId)、skill_get(taskId)、memory_timeline(chunkId)
```
 
- **RRF（倒数排名融合）**：将 FTS5 和向量检索的排名合并为统一得分
- **MMR（最大边际相关）**：重排以兼顾相关性与多样性
- **时间衰减**：近期记忆获得加权提升（默认半衰期 14 天）
- **LLM 过滤**：仅返回对当前查询真正有用的记忆；是否充分决定是否追加后续工具调用提示

---

## 快速开始
 
### **Step0. 准备编译环境（macOS / Linux）**
 
本插件依赖 `better-sqlite3`（一个原生 C/C++ 模块）。在 macOS 和 Linux 上，预编译二进制文件可能不可用，因此需要先安装 C++ 编译工具以确保安装顺利：
 
```bash
# macOS
xcode-select --install
 
# Linux (Ubuntu / Debian)
sudo apt install build-essential python3
```
 
> Windows 用户：`better-sqlite3` 为 Windows + Node.js LTS 提供了预编译二进制文件，通常可以跳过此步骤，直接进入 Step1。如果安装仍然失败，请安装 Visual Studio Build Tools（选择「C++ build tools」工作负载）。
> 
> 已有编译工具？跳至 Step1。不确定？直接运行上面的命令——重复执行是安全的。
> 
> 仍有问题？请查看[排查指南](https://memos-claw.openmem.net/docs/troubleshooting.html)或 [better-sqlite3 官方排查文档](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md)。
 
### **Step1. 安装插件**
 
```bash
openclaw plugins install @memtensor/memos-local-openclaw-plugin
```
 
插件将安装至 `~/.openclaw/extensions/memos-local-openclaw-plugin`，并以 `memos-local-openclaw-plugin` 注册。依赖项和 `better-sqlite3` 原生模块会在安装过程中自动构建。

> **注意**：Memory Viewer 仅在 OpenClaw gateway 运行时才会启动。安装后，请先完成 `openclaw.json` 配置（Step2），再启动 gateway（Step3），之后即可在 `http://127.0.0.1:18799` 访问 Viewer。
> 
> 安装失败？如果 `better-sqlite3` 在安装时编译失败，确认已安装编译工具后，手动重新构建：
> 
> ```bash
> cd ~/.openclaw/extensions/memos-local-openclaw-plugin && npm rebuild better-sqlite3
> ```
 
从源码安装（开发模式）：
 
```bash
git clone https://github.com/MemTensor/MemOS.git
cd MemOS/apps/memos-local-openclaw
npm install && npm run build
openclaw plugins install .
```
 
### Step2. 配置
 
将插件配置添加到 `~/.openclaw/openclaw.json`：
 
```json
{
  "agents": {
    "defaults": {
      // 重要：禁用 OpenClaw 内置记忆，避免冲突
      "memorySearch": {
        "enabled": false
      }
    }
  },
  "plugins": {
    "slots": {
      "memory": "memos-local-openclaw-plugin"
    },
    "entries": {
      "memos-local-openclaw-plugin": {
        "enabled": true,
        "config": {
          "embedding": {
            "provider": "openai_compatible",
            "endpoint": "https://your-api-endpoint/v1",
            "apiKey": "sk-••••••",
            "model": "bge-m3"
          },
          "summarizer": {
            "provider": "openai_compatible",
            "endpoint": "https://your-api-endpoint/v1",
            "apiKey": "sk-••••••",
            "model": "gpt-4o-mini",
            "temperature": 0
          }
        }
      }
    }
  }
}
```

::warning 
**关键配置**：必须将 `agents.defaults.memorySearch.enabled` 设为 `false`。否则 OpenClaw 内置的记忆检索会与本插件同时运行，导致重复检索和 Token 浪费。
::
 
#### Embedding 提供者选项
 
| 提供者 | `provider` 值 | 示例模型 | 备注 |
|--------|--------------|----------|------|
| OpenAI / 兼容接口 | `openai_compatible` | `bge-m3`, `text-embedding-3-small` | 任何 OpenAI 兼容 API |
| Gemini | `gemini` | `text-embedding-004` | 需要 apiKey |
| Cohere | `cohere` | `embed-english-v3.0` | 文档/查询分开 embedding |
| Voyage | `voyage` | `voyage-2` | — |
| Mistral | `mistral` | `mistral-embed` | — |
| 本地离线 | `local` | — | 使用 `Xenova/all-MiniLM-L6-v2`，无需 API |

::tip
未配置 Embedding？插件会自动降级到本地模型。你可以零配置直接启动，之后再按需切换到云端提供者以获得更好的效果。
::
 
#### Summarizer 提供者选项
 
| 提供者 | `provider` 值 | 示例模型 |
|--------|--------------|----------|
| OpenAI / 兼容接口 | `openai_compatible` | `gpt-4o-mini` |
| Anthropic | `anthropic` | `claude-3-haiku-20240307` |
| Gemini | `gemini` | `gemini-1.5-flash` |
| AWS Bedrock | `bedrock` | `anthropic.claude-3-haiku-20240307-v1:0` |

::tip 
未配置 Summarizer？插件会自动降级到 OpenClaw 原生模型（从 `~/.openclaw/openclaw.json` 自动检测）。如该模型也不可用，则使用基于规则的 fallback，从首句 + 关键实体生成摘要。足够用来起步。
::
 
#### Skill Evolution 配置（可选）
 
可为技能生成单独配置一个更高质量的模型：
 
```json
{
  "config": {
    "skillSummarizer": {
      "provider": "anthropic",
      "apiKey": "sk-ant-xxx",
      "model": "claude-sonnet-4-20250514",
      "temperature": 0
    },
    "skillEvolution": {
      "enabled": true,
      "autoEvaluate": true,
      "autoInstall": false
    }
  }
}
```
 
LLM 降级链：`skillSummarizer` → `summarizer` → OpenClaw 原生模型（自动检测）。链上每一步失败后自动尝试下一步。
 
#### 环境变量支持
 
在配置中使用 `${ENV_VAR}` 占位符，避免硬编码密钥：
 
```json
{
  "apiKey": "${OPENAI_API_KEY}"
}
```
 
### Step3. 启动或重启 Gateway
 
```bash
openclaw gateway stop    # 如果已在运行
openclaw gateway install # 确保 LaunchAgent 已安装（macOS）
openclaw gateway start
```
 
Gateway 启动后，插件加载完成，Memory Viewer 将在 `http://127.0.0.1:18799` 上线。
 
 
### Step4. 验证安装
 
```bash
tail -20 ~/.openclaw/logs/gateway.log
```
 
应看到如下输出：
 
```
memos-local: initialized (db: ~/.openclaw/memos-local/memos.db)
memos-local: started (embedding: openai_compatible)
╔══════════════════════════════════════════╗
║  MemOS Memory Viewer                     ║
║  → http://127.0.0.1:18799               ║
║  Open in browser to manage memories      ║
╚══════════════════════════════════════════╝
```
 
### Step5. 验证记忆功能
 
- **Step A** — 与 OpenClaw Agent 进行任意对话。
 
- **Step B** — 打开 Memory Viewer（`http://127.0.0.1:18799`），确认对话内容已出现在记忆列表中。
 
- **Step C** — 新开一个对话，让 Agent 回忆之前的内容：
 
  ```
  你：你还记得我之前让你帮我处理过什么事情吗？
  Agent：（调用 memory_search）是的，我们之前讨论过……
  ```

---
## 更多资料

- [MemOS Openclaw 本地插件官网](https://memos-claw.openmem.net/)
- [GitHub](https://github.com/MemTensor/MemOS/tree/main/apps/memos-local-openclaw)
- [npm](https://www.npmjs.com/package/@memtensor/memos-local-openclaw-plugin)