---
title: 异步模式AsyncMode
desc: 添加消息时使用异步模式，接口请求立即返回，而实际处理在MemOS后台排队完成。
---
::warning
**[本文是对【添加记忆-addMessage接口】里的异步模式做展开介绍，可点此直接查看详细 API 文档](/api_docs/core/add_message)**
::

:::note
`async_mode`参数当前默认为`true`，记忆添加操作默认将异步处理，排队等待后台执行，而不是等待处理完成再返回响应。
:::
## 1. 使用异步模式

### 处理流程

`async_mode`参数设置为`true`时，API 会立即返回响应，并在后台排队处理记忆：

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

在异步模式下，记忆写入将分为“粗加工”和“精加工”两个阶段：系统会先对本轮消息进行毫秒级的粗加工，使其在下一轮对话时即可被快速检索到；
<br>
随后在后台继续进行秒级及以上的精加工以提升记忆质量。处理进度可通过 [get/status](/api_docs/message/get_status) 接口查询：粗加工阶段任务状态为 `running`，精加工完成后状态更新为 `completed`。任务完成后，响应中的 `memory_views` 会汇总本轮任务的新增/更新/删除数量，以及各记忆种类下触达的记忆 ID。

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

### 何时使用异步模式

*   **降低接口响应延迟**：用户无需等待，持续在应用内使用记忆；
    
*   **批量添加记忆**：同时处理大量数据，避免阻塞应用；
    

*   **后台任务处理**：将耗时的记忆处理操作放入后台，提高系统并发能力。
    

:::note
注意<br>
当消息包含多模态内容时，由于文件记忆的加工时间较长，您传入的`async_mode`字段失效，此时默认使用“异步模式”。您可通过`get/status`接口查询文件记忆的处理进度。
:::

## 2. 使用同步模式

### 处理流程

`async_mode`参数设置为`false`时，API 会在记忆处理完成后返回结果：

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

此时检索记忆，能够检索到已经完全处理好的记忆：

```json
"memory_detail_list":[
  {
    "memory_key": "暑假广州旅游计划",
    "memory_value": "用户计划在暑假期间前往广州旅游，并选择了七天连锁酒店作为住宿选项。",
    "conversation_id": "0610",
    "tags": [
      "旅游",
      "广州",
      "住宿",
      "酒店"
    ]
  }
],
"preference_detail_list":[
  {
    "preference_type": "implicit_preference",
    "preference": "用户可能偏好性价比较高的酒店选择。",
    "reasoning": "七天酒店通常以经济实惠著称，而用户选择七天酒店可能表明其在住宿方面倾向于选择性价比较高的选项。虽然用户没有明确提到预算限制或具体酒店偏好，但在提供的选项中选择七天可能反映了对价格和实用性的重视。",
    "conversation_id": "0610"
  }
]
```

### 何时使用同步模式

*   **调试与开发阶段**：直接查看记忆处理后的结果，便于调试记忆检索；
    
*   **即时查询**：需要在API调用返回时确认记忆已被创建或更新，例如性能测试、功能验证等
    
*   **小规模操作**：数据量较小、延迟影响不大时，可使用同步模式。
    

### 重要说明

*   异步处理的默认行为现在为 `async_mode=true`。
    
*   如果你需要同步模式，请在添加消息时设置 `async_mode=false`。
