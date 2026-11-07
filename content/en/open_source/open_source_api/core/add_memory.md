---
title: Add Memory
desc: "The core production endpoint of MemOS. Leverages MemCube isolation to support personal memory, knowledge bases, and multi-tenant async memory production."
---

**Endpoint**: `POST /product/add`
**Description**: The primary entry point for storing unstructured data. It accepts conversation lists, plain text, or metadata and transforms raw data into structured memory fragments. The open-source edition uses **MemCube** for physical memory isolation and dynamic organization.

## 1. Core Mechanism: MemCube Isolation

Understanding MemCube is essential for effective API usage:

* **Isolation Unit**: A MemCube is the atomic unit of memory production. Cubes are fully independent — deduplication and conflict resolution happen only within a single Cube.
* **Flexible Mapping**:
    * **Personal Mode**: Pass `user_id` as `writable_cube_ids` to create a private memory space.
    * **Knowledge Base Mode**: Pass a knowledge base identifier (QID) as `writable_cube_ids` to store content into that knowledge base.
* **Multi-target Writes**: The API supports writing to multiple Cubes simultaneously for cross-domain synchronization.

## 2. Key Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`user_id`** | `str` | Yes | - | Unique user identifier for permission validation. |
| **`messages`** | `list/str` | Yes | - | Message list or plain text content to store. |
| **`writable_cube_ids`** | `list[str]` | Yes | - | **Core**: Target Cube IDs for writing. |
| **`async_mode`** | `str` | No | `async` | Processing mode: `async` (background queue) or `sync` (blocking). |
| **`is_feedback`** | `bool` | No | `false` | If `true`, routes to the feedback handler for memory correction. |
| `session_id` | `str` | No | `default` | Session identifier for conversation context tracking. |
| `custom_tags` | `list[str]` | No | - | Custom tags for subsequent search filtering. |
| `info` | `dict` | No | - | Extended metadata. All key-value pairs support filter-based retrieval. |
| `mode` | `str` | No | - | Effective only when `async_mode='sync'`: `fast` or `fine`. |

## 3. How It Works (Component & Handler)

When a request arrives, the **AddHandler** orchestrates core components:

1. **Multimodal Parsing**: `MemReader` converts `messages` into internal memory objects.
2. **Feedback Routing**: If `is_feedback=True`, the handler extracts the tail of the conversation as feedback and corrects existing memories instead of generating new facts.
3. **Async Dispatch**: In `async` mode, `MemScheduler` pushes the task into a queue and the API returns a `task_id` immediately.
4. **Internal Organization**: The algorithm performs deduplication and fusion within the target Cube to optimize memory quality.

## 4. Quick Start

Use the `MemOSClient` SDK for standardized calls:

```python
from memos.api.client import MemOSClient

client = MemOSClient(api_key="...", base_url="...")

# Scenario 1: Add memory for a personal user
client.add_message(
    user_id="sde_dev_01",
    writable_cube_ids=["user_01_private"],
    messages=[{"role": "user", "content": "I'm learning ggplot2 in R."}],
    async_mode="async",
    custom_tags=["Programming", "R"]
)

# Scenario 2: Import content into a knowledge base with feedback
client.add_message(
    user_id="admin_01",
    writable_cube_ids=["kb_finance_2026"],
    messages="The 2026 financial audit process has been updated. Please see attachment.",
    is_feedback=True,
    info={"source": "Internal_Portal"}
)
```
