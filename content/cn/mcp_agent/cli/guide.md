---
title: MemOS CLI
desc: 通过命令行把 MemOS 接入本地终端和 Agent 工作流。
---

MemOS CLI 面向可以执行命令行的 Agent 和开发环境。它把常用记忆操作封装成 `memos` 命令，适合在终端里快速验证，也适合配合 Skill / Rule 让 Agent 在回答前检索记忆、回答后写入新记忆。



## 1. 适合什么时候使用

- 你希望在终端里快速验证 `add`、`search`、`get`、`delete` 等记忆操作；
- 你的 Agent 容易“失忆”，并且可以执行 shell 命令；
- 你同时使用多种 Agent 框架，并且希望实现跨框架的记忆同步。



## 2. 安装

```bash
npm install -g @memtensor/memos-cloud-cli
```

安装后，可以通过以下命令确认 CLI 可用：

```bash
memos --help
```



## 3. 选择使用方式并配置

MemOS CLI 有两种使用方式：一种是安装到 Agent 中，让 Agent 自动使用记忆；另一种是在终端中手动执行 `memos` 命令。

### 3.1 在 Agent 中使用

如果要让 Agent 自动检索和写入记忆，使用 `memos init` 安装记忆 Skill。当前 `--agent` 为必填参数，不传会直接报错，因为 CLI 需要知道 Skill 应该安装到哪个 Agent 目录。

```bash
memos init --agent codex
```

也可以在初始化时同时写入 API Key：

```bash
memos init --api-key YOUR_API_KEY --agent codex
```

目前支持的 Agent：

```bash
memos init --agent codex     # ~/.codex/skills/memos/
memos init --agent cursor    # ~/.cursor/skills/memos/
memos init --agent claude    # ~/.claude/skills/memos/
memos init --agent openclaw  # ~/.openclaw/skills/memos/
memos init --agent hermes    # ~/.hermes/skills/memos/
```

安装后，Agent 启动时会自动加载该 Skill。在每轮对话中，Agent 会：

1. **回答前**自动执行 `memos search`，检索与当前任务相关的长期记忆
2. **回答后**自动执行 `memos add`，将本轮出现的新事实、偏好等写入 MemOS

如果你已经安装了 MemOS 插件（如 OpenClaw 云插件），可以加上 `--memos-plugin` 生成插件感知的 Skill 引导：

```bash
memos init --agent openclaw --memos-plugin
```

::tip
以 OpenClaw 为例，在 LOCOMO 评测中，单独接入 MemOS CLI 后 Token 消耗降低约 65.5%；接入 MemOS Cloud + CLI 后，正确率从 66.60% 提升到 77.27%。
::

| 参数 | 说明 |
| --- | --- |
| `-k, --api-key` | MemOS API Key |
| `--user-id` | 默认用户 ID |
| `--conversation-id` | 默认会话 ID |
| `--memos-plugin` | 已安装 MemOS 插件时，生成插件感知的 Skill 引导 |
| `--agent` | 将 Skill 安装到指定 Agent 的目录；必填 |

### 3.2 直接在终端使用

如果只在终端中手动使用 CLI，不安装 Agent Skill，则使用 `memos config set` 单独配置 CLI 变量。设置后，后续命令未传对应参数时会自动使用这些默认值。

配置 API Key：

```bash
memos config set platform.api_key YOUR_API_KEY
```

配置默认用户 ID：

```bash
memos config set defaults.user_id user_123
```

配置默认会话 ID：

```bash
memos config set defaults.conversation_id conv_001
```



## 4. 快速上手

完成上述 Agent 初始化或终端配置后，可以使用以下命令验证记忆操作。

::steps{level="4"}

#### 写入一条记忆：

```bash
memos add "用户喜欢 Python 编程"
```

#### 搜索相关记忆：

```bash
memos search "编程语言偏好"
```

#### 结合记忆进行对话：

```bash
memos chat "你知道我的偏好吗？"
```

