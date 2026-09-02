---
title: 让客服 Agent 记住用户：用 MemOS 实现跨会话客服记忆
desc: 分离用户记忆、Agent Skill 与政策知识库，让客服 Agent 跨会话延续用户事项，并复用通用处理流程。
---

用户昨天在在线客服里反馈耳机故障，今天改用邮件追问进度，客服却又让他提供订单号、重新描述问题。对用户来说这是服务中断；系统侧的原因往往很简单：新会话没有拿到此前已经确认的信息。

客服 Agent 需要记住两类不同的内容：一类属于当前用户，例如订单、未完成事项和通知偏好；另一类属于 Agent，例如处理同类问题时可以复用的工具流程。售后政策则继续由知识库统一维护。

本文通过 Python 代码片段，展示如何把这三类信息组合成一套完整的客服记忆方案。

## 方案要点

- 用户事实和偏好写入用户记忆，使用稳定 `user_id` 跨会话召回。
- 每轮任务记录都提交给客服 Agent 的独立记忆，由 MemOS 判断是否生成或更新 Skill。
- 售后政策写入政策知识库，与 Agent Skill 一起从客服 Agent 视角检索。
- 生成回复前执行两路召回：一路读取用户事实和偏好，一路读取 Agent Skill 和政策。
- 当前会话历史由 Agent 自己维护，MemOS 负责跨会话记忆。

## 我们要构建什么

示例场景包含三个客服阶段：

```text
DAY 1 · 在线客服
customer_001 提交耳机换货请求，客服 Agent 查询订单、检查政策、创建工单，
并记录收货时间、地址和短信通知要求。

DAY 4 · 邮件工单
customer_001 使用新的 conversation_id 追问换货进度。

DAY 7 · 在线客服
customer_002 遇到相似的耳机杂音问题，客服 Agent 尝试复用此前形成的 Skill。
```

DAY 4 验证用户事实和偏好能否跨会话延续。DAY 7 换成另一位消费者，验证用户信息保持隔离的同时，客服 Agent 能否复用通用 Skill。

## 三类信息如何分工

这套方案把客服上下文分为三个范围：

1. **用户记忆**：保存订单、故障、工单状态、地址和通知偏好，只属于当前 `user_id`。
2. **Agent Skill**：保存客服 Agent 从完整任务轨迹中提炼的通用处理流程，属于稳定 `agent_id`。
3. **政策知识库**：保存退换货、保修、物流和发票等正式规则，由业务方统一维护。

三者的分工可以这样理解：政策知识库回答“按规定应该怎么处理”，用户记忆回答“这位消费者已经处理到哪一步”，Agent Skill 回答“完成这类任务通常需要执行哪些步骤”。

## 完整处理流程

一次客服请求经过以下链路：

```text
用户请求
  │
  ├─ Agent 从业务应用读取当前会话历史
  │
  ├─ 召回一：user_id → 用户事实、偏好
  │
  ├─ 召回二：agent_id → 通用 Skill + 政策知识库
  │
  ├─ 合并上下文并执行订单、工单、通知等业务工具
  │
  ├─ 大模型根据工具结果生成最终回复
  │
  ├─ 写入一：user_id → 事实、偏好
  │
  └─ 写入二：agent_id → 请求生成或更新 Skill
```

两次写入使用同一份任务记录，但通过 `allow_memory_view` 指定不同的记忆类型。用户视角不生成 Skill，Agent 视角不重复生成用户事实和偏好。

## 接入前准备

