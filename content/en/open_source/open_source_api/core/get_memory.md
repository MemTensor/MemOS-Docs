---
title: Get Memories
desc: "Paginated query or full export of memory collections from a specified Cube, with support for type filtering and subgraph extraction."
---

**Endpoints**:
* **Paginated Query**: `POST /product/get_memory`
* **Full Export**: `POST /product/get_all`

**Description**: List or export memory assets from a specified **MemCube**. These endpoints provide access to raw memory fragments, user preferences, and tool usage records, supporting paginated display and structured exports.

## 1. Core Mechanism: Paginated vs. Full Export

The system provides two access modes via **MemoryHandler**:

* **Business Pagination (`/get_memory`)**:
    * Designed for frontend UI lists. Supports `page` and `page_size` parameters.
    * Includes preference memories by default (`include_preference`), enabling lightweight data loading.
* **Full Export (`/get_all`)**:
    * Designed for data migration or complex relationship analysis.
    * Supports `search_query` for extracting related **subgraphs**, or full export by `memory_type` (text/action/parameter).

## 2. Key Parameters

### 2.1 Paginated Query (`/get_memory`)

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`mem_cube_id`** | `str` | Yes | Target MemCube ID. |
| **`user_id`** | `str` | No | Unique user identifier. |
| **`page`** | `int` | No | Page number (starting from 1). Set to `None` for full export. |
| **`page_size`** | `int` | No | Items per page. |
| `include_preference` | `bool` | No | Whether to include preference memories. |

### 2.2 Full / Subgraph Export (`/get_all`)

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`user_id`** | `str` | Yes | User ID. |
| **`memory_type`** | `str` | Yes | Memory type: `text_mem`, `act_mem`, `para_mem`. |
| `mem_cube_ids` | `list` | No | Cube IDs to export. |
| `search_query` | `str` | No | If provided, recalls and returns a related memory subgraph. |

## 3. Quick Start

### 3.1 Frontend Paginated Display

```python
res = client.get_memory(
    user_id="sde_dev_01",
    mem_cube_id="cube_research_01",
    page=1,
    page_size=10
)

for mem in res.data:
    print(f"[{mem['type']}] {mem['memory_value']}")
```

### 3.2 Export a Fact Memory Subgraph

```python
res = client.get_all(
    user_id="sde_dev_01",
    memory_type="text_mem",
    search_query="R language visualization"
)
```

## 4. Response Structure

The response `data` contains an array of memory objects. Each memory typically includes:

* `id`: Unique memory identifier — use with [**Get Detail**](./get_memory_by_id.md) or [**Delete**](./delete_memory.md).
* `memory_value`: Algorithmically processed memory text.
* `tags`: Associated custom tags.

:::note
**Developer Tip**: If you already know a memory ID and want to see its full metadata (confidence, usage records, etc.), use the [**Get Memory Detail**](./get_memory_by_id.md) endpoint.
:::
