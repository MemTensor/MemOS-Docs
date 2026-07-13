---
title: Async Mode
desc: Use async mode when adding messages; the interface returns immediately while actual processing is queued in the background by MemOS.
---
::warning
**[This article expands on the async mode in the [Add Memory - addMessage API], click here to view the detailed API documentation directly](/api_docs/core/add_message)**
::

:::note
The `async_mode` parameter currently defaults to `true`. Memory addition operations are processed asynchronously by default, queued for background execution instead of waiting for processing to complete before returning a response.
:::
## 1. Using Async Mode

### Processing Flow

When the `async_mode` parameter is set to `true`, the API returns a response immediately and queues the memory for processing in the background:

```json
{
  "code": 0,
  "data": {
    "success": true,
    "task_id": "c464e17e-f2ff-4e9a-a2c2-41cc55ab43b9",
    "status": "running"
  },
  "message": "ok"
}
```

In async mode, memory writing is split into two stages: "rough processing" and "refined processing". The system first performs millisecond-level rough processing on the current turn of messages, so they can already be retrieved in the next turn of conversation;
<br>
Refined processing (seconds or longer) then continues in the background to improve memory quality. You can check progress via the [get/status](/api_docs/message/get_status) interface: the task status is `running` during rough processing and updates to `completed` once refined processing finishes. Once the task completes, `memory_views` in the response summarizes how many memories were added/updated/deleted in this turn, along with the memory IDs touched under each memory category.

```python
import os
import requests
import json

os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "task_id": "c464e17e-f2ff-4e9a-a2c2-41cc55ab43b9"
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/get/status"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "task_id": "c464e17e-f2ff-4e9a-a2c2-41cc55ab43b9",
    "status": "completed",
    "memory_views": {
      "added": 1,
      "updated": 1,
      "deleted": 0,
      "detail_factual": {
        "memory_ids": ["memos_mem_001"]
      },
      "preference": {
        "memory_ids": ["memos_mem_002"]
      }
    }
  }
}
```

### When to Use Async Mode

*   **Reduce Interface Response Latency**: Users do not need to wait and can continuously use memory within the application;
    
*   **Batch Add Memories**: Process large amounts of data simultaneously to avoid blocking the application;
    

*   **Background Task Processing**: Offload time-consuming memory processing operations to the background to improve system concurrency capabilities.
    

:::note
Note<br>
When a message contains multimodal content, since file memory processing takes a long time, the `async_mode` field you pass becomes invalid, and "Async Mode" is used by default. You can query the processing progress of file memory via the `get/status` interface.
:::

## 2. Using Sync Mode

### Processing Flow

When the `async_mode` parameter is set to `false`, the API returns the result after memory processing is completed:

```json
{
  "code": 0,
  "data": {
    "success": true,
    "task_id": "c464e17e-f2ff-4e9a-a2c2-41cc55ab43b9",
    "status": "completed"
  },
  "message": "ok"
}
```

At this point, retrieving memory will return memories that have been fully processed:

```json
"memory_detail_list":[
  {
    "memory_key": "Summer Vacation Guangzhou Travel Plan",
    "memory_value": "The user plans to travel to Guangzhou during the summer vacation and has chosen 7 Days Inn as the accommodation option.",
    "conversation_id": "0610",
    "tags": [
      "Travel",
      "Guangzhou",
      "Accommodation",
      "Hotel"
    ]
  }
],
"preference_detail_list":[
  {
    "preference_type": "implicit_preference",
    "preference": "The user may prefer high cost-performance hotel choices.",
    "reasoning": "7 Days Inn is usually known for being economical. The user's choice of 7 Days Inn may indicate a preference for high cost-performance options in accommodation. Although the user did not explicitly mention budget constraints or specific hotel preferences, choosing 7 Days Inn among the provided options may reflect an emphasis on price and practicality.",
    "conversation_id": "0610"
  }
]
```

### When to Use Sync Mode

*   **Debugging and Development Phase**: View the results after memory processing directly, facilitating memory retrieval debugging;
    
*   **Instant Query**: Need to confirm that memory has been created or updated when the API call returns, such as in performance testing, functional verification, etc.
    
*   **Small-scale Operations**: Sync mode can be used when the data volume is small and latency impact is minimal.
    

### Important Notes

*   The default behavior for async processing is now `async_mode=true`.
    
*   If you need sync mode, please set `async_mode=false` when adding messages.
