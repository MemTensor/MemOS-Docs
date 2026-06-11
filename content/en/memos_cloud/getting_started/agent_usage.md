---
title: Use in Agents
desc: Connect MemOS to Agent workflows through plugins, MCP, CLI, and APIs.
---

In addition to calling the cloud APIs directly, you can connect MemOS to your AI workflow through plugins, MCP, CLI, and other integration methods if you use:

- Agent frameworks such as OpenClaw and Hermes.
- AI clients such as Cursor, VS Code, Claude Desktop, Cline, and Chatbox.
- Any Agent or development environment that can execute shell commands.

These integration methods help you save tokens while adding long-term memory to your Agent workflows.

## Quick Integration (Recommended)

You can connect MemOS automatically by chatting with your Agent in natural language. Once it is done, you can start chatting right away with no extra setup.

### Use the Plugin

MemOS currently provides a cloud plugin deeply integrated with **OpenClaw**. If you use OpenClaw, prefer the plugin integration. Copy the following prompt and paste it into your OpenClaw chat:

<details class="not-prose my-5 rounded-md border border-default bg-muted/30 px-4 py-3">
  <summary class="cursor-pointer select-none text-sm font-medium text-highlighted">
    View the OpenClaw plugin setup prompt
  </summary>
  <div class="mt-4">

```text api-key
Help me set up the MemOS OpenClaw plugin. Follow these steps:

1. Verify the API Key
   Check the value of MEMOS_API_KEY in the commands of step 2:
   - If it is already a real API Key starting with mpg-, go straight to step 2
   - If it is still a placeholder, guide the user to open
     https://memos-dashboard.openmem.net/quickstart/ to get an API Key,
     then replace the placeholder in the commands with the real Key

2. Configure the API Key environment variable
   Detect the current operating system first, then write it accordingly:

   macOS / Linux:
     mkdir -p ~/.openclaw
     echo 'MEMOS_API_KEY=YOUR_API_KEY' >> ~/.openclaw/.env

   Windows PowerShell:
     [System.Environment]::SetEnvironmentVariable("MEMOS_API_KEY", "YOUR_API_KEY", "User")

3. Install and enable the plugin
   openclaw plugins install @memtensor/memos-cloud-openclaw-plugin@latest
   openclaw gateway restart

4. Verify the installation
   Read ~/.openclaw/openclaw.json (%USERPROFILE%\.openclaw\openclaw.json on Windows),
   and confirm that under plugins.entries, memos-cloud-openclaw-plugin has enabled set to true
```

  </div>
</details>

OpenClaw will install the plugin, prompt you to get an API Key, and complete all the configuration.

### Use the MemOS CLI

The MemOS CLI provides a more universal way to integrate with Agents and works with any Agent framework that can execute shell commands. Copy the following prompt and send it to your Agent:

<details class="not-prose my-5 rounded-md border border-default bg-muted/30 px-4 py-3">
  <summary class="cursor-pointer select-none text-sm font-medium text-highlighted">
    View the CLI setup prompt
  </summary>
  <div class="mt-4">

```text api-key
Help me set up the MemOS CLI development environment. Follow these steps:
1. Install the MemOS CLI globally
npm i -g @memtensor/memos-cloud-cli
2. Initialize the CLI configuration
memos init --api-key YOUR_API_KEY --agent <your agent>
For step 2, pass the --agent parameter matching the Agent the user is using.
If the value of --api-key is already a real Key starting with mpg-, run it directly;
if it is still a placeholder, first guide the user to open
https://memos-dashboard.openmem.net/ to get an API Key and replace it.
```

  </div>
</details>

