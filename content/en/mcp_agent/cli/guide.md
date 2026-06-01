---
title: MemOS CLI
desc: Connect MemOS to local terminals and Agent workflows through command-line tools.
---

MemOS CLI is designed for Agents and development environments that can execute shell commands. It wraps common memory operations into the `memos` command, so you can verify memory flows in a terminal or let an Agent search memories before answering and write useful new memories afterward.

## 1. When to Use It

- You want to quickly test memory operations such as `add`, `search`, `get`, and `delete` in a terminal.
- Your Agent framework can execute shell commands, but does not have a dedicated MemOS plugin.
- You want one reusable Skill to work across multiple Agents instead of writing a separate plugin for each framework.

If you use OpenClaw, prefer the [OpenClaw Cloud Plugin](/openclaw/guide). If your client supports MCP natively, see the [MCP Guide](/mcp_agent/mcp/guide).

## 2. Install

```bash
npm install -g @memtensor/memos-cloud-cli
```

After installation, confirm that the CLI is available:

```bash
memos --help
```

## 3. Choose a Usage Mode and Configure

MemOS CLI has two usage modes: install a memory Skill for an Agent, or manually run `memos` commands in a terminal.

### 3.1 Use with Agents

To let an Agent automatically search and write memories, use `memos init` to install the memory Skill. `--agent` is currently required; if it is omitted, the command fails because the CLI needs to know where to install the Skill.

```bash
memos init --agent codex
```

You can also write the API Key during initialization:

```bash
memos init --api-key YOUR_API_KEY --agent codex
```

Supported Agents:

```bash
memos init --agent codex     # ~/.codex/skills/memos/
memos init --agent cursor    # ~/.cursor/skills/memos/
memos init --agent claude    # ~/.claude/skills/memos/
memos init --agent openclaw  # ~/.openclaw/skills/memos/
memos init --agent hermes    # ~/.hermes/skills/memos/
```

Once installed, the Agent will automatically load the Skill. During each conversation turn, the Agent will:

1. **Before answering** — automatically run `memos search` to retrieve long-term memories related to the current task
2. **After answering** — automatically run `memos add` to write new facts, preferences, etc. into MemOS

If you already have a MemOS plugin installed (e.g. the OpenClaw cloud plugin), add `--memos-plugin` to generate plugin-aware Skill guidance:

```bash
memos init --agent openclaw --memos-plugin
```

Using OpenClaw as an example, in our internal Agent memory evaluation, using MemOS CLI alone reduced token usage by about 65.5%; integrating MemOS Cloud + CLI reached an accuracy of 0.7727.

| Parameter | Description |
| --- | --- |
| `-k, --api-key` | MemOS API Key |
| `--user-id` | Default user ID |
| `--conversation-id` | Default conversation ID |
| `--memos-plugin` | Generate plugin-aware Skill guidance when a MemOS memory plugin is installed |
| `--agent` | Install Skill to a specific Agent directory; required |

### 3.2 Use Directly in Terminal

If you only use CLI commands manually in a terminal and do not install an Agent Skill, use `memos config set` to configure CLI variables. After these values are set, later commands automatically use them when the corresponding parameter is not provided.

Configure the API Key:

```bash
memos config set platform.api_key YOUR_API_KEY
```

Configure the default user ID:

```bash
memos config set defaults.user_id user_123
```

Configure the default conversation ID:

```bash
memos config set defaults.conversation_id conv_001
```

## 4. Quick Start

After completing Agent initialization or terminal configuration above, use the following commands to verify memory operations.

Add a memory:

```bash
memos add "The user prefers Python programming"
```

Search related memories:

```bash
memos search "programming language preference"
```

Chat with memory:

```bash
memos chat "Do you know my preference?"
```

Get memories for a user:

```bash
memos get user_123
```

Query the original text of a memory:

```bash
memos origin mem_123456
```

Delete one memory, or delete all memories for a user:

