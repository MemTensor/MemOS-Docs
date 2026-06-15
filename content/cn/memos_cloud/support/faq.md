---
title: 云服务 FAQs
desc: 排查使用 MemOS Cloud 时常见的账号、项目、API Key、额度、知识库和接口调用问题。
---

这篇页面回答 MemOS Cloud 使用过程中的常见问题。如果你想了解 MemOS 和 RAG、开源方案、私有化部署或记忆调度的关系，请查看 [常见问题](/cn/memos_cloud/introduction/faq)。

## 新用户应该先看哪篇文档？

如果你还没有登录过控制台，先按使用场景选择：

- 想让 Claude Code、Cursor 等 Agent 工具帮你接入，先看 [在 Agent 中使用](/cn/memos_cloud/getting_started/agent_usage)。
- 想自己在应用里调用 Cloud API，先看 [在应用中集成](/cn/memos_cloud/getting_started/quick_start)。

[项目配置](/cn/api_docs/start/configuration) 更适合在你需要管理多个项目、修改项目、删除项目，或理解知识库如何绑定到项目时阅读。

## API Key 和项目是什么关系？

每个项目都有自己的 API Key。使用某个 API Key 调用接口时，只能访问这个项目下的记忆、消息、知识库和配置。

如果出现“控制台看得到，但 API 查不到”的情况，先确认：

- 当前控制台项目是否和 API Key 所属项目一致。
- 请求中使用的是不是同一个 `user_id`。
- 检索时是否传了过窄的 `filter`、`knowledgebase_ids`，或过高的 `relativity`。

## 认证或权限错误怎么排查？

先检查请求头：

```text
Authorization: Token YOUR_API_KEY
```

常见问题包括：

- 漏传 `Authorization`。
- 少了 `Token` 前缀。
- API Key 复制不完整。
- API Key 属于另一个项目。
- API Key 已失效，或没有当前资源权限。

如果返回 `40100`、`40130`、`40132`，先回到 [项目配置](/cn/api_docs/start/configuration) 检查 API Key 和项目。

## 为什么 Search Memory 或 Chat 没有召回知识库内容？

先确认知识库是否已经绑定到当前项目，并且文件已经完成处理。调用接口时还需要注意：

- 不传 `knowledgebase_ids` 时，默认不检索知识库。
- 传 `knowledgebase_ids` 时，确认 ID 属于当前项目可访问的知识库。
- 如果设置了 `filter` 或较高的 `relativity`，可能会过滤掉本来相关的内容。

知识库的上传、绑定和处理状态说明，请查看 [知识库](/cn/memos_cloud/features/knowledge_base)。

## 遇到额度或限流错误怎么办？

先判断是哪类限制：

- 单次输入或输出过长：减少本次输入、历史上下文或期望输出。
- 调用次数达到上限：等待额度恢复，或按文档申请更多额度。
- 并发或短时间请求过多：降低请求频率，避免重试风暴。

具体额度说明请查看 [配额与限制](/cn/memos_cloud/support/limit)。

## 写入成功后，为什么马上检索不到？

记忆写入后需要经过抽取、加工和索引。刚写入后立刻检索，可能还没有完成处理。

建议先确认：

- 写入和检索使用的是同一个 `user_id`。
- 没有使用过窄的 `conversation_id`、`filter` 或 `knowledgebase_ids`。
- 如果是异步写入，等任务完成后再检索。

## Delete Memory 删除失败怎么办？

删除单条记忆时，优先使用 `memory_ids`。不要把 `conversation_id`、`user_id` 或知识库 ID 当成 `memory_id` 使用。

如果需要删除某个用户在当前项目下的全部记忆，才传 `user_id`。这是高风险操作，执行前需要确认 API Key、项目和用户 ID 都正确。

## 控制台和 API 的数据范围为什么不一致？

控制台和 API 都按项目隔离数据。出现范围不一致时，通常是因为：

- 控制台当前选中的项目和 API Key 所属项目不同。
- API 请求使用了另一个 `user_id`。
- 接口里传了额外过滤条件。
- 知识库没有授权给当前项目。

如果接口返回具体 `code`，可以查看 [错误码](/cn/api_docs/help/error_codes)。
