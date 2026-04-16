---
title: MemOS MCP Usage Guide
---

MemOS Memory Management MCP is a powerful AI memory enhancement plugin that supports three core capabilities: **conversation memory access**, **user profile construction**, and **knowledge base full lifecycle management**. 

By integrating MemOS into mainstream AI clients such as Claude, Cursor, and Cline, users can enable AI to continuously accumulate personal memories, understand user preferences, and efficiently process large-scale professional documents, fundamentally improving the consistency and personalization of AI conversations.

## 1. Capabilities Overview

### 1.1 Conversation Memory Management

Provides writing, retrieving, deleting, and quality feedback functions for conversation content, which is the foundational capability module of the MemOS MCP.

| Tool | Function Description |
|---|---|
| `add_message` | Writes a summary of the current conversation content into the user's memory bank for future retrieval. |
| `search_memory` | Searches for relevant historical memories in the user's personal memory bank based on search terms. |
| `delete_memory` | Deletes specified memory entries from the memory bank. |
| `add_feedback` | Submits quality feedback on memory entries to optimize memory management effects. |

### 1.2 User Profile System

**`get_user_profile`**: Retrieves the user's full-dimensional memory profile with one click.

Unlike single factual memories (Facts), the user profile also integrates explicit/implicit preferences (Preferences) and tool usage experience (Tool Trajectories), allowing AI to answer identity-related questions such as "Who am I?" and "What are my preferences?", achieving true personalized interaction.

### 1.3 Knowledge Base Lifecycle Management

Supports creating independent namespace containers for specific projects or domains, facilitating the isolated management of structured documents.

| Tool | Function Description |
|---|---|
| `create_knowledge_base` | Creates an independent knowledge base container for document management in a specific project or domain. |
| `remove_knowledge_base` | Removes a knowledge base that is no longer needed and its associated content. |

### 1.4 Intelligent Document Upload

**`add_kb_document`**: Supports injecting local files or online resources into a specified knowledge base, which is the core tool of the knowledge base capability.

**Core Features:**

- **Local File Direct Upload**: Pioneered the MCP internal interception mechanism, allowing LLMs to pass local paths directly.
- **Polymorphic Path Recognition**: Perfectly supports Windows (drive letters), Unix (absolute paths), Home directory (~/), and environment variable paths.
- **Zero Context Loss**: Silently completes Base64 conversion and MIME type encapsulation locally, completely avoiding long documents overwhelming the context.
- **Intelligent Direct Link Completion**: Automatically corrects non-standard URLs (adds http/https) and identifies online resources.
- **Circuit Breaker Security Strategy**: Built-in anti-deadlock instruction; once an interface error occurs, it immediately trips the circuit breaker to prevent consuming excess traffic.

### 1.5 Precise Document Control

Supports batch query and precise deletion of uploaded documents, achieving dynamic maintenance of the knowledge base.

| Tool | Function Description |
|---|---|
| `get_kb_documents` | Batch retrieves detailed metadata of uploaded documents via a list of File IDs. |
| `delete_kb_documents` | Precisely deletes specific documents from a designated knowledge base, achieving dynamic streamlining of the document library. |

## 2. Quick Configuration

Fill in the following configuration in the client:

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

How to obtain environment variables:
- `MEMOS_API_KEY`: Register an account on the MemOS official website's [API Console](https://memos-dashboard.openmem.net/cn/apikeys/), then create a new api-key on the API keys page and copy it here.

