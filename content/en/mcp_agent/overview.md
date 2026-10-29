---
title: Overview
desc: All four paths call the same memory service; they differ in runtime environment, memory location and integration cost.
---

MemOS exposes four integration paths for Agents: MCP services, the MemOS plugin, the CLI and the Coze plugin tool, with the plugin available in cloud and local form. The table lists the applicable clients and memory location for each option; for a recommendation based on the client in use, see Choose by client.

## Integration options

| Option | Clients | Where memory lives |
| --- | --- | --- |
| [MCP services](/mcp_agent/mcp/guide) | Claude Desktop, Cursor, VS Code or Trae, Chatbox and other MCP-capable clients | MemOS Cloud, or a self-hosted MCP service |
| [Cloud plugin](/openclaw/guide) | OpenClaw, DeepSeek Harness | MemOS Cloud, shared across Agents and devices |
| [Local plugin](/openclaw/local_plugin) | OpenClaw, Hermes Agent, DeepSeek Harness | Local SQLite, data never leaves the machine |
| [CLI](/mcp_agent/cli/guide) | Agents and terminals that can run shell commands | MemOS Cloud |
| [Coze plugin tool](/mcp_agent/agent/guide) | Coze platform Agents, no code required | MemOS Cloud |

## Choose by client

- **Claude Desktop, Cursor, VS Code, Trae, Chatbox**: MCP services. Add the MemOS MCP endpoint in the client configuration; no code required.
- **OpenClaw**: see [Cloud plugin vs Local plugin](/openclaw/plugin_compare). The cloud plugin suits zero-setup use and cross-device memory; the local plugin suits cases where data must stay on the machine and observability is required.
- **Hermes Agent**: the local plugin. Hermes connects to the same local memory core through a Python provider.
- **DeepSeek Harness**: both plugins are supported; the choice depends on whether memory may leave the machine.
- **Coze**: the plugin tool listed in the Coze store, added to an Agent with nothing to deploy.
- **Custom Agent with shell access**: the CLI, which wraps `add`, `search`, `get` and other memory operations as commands and lets several frameworks share one memory.

## Cloud plugin or local plugin

Both paths target Agents that run locally — OpenClaw, Hermes Agent and DeepSeek Harness. They differ in where memory is stored and how it is managed.

| Dimension | Cloud plugin | Local plugin |
| --- | --- | --- |
| Memory location | MemOS Cloud | Local SQLite |
| Cross-device and multi-Agent sharing | Yes | Local only |
| Data leaves the machine | Yes | No |
| Observability | Cloud call logs | Local dashboard with task traces, Analytics and Logs |
| Best for | Fast setup, cross-device work, production | Privacy-sensitive, local-first, long-term experience accumulation |

For the full comparison and installation steps, see [Cloud plugin vs Local plugin](/openclaw/plugin_compare).
