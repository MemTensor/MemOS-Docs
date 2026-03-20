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

### Principles

- **/search/memory**: Memory retrieval — returns only the current Agent's memories
- **/add/message**: Record insertion — automatically tags data for the current Agent
- **Backward compatibility**: Default Agent `"main"` is ignored to keep existing single-Agent data unaffected

### Use Cases

- **Multi-role collaboration**: Strategy, business, marketing, and engineering Agents can work in parallel
- **Business-line isolation**: Agents from different business lines run independently without interference
- **Persona consistency**: Preserve each Agent's long-term persona and behavior style

---

## Local Plugin

In multi-agent scenarios, the MemOS Openclaw local plugin supports three capabilities by default: memory isolation, shared public memory, and skill sharing.

### Rules

- Private memory: `owner = agent:{agentId}`, searchable only by the current Agent
- Public memory: `owner = public`, searchable by all Agents
- Private skill: `visibility = private`, visible only to the skill owner
- Public skill: `visibility = public`, searchable and installable by other Agents

### Example Workflow

```text
Agent Alpha:
  memory_search("deploy config")
  → sees own + public memories only
  memory_write_public("shared deploy config")
  skill_publish("nginx-proxy") ✓ now public

Agent Beta:
  memory_search("alpha private deploy detail")
  → no alpha private memories
  memory_search("shared deploy config")
  → found public memory
  skill_search("nginx deployment")
  → Found: nginx-proxy (public)
  skill_install("nginx-proxy") ✓ installed
```

### Expected Results

- Alpha and Beta cannot see each other's private memories
- Content written by `memory_write_public` can be searched by both agents
- After Alpha publishes a public skill, Beta can search and install it