Your Agent will install the MemOS CLI and configure the corresponding Skill automatically ([View supported Agents](/mcp_agent/cli/guide#_31-use-with-agents)).

## Manual Configuration

### 1. Before You Start

- Register and sign in to the [MemOS Cloud platform](https://memos-dashboard.openmem.net/quickstart).
- Get an API Key from the [API Key page](https://memos-dashboard.openmem.net/apikeys).

### 2. Use the Plugin

::steps{level="4"}

#### Configure the API Key

The plugin reads OpenClaw-related environment variables or `.env` files. The minimal configuration is:

```env
MEMOS_API_KEY=YOUR_API_KEY
```

You can also write it directly into the OpenClaw environment file:

::code-group
```bash [macOS / Linux]
mkdir -p ~/.openclaw
echo 'MEMOS_API_KEY=YOUR_API_KEY' >> ~/.openclaw/.env
```
```powershell [Windows PowerShell]
[System.Environment]::SetEnvironmentVariable("MEMOS_API_KEY", "YOUR_API_KEY", "User")
```
::

#### Install and enable the plugin

```bash
openclaw plugins install @memtensor/memos-cloud-openclaw-plugin@latest
openclaw gateway restart
```

::tip
Windows users: if you encounter `Error: spawn EINVAL`, see [OpenClaw Cloud Plugin - Manual Install](/openclaw/guide) for an alternative method.
::

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

#### Start chatting

You can now have multi-turn conversations with OpenClaw:

- First session: "I prefer using Python."
- Second session after restart: "Do you remember which programming language I like?"

::

::tip
The OpenClaw plugin also supports multi-Agent isolation, Config UI, filters, and more detailed configuration. See the [OpenClaw Cloud Plugin](/openclaw/guide) for full configuration.
::

### 3. Use MCP

Mainstream clients that support MCP include **Cursor, Claude Desktop, Cline, VS Code / Trae, and Chatbox**. Taking Cursor as an example, after configuration, Cursor can directly call MemOS memory tools and use memory across clients.

::steps{level="4"}

#### Add an MCP Server

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

#### Cursor Rules

To make Cursor use memories more reliably, add rules like these to User Rules:

```text
Before answering the user's question, call MemOS search_memory to search long-term memories related to the current task.
After answering, if this turn contains new user facts, preferences, project background, or other information useful in the long term, call add_message to write it into MemOS.
Only use memories relevant to the current task. Ignore memories that are irrelevant, outdated, or about the wrong subject.
Do not expose internal implementation details such as "memory store" or "retrieval results" to the user.
```

#### Start chatting

- First session: tell it who you are, your hobbies, and your profession, and ask it to remember.
- Second session after restart: ask it who you are.

::

::tip
Claude Desktop, Cline, Chatbox, and other clients are configured similarly, though the entry points differ. For more examples, see the [MCP Guide](/mcp_agent/mcp/guide).
::

### 4. Use CLI + Skill

If your Agent framework can execute shell commands (e.g. Cursor, Codex, Claude Code, Hermes), you can use the MemOS CLI to install a memory Skill with one command, enabling your Agent to automatically search and write memories.

::tip
Using OpenClaw as an example, in the LOCOMO evaluation, using MemOS CLI alone reduced token usage by about 65.5%; integrating MemOS Cloud + CLI improved accuracy from 66.60% to 77.27%.
::

::steps{level="4"}

#### Install the CLI

```bash
npm install -g @memtensor/memos-cloud-cli
```

#### Initialize and install Skill

```bash
memos init --agent cursor
memos init --api-key YOUR_API_KEY --agent cursor
```

`--agent` installs the MemOS memory Skill into the corresponding Agent's skills directory. `--agent` is currently required; if it is omitted, the command fails because the CLI needs to know where to install the Skill. Supported targets:

```bash
memos init --agent cursor    # ~/.cursor/skills/memos/
memos init --agent codex     # ~/.codex/skills/memos/
memos init --agent claude    # ~/.claude/skills/memos/
memos init --agent openclaw  # ~/.openclaw/skills/memos/
memos init --agent hermes    # ~/.hermes/skills/memos/
```

#### Start chatting

Once installed, the Agent will automatically load the Skill. During each conversation turn, the Agent will:

1. **Before answering** — automatically run `memos search` to retrieve long-term memories related to the current task
2. **After answering** — automatically run `memos add` to write new facts, preferences, etc. into MemOS

You can verify the same way:

- First session: "I prefer using Python."
- Second session after restart: "Do you remember which programming language I like?"

::

::tip
The CLI also supports manual memory operations in a terminal (`add`, `search`, `get`, `origin`, `delete`, etc.). If you only use the CLI in a terminal and do not install an Agent Skill, configure the API Key, default user ID, and default conversation ID with `memos config set`. See [MemOS CLI](/mcp_agent/cli/guide) for the full command reference.
::

### Which Integration Should You Choose?

| Integration | Best for | Priority |
| --- | --- | --- |
| Plugin | OpenClaw and other Agent environments deeply integrated with MemOS | Prefer first; highest automation |
| CLI + Skill | Any Agent framework that can execute shell commands | Most portable; works across frameworks |
| MCP | Cursor, Claude Desktop, Cline, Chatbox, and other AI clients | Use when the client supports MCP |
| API / SDK | Self-built Agents, chatbots, or business applications | Most control; best for production integration |

### Next Steps

::card-group
  :::card
  ---
  icon: i-ri-puzzle-line
  title: OpenClaw Cloud Plugin
  to: /openclaw/guide
  ---
  View full installation, enabling, and advanced configuration for the OpenClaw plugin
  :::

  :::card
  ---
  icon: i-ri-command-line
  title: MemOS CLI
  to: /mcp_agent/cli/guide
  ---
  View the full CLI command reference and Skill installation guide
  :::

  :::card
  ---
  icon: i-ri-terminal-box-line
  title: MCP Guide
  to: /mcp_agent/mcp/guide
  ---
  Learn how to configure MCP in Cursor, Claude Desktop, Cline, and other clients
  :::

  :::card
  ---
  icon: i-ri-file-code-line
  title: API / SDK
  to: /memos_cloud/getting_started/quick_start
  ---
  Start here if you are building your own Agent or application
  :::
::
