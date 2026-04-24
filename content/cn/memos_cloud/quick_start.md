---
title: 快速开始
desc: 欢迎访问 MemOS 云平台，可参考本新手指南，快速接入记忆能力。
---

在使用大模型构建应用时，一个常见问题是：**如何让 AI 记住用户的长期偏好？**  
MemOS 提供了两个核心接口帮助你实现：

- `addMessage` —— 把原始对话交给我们，我们自动加工并存储记忆[（点此查看详细 API 文档）](/api_docs/core/add_message)
- `searchMemory` —— 在后续对话中召回记忆，让 AI 回答更贴近用户需求[（点此查看详细 API 文档）](/api_docs/core/search_memory)

![image.svg](https://cdn.memtensor.com.cn/img/1762434889291_h9co0h_compressed.png)


## 1.调用前准备

* 注册并登录 MemOS 云平台 [（点击注册）](https://memos-dashboard.openmem.net/quickstart)；

* 获取 API Key[（点击获取）](https://memos-dashboard.openmem.net/apikeys)；

* 准备一个可发送 HTTP 请求的环境，Python 或 cURL。


## 2.代码配置

### 2.1 安装 SDK
如果你选择 Python SDK，请确保已安装 Python 3.10+，然后执行：

```
pip install MemoryOS -U 
```

### 2.2 添加原始对话（addMessage）

::note
**会话 A：2025-06-10 发生**<br>

你只需要把`原始的对话记录`给到MemOS，MemOS 会`自动抽象加工并保存为记忆`
::

::code-snippet{name=add_message}
::

### 2.3 在会话中调用MemOS查询相关记忆（searchMemory）

::note
**会话 B：2025-9-28 发生**<br>

用户在一个新的会话中，提出让AI推荐国庆旅游地点和酒店，MemOS 会自动召回【事实记忆：曾去过哪里】【偏好记忆：订酒店的偏好】供AI参考，从而推荐更加个性化的旅游计划
::

::code-snippet{name=search_memory}
::

**输出的记忆列表如下：**<br>

```text
# 示例输出（为了方便理解此处做了简化，仅供参考）

# 偏好类型的记忆
{
  preference_detail_list [
    {
      "preference_type": "implicit_preference",  #隐性偏好
      "preference": "用户可能偏好性价比较高的酒店选择。",
      "reasoning": "七天酒店通常以经济实惠著称，而用户选择七天酒店可能表明其在住宿方面倾向于选择性价比较高的选项。虽然用户没有明确提到预算限制或具体酒店偏好，但在提供的选项中选择七天可能反映了对价格和实用性的重视。",
      "conversation_id": "0610"
    }
  ],

# 事实类型的记忆
  memory_detail_list [
    {
      "memory_key": "暑假广州旅游计划",
      "memory_value": "用户计划在暑假期间前往广州旅游，并选择了七天连锁酒店作为住宿选项。",
      "conversation_id": "0610",
      "tags": [
        "旅游",
        "广州",
        "住宿",
        "酒店"
      ]
    }
  ]
}
```

### 2.4 记忆拼装到Prompt示例

::note
**记忆拼装**<br>

使用召回的记忆需要一定的技巧，下面是拼装示例
::

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


## 3.下一步行动

现在你已经能够运行 MemOS，可以探索更多云平台功能：

* [**核心记忆操作**](/memos_cloud/mem_operations/add_message)：完整了解如何添加、检索与删除记忆；

* [**功能介绍**](/memos_cloud/features/basic/filters)：探索更多云平台功能，如：记忆过滤、多模态消息、知识库等；

* [**API 接口文档**](/api_docs/start/overview)：查看完整的 API 文档与调用示例。


## 4.更多资料

### 了解MemOS记忆生产流程

详细介绍【当一条消息进入系统时，它是如何被加工成记忆，并在未来对话中被有效使用的】，以帮助您更好地理解 MemOS 的记忆机制与优势。

::note
**深入理解**<br>
MemOS 的记忆机制可以理解为一条完整的「工作流」： 
你提交原始消息 → 对记忆进行加工生产 → 调度机制根据任务和上下文安排调用与存储，并可动态调整记忆形态 → 在需要时被召回相关记忆→ 同时由生命周期管理维持演化与更新。
::

- [记忆生产](/memos_cloud/introduction/mem_production)
- [记忆调度](/memos_cloud/introduction/mem_schedule)
- [记忆召回](/memos_cloud/introduction/mem_recall)
- [记忆生命周期管理](/memos_cloud/introduction/mem_lifecycle)

### 使用MemOS进行实战

MemOS 提供了丰富的项目示例，根据您的具体项目可参考以下资料：

- [让理财助手读懂客户行为背后的偏好](/usecase/financial_assistant)
  - 在智能投顾场景里，用户的点击、浏览、收藏和沟通，都是构建画像的行为轨迹。
  - MemOS 能把这些行为抽象成记忆，例如「风险偏好=保守」
  - 并在用户提问「我适合什么投资？」时直接发挥作用，让投顾建议更专业、更贴合实际。

- [构建拥有记忆的家庭生活助手](/usecase/home_assistant)
  - 家庭助手不只是回答即时问题，它还能记住你说过的待办、偏好和家庭信息。
  - 比如「周六带孩子去动物园」或「提醒时要先列要点」，MemOS 会把这些转成记忆
  - 在后续对话中自动发挥作用，让助手更贴近真实生活

- [有记忆的写作助手更好用](/usecase/writting_assistant)
  - 写作助手不仅要帮你生成内容，还要保持一致的语气和风格
  - 通过 MemOS，用户的写作偏好、常用信息、上下文指令都能被记住
  - 下次写总结或邮件时无需反复强调，实现连贯又个性化的创作体验。

- [MindDock 浏览器插件](https://alidocs.dingtalk.com/i/p/e3ZxX84Z5KM6X7dRZxX8v66wA7xaBG7d?dontjump=true)
  - MemOS-MindDock 为用户打造统一的跨平台 AI 记忆层。
  - 它自动记录、整理并注入个人信息与偏好，让所有 AI 都能持续、稳定地“认识你”。
 
- [Coze × MemOS 插件工具](/usecase/frameworks/coze_plugin)
  - 使用 Coze 平台上架的 MemOS 插件工具，在工作流中直接访问云服务接口，为您的 Agent 快速添加长期记忆功能。
    
- [Claude MCP](/usecase/frameworks/claude_mcp)
  - MemOS 提供了通过 MCP 与云平台交互的方式，在 Claude 客户端中直接访问云服务接口。
