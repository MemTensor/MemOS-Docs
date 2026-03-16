---
title: Cloud Plugin vs Local Plugin
desc: Both plugins bring persistent memory to OpenClaw, but they serve different use cases. This guide helps you understand the key differences and choose the right one.
---

## Overview

### Cloud Plugin

Stores memories in **MemOS Cloud**. A single API Key is all you need to get started. Supports multi-agent memory sharing across devices, and benchmarks show up to **72% reduction in Token usage** — ideal for quick setup or team collaboration.

### Local Plugin

Stores memories entirely on your **local machine (SQLite)** with zero cloud dependency. Features hybrid search (FTS5 + vector), automatic Task summarization, Skill evolution, and a built-in Memory Viewer dashboard (7 management pages). Best for developers with strict privacy, security, or local deployment requirements.

---

## Core Differences

| Comparison Dimension | ☁️&nbsp;MemOS&nbsp;Cloud Plugin | 🖥️&nbsp;MemOS&nbsp;Local Plugin |
| --- | --- | --- |
| 💾&nbsp;**Data Storage & Privacy** | **Cloud storage**: Memory data is stored in MemOS Cloud, making cross-device and multi-instance sharing easy. Privacy and security depend on the cloud service provider. | **Local storage**: All data (SQLite + vectors) is stored locally on the user's machine, supports fully offline operation, and gives 100% user control for maximum privacy and security. |
| 🔑&nbsp;**API&nbsp;Key** | MemOS Cloud API Key (provided by MemOS) | Embedding model API Key (self-provided; local models can be configured to run without a key) |
| 🔍&nbsp;**Retrieval Capability** | Cloud-based semantic vector retrieval | FTS5 full-text + vector hybrid retrieval (RRF + MMR + time decay) |
| 🧠&nbsp;**Memory Evolution** | Not supported yet | Fragmented conversations are automatically summarized into structured tasks; task completion triggers skill evaluation, and reusable skills are automatically created or upgraded |
| 👥&nbsp;**Multi&nbsp;Agent** | ✅ Supported (`multiAgentMode`, data isolation) | ✅ Supported (memory isolation + shared public memory + skill sharing) |
| 💡&nbsp;**Extra Capabilities** | • 60% lower token cost<br>• Automatic logging of all conversations<br>• Dedicated user-preference categorization | • Full memory visualization (Web admin dashboard with 7 pages)<br>• One-click import of native memories<br>• Tiered model configuration (assign different models to different tasks) |
| 🛠️&nbsp;**Deployment & Configuration** | **Very simple**: Done in 3 steps (install plugin, get API Key, configure env vars), mainly relying on cloud services. | **Moderate**: Requires a local build environment and configuration of multiple models (Embedding, Summarizer, etc.; supports local or cloud models). More flexible, but initial setup is more complex. |

---

## Use Case Selection

| Scenario | Recommended Option | Why |
| --- | --- | --- |
| Individual developers who prioritize privacy | Local plugin | Data stays off the cloud, fully under your control, and supports offline use |
| Handling sensitive data (healthcare, finance, legal, etc.) | Local plugin | Data never leaves local storage, helping meet compliance requirements |
| Offline or intranet-isolated environments | Local plugin | Supports configurable local embedding models with zero network dependency |
| Need skill evolution and task management | Local plugin | Includes a unique task-generation and skill-evolution pipeline, so your Agent gets smarter over time |
| Local development/debugging with visual management | Local plugin | Built-in Memory Viewer provides full transparency and control over memories, tasks, and skills |
| Team collaboration or multi-device work | Cloud plugin | Cross-device memory sync without manual migration |
| Multi-Agent memory sharing across machines | Cloud plugin | Cloud-native support for cross-device sync and memory isolation |
| Fast onboarding with minimal setup effort | Cloud plugin | No build tools required, just configure an API Key |
| Temporary use or trial | Cloud plugin | Ready to use immediately, with no local resource overhead |

---

## Quick Install

### Cloud Plugin (3 steps)
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

### Local Plugin (build tools required)
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
