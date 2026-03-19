---
title: Multi-Agent Memory Isolation
---

The MemOS OpenClaw Cloud plugin supports complete isolation of memory and message history across multiple Agents. Each Agent can only access its own memory, preventing cross-agent interference.

> Note: This feature is currently available only in the Cloud plugin. Try it now.

## How to Use in Cloud Plugin

With a simple configuration, different Agents can have independent memory spaces. Both auto-detection and static assignment are supported.

### 1. Enable Multi-Agent Mode

Add the following to your `openclaw.json`:

```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": {
        "config": {
          "multiAgentMode": true
        }
      }
    }
  }
}
```

Or set the environment variable:

```bash
MEMOS_MULTI_AGENT_MODE=true
```

### 2. Auto-detect Agent

Once enabled, the plugin automatically reads `ctx.agentId` and isolates memory for each Agent. No extra configuration is required.

### 3. Statically Assign Agent (Optional)

If you need to pin a specific Agent ID, set it in the config:

```json
{
  "config": {
    "agentId": "marketing_agent"
  }
}
```

## Principles

- **/search/memory**: Memory retrieval — returns only the current Agent's memories
- **/add/message**: Record insertion — automatically tags data for the current Agent
- **Backward compatibility**: Default Agent `"main"` is ignored to keep existing single-Agent data unaffected

## Use Cases

- **Multi-role collaboration**: Strategy, business, marketing, and engineering Agents can work in parallel
- **Business-line isolation**: Agents from different business lines run independently without interference
- **Persona consistency**: Preserve each Agent's long-term persona and behavior style
