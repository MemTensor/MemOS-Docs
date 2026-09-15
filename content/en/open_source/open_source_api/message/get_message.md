---
title: Get Message
desc: "Retrieve raw user-assistant conversation history from a specified session for building chat UIs or extracting original context."
---

::warning
**[Jump to the full API reference here](/api_docs/message/get_message)**
<br>
<br>

**This page focuses on the open-source feature overview. For detailed API fields and limits, click the link above.**
::

**Endpoint**: `POST /product/get/message`
**Description**: Retrieves the raw conversation records between user and assistant in a specified session. Unlike memory endpoints that return processed summaries, this endpoint returns unprocessed original text — the core endpoint for building chat history features.

## 1. Memory vs. Message

Distinguish between these two data types during development:
* **Get Memory (`/get_memory`)**: Returns AI-processed **fact and preference summaries** (e.g., "User prefers R for visualization").
* **Get Message (`/get_message`)**: Returns **raw conversation text** (e.g., "I've been learning R recently, recommend a visualization package").

## 2. Key Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `user_id` | `str` | Yes | - | User identifier associated with the messages. |
| `conversation_id` | `str` | No | `None` | Unique session identifier. |
| `message_limit_number` | `int` | No | `6` | Maximum messages to return (recommended max: 50). |
| `conversation_limit_number` | `int` | No | `6` | Maximum conversation histories to return. |
| `source` | `str` | No | `None` | Message source channel identifier. |

## 3. How It Works

1. **Locate Session**: Searches the underlying store for messages matching the `conversation_id` and user.
2. **Slice Processing**: Truncates from the latest messages backwards based on `message_limit_number`.
3. **Security Isolation**: All requests pass through `RequestContextMiddleware` for strict `user_id` ownership validation.

## 4. Quick Start

```python
from memos.api.client import MemOSClient

client = MemOSClient(
    api_key="YOUR_LOCAL_API_KEY",
    base_url="http://localhost:8000/product"
)

res = client.get_message(
    user_id="memos_user_123",
    conversation_id="conv_r_study_001",
    message_limit_number=10
)

if res and res.code == 200:
    for msg in res.data:
        print(f"[{msg['role']}]: {msg['content']}")
```

## 5. Use Cases

### 5.1 Chat UI History Loading
When a user enters a historical session, call this endpoint to restore the conversation. Combine with `message_limit_number` for paginated loading.

### 5.2 External Model Context Injection
If using a custom LLM pipeline (not the built-in chat endpoint), use this endpoint to fetch raw history and manually prepend it to the model's messages array.

### 5.3 Message Retrospective Analysis
Periodically export raw conversation records for evaluating AI response quality or analyzing user intent patterns.
