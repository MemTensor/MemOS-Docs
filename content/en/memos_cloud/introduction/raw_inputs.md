---
title: Raw Input Content
desc: MemOS can generate memories from different kinds of raw input content.
---

Raw input content is the starting point of memory production. You can provide chat text, images, business documents, tool call records, and other raw content directly. MemOS extracts information with long-term value and turns it into retrievable memories.

## 1. Text

Raw text, chats, event information, or any string content.

```json
{
  "user_id": "memos_user_123",
  "conversation_id": "0910",
  "messages": [
    {
      "role": "user",
      "content": "I am Wang, and I like spicy food."
    }
  ]
}
```

**Best for**: chat messages, user preferences, behavior events, and structured data.

---

## 2. Images

MemOS can extract visual information from images and combine it with the text context sent alongside the image.

```json
{
  "role": "user",
  "content": [
    { "type": "text", "text": "This is the MemOS image I am studying." },
    { "type": "image_url", "image_url": { "url": "https://cdn.memtensor.com.cn/img/1758706201390_iluj1c_compressed.png" } }
  ]
}
```

For local images, replace `url` with a Base64 data URL:

```json
{
  "type": "image_url",
  "image_url": {
    "url": "data:image/jpeg;base64,{base64_image}"
  }
}
```

**Best for**: capturing operation states from screenshots, key information from receipts, design details from mockups, or conclusions from charts.

---

## 3. Documents

MemOS can read PDF, Word, Markdown, JSON, XML, TXT, and other file formats, and combine document content with the text context sent alongside the file.

```json
{
  "role": "user",
  "content": [
    { "type": "file", "file": { "file_data": "https://cdn.memtensor.com.cn/file/MemOS 2.pdf" } }
  ]
}
```

For local documents, set `file_data` to a Base64 string.

**Best for**: extracting conclusions from reports, constraints from requirement documents, rules from policy materials, or key settings from configuration files.

---

## 4. Tool Calls

Agent tool decisions and tool results. MemOS generates tool memories so the Agent can call tools more reliably later.

```json
{
  "messages": [
    {
      "role": "assistant",
      "tool_calls": [{ "id": "call_123", "type": "function", "function": { "name": "get_weather", "arguments": "{\"location\":\"Beijing\"}" } }]
    },
    {
      "role": "tool",
      "tool_call_id": "call_123",
      "content": [{ "type": "text", "text": "{\"temperature\":\"7°C\"}" }]
    }
  ]
}
```

**Best for**: recording tool selection, parameters, and returned results to improve future tool call success. See [Tool Memory](/memos_cloud/features/tool_calling).

---

## 5. Natural Language Feedback

Corrections and supplements from users about answers, memories, or knowledge. You can pass the feedback text directly without locating a specific memory.

```json
{
  "user_id": "memos_user_123",
  "feedback_content": "The purchase limit for office software is 600 yuan, not 800 yuan.",
  "allow_knowledgebase_ids": ["kb_xxx"]
}
```

**Best for**: correcting wrong memories, updating outdated information, and filling missing details. See [Add Feedback](/memos_cloud/mem_operations/add_feedback).

---

## 6. Knowledge Bases and Skills

Project-level knowledge documents or Agent skill packages. These are managed separately from user memories.

```json
{
  "knowledgebase_id": "kb_xxx",
  "file": [
    { "type": "document", "content": "https://cdn.memtensor.com.cn/file/MemOS 2.pdf" },
    { "type": "skill", "name": "return_process.md", "content": "data:text/markdown;base64,{base64_skill}" }
  ]
}
```

**Best for**: importing product documentation, policies, SOPs, FAQs, or Agent skill packages. See [Knowledge Base](/memos_cloud/features/knowledge_base) and [Skill](/memos_cloud/features/skill).

---

## 7. Content Limits

| Type | Limit |
| --- | --- |
| Text messages | 40,000 tokens per request |
| Files | URL and Base64 supported, ≤ 20 files per request, each file ≤ 100 MB / 500 pages |
| Images | URL and Base64 data URL supported |
| Knowledge Base documents | URL and Base64 supported, ≤ 20 files per request, each file ≤ 100 MB / 500 pages |
| Single Skill file | URL and Base64 supported, ≤ 100 KB, must include `name` and `description` |
| Skill ZIP package | URL and Base64 supported, ≤ 20 MB, ≤ 200 files after extraction, must include `SKILL.md` |

---

## 8. API Overview

| Entry | Accepted content | Typical use |
| --- | --- | --- |
| `add/message` | Text, images, documents, Tool Calls | Write user memories such as facts, preferences, and tool experience |
| `chat` | Current user query | Recall memories + generate an answer + write the new conversation |
| `extract/memory` | Plain text messages | Extract facts/preferences only, without writing to the long-term memory store |
| `add/feedback` | Natural language feedback | Correct or supplement existing memories |
| `add/knowledgebase-file` | Knowledge documents, Skill files | Build project knowledge bases and Agent skill libraries |

---

## 9. Explore Different APIs

::card-group
  :::card
  ---
  icon: ri:message-3-line
  title: Add Message
  to: /memos_cloud/mem_operations/add_message
  ---
  Write text, images, documents, and Tool Calls
  :::

  :::card
  ---
  icon: ri:chat-history-line
  title: Chat
  to: /memos_cloud/mem_operations/chat
  ---
  Use the conversation API with memory recall
  :::

  :::card
  ---
  icon: ri:book-read-line
  title: Knowledge Base
  to: /memos_cloud/features/knowledge_base
  ---
  Manage project documents, policies, and SOPs
  :::

  :::card
  ---
  icon: ri:feedback-line
  title: Add Feedback
  to: /memos_cloud/mem_operations/add_feedback
  ---
  Correct wrong memories or fill missing information
  :::
::
