---
title: 删除记忆
desc: 删除指定用户或 Agent 的记忆，支持精确删除记忆条目、或直接删除某个用户或 Agent 的全部记忆。
---

## 1. 选择删除方式

当前支持 3 种以下三种不同的删除方式，请按照你的使用场景选择其中一种传入。

| 删除方式 | 传入字段 | 适用场景 |
| :--- | :--- | :--- |
| 精确删除 | `memory_ids[]` | 删除至少一条记忆，memory_id 是 search 或 get/memory 返回结果中的 id |
| 删除用户记忆 | `user_id` | 清除当前项目下，某用户的全部记忆 |
| 删除 Agent 记忆 | `agent_id` | 清除当前项目下，某 Agent 的全部记忆 |

::warning

注意

- 三个参数互斥，不可同时传入，每次调用只能选择其中一种删除方式。

- 删除只会作用在当前 API Key 所属的项目，请先确认 API Key、项目和待删除记忆属于同一个项目。

- 请勿传入 `conversation_id`、`knowledgebase_id` 等参数，当前不支持按照这些维度删除记忆。

::

## 2. 精确删除记忆

精确删除适合处理误写入、过期、错误归因或用户主动要求删除的单条记忆。

### 2.1 定位要删除的记忆

[检索记忆](/cn/memos_cloud/mem_operations/search_memory) 或获取记忆时，如果你发现了需要删除的记忆，每条返回的记忆都有自己的 `memory_id`，删除时复制这条记忆对应的 `id` 即可。

```json
{
  "memory_detail_list": [
    {
      "id": "e2a7c194-7062-4fa5-a6c0-bbe554d05d60", # 要删除的 memory_id
      "memory_key": "用户对冰淇淋的喜好",
      "memory_value": "[user观点]用户喜欢吃冰淇淋。",
      "memory_type": "WorkingMemory",
      "memory_time": null,
      "conversation_id": "0610",
      "status": "activated",
      "confidence": 0,
      "tags": [
        "饮食",
        "喜好",
        "冰淇淋"
      ],
      "update_time": 1761315278665,
      "relativity": 0.7524414
    }
  ]
}
```

### 2.2 调用删除接口

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

### 2.3 验证删除结果

接口返回 `data.success: true` 表示删除请求成功，删除后可通过再次 [检索记忆](/cn/memos_cloud/mem_operations/search_memory) 验证该条记忆已被删除。

```json
{
  "code": 0,
  "data": {
    "success": true
  },
  "message": "ok"
}
```

## 3. 删除用户全部记忆

当需要清空某个用户在当前项目下的全部记忆时，传入 `user_id`。

::warning
执行前请确认：

- `user_id` 是你要清除记忆的用户 ID。
- API Key 属于该用户所在的项目。
- 不再需要该用户在当前项目下的事实、偏好、属性、事件、技能、工具记忆。
::

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

全量删除后，使用同一个 `user_id` 再次搜索该用户的历史偏好或事实，确认不再返回旧记忆。

## 4. 删除 Agent 全部记忆

当需要清空某个 Agent 在当前项目下的全部记忆时，传入 `agent_id`。

::warning
执行前请确认：

- 该 Agent 已开启[独立记忆功能](/cn/memos_cloud/introduction/isolation_filters#为-agent-创建独立记忆-new)。
- `agent_id` 是你要清除记忆的 Agent ID。
- API Key 属于该 Agent 所在的项目。
- 不再需要该 Agent 在当前项目下的事实、偏好、属性、事件、技能、工具记忆。
::

::code-group

```python [Python (HTTP)]
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "agent_id": "memos_agent"
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

res = client.delete_memory(agent_id="memos_agent")

print(res)
```

```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/delete/memory \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "agent_id": "memos_agent"
  }'
```

::

全量删除后，使用同一个 `agent_id` 再次搜索该 Agent 的记忆，确认不再返回旧记忆。

## 5. 在控制台删除记忆

如果只是临时删除一条或少量记忆，可以直接在控制台操作：

1. 登录 [MemOS 控制台](https://memos-dashboard.openmem.net/cn/memoryList)，确认当前项目是要操作的项目。
2. 进入「记忆列表」，通过搜索框、主体 ID、主体类型或时间范围找到目标记忆。
3. 点击「查看详情」，核对 记忆 ID 和 记忆内容，确认不是同一用户下的相似记忆。
4. 点击「删除」并二次确认；如果要删除多条记忆，可先勾选多条记录，再点击「批量删除」。
5. 删除后刷新列表，或用相同条件重新搜索，确认该记忆不再出现。

:::note

如果需要在业务系统中自动删除，或需要从日志、检索结果中复制 `memory_id` 后批量处理，请调用 delete/memory 接口实现。

:::

![控制台删除记忆](https://cdn.memtensor.com.cn/img/1781505876499_qclb2m_compressed.png)

## 6. 常见错误与排查

| 错误码 | 常见原因 | 处理方式 |
| :--- | :--- | :--- |
| `40000` | 请求体结构错误，或传入了不支持的字段组合 | 确认只传 `memory_ids`、`user_id`、`agent_id` 其中一种（三者互斥）；`memory_ids` 必须是非空字符串数组 |
| `40002` | 必填字段为空 | 检查是否漏传 `memory_ids` / `user_id` / `agent_id`，或传了空字符串、空数组 |
| `40103` / `40132` | API Key 无效、过期或无权访问当前项目 | 回到 [项目配置](/cn/api_docs/start/configuration) 确认当前项目和 API Key 是否匹配 |
| `40306` | 删除记忆鉴权失败 | 确认该记忆属于当前 API Key 所属项目，且你有权限删除 |
| `40307` | `memory_id` 不存在 | 重新通过 `search/memory` 或 `get/memory` 获取最新 `id`，不要使用 `conversation_id`、`user_id` 或知识库 ID |
| `40308` | `user_id` 或 `agent_id` 不存在 | 确认该用户/Agent 是否在当前项目下写入过记忆；若传 `agent_id`，确认该 Agent 已开启独立记忆并写入过记忆 |

更多错误码说明，请查看 [错误码](/cn/api_docs/help/error_codes)。

需要查看完整字段、请求格式和响应格式？详见 [Delete Memory 接口文档](/cn/api_docs/core/delete_memory)。
