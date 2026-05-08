---
title: 记忆过滤器 Filter
desc: 检索记忆时使用记忆过滤器，可以按记忆来源、标签、元信息、时间范围等条件进行过滤。
---

:::warning
注意

需要先在 [Add Message 接口](/api_docs/core/add_message)中传入相关字段，才能在 [Search Memory 接口](/api_docs/core/search_memory)中使用过滤条件。

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
2. **再语义召回**：在过滤后的候选记忆中，执行[记忆检索](/memos_cloud/mem_operations/search_memory)，返回与 `query` 最相关的记忆片段。

这意味着 Filter 不是关键词搜索，而是检索前的范围控制。过滤条件越严格，进入语义召回的候选记忆越少。

## 3. 两种过滤方式

### 全局过滤

如果你不需要区分记忆来源，可以直接在 `filter` 根节点写逻辑条件。该条件会作用于本次检索涉及的记忆范围。

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

如果一次检索会同时访问多类记忆，可以在 `filter` 中分别设置 `user`、`public`、`knowledgebase` 三个来源的过滤条件。

| 来源 | 说明 |
| --- | --- |
| `user` | 用户个人记忆，来自该用户历史对话沉淀 |
| `public` | 项目级公共记忆，可供项目下多个用户共享 |
| `knowledgebase` | 知识库记忆，来自上传到知识库的文档或技能 |

分来源过滤适合“用户记忆按最近时间筛，知识库记忆按标签筛，公共记忆不参与”等更精细的检索策略。未传入的来源不会额外附加该来源的过滤条件。

```json
"filter": {
    "knowledgebase": {
        "and": [
            {"tags": {"contains": "阅读"}},
            {"create_time": {"gte": "2025-01-01"}},
            {"create_time": {"lte": "2025-12-31"}}
        ]
    },
    "user": {
        "and": [
            {"scene": "chat"},
            {"create_time": {"gte": "2025-01-01"}}
        ]
    },
    "public": {
        "and": [
            {"tags": {"contains": "公告"}}
        ]
    }
}
```

::note
全局过滤和分来源过滤选择一种即可。若需要对不同来源使用不同条件，优先使用分来源过滤。
::

## 4. 可用字段与运算符

每一组过滤条件的根节点必须是 `and` 或 `or`，并组合一系列字段条件。不支持在 `filter` 中指定 `user_id`。

### 实例字段

字段详细解释见[添加消息](/memos_cloud/mem_operations/add_message)中的更多功能说明。

| 字段名 | 数据类型 | 操作符 | 示例 |
| --- | --- | --- | --- |
| `agent_id` | string | `=` | `{"agent_id":"agent_123"}` |
| `app_id` | string | `=` | `{"app_id":"app_123"}` |

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
| `create_time` | string | `lt`, `gt`, `lte`, `gte` | `{"create_time": {"gte": "2025-12-10"}}` |
| `update_time` | string | `lt`, `gt`, `lte`, `gte` | `{"update_time": {"lte": "2025-12-10"}}` |

## 5. 使用示例

### 过滤指定 Agent 的记忆

```json
"filter": {
    "or": [
        {"agent_id": "agent_123"},
        {"agent_id": "agent_456"}
    ]
}
```

### 过滤指定业务场景的记忆

```json
"filter": {
    "and": [
        {"business_type": "旅行"},
        {"biz_id": "travel_001"},
        {"scene": "支付"},
        {"custom_status": "v1"}
    ]
}
```

### 过滤指定标签和日期范围

```json
"filter": {
    "and": [
        {"tags": {"contains": "天气"}},
        {"create_time": {"gte": "2025-12-01"}},
        {"create_time": {"lte": "2025-12-31"}}
    ]
}
```

### 对不同记忆来源分别过滤

下面的示例表示：知识库记忆只检索 2025 年内带有“阅读”标签的内容；用户个人记忆只检索 `scene=chat` 的内容；公共记忆只检索带有“公告”标签的内容。

```json
"filter": {
    "knowledgebase": {
        "and": [
            {"tags": {"contains": "阅读"}},
            {"create_time": {"gte": "2025-01-01"}},
            {"create_time": {"lte": "2025-12-31"}}
        ]
    },
    "user": {
        "and": [
            {"scene": "chat"}
        ]
    },
    "public": {
        "and": [
            {"tags": {"contains": "公告"}}
        ]
    }
}
```
