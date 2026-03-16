---
title: Cloud Plugin vs Local Plugin
desc: Both plugins bring persistent memory to OpenClaw, but they serve different use cases. This guide helps you understand the key differences and choose the right one.
---

## Overview

### ☁️ Cloud Plugin

Stores memories in **MemOS Cloud**. A single API Key is all you need to get started. Supports multi-agent memory sharing across devices, and benchmarks show up to **72% reduction in Token usage** — ideal for quick setup or team collaboration.

### 🖥️ Local Plugin

Stores memories entirely on your **local machine (SQLite)** with zero cloud dependency. Features hybrid search (FTS5 + vector), automatic Task summarization, Skill evolution, and a built-in Memory Viewer dashboard (7 management pages). Best for developers with strict privacy, security, or local deployment requirements.

---

## Core Differences

| Dimension | ☁️ Cloud Plugin | 🖥️ Local Plugin |
| --- | --- | --- |
| 💾 **Memory Storage** | MemOS Cloud hosted service | Local machine (SQLite file) |
| 🔑 **API Key** | MemOS Cloud API Key (provided by MemOS) | Embedding model API Key (bring your own; local model option requires no key) |
| 🔍 **Search** | Cloud-side semantic vector search | Hybrid search: FTS5 + vector (RRF + MMR + recency decay) |
| 🧠 **Skill Evolution** | ❌ Not supported | ✅ Automatic Task summarization & Skill evolution |
| 👥 **Multi-Agent** | ✅ Supported (`multiAgentMode`, memory isolation) | ✅ Supported (memory isolation + public memory + skill sharing) |
| 🛠️ **Setup Complexity** | Low (just provide an API Key) | Higher (local environment required, including build dependencies) |

---

## Detailed Feature Comparison

### Memory Search

| | ☁️ Cloud Plugin | 🖥️ Local Plugin |
| --- | --- | --- |
| Retrieval | Cloud-side semantic vector search | FTS5 full-text + vector dual-path, RRF fusion |
| Reranking | — | MMR (balances relevance and diversity) |
| Recency Decay | — | ✅ (14-day half-life by default) |
| LLM Relevance Filter | — | ✅ (filters low-value candidates, assesses sufficiency) |

### Memory Write

Both plugins use the same lifecycle hooks:

- **`before_agent_start`** → Retrieves relevant memories and injects them into the Agent's context (invisible to the user)
- **`agent_end`** → Persists the current conversation turn to memory storage

The local plugin additionally supports: content hash deduplication (SHA-256, prevents duplicate writes within the same session), semantic chunking, and per-chunk LLM summarization.

### Task Summarization & Skill Evolution (Local Plugin Only)

The local plugin adds two evolution pipelines on top of memory write:

**Task Generation**: Automatically organizes fragmented conversations into structured task records (goal → steps → result → key details), so the Agent can retrieve complete experiences via `task_summary` rather than scattered chunks.

**Skill Evolution**: Completed tasks automatically trigger skill evaluation — if a related skill exists (confidence ≥ 0.7), it is upgraded; otherwise a new skill is created and scored (auto-installed if score ≥ 6). The Agent reuses accumulated Skills on similar problems, resulting in faster and more Token-efficient execution.

---

## Use Case Selection

| Scenario | ☁️ Cloud Plugin | 🖥️ Local Plugin |
| --- | --- | --- |
| Individual developers / rapid prototyping | ✅ **Recommended** | ⚪ Works |
| Multi-agent memory sharing across machines | ✅ **Recommended** | ❌ Not suitable |
| Sensitive data with strict privacy requirements (finance, healthcare, legal) | ❌ Not suitable | ✅ **Recommended** |
| Offline / air-gapped environments | ❌ Not suitable | ✅ **Recommended** |
| Skill evolution & Task summarization | ❌ Not supported | ✅ **Recommended** |
| Local development & debugging with a visual dashboard | ⚪ Works | ✅ **Recommended** |
| Zero-ops, out-of-the-box experience | ✅ **Recommended** | ❌ Not suitable |

---

## Quick Install

### ☁️ Cloud Plugin (3 steps)
```bash
# 1. Install the plugin
openclaw plugins install @memtensor/memos-cloud-openclaw-plugin@latest

# 2. Configure API Key
mkdir -p ~/.openclaw && echo "MEMOS_API_KEY=mpg-..." > ~/.openclaw/.env

# 3. Restart the gateway
openclaw gateway restart
```

Get your API Key: [MemOS Cloud Dashboard](https://memos-dashboard.openmem.net/apikeys/)

> For more details, see the [OpenClaw Cloud Plugin documentation](/openclaw/guide).

### 🖥️ Local Plugin (build tools required)
```bash
# macOS
xcode-select --install
# Linux
sudo apt install build-essential python3

# Install the plugin
openclaw plugins install @memtensor/memos-local-openclaw-plugin

# Restart the gateway
openclaw gateway stop && openclaw gateway start
```

Once started, the Memory Viewer will be available at `http://127.0.0.1:18799`.

> For full configuration (Embedding, Summarizer, and Skill Evolution tiered models), see the [OpenClaw Local Plugin documentation](/openclaw/local_plugin).