---
title: 修改记忆
desc: MemOS 会根据您输入的反馈文本对记忆库中的内容做出新增或更新的操作。
---

::warning
**[直接查看 API 文档请点击这里](/api_docs/core/modify_memory)**  
<br>
<br>

**本文聚焦于功能说明，详细接口字段及限制请点击上方文字链接查看**
::

## 1. 如何修改记忆？

用户只需在会话中以自然语言描述修改记忆的要求，MemOS 即可自动处理。


## 2. 关键参数

*   **用户标识（user\_id）**：用于标识消息所属的唯一用户，当前所有添加的对话信息均需关联到具体且唯一的用户标识符。
    
*   **会话标识（conversation\_id）**：用于标识消息所属的唯一会话，当前所有添加的对话信息均需关联到具体且唯一的会话标识符。

*   **特定知识库ids（allow_knowledgebase\_ids）**：控制当前用户对话消息生成的记忆是否写入指定的项目关联的知识库中，供所有可访问该知识库的用户共享。默认为空，使用时您可以将需要写入的知识库列表传入。详见[知识库](/memos_cloud/features/advanced/knowledge_base)

*   **反馈内容（feedback\_content）**：用于理解用户对记忆修改的要求。
    

## 3. 工作原理

*   **用户反馈分析**：系统解析用户反馈，判断是否为有效信息、是否与上文对话相关，并分类为关键词替换或语义修改请求。
    
*   **新记忆构建**：基于用户反馈，结合记忆库已有内容，进行相应文本修改并构建新记忆。
    
*   **修改操作**：将新记忆写入数据库，或对内容相悖的已有记忆进行更新。
    

以上所有流程，仅需调用`add/feedback`接口即可触发，无需您对用户的记忆手动操作。


## 4. 快速上手

```python
import os
import requests
import json

# 替换成你的 MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "user_id": "memos_user_123",
    "conversation_id": "0610",
    "feedback_content": "实际上我不喜欢游泳",
    "allow_knowledgebase_ids": ["123", "456"]
  }
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/feedback"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```

## 5. 使用场景

### 5.1 更改关键字

通过描述替换动作对特定词汇进行替换修改，此场景下无需输入会话标识（conversation_id）

```python
data = {
    "user_id": "memos_user_123",
    "feedback_content": "将‘扬州炒饭’统一替换为‘南京烤鸭’",
    "allow_knowledgebase_ids": ["123", "456"]
  }

```

### 5.2 通过语义修改记忆

您可以以反馈的方式提出记忆修改，该场景下需要输入会话标识（conversation_id）。

例如，假设 `conversation_id` == `0610` 的历史对话上下文为：
  - user: 我下周要去海边，帮我规划行程吧。
  - assistant：好的，推荐参加一些水上项目，也可以浮潜、游泳和看鲸鱼。

此时可发送以下反馈：

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0610",
    "feedback_content": "实际上我不喜欢游泳",
    "allow_knowledgebase_ids": ["123", "456"]
  }
```

MemOS 将在记忆系统中查找“用户喜欢游泳”的相关错误记忆并进行修改；若无相关记忆，则会新增“用户不喜欢游泳”的新记忆。

## 6. 更多功能

:::note
有关 API 字段、格式等信息的完整列表，详见[Add Feedback接口文档](/api_docs/core/modify_memory)。
:::

| **功能** | **字段** | **说明** |
| --- | --- | --- |
| 关联更多实体 | `agent_id` `app_id` | 当前用户的对话消息关联 Agent、应用等实体的唯一标识符，便于后续按实体维度检索记忆。 |
| 是否修改公共记忆 | `allow_public` | 控制当前用户对话消息生成的记忆是否要写入项目级公共记忆，供项目下所有用户共享，默认关闭。 |


