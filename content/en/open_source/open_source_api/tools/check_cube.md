---
title: Check Cube Existence
desc: "Verify whether a specified MemCube ID has been initialized and is available in the system."
---

**Endpoint**: `POST /product/exist_mem_cube_id`
**Description**: Validates whether a `mem_cube_id` exists in the system. A "gatekeeper" endpoint to ensure data consistency — call it before dynamically creating knowledge bases or assigning user spaces to avoid duplicate initialization or invalid operations.

## 1. Core Mechanism: Cube Index Validation

In MemOS, a MemCube's existence determines the validity of all subsequent memory operations:

* **Logical Validation**: **MemoryHandler** queries the underlying storage index to confirm registration.
* **Cold-start Guarantee**: For on-demand Cube creation scenarios, use this endpoint to decide whether an initial `add` operation is needed to activate the memory space.

## 2. Key Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`mem_cube_id`** | `str` | Yes | The MemCube ID to validate. |

## 3. How It Works (MemoryHandler)

1. **Index Query**: **MemoryHandler** calls the underlying **naive_mem_cube** metadata query interface.
2. **Status Retrieval**: Searches the persistence layer for configuration files or database records matching the ID.
3. **Boolean Response**: Returns only existence status via `code` or `data` — no memory content is included.

## 4. Quick Start

```python
from memos.api.client import MemOSClient

client = MemOSClient(api_key="...", base_url="...")

kb_id = "kb_finance_2026"
res = client.exist_mem_cube_id(mem_cube_id=kb_id)

if res and res.code == 200:
    if res.data.get('exists'):
        print(f"MemCube '{kb_id}' is ready.")
    else:
        print(f"MemCube '{kb_id}' has not been initialized.")
```
