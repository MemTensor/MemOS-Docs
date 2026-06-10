---
title: 在 Agent 中使用
desc: 通过插件、MCP、CLI 等形式，把 MemOS 接入 Agent 工作流。
---

除了自行接入云服务接口，如果你正在使用：

- OpenClaw、Hermes 等 Agent 框架
- Cursor、VS Code、Claude Desktop 等 AI 客户端
- 任何可以执行命令行的 Agent 或开发环境

可以通过 MemOS 插件、MCP、CLI 等形式，将 MemOS 接入到你的 AI 工作流中，节省 Token，同时提升长期记忆能力。

## 快速接入（推荐）

你可以通过与Agent自然对话的方式自动接入 MemOS，接入完成后即可进行对话，无需其他操作。

### 接入插件

MemOS 目前提供深度适配 **OpenClaw** 的云服务插件，如果你正在使用 OpenClaw，优先考虑插件接入。将以下提示词复制并粘贴到你的 OpenClaw 聊天中：

<details class="not-prose my-5 rounded-md border border-default bg-muted/30 px-4 py-3">
  <summary class="cursor-pointer select-none text-sm font-medium text-highlighted">
    展开查看 OpenClaw 插件配置提示词
  </summary>
  <div class="mt-4">

```text api-key=用户提供的Key
帮我配置 MemOS OpenClaw 插件，按以下步骤执行：

1. 确认 API Key
   检查第 2 步命令中 MEMOS_API_KEY 的值：
   - 如果已是以 mpg- 开头的真实 API Key，直接进入第 2 步
   - 如果是中文占位符，引导用户打开 https://memos-dashboard.openmem.net/cn/quickstart/
     获取 API Key，并用真实 Key 替换命令中的占位符

2. 配置 API Key 环境变量
   首先检测当前操作系统，然后按对应方式写入：

   macOS / Linux：
     mkdir -p ~/.openclaw
     echo 'MEMOS_API_KEY=用户提供的Key' >> ~/.openclaw/.env

   Windows PowerShell：
     [System.Environment]::SetEnvironmentVariable("MEMOS_API_KEY", "用户提供的Key", "User")

3. 安装并启用插件
   openclaw plugins install @memtensor/memos-cloud-openclaw-plugin@latest
   openclaw gateway restart

4. 验证安装
   读取 ~/.openclaw/openclaw.json（Windows 为 %USERPROFILE%\.openclaw\openclaw.json），
   确认 plugins.entries 下 memos-cloud-openclaw-plugin 的 enabled 为 true
```

  </div>
</details>

OpenClaw 会安装插件，并提示你获取 API Key，完成所有配置。

### 接入 MemOS CLI

MemOS CLI 提供更通用的 Agent 交互方式，适合任何可执行命令行的 Agent 框架，将以下提示词复制并发送给你的 Agent：

<details class="not-prose my-5 rounded-md border border-default bg-muted/30 px-4 py-3">
  <summary class="cursor-pointer select-none text-sm font-medium text-highlighted">
    展开查看 CLI 配置提示词
  </summary>
  <div class="mt-4">

```text api-key=用户提供的Key
帮我配置 MemOS CLI 开发环境，按以下步骤执行：
1. 安装 MemOS CLI 到全局
npm i -g @memtensor/memos-cloud-cli
2. 初始化 CLI 配置
memos init --api-key 用户提供的Key --agent <your agent>
执行第 2 步时，根据当前用户使用的 Agent 传入对应的 --agent 参数。
若 --api-key 的值已是以 mpg- 开头的真实 Key，直接执行；若是中文占位符，
先引导用户打开 https://memos-dashboard.openmem.net/cn/ 获取 API Key 并替换。
```

  </div>
</details>

Agent会自动完成 MemOS CLI 的安装，并配置相应的Skill。

## 手动配置

### 1. 调用前准备

