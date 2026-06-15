---
title: 项目配置
desc: 了解项目、API Key、知识库关联和调用日志的关系，用于多项目管理、知识库绑定和配置排查。
---

如果你是从未登录的新用户，建议先根据你的使用场景完成首次调用：

| 使用场景 | 适合你做什么 |
| :--- | :--- |
| [在 Agent 中使用](/cn/memos_cloud/getting_started/agent_usage) | 按插件或 CLI 等方式，把 MemOS 接入个人 Agent，让你的 Agent 拥有记忆 |
| [在应用中集成](/cn/memos_cloud/getting_started/quick_start) | 使用 MemOS API / SDK，接入你开发的应用 |

登录后，MemOS 会自动创建一个默认项目，复制 API Key，即可在该项目中使用所有功能。如果你想了解：

- 项目与 API Key 的关系；
- 创建、切换、修改或删除项目；
- 在项目中使用知识库；
- 排查配置错误。

可继续阅读下文。



## 1. 项目与 API Key

项目是 MemOS 规定的记忆隔离空间。每个项目都拥有独立的 API Key，用于访问该项目下的所有记忆、消息和调用日志。

项目之间不可互通，A 项目的 API Key 无法访问 B 项目的任何资源。

::note

切换项目后，需要重新进入「接口密钥」页面复制该项目的 API Key。
::

![接口密钥页面](https://cdn.memtensor.com.cn/img/1781512123656_y385f1_compressed.png)



## 2. 管理项目

当你需要隔离不同应用、环境或业务空间时，可以在 [项目列表](https://memos-dashboard.openmem.net/cn/projects) 中可以创建、切换、修改和删除项目。

![项目列表页面](https://cdn.memtensor.com.cn/img/1781512257467_ika6g4_compressed.png)



### 2.1 创建或切换项目

- 在「项目列表」点击新建，填写项目名称和描述，即可创建新项目；
- 带有“当前项目”状态的项目，是控制台当前选中的项目；
- 点击“切换为该项目”后，接口密钥、知识库列表、调用日志都会切换到该项目范围。

![创建项目](https://cdn.memtensor.com.cn/img/1781512257467_ika6g4_compressed.png)



### 2.2 删除项目

- 当前项目不能直接删除，需要先切换到其他项目；
- 删除项目会清空该项目下的记忆、消息、知识库关联、API Key 和相关数据；
- 删除后不可恢复，只删除确认不再使用的测试项目或废弃项目。

![删除项目确认](https://cdn.memtensor.com.cn/img/1781512309804_1plly3_compressed.png)



## 3. 关联知识库到项目

如果你的 应用 / Agent 有需要参考的固定文档，可以创建并关联知识库到项目。一个项目可以关联多个知识库，一个知识库也可以关联多个项目。在 [知识库](https://memos-dashboard.openmem.net/cn/knowledgeBase) 页面中：

1. 点击「添加知识库」；
2. 选择「新建知识库」或「关联已有知识库」；
3. 进入知识库详情页，上传文档并等待处理完成；
4. 调用 `search/memory` 或 `chat` 时，传入 `knowledgebase_ids`，表示本次检索支持的知识库范围。

![知识库关联页面](https://cdn.memtensor.com.cn/img/1781512337899_cumfw9_compressed.png)

::warning
如果 `knowledgebase_ids` 对应的知识库没有关联到当前 API Key 所属项目，`search/memory` 会返回 `50123`。使用知识库时，需要先将项目关联到对应的知识库。
::

完整流程请查看 [知识库介绍](/cn/memos_cloud/features/knowledge_base)。



## 4. 常见配置错误

| 错误码 | 常见原因 | 处理方式 |
| :--- | :--- | :--- |
| `40000` | 请求参数名、类型或结构不符合接口要求 | 对照接口文档检查 JSON 字段，不要把对象、数组、字符串混传 |
| `40002` | 必填字段为空 | 检查 `user_id`、`messages`、`query`、`conversation_id` 等必填字段 |
| `40011` | `conversation_id` 过长 | 使用短 ID，例如订单号、会话号或内部 trace ID，不要放完整对话 |
| `40103` / `40132` | API Key 无效、过期或无权访问当前项目 | 检查 API Key 是否完整、有效，并确认它属于当前项目 |
| `40300` / `40304` | 接口调用次数或账户总调用次数耗尽 | 查看 [配额和限制](/cn/memos_cloud/support/limit)，或在控制台确认当前额度 |
| `40305` | 单次输入超过 Token 上限 | 缩短单次写入、检索或上传内容，不要一次传入过长历史对话或长文档 |
| `50123` | 知识库未关联当前项目 | 在知识库页面把该知识库关联到当前项目，或移除错误的 `knowledgebase_ids` |

更多错误码说明，请查看 [错误码](/cn/api_docs/help/error_codes)。
