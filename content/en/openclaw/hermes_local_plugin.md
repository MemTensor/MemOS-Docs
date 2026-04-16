---
title: Hermes Local Plugin
desc: Fully local persistent memory, smart task summarization, auto skill evolution, and multi-agent collaboration for Hermes Agent.
---

The MemOS Hermes local plugin provides fully local persistent memory for **Hermes Agent**. All data is stored in local SQLite (`~/.hermes/memos-state/`), with zero cloud dependency. The Viewer only listens on 127.0.0.1 and is password-protected.

## Features

| Feature | Description |
|---------|-------------|
| 💾 Full-Write | Auto-captures every conversation, chunks semantically. |
| ⚡ Tasks & Skills | Conversations organized into tasks, then distilled into skills that auto-upgrade. |
| 🔍 Hybrid Search | FTS5 + vector, RRF, MMR, recency decay. |
| 🧠 Visualization | 7 pages: memories, tasks, skills, analytics, logs, import, settings. |
| 💰 Tiered Models | Each pipeline configurable with different models. |
| 🤝 Multi-Agent | Memory isolation + public memory + skill sharing for collective evolution. |
| 🐍 Python Native | Native integration via MemoryProvider interface for Hermes Agent, no gateway configuration needed. |
| 👥 Team Sharing Hub | Hub-Client architecture for cross-instance sharing. Approval flow, role management, real-time notifications. |
| 🔗 LLM Fallback Chain | Skill model → summarizer → Hermes native model, auto-fallback with zero manual intervention. |

---

## Architecture

Hermes Agent communicates with the MemOS bridge daemon via the Python MemoryProvider interface. Four pipelines: write → task & skill evolution (async) → retrieval → collaboration. Each agent has isolated memory; public memory and skill sharing enable collective evolution.

```
Pipeline 1: Write
Hermes Agent → Bridge Daemon (TCP :18992) → Ingest (chunk→summary→embed→dedup) → SQLite+FTS5

Pipeline 2: Tasks & Skills (async)
Task Processor (topic detect → summary) → Skill Evolver (eval → create/upgrade)

Pipeline 3: Auto-recall
prefetch (auto-recall) → Recall (FTS+Vector) → LLM filter → Inject context

Pipeline 4: On-demand search
Agent (memory_search) → RRF→MMR→Decay → LLM filter → excerpts+chunkId/task_id
→ task_summary / skill_get / memory_timeline
```

### Data Flow

#### Write
1. `sync_turn` → Bridge Daemon → Chunk → LLM Summary → Embed → Dedup → Store
2. Async: task detect → summary → skill eval → create/upgrade

#### Read
1. Per turn: `prefetch` searches with user message → LLM filters relevant → inject system context; if no hits, hint agent to call `memory_search` with self-generated query.
2. `memory_search` → FTS5+Vector → RRF → MMR → Decay → LLM filter → excerpts + chunkId/task_id
3. `task_summary` / `skill_get`(skillId|taskId) / `memory_timeline`(chunkId) / `skill_install`

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Python 3**
- **Hermes Agent** installed (`~/.hermes/hermes-agent` or local clone)
- Embedding / Summarizer APIs optional, falls back to local

### Step 1: One-Line Install (Recommended)

One command does everything — no manual steps needed:

```bash
curl -fsSL https://raw.githubusercontent.com/MemTensor/MemOS/openclaw-local-plugin-20260408/apps/memos-local-plugin/install.sh | bash
```

#### Install via npm

```bash
mkdir -p ~/.hermes/memos-plugin && cd ~/.hermes/memos-plugin && npm pack @memtensor/memos-local-hermes-plugin && tar xzf *.tgz && mv package/* . && rm -rf package *.tgz && bash install.sh
```

::note
What does the installer do? Auto-detects and installs Node.js if missing → downloads plugin from npm → installs dependencies → creates `memtensor` symlink in Hermes plugins → updates `~/.hermes/config.yaml` → verifies plugin loading → starts bridge daemon and Memory Viewer.
::

::warning
Install failed? The most common issue is `better-sqlite3` compilation failure. Ensure build toolchain is installed (`gcc`, `make`, `python3`). On Ubuntu/Debian: `apt install build-essential`.
::

### Step 2: Get Started

```bash
hermes chat
```

The installer automatically starts the Memory Viewer. Each time you run `hermes chat`, the daemon starts automatically (if not already running). It keeps running in the background after hermes exits.

::tip
Every conversation auto-stored. Visit `http://127.0.0.1:18901` for the Memory Viewer.
::

### Step 3: Configuration

**Two methods**: edit `~/.hermes/config.yaml` or via Viewer web panel. Tiered models supported.

#### Basic Config (config.yaml)

```yaml
# ~/.hermes/config.yaml
memory:
  memory_enabled: true
  user_profile_enabled: true
  provider: memtensor
```

