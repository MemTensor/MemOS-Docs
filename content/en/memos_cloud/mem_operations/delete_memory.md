---
title: Delete Memory
desc: Delete memories from MemOS, supporting batch deletion of memories for multiple users.

---

::warning
**[Go directly to API Docs](/api_docs/core/delete_memory)**
<br>
<br>

**This article focuses on functional explanation. For detailed interface fields and limits, please click the link above.**
::

## 1. Key Parameters

* **Memory ID List (memory\_ids[])**: This parameter accepts a list of memory IDs and is used to delete one or more specific memories.

* **User ID (user_id)**: Used to delete all memories of a specific user. When this field is passed, all memories associated with that user (including facts, preferences, skills, and tool memories) will be deleted.

:::note
**How to obtain memory IDs for deletion**
<br>
<br>
When retrieving memories via `search/memory` or `get/memory`, each memory item in the returned result contains a unique `id` field, which serves as the unique identifier for that memory.  <br>
If a memory is found to be expired or does not meet expectations, you can directly take this `id` and pass it as the `memory_ids[]` parameter when calling the `delete/memory` API to delete the corresponding memory entry.
:::

## 2. Quick Start

```python
import os
import requests
import json

# Replace with your MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "memory_ids":["4a50618f-797d-4c3b-b914-94d7d1246c8d"],  # Replace with real memory IDs
    # "user_id": "12345" If you need to delete all memories of a user, replace with the real user ID
    ## Note, user_id and memory_ids[] are two different filtering conditions, using both simultaneously will result in an error.
  }
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/delete/memory"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```

::note
&nbsp;Want to know if the deletion was successful?
Copy the above code and run it, then [Search Memory](/memos_cloud/mem_operations/search_memory) again to see if the memory has been successfully deleted.
::
