---
title: 多用户 / 多 Agent 隔离
desc: 理解 MemOS Cloud 如何区分不同用户、不同 Agent、不同会话和共享知识。
---

如果你的产品同时被多个用户、Agent、项目或业务场景使用，记忆需要有清楚的边界。

- 项目边界划分了不同产品或业务空间；
- 用户边界划分了同一项目下，不同用户的个人记忆；
- Agent / 应用边界划分了同一用户在多个 Agent / 应用中产生的不同记忆；
- 会话上下文标记每条记忆来自哪一次对话或任务；
- 项目中共享的知识可以放入知识库或公共记忆，供有权限的用户使用。



## 1. 项目边界：创建项目并使用 API Key

如果你还未注册云服务，可以先登录 [MemOS 控制台](https://memos-dashboard.openmem.net/quickstart)，新用户会有一个默认项目；如果你需要隔离不同的产品或业务空间，请在控制台创建新项目。

每个项目都有自己的 API Key 列表，启用项目时，传入对应的 API Key，即可使用该项目下的记忆内容。前往 [API Key 页面](https://memos-dashboard.openmem.net/apikeys)，快速获取接口密钥。

::note

关于项目创建、切换和接口密钥管理，详见 [项目配置](/cn/api_docs/start/configuration)。

::



## 2. 不同用户记忆：使用不同的 `user_id`

每个用户都需要对应唯一的 `user_id`，同一个用户在不同的入口或应用中，可以继续使用相同的 `user_id`，这样 MemOS 才能形成连续的长期记忆。

写入用户 A 的记忆：

```json
{
  "user_id": "user_a",
  "messages": [
    { "role": "user", "content": "我喜欢吃辣。" }
  ]
}
```

检索用户 B 的记忆：

```json
{
  "user_id": "user_b",
  "query": "帮我推荐酒店"
}
```

这次检索只会在用户 B 的个人记忆中查找，不会检索到用户 A 的记忆。即使两个用户来自同一个项目，与同一个 Agent 对话，使用不同的 `user_id` 时，记忆边界依旧保持清晰。



## 3. 多 Agent 隔离：使用 `agent_id`

如果同一个用户使用多个 Agent，例如客服助手、健康助手、代码助手，你需要为不同 Agent 设置不同的 `agent_id`。

添加与健康助手的对话消息时，传入`"agent_id": "health_assistant"`：

```json
{
  "user_id": "user_123",
  "agent_id": "health_assistant",
  "messages": [
    { "role": "user", "content": "我今天跑了 5 公里，膝盖有点酸。" }
  ]
}
```

检索记忆时，使用`filter`过滤对应 Agent 的记忆内容：

```json
{
  "user_id": "user_123",
  "query": "根据我最近的运动情况给些建议",
  "filter": {
    "and": [
      { "agent_id": "health_assistant" }
    ]
  }
}
```

这样做的好处是：用户的长期记忆仍然属于同一个人，不会被拆散；同时，不同 Agent 产生的记忆也可以在检索时按需筛选。

::note

更多记忆过滤的方法，详细见[记忆过滤器（filter）](http://127.0.0.1:3010/memos_cloud/features/filters)。

::



## 4. 当前会话：使用 `conversation_id`

为了让 MemOS 更好地理解上下文内容，添加用户消息时需要传入会话标识 `conversation_id`。它表示这条消息属于哪一次对话或任务。

```json
{
  "user_id": "user_123",
  "conversation_id": "order_refund_001",
  "messages": [
    { "role": "user", "content": "我想咨询退款进度。" },
    {"role": "assistant", "content": "退款仍在处理中，预计24小时内到账。"}
  ]
}
```

检索记忆时，`conversation_id` 不是强制过滤条件。传入它可以明确当前所在会话，让本会话相关记忆获得更高权重；不传时，系统仍会在该用户的历史记忆中检索。



## 5. 共享知识：放入知识库或公共记忆

不是所有内容都应该写入某个用户的个人记忆，项目文档、制度、产品手册、SOP 等公共知识，更适合放入知识库或公共记忆。

### **知识库**

对于项目文档、制度和产品手册，通常需要创建知识库并上传文档（完整操作见 [知识库](/cn/memos_cloud/features/knowledge_base)）；检索时，在用户记忆之外传入 `knowledgebase_ids`，让回答同时参考项目级知识。

```json
{
  "user_id": "user_123",
  "query": "结合我的情况和公司制度，判断这笔费用能不能报销",
  "knowledgebase_ids": ["kb_finance_policy"]
}
```

### **公共记忆**

公共记忆适合保存项目公告、团队经验、通用规则等轻量信息。如果一条消息需要被项目下所有用户共享，可以在写入时开启 `allow_public`，让它进入项目级公共记忆。

```json
{
  "user_id": "user_123",
  "allow_public": true,
  "messages": [
    { "role": "user", "content": "本季度报销截止时间是 6 月 25 日。" }
  ]
}
```

检索记忆时，用户个人记忆与公共记忆会被共同检索并召回相关内容。