#### 获取某个用户的记忆：

```bash
memos get user_123
```

#### 查询某条记忆的原文：

```bash
memos origin mem_123456
```

#### 删除单条记忆，或删除某个用户的全部记忆：

```bash
memos delete mem_123456
memos delete --user-id user_123
```

::



## 5. 命令参考

### `memos add`

向 MemOS 写入一条记忆内容。

```bash
memos add "用户喜欢用 Python 做数据分析，常用 pandas"
memos add --message "用户常用 Jupyter Notebook" --user-id user_123
```

| 参数 | 说明 |
| --- | --- |
| `[MESSAGE]` | 要写入的记忆内容；与 `--message` 二选一 |
| `-m, --message` | 要写入的记忆内容；与位置参数二选一 |
| `--user-id` | 用户标识，默认取配置中的 `defaults.user_id` |
| `--format` | 输出格式，默认 `agent` |

### `memos search`

搜索和当前查询相关的记忆。

```bash
memos search "用户的数据分析工具偏好"
memos search "编程语言" --format json --detail detail
```

| 参数 | 说明 |
| --- | --- |
| `[QUERY]` | 搜索关键词；与 `--query` 二选一 |
| `-q, --query` | 搜索关键词；与位置参数二选一 |
| `--user-id` | 用户标识，默认取配置中的 `defaults.user_id` |
| `--include-preference` | 是否召回偏好记忆（`true` / `false`），默认 `true` |
| `--include-tool-memory` | 是否召回工具记忆（`true` / `false`），默认 `false` |
| `--include-skill-memory` | 是否召回技能记忆（`true` / `false`），默认 `false` |
| `--memory-limit-number` | 主记忆召回条数，默认 `9` |
| `--preference-limit-number` | 偏好记忆召回条数，默认 `9` |
| `--tool-memory-limit-number` | 工具记忆召回条数，默认 `6` |
| `--skill-memory-limit-number` | 技能记忆召回条数，默认 `6` |
| `--format` | 输出格式，默认 `agent` |
| `--detail` | 非 JSON 输出的详略级别，默认 `simple`；支持 `simple`、`detail` |

### `memos get`

按用户获取记忆。

```bash
memos get user_123
memos get user_123 --format json --detail detail
```

| 参数 | 说明 |
| --- | --- |
| `[USER_ID]` | 用户标识；不传则回退到配置中的 `defaults.user_id` |
| `--user-id` | `[USER_ID]` 的兼容别名，回退规则相同 |
| `--page` | 页码；不传则请求体不带该字段 |
| `--size` | 每页条数；不传则请求体不带该字段 |
| `--include-preference` | 是否召回偏好记忆（`true` / `false`）；不传时由接口默认值决定 |
| `--include-tool-memory` | 是否召回工具记忆（`true` / `false`）；不传时由接口默认值决定 |
| `--format` | 输出格式，默认 `agent` |
| `--detail` | 详略级别，默认 `simple`；支持 `simple`、`detail` |

### `memos origin`

按记忆 ID 查询该条记忆的原文。

```bash
memos origin mem_123456
memos origin mem_123456 --format json
```

| 参数 | 说明 |
| --- | --- |
| `MEMORY_ID` | 待查询原文的记忆 ID；必填；传 `MEMORY_ID` 表示查询该单条记忆的原文 |
| `--format` | 输出格式，默认 `agent` |

### `memos delete`

删除一条记忆，或删除指定用户的全部记忆。

```bash
memos delete mem_123456 --format json
memos delete --user-id user_123 --format json
```

| 参数 | 说明 |
| --- | --- |
| `[MEMORY_ID]` | 待删除的记忆 ID；传此参数表示删除单条记忆 |
| `--user-id` | 删除该用户的全部记忆；与 `MEMORY_ID` 二选一 |
| `--format` | 输出格式，默认 `agent` |

### `memos chat`

基于 MemOS 记忆进行问答。

