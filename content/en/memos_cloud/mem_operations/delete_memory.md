---
title: Delete Memory
desc: Delete memories from MemOS by user or by memory ID.
---

## 1. Key Parameters

::tip
Deleting all memories for a user and deleting specific memory IDs are two different deletion methods. Choose one based on your scenario.
::

- **User ID (`user_id`)**: deletes all memories associated with a user, including facts, preferences, skills, tool memories, and other memory content.
- **Memory ID list (`memory_ids`)**: deletes one or more specified memories. Each memory ID comes from the `id` field returned by `search/memory` or `get/memory`.

## 2. Quick Start

### Delete User Memories

::code-group

```python [Python (HTTP)]
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "user_id": "memos_user_123"
}

res = requests.post(
  f"{BASE_URL}/delete/memory",
  headers={"Authorization": f"Token {API_KEY}"},
  json=data
)

print(res.json())
```

```python [Python (SDK)]
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

res = client.delete_memory(user_id="memos_user_123")

print(res)
```

```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/delete/memory \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "user_id": "memos_user_123"
  }'
```

::

### Delete Specific Memory IDs

Each memory ID comes from the `id` field returned by `search/memory` or `get/memory`.

::code-group

```python [Python (HTTP)]
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "memory_ids": ["6b23b583-f4c4-4a8f-b345-58d0c48fea04"]
}

res = requests.post(
  f"{BASE_URL}/delete/memory",
  headers={"Authorization": f"Token {API_KEY}"},
  json=data
)

print(res.json())
```

```python [Python (SDK)]
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

res = client.delete_memory(
  memory_ids=["6b23b583-f4c4-4a8f-b345-58d0c48fea04"]
)

print(res)
```

```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/delete/memory \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "memory_ids": ["6b23b583-f4c4-4a8f-b345-58d0c48fea04"]
  }'
```

::

::note
`"data.success": "true"` means deletion succeeded. You can also call [Search Memory](/memos_cloud/mem_operations/search_memory) again to check whether the memory is still recalled.
::

Need the complete field list, request format, and response format? See the [Delete Memory API documentation](/api_docs/core/delete_memory).
