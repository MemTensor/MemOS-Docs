---
title: Get User Names
desc: "Reverse-lookup the user names associated with specific memory IDs."
---

**Endpoint**: `POST /product/get_user_names_by_memory_ids`
**Description**: Provides reverse-tracing capability. When you encounter specific `memory_id` values in system logs or shared storage but cannot identify the originator, use this endpoint to batch-retrieve the associated user names.

## 1. Core Mechanism: Metadata Provenance

In MemOS, every generated memory entry is bound to the original user's metadata. This endpoint traces ownership:

* **Many-to-one Mapping**: Accepts multiple `memory_id` values in a single request and returns the corresponding user list.
* **Administrative Transparency**: Typically used in admin panels to identify contributors of entries in shared Cubes.

## 2. Key Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`memory_ids`** | `list[str]` | Yes | List of memory UUIDs to look up. |

## 3. How It Works (MemoryHandler)

1. **ID Parsing**: **MemoryHandler** receives the ID list and queries the global index.
2. **Relationship Retrieval**: Extracts associated `user_id` or `user_name` attributes from the persistence layer or graph nodes.
3. **Data Sanitization**: Returns display names or identifiers based on system configuration.

## 4. Quick Start

```python
from memos.api.client import MemOSClient

client = MemOSClient(api_key="...", base_url="...")

target_ids = [
    "2f40be8f-736c-4a5f-aada-9489037769e0",
    "5e92be1a-826d-4f6e-97ce-98b699eebb98"
]

res = client.get_user_names_by_memory_ids(memory_ids=target_ids)

if res and res.code == 200:
    print(f"Memories belong to user(s): {res.data}")
```
