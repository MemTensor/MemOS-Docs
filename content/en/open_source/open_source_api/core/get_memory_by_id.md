---
title: Get Memory Detail
desc: "Retrieve full metadata for a single memory via its unique ID, including confidence score, background context, and usage history."
---

**Endpoint**: `GET /product/get_memory/{memory_id}`
**Description**: Retrieve all underlying details for a single memory entry. Unlike search endpoints that return summary information, this endpoint exposes lifecycle data (vector sync status, AI extraction context) — essential for system management and troubleshooting.

## 1. Why Get Memory Detail?

* **Metadata Inspection**: View the AI's `confidence` score and `background` reasoning when it extracted this memory.
* **Lifecycle Verification**: Confirm whether `vector_sync` succeeded and check `updated_at` timestamps.
* **Usage Tracking**: Review `usage` records showing which sessions recalled this memory for generation.

## 2. Key Parameters

This endpoint uses standard RESTful path parameters:

| Parameter | Location | Type | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`memory_id`** | Path | `str` | Yes | Memory UUID. Obtain from [**Get Memories**](./get_memory.md) or [**Search**](./search_memory.md) results. |

## 3. How It Works (MemoryHandler)

1. **Direct Query**: **MemoryHandler** bypasses business orchestration, interacting directly with the underlying **naive_mem_cube** component.
2. **Data Completion**: Pulls the complete `metadata` dictionary from the persistent store — no semantic truncation is applied.

## 4. Response Data

The response `data` object contains these core fields:

| Field | Description |
| :--- | :--- |
| **`id`** | Unique memory identifier. |
| **`memory`** | Memory text content, typically with annotations (e.g., `[user opinion]`). |
| **`metadata.confidence`** | AI extraction confidence score (0.0–1.0). |
| **`metadata.type`** | Memory classification: `fact`, `preference`, etc. |
| **`metadata.background`** | Detailed AI explanation of why this memory was extracted and its context. |
| **`metadata.usage`** | List of historical timestamps and contexts where this memory was used by the model. |
| **`metadata.vector_sync`** | Vector database sync status, typically `success`. |

## 5. Quick Start

```python
mem_id = "2f40be8f-736c-4a5f-aada-9489037769e0"

res = client.get_memory_by_id(memory_id=mem_id)

if res and res.code == 200:
    metadata = res.data.get('metadata', {})
    print(f"Background: {metadata.get('background')}")
    print(f"Sync status: {metadata.get('vector_sync')}")
```