```bash
memos chat "你知道我的偏好吗？"
memos chat "你知道我的偏好吗？" --user-id user_123 --format table
```

| 参数 | 说明 |
| --- | --- |
| `[QUERY]` | 对话问题；与 `--query` 二选一 |
| `-q, --query` | 对话问题；与位置参数二选一 |
| `--user-id` | 用户标识，默认取配置中的 `defaults.user_id` |
| `--format` | 输出格式，默认 `agent` |

### `memos extract`

从消息中提取候选记忆，但不写入。

```bash
memos extract "用户喜欢咖啡，也偏好深色模式" --format json
```

| 参数 | 说明 |
| --- | --- |
| `[MESSAGE]` | 待提取的消息内容；与 `--message` 二选一 |
| `-m, --message` | 待提取的消息内容；与位置参数二选一 |
| `--user-id` | 用户标识，默认取配置中的 `defaults.user_id` |
| `--format` | 输出格式，默认 `agent` |

### `memos rerank`

对候选文档做相关性重排。

```bash
memos rerank "python 后端" "Flask guide" "React guide" --format json
```

| 参数 | 说明 |
| --- | --- |
| `[QUERY]` | 重排查询；与 `--query` 二选一 |
| `[DOCUMENTS]...` | 候选文档文本；可传多个位置参数 |
| `-q, --query` | 重排查询；与位置参数二选一 |
| `--documents` | 候选文档文本；可重复传入 |
| `--top-n` | 只返回前 N 条结果 |
| `--format` | 输出格式，默认 `agent` |

### `memos feedback`

提交反馈内容，优化记忆管理效果。

```bash
memos feedback "偏好简洁、直接的技术回答。" --user-id user_123 --format json
```

| 参数 | 说明 |
| --- | --- |
| `[FEEDBACK_TEXT]` | 反馈内容；与 `--feedback-content` 二选一 |
| `--feedback-content` | 反馈内容；与位置参数二选一 |
| `--user-id` | 用户标识，默认取配置中的 `defaults.user_id` |
| `--format` | 输出格式，默认 `agent` |



## 6. 输出格式

所有子命令都支持 `--format`，默认输出格式为 `agent`。`search` 和 `get` 还额外支持 `--detail`。

| 格式 | 适用场景 |
| --- | --- |
| `table` | 终端人工阅读 |
| `markdown` | 粘贴到文档中 |
| `agent` | 默认格式，让 Agent 直接注入上下文 |
| `json` | 脚本、工作流或结构化处理 |

```bash
memos search "python"
memos search "python" --format table --detail simple
memos search "python" --format markdown --detail detail
memos search "python" --format agent --detail simple
memos search "python" --format json --detail detail
```



## 7. 配置命令与环境变量

查看或修改本地配置：

```bash
memos config show
memos config get platform.api_key
memos config set platform.api_key YOUR_API_KEY
memos config set defaults.user_id user_123
memos config set defaults.conversation_id conv_001
```

| 环境变量 | 说明 |
| --- | --- |
| `MEMOS_API_KEY` | 你的 API Key |
| `MEMOS_BASE_URL` | API Base URL，默认 `https://memos.memtensor.cn/api/openmem/v1` |

全局选项：

| 参数 | 说明 |
| --- | --- |
| `--api-key TEXT` | 覆盖本地配置中的 API Key |
| `--base-url TEXT` | 覆盖 API Base URL |
| `--version` | 显示版本号 |

## 8. CLI、Plugin 和 MCP

| 接入方式 | 适合场景 | 特点 |
| --- | --- | --- |
| Plugin | 已有深度适配的 Agent 框架 | 集成最深，体验最好，但需要针对框架单独适配 |
| CLI + Skill | 任意可调用命令行的 Agent 框架 | 通用性强，接入成本低，适合跨框架自动化 |
| MCP | MCP 原生客户端 | 标准化工具协议，适合支持 MCP 的客户端 |