#### Tiered Model Config (via Environment Variables)

```bash
# Embedding — lightweight model
export MEMOS_EMBEDDING_PROVIDER="openai_compatible"
export MEMOS_EMBEDDING_API_KEY="sk-••••••"
export MEMOS_EMBEDDING_ENDPOINT="https://your-api-endpoint/v1"

# Custom ports
export MEMOS_DAEMON_PORT=18992
export MEMOS_VIEWER_PORT=18901

# Custom data directory
export MEMOS_STATE_DIR="/custom/path/memos-state"
```

#### Advanced Config (via Bridge Config JSON)

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

## Modules

### Capture
Captures each user/assistant turn via `sync_turn`, user profile updates via `on_memory_write`. Forwarded to the Ingest pipeline through the bridge daemon.

### Ingest
Async queue: chunk → summary → embed → smart dedup (Top-5 similar + LLM DUPLICATE/UPDATE/NEW; UPDATE merges summary and appends content) → store; evolved chunks track merge_history.

### Task Summarization
Async per-turn boundary detection: group into user turns → first turn assigned directly → each subsequent turn checked by LLM topic judge (strongly biased toward SAME to avoid over-splitting) → 2h timeout forces split → structured summary (goal/steps/result). Supports edit, delete, retry skill generation.

### Skill Evolution
Rule filter → LLM evaluate (only repeatable/valuable tasks generate skills) → SKILL.md (steps/warnings/scripts) / upgrade → score → install. LLM uses a 3-level fallback chain (skill model → summarizer → Hermes native model). Supports edit, delete, toggle visibility.

### Recall
FTS5+Vector → RRF(k=60) → MMR(λ=0.7) → Decay(14d) → Normalize → Filter(≥0.45) → Top-K. Auto-links Task/Skill.

### Viewer
7 pages: memory CRUD/search/evolution badges, tasks (chat bubbles), skills (versions/download), analytics, logs (tool call I/O), import, online config. Password-protected. Default port `18901`.

---

## Retrieval Algorithms

### RRF (Reciprocal Rank Fusion)

$$\text{RRF}(d) = \sum_i \frac{1}{k + \text{rank}_i(d) + 1}$$

### MMR (Maximal Marginal Relevance)

$$\text{MMR}(d) = \lambda \cdot \text{rel}(d) - (1-\lambda) \cdot \max \text{sim}(d, d_s)$$

### Recency Decay

$$\text{final} = \text{score} \times \bigl(0.3 + 0.7 \times 0.5^{t/14}\bigr)$$

---

## LLM Fallback Chain

All LLM calls (summary, topic detection, dedup, skill generation/upgrade) use a 3-level automatic fallback chain:

```
skillSummarizer (skill-dedicated, optional) → summarizer (general summarizer) → Hermes Native (auto-detected)
```

- Each level auto-falls back to the next on failure, zero manual intervention
- If `skillSummarizer` is not configured, skips directly to `summarizer`
- If all models fail, falls back to rule-based methods (no LLM) or skips the step

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MEMOS_STATE_DIR` | `~/.hermes/memos-state` | Memory database location |
| `MEMOS_DAEMON_PORT` | `18992` | Bridge daemon TCP port |
| `MEMOS_VIEWER_PORT` | `18901` | Memory Viewer HTTP port |
| `MEMOS_EMBEDDING_PROVIDER` | `local` | Embedding provider |
| `MEMOS_EMBEDDING_API_KEY` | — | Embedding API key |
| `MEMOS_EMBEDDING_ENDPOINT` | — | Custom embedding endpoint |
| `MEMOS_BRIDGE_CONFIG` | — | Full bridge config JSON |
| `MEMOS_BRIDGE_SCRIPT` | — | Bridge script path override |
| `HERMES_HOME` | `~/.hermes` | Hermes home directory |

---

## Defaults

| Parameter | Default | Description |
|-----------|---------|-------------|
| maxResults | 6 (max 20) | Default result count |
| minScore (tool) | 0.45 | memory_search minimum |
| minScore (viewer) | 0.64 | Viewer search vector threshold |
| rrfK | 60 | RRF fusion constant |
| mmrLambda | 0.7 | MMR relevance vs diversity |
| recencyHalfLife | 14d | Recency decay half-life |
| vectorSearchMaxChunks | 0 (all) | 0=search all; set 200k-300k for large DBs |
| dedup threshold | 0.75 | Semantic dedup cosine similarity |
| viewerPort | 18901 | Memory Viewer |
| daemonPort | 18992 | Bridge Daemon TCP |
| owner | hermes | Memory ownership identifier |
| taskIdle | 2h | Task idle timeout |

---

## More

- [GitHub](https://github.com/MemTensor/MemOS/tree/main/apps/memos-local-plugin)
