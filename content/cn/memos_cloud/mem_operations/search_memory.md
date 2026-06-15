---
title: Search Memory
desc: 通过语义检索和过滤功能，MemOS 召回相关记忆。
---

## 1. 什么是检索记忆？

检索记忆是指 MemOS 在用户提出问题时，结合开发者预先定义的过滤条件，从记忆库中召回最相关、最重要的记忆内容。模型在生成回答时，会参考这些已召回的记忆，从而给出更加准确、贴切且符合用户上下文的回复。

::note
**&nbsp;为什么需要检索记忆？**

* 无需从头构建上下文，直接获取正确且可靠的记忆；
* 通过过滤条件等方式，确保召回的记忆始终与当前问题高度相关。
::



## 2. 关键参数

*   **查询内容（query）**：用户的提问内容，用于检索的自然语言问题或陈述，系统将基于语义匹配相关记忆。
*   **记忆过滤（filter）**：基于 JSON 的逻辑条件，用于过滤 agent、create_time、tags、info 等字段，缩小记忆检索的范围；也可以分别对用户记忆、公共记忆和知识库记忆设置过滤条件。
*   **相关性阈值（relativity）**：相关性是指召回的记忆与用户提问内容的语义匹配程度，相关性越高，该记忆与当前用户提问越相关。相关性阈值用于约束召回记忆的匹配程度，当前系统默认值为 0.45，低于该值的记忆将被过滤。




## 3. 工作原理

- **查询内容重写**：MemOS 会对输入的自然语言查询进行清理与语义增强，自动补全关键信息与检索意图，以提升后续检索的准确性。
- **记忆召回**
- **混合检索与排序**：系统基于重写后的查询生成嵌入向量，结合关键词检索与向量语义检索的混合策略召回候选记忆，对候选记忆进行相关性排序。
  - **记忆过滤与筛选**：基于逻辑条件与比较运算符对记忆进行结构化过滤，缩小记忆检索的范围；按开发者设定的相关性阈值筛选排序后的记忆，控制召回结果质量。
- **结果去重**：对召回的候选记忆进行跨源去重与语义聚合处理。
- **输出记忆**：最终结果根据设定的记忆条数上限返回，600ms 内响应并返回，用于后续推理与回答生成。

以上所有流程，仅需调用`search/memory`接口即可触发，无需您对用户的记忆手动操作。


## 4. 快速上手

::code-group

```python [Python (HTTP)]
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "query": "我国庆想出去玩，帮我推荐个没去过的城市，以及没住过的酒店品牌",
  "user_id": "memos_user_123",
  "conversation_id": "0928"
}

res = requests.post(
  f"{BASE_URL}/search/memory",
  headers={"Authorization": f"Token {API_KEY}"},
  json=data
)

print(res.json())
```

```python [Python (SDK)]
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

res = client.search_memory(
  query="我国庆想出去玩，帮我推荐个没去过的城市，以及没住过的酒店品牌",
  user_id="memos_user_123",
  conversation_id="0928"
)

print(res)
```

```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/search/memory \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "我国庆想出去玩，帮我推荐个没去过的城市，以及没住过的酒店品牌",
    "user_id": "memos_user_123",
    "conversation_id": "0928"
  }'
```

::

::note
请注意，`user_id` 为必填项，当前每次检索记忆必须指定单个用户。
::

需要查看完整字段、请求格式和响应格式？详见 [Search Memory 接口文档](/api_docs/core/search_memory)。

## 5. 带记忆的 Prompt 模版

召回的记忆可以直接添加到你开发 AI 应用的 Prompt 中。如下所示，MemOS 为你提供了实践参考。

<details class="not-prose my-5 rounded-md border border-default bg-muted/30 px-4 py-3">
  <summary class="cursor-pointer select-none text-sm font-medium text-highlighted">
    展开查看完整 Prompt 模板
  </summary>
  <div class="mt-4">


```text
# Role
你是一个拥有长期记忆能力的智能助手 (MemOS Assistant)。你的目标是结合检索到的记忆片段，为用户提供高度个性化、准确且逻辑严密的回答。

# System Context
- 当前时间: 2026-01-06 15:05 (请以此作为判断记忆时效性的基准)

# Memory Data
以下是 MemOS 检索到的相关信息，分为“事实”和“偏好”。
- **事实 (Facts)**：可能包含用户属性、历史对话记录或第三方信息。
- **特别注意**：其中标记为 '[assistant观点]'、'[模型总结]' 的内容代表 **AI 过去的推断**，**并非**用户的原话。
- **偏好 (Preferences)**：用户对回答风格、格式或逻辑的显式/隐式要求。

<memories>
  <facts>
    -[2025-12-26 21:45] 用户计划在暑假期间前往广州旅游，并选择了七天连锁酒店作为住宿选项。
    -[2025-12-26 14:26] 用户的名字是Grace。
  </facts>

  <preferences>
    -[2026-01-04 20:41] [显式偏好] 用户喜欢去南方旅游
    -[2025-12-26 21:45] [隐式偏好] 用户可能偏好性价比较高的酒店选择。
  </preferences>
</memories>

# Critical Protocol: Memory Safety (记忆安全协议)
检索到的记忆可能包含**AI 自身的推测**、**无关噪音**或**主体错误**。你必须严格执行以下**“四步判决”**，只要有一步不通过，就**丢弃**该条记忆：

1. **来源真值检查 (Source Verification)**：
   - **核心**：区分“用户原话”与“AI 推测”。
   - 如果记忆带有 '[assistant观点]' 等标签，这仅代表AI过去的**假设**，**不可**将其视为用户的绝对事实。
   - *反例*：记忆显示 '[assistant观点] 用户酷爱芒果'。如果用户没提，不要主动假设用户喜欢芒果，防止循环幻觉。
   - **原则：AI 的总结仅供参考，权重大幅低于用户的直接陈述。**

2. **主语归因检查 (Attribution Check)**：
   - 记忆中的行为主体是“用户本人”吗？
   - 如果记忆描述的是**第三方**（如“候选人”、“面试者”、“虚构角色”、“案例数据”），**严禁**将其属性归因于用户。

3. **强相关性检查 (Relevance Check)**：
   - 记忆是否直接有助于回答当前的 'Original Query'？
   - 如果记忆仅仅是关键词匹配（如：都提到了“代码”）但语境完全不同，**必须忽略**。

4. **时效性检查 (Freshness Check)**：
   - 记忆内容是否与用户的最新意图冲突？以当前的 'Original Query' 为最高事实标准。

# Instructions
1. **审视**：先阅读 '<facts>'，执行“四步判决”，剔除噪音和不可靠的 AI 观点。
2. **执行**：
   - 仅使用通过筛选的记忆补充背景。
   - 严格遵守 '<preferences>' 中的风格要求。
3. **输出**：直接回答问题，**严禁**提及“记忆库”、“检索”或“AI 观点”等系统内部术语。

# Original Query
我国庆想出去玩，帮我推荐个没去过的城市，以及没住过的酒店品牌

```

  </div>
