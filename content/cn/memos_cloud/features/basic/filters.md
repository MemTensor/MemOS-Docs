---
title: 记忆过滤器Filter
desc: 检索记忆时使用记忆过滤器，可以按照指定智能体、元信息、时间范围等条件进行过滤。
---

::warning 
注意
<br>
<br>

**[需要先在addMessage的时候传入相关字段（点此查看详细 API 文档）](/api_docs/core/add_message)**
<br>

**[才能在searchMemory的时候使用过滤条件（点此查看详细 API 文档）](/api_docs/core/search_memory)**
<br>
<br>

**本文聚焦于功能说明，详细接口字段及限制请点击上方文字链接查看**

::

## 1. 何时使用记忆过滤器

在处理大规模的记忆时，你需要精确控制可以被检索的记忆范围。记忆过滤器（Filter）提供了对检索范围的精细控制能力，主要包括：

*   **指定智能体过滤记忆**：在同一用户的多智能体记忆中，筛选出属于指定智能体的记忆。
    
*   **基于时间过滤记忆**：通过时间戳限定检索范围，如查询某天或某个时间段内的记忆。
    
*   **指定自定义范围的记忆**：根据元信息自定义字段，仅检索符合业务条件的记忆。
    

## 2. 工作原理
1. **精确过滤**：根据你设定的过滤条件，对用户的记忆进行强过滤，精确保留满足约束的候选记忆条目。
2. **检索召回**：在过滤后的候选记忆中，执行[记忆检索](/memos_cloud/mem_operations/search_memory)，从中召回与用户查询最相关的记忆片段。

## 3. 过滤器结构说明

支持使用 JSON 格式定义记忆过滤器，可以在最外层使用逻辑运算符来组合多个过滤条件。

```json
# 基础结构如下所示
{
    "and": [  # 或者'or'
        { "field_name": "value" },
        { "field_name": { "operator": "value" } }
    ]
}
```

## 4. 可用字段与运算符

### 4.1 实例字段

字段详细解释见（[6. 更多功能](/memos_cloud/mem_operations/add_message)）

| 字段名 | 数据类型 | 操作符 | 示例 |
| --- | --- | --- | --- |
| agent\_id | str | `=` | `{"agent_id":"agent_123"}` |
| app\_id | str | `=` | `{"app_id":"app_123"}` |

### 4.2 元信息字段

在记忆检索（search）时，可对在添加消息（[add](/memos_cloud/mem_operations/add_message)）阶段通过 info 写入的元信息属性进行过滤。为获得更优的检索性能，建议优先使用如下4个常用字段（已添加数据库索引，查询速度更快）。字段详细解释见（[6. 更多功能](/memos_cloud/mem_operations/add_message)）。

| 字段名 | 数据类型 | 操作符 | 示例 |
| --- | --- | --- | --- |
| business_type | str | `=` | `{"business_type":"购物"}` |
| biz_id | str | `=` | `{"biz_id":"order_123456"}` |
| scene | str | `=` | `{"scene":"支付"}` |
| custom_status | str | `=` | `{"custom_status":"VIP3"}` |


### 4.3 标签字段

| 字段名 | 数据类型 | 操作符 | 示例 |
| --- | --- | --- | --- |
| tags | list | `contains` | `{"tags": {"contains": "finance"}}` |

### 4.4 时间字段

| 字段名 | 数据类型 | 操作符 | 示例 |
| --- | --- | --- | --- |
| create\_time | str | `lt`, `gt`, `lte`, `gte` | `{"create_time": {"gte": "2025-12-10"}}`<br>`{"create_time": {"gt": "2025-12-10 15:00:00"}}`|
| update\_time | str | `lt`, `gt`, `lte`, `gte` | `{"update_time": {"lte": "2025-12-10"}}`<br>`{"update_time": {"lt": "2025-12-10 23:00:00"}}`| |

## 5. 使用示例

::note
**提示**<br> 根节点必须是`and`或`or`，并且组合一系列条件，不允许嵌套逻辑运算符；<br>
不支持在`filter`中指定`user_id`。
::

使用以下记忆过滤器可满足常见的过滤需求，无需重新构建过滤逻辑。

---

**智能体**

```json
# 过滤与以下任意智能体相关的记忆
"filter" : {
    "or": [
        {"agent_id": "agent_123"},
        {"agent_id": "agent_456"}
    ]
}
```

**元信息**

```json
# 过滤自定义元信息info中的属性
"filter" : {
    "and": [
        {"business_type":"旅行"}, # 宏观业务类别
        {"biz_id":"travel_001"}, # 核心业务标识符
        {"scene":"支付"}, # 消息发生的具体环境或交互环节
        {"custom_status":"v1"} # 自定义状态/标记
    ]
}
```

**标签**

```json
# 过滤包含指定标签的记忆
"filter" : {
    "and": [
        {"tags": {"contains": "天气"}}
    ]
}
```

**日期范围**

```json
# 过滤2025年12月的记忆
"filter" : {
    "and": [
        {"create_time": {"gt": "2025-12-01"}},
        {"create_time": {"lt": "2026-01-01"}}
    ]
}

# 过滤最近一段时间更新的记忆
"filter" : {
    "and": [
        {"update_time": {"gt": "2025-12-10"}}
    ]
}
```

**多维度**

```json
# 过滤某用户在Q4与客服助手关于账单的记忆
"filter" : {
    "and": [
        {"agent_id": "customer_service"},
        {"scene":"账单"},
        {"create_time": {"gt": "2025-10-01"}},
        {"create_time": {"lt": "2026-01-01"}}
    ]
}
```
