---
title: 自定义标签Tags
desc: 添加消息时按照你的业务需求使用标签。
---
::warning 
注意
<br>
<br>

**[需要先在addMessage的时候传入tag list（点此查看详细 API 文档）](/api_docs/core/add_message)**
<br>

**[才能在searchMemory的时候使用标签进行过滤（点此查看详细 API 文档）](/api_docs/core/search_memory)**
<br>
<br>

**本文聚焦于功能说明，详细接口字段及限制请点击上方文字链接查看**

::

MemOS 会为每条记忆自动生成标签，但这些标签可能与您业务中所使用的标签不完全一致。您可以在添加消息时传入自定义标签列表，MemOS 将基于您提供的标签含义，对记忆内容自动应用相关标签。

:::note
何时使用自定义标签？<br>

您希望 MemOS 能使用产品团队现有的标签体系来标注记忆内容。

您需要应用这些标签，生成结构化内容。
:::

## 1. 标签运行机制

*   **自动生成标签**：MemOS 在处理记忆时会分析语义，自动生成相关标签，用于后续检索、过滤使用。
    
*   **自定义标签**：在添加消息时，您可以通过`tags`字段传入一组自定义的标签，作为候选标签集合。
    
*   **基于语义的匹配**：MemOS 会根据记忆内容与开发者提供的标签列表进行语义相似度判断，从中选择匹配的标签，与系统自动生成的标签一同写入记忆的`tags`字段。
    

## 2. 使用示例

:::note 
提示<br>
*  标签内容应保持简洁，同时能够清楚区分不同类别的含义，便于识别和匹配。

*  在同一项目维度下使用统一的列表，不轻易替换，以确保检索和过滤的一致性。
:::

## 3. 添加消息

```python
import os
import json
import requests

# 替换成你的 MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "user_id": "memos_user_123",
    "conversation_id": "1210",
    "messages": [
        {"role": "user","content": "今天天气如何？"},
        {"role": "assistant","content": "上海，12月10日，阴天，气温为8-12度。"}
    ],
    "tags":["天气","阴天"],
    "async_mode":False
}

headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/message"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```

### 检索记忆

```python
import os
import json
import requests

# 替换成你的 MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "user_id": "memos_user_123",
    "query": "上海 天气"
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/search/memory"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```

### 输出结果

```json
"memory_detail_list": [
  {
    "id": "9bc102cb-76d8-4a59-86d7-8fd1c4542407",
    "memory_key": "天气情况",
    "memory_value": "2025年12月10日，上海的天气为阴天，气温在8到12度之间。",
    "memory_type": "WorkingMemory",
    "create_time": 1765376340736,
    "conversation_id": "1210",
    "status": "activated",
    "confidence": 0.99,
    "tags": [
      "天气",
      "阴天",
      "气温"
    ],
    "update_time": 1765376340737,
    "relativity": 0.82587826
  }
]
```
