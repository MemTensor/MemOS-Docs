---
title: MemOS MCP 使用指南
---

MemOS 记忆管理 MCP 是一款强大的 AI 记忆增强插件，支持**对话记忆存取**、**用户画像构建**与**向量知识库全生命周期管理**三大核心能力。

通过将 MemOS 接入 Claude、Cursor、Cline 等主流 AI 客户端，用户可以让 AI 持续积累个人记忆、理解用户偏好，并高效处理大规模专业文档，从根本上提升 AI 对话的连贯性与个性化水平。

## 1. 能力介绍

### 1.1 对话记忆管理

提供对话内容的写入、检索、删除与质量反馈功能，是 MemOS MCP 的基础能力模块。

| 工具 | 功能说明 |
|---|---|
| `add_message` | 将当前对话内容摘要写入用户记忆库，供后续检索使用 |
| `search_memory` | 根据检索词在用户个人记忆库中搜索相关历史记忆 |
| `delete_memory` | 从记忆库中删除指定的记忆条目 |
| `add_feedback` | 对记忆条目提交质量反馈，优化记忆管理效果 |

### 1.2 用户画像系统

**`get_user_profile`**：一键调取用户的全维度记忆画像。

不同于单一的事实记忆（Facts），用户画像还整合了显性/隐性偏好（Preferences）以及工具使用经验（Tool Trajectories），让 AI 能够回答"我是谁？"、"我的偏好是什么？"等身份相关问题，实现真正的个性化交互。

### 1.3 知识库全生命周期管理

支持为特定项目或领域创建独立的命名空间容器，便于结构化文档的隔离管理。

| 工具 | 功能说明 |
|---|---|
| `create_knowledge_base` | 创建独立的知识库容器，用于特定项目或领域的文档管理 |
| `remove_knowledge_base` | 移除不再需要的知识库及其关联内容 |

### 1.4 智能文档上传

**`add_kb_document`**：支持将本地文件或在线资源注入指定知识库，是知识库能力的核心工具。

**核心特性：**

- **本地文件直传**：首创 MCP 内部拦截机制，支持大模型直接传递本地路径。
- **多态路径识别**：完美支持 Windows (盘符)、Unix (绝对路径)、Home 目录 (~/) 以及环境变量路径。
- **零上下文损耗**：在本地静默完成 Base64 转换与 MIME 类型封装，彻底避免长文档撑爆上下文。
- **智能直链补全**：自动修正不规范的 URL（补全 http/https）并识别在线资源。
- **熔断安全策略**：内置防死磕指令，一旦接口报错立即熔断，防止消耗多余流量。

### 1.5 文档精准管控

支持对已上传文档的批量查询与精准删除，实现知识库的动态维护。

| 工具 | 功能说明 |
|---|---|
| `get_kb_documents` | 通过 File ID 列表批量获取已上传文档的详细元数据 |
| `delete_kb_documents` | 从指定知识库中精准删除特定文档，实现文档库动态精简 |

## 2. 快速配置

