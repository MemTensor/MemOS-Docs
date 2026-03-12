---
title: OpenClaw Local Plugin
desc: Fully local persistent memory, smart task summarization, auto skill evolution, and multi-agent collaboration for OpenClaw. 
---

Prior to the local version, we released the [MemOS Cloud OpenClaw Plugin](/en/openclaw/guide) powered by MemOS Cloud services. This plugin utilizes MemOS's cloud memory service to provide OpenClaw with cross-device and cross-instance long-term memory capabilities, making it ideal for team collaboration or multi-environment deployments.

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
 
### **Step0. Prepare build environment (macOS / Linux)**
 
This plugin uses `better-sqlite3`, a native C/C++ module. On macOS and Linux, prebuilt binaries may not be available, so install C++ build tools first to ensure a smooth installation:
 
```bash
# macOS
xcode-select --install
 
# Linux (Ubuntu / Debian)
sudo apt install build-essential python3
```

> Windows users: `better-sqlite3` ships prebuilt binaries for Windows + Node.js LTS, so you can usually skip this step and go directly to Step 1. If installation still fails, install Visual Studio Build Tools (select "C++ build tools" workload).<br>
>
> Already have build tools? Skip to Step 1. Not sure? Run the install command above — it's safe to re-run.<br>
> 
> Still having issues? See the [Troubleshooting](https://memos-claw.openmem.net/docs/troubleshooting.html) section, the detailed troubleshooting guide, or [the official better-sqlite3 troubleshooting docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md).
 
### **Step1. Install the plugin**
 
```bash
openclaw plugins install @memtensor/memos-local-openclaw-plugin
```
 
The plugin is installed under `~/.openclaw/extensions/memos-local-openclaw-plugin` and registered as `memos-local-openclaw-plugin`. Dependencies and `better-sqlite3` native module are built automatically during installation.

The plugin is installed under `~/.openclaw/extensions/memos-local-openclaw-plugin` and registered as `memos-local-openclaw-plugin`. Dependencies and `better-sqlite3` native module are built automatically during installation.

> **Note:** The Memory Viewer starts only when the **OpenClaw gateway** is running. After install, **configure** `openclaw.json` (step 2) and **start the gateway** (step 3); the viewer will then be available at `http://127.0.0.1:18799`.
>
> **Installation failed?** If `better-sqlite3` compilation fails during install, manually rebuild after ensuring build tools are installed:
> ```bash
> cd ~/.openclaw/extensions/memos-local-openclaw-plugin && npm rebuild better-sqlite3
> ```
 
**From source (development):**
 
```bash
git clone https://github.com/MemTensor/MemOS.git
cd MemOS/apps/memos-local-openclaw
npm install && npm run build
openclaw plugins install .
```
 
### Step2. Configure
 
Add the plugin config to `~/.openclaw/openclaw.json`:
 
```json
{
  "agents": {
    "defaults": {
      // IMPORTANT: Disable OpenClaw's built-in memory to avoid conflicts
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
**Critical:** You must set `agents.defaults.memorySearch.enabled` to `false`. Otherwise OpenClaw's built-in memory search runs alongside this plugin, causing duplicate retrieval and wasted tokens.
::
 
#### Embedding Provider Options
 
| Provider | `provider` value | Example `model` | Notes |
|---|---|---|---|
| OpenAI / compatible | `openai_compatible` | `bge-m3`, `text-embedding-3-small` | Any OpenAI-compatible API |
| Gemini | `gemini` | `text-embedding-004` | Requires `apiKey` |
| Cohere | `cohere` | `embed-english-v3.0` | Separates document/query embedding |
| Voyage | `voyage` | `voyage-2` | |
| Mistral | `mistral` | `mistral-embed` | |
| Local (offline) | `local` | — | Uses `Xenova/all-MiniLM-L6-v2`, no API needed |

::tip
**No embedding config?** The plugin falls back to the local model automatically. You can start with zero configuration and add a cloud provider later for better quality.
::
 
#### Summarizer Provider Options
 
| Provider | `provider` value | Example `model` |
|---|---|---|
| OpenAI / compatible | `openai_compatible` | `gpt-4o-mini` |
| Anthropic | `anthropic` | `claude-3-haiku-20240307` |
| Gemini | `gemini` | `gemini-1.5-flash` |
| AWS Bedrock | `bedrock` | `anthropic.claude-3-haiku-20240307-v1:0` |

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