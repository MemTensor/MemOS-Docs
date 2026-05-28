---
title: Knowledge Base Usage
desc: Create a knowledge base in MemOS Cloud Dashboard and configure its knowledge base ID in the OpenClaw cloud plugin.
---

## Cloud Plugin

The MemOS OpenClaw cloud plugin can recall both personal memories and selected knowledge base content before each task. This is useful for connecting product docs, company policies, project materials, coding standards, and other long-lived references to OpenClaw so the Agent can automatically use them during execution.

### 1. Create a Knowledge Base and Get Its ID

Create the knowledge base in [MemOS Cloud Dashboard](https://memos-dashboard.openmem.net) first.

Steps:

1. Log in to [MemOS Cloud Dashboard](https://memos-dashboard.openmem.net).
2. Go to the knowledge base management page and create a new knowledge base.
3. Upload the documents or Skill files that the Agent should retrieve from.
4. Wait until file processing is complete.
5. Copy the knowledge base ID from the knowledge base details page, for example `kb-company-handbook`.

::warning
Use the real knowledge base ID copied from the dashboard to replace `kb-company-handbook` in the examples below. The knowledge base name is only a display name; the plugin configuration requires the knowledge base ID.
::

### 2. Configure a Global Knowledge Base

Knowledge base configuration has two directions:

- `knowledgebaseIds` / `MEMOS_KNOWLEDGEBASE_IDS`: queries knowledge bases. During `/search/memory`, the plugin recalls content from these knowledge bases.
- `allowKnowledgebaseIds` / `MEMOS_ALLOW_KNOWLEDGEBASE_IDS`: writes to knowledge bases. During `/add/message`, the plugin is allowed to write newly generated memories to these knowledge bases.

If all OpenClaw sessions should retrieve from the same knowledge base, configure `knowledgebaseIds` in `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": {
        "enabled": true,
        "config": {
          "apiKey": "YOUR_MEMOS_API_KEY",
          "knowledgebaseIds": ["kb-company-handbook"],
          "memoryLimitNumber": 6,
          "relativity": 0.45
        }
      }
    }
  }
}
```

Restart the OpenClaw gateway after updating the config:

```bash
openclaw gateway restart
```

### 3. Configure with Environment Variables

You can also configure knowledge base IDs in `~/.openclaw/.env`:

```bash
MEMOS_API_KEY=YOUR_MEMOS_API_KEY
MEMOS_KNOWLEDGEBASE_IDS="kb-company-handbook,kb-product-docs"
```

`MEMOS_KNOWLEDGEBASE_IDS` defines the knowledge base scope for retrieval. The plugin reads from these knowledge bases when calling `/search/memory`.

If you need to write newly generated conversation memories into a knowledge base, configure the write parameter separately:

```bash
MEMOS_ALLOW_KNOWLEDGEBASE_IDS="kb-company-handbook"
```

::warning
Knowledge base writes can store Agent-generated information into the target knowledge base, but knowledge base content is not filtered by `agent_id`. In other words, if multiple Agents are configured to read the same knowledge base, anything written into that knowledge base may be recalled by all of them, weakening multi-agent memory isolation.

If you need strict Agent isolation, do not write conversation memories into a shared knowledge base. Configure `allowKnowledgebaseIds` or `MEMOS_ALLOW_KNOWLEDGEBASE_IDS` only when you explicitly want the content to become shared team knowledge.
::

### 4. Bind Different Knowledge Bases to Different Agents

When different Agents own different tasks, enable multi-agent mode and use `agentOverrides` to assign knowledge bases per Agent:

```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": {
        "enabled": true,
        "config": {
          "multiAgentMode": true,
          "allowedAgents": ["research-agent", "coding-agent"],
          "memoryLimitNumber": 6,
          "relativity": 0.45,
          "agentOverrides": {
            "research-agent": {
              "knowledgebaseIds": ["kb-research-papers"],
              "memoryLimitNumber": 12,
              "queryPrefix": "research context: "
            },
            "coding-agent": {
              "knowledgebaseIds": ["kb-codebase", "kb-api-docs"],
              "memoryLimitNumber": 9,
              "includeToolMemory": true,
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

- `research-agent` retrieves from research paper / academic knowledge bases.
- `coding-agent` retrieves from codebase and API documentation knowledge bases, and disables memory writes to avoid storing temporary debugging details as long-term memory.
- Agents not listed in `agentOverrides` inherit the global configuration.

If you enable knowledge base writes in a multi-agent setup, make sure the write target is not a shared knowledge base read by multiple Agents. Otherwise, information from different Agents may become visible to each other through the knowledge base.

### 5. Verify Knowledge Base Recall

After configuration, ask OpenClaw a question that can only be answered from the uploaded knowledge base documents:

```text
You: According to the company reimbursement policy, what purchase amount for design software requires special approval?
OpenClaw: According to the procurement rules in the knowledge base, design software purchases above 1000 require special approval...
```

If the answer does not use knowledge base content, check the following:

- Confirm that the knowledge base files have finished processing in the dashboard.
- Confirm that `knowledgebaseIds` or `MEMOS_KNOWLEDGEBASE_IDS` uses the knowledge base ID, not the knowledge base name.
- Confirm that the OpenClaw gateway has been restarted and loaded the latest config.
- If using multi-agent mode, confirm that the current Agent is listed in `allowedAgents` and that the corresponding `agentOverrides` config is correct.

### Config Reference

For knowledge base configuration details, see the [official MemOS-Cloud-OpenClaw-Plugin repository](https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin):

| Config | Purpose |
| --- | --- |
| `knowledgebaseIds` | Query knowledge bases. Plugin config for the knowledge base retrieval scope, corresponding to `/search/memory`. |
| `MEMOS_KNOWLEDGEBASE_IDS` | Query knowledge bases. Environment variable form of the knowledge base retrieval scope. Separate multiple IDs with commas. |
| `allowKnowledgebaseIds` | Write to knowledge bases. Plugin config for knowledge bases that newly generated memories may be written to, corresponding to `/add/message`. |
| `MEMOS_ALLOW_KNOWLEDGEBASE_IDS` | Write to knowledge bases. Environment variable form of knowledge bases that newly generated memories may be written to. |
| `agentOverrides.<agentId>.knowledgebaseIds` | In multi-agent scenarios, assign knowledge bases to a specific Agent. |