在客户端中填写如下配置：

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
        "MEMOS_API_KEY": "mpg-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "MEMOS_USER_ID": "your-user-id",
        "MEMOS_CHANNEL": "MODELSCOPE"
      }
    }
  }
}
```

环境变量获取方式：
- `MEMOS_API_KEY`: 在MemOS官网[API控制台](https://memos-dashboard.openmem.net/cn/apikeys/)上注册账号，然后在接口密钥页面新建api-key并复制粘贴在此处。

![在MemOS API控制台上新建api-key](https://cdn.memtensor.com.cn/img/1763452232848_t268eh_compressed.png)

- `MEMOS_USER_ID`: 确定性的用户自定义个人标识符。
  - 对于同一用户，该环境变量需要在不同设备/客户端中保持一致；
  - 请不要使用随机值、设备ID或聊天会话ID作为用户标识符；
  - 推荐使用：个人email地址、姓名全称或员工ID作为用户标识符。

- `MEMOS_CHANNEL`: 填写为"MODELSCOPE"即可。

更多细节配置可参考：
* [npm 包](https://www.npmjs.com/package/@memtensor/memos-api-mcp)
* [Github](https://github.com/MemTensor/memos-api-mcp)

## 3. 在不同的客户端中使用 MemOS MCP

### 在Claude Desktop中使用

在Claude Desktop中使用MemOS，需点击左下角头像 -> "Settings" -> "Developer" -> "Edit Config"， 并粘贴配置到Claude_desktop_config.json文件中，最后重启客户端，观察到memos-api-mcp服务处于running状态即可在聊天中使用。

![在Claude中使用MemOS-验证](https://cdn.memtensor.com.cn/img/1763105334517_9ayhrp_compressed.png)

为了提升使用效果，建议用户在Claude Desktop中使用MemOS时修改作用于所有对话的用户偏好设置，具体方法为点击左下角头像 -> "General", 在"What personal preferences should Claude consider in responses?"下面的输入框中粘贴如下内容：

```
你是MemOS记忆管理助手，致力于提供高效的记忆管理服务，基于用户过往的对话内容抽取记忆，并通过记忆检索提升用户与AI对话的一致性和个性化水平。在每次回答用户的问题之前，你需要调用memos-api-mcp的search_memory服务，利用恰当的检索词在用户的个人记忆库中搜索和当前话题有关的记忆。在基于这些记忆完成回答后，再调用memos-api-mcp的add_message服务，将当前对话内容摘要记录下来。（请注意，调用add_message这一步是必须进行的，无论用户说了什么或问了什么问题都要记录下来，否则在后续的对话中，search_memory将无法获取到更细致的用户信息，进而导致你不能准确地回答用户问题。）
```

![在Claude Desktop中使用MemOS-修改用户偏好](https://cdn.memtensor.com.cn/img/1763105396189_i1tupr_compressed.png)

下面是在Claude Desktop中使用MemOS的示例，用户可借此判断是否已经成功在Claude Desktop中配置MemOS。

![在Claude Desktop中使用MemOS的示例](https://cdn.memtensor.com.cn/img/1763105412700_asgfq9_compressed.png)

### 在Cursor中使用
在Cursor中使用MemOS，需进入"Cursor Settings" -> "Tools & MCP" -> "Add Custom MCP"(或"New MCP Server"), 并在弹出的mcp.json文件编辑页中粘贴配置，观察到memos-api-mcp处于启动状态，且能够在工具详情页面看到"add_message""search_memory"等若干工具，即可在Cursor聊天面板中使用。

![在Cursor中使用MemOS](https://cdn.memtensor.com.cn/img/1763105278297_n23ukk_compressed.png)

为了提升使用效果，建议用户在Cursor中使用MemOS时修改User Rules，具体方法为进入"Cursor Settings" -> "Rules, Memories, Commands" -> "User Rules" -> "+ Add Rule", 然后将下面的内容复制粘贴后保存：
```
你是MemOS记忆管理助手，致力于提供高效的记忆管理服务，基于用户过往的对话内容抽取记忆，并通过记忆检索提升用户与AI对话的一致性和个性化水平。在每次回答用户的问题之前，你需要调用memos-api-mcp的search_memory服务，利用恰当的检索词在用户的个人记忆库中搜索和当前话题有关的记忆。在基于这些记忆完成回答后，再调用memos-api-mcp的add_message服务，将当前对话内容摘要记录下来。（请注意，调用add_message这一步是必须进行的，无论用户说了什么或问了什么问题都要记录下来，否则在后续的对话中，search_memory将无法获取到更细致的用户信息，进而导致你不能准确地回答用户问题。）
```

![在Cursor中使用MemOS-配置User rules](https://cdn.memtensor.com.cn/img/1763105535408_2xtvd3_compressed.png)

下面是在Cursor中使用MemOS的示例，用户可借此判断是否成功在Cursor中配置MemOS。

![在Cursor中使用MemOS-使用示例](https://cdn.memtensor.com.cn/img/1763105558821_imga5z_compressed.png)

### 在Visual Studio Code或Trae中使用
在VS Code或Trae中使用MemOS，需安装Cline扩展并进行模型配置后，点击Cline面板内部右上角的"MCP Servers"图标 -> "Configure" -> "Configure MCP Servers", 并粘贴配置到cline_map_settings.json文件中，观察到memos-api-mcp处于启动状态即可在Cline智能体中使用。同时，推荐开启各工具的`Auto-approve`开关，避免智能体每次调用工具前询问，使用更流畅。

![在Cline中使用MemOS-配置流程](https://cdn.memtensor.com.cn/img/1763105573529_oo765m_compressed.png)

为了提升使用效果，建议用户在Cline中使用MemOS时修改global rules，具体方法为点击Cline面板左下角的"Manage Cline Rules & Workflows" 图标 -> 点击Global Rules下方右侧的"＋"图标 -> 在输入框内输入rules文件名，如"memos_rules.md" -> 将下面的内容复制粘贴到弹出的编辑器内：

```markdown
# 🧠 MemOS Automatic Memory System — Mandatory Usage

