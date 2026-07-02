---
name: memos-cloud-server
description: External long-term memory and knowledge base backed by the MemOS Cloud API. Capabilities — search prior memory, add conversation messages, delete or correct memories via feedback, retrieve a consolidated user profile (facts, preferences, tool history), and manage knowledge bases and their documents. Use proactively on every user turn (search memory before answering and persist the exchange after), and whenever the user references past context, their identity, preferences, or history, or asks to remember, recall, modify, forget, or correct something (e.g., "who am I", "what do I like", "remember that...", "forget X", "you got it wrong"). Also use when uploading, listing, or deleting knowledge base files.
metadata:
  version: "1.2.1"
  author: MemTensor
  homepage: https://github.com/MemTensor/MemOS-Cloud-Skill
  install: npx skills add https://github.com/MemTensor/MemOS-Cloud-Skill
---

# MemOS Cloud Server Skill

This skill allows the Agent to interact with MemOS Cloud APIs for memory search, addition, deletion, knowledge base management, and feedback.

## Setup

Install via: `npx skills add https://github.com/MemTensor/MemOS-Cloud-Skill`

Or configure the MCP server directly:

```json
{
  "mcpServers": {
    "memos-api-mcp": {
      "command": "npx",
      "args": ["-y", "@memtensor/memos-api-mcp@latest"],
      "env": {
        "MEMOS_API_KEY": "<your-key>",
        "MEMOS_USER_ID": "<stable-user-id>"
      }
    }
  }
}
```

Environment variables:

| Variable | Required | Notes |
|---|---|---|
| `MEMOS_API_KEY` | Yes | Auth token from https://memos-dashboard.openmem.net/apikeys/ |
| `MEMOS_USER_ID` | Yes | Stable user identifier (email, name, employee ID). Never use random/session IDs. |
| `MEMOS_CLOUD_URL` | No | API base URL. Default: `https://memos.memtensor.cn/api/openmem/v1` |
| `MEMOS_AGENT_ID` | No | Isolates memories per agent in multi-agent setups. |
| `MEMOS_APP_ID` | No | Isolates memories per application. |

## Mandatory Workflow (Every Turn)

```
Every user message (including greetings, simple questions, ANYTHING)
  → 1) search_memory (AUTO, BEFORE answering)
  → 2) Answer (use only relevant memories; ignore noise)
  → 3) add_message (AUTO, AFTER answering — persist conversation)
```

### Identity & Preference Queries

When the user asks about themselves ("What do I like?", "Who am I?"), call BOTH `search_memory` AND `get_user_profile`.

### Tool Choice Rules

| User Intent | Correct Tool |
|---|---|
| Any question (auto, before answering) | `search_memory` |
| Identity / preference query | `search_memory` + `get_user_profile` |
| New information / remember something | `add_message` |
| Modify / correct existing memory | `add_feedback` |
| Delete memory (no ID specified) | `search` → `delete` → `add_feedback` |
| Delete memory (ID specified) | `delete` directly |

## Available Tools

### search_memory
Search for long-term memories relevant to the user's query. Call before every answer.

### add_message
Store conversation messages into long-term memory. Call after every answer.

### delete
Delete stored memories by memory IDs.

### add_feedback
Correct or reinforce memory. Use when user wants to modify existing memories (NOT `add_message`).

### get_user_profile
Retrieve consolidated user profile — facts, preferences, and tool trajectories.

### create_knowledge_base
Create a named container for structured documents.

### add_kb_document
Upload files (local paths or URLs) into a knowledge base.

### get_kb_documents
Query document metadata by file IDs or knowledge base ID.

### delete_kb_documents
Delete documents from a knowledge base.

### remove_knowledge_base
Delete an entire knowledge base.

## Conversation ID Strategy

`conversation_id` groups memories within the same chat session:
1. Use host-provided session ID if available
2. Otherwise derive from the **first user message** of the session (reused on every call)
3. Never pass the current turn's message as conversation ID — that rotates it every turn

## Guardrails

- Keep API keys server-side. Never expose to browser/client.
- `add_message` must be called after every turn — skipping breaks future search
- Do NOT use `add_message` to modify/update existing memories — use `add_feedback`
- When in doubt about invoking memory tools, prefer to invoke — missed context is expensive

## Documentation

- Full docs: https://memos-docs.openmem.net
- MCP guide: https://memos-docs.openmem.net/cn/mcp_agent/mcp/guide
- API reference: https://memos-docs.openmem.net/cn/api_docs/start/overview
- Skill repo: https://github.com/MemTensor/MemOS-Cloud-Skill
- MCP npm: https://www.npmjs.com/package/@memtensor/memos-api-mcp
