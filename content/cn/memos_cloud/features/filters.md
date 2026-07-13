---
title: 记忆过滤器 Filter
desc: 检索记忆时使用记忆过滤器，可以按记忆来源、标签、元信息、时间范围等条件进行过滤。
---

:::warning
注意

需要先在 [Add Message 接口](/cn/api_docs/core/add_message)中传入相关字段，才能在 [Search Memory 接口](/cn/api_docs/core/search_memory)中使用过滤条件。

本文聚焦于功能说明，详细接口字段及限制请查看上方 API 文档。
:::

## 1. 何时使用记忆过滤器

当记忆规模变大，或一次检索会同时访问用户记忆、公共记忆、知识库记忆时，你通常需要先限定候选范围，再让 MemOS 做语义召回。记忆过滤器（Filter）就是用于在检索前做这一步精确筛选。

常见场景包括：

- 只检索某个 Agent、某个 App 产生的记忆。
- 只检索某个时间段内创建或更新的记忆。
- 只检索包含指定标签的记忆。
- 根据添加消息时写入的业务字段筛选，例如 `scene`、`biz_id`、`business_type`。
- 对用户记忆、公共记忆、知识库记忆分别设置不同过滤条件。

## 2. 工作原理

1. **先过滤范围**：MemOS 根据 `filter` 中的条件，对候选记忆做强过滤。
2. **再语义召回**：在过滤后的候选记忆中，执行[记忆检索](/cn/memos_cloud/mem_operations/search_memory)，返回与 `query` 最相关的记忆片段。

这意味着 Filter 不是关键词搜索，而是检索前的范围控制。过滤条件越严格，进入语义召回的候选记忆越少。

## 3. 两种过滤方式

### 全局过滤

如果你不需要区分记忆来源，可以直接在 `filter` 根节点写逻辑条件。该条件会作用于本次检索涉及的所有记忆范围（包括用户记忆、公共记忆和通过 `knowledgebase_ids` 传入的知识库记忆）。

```json
"filter": {
    "and": [
        {"tags": {"contains": "阅读"}},
        {"create_time": {"gte": "2025-01-01"}},
        {"create_time": {"lte": "2025-12-31"}},
        {"scene": "chat"}
    ]
}
```

### 分来源过滤

如果一次检索会同时访问多类记忆，可以在 `filter` 中分别设置各来源的过滤条件。