```bash
memos delete mem_123456
memos delete --user-id user_123
```

## 5. Command Reference

### `memos add`

Write a memory into MemOS.

```bash
memos add "The user prefers Python for data analysis and often uses pandas"
memos add --message "The user frequently uses Jupyter Notebook" --user-id user_123
```

| Parameter | Description |
| --- | --- |
| `[MESSAGE]` | Memory content to write; use either this or `--message` |
| `-m, --message` | Memory content; alternative to the positional argument |
| `--user-id` | User identifier; defaults to `defaults.user_id` in config |
| `--format` | Output format; defaults to `agent` |

### `memos search`

Search for memories related to a query.

```bash
memos search "data analysis tool preference"
memos search "programming language" --format json --detail detail
```

| Parameter | Description |
| --- | --- |
| `[QUERY]` | Search query; use either this or `--query` |
| `-q, --query` | Search query; alternative to the positional argument |
| `--user-id` | User identifier; defaults to `defaults.user_id` in config |
| `--include-preference` | Include preference memories (`true` / `false`); defaults to `true` |
| `--include-tool-memory` | Include tool memories (`true` / `false`); defaults to `false` |
| `--include-skill-memory` | Include skill memories (`true` / `false`); defaults to `false` |
| `--memory-limit-number` | Max number of main memories to recall; defaults to `9` |
| `--preference-limit-number` | Max number of preference memories to recall; defaults to `9` |
| `--tool-memory-limit-number` | Max number of tool memories to recall; defaults to `6` |
| `--skill-memory-limit-number` | Max number of skill memories to recall; defaults to `6` |
| `--format` | Output format; defaults to `agent` |
| `--detail` | Detail level for non-JSON output; defaults to `simple`; supports `simple`, `detail` |

### `memos get`

Get memories by user.

```bash
memos get user_123
memos get user_123 --format json --detail detail
```

| Parameter | Description |
| --- | --- |
| `[USER_ID]` | User identifier; falls back to `defaults.user_id` in config |
| `--user-id` | Alias for `[USER_ID]`; same fallback rules |
| `--page` | Page number; omitted from request body if not set |
| `--size` | Page size; omitted from request body if not set |
| `--include-preference` | Include preference memories (`true` / `false`); defaults to API default if not set |
| `--include-tool-memory` | Include tool memories (`true` / `false`); defaults to API default if not set |
| `--format` | Output format; defaults to `agent` |
| `--detail` | Detail level; defaults to `simple`; supports `simple`, `detail` |

### `memos origin`

Query the original text of a memory by memory ID.

```bash
memos origin mem_123456
memos origin mem_123456 --format json
```

| Parameter | Description |
| --- | --- |
| `MEMORY_ID` | Memory ID whose original text should be queried; required |
| `--format` | Output format; defaults to `agent` |

### `memos delete`

Delete one memory, or delete all memories for a user.

```bash
memos delete mem_123456 --format json
memos delete --user-id user_123 --format json
```

| Parameter | Description |
| --- | --- |
| `[MEMORY_ID]` | Memory ID to delete; pass this to delete a single memory |
| `--user-id` | Delete all memories for this user; use either this or `MEMORY_ID` |
| `--format` | Output format; defaults to `agent` |

### `memos chat`

Chat using MemOS memories as context.

```bash
memos chat "Do you know my preferences?"
memos chat "Do you know my preferences?" --user-id user_123 --format table
```

| Parameter | Description |
| --- | --- |
| `[QUERY]` | Chat question; use either this or `--query` |
| `-q, --query` | Chat question; alternative to the positional argument |
| `--user-id` | User identifier; defaults to `defaults.user_id` in config |
| `--format` | Output format; defaults to `agent` |

### `memos extract`

Extract candidate memories from a message without writing them.

```bash
memos extract "The user likes coffee and prefers dark mode" --format json
```

