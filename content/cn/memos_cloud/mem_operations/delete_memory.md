---
title: 删除记忆
desc: 从 MemOS 删除记忆,支持批量删除。
---

::warning
**[直接看 API文档 点这里哦](/api_docs/core/delete_memory)**
<br>
<br>

**本文聚焦于功能说明，详细接口字段及限制请点击上方文字链接查看**
::

## 1. 关键参数

*   **记忆 ID 列表（memory\_ids[]）**：每条存储在 MemOS 中的记忆都对应一个唯一标识符，支持以列表形式传入，用于精确删除一条或多条指定记忆。

*   **用户 ID（user_id）**：用于删除某个用户的所有记忆。传入该字段时，将删除与该用户关联的所有记忆（包含：事实、偏好、技能、工具记忆）。

:::note
**如何获取待删除记忆的记忆ID**
<br>
<br>
在检索记忆（`search/memory`）和获取记忆（`get/memory`）时，返回结果中的每条记忆都包含唯一的 `id` 字段，作为该记忆的唯一标识符。  <br>
当发现某条记忆已过期或不符合预期时，可直接取 `id`，并作为 `memory_ids[]` 参数传入 `delete/memory` 接口，即可删除对应的记忆条目。
:::


## 2. 快速上手

```python
import os
import requests
import json

# 替换成你的 MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "memory_ids":["4a50618f-797d-4c3b-b914-94d7d1246c8d"],  # 替换为真实的记忆 ID
    # "user_id": "12345" 如果需要删除某用户的所有记忆，替换为真实的用户 ID
    ## 注意，user_id 和 memory_ids[] 为两个不同的筛选条件，同时使用时报错。
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
&nbsp;想知道是否删除成功？
一键复制上述代码并运行，再次[检索记忆](/memos_cloud/mem_operations/search_memory)，看看记忆是否删除成功？
::