文章末尾提供了可直接运行的[完整 Demo](#完整-demo)。你可以展开代码块，一键复制全部内容并保存到本地验证。

你需要 MemOS API Key，以及 OpenAI 或 OpenAI 兼容的大模型接口。

在你的项目中准备 Python 环境并安装依赖：

```bash
python3 -m venv .venv
./.venv/bin/python -m pip install openai requests
```

在接入代码中配置以下参数：

```python
MEMOS_API_KEY = "YOUR_MEMOS_API_KEY"
OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"
MEMOS_BASE_URL = "YOUR_MEMOS_BASE_URL"
OPENAI_MODEL = "YOUR_MODEL_NAME"
OPENAI_BASE_URL = "YOUR_OPENAI_BASE_URL"
AGENT_ID = "YOUR_AGENT_ID"
```

`user_id` 应来自用户登录态或 CRM。`agent_id` 表示同一个客服 Agent，应在不同用户和会话之间保持稳定。

在控制台为当前项目开启「为 Agent 创建独立记忆」。该功能默认关闭；未开启时，`agent_id` 只能用于标记和过滤，不能作为独立主体写入或检索 Agent Skill。具体说明见[多 Agent 隔离](/cn/memos_cloud/introduction/isolation_filters#为-agent-创建独立记忆-new)。

## 第一步：准备政策知识库

初始化时创建一个政策知识库，上传售后政策文档，并等待文件处理完成：

```python
def create_policy_knowledge_base():
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {MEMOS_API_KEY}",
    }
    policy_kb_id = _create_kb(
        headers,
        "消费者售后政策知识库",
        "消费者退换货、保修、物流与发票政策",
    )
    _upload_file(
        headers,
        policy_kb_id,
        "consumer-after-sale-policy.md",
        POLICY_DOC_MD,
    )
    print("政策文档已上传，等待解析...")
    _wait_kb_ready(headers, policy_kb_id)
    print(f"政策知识库已就绪：{policy_kb_id}")
    return policy_kb_id
```

知识库 ID 直接来自创建接口的响应，随后传给客服助手：

```python
policy_kb_id = create_policy_knowledge_base()
assistant = CustomerServiceAssistant(policy_kb_id)
```

## 第二步：划分写入类型

用户与 Agent 使用不同的写入视图：

```python
USER_WRITE_VIEWS = ["detail_factual", "preference"]
AGENT_SKILL_WRITE_VIEWS = ["skill"]
USER_CONTEXT_VIEWS = ["detail_factual", "preference"]
AGENT_CONTEXT_VIEWS = ["detail_factual", "skill"]
```

这样，同一份任务记录可以写入两个记忆空间，又不会重复生成同类型的记忆。

### 写入用户事实和偏好

第一条 `/add/message` 只传 `user_id`：

```python
def add_user_memories(self, messages, user_id, conversation_id, channel):
    """第一次写入：只在用户视角生成事实与偏好。"""
    user_data = {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "info": {"channel": channel, "scene": "consumer_support"},
        "allow_memory_view": USER_WRITE_VIEWS,
        "messages": messages,
    }
    self._post_memory(user_data, "用户事实与偏好", timeout_seconds=120)
```

MemOS 根据对话内容判断是否形成事实或偏好。某轮对话没有表达稳定偏好时，可以只生成事实。

### 写入 Agent Skill

第二条 `/add/message` 只传 `agent_id`，并且只允许生成 Skill：

```python
def add_agent_skill(self, messages, conversation_id, channel):
    """第二次写入：只在 Agent 视角请求生成或更新 Skill。"""
    skill_data = {
        "agent_id": AGENT_ID,
        "conversation_id": conversation_id,
        "info": {"channel": channel, "scene": "consumer_support"},
        "allow_memory_view": AGENT_SKILL_WRITE_VIEWS,
        "custom_extract_prompt": {"skill": SKILL_EXTRACT_PROMPT},
        "messages": messages,
    }
    self._post_memory(skill_data, "Agent Skill", timeout_seconds=300)
```

每轮回答后都会执行这次写入。调用方只声明本次写入允许生成 Skill，不根据对话内容预判是否应该沉淀；MemOS 会结合任务轨迹和已有 Skill，自行决定生成、更新或跳过。

## 第三步：让 Skill 保持通用

Skill 抽取由 MemOS 完成。可以通过 `custom_extract_prompt.skill` 补充客服场景中的通用化要求：

- 以业务目标、触发条件、核心工具链和成功标准判断是否属于同一个 Skill。
- 相同流程优先合并已有 Skill，没有新的通用信息时不重复生成。
- 移除姓名、地址、用户 ID、订单号、工单号和具体日期。
- 把实例值替换为 `order_id`、`ticket_id`、`shipping_address` 等参数。
- 不把用户个人偏好或单次时间要求写成通用规则。
- 只保留工具结果能够证明的执行步骤。

MemOS 会结合已有 Skill 完成相似性判断和更新，调用方不需要管理 Skill ID 或实现合并逻辑。

## 第四步：执行两路召回

生成回复前，客服助手分别召回用户上下文，以及 Agent Skill 与政策知识。

### 召回用户事实和偏好

第一路以 `user_id` 作为主体，只检索当前用户的事实和偏好：

```python
context_data = {
    "query": query,
    "user_id": user_id,
    "conversation_id": conversation_id,
    "include_memory_view": USER_CONTEXT_VIEWS,
    "memory_limit_number": 9,
    "preference_limit_number": 6,
}
```

返回结果只包含当前用户的事实和偏好。

### 召回 Agent Skill 和政策

第二路以稳定的 `agent_id` 作为主体，并把政策知识库加入同一次检索：

```python
agent_data = {
    "query": f"处理当前客服请求所需的通用方法：{query}",
    "agent_id": AGENT_ID,
    "knowledgebase_ids": self.knowledgebase_ids,
    "include_memory_view": AGENT_CONTEXT_VIEWS,
    "memory_limit_number": 9,
}
```

这样，用户事实和偏好只在用户视角检索，通用 Skill 和正式政策一起作为客服 Agent 的处理依据。不同用户复用同一个 Agent Skill，政策口径也保持一致。

## 第五步：写回完整任务轨迹

每条写入消息通过 `role_id` 标明真实发言主体。用户消息使用 `user_id`，客服回复与工具调用使用 `agent_id`：

```python
memory_messages = [
    {"role": "user", "role_id": user_id, "content": query}
]

# 工具调用消息使用 role_id=AGENT_ID
# 工具结果通过 tool_call_id 与调用对应

memory_messages.append({
    "role": "assistant",
    "role_id": AGENT_ID,
    "content": reply,
})
```

客服 Agent 在业务应用中维护当前会话历史。写回 MemOS 时，用户请求、工具调用、工具结果和最终回复组成完整任务记录：

```text
user
→ assistant.tool_calls
→ tool
→ assistant
```

完整轨迹用于 Skill 提炼；用户事实和偏好则从同一份记录中生成。

## 第六步：验证记忆效果

接入完成后，按三个阶段验证读写与隔离是否符合预期：

1. DAY 1 完成换货任务后，确认用户事实和偏好写入 User Cube，同一任务记录提交给 Agent Cube 进行 Skill 判断。
2. DAY 4 使用新的 `conversation_id`，确认仍能通过 `customer_001` 召回此前订单、故障和通知要求。
3. DAY 7 使用 `customer_002`，确认不会获得第一位消费者的个人事实，但可以检索当前客服 Agent 的通用 Skill。

用户记忆、Agent Skill 和政策知识库各自保持清晰的边界后，客服 Agent 才能记住当前用户、遵循统一政策，并把已经完成的任务转化为下一次可以复用的处理能力。

## 完整 Demo

展开下面的代码块，点击右上角的复制按钮即可复制全部内容。将代码保存为 `app.py`，填写「Demo 配置」中的参数后运行。

<details class="not-prose my-5 rounded-md border border-default bg-muted/30 px-4 py-3">
  <summary class="cursor-pointer select-none text-sm font-medium text-highlighted">
    展开并复制完整 Python Demo
  </summary>
  <div class="mt-4">

```python
# -*- coding: utf-8 -*-
"""
MemOS 客服场景最佳实践：跨渠道记忆增强的消费者客服助手

场景：消费者售后客服，MemOS 作为记忆基础设施，为客服 Agent
提供三项能力：

1. 每轮分别请求写入用户事实/偏好与 Agent Skill，由 MemOS 判断实际沉淀内容
2. 售后政策放入政策知识库，与 Agent 记忆一起检索
3. 事实与偏好按 user_id 召回，Skill 从 Agent 视角跨用户召回

记忆种类只启用客服场景需要的三类：事实记忆、偏好记忆、技能记忆。
技能由 MemOS 从写回的任务执行轨迹（user → assistant.tool_calls → tool →
assistant）中自动提炼，异步生成，无需事先上传。

运行方式：
    pip install openai requests

    # 在下方「Demo 配置」中填写各项参数
    python app.py
"""

import base64
import sys
import time
from datetime import datetime

import requests

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

# ---------------------------------------------------------------------------
# Demo 配置
# ---------------------------------------------------------------------------

MEMOS_API_KEY = "YOUR_MEMOS_API_KEY"
OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"
MEMOS_BASE_URL = "https://memos.memtensor.cn/api/openmem/v1"
OPENAI_MODEL = "YOUR_MODEL_NAME"
OPENAI_BASE_URL = "YOUR_OPENAI_BASE_URL"
AGENT_ID = "YOUR_AGENT_ID"

# 用户与 Agent 分别写入不同记忆类型；检索仍拆成两路
USER_WRITE_VIEWS = ["detail_factual", "preference"]
AGENT_SKILL_WRITE_VIEWS = ["skill"]
USER_CONTEXT_VIEWS = ["detail_factual", "preference"]
AGENT_CONTEXT_VIEWS = ["detail_factual", "skill"]

SKILL_EXTRACT_PROMPT = """从完整的客服任务轨迹中提炼可跨用户复用的 Skill。

Skill 的唯一性由业务目标、触发条件、核心工具链和成功标准共同决定。
提炼前必须比较已有 Skill：
- 如果已有 Skill 覆盖相同目标、触发条件和核心工具链，将新信息合并到已有 Skill，
  不要创建重复 Skill。
- 如果本次轨迹没有提供新的通用步骤、判断分支或验证依据，不生成 Skill。
- 只有业务目标或核心处理流程实质不同，才创建新的 Skill。

Skill 内容必须通用化：
- 移除姓名、联系方式、地址、用户 ID、Agent ID、会话 ID、订单号、工单号和具体日期。
- 将实例值替换为 order_id、ticket_id、shipping_address 等参数。
- 不保留用户个人偏好，不把单个用户的时间要求或通知方式写成通用规则。
- 不复制具体政策结论；流程中只描述“查询并校验当前政策”。
- 只保留工具结果能够证明的步骤，不把模型建议或未执行操作写成已验证经验。

Skill 名称应稳定、简洁，并以问题类型和处理目标命名，不能包含用户或案例信息。
"""

# 相关性阈值：低于该值的记忆不进入 prompt，防止噪音干扰客服判断
RELATIVITY_THRESHOLD = 0.5

# ---------------------------------------------------------------------------
# 示例政策上传到政策知识库
# ---------------------------------------------------------------------------

POLICY_DOC_MD = """# 消费者售后政策（示例）

## 退换货
- 自签收次日起，未拆封且不影响二次销售的商品支持 7 天无理由退货。
- 商品出现性能故障，15 天内支持换货，换货双向免运费。
- 定制类商品不支持无理由退换。

## 保修
- 整机保修 12 个月，随机配件保修 6 个月。
- 保修期内非人为损坏免费维修，人为损坏收取成本费。

## 物流
- 默认顺丰速运，换货件发出后系统自动短信推送物流单号。
- 支持修改一次收货地址，需在换货件发出前完成。

## 发票
- 默认开具电子普通发票，订单完成后可在订单页自助申请。
"""


# ---------------------------------------------------------------------------
# 客服助手：记忆检索 -> 组装 prompt -> 生成回复 -> 写回记忆
# ---------------------------------------------------------------------------

class CustomerServiceAssistant:
    def __init__(self, policy_kb_id):
        self.openai_client = OpenAI(
            api_key=OPENAI_API_KEY,
            base_url=OPENAI_BASE_URL or None,
        )
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {MEMOS_API_KEY}",
        }
        self.knowledgebase_ids = [policy_kb_id]
        # 当前会话历史由 Agent 自己维护，不依赖 MemOS 的消息读取接口
        self.conversation_histories = {}

    # ---- MemOS 读写 ----

    def search_memory(self, query, user_id, conversation_id):
        """分别检索用户事实/偏好，以及 Agent Skill/政策知识。"""
        agent_data = {
            "query": f"处理当前客服请求所需的通用方法：{query}",
            "agent_id": AGENT_ID,
            "knowledgebase_ids": self.knowledgebase_ids,
            "include_memory_view": AGENT_CONTEXT_VIEWS,
            "memory_limit_number": 9,
        }
        agent_res = requests.post(
            f"{MEMOS_BASE_URL}/search/memory",
            headers=self.headers,
            json=agent_data,
        )
        agent_body = agent_res.json()
        if agent_body.get("code") == 0:
            agent_result = agent_body.get("data") or {}
            policy_memories = [
                item for item in agent_result.get("memory_detail_list", [])
                if item.get("relativity", 0) >= RELATIVITY_THRESHOLD
            ]
            skills = agent_result.get("skill_detail_list", [])
        else:
            print(f"  [MemOS] 检索 Agent Skill 与政策失败：{agent_body.get('message')}")
            policy_memories = []
            skills = []

        context_data = {
            "query": query,
            "user_id": user_id,
            "conversation_id": conversation_id,
            "include_memory_view": USER_CONTEXT_VIEWS,
            "memory_limit_number": 9,
            "preference_limit_number": 6,
        }
        context_res = requests.post(
            f"{MEMOS_BASE_URL}/search/memory",
            headers=self.headers,
            json=context_data,
        )
        context_body = context_res.json()
        if context_body.get("code") == 0:
            context_result = context_body.get("data", {})
        else:
            print(f"  [MemOS] 检索用户上下文失败：{context_body.get('message')}")
            context_result = {}

        user_memories = [
            m for m in context_result.get("memory_detail_list", [])
            if m.get("relativity", 0) >= RELATIVITY_THRESHOLD
        ]
        preferences = context_result.get("preference_detail_list", [])
        return [*user_memories, *policy_memories], preferences, skills

    def add_user_memories(self, messages, user_id, conversation_id, channel):
        """第一次写入：只在用户视角生成事实与偏好。"""
        user_data = {
            "user_id": user_id,
            "conversation_id": conversation_id,
            "info": {"channel": channel, "scene": "consumer_support"},
            "allow_memory_view": USER_WRITE_VIEWS,
            "messages": messages,
        }
        self._post_memory(user_data, "用户事实与偏好", timeout_seconds=120)

    def add_agent_skill(self, messages, conversation_id, channel):
        """第二次写入：只在 Agent 视角请求生成或更新 Skill。"""
        skill_data = {
            "agent_id": AGENT_ID,
            "conversation_id": conversation_id,
            "info": {"channel": channel, "scene": "consumer_support"},
            "allow_memory_view": AGENT_SKILL_WRITE_VIEWS,
            "custom_extract_prompt": {"skill": SKILL_EXTRACT_PROMPT},
            "messages": messages,
        }
        self._post_memory(skill_data, "Agent Skill", timeout_seconds=300)

    def _post_memory(self, data, label, timeout_seconds):
        res = requests.post(
            f"{MEMOS_BASE_URL}/add/message", headers=self.headers, json=data
        )
        body = res.json()
        if body.get("code") != 0:
            print(f"  [MemOS] 写入{label}失败：{body.get('message')}")
            return

        details = body.get("data") or {}
        if details.get("status") == "running" and details.get("task_id"):
            self._wait_for_task(details["task_id"], label, timeout_seconds)

    def _wait_for_task(self, task_id, label, timeout_seconds):
        """等待异步记忆任务完成。"""
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            time.sleep(2)
            res = requests.post(
                f"{MEMOS_BASE_URL}/get/status",
                headers=self.headers,
                json={"task_id": task_id},
            )
            body = res.json()
            if body.get("code") != 0:
                sys.exit(f"查询记忆任务失败：{body.get('message')}")
            status = (body.get("data") or {}).get("status")
            if status == "completed":
                print(f"  [MemOS] {label}写入完成")
                return
            if status in {"failed", "error", "cancelled", "canceled"}:
                sys.exit(f"记忆任务失败：{task_id} -> {status}")
        sys.exit(f"等待{label}任务超时：{task_id}")

    # ---- prompt 与生成 ----

    def build_system_prompt(self, channel, memories, preferences, skills):
        channel_name = {"webchat": "在线客服", "email": "邮件工单"}.get(channel, channel)

        memory_text = "\n".join(
            f"{i}. {m.get('memory_value')}" for i, m in enumerate(memories, 1)
        ) or "（暂无相关记忆）"
        preference_text = "\n".join(
            f"{i}. {p.get('preference')}" for i, p in enumerate(preferences, 1)
        ) or "（暂无偏好记录）"
        # 仅注入有结构化内容的 Skill；匹配成功但内容未下发的 Skill 不进入 prompt
        valid_skills = [
            s for s in skills
            if isinstance(s.get("skill_value"), dict) and s["skill_value"].get("name")
        ]
        skill_text = "\n".join(
            f"{i}. {s['skill_value']}" for i, s in enumerate(valid_skills, 1)
        ) or "（暂无匹配 Skill）"

        return f"""# Role
你是品牌官方客服助手，正在通过「{channel_name}」渠道服务消费者。
你的目标是结合检索到的记忆、偏好、售后政策与处理 Skill，给出准确、个性化、可执行的回答。

# 当前时间
{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

# 检索到的用户记忆、售后政策与 Agent Skill
<agent_memories>
{memory_text}
</agent_memories>

<preferences>
{preference_text}
</preferences>

<skills>
{skill_text}
</skills>

# 记忆使用规则
1. 区分「消费者原话」与「系统推测」，推测类信息仅作参考，权重低于消费者的直接陈述。
2. 确认记忆描述的主体是当前消费者，而非其他用户或历史案例，禁止张冠李戴。
3. 只使用与当前问题直接相关的记忆，关键词偶合但语境不同的记忆必须忽略。
4. 记忆与消费者当前输入冲突时，以当前输入为准。
5. 涉及政策、时效、金额的内容，以政策知识库内容为准。

# 输出要求
1. 直接回答问题，不向消费者提及「记忆」「检索」等内部实现。
2. 存在未完成事项时主动衔接进度，不要让消费者重复描述已反馈过的信息。
3. 回答语言与消费者的输入语言一致。"""

    def generate_reply(self, system_prompt, messages):
        response = self.openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "system", "content": system_prompt}, *messages],
            temperature=0.3,
            top_p=0.9,
        )
        return response.choices[0].message.content

    # ---- 主流程 ----

    def chat(self, query, user_id, conversation_id, channel, tool_steps=None):
        # 1. 从 Agent 本地状态读取当前会话历史
        history_key = (user_id, conversation_id)
        history = self.conversation_histories.get(history_key, [])

        # 2. 检索用户事实/偏好，并单独检索 Agent Skill/政策知识
        memories, preferences, skills = self.search_memory(
            query, user_id, conversation_id
        )
        self._print_retrieved(memories, preferences, skills)

        # 3. 组装当前任务轨迹，让模型基于工具结果生成最终回复
        llm_turn = [{"role": "user", "content": query}]
        memory_messages = [{"role": "user", "role_id": user_id, "content": query}]
        for step in tool_steps or []:
            tool_call = {
                "role": "assistant",
                "content": "",
                "tool_calls": [{
                    "id": step["id"],
                    "type": "function",
                    "function": {
                        "name": step["name"],
                        "arguments": step["arguments"],
                    },
                }],
            }
            tool_result = {
                "role": "tool",
                "tool_call_id": step["id"],
                "content": step["result"],
            }
            llm_turn.extend([tool_call, tool_result])
            memory_messages.extend([
                {**tool_call, "role_id": AGENT_ID},
                tool_result,
            ])

        system_prompt = self.build_system_prompt(channel, memories, preferences, skills)
        reply = self.generate_reply(system_prompt, [*history, *llm_turn])

        # 4. Agent 本地保存对话；MemOS 分别写入用户上下文与通用 Skill
        self.conversation_histories.setdefault(history_key, []).extend([
            {"role": "user", "content": query},
            {"role": "assistant", "content": reply},
        ])
        memory_messages.append({
            "role": "assistant",
            "role_id": AGENT_ID,
            "content": reply,
        })
        self.add_user_memories(memory_messages, user_id, conversation_id, channel)
        self.add_agent_skill(memory_messages, conversation_id, channel)
        return reply

    @staticmethod
    def _print_retrieved(memories, preferences, skills):
        print("  ---- MemOS Agent 记忆召回内容 ----")
        for m in memories:
            value = str(m.get("memory_value", "")).replace("\n", " ")
            print(f"  [记忆 {m.get('relativity', 0):.2f}] {value[:80]}")
        for p in preferences:
            print(f"  [偏好] {p.get('preference')}")
        for s in skills:
            value = s.get("skill_value") or {}
            label = value.get("name") or f"id={s.get('id')}"
            print(f"  [Skill {s.get('relativity', 0):.2f}] {label}")
            print(f"  [Skill 详情] {value}")
        print("  ------------------------")


# ---------------------------------------------------------------------------
# 初始化政策知识库
# ---------------------------------------------------------------------------

def _b64_md(text):
    encoded = base64.b64encode(text.encode("utf-8")).decode("utf-8")
    return f"data:text/markdown;base64,{encoded}"


def _create_kb(headers, name, description):
    res = requests.post(
        f"{MEMOS_BASE_URL}/create/knowledgebase",
        headers=headers,
        json={"knowledgebase_name": name, "knowledgebase_description": description},
    )
    body = res.json()
    if body.get("code") != 0:
        sys.exit(f"创建知识库失败：{body.get('message')}")
    kb_id = body.get("data", {}).get("id") or body.get("data", {}).get("knowledgebase_id")
    if not kb_id:
        sys.exit(f"创建知识库成功，但接口未返回知识库 ID：{name}")
    print(f"知识库已创建：{name} -> {kb_id}")
    return kb_id


def _upload_file(headers, kb_id, name, text):
    res = requests.post(
        f"{MEMOS_BASE_URL}/add/knowledgebase-file",
        headers=headers,
        json={
            "knowledgebase_id": kb_id,
            "file": [{"type": "document", "name": name, "content": _b64_md(text)}],
        },
    )
    if res.json().get("code") != 0:
        sys.exit(f"上传文件失败：{res.json().get('message')}")


def _wait_kb_ready(headers, kb_id):
    for _ in range(40):
        time.sleep(3)
        res = requests.post(
            f"{MEMOS_BASE_URL}/get/knowledgebase-file",
            headers=headers,
            json={"knowledgebase_id": kb_id, "page": 1, "page_size": 20},
        )
        files = res.json().get("data", {}).get("file_detail_list", [])
        statuses = {str(item.get("status", "")).lower() for item in files}
        if files and statuses <= {"completed", "available", "failed"}:
            if "failed" in statuses:
                sys.exit(f"政策知识库 {kb_id} 文件解析失败")
            return
    sys.exit(f"等待政策知识库 {kb_id} 处理超时")


def create_policy_knowledge_base():
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {MEMOS_API_KEY}",
    }
    policy_kb_id = _create_kb(
        headers,
        "消费者售后政策知识库",
        "消费者退换货、保修、物流与发票政策",
    )
    _upload_file(
        headers,
        policy_kb_id,
        "consumer-after-sale-policy.md",
        POLICY_DOC_MD,
    )
    print("政策文档已上传，等待解析...")
    _wait_kb_ready(headers, policy_kb_id)
    print(f"政策知识库已就绪：{policy_kb_id}")
    return policy_kb_id


# ---------------------------------------------------------------------------
# 演示场景：用户上下文隔离与 Agent Skill 跨用户复用
# ---------------------------------------------------------------------------

CUSTOMER_ID = "customer_001"    # 生产环境中应来自登录态的稳定用户 ID
CUSTOMER_ID_2 = "customer_002"  # 第二位消费者，用于验证 Skill 复用与用户隔离


def run_demo():
    policy_kb_id = create_policy_knowledge_base()
    assistant = CustomerServiceAssistant(policy_kb_id)

    print("=" * 64)
    print("DAY 1 · 在线客服渠道：消费者反馈耳机杂音要求换货，并说明时间与通知偏好")
    print("=" * 64)
    chat_conv = "conv_chat_0821"

    q1 = ("你好，我 8 月 20 日签收的订单 20260820-88，里面的降噪耳机左耳一直有"
          "电流声，杂音很明显，我想换货。")
    print(f"\n[消费者] {q1}")
    # 客服 Agent 在业务系统中的实际办理过程（订单、工单、通知系统），
    # 随对话一起写回 MemOS，作为技能自动提炼的任务轨迹素材
    tool_steps = [
        {"id": "call_1", "name": "query_order",
         "arguments": '{"order_id": "20260820-88"}',
         "result": '{"order_id": "20260820-88", "product": "降噪耳机", "sign_date": "2026-08-20", "status": "已签收"}'},
        {"id": "call_2", "name": "check_exchange_policy",
         "arguments": '{"order_id": "20260820-88", "issue": "左耳电流声杂音"}',
         "result": '{"eligible": true, "policy": "性能故障 15 天内换货", "shipping": "双向免运费"}'},
        {"id": "call_3", "name": "create_exchange_ticket",
         "arguments": '{"order_id": "20260820-88", "reason": "左耳电流声杂音", "type": "质量问题换货"}',
         "result": '{"ticket_id": "EX20260821-03", "status": "已创建"}'},
        {"id": "call_4", "name": "update_ticket",
         "arguments": '{"ticket_id": "EX20260821-03", "address": "上海市浦东新区世纪大道 100 号", "deliver_before": "本周五", "notify": "sms"}',
         "result": '{"ticket_id": "EX20260821-03", "updated": true}'},
        {"id": "call_5", "name": "schedule_notification",
         "arguments": '{"ticket_id": "EX20260821-03", "channel": "sms", "events": ["已发出", "派送中"]}',
         "result": '{"scheduled": true, "channel": "sms"}'},
    ]
    print(f"[客服助手] {assistant.chat(q1, CUSTOMER_ID, chat_conv, 'webchat', tool_steps=tool_steps)}")

    q2 = ("对了，我下周要出差，换的耳机最好这周五前寄到我公司地址："
          "上海市浦东新区世纪大道 100 号。进度发短信告诉我就行。")
    print(f"\n[消费者] {q2}")
    print(f"[客服助手] {assistant.chat(q2, CUSTOMER_ID, chat_conv, 'webchat')}")

    print()
    print("=" * 64)
    print("DAY 4 · 邮件工单渠道：同一消费者追问进度（新会话、不同渠道）")
    print("=" * 64)
    mail_conv = "conv_mail_0824"

    q3 = "你好，我之前反馈的耳机换货，现在进行到哪一步了？"
    print(f"\n[消费者] {q3}")
    print(f"[客服助手] {assistant.chat(q3, CUSTOMER_ID, mail_conv, 'email')}")

    print()
    print("=" * 64)
    print("DAY 7 · 在线客服渠道：另一位消费者遇到同类问题（Agent Skill 复用）")
    print("=" * 64)
    conv_2 = "conv_chat_0828"

    q4 = "你好，我刚买的降噪耳机有杂音，滋滋的电流声，怎么办？"
    print(f"\n[消费者] {q4}")
    print(f"[客服助手] {assistant.chat(q4, CUSTOMER_ID_2, conv_2, 'webchat')}")

    print()
    print("演示结束，三个观察点：")
    print("1. 用户 Cube 只生成事实与偏好，Agent Cube 只生成 Skill。")
    print("2. DAY 4 从 customer_001 的用户记忆中召回事实与偏好。")
    print("3. DAY 7 不应看到 customer_001 的事实与偏好，但可以召回")
    print(f"   {AGENT_ID} 已通用化的 Skill。")


if __name__ == "__main__":
    config = {
        "MEMOS_API_KEY": MEMOS_API_KEY,
        "OPENAI_API_KEY": OPENAI_API_KEY,
        "MEMOS_BASE_URL": MEMOS_BASE_URL,
        "OPENAI_MODEL": OPENAI_MODEL,
        "OPENAI_BASE_URL": OPENAI_BASE_URL,
        "AGENT_ID": AGENT_ID,
    }
    missing = [name for name, value in config.items() if not value or value.startswith("YOUR_")]
    if missing:
        sys.exit(f"请先在文件顶部配置：{', '.join(missing)}")
    if OpenAI is None:
        sys.exit("请先安装 openai：pip install openai")
    run_demo()
```

  </div>
</details>
