---
title: OpenClaw Local Plugin
desc: Fully local persistent memory, smart task summarization, auto skill evolution, and multi-agent collaboration for OpenClaw. 
---

Prior to the local version, we released the [MemOS Cloud OpenClaw Plugin](/openclaw/guide) powered by MemOS Cloud services. This plugin utilizes MemOS's cloud memory service to provide OpenClaw with cross-device and cross-instance long-term memory capabilities, making it ideal for team collaboration or multi-environment deployments.

In contrast, the local version of the MemOS OpenClaw plugin stores all data locally, supporting offline operation and complete data autonomy. It is designed for developers with stricter requirements for privacy, security, or localized operation. Both versions are fully open source, allowing developers to choose the solution that best fits their needs.

## Features
| Feature | Description |
|------|------|
| 💾 Full-Write | Auto-captures every conversation, chunks semantically. |
| ⚡ Tasks & Skills | Conversations organized into tasks, then distilled into skills that auto-upgrade. |
| 🔍 Hybrid Search | FTS5 + vector, RRF, MMR, recency decay. |
| 🧠 Visualization | 7 pages: memories, tasks, skills, analytics, logs, import, settings. |
| 💰 Tiered Models | Each pipeline configurable with different models. |
| 🤝 Multi-Agent | Memory isolation + public memory + skill sharing for collective evolution. |
| 🦐 Native Memory Import | One-click migration from OpenClaw built-in memories with smart dedup, resume, and real-time progress. |

---