| Parameter | Description |
| --- | --- |
| `[MESSAGE]` | Message to extract from; use either this or `--message` |
| `-m, --message` | Message to extract from; alternative to the positional argument |
| `--user-id` | User identifier; defaults to `defaults.user_id` in config |
| `--format` | Output format; defaults to `agent` |

### `memos rerank`

Rerank candidate documents by relevance.

```bash
memos rerank "python backend" "Flask guide" "React guide" --format json
```

| Parameter | Description |
| --- | --- |
| `[QUERY]` | Rerank query; use either this or `--query` |
| `[DOCUMENTS]...` | Candidate document texts; multiple positional arguments |
| `-q, --query` | Rerank query; alternative to the positional argument |
| `--documents` | Candidate document texts; can be repeated |
| `--top-n` | Return only the top N results |
| `--format` | Output format; defaults to `agent` |

### `memos feedback`

Submit feedback to improve memory management quality.

```bash
memos feedback "Prefer concise, direct technical answers." --user-id user_123 --format json
```

| Parameter | Description |
| --- | --- |
| `[FEEDBACK_TEXT]` | Feedback content; use either this or `--feedback-content` |
| `--feedback-content` | Feedback content; alternative to the positional argument |
| `--user-id` | User identifier; defaults to `defaults.user_id` in config |
| `--format` | Output format; defaults to `agent` |

## 6. Output Formats

All commands support `--format`. The default format is `agent`. `search` and `get` also support `--detail`.

| Format | Use case |
| --- | --- |
| `table` | Human-readable terminal output |
| `markdown` | Paste into documentation |
| `agent` | Default; inject directly into Agent context |
| `json` | Scripts, workflows, or structured processing |

```bash
memos search "python"
memos search "python" --format table --detail simple
memos search "python" --format markdown --detail detail
memos search "python" --format agent --detail simple
memos search "python" --format json --detail detail
```

## 7. Configuration Commands and Environment Variables

View or modify local configuration:

```bash
memos config show
memos config get platform.api_key
memos config set platform.api_key YOUR_API_KEY
memos config set defaults.user_id user_123
memos config set defaults.conversation_id conv_001
```

| Environment Variable | Description |
| --- | --- |
| `MEMOS_API_KEY` | Your API Key |
| `MEMOS_BASE_URL` | API Base URL; defaults to `https://memos.memtensor.cn/api/openmem/v1` |

Global options:

| Parameter | Description |
| --- | --- |
| `--api-key TEXT` | Override the API Key in local configuration |
| `--base-url TEXT` | Override the API Base URL |
| `--version` | Show version number |

All CLI requests include a `source=cli` tag. When the framework can be identified from environment variables or parent processes, the `framework` info is also attached to memory API requests.

## 8. CLI, Plugin, and MCP

| Integration | Best for | Characteristics |
| --- | --- | --- |
| Plugin | Agent frameworks with deep MemOS integration | Deepest integration and best experience; requires per-framework adaptation |
| CLI + Skill | Any Agent framework that can execute shell commands | Highly portable, low adaptation cost, great for cross-framework automation |
| MCP | MCP-native clients | Standardized tool protocol for clients that support MCP |

The three approaches are complementary. Plugin is best for deep integration, CLI + Skill for general automation, and MCP for MCP-native clients.

## Next Steps

::card-group
  :::card
  ---
  icon: ri:cloud-line
  title: Quick Start
  to: /memos_cloud/getting_started/quick_start
  ---
  Run the basic memory write and search flow with API / SDK
  :::

  :::card
  ---
  icon: ri:terminal-box-line
  title: MCP Guide
  to: /mcp_agent/mcp/guide
  ---
  Connect MemOS memory tools through MCP clients
  :::

  :::card
  ---
  icon: ri:puzzle-line
  title: OpenClaw Cloud Plugin
  to: /openclaw/guide
  ---
  Use the OpenClaw plugin for deeper Agent integration
  :::
::
