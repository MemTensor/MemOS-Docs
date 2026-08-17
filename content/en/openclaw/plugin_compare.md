---
title: Cloud Plugin vs Local Plugin
desc: The cloud plugin is for quick MemOS Cloud adoption, while the local plugin brings local-first long-term memory and self-evolution to OpenClaw, Hermes, and DeepSeek Harness. This guide helps you choose the right option.
---

## Overview

### Cloud Plugin

Stores memories in **MemOS Cloud**. After installing the cloud plugin, a single MemOS Cloud API Key is all you need to get started. It supports multi-agent memory sharing across devices, and benchmarks show up to **72% reduction in Token usage** — ideal for quick setup, cross-device collaboration, and production use.

### Local Plugin

The new local plugin is `@memtensor/memos-local-plugin`: a **local-first memory core shared by OpenClaw, Hermes, and DeepSeek Harness**. It stores data in local SQLite and evolves it into four layers: L1 Trace, L2 Policy, L3 World Model, and callable Skills. With feedback-driven self-evolution, three-tier retrieval, and decision repair, the agent accumulates reusable experience on your own machine. It is best for developers who care most about privacy, local deployment, and observability.

---

## Core Differences

| Comparison Dimension | ☁️&nbsp;MemOS&nbsp;Cloud Plugin | 🖥️&nbsp;MemOS&nbsp;Local Plugin |
| --- | --- | --- |
| 💾&nbsp;**Data Storage & Privacy** | **Cloud storage**: Memory data is stored in MemOS Cloud, making cross-device and multi-instance sharing easy. | **Local storage**: Each agent has its own runtime home. OpenClaw defaults to `~/.openclaw/memos-plugin/`, Hermes defaults to `~/.hermes/memos-plugin/`, and DeepSeek Harness also keeps SQLite, skill packages, logs, and config on the local machine. |
| 🤖&nbsp;**Agent Support** | Currently supports OpenClaw and DeepSeek Harness, backed by MemOS Cloud as the unified memory service. | One shared core supports OpenClaw, Hermes, and DeepSeek Harness: OpenClaw integrates through an in-process TypeScript plugin; Hermes integrates through a Python Provider that talks to the Node core over JSON-RPC; DeepSeek Harness integrates through its native plugin mechanism. |
| 🔑&nbsp;**API & Model Config** | Uses a MemOS Cloud API Key. Memory processing, retrieval, and evolution are handled by the cloud service. | Uses the Memory Viewer's Settings panel for model and team-sharing configuration. Embeddings can use the local provider by default or OpenAI-compatible, Gemini, Cohere, Voyage, and Mistral providers. OpenClaw can inherit the host model; Hermes and DeepSeek Harness can configure an LLM provider and API Key in their own panels. |
| 🔍&nbsp;**Retrieval Capability** | Cloud-based semantic vector retrieval + graph retrieval, optimized by the service. | Three-tier retrieval: Tier 1 Skill, Tier 2 Trace/Episode, and Tier 3 World Model. It combines vector, FTS5, keyword pattern, and error-signature channels, then uses RRF + MMR for relevance and diversity. |
| 🧠&nbsp;**Memory Evolution** | Automatically handled by cloud services: written memories are structured, deduplicated, and corrected in natural language. | Local Reflect2Evolve pipeline: conversations and tool calls become L1 Traces, cross-task patterns become L2 Policies, policies roll up into L3 World Models, and high-value strategies crystallize into callable Skills with active / retired lifecycle states. |
| 🛠️&nbsp;**Decision Repair** | Mainly relies on cloud retrieval to bring back more relevant memory and reduce repeated context. | Tool failures, negative feedback, and task outcomes enter the feedback channel. Failure patterns can trigger decision repair, injecting corrective context into the next turn so the agent avoids repeating the same mistake. |
| 👥&nbsp;**Multi-Agent & Sharing** | Supports multi-agent scenarios and cross-device sharing, making it suitable for teams. | Isolated by default: OpenClaw, Hermes, and DeepSeek Harness have separate databases and viewers. Optional Hub sharing can publish locally crystallized Skills and optional trace excerpts inside a LAN / VPN; hub failures degrade back to local-only mode. |
| 👀&nbsp;**Visualization & Observability** | Managed through the MemOS Cloud Dashboard for API Key and cloud memory capabilities. | Includes a local Viewer with Overview, Memories, Tasks, Policies, World Models, Skills, Analytics, Logs, Import, Settings, and Help pages. HTTP + SSE streams expose events, logs, retrieval, skills, and health status in real time. |
| 🛠️&nbsp;**Deployment & Configuration** | **Very simple**: Create one API Key, then finish install and config for OpenClaw or DeepSeek Harness. The flow mainly relies on the cloud service. | **Very simple**: Installation and upgrades are both one command. The installer auto-detects installed OpenClaw, Hermes, or DeepSeek Harness, installs `@memtensor/memos-local-plugin`, creates runtime folders, and restarts the target runtime. |