![Create a new api-key on the MemOS API Console](https://cdn.memtensor.com.cn/img/1763451978063_251scz_compressed.png)

- `MEMOS_USER_ID`: A deterministic user-defined personal identifier.
  - For the same user, this environment variable needs to remain consistent across different devices/clients;
  - Please do not use random values, device IDs, or chat session IDs as user identifiers;
  - Recommended: Use personal email address, full name, or employee ID as the user identifier.

- `MEMOS_CHANNEL`: Fill in "MODELSCOPE" here.

For more detailed configuration, please refer to:
* [npm package](https://www.npmjs.com/package/@memtensor/memos-api-mcp)
* [GitHub](https://github.com/MemTensor/memos-api-mcp)

## 3. Using MemOS MCP in Different Clients

### Using in Claude Desktop

To use MemOS in Claude Desktop, click the avatar in the lower left corner -> "Settings" -> "Developer" -> "Edit Config", paste the configuration into the `Claude_desktop_config.json` file, and finally restart the client. You can use it in the chat when you observe that the memos-api-mcp service is in the running state.

![Verification of using MemOS in Claude](https://cdn.memtensor.com.cn/img/1763105334517_9ayhrp_compressed.png)

To improve the usage effect, it is recommended that users modify the user preference settings that apply to all conversations when using MemOS in Claude Desktop. The specific method is to click the avatar in the lower left corner -> "General", and paste the following content into the input box under "What personal preferences should Claude consider in responses?":

```
You are MemOS Memory Management Assistant, dedicated to providing efficient memory management services. It extracts memories based on users' past conversation content and enhances the consistency and personalization of users' conversations with AI through memory retrieval. Before answering each user's question, you need to call the search_memory service of memos-api-mcp and use appropriate search terms to find memories related to the current topic in the user's personal memory bank. After completing the answer based on these memories, call the add_message service of memos-api-mcp to record a summary of the current conversation content. (Note that calling add_message is mandatory. Regardless of what the user says or asks, it must be recorded; otherwise, in subsequent conversations, search_memory will not be able to obtain more detailed user information, leading to your inability to answer the user's questions accurately.)
```

![Modifying user preferences for using MemOS in Claude Desktop](https://cdn.memtensor.com.cn/img/1763105312212_yqu9m7_compressed.png)

The following is an example of using MemOS in Claude Desktop, by which users can judge whether they have successfully configured MemOS in Claude Desktop.

![Example of using MemOS in Claude Desktop](https://cdn.memtensor.com.cn/img/1763105296073_gtqj1s_compressed.png)

### Using in Cursor

To use MemOS in Cursor, go to "Cursor Settings" -> "Tools & MCP" -> "Add Custom MCP" (or "New MCP Server"), and paste the configuration into the pop-up `mcp.json` file editing page. You can use it in the Cursor chat panel when you observe that memos-api-mcp is in the started state and can see tools such as `add_message` and `search_memory` on the tool details page.

![Using MemOS in Cursor](https://cdn.memtensor.com.cn/img/1763105278297_n23ukk_compressed.png)

To improve the usage effect, it is recommended that users modify User Rules when using MemOS in Cursor. The specific method is to go to "Cursor Settings" -> "Rules, Memories, Commands" -> "User Rules" -> "+ Add Rule", then copy and paste the following content and save it:

```
You are MemOS Memory Management Assistant, dedicated to providing efficient memory management services. It extracts memories based on users' past conversation content and enhances the consistency and personalization of users' conversations with AI through memory retrieval. Before answering each user's question, you need to call the search_memory service of memos-api-mcp and use appropriate search terms to find memories related to the current topic in the user's personal memory bank. After completing the answer based on these memories, call the add_message service of memos-api-mcp to record a summary of the current conversation content. (Note that calling add_message is mandatory. Regardless of what the user says or asks, it must be recorded; otherwise, in subsequent conversations, search_memory will not be able to obtain more detailed user information, leading to your inability to answer the user's questions accurately.)
```

![Configuring User rules for using MemOS in Cursor](https://cdn.memtensor.com.cn/img/1763105260337_yqacto_compressed.png)

The following is an example of using MemOS in Cursor, by which users can judge whether they have successfully configured MemOS in Cursor.

![Usage example of using MemOS in Cursor](https://cdn.memtensor.com.cn/img/1763105238556_p99epu_compressed.png)

### Using in Visual Studio Code or Trae

To use MemOS in VS Code or Trae, install the Cline extension and configure the model, then click the "MCP Servers" icon in the upper right corner inside the Cline panel -> "Configure" -> "Configure MCP Servers", and paste the configuration into the `cline_map_settings.json` file. You can use it in the Cline agent when you observe that memos-api-mcp is in the started state. At the same time, it is recommended to turn on the Auto-approve switch of each tool to avoid the agent asking before each tool call, making the use smoother.

![Configuration process of using MemOS in Cline](https://cdn.memtensor.com.cn/img/1763105211482_g1xclj_compressed.png)

To improve the usage effect, it is recommended that users modify global rules when using MemOS in Cline. The specific method is to click the "Manage Cline Rules & Workflows" icon in the lower left corner of the Cline panel -> click the "+" icon on the right below Global Rules -> enter a rules file name in the input box, such as "memos_rules.md" -> copy and paste the following content into the pop-up editor:

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

![Modifying global rules for using MemOS in VS Code or Trae](https://cdn.memtensor.com.cn/img/1763105181443_v9kg80_compressed.png)

The following is an example of using MemOS in Cline, by which users can judge whether they have successfully configured MemOS in Cline.

![Usage example of using MemOS in Cline](https://cdn.memtensor.com.cn/img/1763105156433_jz4k3t_compressed.png)

### Using in [Chatbox](https://chatboxai.app/en)

To use MemOS in Chatbox, click "Settings" in the lower left corner -> "MCP" -> "Custom MCP Servers - Add Server" -> "Add Custom Server", and add the memos-api-mcp service according to the following configuration.

```
Name: MemOS Memory Management
Type: Local (stdio)
Command: npx -y @memtensor/memos-api-mcp@latest
Environment Variables:
MEMOS_API_KEY={{api_key applied for on the MemOS official website API Console}}
MEMOS_USER_ID={{custom USER_ID}}
```

After filling in, click "Test". If you can see tools such as `add_message` and `search_memory` at the bottom of the dialog box, the configuration is successful.

![Verification of using MemOS in Chatbox](https://cdn.memtensor.com.cn/img/1763105136401_xbvcsh_compressed.png)

To improve the usage effect, it is recommended that users modify the system_prompt when using MemOS in Chatbox. The specific method is to go to "Settings" in the lower left corner -> "Chat Settings" -> "Default Settings for New Conversation", and modify the prompt as follows:

```
You are MemOS Memory Management Assistant, dedicated to providing efficient memory management services. It extracts memories based on users' past conversation content and enhances the consistency and personalization of users' conversations with AI through memory retrieval. Before answering each user's question, you need to call the search_memory service of memos-api-mcp and use appropriate search terms to find memories related to the current topic in the user's personal memory bank. After completing the answer based on these memories, call the add_message service of memos-api-mcp to record a summary of the current conversation content. (Note that calling add_message is mandatory. Regardless of what the user says or asks, it must be recorded; otherwise, in subsequent conversations, search_memory will not be able to obtain more detailed user information, leading to your inability to answer the user's questions accurately.)
```

![Modifying system_prompt when using MemOS in Chatbox](https://cdn.memtensor.com.cn/img/1763105111045_trc5fx_compressed.png)

The following is an example of using MemOS in Chatbox, by which users can judge whether they have successfully configured MemOS in Chatbox.

![Effect example of using MemOS in Chatbox](https://cdn.memtensor.com.cn/img/1763104980563_q3q7v2_compressed.png)

## 4. Q&A

**Q: Why do agents sometimes fail to invoke tools when they should?**

A: Due to the different underlying models used, different agents have different proficiency in using tools. When the agent forgets to use the tool, you can guide the model to call the corresponding tool through instructions, or try to use other underlying models.

## 5. Contact Us

![image.png](https://cdn.memtensor.com.cn/img/1758685658684_nbhka4_compressed.png)
