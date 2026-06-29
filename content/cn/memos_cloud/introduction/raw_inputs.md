---
title: 原始输入内容
desc: MemOS 支持基于不同种类的原始内容，生成记忆。
---

原始输入内容是记忆生产的起点。你只需要直接提供聊天文本、图片、业务文档、工具调用信息等原始内容，MemOS 会自动从中提取有长期价值的信息，加工成可检索记忆。

## 1. 文本内容

原始文本、聊天、事件信息或任何字符串内容。

```json
{
  "user_id": "memos_user_123",
  "conversation_id": "0910",
  "messages": [
    {
      "role": "user",
      "content": "我是小王，喜欢吃辣。"
    }
  ]
}
```

**最适合用于**：传入聊天信息、用户偏好设置、行为事件、结构化数据。

---

## 2. 图片

MemOS 可以从图片中提取视觉信息，并结合随图片一起传入的文本上下文生成记忆。

```json
{
  "role": "user",
  "content": [
    { "type": "text", "text": "这是我正在研究的 MemOS 图片。" },
    { "type": "image_url", "image_url": { "url": "https://cdn.memtensor.com.cn/img/1758706201390_iluj1c_compressed.png" } }
  ]
}
```

如果上传本地图片，也可以把 `url` 换成 Base64 data URL：

```json
{
  "type": "image_url",
  "image_url": {
    "url": "data:image/jpeg;base64,{base64_image}"
  }
}
```

**最适合用于**：记录截图中的操作状态、票据中的关键信息、设计稿里的方案细节，或图表中的结论。

---

## 3. 文档

MemOS 可以读取 PDF、Word、Markdown、JSON、XML、TXT 等文件内容，并结合随文档一起传入的文本上下文生成记忆。

```json
{
  "role": "user",
  "content": [
    { "type": "file", "file": { "file_data": "https://cdn.memtensor.com.cn/file/MemOS 2.pdf" } }
  ]
}
```

如果上传本地文档，也可以将 `file_data` 设置为 Base64 字符串。

**最适合用于**：从报告中提取结论、从需求文档中沉淀约束、从政策资料中记录规则，或从配置文件中保留关键设定。

---

## 4. 工具调用（Tool Call）

Agent 的工具调用决策和返回结果。MemOS 会生成工具记忆，帮助 Agent 更稳定地调用工具。

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

**最适合用于**：记录工具选择、参数和返回结果，提升后续调用成功率。详见 [工具记忆](/cn/memos_cloud/features/tool_calling)。

---

## 5. 自然语言反馈

用户对回答、记忆或知识的纠错与补充。直接传入反馈文本即可，无需定位具体记忆。

```json
{
  "user_id": "memos_user_123",
  "feedback_content": "办公类软件的采购上限是600元，而不是800元。",
  "allow_knowledgebase_ids": ["kb_xxx"]
}
```

**最适合用于**：修正错误记忆、更新过期信息、补充遗漏内容。详见 [Add Feedback](/cn/memos_cloud/mem_operations/add_feedback)。

---

## 6. 知识库与 Skill

项目级知识文档或 Agent 技能包。与用户记忆分开管理。

```json
{
  "knowledgebase_id": "kb_xxx",
  "file": [
    { "type": "document", "content": "https://cdn.memtensor.com.cn/file/MemOS 2.pdf" },
    { "type": "skill", "name": "退货流程.md", "content": "data:text/markdown;base64,{base64_skill}" }
  ]
}
```

**最适合用于**：导入产品文档、政策制度、SOP、FAQ，或上传 Agent 技能包。详见 [知识库](/cn/memos_cloud/features/knowledge_base) 和 [记忆自进化](/cn/memos_cloud/features/self-evolving)。

---

## 7. 内容限制

| 类型 | 限制 |
| --- | --- |
| 文本消息 | 单次 40,000 tokens |
| 文件 | 支持 URL 和 Base64，单次 ≤ 20 个，单文件 ≤ 100 MB / 500 页 |
| 图片 | 支持 URL 和 Base64 data URL |
| 知识库文档 | 支持 URL 和 Base64，单次 ≤ 20 个，单文件 ≤ 100 MB / 500 页 |
| Skill 单文件 | 支持 URL 和 Base64，≤ 100 KB，需包含 name 和 description |
| Skill ZIP 包 | 支持 URL 和 Base64，≤ 20 MB，解压后 ≤ 200 文件，需含 SKILL.md |

---

## 8. 接口总览

| 入口 | 可传入的内容 | 典型用途 |
| --- | --- | --- |
| `add/message` | 文本、图片、文档、Tool Call | 写入用户记忆（事实、偏好、工具经验等） |
| `chat` | 用户本轮问题 | 自动召回记忆 + 生成回答 + 写入新对话 |
| `extract/memory` | 纯文本消息 | 只抽取事实/偏好，不写入长期记忆库 |
| `add/feedback` | 自然语言反馈 | 修正或补充已有记忆 |
| `add/knowledgebase-file` | 知识文档、Skill 文件 | 建立项目知识库和 Agent 技能库 |

---

## 9. 探索不同接口

::card-group
  :::card
  ---
  icon: i-ri-message-3-line
  title: Add Message
  to: /cn/memos_cloud/mem_operations/add_message
  ---
  写入文本、图片、文档和 Tool Call
  :::

  :::card
  ---
  icon: i-ri-chat-history-line
  title: Chat
  to: /cn/memos_cloud/mem_operations/chat
  ---
  使用带记忆召回的对话接口
  :::

  :::card
  ---
  icon: i-ri-book-read-line
  title: 知识库
  to: /cn/memos_cloud/features/knowledge_base
  ---
  管理项目文档、政策资料和 SOP
  :::

  :::card
  ---
  icon: i-ri-feedback-line
  title: Add Feedback
  to: /cn/memos_cloud/mem_operations/add_feedback
  ---
  修正错误记忆或补充遗漏信息
  :::
::