---

## Quick Install

### Cloud Plugin

Create one API Key, then finish install for each agent. OpenClaw and DeepSeek Harness share the same key.

**Get your API Key**: [MemOS Cloud Dashboard](https://memos-dashboard.openmem.net/apikeys/)

#### OpenClaw

1. **Install the plugin**
    ```bash
    openclaw plugins install @memtensor/memos-cloud-openclaw-plugin@latest
    ```

2. **Write the API Key**
    ```bash
    mkdir -p ~/.openclaw && echo "MEMOS_API_KEY=mpg-..." > ~/.openclaw/.env
    ```

3. **Restart the gateway**
    ```bash
    openclaw gateway restart
    ```

**Manually update the plugin**:
```bash
openclaw plugins update @memtensor/memos-cloud-openclaw-plugin@latest
openclaw gateway restart
```

#### DeepSeek Harness

Use the API Key created above.

1. **Install the cloud plugin into the default DSH web profile**
    ```bash
    npx @deepseek-ai/dsh plugin --profile web add @memtensor/memos-cloud-dsh-plugin@latest
    ```

2. **Write the API Key to `~/.dsh/.credentials.yaml`**
    ```yaml
    MEMOS_API_KEY: mpg-your-key
    ```

3. **Add the minimal config to `~/.dsh/settings.yaml`**
    ```yaml
    memos-cloud:
      apiKeyEnv: MEMOS_API_KEY
    ```

4. **Restart DSH Web**
    ```bash
    npx @deepseek-ai/dsh web
    ```

> For more details, see the [Cloud Plugin documentation](/openclaw/guide#quick-start).

### Local Plugin (one command)

```bash
# Install the plugin
curl -fsSL https://raw.githubusercontent.com/MemTensor/MemOS/main/apps/memos-local-plugin/install.sh | bash
```

Installation and upgrades use the same command. The installer auto-detects whether OpenClaw, Hermes, or DeepSeek Harness are installed. In an interactive terminal, it asks which agent to install for; in non-interactive environments, it installs for the detected agent(s).

| Agent | Code directory | Data and config directory | Viewer |
| --- | --- | --- | --- |
| OpenClaw | `~/.openclaw/plugins/memos-local-plugin/` | `~/.openclaw/memos-plugin/` | `http://127.0.0.1:18799` |
| Hermes | `~/.hermes/plugins/memos-local-plugin/` | `~/.hermes/memos-plugin/` | `http://127.0.0.1:18800` |
| DeepSeek Harness | Deployed to the corresponding plugin directory | Isolated local `memos-plugin` directory | `http://127.0.0.1:18801` |

> Upgrading or uninstalling plugin code does not delete existing local data, skill packages, or logs. OpenClaw, Hermes, and DeepSeek Harness each run their own Viewer; there is no shared port or read-only peer view.
>
> Configure models, team sharing, and general options from the Memory Viewer for the target agent: OpenClaw defaults to `http://127.0.0.1:18799`, Hermes defaults to `http://127.0.0.1:18800`, and DeepSeek Harness defaults to `http://127.0.0.1:18801`.