- 注册并登录 MemOS 云平台 [（点击注册）](https://memos-dashboard.openmem.net/quickstart)；
- 获取 API Key [（点击获取）](https://memos-dashboard.openmem.net/apikeys)；

### 2. 使用插件

::steps{level="4"}

#### 配置 API Key

插件会读取 OpenClaw 相关的环境变量或 `.env` 文件。最小配置如下：

```env
MEMOS_API_KEY=YOUR_API_KEY
```

也可以直接写入 OpenClaw 的环境文件：

::code-group

```bash [macOS / Linux]
mkdir -p ~/.openclaw
echo 'MEMOS_API_KEY=YOUR_API_KEY' >> ~/.openclaw/.env
```

```powershell [Windows PowerShell]
[System.Environment]::SetEnvironmentVariable("MEMOS_API_KEY", "YOUR_API_KEY", "User")
```

::

#### 安装并启用插件

```bash
openclaw plugins install @memtensor/memos-cloud-openclaw-plugin@latest
openclaw gateway restart
```

::tip
Windows 用户如果遇到 `Error: spawn EINVAL`，可以查看 [OpenClaw 云插件 - 手动安装](/cn/openclaw/guide) 使用替代安装方式。
::

确认 `~/.openclaw/openclaw.json` 中插件已启用：

```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": { "enabled": true }
    }
  }
}
```

#### 开始对话

现在，可以与你的 OpenClaw 进行多轮对话：

- 第一次会话：「我偏好使用 Python 语言」
- 第二次会话（新启动）：「你还记得我喜欢用什么编程语言吗？」

::

::tip
OpenClaw 插件还有多 Agent 隔离、Config UI、过滤和更细的配置项。完整配置请查看 [OpenClaw 云插件](/cn/openclaw/guide)。
::

### 3. 使用 MCP

支持 MCP 的主流客户端，例如  **Cursor、Claude Desktop、Cline、VS Code / Trae 和 Chatbox** 等。以 Cursor 为例，配置完成后，Cursor 可以直接调用 MemOS 提供的记忆操作工具，实现跨客户端的记忆。

::steps{level="4"}

#### 添加 MCP Server

在 Cursor 中进入：

```text
Cursor Settings → Tools & MCP → Add Custom MCP
```

然后在 `mcp.json` 中添加：

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

配置后，确认 Cursor 的 MCP 工具列表中能看到 `add_message`、`search_memory` 等工具。

#### Cursor Rules

为了让 Cursor 更稳定地使用记忆，建议在 User Rules 中加入：

```text
回答用户问题前，先调用 MemOS 的 search_memory 搜索与当前任务相关的长期记忆。
回答完成后，如果本轮对话出现新的用户事实、偏好、项目背景或长期有用的信息，调用 add_message 写入 MemOS。
只使用和当前任务相关的记忆；如果记忆不相关、过期或主体不一致，应忽略。
不要向用户暴露“记忆库”“检索结果”等内部实现细节。
```

#### 开始对话

- 现在，可以在聊天框中进行多轮对话：
  - 第一次会话：告诉它你是谁、你的爱好、职业，并让它记住
  - 第二次会话（新启动）：询问它你是谁

::

::tip
Claude Desktop、Cline、Chatbox 等客户端的配置方式类似，入口位置不同，更多示例请查看 [MCP 使用指南](/cn/mcp_agent/mcp/guide)。
::

### 4. 使用 CLI

如果你的 Agent 框架可以执行 shell 命令（例如 Cursor、Codex、Hermes 等），可以通过 MemOS CLI 一键安装记忆 Skill，让 Agent 根据 Skill 自动检索和写入记忆。

::tip
以 OpenClaw 为例，在 LOCOMO 评测中，单独接入 MemOS CLI 后 Token 消耗降低约 65.5%；接入 MemOS Cloud + CLI 后，正确率从 66.60% 提升到 77.27%。
::

::steps{level="4"}

#### 安装 CLI

```bash
npm install -g @memtensor/memos-cloud-cli
```

#### 初始化并安装 Skill

```bash
memos init --agent cursor
memos init --api-key YOUR_API_KEY --agent cursor
```

`--agent` 会将 MemOS 记忆 Skill 安装到对应 Agent 的 skills 目录。当前 `--agent` 为必填参数，不传会直接报错，因为 CLI 需要知道 Skill 应该安装到哪个 Agent 目录。支持的目标：

```bash
memos init --agent cursor    # ~/.cursor/skills/memos/
memos init --agent codex     # ~/.codex/skills/memos/
memos init --agent claude    # ~/.claude/skills/memos/
memos init --agent openclaw  # ~/.openclaw/skills/memos/
memos init --agent hermes    # ~/.hermes/skills/memos/
```

#### 开始对话

安装后，Agent 启动时会自动加载该 Skill。在每轮对话中，Agent 会：

1. **回答前**自动执行 `memos search`，检索与当前任务相关的长期记忆
2. **回答后**自动执行 `memos add`，将本轮出现的新事实、偏好等写入 MemOS

你可以用同样的方式验证效果：

- 第一次会话：「我偏好使用 Python 语言」
- 第二次会话（新启动）：「你还记得我喜欢用什么编程语言吗？」

::

::tip
CLI 还支持在终端中手动操作记忆（`add`、`search`、`get`、`origin`、`delete` 等）。如果只在终端中使用 CLI，不安装 Agent Skill，请通过 `memos config set` 配置 API Key、默认用户 ID 和默认会话 ID。完整命令参考请查看 [MemOS CLI](/cn/mcp_agent/cli/guide)。
::

### 选择哪种接入方式？


| 接入方式        | 适合谁                                          | 优先级          |
| ----------- | -------------------------------------------- | ------------ |
| 插件          | OpenClaw 等 MemOS 已深度适配的 Agent 环境             | 优先使用，自动化程度最高 |
| CLI + Skill | 任何可执行命令行的 Agent 框架                           | 通用性最强，跨框架适用  |
| MCP         | Cursor、Claude Desktop、Cline、Chatbox 等 AI 客户端 | 客户端支持 MCP 协议 |
| API / SDK   | 自研 Agent、Chatbot 或业务应用                       | 控制力最强，适合生产集成 |


### 下一步

::card-group
  :::card
  ---
  icon: i-ri-puzzle-line
  title: OpenClaw 云插件
  to: /cn/openclaw/guide
  ---
  查看 OpenClaw 插件的完整安装、启用和高级配置
  :::

  :::card
  ---
  icon: i-ri-command-line
  title: MemOS CLI
  to: /cn/mcp_agent/cli/guide
  ---
  查看 CLI 完整命令参考和 Skill 安装说明
  :::

  :::card
  ---
  icon: i-ri-terminal-box-line
  title: MCP 使用指南
  to: /cn/mcp_agent/mcp/guide
  ---
  查看 Cursor、Claude Desktop、Cline 等客户端如何配置 MCP
  :::

  :::card
  ---
  icon: i-ri-file-code-line
  title: API / SDK
  to: /cn/memos_cloud/getting_started/quick_start
  ---
  如果你在开发自己的 Agent 或应用，从这里开始
  :::
::