| 来源 | 说明 |
| --- | --- |
| `user` | 用户个人记忆，来自该用户历史对话沉淀 |
| `agent` | 开启[为 Agent 创建独立记忆](/cn/memos_cloud/introduction/isolation_filters#为-agent-创建独立记忆-new)时，可检索 Agent 的记忆 |
| `public` | 项目级公共记忆，可供项目下多个用户共享 |
| `knowledgebase` | 知识库记忆，来自上传到知识库的文档或技能 |

分来源过滤适合"用户记忆按最近时间筛，知识库记忆按标签筛，公共记忆不参与"等更精细的检索策略。未
传入的来源不会额外附加该来源的过滤条件。

#### 示例：分条件检索用户、知识库、公共记忆

如下所示，检索用户与 Agent 从 2025 年 6 月 1 日以来的记忆，同时检索知识库、公共记忆中包含了【制度】的记忆内容。

```json
"filter": {
    "user": {
        "and": [
            {"agent_id": "memos_agent"},
            {"create_time": {"gte": "2025-06-01"}}
        ]
    },
    "knowledgebase": {
        "and": [
            {"tags": {"contains": "制度"}}
        ]
    },
    "public": {
        "and": [
            {"tags": {"contains": "制度"}}
        ]
    }
}
```

::note
全局过滤和分来源过滤选择一种即可。若需要对不同来源使用不同条件，优先使用分来源过滤。
::

## 4. 可用字段与运算符

每一组过滤条件的根节点必须是 `and` 或 `or`，并组合一系列字段条件。

### 实例字段

| 字段名 | 数据类型 | 操作符 | 示例 |
| --- | --- | --- | --- |
| `agent_id` | string | `=` | `{"agent_id":"memos_agent"}` |
| `app_id` | string | `=` | `{"app_id":"app_123"}` |
| `related_id` | list | `=` | `{"related_id": ["memos_user_1", "memos_user_2"]}` |

::note

`related_id` 补充说明：

- 支持同时传入多个 `agent_id` 与 `user_id`，用于筛选检索的对象，与指定 Agent 或用户相关联的记忆。
- 数组内多个 ID 之间为或关系，匹配任意一个即命中。
- 该字段在全局过滤和分来源过滤中均可使用。
::

### 元信息字段

在添加消息时，你可以通过 `info` 写入业务元信息。检索时，这些字段在 `filter` 中直接按字段名使用，不需要再包一层 `info`。

| 字段名 | 数据类型 | 操作符 | 示例 |
| --- | --- | --- | --- |
| `business_type` | string | `=` | `{"business_type":"购物"}` |
| `biz_id` | string | `=` | `{"biz_id":"order_123456"}` |
| `scene` | string | `=` | `{"scene":"支付"}` |
| `custom_status` | string | `=` | `{"custom_status":"VIP3"}` |

```json
// 推荐写法
{"scene": "chat"}

// 不要写成这样
{"info": {"scene": "chat"}}
```

### 标签字段

| 字段名 | 数据类型 | 操作符 | 示例 |
| --- | --- | --- | --- |
| `tags` | list | `contains` | `{"tags": {"contains": "finance"}}` |

### 时间字段

| 字段名 | 数据类型 | 操作符 | 示例 |
| --- | --- | --- | --- |
| `create_time` | string | `lt`, `gt`, `lte`, `gte` | `{"create_time": {"gte": "2025-12-10"}}`<br>`{"create_time": {"gt": "2025-12-10 15:00:00"}}` |
| `update_time` | string | `lt`, `gt`, `lte`, `gte` | `{"update_time": {"lte": "2025-12-10"}}`<br>`{"update_time": {"lt": "2025-12-10 23:00:00"}}` |

## 5. 使用示例

使用以下记忆过滤器可满足常见的过滤需求，无需重新构建过滤逻辑。

---

- **智能体**

```json
// 过滤与以下任意智能体相关的记忆
"filter" : {
    "or": [
        {"agent_id": "agent_123"},
        {"agent_id": "agent_456"}
    ]
}
```

- **元信息**

```json
// 过滤自定义元信息 info 中的属性（filter 中直接写字段名，不包 info）
"filter" : {
    "and": [
        {"business_type":"旅行"},
        {"biz_id":"travel_001"},
        {"scene":"支付"},
        {"custom_status":"v1"}
    ]
}
```

- **标签**

```json
// 过滤包含指定标签的记忆
"filter" : {
    "and": [
        {"tags": {"contains": "天气"}}
    ]
}
```

- **日期范围**

```json
// 过滤 2025 年 12 月的记忆
"filter" : {
    "and": [
        {"create_time": {"gt": "2025-12-01"}},
        {"create_time": {"lt": "2026-01-01"}}
    ]
}

// 过滤最近一段时间更新的记忆
"filter" : {
    "and": [
        {"update_time": {"gt": "2025-12-10"}}
    ]
}
```

- **多维度**

```json
// 过滤某用户在 Q4 与客服助手关于账单的记忆
"filter" : {
    "and": [
        {"agent_id": "customer_service"},
        {"scene":"账单"},
        {"create_time": {"gt": "2025-10-01"}},
        {"create_time": {"lt": "2026-01-01"}}
    ]
}
```

- **检索与多个 Agent 或用户有关的记忆**

```json
"filter" : {
    "and": [
        {"related_id": ["memos_agent_1", "memos_agent_2"]}
    ]
}
```
