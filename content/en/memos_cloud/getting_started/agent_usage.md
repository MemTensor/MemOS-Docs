---
title: Use in Agents
desc: Connect MemOS to Agent workflows through plugins, MCP, and APIs.
---

In addition to calling the cloud APIs directly, you can connect MemOS to your AI workflow through plugins, MCP, and other integration methods if you use:

- Agent frameworks such as OpenClaw and Hermes.
- AI clients such as Cursor, VS Code, Claude Desktop, Cline, and Chatbox.

These integration methods help you save tokens while adding long-term memory to your Agent workflows.

## 1. Before You Start

- Register and sign in to the [MemOS Cloud platform](https://memos-dashboard.openmem.net/quickstart).
- Get an API Key from the [API Key page](https://memos-dashboard.openmem.net/apikeys).

## 2. Use the Plugin

MemOS currently provides a cloud plugin deeply integrated with **OpenClaw**. If you use OpenClaw, prefer the plugin integration.

::steps{level="3"}

### Configure the API Key

The plugin reads OpenClaw-related environment variables or `.env` files. The minimal configuration is:

```env
MEMOS_API_KEY=YOUR_API_KEY
```

You can also write it directly into the OpenClaw environment file:

```bash
mkdir -p ~/.openclaw
echo 'MEMOS_API_KEY=YOUR_API_KEY' >> ~/.openclaw/.env
```

### Install and enable the plugin

```bash
openclaw plugins install @memtensor/memos-cloud-openclaw-plugin@latest
openclaw gateway restart
```

Confirm that the plugin is enabled in `~/.openclaw/openclaw.json`:

```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": { "enabled": true }
    }
  }
}
```

### Start chatting

You can now have multi-turn conversations with OpenClaw:

- First session: "I prefer using Python."
- Second session after restart: "Do you remember which programming language I like?"

::

::tip
The OpenClaw plugin also supports multi-Agent isolation, Config UI, filters, and more detailed configuration. See the [OpenClaw Cloud Plugin](/openclaw/guide) for full configuration.
::

## 3. Use MCP

Mainstream clients that support MCP include **Cursor, Claude Desktop, Cline, VS Code / Trae, and Chatbox**. Taking Cursor as an example, after configuration, Cursor can directly call MemOS memory tools and use memory across clients.

::steps{level="3"}

### Add an MCP Server

In Cursor, go to:

```text
Cursor Settings → Tools & MCP → Add Custom MCP
```

Then add this to `mcp.json`:

```json
{
  "mcpServers": {
    "memos-api-mcp": {
      "timeout": 60,
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@memtensor/memos-api-mcp@latest"
      ],
      "env": {
        "MEMOS_API_KEY": "YOUR_API_KEY",
        "MEMOS_USER_ID": "your-user-id",
        "MEMOS_CHANNEL": "MODELSCOPE"
      }
    }
  }
}
```

After configuration, confirm that Cursor's MCP tool list shows tools such as `add_message` and `search_memory`.

### Cursor Rules

To make Cursor use memories more reliably, add rules like these to User Rules:

```text
Before answering the user's question, call MemOS search_memory to search long-term memories related to the current task.
After answering, if this turn contains new user facts, preferences, project background, or other information useful in the long term, call add_message to write it into MemOS.
Only use memories relevant to the current task. Ignore memories that are irrelevant, outdated, or about the wrong subject.
Do not expose internal implementation details such as "memory store" or "retrieval results" to the user.
```

### Start chatting

- First session: tell it who you are, your hobbies, and your profession, and ask it to remember.
- Second session after restart: ask it who you are.

::

::tip
Claude Desktop, Cline, Chatbox, and other clients are configured similarly, though the entry points differ. For more examples, see the [MCP Guide](/mcp_agent/mcp/guide).
::

## Which Integration Should You Choose?

| Integration | Best for | Priority |
| --- | --- | --- |
| Plugin | OpenClaw and other Agent environments deeply integrated with MemOS | Prefer first; highest automation |
| MCP | Cursor, Claude Desktop, Cline, Chatbox, and other AI clients | Use when the client supports MCP |
| API / SDK | Self-built Agents, chatbots, or business applications | Most control; best for production integration |

## Next Steps

::card-group
  :::card
  ---
  icon: ri:puzzle-line
  title: OpenClaw Cloud Plugin
  to: /openclaw/guide
  ---
  View full installation, enabling, and advanced configuration for the OpenClaw plugin
  :::

  :::card
  ---
  icon: ri:terminal-box-line
  title: MCP Guide
  to: /mcp_agent/mcp/guide
  ---
  Learn how to configure MCP in Cursor, Claude Desktop, Cline, and other clients
  :::

  :::card
  ---
  icon: ri:file-code-line
  title: API / SDK
  to: /memos_cloud/getting_started/quick_start
  ---
  Start here if you are building your own Agent or application
  :::
::
