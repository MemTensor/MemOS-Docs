---
title: 记忆种类
desc: 解释 MemOS 生成并使用的不同种类的记忆。
---

MemOS 会生成并使用不同种类的记忆，这些记忆在后续召回时承担的作用不同：有的用于确认事件，有的用于判断偏好，有的用于指导 Agent 任务怎么做，有的用于补充知识。区分记忆种类，可以在检索时返回更相关的内容，为模型提供更准确的上下文。



## 1. 事实记忆

事实记忆描述相对客观的信息，通常来自用户明确说过的内容、行为事件、文件或反馈。

常见例子：

- 用户住在上海。
- 用户的设备是 MacBook Pro 13 寸 Intel 版本。

事实记忆适合回答“用户是谁”“用户做过什么”“用户现在处于什么状态”“某件事是否发生过”等问题。

::note

记忆可能随时间变化，MemOS 会结合 [时间感知](/cn/memos_cloud/introduction/time_awareness) 和 [记忆生命周期管理](/cn/memos_cloud/introduction/mem_lifecycle) 处理这类变化。

::



## 2. 偏好记忆

偏好记忆描述用户长期或阶段性的倾向，既可以来自用户明确表达，也可以来自行为的总结或推断。

常见例子：

- 用户喜欢简洁直接的回答风格。
- 用户规划旅行时偏好文化景点，不喜欢购物商场。
- 用户买宠物食品时需要避开鸡肉口味。

偏好记忆适合用于推荐、生成、排序和个性化决策。它不只是回答“用户说过什么”，而是帮助 Agent 判断“怎样做更符合这个用户”。



## 3. 技能 Skills

Skills 记录“任务怎么做”。MemOS 从历史消息中自动提炼技能，也可以直接上传已有技能包到知识库。旅行规划、报销审核、客户问题排查这类有稳定步骤的任务，都适合沉淀为技能，详见 [记忆自进化](/cn/memos_cloud/features/self-evolving)。



## 4. 工具记忆

工具记忆记录的是“工具怎么用”。它会从 Tool Schema、工具调用参数、工具返回结果和调用轨迹中沉淀经验，帮助 Agent 更稳定地选择工具、填写参数和使用返回结果，详见 [工具记忆](/cn/memos_cloud/features/tool_calling)。



## 5. 知识库记忆

知识库记忆来自项目级文档、制度、手册、FAQ、流程文件或 Skill 文件。它不属于某个用户的个人历史，更适合被多个用户或 Agent 共享。

常见例子：

- 公司财务报销制度。
- 产品使用手册。
- 售后退换货政策。

知识库记忆可以和用户记忆一起参与召回。员工询问【内网代理打不开了，我该重新装哪个版本？】时，知识库提供【安装说明】，用户事实记忆补充【这个员工的设备是 Intel 版本 MacBook Pro】，两者结合后回答会更准确，详见 [知识库](/cn/memos_cloud/features/knowledge_base)。



## 6. 如何生成并使用

### 生成记忆

当前，MemOS 默认生成所有类型的记忆。

- 事实、偏好、技能记忆在添加消息后默认触发生成
- 工具记忆需要在添加消息时传入`"role":"tool"`的工具调用信息
- 知识库记忆需要创建知识库并上传文档。



### 使用记忆

检索记忆时，按照你需要的记忆种类，控制以下参数：

- `include_preference`：根据查询的内容智能召回用户的偏好记忆；
- `include_skill`：根据查询的内容智能召回用户的技能记忆；
- `include_tool_memory`：根据查询的内容智能召回用户的工具记忆；
- `knowledgebaese_ids`：指定可以检索指定的知识库范围。



::note

需要查看完整字段、请求格式和响应格式，详见 [Search Memory 接口文档](http://127.0.0.1:3010/api_docs/core/search_memory)。

::



## 7. 直接开始使用

::card-group
  :::card
  ---
  icon: i-ri-message-3-line
  title: Add Message
  to: /cn/memos_cloud/mem_operations/add_message
  ---
  写入用户对话、文件和工具调用轨迹
  :::

  :::card
  ---
  icon: i-ri-search-2-line
  title: Search Memory
  to: /cn/memos_cloud/mem_operations/search_memory
  ---
  检索不同种类的记忆
  :::
::
