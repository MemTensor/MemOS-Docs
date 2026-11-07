---
title: Delete Memory
desc: "Permanently remove memory entries, associated files, or memory sets matching specific filter conditions from a designated MemCube."
---

**Endpoint**: `POST /product/delete_memory`
**Description**: Maintains memory store accuracy and compliance. When a user requests information erasure, data becomes stale, or uploaded files need cleanup, this endpoint performs synchronized physical deletion across both vector databases and graph databases.

## 1. Core Mechanism: Cube-level Physical Cleanup

In the open-source edition, deletion follows strict **MemCube** isolation:

* **Scope Restriction**: Deletion is locked to the Cubes specified via `writable_cube_ids` — content in other Cubes is never affected.
* **Multi-dimensional Deletion**: Supports concurrent cleanup by **memory ID** (precise), **file ID** (cascading), and **filter** (conditional logic).
* **Atomic Synchronization**: Triggered by **MemoryHandler**, ensuring both vector index entries and graph database entity nodes are removed simultaneously, preventing recall of "phantom" memories.

## 2. Key Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`writable_cube_ids`** | `list[str]` | Yes | Target Cube IDs for the deletion operation. |
| **`memory_ids`** | `list[str]` | No | List of memory UUIDs to delete. |
| **`file_ids`** | `list[str]` | No | List of original file IDs — all memories derived from these files will also be removed. |
| **`filter`** | `object` | No | Logical filter. Supports batch deletion by tags, metadata, or timestamps. |

## 3. How It Works (MemoryHandler)

1. **Permission & Routing**: Validates permissions via `user_id` and routes to **MemoryHandler**.
2. **Locate Storage**: Identifies the underlying **naive_mem_cube** components from `writable_cube_ids`.
3. **Dispatch Cleanup**:
    * **By ID**: Directly erases records from the primary database and vector store.
    * **By Filter**: First retrieves matching memory IDs, then performs bulk physical removal.
4. **Status Feedback**: Returns success status — affected content immediately disappears from [**Search**](./search_memory.md) results.

## 4. Quick Start

```python
client = MemOSClient(api_key="...", base_url="...")

# Scenario 1: Delete a single known incorrect memory
client.delete_memory(
    writable_cube_ids=["user_01_private"],
    memory_ids=["2f40be8f-736c-4a5f-aada-9489037769e0"]
)

# Scenario 2: Batch cleanup all memories with a specific tag
client.delete_memory(
    writable_cube_ids=["kb_finance_2026"],
    filter={"tags": {"contains": "deprecated_policy"}}
)
```

## 5. Important Notes

**Irreversibility**: Deletion is physical. Once successful, the memory cannot be recalled via the search API.

**File Cascading**: When deleting by `file_ids`, the system automatically traces and removes all fact memories and summaries derived from those files.
