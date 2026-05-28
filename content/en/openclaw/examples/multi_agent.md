---
title: Multi-Agent Memory Isolation
---

## Cloud Plugin

The MemOS OpenClaw Cloud plugin supports complete isolation of memory and message history across multiple Agents. Each Agent can only access its own memory, preventing cross-agent interference.

### How to Use in Cloud Plugin

With a simple configuration, different Agents can have independent memory spaces. Both auto-detection and static assignment are supported.

#### 1. Enable Multi-Agent Mode

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

#### 2. Auto-detect Agent

Once enabled, the plugin automatically reads `ctx.agentId` and isolates memory for each Agent. No extra configuration is required.

#### 3. Statically Assign Agent (Optional)

If you need to pin a specific Agent ID, set it in the config:

```json
{
  "config": {
    "agentId": "marketing_agent"
  }
}
```

#### 4. Configure Parameters Per Agent (Optional)

Beyond isolating memory spaces, you can use `agentOverrides` to override parameters for each Agent, such as knowledge bases, recall limits, relevance threshold, and whether memory writes are enabled. Fields that are not specified inherit from the global config.

```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": {
        "enabled": true,
        "config": {
          "multiAgentMode": true,
          "allowedAgents": ["research-agent", "coding-agent"],
          "knowledgebaseIds": [],
          "memoryLimitNumber": 6,
          "relativity": 0.45,
          "agentOverrides": {
            "research-agent": {
              "knowledgebaseIds": ["kb-research-papers", "kb-academic"],
              "memoryLimitNumber": 12,
              "relativity": 0.3,
              "includeToolMemory": true,
              "captureStrategy": "full_session",
              "queryPrefix": "research context: "
            },
            "coding-agent": {
              "knowledgebaseIds": ["kb-codebase", "kb-api-docs"],
              "memoryLimitNumber": 9,
              "relativity": 0.5,
              "addEnabled": false
            }
          }
        }
      }
    }
  }
}
```

This configuration means:

- `research-agent` uses research / academic knowledge bases, recalls more memories, and includes tool memory.
- `coding-agent` only reads from codebase and API documentation knowledge bases, and disables memory writes.
- Other Agents, if allowed to use memory, inherit global `knowledgebaseIds`, `memoryLimitNumber`, and `relativity`.

You can also configure a JSON string in `.env` with `MEMOS_AGENT_OVERRIDES`, but it has lower priority than `agentOverrides` in `openclaw.json`:

```bash
MEMOS_AGENT_OVERRIDES='{"research-agent":{"memoryLimitNumber":12,"relativity":0.3},"coding-agent":{"memoryLimitNumber":9,"addEnabled":false}}'
```

Common overridable fields:

| Field | Description |
| --- | --- |
| `knowledgebaseIds` | Knowledge base IDs retrieved by the current Agent. |
| `memoryLimitNumber` | Maximum number of memory items recalled by the current Agent. |
| `preferenceLimitNumber` | Maximum number of preference memories recalled by the current Agent. |
| `includePreference` | Whether to recall preference memories. |
| `includeToolMemory` | Whether to recall tool memories. |
| `toolMemoryLimitNumber` | Maximum number of tool memories to recall. |
| `relativity` | Relevance threshold, usually between `0` and `1`. |
| `recallEnabled` | Whether memory recall is enabled for the current Agent. |
| `addEnabled` | Whether memory writes are enabled for the current Agent. |
| `captureStrategy` | Capture strategy, such as `last_turn` or `full_session`. |
| `queryPrefix` | Search query prefix for the current Agent. |
| `recallFilterEnabled` | Whether secondary recall filtering is enabled. |
| `allowKnowledgebaseIds` | Knowledge base IDs that the current Agent is allowed to write to. |
| `tags` | Tags attached when writing memories. |

### Principles

- **/search/memory**: Memory retrieval — returns only the current Agent's memories
- **/add/message**: Record insertion — automatically tags data for the current Agent
- **Config merging**: the plugin reads global config first, then applies `agentOverrides.<agentId>` for the current Agent
- **Backward compatibility**: Default Agent `"main"` is ignored to keep existing single-Agent data unaffected

### Use Cases

- **Multi-role collaboration**: Strategy, business, marketing, and engineering Agents can work in parallel
- **Business-line isolation**: Agents from different business lines run independently without interference
- **Persona consistency**: Preserve each Agent's long-term persona and behavior style

---

## Local Plugin

`@memtensor/memos-local-plugin` supports both OpenClaw and Hermes. By default, each agent uses its own runtime home and local database. If multiple sessions / agents share one runtime, retrieval is scoped toward the current agent context. For cross-instance collaboration, enable team sharing from **Viewer → Settings → Team Sharing**.

### Rules

- **Isolated by default**: OpenClaw uses `~/.openclaw/memos-plugin/`, while Hermes uses `~/.hermes/memos-plugin/`. They do not share databases automatically.
- **Current agent first**: retrieval prioritizes the current agent / session's Traces, Policies, World Models, and Skills.
- **Optional sharing**: when `hub.enabled` is on, instances can share locally crystallized Skills and optional trace excerpts over a LAN / VPN.
- **Graceful fallback**: Hub is not on the algorithm critical path. If sharing is unavailable, the plugin falls back to local-only memory.

### Example Workflow

```text
OpenClaw:
  memory_search("deploy config")
  → prioritizes OpenClaw's local Skill / Trace / World Model store

Hermes:
  memory_search("deploy config")
  → prioritizes Hermes' local Skill / Trace / World Model store

With Hub enabled:
  OpenClaw / Hermes can pull team-shared Skills
  private Traces remain local to each machine and runtime home by default
```

### Expected Results

- OpenClaw and Hermes do not read each other's local database by default
- Team members can explicitly share high-value Skills to avoid repeating mistakes
- Local writes, retrieval, and skill lookup continue to work even if Hub is unavailable