## ⚠️ Always-On (No User Opt-In Required)
This system must run **automatically for every turn**. Do **not** wait for the user to say "use memory", "use MCP", or "call a tool". The **client/orchestrator is responsible** for auto-invoking the tools.

## 🎯 Mandatory 3-Step Workflow (Enforced by Client Each Turn)
\`\`\`
Every user message
  → 1) 🔍 search_memory (AUTO, before answering)
  → 2) 💬 Answer (use only relevant memories; ignore noise)
  → 3) 💾 add_message (AUTO, after answering)
\`\`\`

### 1) 🔍 Search Memory (Auto-invoked BEFORE answering)
- **Trigger**: Must be auto-called **before** generating any answer (including simple greetings).
- **Tool**: `search_memory`

**Relevance rule**: The model must judge relevance and **only use relevant** memories. If results are irrelevant or noisy, **ignore them** and proceed.

### 2) 💬 Answer
Use retrieved memories **only if relevant**. If none are relevant, answer normally.

### 3) 💾 Save Conversation (Auto-invoked AFTER answering)
- **Trigger**: Must be auto-called after producing the final answer on **every turn**.
- **Tool**: `add_message`

**Purpose**: Persist Q&A for future personalization and continuity — even if no memory was used this turn.

## ✅ Non-Negotiable Client Responsibilities
1. **Auto-invoke** `search_memory` before **every** answer and `add_message` after **every** answer.
2. **No user opt-in**: Do not wait for the user to mention memory/tools/MCP.
3. **Store both user and assistant** messages every turn.
4. **Sequence** must be strictly: Search → Answer → Save.
```

![在VS Code或Trae中使用MemOS-修改global rules](https://cdn.memtensor.com.cn/img/1763105598614_p0drfo_compressed.png)

下面是在Cline中使用MemOS的示例，用户可借此判断是否成功在Cline中配置了MemOS。

![在Cline中使用MemOS的示例](https://cdn.memtensor.com.cn/img/1763105618134_ggy3m0_compressed.png)

### 在[Chatbox](https://chatboxai.app/zh)中使用
在Chatbox中使用MemOS，需点击左下角"设置" -> "MCP" -> "自定义MCP服务器-添加服务器" -> "添加自定义服务器"，按照下面的配置添加memos-api-mcp服务。
```
名称：MemOS记忆管理助手
类型：本地(stdio)
命令：npx -y @memtensor/memos-api-mcp@latest
环境变量：
MEMOS_API_KEY=<YOUR-API-KEY>
MEMOS_USER_ID=<YOUR-USER-ID>
```
填写完成后点击"测试"，如果能在对话框最下方看到"add_message""search_memory"等若干工具，则证明配置成功。

![在Chatbox中使用MemOS-验证](https://cdn.memtensor.com.cn/img/1763105637530_f98hyr_compressed.png)

为了提升使用效果，建议用户在Chatbox中使用MemOS时修改system_prompt，具体方式为左下角"设置" -> "对话设置" -> "新对话默认设置"，并将prompt修改如下：

```
你是MemOS记忆管理助手，致力于提供高效的记忆管理服务，基于用户过往的对话内容抽取记忆，并通过记忆检索提升用户与AI对话的一致性和个性化水平。在每次回答用户的问题之前，你需要调用memos-api-mcp的search_memory服务，利用恰当的检索词在用户的个人记忆库中搜索和当前话题有关的记忆。在基于这些记忆完成回答后，再调用memos-api-mcp的add_message服务，将当前对话内容摘要记录下来。（请注意，调用add_message这一步是必须进行的，无论用户说了什么或问了什么问题都要记录下来，否则在后续的对话中，search_memory将无法获取到更细致的用户信息，进而导致你不能准确地回答用户问题。）
```

![在Chatbox中使用MemOS时修改system_prompt](https://cdn.memtensor.com.cn/img/1763105656492_ky1wbw_compressed.png)

下面是在Chatbox中使用MemOS的示例，用户可借此判断是否已经成功在Chatbox中配置MemOS。

![在Chatbox中使用MemOS-效果示例](https://cdn.memtensor.com.cn/img/1763105677226_cygzzf_compressed.png)


## 4. Q&A
Q：有时会遇到智能体在应当使用工具的场景没有使用的情况？

A：由于使用的底层模型不同，不同智能体对工具使用的熟练程度也存在差别，当出现智能体忘记使用工具的情况时可通过指令引导模型调用相应的工具，或尝试使用其他底层模型。

## 5. 联系我们

![image.png](https://cdn.memtensor.com.cn/img/1758685658684_nbhka4_compressed.png)