</details>

## 6. 更多使用方法

### `conversation_id`：优先召回当前会话记忆

检索记忆时，你可以传入指定的`conversation_id`，MemOS 会优先召回与当前会话内容相关的记忆；不传则全局检索用户的长期记忆，适合在你需要直接检索用户全局画像时使用。

```python
data = {
    "user_id": "memos_user_123",
    "query": "帮我继续规划国庆旅行。",
    "conversation_id": "0928"
}
```

### `filter`：精确过滤检索范围

MemOS 支持通过 `filter` 按标签、时间、业务字段等条件缩小检索范围，也支持分别对用户记忆、知识库记忆和公共记忆设置过滤条件。

示例一：检索 2025 年内所有和“阅读”相关的对话记忆

```python
data = {
    "user_id": "memos_user_123",
    "query": "整理我今年和阅读相关的要点",
    "filter": {
        "and": [
            {"tags": {"contains": "阅读"}},
            {"create_time": {"gte": "2025-01-01"}},
            {"create_time": {"lte": "2025-12-31"}},
            {"scene": "chat"},
        ],
    },
}
```

示例二：对知识库、用户记忆、公共记忆分别过滤


```python
data = {
    "user_id": "memos_user_123",
    "query": "结合已有知识库中的制度、我的对话记录和项目公告，整理一份合规要点",
    "knowledgebase_ids": ["kb_xxx"],
    "filter": {
        "knowledgebase": {
            "and": [
                {"tags": {"contains": "制度"}},
                {"create_time": {"gte": "2025-01-01"}},
                {"create_time": {"lte": "2025-12-31"}},
            ]
        },
        "user": {
            "and": [
                {"agent_id": "compliance_assistant"},
                {"scene": "chat"},
                {"create_time": {"gte": "2025-06-01"}},
            ]
        },
        "public": {
            "and": [
                {"tags": {"contains": "公告"}},
            ]
        },
    },
}

```

  </div>
</details>

::note
更多过滤条件和嵌套写法，详见[记忆过滤](/memos_cloud/features/filters)。
::

### `relativity` / `memory_limit_number`：控制召回质量和数量

传入 `relativity` 可以提高召回相关性门槛；传入 `memory_limit_number` 可以限制返回条数，减少后续注入模型的 Token 消耗。

```python
data = {
    "user_id": "memos_user_123",
    "query": "为我规划5天的成都游。",
    "relativity": 0.8,
    "memory_limit_number": 9
}
```



## 7. 常见错误与排查

| 错误码 | 常见原因 | 处理方式 |
| --- | --- | --- |
| `40000` | 请求体结构错误，或字段类型不符合要求 | 检查 `query` 是否为字符串，`knowledgebase_ids` 是否为字符串数组 |
| `40002` | 缺少必填字段 | 检查 `user_id` 和 `query` 是否都已传入且非空 |
| `40011` | `conversation_id` 过长 | 使用短 ID，不要把完整问题或历史对话放进 `conversation_id` |
| `40012` | `relativity` 非法 | 传入 0 到 1 之间的数字 |
| `40305` | 单次输入超过 token 上限 | 缩短 `query`，不要把长文档直接放进检索查询 |
| `50123` | 知识库未关联当前项目 | 回到 [项目配置](/cn/api_docs/start/configuration) 确认知识库已关联到当前 API Key 所属项目 |
| `50005` | 搜索服务暂时不可用 | 稍后重试；如果持续出现，请联系支持 |



## 8. 更多功能

::card-group
  :::card
  ---
  icon: i-ri-tools-line
  title: 召回工具记忆

  to: /cn/memos_cloud/features/tool_calling
  ---
  添加工具调用信息， 召回工具记忆
  :::

  :::card
  ---
  icon: i-ri-book-read-line
  title: 召回技能

  to: /cn/memos_cloud/features/skill
  ---
  自动生成技能，召回可复用的 Skill 记忆
  :::

  :::card
  ---
  icon: i-ri-database-2-line
  title: 检索知识库

  to: /cn/memos_cloud/features/knowledge_base
  ---
  开启知识库，指定检索可访问的知识库范围。
  :::
::
