---
title: Search Memory
desc: "Leverages MemCube isolation and semantic retrieval with logical filtering to recall the most relevant context from the memory store."
---

**Endpoint**: `POST /product/search`
**Description**: The core endpoint for Retrieval-Augmented Generation (RAG) in MemOS. It performs semantic matching across multiple isolated **MemCubes**, automatically recalling relevant facts, user preferences, and tool invocation records.

## 1. Core Mechanism: Readable Cubes

The open-source API uses **`readable_cube_ids`** for flexible retrieval scope control:

* **Cross-Cube Retrieval**: Specify multiple Cube IDs (e.g., `[personal_cube, enterprise_kb_cube]`) — the algorithm recalls the most relevant content from all specified Cubes in parallel.
* **Soft Signal Weighting**: Passing a `session_id` gives a relevance boost to content within that session. This is a "weight", not a hard filter.
* **Absolute Isolation**: Cubes not included in `readable_cube_ids` are completely invisible at the algorithm level, ensuring data security in multi-tenant environments.

## 2. Key Parameters

### Retrieval Basics
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`query`** | `str` | Yes | The search query for semantic matching. |
| **`user_id`** | `str` | Yes | Unique identifier of the requesting user. |
| **`readable_cube_ids`** | `list[str]` | Yes | **Core**: Cube IDs accessible for this search. |
| **`mode`** | `str` | No | Search strategy: `fast`, `fine`, or `mixture`. |

### Recall Control
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **`top_k`** | `int` | `10` | Maximum number of text memories to recall. |
| **`include_preference`** | `bool` | `true` | Whether to recall user preference memories (explicit/implicit). |
| **`search_tool_memory`** | `bool` | `true` | Whether to recall tool invocation records. |
| **`filter`** | `dict` | - | Logical filter supporting tag-based and metadata-based precise filtering. |
| **`dedup`** | `str` | - | Deduplication strategy: `no`, `sim` (semantic), or `None` (exact text dedup). |

## 3. How It Works (SearchHandler Strategies)

When a request arrives, the **SearchHandler** invokes different components based on the specified `mode`:

1. **Query Rewriting**: Uses an LLM to semantically enhance the `query` for improved matching precision.
2. **Multi-mode Matching**:
    * **Fast**: Vector-index rapid recall — ideal for latency-sensitive scenarios.
    * **Fine**: Adds a reranking step for improved relevance.
    * **Mixture**: Combines semantic search with graph search for deeper relational recall.
3. **Multi-dimensional Aggregation**: Facts, preferences (`pref_top_k`), and tool memories (`tool_mem_top_k`) are retrieved in parallel and aggregated.
4. **Post-processing Dedup**: Highly similar memory entries are compressed based on the `dedup` configuration.

## 4. Quick Start

Multi-Cube joint retrieval via SDK:

```python
from memos.api.client import MemOSClient

client = MemOSClient(api_key="...", base_url="...")

# Retrieve from personal memories and two knowledge bases simultaneously
res = client.search_memory(
    user_id="sde_dev_01",
    query="Based on my previous preferences, suggest R visualization approaches",
    readable_cube_ids=["user_01_private", "kb_r_lang", "kb_data_viz"],
    mode="fine",
    include_preference=True,
    top_k=5
)

if res:
    print(f"Results: {res.data}")
```

## 5. Advanced: Using Filters

SearchHandler supports complex filters for fine-grained business requirements:

```python
# Only search memories tagged "Programming" and created after 2026
search_filter = {
    "and": [
        {"tags": {"contains": "Programming"}},
        {"created_at": {"gt": "2026-01-01"}}
    ]
}

res = client.search_memory(
    query="data cleaning logic",
    user_id="sde_dev_01",
    readable_cube_ids=["user_01_private"],
    filter=search_filter
)
```
