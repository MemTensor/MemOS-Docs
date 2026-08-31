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

* **用户标识（user\_id）**：用于标识消息所属的用户，你添加的消息必须关联到唯一的用户标识符。  
* **会话标识（conversation\_id）**：用于标识消息所属的会话；传入后，相同 conversation_id 下的多轮消息会被识别为同一上下文。
* **消息（messages）**：用于添加到 MemOS 的用户与 AI 对话内容的有序消息列表。

## 2. 工作原理

* **信息提取**：MemOS 从消息中提取并处理为记忆，包括事实、偏好、[属性记忆](/cn/memos_cloud/features/profile)、[事件记忆](/cn/memos_cloud/features/event_memory)、工具记忆等。
* **冲突解决**：现有记忆会被检查是否有重复或矛盾，完成更新。
* **记忆储存**：最终产生的记忆使用向量数据库与图数据库储存，便于后续检索时快速召回。

以上所有流程，仅需调用 `add/message` 接口即可触发，无需您对用户的记忆手动操作。

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
想知道生成了哪些记忆？一键复制上述代码并运行，添加好记忆后，前往[**检索记忆**](/cn/memos_cloud/mem_operations/search_memory)。
:::

需要查看完整字段、请求格式和响应格式？详见 [Add Message 接口文档](/cn/api_docs/core/add_message)。

## 4. 何时添加消息？

记忆的基础来源于原始消息内容。MemOS 会将您添加的消息统一加工为记忆，用于后续的检索与使用。您可以根据实际场景选择合适的添加时机：

* **一次性导入**：将已有的用户历史对话一键导入 MemOS，快速建立初始记忆；
* **实时添加**：在用户每次发送消息时，实时将消息添加至 MemOS；
* **按轮次添加**：根据业务需要，设置每隔若干轮对话再将用户消息添加至 MemOS。

## 5. 更多使用方法

下面这些字段用于在添加消息时补充时间、分类、隔离和业务上下文。你可以按场景单独使用，也可以组合使用。

### 写入用户偏好或行为数据

除了对话内容，用户的个人偏好、行为等一切文本数据信息，都可以作为原始信息，添加到 MemOS。

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

### 写入多模态内容

除了文本信息，MemOS 还支持抽取多模态记忆。当消息包含多模态内容时，MemOS 会提取文本、视觉信息等，处理为用户记忆。

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "1211",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "我正在研究MemOS。"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://cdn.memtensor.com.cn/img/1758706201390_iluj1c_compressed.png"
                    }
                }
            ]
        },
        {"role": "assistant", "content": "好的，需要我为您解答吗？"}
    ]
}
```

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

#### 为 Agent 创建记忆

如果开启[为 Agent 创建独立记忆](/memos_cloud/introduction/isolation_filters#为-agent-创建独立记忆-new)功能，MemOS 不仅会为用户抽取记忆，还会以该 `agent_id` 为主体单独生成一份 Agent 记忆，使 Agent 具备自己的长期记忆能力，同时支持与多个用户同时对话并记忆。

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

### `allow_memory_view`：控制生成的记忆种类

通过 `allow_memory_view` 指定本次添加消息后允许生成的[记忆种类](/memos_cloud/introduction/memory_types)，不传时默认生成所有种类。

如下所示，仅生成事件记忆和属性记忆，不会生成事实记忆、偏好记忆等。

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0624",
    "allow_memory_view": ["event", "profile"],
    "messages": [
        {"role": "user", "content": "上周二下午和李四做了方案评审，客户对第二版比较满意。"},
        {"role": "assistant", "content": "收到，需要我整理评审结论吗？"}
    ]
}
```

### `custom_extract_prompt`：自定义抽取提示词

MemOS 默认使用内置策略从消息中抽取记忆。如果默认策略不符合业务需要，可以通过 `custom_extract_prompt` 传入自定义抽取提示词，指定某个环节“要抽取什么”。该配置仅对本次请求生效，不会被保存。

支持的 key 分为两类：

