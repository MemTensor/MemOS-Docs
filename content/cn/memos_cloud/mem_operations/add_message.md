---
title: Add Message
desc: MemOS 会将您添加的多模态内容如文本、文件、图片等，自动处理为可检索的个人记忆。
---

::note
**&nbsp;为什么记忆很重要？**


* 长期不丢失：能够实现跨会话的长期记忆，避免对话结束后信息丢失；
* 把握用户偏好：随着交互不断积累，让 AI 越来越“**懂用户**”；
* 随时间演进：会话过程中，持续动态更新用户记忆；
* 跨产品体验：在您的多个应用或产品之间，共享同一用户的记忆，实现一致的用户体验。

::




## 1. 关键参数

*   **用户标识（user\_id）**：用于标识消息所属的用户，你添加的消息必须关联到唯一的用户标识符。
    
*   **会话标识（conversation\_id）**：用于标识消息所属的会话，你添加的消息必须关联到唯一的会话标识符。
    
*   **消息（messages）**：用于添加到 MemOS 的用户与 AI 对话内容的有序消息列表。



## 2. 工作原理

*   **信息提取**：MemOS 在系统内部使用 LLM 提取消息中的事实、偏好等，并处理为记忆，包括：事实记忆、偏好记忆、工具记忆等。
    
*   **冲突解决**：现有记忆会被检查是否有重复或矛盾，完成更新。
    
*   **记忆储存**：最终产生的记忆会使用向量数据库与图数据库储存，便于在后续检索时快速召回。



以上所有流程，仅需调用`add/message`接口即可触发，无需您对用户的记忆手动操作。



## 3. 快速上手

::code-group

```python [Python (HTTP)]
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://memos.memtensor.cn/api/openmem/v1"

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

res = requests.post(
  f"{BASE_URL}/add/message",
  headers={"Authorization": f"Token {API_KEY}"},
  json=data
)

print(res.json())
```

```python [Python (SDK)]
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

messages = [
  {"role": "user", "content": "我暑假定好去广州旅游，住宿的话有哪些连锁酒店可选？"},
  {"role": "assistant", "content": "您可以考虑【七天、全季、希尔顿】等等"},
  {"role": "user", "content": "我选七天"},
  {"role": "assistant", "content": "好的，有其他问题再问我。"}
]

res = client.add_message(
  messages=messages,
  user_id="memos_user_123",
  conversation_id="0610"
)

print(res)
```

```bash [Curl]
export MEMOS_API_KEY="YOUR_API_KEY"
export MEMOS_BASE_URL="https://memos.memtensor.cn/api/openmem/v1"

curl "$MEMOS_BASE_URL/add/message" \
  -H "Authorization: Token $MEMOS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "memos_user_123",
    "conversation_id": "0610",
    "messages": [
      {"role": "user", "content": "我暑假定好去广州旅游，住宿的话有哪些连锁酒店可选？"},
      {"role": "assistant", "content": "您可以考虑【七天、全季、希尔顿】等等"},
      {"role": "user", "content": "我选七天"},
      {"role": "assistant", "content": "好的，有其他问题再问我。"}
    ]
  }'
```

::



:::note
想知道生成了哪些记忆？一键复制上述代码并运行，添加好记忆后，前往[**检索记忆**](/memos_cloud/mem_operations/search_memory)。
:::

需要查看完整字段、请求格式和响应格式？详见 [Add Message 接口文档](/api_docs/core/add_message)。



## 4. 何时添加消息？

记忆的基础来源于原始消息内容。MemOS 会将您添加的消息统一加工为记忆，用于后续的检索与使用。您可以根据实际场景选择合适的添加时机：

*   **一次性导入**：将已有的用户历史对话一键导入 MemOS，快速建立初始记忆；

*   **实时添加**：在用户每次发送消息时，实时将消息添加至 MemOS；

*   **按轮次添加**：根据业务需要，设置每隔若干轮对话再将用户消息添加至 MemOS。





## 5. 更多使用方法

下面这些字段用于在添加消息时补充时间、分类、隔离和业务上下文。你可以按场景单独使用，也可以组合使用。

### `chat_time`：指定对话发生时间

