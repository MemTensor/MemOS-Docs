---
title: 删除记忆
desc: 从 MemOS 删除记忆，支持按用户或按记忆 ID 删除。
---

## 1. 关键参数

::tip
删除用户记忆、精确删除记忆 IDs 是两种不同的删除方式，请按场景二选一传入。
::

* **用户 ID（user_id）**：用于删除某个用户的所有记忆。传入该字段时，将删除与该用户关联的事实、偏好、技能、工具记忆等内容。
* **记忆 ID 列表（memory_ids）**：用于精确删除一条或多条指定记忆。每条记忆的 ID 来自 search/memory 或 get/memory 接口返回的 `id` 字段。





## 2. 快速上手

### 删除用户记忆

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

### 精确删除记忆 IDs

每条记忆的 ID 来自 search/memory 或 get/memory 接口返回的 `id` 字段。

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
返回 `"data.success": "true"` 表示删除成功。你也可以再次 [Search Memory](/memos_cloud/mem_operations/search_memory) 检查该记忆是否仍会被召回。
::

需要查看完整字段、请求格式和响应格式？详见 [Delete Memory 接口文档](/api_docs/core/delete_memory)。