| 类别 | 取值 | 作用环节 |
| --- | --- | --- |
| 记忆种类 | `detail_factual`、`preference`、`skill`、`profile`、`event`、`tool_memory` | 对应[记忆种类](/cn/memos_cloud/introduction/memory_types)的抽取 |
| 输入模态 | `image`、`document` | 图片内容、文件内容的抽取 |

使用时注意以下几点：

* 自定义提示词仅替换对应环节的默认抽取策略，输出格式等协议约束仍由服务端保留，记忆仍按默认结构返回。
* 未配置 `document` 时，文件内容沿用 `detail_factual` 的自定义提示词。
* 记忆种类的 key 仅在对应种类被 `allow_memory_view` 允许时生效，`image` 和 `document` 不受 `allow_memory_view` 影响。

如下所示，本次添加只抽取与出行安排相关的事实，并要求图片只提取可见的文字信息：

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0827",
    "custom_extract_prompt": {
        "detail_factual": "仅抽取与出行安排相关的事实，忽略寒暄与闲聊内容。",
        "image": "仅提取图片中可见的文字与票据信息。"
    },
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "帮我看看这张机票行程单。"},
                {"type": "image_url", "image_url": {"url": "https://example.com/itinerary.png"}}
            ]
        }
    ]
}
```

### 群聊：`user_id` 传入列表

多个用户在同一会话中对话时，`user_id` 支持传入列表，表示记忆所属的主体。使用 `role_id` 和 `role_name` 标识每条消息的发言人。详见[群聊](/cn/memos_cloud/features/group_chat)。

```python
data = {
    "user_id": ["memos_user_1", "memos_user_2"],
    "agent_id": "memos_agent",
    "conversation_id": "group_conv_001",
    "messages": [
        {"role": "user", "role_id": "memos_user_1", "role_name": "张三", "content": "下周二方案评审，时间合适吗？"},
        {"role": "user", "role_id": "memos_user_2", "role_name": "李四", "content": "我可以，下午两点。"},
        {"role": "assistant", "role_id": "memos_agent", "content": "已记录，下周二下午两点方案评审。"}
    ]
}
```

## 6. 常见错误与排查

| 错误码 | 常见原因 | 处理方式 |
| --- | --- | --- |
| `40000` | 请求 JSON 结构不符合要求，或字段类型错误 | 检查 `messages` 是否为数组，`role` / `content` 是否放在每条消息对象中 |
| `40002` | 必填字段为空 | 检查 `user_id`、`conversation_id`、`messages` 是否都已传入且非空 |
| `40011` | `conversation_id` 过长 | 使用短 ID，不要把完整对话、用户输入或 JSON 放进 `conversation_id` |
| `40013` | `messages` 总长度超限 | 拆分历史对话，分多次调用写入 |
| `40305` | 单次输入超过 token 上限 | 缩短单次写入内容，优先保留用户关键事实和偏好 |
| `40309` | 单位时间输入 token 超限 | 降低并发和批量导入速度，分批重试 |
| `50143` / `50144` | 记忆或消息写入失败 | 检查请求内容后稍后重试；如果持续出现，请联系支持 |

## 7. 更多功能

如果你需要更复杂的写入方式，可以继续了解这些扩展能力。

<!-- markdownlint-disable MD003 MD022 MD023 -->
::card-group
  :::card
  ---
  icon: i-ri-image-line
  title: 多模态消息
  to: /cn/memos_cloud/features/multimodal
  ---
  支持文本、图片、文档等多种输入内容
  :::

  :::card
  ---
  icon: i-ri-timer-flash-line
  title: 异步模式
  to: /cn/memos_cloud/features/async_mode
  ---
  控制消息写入后的处理方式
  :::
  
  :::card
  ---
  icon: i-ri-group-line
  title: 群聊
  to: /cn/memos_cloud/features/group_chat
  ---
  多用户同一会话，为每个参与者抽取记忆
  :::
::
<!-- markdownlint-enable MD003 MD022 MD023 -->