MemOS 默认以消息传入时的北京时间作为记忆时间。如果你在批量导入历史对话，可以为每条消息传入 `chat_time`，让生成的记忆保留更准确的时间线。

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0930",
    "messages": [
        {"role": "user", "content": "我喜欢吃辣。", "chat_time": "2025-09-12 08:00:00"},
        {"role": "assistant", "content": "已记住你喜欢辣味。", "chat_time": "2025-09-12 08:01:00"},
        {"role": "user", "content": "我不喜欢重油。", "chat_time": "2025-09-25 12:00:00"},
        {"role": "assistant", "content": "记住了，你偏好清爽的辣味。", "chat_time": "2025-09-25 12:01:00"}
    ]
}
```

### `content`：写入用户偏好或行为数据

除了对话内容，用户的个人偏好、行为、问卷信息等，也可以作为 `content` 写入 MemOS。

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0901",
    "messages": [
        {
            "role": "user",
            "content": """
喜欢的电影类型: 科幻, 动作, 喜剧
喜欢的电视剧类型: 悬疑, 历史剧
喜欢的书籍类型: 科普, 技术, 自我成长
喜欢的聊天风格: 幽默, 温暖, 轻松闲聊
想让AI提供的帮助类型: 建议, 信息查询, 灵感
我最感兴趣的话题: 人工智能, 未来科技, 电影评论
我希望AI帮助的事情: 规划日常学习计划, 推荐电影和书籍, 提供心情陪伴
            """
        }
    ]
}
```

### `agent_id`：按 Agent 隔离记忆

添加消息时传入 `agent_id`，可以标识当前对话关联的 Agent，用来区分同一用户在不同 Agent 下产生的记忆。

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0610",
    "agent_id": "health_assistant",
    "messages": [
        {"role": "user", "content": "我今天跑了5公里，膝盖有点酸。"},
        {"role": "assistant", "content": "明天建议降低强度。"}
    ]
}
```

::note
后续检索时，可以通过 `filter` 参数传入 `"agent_id":"health_assistant"`，检索用户与该助手聊天的记忆。详细见[记忆过滤器（filter）](/memos_cloud/features/filters)。
::

### `tags`：对记忆进行语义分类

MemOS 会为每条记忆自动生成标签。如果你的业务已有标签体系，也可以在添加消息时传入自定义 `tags`，让记忆更贴合业务分类。更多说明见[自定义标签](/memos_cloud/features/custom_tags)。

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0610",
    "tags": ["运动建议", "健身规划"],
    "messages": [
        {"role": "user", "content": "我今天跑了5公里，膝盖有点酸。"},
        {"role": "assistant", "content": "明天建议降低强度。"}
    ]
}
```

::note
后续检索时，可以通过 `filter` 参数传入 `"tags":"运动建议"`，检索围绕该标签的用户记忆。详细见[记忆过滤器（filter）](/memos_cloud/features/filters)。
::

### `info`：传入自定义信息

添加消息时带上 `info`，可以把业务场景、来源、状态等结构化信息一并写入，后续检索时用于精确过滤。

常用字段如下：

| 字段 | 用途 |
| --- | --- |
| `business_type` | 业务类型 |
| `biz_id` | 业务唯一标识 |
| `scene` | 业务或对话场景 |
| `custom_status` | 自定义状态 |

你也可以传入其他自定义键值对，所有字段都可以正常存储和检索。

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0610",
    "messages": [
        {"role": "user", "content": "帮我查找时间合适的机票。"},
        {"role": "assistant", "content": "已找到几班北京到上海的航班。"}
    ],
    "info": {
        "scene": "机票"
    }
}
```

::note
后续检索时，可以通过 `filter` 参数传入 `"scene":"机票"`，检索围绕该场景的用户记忆。详细见[记忆过滤器（filter）](/memos_cloud/features/filters)。
::

## 6. 更多功能

如果你需要更复杂的写入方式，可以继续了解这些扩展能力。

::card-group
  :::card
  ---
  icon: ri:image-line
  title: 多模态消息
  to: /cn/memos_cloud/features/multimodal
  ---
  支持文本、图片、文档等多种输入内容。
  :::

  :::card
  ---
  icon: ri:tools-line
  title: 工具记忆
  to: /cn/memos_cloud/features/tool_calling
  ---
  将工具调用过程和结果写入用户记忆。
  :::

  :::card
  ---
  icon: ri:timer-flash-line
  title: 异步模式
  to: /cn/memos_cloud/features/async_mode
  ---
  控制消息写入后的处理方式，适合不同实时性要求。
  :::

  :::card
  ---
  icon: ri:database-2-line
  title: 知识库记忆
  to: /cn/memos_cloud/features/knowledge_base
  ---
  将消息生成的记忆写入指定知识库。
  :::
::
