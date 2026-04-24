---
title: Add Message
desc: MemOS 会将您添加的多模态内容如文本、文件、图片等，自动处理为可检索的个人记忆。
---

::warning
**[直接看 API文档 点这里哦](/api_docs/core/add_message)**
<br>
<br>

**本文聚焦于功能说明，详细接口字段及限制请点击上方文字链接查看**
::

## 1. 如何添加消息？

记忆的基础来源于原始消息内容。MemOS 会将您添加的消息统一加工为记忆，用于后续的检索与使用。在搭建 AI 应用时，无论您是否已开始使用 MemOS 进行用户记忆管理，都可以根据实际场景选择合适的添加时机，包括：

*   **一次性导入**：将已有的用户历史对话一键导入 MemOS，快速建立初始记忆；
    
*   **实时添加**：在用户每次发送消息时，实时将消息添加至 MemOS；
    
*   **按轮次添加**：根据业务需要，设置每隔若干轮对话再将用户消息添加至 MemOS。
    
::note
**&nbsp;为什么记忆很重要？**
<div style="padding-left: 2em;">

* 能够实现跨会话的长期记忆，避免对话结束后信息丢失；

* 随着交互不断积累，让 AI 越来越“**懂用户**”；

* 在会话过程中持续写入新信息，动态更新用户记忆；

* 在您的多个应用或产品之间，共享同一用户的记忆，实现一致的用户体验。
</div>
::


## 2. 关键参数

*   **用户标识（user\_id）**：用于标识消息所属的唯一用户，当前所有添加的对话信息均需关联到具体且唯一的用户标识符。
    
*   **会话标识（conversation\_id）**：用于标识消息所属的唯一会话，当前所有添加的对话信息均需关联到具体且唯一的会话标识符。
    
*   **消息（messages）**：用于添加到 MemOS 的用户与 AI 对话内容的有序消息列表。
    

## 3. 工作原理

*   **信息提取**：MemOS 在系统内部使用 LLM 提取消息中的事实、偏好等，并处理为记忆，包括：事实记忆、偏好记忆、工具记忆等。
    
*   **冲突解决**：现有记忆会被检查是否有重复或矛盾，完成更新。
    
*   **记忆储存**：最终产生的记忆会使用向量数据库与图数据库储存，便于在后续检索时快速召回。
    

以上所有流程，仅需调用`add/message`接口即可触发，无需您对用户的记忆手动操作。


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
    "messages": [
      {"role": "user", "content": "我暑假定好去广州旅游，住宿的话有哪些连锁酒店可选？"},
      {"role": "assistant", "content": "您可以考虑【七天、全季、希尔顿】等等"},
      {"role": "user", "content": "我选七天"},
      {"role": "assistant", "content": "好的，有其他问题再问我。"}
    ]
  }
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/message"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
:::note
想知道生成了哪些记忆？一键复制上述代码并运行，前往[**检索记忆**](/memos_cloud/mem_operations/search_memory)。
:::

## 5. 更多使用方法

### 实时导入对话

你可以在用户每次收到模型回复时，实时调用接口添加消息，随时与 MemOS 同步用户与助手的对话。MemOS将在后端不断根据新的对话，更新用户记忆。

```python
import os
import json
import requests


os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

# headers 和 base URL
headers = {
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}",
  "Content-Type": "application/json"
}
BASE_URL = os.environ['MEMOS_BASE_URL']

def add_message(user_id, conversation_id, messages):
    data = {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "messages": messages
    }
    
    res = requests.post(f"{BASE_URL}/add/message", headers=headers, data=json.dumps(data))
    result = res.json()
  
    if result.get('code') == 0: 
      print(f"✅ 添加成功")
    else:
      print(f"❌ 添加失败, {result.get('message')}")

# 添加用户与助手的对话消息
add_message("memos_user_123", "memos_conversation_123",
            [{"role": "user", "content": "我今天早上跑了5公里，膝盖有点酸"}, 
             {"role": "assistant", "content": "你今天跑了5公里，膝盖有点酸，说明关节和肌肉还在适应强度。明天建议把距离控制在3公里左右，重点放在充分热身和放松。这样既能维持训练节奏，又能给膝盖恢复的时间。"}])

```

<br>

### 导入历史对话

如果你已经构建了 AI 对话应用，MemOS 也支持批量导入已有聊天记录，帮助对话助手记住用户，更个性化地回复。

```python
# 示例历史对话数据
"messages": [
  # 用户第一天和AI的对话
    {"role": "user", "content": "我喜欢吃辣的食物", "chat_time": "2025-09-12 08:00:00"},
    {"role": "assistant", "content": "明白啦，我记住了，你喜欢辣味的食物。", "chat_time": "2025-09-12 08:01:00"},
  # 用户几天后和AI的对话
    {"role": "user", "content": "但我又不太喜欢重油的，比如麻辣火锅、毛血旺之类的", "chat_time": "2025-09-25 12:00:00"},
    {"role": "assistant", "content": "你更偏好清爽又带辣味的菜。我可以帮你推荐一些适合你的辣味美食哦~", "chat_time": "2025-09-25 12:01:00"}
]
```

<br>

### 记录用户偏好或行为

除了导入对话内容，用户的个人偏好、行为等数据，例如首次启动应用时填写的兴趣问卷信息，同样可以导入 MemOS，作为记忆的一部分。

