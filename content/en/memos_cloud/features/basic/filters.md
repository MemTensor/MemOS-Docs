---
title: Memory Filters
desc: Use memory filters when retrieving memories to filter by specific agents, meta information, time ranges, and other conditions.
---

::warning 
Note
<br>
<br>

**[You need to pass relevant fields when calling addMessage (Click here for detailed API documentation)](/api_docs/core/add_message)**
<br>

**[Only then can you use filter conditions when calling searchMemory (Click here for detailed API documentation)](/api_docs/core/search_memory)**
<br>
<br>

**This article focuses on functional description. For detailed API fields and limits, please click the text links above.**

::

## 1. When to Use Memory Filters

When handling large-scale memories, you need precise control over the scope of memories that can be retrieved. Memory filters (Filter) provide fine-grained control over the retrieval scope, mainly including:

*   **Filter memories by specific agent**: In a user's multi-agent memories, screen out memories belonging to a specific agent.
    
*   **Filter memories based on time**: Limit the retrieval range via timestamps, such as querying memories from a certain day or a specific time period.
    
*   **Specify custom range of memories**: Retrieve only memories that meet business conditions based on custom fields in meta information.

    
## 2. How It Works  
1. **Precise Filtering**: Based on the filtering conditions you set, the system performs strict filtering on the user's memory and precisely retains the candidate memory entries that meet the constraints.  
2. **Retrieval and Recall**: Within the filtered candidate memories, [memory search](/memos_cloud/mem_operations/search_memory) is performed to recall the memory fragments most relevant to the user's query.


## 3. Filter Structure Description

Supports using JSON format to define memory filters, and logical operators can be used at the outermost layer to combine multiple filter conditions.

```json
# Basic structure is shown below
{
    "and": [  # or 'or'
        { "field_name": "value" },
        { "field_name": { "operator": "value" } }
    ]
}
```

## 4. Available Fields and Operators

### 4.1 Instance Fields

For detailed explanation of fields, see ([6. More Features](/memos_cloud/mem_operations/add_message))

| Field Name | Data Type | Operator | Example |
| --- | --- | --- | --- |
| agent\_id | str | `=` | `{"agent_id":"agent_123"}` |
| app\_id | str | `=` | `{"app_id":"app_123"}` |

### 4.2 Meta Information Fields

During memory retrieval (search), you can filter on meta information attributes written via `info` during the add message ([add](/memos_cloud/mem_operations/add_message)) stage. To obtain better retrieval performance, it is recommended to prioritize using the following 4 common fields (database indexes added for faster query speed). For detailed explanation of fields, see ([6. More Features](/memos_cloud/mem_operations/add_message)).

| Field Name | Data Type | Operator | Example |
| --- | --- | --- | --- |
| business_type | str | `=` | `{"business_type":"Shopping"}` |
| biz_id | str | `=` | `{"biz_id":"order_123456"}` |
| scene | str | `=` | `{"scene":"Payment"}` |
| custom_status | str | `=` | `{"custom_status":"VIP3"}` |


### 4.3 Tag Fields

| Field Name | Data Type | Operator | Example |
| --- | --- | --- | --- |
| tags | list | `contains` | `{"tags": {"contains": "finance"}}` |

### 4.4 Time Fields

| Field Name | Data Type | Operator | Example |
| --- | --- | --- | --- |
| create\_time | str | `lt`, `gt`, `lte`, `gte` | `{"create_time": {"gte": "2025-12-10"}}` |
| update\_time | str | `lt`, `gt`, `lte`, `gte` | `{"update_time": {"lte": "2025-12-10"}}` |

## 5. Usage Examples

::note
**Tip**<br> The root node must be `and` or `or`, and combine a series of conditions; nested logical operators are not allowed;<br>
Specifying `user_id` in `filter` is not supported.
::

Use the following memory filters to meet common filtering needs without rebuilding filtering logic.

---

**Agent**

```json
# Filter memories related to any of the following agents
"filter" : {
    "or": [
        {"agent_id": "agent_123"},
        {"agent_id": "agent_456"}
    ]
}
```

**Meta Information**

```json
# Filter attributes in custom meta information info
"filter" : {
    "and": [
        {"business_type":"Travel"}, # Macro business category
        {"biz_id":"travel_001"}, # Core business identifier
        {"scene":"Payment"}, # Specific environment or interaction link where the message occurred
        {"custom_status":"v1"} # Custom status/mark
    ]
}
```

**Tags**

```json
# Filter memories containing specific tags
"filter" : {
    "and": [
        {"tags": {"contains": "Weather"}}
    ]
}
```

**Date Range**

```json
# Filter memories from December 2025
"filter" : {
    "and": [
        {"create_time": {"gt": "2025-12-01"}},
        {"create_time": {"lt": "2026-01-01"}}
    ]
}

# Filter memories updated recently
"filter" : {
    "and": [
        {"update_time": {"gt": "2025-12-10"}}
    ]
}
```

**Multi-dimensional**

```json
# Filter memories of a user with customer service assistant about bills in Q4
"filter" : {
    "and": [
        {"agent_id": "customer_service"},
        {"scene":"Bill"},
        {"create_time": {"gt": "2025-10-01"}},
        {"create_time": {"lt": "2026-01-01"}}
    ]
}
```
