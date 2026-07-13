---
title: 修改记忆
desc: 手动修改某条记忆。
---

## 1. 功能说明

本接口用于手动修改已有的记忆，支持用户主动修正记忆内容、归档过时记忆等。

## 2. 关键参数

| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `memory_id` | string | 是 | 记忆 ID，来自 `search/memory` 或 `get/memory` 返回结果中的 `id` |
| `content` | string | 否 | 更新后的记忆内容 |
| `title` | string | 否 | 更新后的记忆标题 |
| `status` | string | 否 | 记忆状态 |

## 3. 使用示例

### 3.1 定位要修改的记忆

[检索记忆](/cn/memos_cloud/mem_operations/search_memory)或获取记忆时，每条返回的记忆都有自己的 `id`，修改时使用该 `id` 作为 `memory_id`。

### 3.2 调用修改接口

::code-group

```python [Python (HTTP)]
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "memory_id": "mem_event_001",
    "title": "和陈默去西湖露营看星星",
    "content": "上周六和好友陈默去西湖边露营，天气很好，晚上一起看了星星。"
}

res = requests.post(
    f"{BASE_URL}/update/memory",
    headers={"Authorization": f"Token {API_KEY}"},
    json=data
)

print(res.json())
```

```python [Python (SDK)]
# 请确保已安装 MemOS（pip install MemoryOS -U）
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

res = client.update_memory(
    memory_id="mem_event_001",
    title="和陈默去西湖露营看星星",
    content="上周六和好友陈默去西湖边露营，天气很好，晚上一起看了星星。"
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
    "title": "和陈默去西湖露营看星星",
    "content": "上周六和好友陈默去西湖边露营，天气很好，晚上一起看了星星。"
  }'
```

::

## 4. 响应说明

接口返回 `code: 0` 表示修改成功。修改后可通过 [检索记忆](/cn/memos_cloud/mem_operations/search_memory) 或 `get/memory/{memory_id}` 验证更新结果。

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
如果需要彻底删除记忆，请使用 [删除记忆](/cn/memos_cloud/mem_operations/delete_memory) 接口。
:::

## 5. 常见错误与排查

| 错误码 | 常见原因 | 处理方式 |
| :--- | :--- | :--- |
| `40000` | 请求体结构错误，或字段类型不符 | 确认 `memory_id` 为字符串，`status` 为允许的枚举值 |
| `40002` | 必填字段为空 | 检查是否传入了 `memory_id` |
| `40103` / `40132` | API Key 无效、过期或无权访问当前项目 | 回到 [项目配置](/cn/api_docs/start/configuration) 确认 API Key 与项目匹配 |
| `40307` | `memory_id` 不存在 | 重新通过 `search/memory` 或 `get/memory` 获取最新 `id` |

更多错误码说明，请查看 [错误码](/cn/api_docs/help/error_codes)。
