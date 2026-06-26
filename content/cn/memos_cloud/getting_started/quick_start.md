---
title: 在应用中集成
desc: 配置 MemOS 云服务账户，在 5 分钟内创建你的第一条记忆。
---


## 使用 MemOS Skill 为 AI 应用快速集成 MemOS Cloud （推荐）

若你正在使用 Claude Code、Cursor 等 Agent 工具开发自己的 AI 应用，可直接将以下提示词复制并发送给你的工具：

<details class="not-prose my-5 rounded-md border border-default bg-muted/30 px-4 py-3">
  <summary class="cursor-pointer select-none text-sm font-medium text-highlighted">
    展开查看 Skill 配置提示词
  </summary>
  <div class="mt-4">

```text
帮我为本项目接入 MemOS Cloud，为我的 Agent 产品添加长期记忆能力。

请按以下步骤操作：

1. 安装 MemOS Skill（如已安装则跳过）：
   npx skills add https://github.com/MemTensor/MemOS-Cloud-Skill --skill memos-cloud -g -y
   根据当前 Agent 环境自动填充 --agent 参数。

2. 读取该 Skill 安装路径下的 SKILL.md，严格按照其中的指令顺序执行。

3. 结合本项目的实际技术栈和架构，生成完整的 MemOS Cloud 集成代码。
```

  </div>
</details>

你的 Agent 工具会自动安装并使用 MemOS Skill，并为你的 AI 应用集成 MemOS Cloud。

## 手动接入

你开发 AI 应用时接入 MemOS 的完整流程，如下图所示，MemOS 提供了两个核心接口[（查看 API 文档）](/api_docs/core/add_message)

- `addMessage` ：把原始对话交给我们，我们自动加工并存储记忆；
- `searchMemory` ：在后续对话中召回记忆，让 AI 回答更贴近用户需求。

![image.svg](https://cdn.memtensor.com.cn/img/1762434889291_h9co0h_compressed.png)



### 1. 调用前准备

- 注册并登录 MemOS 云平台 [（点击注册）](https://memos-dashboard.openmem.net/quickstart)；
- 获取 API Key [（点击获取）](https://memos-dashboard.openmem.net/apikeys)；
- 准备一个可发送 HTTP 请求的环境，Python 或 cURL。



### 2. 创建记忆

::steps{level="4"}

#### 安装 SDK

如果你选择 Python SDK，请确保已安装 Python 3.10+，然后执行：

```bash
pip install MemoryOS -U
```

#### 设置接口密钥

::code-group
```python [Python (HTTP)]
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://memos.memtensor.cn/api/openmem/v1"
```

```python [Python (SDK)]
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")
```

```bash [Curl]
export MEMOS_API_KEY="YOUR_API_KEY"
export MEMOS_BASE_URL="https://memos.memtensor.cn/api/openmem/v1"
```
::

#### 添加原始信息

会话 A 发生在 2025-06-10，用户选择“七天”酒店（便捷酒店）作为暑期旅游住宿地点。如下所示，你只需要把原始的对话记录传给MemOS。

::code-group
```python [Python (HTTP)]
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

#### 查询相关记忆

会话 B 发生在 2025-09-28，用户提出让 AI 推荐国庆节旅游目的地与住宿。如下所示，将用户发言作为查询内容，检索 MemOS 记忆。

::code-group
```python [Python (HTTP)]
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
res = client.search_memory(
  query="我国庆想出去玩，帮我推荐个没去过的城市，以及没住过的酒店品牌",
  user_id="memos_user_123",
  conversation_id="0928"
)

print(res)
```

```bash [Curl]
curl "$MEMOS_BASE_URL/search/memory" \
  -H "Authorization: Token $MEMOS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "我国庆想出去玩，帮我推荐个没去过的城市，以及没住过的酒店品牌",
    "user_id": "memos_user_123",
    "conversation_id": "0928"
  }'
```
::

##### 输出

MemOS 会自动召回【事实记忆：曾去过哪里】【偏好记忆：订酒店的偏好】供 AI 参考，从而让 AI 推荐更加个性化的旅游计划。如下所示，为了方便理解此处做了简化。

```text
{
  preference_detail_list [
    {
      "preference_type": "implicit_preference",  #隐性偏好
      "preference": "用户可能偏好性价比较高的酒店选择。",
      "conversation_id": "0610"
    }
  ],
  memory_detail_list [
    {
      "memory_key": "暑假广州旅游计划",
      "memory_value": "用户计划在暑假期间前往广州旅游，并选择了七天连锁酒店作为住宿选项。",
      "conversation_id": "0610"
    }
  ]
}
```

#### 拼装到 Prompt

把召回的记忆拼装进你自己的模型 Prompt 中，让模型在回答时参考这些长期记忆。

<details class="not-prose my-5 rounded-md border border-default bg-muted/30 px-4 py-3">
  <summary class="cursor-pointer select-none text-sm font-medium text-highlighted">
    展开查看完整 Prompt 模板
  </summary>
  <div class="mt-4">

```text
# Role
你是一个拥有长期记忆能力的智能助手 (MemOS Assistant)。你的目标是结合检索到的记忆片段，为用户提供高度个性化、准确且逻辑严密的回答。

# Memory Data
以下是 MemOS 检索到的相关信息，分为“事实”和“偏好”。
- **事实 (Facts)**：可能包含用户属性、历史对话记录或第三方信息。
- **特别注意**：其中标记为 '[assistant观点]'、'[模型总结]' 的内容代表 **AI 过去的推断**，**并非**用户的原话。
- **偏好 (Preferences)**：用户对回答风格、格式或逻辑的显式/隐式要求。

<memories>
  <facts>
    -[2025-12-26 21:45] 用户计划在暑假期间前往广州旅游，并选择了七天连锁酒店作为住宿选项。
  </facts>

  <preferences>
    -[2025-12-26 21:45] [隐式偏好] 用户可能偏好性价比较高的酒店选择。
  </preferences>
</memories>

# Critical Protocol: Memory Safety
检索到的记忆可能包含 AI 自身的推测、无关噪音或主体错误。使用前请先判断：

1. 来源真值：区分“用户原话”与“AI 推测”，不要把 AI 过去的假设当作用户事实。
2. 主语归因：确认记忆描述的是用户本人，而不是第三方、案例或虚构角色。
3. 强相关性：只使用对当前问题有直接帮助的记忆。
4. 时效性：如果记忆与用户最新意图冲突，以当前问题为准。

# Instructions
1. 先筛选可用记忆，丢弃噪音和不可靠推断。
2. 仅使用通过筛选的记忆补充背景。
3. 直接回答用户问题，不要提及“记忆库”“检索”或系统内部术语。

# Original Query
我国庆想出去玩，帮我推荐个没去过的城市，以及没住过的酒店品牌
```

  </div>
</details>

::

### 3. 下一步

::card-group
  :::card
  ---
  icon: i-ri-checkbox-circle-line
  title: 核心操作
  to: /cn/memos_cloud/mem_operations/add_message
  ---
  查看更多核心记忆操作的详细用法
  :::

  :::card
  ---
  icon: i-ri-robot-line
  title: 在 Agent 中使用

  to: /cn/memos_cloud/getting_started/agent_usage
  ---
  接入 OpenClaw、Hermes 或其他 AI 工具
  :::

  :::card
  ---
  icon: i-ri-file-code-line
  title: API 参考

  to: /cn/api_docs/core/add_message
  ---
  查看完整接口文档
  :::
::