```python
# 示例用户兴趣信息
"messages": [
    {
      "role": "user",
      "content": """
喜欢的电影类型: 科幻, 动作, 喜剧
喜欢的电视剧类型: 悬疑, 历史剧
喜欢的书籍类型: 科普, 技术, 自我成长
喜欢的学习方式: 文章, 视频, Podcast
运动习惯: 跑步, 健身
饮食偏好: 偏爱辣, 健康饮食
旅游偏好: 自然景观, 城市文化, 冒险
喜欢的聊天风格: 幽默, 温暖, 轻松闲聊
想让AI提供的帮助类型: 建议, 信息查询, 灵感
我最感兴趣的话题: 人工智能, 未来科技, 电影评论
我希望AI帮助的事情: 规划日常学习计划, 推荐电影和书籍, 提供心情陪伴
      """
    }
]
```

<br>

### 配合记忆过滤器添加消息
MemOS 支持开发者针对自己的需求从选定的记忆范围中召回记忆。在添加消息时，使用以下字段对生成的记忆进行标记，就能在检索记忆时使用[记忆过滤器（filter）](/memos_cloud/features/basic/filters)完成精确过滤。


1. **同一个用户与多 Agent （在多个应用内）聊天**

添加消息时带上 `agent_id` `app_id` 等信息，标识当前与用户对话所关联的 Agent、应用，用来区分“同一用户在不同 Agent / App 下的记忆”。

```python
data = {
  "user_id": "memos_user_123",
  "agent_id":"health_assistant", #开发者传入的当前对话的 agent。
  "conversation_id": 0610,
  "messages":[
    {"role": "user", "content": "我今天早上跑了5公里，膝盖有点酸"}, 
    {"role": "assistant", "content": "你今天跑了5公里，膝盖有点酸，说明关节和肌肉还在适应强度。明天建议把距离控制在3公里左右，重点放在充分热身和放松。"
    }
  ]
}

# 在后续检索中，您可以传入"agent_id":"health_assistant"来检索用户与该助手聊天的记忆。
```

<br>

2. **用已有的标签体系，对记忆进行语义分类**

MemOS 会为每条记忆自动生成标签，但这些标签可能与您业务中所使用的标签不完全一致。您可以在添加消息时带上自定义的`tags`，MemOS 将基于您提供的标签含义，对记忆内容自动应用相关标签。

```python
data = {
  "user_id": "memos_user_123",
  "conversation_id": 0610,
  "tags":["运动建议","健身规划","运动记录"], #开发者传入的对“健身助手话题分类”的自定义标签。
  "messages":[
    {"role": "user", "content": "我今天早上跑了5公里，膝盖有点酸"}, 
    {"role": "assistant", "content": "你今天跑了5公里，膝盖有点酸，说明关节和肌肉还在适应强度。明天建议把距离控制在3公里左右，重点放在充分热身和放松。"
    }
  ]
}

# 在后续检索中，您可以传入"tags":"运动建议"来检索围绕“运动建议”的用户记忆。
```

::note
如果你想了解更多，详见[自定义标签](/memos_cloud/features/basic/custom_tags)
::

<br>

3. **使用自带的业务信息，精确过滤**

添加消息时带上`info`，传入更多结构化的业务字段或自定义补充信息，例如`scene = 订单`等，用来按照业务维度精确区分当前的场景、业务线、来源、状态等等。


```python
data = {
  "user_id": "memos_user_123",
  "conversation_id": 0610,
  "messages":[
    {"role": "user", "content": "帮我查找时间合适的机票"}, 
    {"role": "assistant", "content": "我帮你查到了几班时间合适的航班：\n1. 北京 → 上海，2月15日08:30出发，12:30到达\n2. 北京 → 上海，2月15日14:00出发，18:00到达\n3. 北京 → 上海，2月16日09:00出发，13:00到达\n你希望我帮你预订哪一班，或者需要我筛选其他条件吗？"
    }
  ],
  "info":{
    "scene":"机票"
  }
}

# 在后续检索中，您可以传入"info":{"scene":"机票"}来检索围绕“机票购买”业务场景的用户记忆。
```

<br>

**使用提示**

`info`支持传入任意自定义键值对，所有字段均可正常存储和检索。

当前系统对以下字段提供了更优的查询性能支持（因为这些字段已经添加索引）：
- business_type（业务类型）
- biz_id（业务唯一标识）
- scene（业务或对话场景）
- custom_status（自定义状态）

是否使用上述字段并非强制要求，使用其他自定义字段在功能上完全一致，仅在检索性能上可能有所差异。

::note
`info`为扁平化的键值对结构，字段名和字段值均需为字符串类型，用于在检索时进行条件过滤；非字符串值需先转换为字符串再传入。
::

<br>

## 6. 更多功能

:::note
有关 API 字段、格式等信息的完整列表，详见[Add Message接口文档](/api_docs/core/add_message)。
:::

| **功能** | **字段** | **说明** |
| --- | --- | --- |
| 多模态消息 | `messages` | 用于添加的对话消息列表。<br>支持的角色类型包括：user / assistant / system / tool；<br>支持的消息类型包括：<br>• 文本<br>• 文档、图片，详见[多模态消息](/memos_cloud/features/basic/multimodal)。<br>• 工具调用信息，详见[工具调用](/memos_cloud/features/advanced/tool_calling)。 |
| 异步模式 | `async_mode` | 控制添加消息后的处理方式，支持异步与同步两种模式，详见[异步模式](/memos_cloud/features/basic/async_mode)。 |
| 写入公共记忆 | `allow_public` | 控制当前用户对话消息生成的记忆是否要写入项目级公共记忆，供项目下所有用户共享，默认关闭。 |
| 写入知识库记忆 | `allow_knowledgebase_ids` | 控制当前用户对话消息生成的记忆是否写入指定的项目关联的知识库中，供所有可访问该知识库的用户共享。默认为空，使用时您可以将需要写入的知识库列表传入。详见[知识库](/memos_cloud/features/advanced/knowledge_base)。 |
