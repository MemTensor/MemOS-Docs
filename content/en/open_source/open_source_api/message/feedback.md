---
title: Add Feedback
desc: "Submit user feedback on AI responses to help MemOS correct, optimize, or remove inaccurate memories in real time."
---

**Endpoint**: `POST /product/feedback`
**Description**: Processes user feedback on AI responses or stored memories. By analyzing `feedback_content`, the system can automatically locate and modify incorrect facts in a **MemCube**, or adjust memory weights based on positive/negative feedback.

## 1. Core Mechanism: Memory Correction Loop

**FeedbackHandler** provides finer control than the standard add endpoint:

* **Precise Correction**: By providing `retrieved_memory_ids`, the system can directly target specific recalled memories for correction without affecting others.
* **Contextual Analysis**: Combines `history` (conversation history) to understand the true intent behind feedback (e.g., "You got it wrong — my current company is A, not B").
* **Corrected Response**: If `corrected_answer=true`, the endpoint returns a new response generated from the corrected facts.

## 2. Key Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`user_id`** | `str` | Yes | - | Unique user identifier. |
| **`history`** | `list` | Yes | - | Recent conversation history providing feedback context. |
| **`feedback_content`** | `str` | Yes | - | **Core**: The user's feedback text. |
| **`writable_cube_ids`** | `list` | No | - | Target Cubes for memory correction. |
| `retrieved_memory_ids` | `list` | No | - | Optional: Specific memory IDs from the last retrieval that need correction. |
| `async_mode` | `str` | No | `async` | Processing mode: `async` (background) or `sync` (real-time). |
| `corrected_answer` | `bool` | No | `false` | Whether to return a corrected response after memory update. |
| `info` | `dict` | No | - | Additional metadata. |

## 3. How It Works

1. **Conflict Detection**: `FeedbackHandler` compares the `history` with existing memory facts in `writable_cube_ids`.
2. **Locate & Update**:
    * If `retrieved_memory_ids` is provided, directly updates the corresponding nodes.
    * If not provided, uses semantic matching to find the most relevant outdated memories for overwrite or invalidation.
3. **Weight Adjustment**: For ambiguous feedback, adjusts `confidence` or credibility levels of specific memory entries.
4. **Async Processing**: In `async` mode, correction logic is executed by `MemScheduler` asynchronously; the API returns a `task_id` immediately.

## 4. Quick Start

```python
from memos.api.client import MemOSClient

client = MemOSClient(api_key="...", base_url="...")

res = client.add_feedback(
    user_id="dev_user_01",
    feedback_content="I'm no longer on a diet. I don't need to control my food intake.",
    history=[
        {"role": "assistant", "content": "You're currently dieting. Have you been controlling your calorie intake?"},
        {"role": "user", "content": "I'm no longer on a diet..."}
    ],
    writable_cube_ids=["private_cube_01"],
    retrieved_memory_ids=["mem_id_old_job_123"],
    corrected_answer=True
)

if res and res.code == 200:
    print(f"Correction progress: {res.message}")
    if res.data:
        print(f"Corrected response: {res.data}")
```

## 5. Use Cases

### 5.1 Correcting AI Inferences
Provide a "correction" button in the admin panel. When an administrator discovers an incorrect memory entry, call this endpoint for manual correction.

### 5.2 Updating Outdated Preferences
In a chat UI, when users say things like "that's wrong" or "not like that", automatically trigger this endpoint with `is_feedback=True` for real-time memory purification.

:::note
If feedback involves a shared knowledge base, ensure the current user has write access to that Cube.
:::
