---
title: Hermes Local Plugin Usage
desc: API tools, team sharing, and multi-agent usage examples for the MemOS Hermes local plugin.
---

## Basic Usage

After installation, run `hermes chat` to start a conversation. Every turn is auto-stored in memory. Visit `http://127.0.0.1:18901` to access the Memory Viewer for management.

```bash
hermes chat
```

### Verify Memory is Working

1. Have a conversation with your Hermes Agent about anything.
2. Open the Memory Viewer at `http://127.0.0.1:18901` and check that the conversation appears.
3. In a new conversation, ask the agent to recall what you discussed:

```
You: Do you remember what I asked you to help me with before?
Agent: (Calls memory_search) Yes, we previously discussed...
```

---

## API Tools

The Hermes plugin provides the following tools for Agent interaction. The Agent can call them on demand during conversations.

### memory_search — Memory Search

Parameters: `query` (required), `maxResults` (default 20), `minScore` (default 0.45), `role`.

Returns excerpts + chunkId/task_id, no summary; LLM relevance filter applied.

```text
Agent call example:
  memory_search(query="Nginx deployment config")
  → Returns relevant memory excerpts with chunkId and task_id
```

### memory_get — Get Full Memory Text

Retrieves the full original text of a memory chunk by `chunkId`. Optional `maxChars` to limit response length.

### memory_timeline — Context Neighbors

Gets neighboring memory chunks around a `chunkId` anchor. Parameter `window` defaults to 2.

### task_summary — Task Summary

Gets structured task summary (goal/steps/result/key details) by `taskId` or `query`.

```text
Agent call example:
  memory_search(query="database migration") → returns task_id: "task_42"
  task_summary(taskId="task_42") → returns full structured task summary
```

### skill_get / skill_install — Skill Get & Install

- `skill_get` accepts `skillId` or `taskId` (resolves skill by task)
- `skill_install` installs the skill to workspace

### memory_write_public — Write Public Memory

Writes public memory (owner="public"), discoverable by all agents. Parameters: `content` (required), `summary` (optional).

### skill_search — Skill Search

Searches skills via FTS5 + vector dual channel, RRF fusion, then LLM relevance judgment.

Parameters: `query` (required), `scope` ("mix" | "self" | "public", default "mix").

### skill_publish / skill_unpublish — Skill Publish

- `skill_publish` makes a skill public and discoverable via `skill_search`
- `skill_unpublish` sets it private

### memory_viewer — Viewer URL

Returns the Memory Viewer access URL.

---

## Team Sharing

Team Sharing connects multiple Hermes instances into a collaborative network. One instance serves as the **Hub** (team server) while others connect as **Clients**. Private data stays local — only explicitly shared tasks, memories, and skills are visible to the team.

### Start a Hub (Team Server)

Configure via Viewer settings page or Bridge Config JSON:

```json
{
  "sharing": {
    "enabled": true,
    "role": "hub",
    "hub": {
      "teamName": "My Team",
      "teamToken": "${MEMOS_TEAM_TOKEN}"
    }
  }
}
```

### Join a Hub (Client)

```json
{
  "sharing": {
    "enabled": true,
    "role": "client",
    "client": {
      "hubAddress": "192.168.1.100:18902"
    }
  }
}
```

::tip
You can also configure sharing through the **Viewer → Settings → Team Sharing** panel without editing JSON.
::

### Admin Features

| Feature | Description |
|---------|-------------|
| Approve/Reject | Approve or reject pending members |
| Promote/Demote | Promote members to admin or demote to regular member; affected users receive notifications |
| Remove Member | Remove team members (with confirmation, self-removal prevented) |
| Team Overview | View team name, total members, active member count |
| Shutdown Notify | All clients notified automatically when Hub shuts down |

### Team Sharing API Tools

| Tool | Description |
|------|-------------|
| `task_share` / `task_unshare` | Push task to / remove from team |
| `skill_publish` / `skill_unpublish` | Publish / unpublish skill to team |
| `network_memory_detail` | Fetch full team memory content |
| `network_skill_pull` | Pull team skill bundle locally |
| `network_team_info` | Show current team connection state |

### Multi-Instance Deployment

Run multiple Hermes instances on the same machine with full isolation:

| Resource | Isolation | Example |
|----------|-----------|---------|
| Viewer | MEMOS_VIEWER_PORT | 18901 / 18903 |
| Daemon | MEMOS_DAEMON_PORT | 18992 / 18994 |
| Database | MEMOS_STATE_DIR | ~/.hermes/memos-state/ / ~/hermes-work/memos-state/ |

---

## Multi-Agent Collaboration

MemOS natively supports multi-agent scenarios. Each agent's memories and tasks are isolated via an `owner` field (Hermes defaults to `hermes`); retrieval automatically filters to current agent + public.

- **Memory Isolation**: Agent A cannot retrieve Agent B's private memories
- **Public Memory**: Use `memory_write_public` to write owner="public" memories discoverable by all agents
- **Skill Sharing**: Use `skill_publish` to make skills public; other agents discover and install via `skill_search`
- **Skill Discovery**: `skill_search` supports scope (mix/self/public), FTS + vector dual channel + RRF fusion + LLM relevance judgment

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

---

## Viewer HTTP API

The Memory Viewer provides the following HTTP endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | / | Memory Viewer HTML |
| POST | /api/auth/* | setup / login / reset / logout |
| GET | /api/memories | Memory list (pagination, filters) |
| GET | /api/search | Hybrid search (vector minScore 0.64 + FTS5 fallback) |
| POST/PUT/DELETE | /api/memory/:id | Memory CRUD |
| GET | /api/tasks | Task list (status filter) |
| GET/PUT/DELETE | /api/task/:id | Task detail/edit/delete |
| POST | /api/task/:id/retry-skill | Retry skill generation |
| GET | /api/skills | Skill list |
| GET/PUT/DELETE | /api/skill/:id | Skill detail/edit/delete |
| PUT | /api/skill/:id/visibility | Set public/private |
| GET | /api/skill/:id/download | Download as ZIP |
| GET | /api/stats, /api/metrics | Stats & metrics |
| GET | /api/logs | Tool call logs |
| GET/PUT | /api/config | Online configuration |
