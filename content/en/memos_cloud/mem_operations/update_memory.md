---
title: Update Memory
desc: Manually update memory.
---

## 1. Overview

This API manually updates an existing memory. Typical use cases include correcting memory content and archiving outdated memories.

## 2. Key Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `memory_id` | string | Yes | The memory ID, from the `id` field returned by `search/memory` or `get/memory` |
| `content` | string | No | The updated memory content |
| `title` | string | No | The updated memory title |
| `status` | string | No | Memory status |

## 3. Usage Example

### 3.1 Find the Memory to Update

When you call [Search Memory](/memos_cloud/mem_operations/search_memory) or get memories, each returned memory has its own `id`. Use that `id` as `memory_id` when updating.

### 3.2 Call the Update API

::code-group

```python [Python (HTTP)]
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "memory_id": "mem_event_001",
    "title": "Camping at West Lake with Chen Mo",
    "content": "Last Saturday I went camping by West Lake with my friend Chen Mo. The weather was great and we watched the stars together at night."
}

res = requests.post(
    f"{BASE_URL}/update/memory",
    headers={"Authorization": f"Token {API_KEY}"},
    json=data
)

print(res.json())
```

```python [Python (SDK)]
# Make sure MemOS is installed (pip install MemoryOS -U)
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

res = client.update_memory(
    memory_id="mem_event_001",
    title="Camping at West Lake with Chen Mo",
    content="Last Saturday I went camping by West Lake with my friend Chen Mo. The weather was great and we watched the stars together at night."
)
print(res)
```

```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/update/memory \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "memory_id": "mem_event_001",
    "title": "Camping at West Lake with Chen Mo",
    "content": "Last Saturday I went camping by West Lake with my friend Chen Mo. The weather was great and we watched the stars together at night."
  }'
```

::

## 4. Response

The API returns `code: 0` when the update succeeds. After updating, you can verify the result with [Search Memory](/memos_cloud/mem_operations/search_memory) or `get/memory/{memory_id}`.

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "success": true
  }
}
```

:::note
To permanently delete a memory, use the [Delete Memory](/memos_cloud/mem_operations/delete_memory) API.
:::

## 5. Common Errors and Troubleshooting

| Error Code | Common Cause | How to Fix |
| :--- | :--- | :--- |
| `40000` | The request body is invalid, or a field type is incorrect | Confirm `memory_id` is a string and `status` is one of the allowed values |
| `40002` | A required field is empty | Check whether `memory_id` was passed |
| `40103` / `40132` | The API Key is invalid, expired, or cannot access the current project | Go back to [Project Configuration](/api_docs/start/configuration) and check whether the API Key matches the project |
| `40307` | The `memory_id` does not exist | Get the latest `id` from `search/memory` or `get/memory` |

For more error code details, see [Error Codes](/api_docs/help/error_codes).
