---
title: Chat
desc: "An end-to-end RAG loop integrating retrieval, generation, and storage — supporting personalized responses with MemCube and automatic memory crystallization."
---

:::note
For a complete reference of API fields and formats, see the [Chat API Documentation](/api_docs/chat/chat).
:::

**Endpoints**:
* **Complete Response**: `POST /product/chat/complete`
* **Streaming Response (SSE)**: `POST /product/chat/stream`

**Description**: The core business orchestration entry point of MemOS. It automatically recalls relevant memories from specified `readable_cube_ids`, generates contextual responses, and optionally writes conversation results back to `writable_cube_ids` for continuous AI self-evolution.

## 1. Core Architecture: ChatHandler Orchestration

1. **Memory Retrieval**: Calls **SearchHandler** based on `readable_cube_ids` to extract relevant facts, preferences, and tool context from isolated Cubes.
2. **Context-Augmented Generation**: Injects recalled memory fragments into the prompt, then calls the specified LLM (via `model_name_or_path`) to generate a targeted response.
3. **Automatic Memory Loop**: If `add_message_on_answer=true`, the system calls **AddHandler** to asynchronously store the conversation in the specified Cubes — no manual add call required.

## 2. Key Parameters

### 2.1 Identity & Context
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`query`** | `str` | Yes | The user's current question. |
| **`user_id`** | `str` | Yes | Unique user identifier for auth and data isolation. |
| `history` | `list` | No | Short-term conversation history for maintaining session coherence. |
| `session_id` | `str` | No | Session ID. Acts as a "soft signal" to boost recall weight for in-session memories. |

### 2.2 MemCube Read/Write Control
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **`readable_cube_ids`** | `list` | - | **Read**: Memory Cubes allowed for retrieval (can span personal and shared Cubes). |
| **`writable_cube_ids`** | `list` | - | **Write**: Target Cubes for auto-generated memories after conversation. |
| **`add_message_on_answer`** | `bool` | `true` | Whether to enable auto-writeback. Recommended to keep enabled. |

### 2.3 Algorithm & Model Configuration
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `mode` | `str` | `fast` | Retrieval mode: `fast`, `fine`, `mixture`. |
| `model_name_or_path` | `str` | - | LLM model name or path. |
| `system_prompt` | `str` | - | Override the default system prompt. |
| `temperature` | `float` | - | Sampling temperature for controlling creativity. |
| `threshold` | `float` | `0.5` | Relevance threshold — memories below this score are filtered out. |

## 3. Response Modes

### 3.1 Complete Response (`/complete`)
* Returns the full JSON response after the model finishes generation.
* Best for non-interactive tasks, background processing, or simple applications.

### 3.2 Streaming Response (`/stream`)
* Uses **Server-Sent Events (SSE)** to push tokens in real time.
* Best for chatbots and assistants requiring typewriter-style UI feedback.

## 4. Quick Start

```python
from memos.api.client import MemOSClient

client = MemOSClient(api_key="...", base_url="...")

res = client.chat(
    user_id="dev_user_01",
    query="Based on my preferences, suggest an R data cleaning workflow",
    readable_cube_ids=["private_cube_01", "public_kb_r_lang"],
    writable_cube_ids=["private_cube_01"],
    add_message_on_answer=True,
    mode="fine"
)

if res:
    print(f"AI response: {res.data}")
```

:::note
**Developer Tip**: For debugging in a Playground environment, use the dedicated stream endpoint `/product/chat/stream/playground`.
:::