## How It Works: Four Intelligent Pipelines
![How It Works](https://cdn.memtensor.com.cn/img/1773303645495_57v4o4_compressed.png)

### Pipeline 1: Memory Write (auto on every agent turn)
 
```
Conversation → Capture (filter roles, strip system prompts)
→ Semantic chunking (code blocks, paragraphs, error stacks)
→ Content hash dedup → LLM summarize each chunk
→ Vector embedding → Store (SQLite + FTS5 + Vector)
```
 
- System messages are skipped; tool results from the plugin's own tools are not re-stored
- Evidence wrapper blocks (`[STORED_MEMORY]...[/STORED_MEMORY]`) are stripped to prevent feedback loops
- Content hash (SHA-256, first 16 hex chars) prevents duplicate chunk ingestion within the same session+role
 

### Pipeline 2: Task Generation (auto after memory write)
 
```
New chunks → Group into user-turns → Process one turn at a time
→ Warm-up (first user turn): assign directly
→ Each subsequent user turn: LLM topic judge (context vs new message)
  → "NEW"? → Finalize current task, create new task
  → "SAME"? → Assign to current task
→ Time gap > 2h? → Always split regardless of topic
→ Finalize: Chunks ≥ 4 & turns ≥ 2? → LLM structured summary → status = "completed"
  → Otherwise → status = "skipped" (excluded from search)
```
 
**Why Tasks matter:**
 
- Raw memory chunks are fragmented — a single conversation about "deploying Nginx" might span 20 chunks
- Task summarization organizes these fragments into a structured record: Goal → Steps → Result → Key Details
- When the agent searches memory, it can quickly locate the complete experience via `task_summary`, not just fragments
- Task summaries preserve code, commands, URLs, configs, and error messages
 
### Pipeline 3: Skill Evolution (auto after task completion)
 
```
Completed task → Rule filter (min chunks, non-trivial content)
→ Search for related existing skills
  → Related skill found (confidence ≥ 0.7)?
    → Evaluate upgrade (refine/extend/fix) → Merge new experience → Version bump
  → No related skill (or confidence < 0.3)?
    → Evaluate create → Generate SKILL.md + scripts + evals
    → Quality score (0-10) → Install if score ≥ 6
```
 
**Why Skills matter:**
 
- Without skills, agents rediscover solutions every time they encounter similar problems
- Skills crystallize successful executions into reusable guides with steps, pitfall warnings, and verification checks
- Skills auto-upgrade when new tasks bring improved approaches — getting faster, more accurate, and more token-efficient
- The evolution is automatic: task completes → evaluate → create/upgrade → install
 
 
### Pipeline 4: Smart Retrieval
 
**Auto-recall (every turn):** The plugin hooks `before_agent_start`, runs a memory search with the user's message, then uses an LLM to filter which candidates are relevant and whether they are sufficient to answer. The filtered memories are injected into the agent's system context (invisible to the user). If no memories are found or the query is long/unclear, the agent is prompted to call `memory_search` with a self-generated short query.
 
**On-demand search(`memory_search`)：**
 
```
Query → FTS5 + Vector dual recall → RRF Fusion → MMR Rerank
→ Recency Decay → Score Filter → Top-K (e.g. 20)
→ LLM relevance filter (minimum information) → Dedup by excerpt overlap
→ Return excerpts + chunkId / task_id (no summaries)
  → sufficient=false → suggest task_summary(taskId), skill_get(taskId), memory_timeline(chunkId)
```
 
- **RRF (Reciprocal Rank Fusion):** Merges FTS5 and vector search rankings into a unified score
- **MMR (Maximal Marginal Relevance):** Re-ranks to balance relevance with diversity
- **Recency Decay:** Recent memories get a boost (half-life: 14 days by default)
- **LLM filter:** Only memories that are genuinely useful for the query are returned; sufficiency determines whether follow-up tool tips are appended

---

## Quick Start

### **Step1. Install the plugin**
 
```bash
# macOS/Linux
curl -fsSL https://cdn.memtensor.com.cn/memos-local-openclaw/install.sh | bash

# Windows
powershell -c "irm https://cdn.memtensor.com.cn/memos-local-openclaw/install.ps1 | iex"
```
 
The plugin is installed under `~/.openclaw/extensions/memos-local-openclaw-plugin` and registered as `memos-local-openclaw-plugin`. Dependencies and `better-sqlite3` native module are built automatically during installation.

> **Note:** After the build is complete, the Openclaw Gateway and the memos-local-openclaw-plugin will start automatically. Then simply open `http://127.0.0.1:18799` to access Memory Viewer and configure different models.
>
> **Installation failed?** If `better-sqlite3` compilation fails during install, manually rebuild after ensuring build tools are installed:
> ```bash
> cd ~/.openclaw/extensions/memos-local-openclaw-plugin && npm rebuild better-sqlite3
> ```
> Still having issues? See the [Troubleshooting](https://memos-claw.openmem.net/docs/troubleshooting.html) section, the detailed troubleshooting guide, or [the official better-sqlite3 troubleshooting docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md).

#### **Upgrading for existing users?**

You do **not** need to uninstall or reinstall. Plugin code and your data are separate: memory data lives under `~/.openclaw/memos-local/` (e.g. `memos.db`), and the plugin under `~/.openclaw/extensions/memos-local-openclaw-plugin`. Upgrading only updates the plugin code and does not clear existing memories.

**Run the install command again** (fetches and installs the latest version):
```bash
# macOS/Linux
curl -fsSL https://cdn.memtensor.com.cn/memos-local-openclaw/install.sh | bash

# Windows
powershell -c "irm https://cdn.memtensor.com.cn/memos-local-openclaw/install.ps1 | iex"
```

::note
Running the command above automatically checks whether `memos-local-openclaw-plugin` is already installed. If it is a first-time setup, it installs the plugin automatically; if it is already installed, it upgrades automatically while preserving existing local memory files.
::

Your `openclaw.json` config and local database are preserved; no need to reconfigure or migrate.

**Upgrade failing or CLI errors?** If the upgrade cannot complete, remove the plugin directory and reinstall:

```bash
rm -rf ~/.openclaw/extensions/memos-local-openclaw-plugin
openclaw plugins install @memtensor/memos-local-openclaw-plugin
```

If after removing the directory the next install reports **config invalid**, the config still references the plugin but the directory is gone. Edit `~/.openclaw/openclaw.json` and remove entries related to `memos-local-openclaw-plugin` (e.g. `plugins.allow`, `plugins.slots.memory`, `plugins.entries.memos-local-openclaw-plugin`), save, then run the install command again. Before uninstalling or reinstalling, back up `~/.openclaw/memos-local/` to keep your memory data.
 
### Step2. Configure

Modify online via the Viewer web panel or edit `openclaw.json`. Supports hierarchical models.

**Method 1: Web panel http://127.0.0.1:18799 - Click 'Settings' after login**

<img src="https://cdn.memtensor.com.cn/img/1773317848162_edd2du_compressed.jpeg" alt="Web panel online modification" style="max-width: 800px;" />

**Method 2: Add the plugin config to `~/.openclaw/openclaw.json`**
 
```json
{
  "plugins": {
    "slots": { "memory": "memos-local" },
    "entries": { "memos-local": {
      "config": {
        "embedding": {                           // required
          "provider": "openai_compatible",
          "model": "bge-m3",
          "endpoint": "https://your-api-endpoint/v1",
          "apiKey": "sk-••••••"
        },
        "summarizer": {                          // mid-tier
          "provider": "openai_compatible",
          "model": "gpt-4o-mini",
          "endpoint": "https://your-api-endpoint/v1",
          "apiKey": "sk-••••••"
        },
        "skillEvolution": {
          "summarizer": {                        // high-quality
            "provider": "openai_compatible",
            "model": "claude-4.6-opus",
            "endpoint": "https://your-api-endpoint/v1",
            "apiKey": "sk-••••••"
          }
        }
      }
    }}
  }
}
```
 
#### Embedding Provider Options
 
| Provider | `provider` value | Example `model` | Notes |
|--------|------------------|-----------------|-------|
| OpenAI / compatible | `openai_compatible` | `bge-m3`, `text-embedding-3-small` | Any OpenAI-compatible API |
| OpenAI | `openai` | `text-embedding-3-small` | Default endpoint: `https://api.openai.com/v1` |
| Azure OpenAI | `azure_openai` | Same as OpenAI compatible | Configure Azure endpoint and apiKey |
| Zhipu AI | `zhipu` | `embedding-3` | Default endpoint: `https://open.bigmodel.cn/api/paas/v4` |
| SiliconFlow | `siliconflow` | `BAAI/bge-m3` | Default endpoint: `https://api.siliconflow.cn/v1` |
| Alibaba Bailian | `bailian` | `text-embedding-v3` | Default endpoint: `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| Gemini | `gemini` | `text-embedding-004` | Requires apiKey, uses Google API |
| Cohere | `cohere` | `embed-english-v3.0` | Document/query embedding handled separately |
| Voyage | `voyage` | `voyage-3` | Default endpoint: `https://api.voyageai.com/v1` |
| Mistral | `mistral` | `mistral-embed` | Default endpoint: `https://api.mistral.ai/v1` |
| Local (offline) | `local` | — | Uses `Xenova/all-MiniLM-L6-v2` (384d), no API needed |

::tip
Embedding must be configured.
::
 
#### Summarizer Provider Options
 
| Provider | `provider` value | Example `model` | Notes |
|--------|------------------|-----------------|-------|
| OpenAI / compatible | `openai_compatible` | `gpt-4o-mini` | Any OpenAI-compatible Chat API |
| OpenAI | `openai` | `gpt-4o-mini` | Default endpoint: `https://api.openai.com/v1` |
| Azure OpenAI | `azure_openai` | Same as OpenAI compatible | Configure Azure endpoint and apiKey |
| Zhipu AI | `zhipu` | `glm-4-flash` | Default endpoint: `https://open.bigmodel.cn/api/paas/v4` |
| SiliconFlow | `siliconflow` | `Qwen/Qwen2.5-7B-Instruct` | Default endpoint: `https://api.siliconflow.cn/v1` |
| Alibaba Bailian | `bailian` | `qwen-max` | Default endpoint: `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| Cohere | `cohere` | Chat-compatible model | Configure endpoint and apiKey |
| Mistral | `mistral` | Chat-compatible model | Default endpoint: `https://api.mistral.ai/v1` |
| Voyage | `voyage` | Chat-compatible model | Default endpoint: `https://api.voyageai.com/v1` |
| Anthropic | `anthropic` | `claude-3-haiku-20240307` | Default endpoint: `https://api.anthropic.com/v1/messages` |
| Gemini | `gemini` | `gemini-2.0-flash` | Requires apiKey |
| AWS Bedrock | `bedrock` | `anthropic.claude-3-haiku-20240307-v1:0` | Configure endpoint (e.g. `https://bedrock-runtime.us-east-1.amazonaws.com`) |

::tip 
**No summarizer config?** The plugin automatically falls back to the OpenClaw native model (auto-detected from `~/.openclaw/openclaw.json`). If that is also unavailable, a rule-based fallback generates summaries from the first sentence + key entities. Good enough to start.
::
 
#### Skill Evolution Configuration (Optional)

You can optionally configure a dedicated model for skill generation (for higher quality skills):
 
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
 
**LLM fallback chain:** `skillSummarizer` → `summarizer` → OpenClaw native model (auto-detected from `~/.openclaw/openclaw.json`). If `skillSummarizer` is not configured, the plugin tries the regular `summarizer`, then falls back to the OpenClaw native model. Each step in the chain is tried automatically if the previous one fails.
 
#### Environment Variable Support
 
Use `${ENV_VAR}` placeholders in config to avoid hardcoding keys:
 
```json
{
  "apiKey": "${OPENAI_API_KEY}"
}
```
 
### Step3. Start or Restart the Gateway
 
```bash
openclaw gateway stop    # if already running
openclaw gateway install # ensure LaunchAgent is installed (macOS)
openclaw gateway start
```
 
Once the gateway is up, the plugin loads and starts the Memory Viewer at `http://127.0.0.1:18799`.
 
 
### Step4. Verify Installation
 
```bash
tail -20 ~/.openclaw/logs/gateway.log
```
 
You should see:
 
```
memos-local: initialized (db: ~/.openclaw/memos-local/memos.db)
memos-local: started (embedding: openai_compatible)
╔══════════════════════════════════════════╗
║  MemOS Memory Viewer                     ║
║  → http://127.0.0.1:18799               ║
║  Open in browser to manage memories      ║
╚══════════════════════════════════════════╝
```
 
### Step5. Verify Memory is Working
 
- **Step A** — Have a conversation with your OpenClaw agent about anything.
 
- **Step B** — Open the Memory Viewer at `http://127.0.0.1:18799` and check that the conversation appears.
 
- **Step C** — In a new conversation, ask the agent to recall what you discussed:
 
  ```
  You: Do you remember what I asked you to help me with before?
  Agent: (Calls memory_search) Yes, we previously discussed...
  ```

---
## More

- [MemOS OpenClaw Local Plugin Official Website](https://memos-claw.openmem.net/)
- [GitHub](https://github.com/MemTensor/MemOS/tree/main/apps/memos-local-openclaw)
- [npm](https://www.npmjs.com/package/@memtensor/memos-local-openclaw-plugin)
