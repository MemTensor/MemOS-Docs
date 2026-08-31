---
title: 构建记忆增强型的智能客服助手
desc: 融合长期记忆与知识库，让客服 Agent 跨渠道记住每一位消费者：未完成事项自动衔接、偏好自动生效、政策口径一致、客服经验持续复用。
---

## 1. 概述

客服是 AI Agent 落地最密集的场景之一，也是「失忆」代价最高的场景。消费者在线上报了商品故障，三天后换个渠道追问进度，客服 Agent 却让他把订单号和问题再描述一遍。这类体验直接拉低满意度与一次解决率。

问题不在于模型能力。主流大模型的上下文窗口足以装下整场对话，但多数客服架构里，每个渠道、每个会话各自为政。对话记录分散在各自的工单系统中，Agent 生成回复时面对的仍是空白上下文。这是一个记忆架构问题，需要一层独立的记忆基础设施来解决。

MemOS 为客服 Agent 提供这层记忆能力。它跨渠道、跨会话记住消费者的交互历史、未完成事项与偏好，并与知识库中的售后政策联合检索。每一次回复都建立在完整背景之上。

### 1.1 客服场景的四个断点

渠道各自为政的客服架构，会在四个环节集中爆发问题：

1. **重复询问**：消费者换渠道或隔几天再来，被要求重复订单号、故障描述等已提供的信息。
2. **进度断裂**：换货、补发、投诉等未完成事项跨周期无人衔接，消费者追问时 Agent 无从查起。
3. **政策不一致**：售后政策存在多个版本，不同时间、不同坐席给出的答复互相矛盾。
4. **经验流失**：资深客服的处理经验留在个人脑子里，新坐席与新 Agent 无法复用。

### 1.2 知识与记忆的边界

落地的第一步是划清边界：什么进知识库，什么进记忆系统。两者在 MemOS 中统一管理、联合检索，但承载的内容不同。

| 维度 | 知识库 | 记忆系统 |
| --- | --- | --- |
| 内容性质 | 稳定、全员共享 | 动态、按消费者隔离 |
| 典型内容 | 售后政策、保修条款、物流规则 | 交互历史、未完成事项进度、偏好、处理经验 |
| 更新方式 | 业务方版本化维护 | 对话中自动沉淀、持续演化 |
| 错误代价 | 回答口径不一致 | 张冠李戴、误用他人信息 |

一句话概括：**知识库回答「按规定该怎么办」，记忆系统回答「这位消费者现在到哪一步了」。**

### 1.3 真实场景对比：跨渠道售后

以一次典型的换货售后为例，直观感受有无记忆层的差异：

```text
DAY 1 · 在线客服
消费者：我 8 月 20 日签收的订单 20260820-88，降噪耳机左耳有电流声，想换货。
消费者：换的耳机最好这周五前寄到公司地址，进度发短信就行。

DAY 4 · 邮件工单（同一消费者，新会话）
消费者：我之前反馈的耳机换货，现在进行到哪一步了？
```

无记忆层的客服 Agent：

```text
# 只能看到当前这封邮件，订单号、故障、地址、偏好全部丢失
❌ 客服助手：您好，请提供您的订单号，并描述一下遇到的问题，我来为您查询。
```

接入 MemOS 的客服 Agent：

```text
# 生成回复前，先检索到该消费者的跨渠道记忆与售后政策
检索到记忆：
1. 订单 20260820-88 的耳机换货工单处理中（DAY 1 在线客服渠道登记）
2. 消费者反馈降噪耳机左耳有明显电流声
3. 知识库：商品性能故障 15 天内支持换货，换货双向免运费
4. 偏好：换货件本周五前寄至公司地址，短信同步进度

✅ 客服助手：您好，您反馈的订单 20260820-88 耳机换货工单正在处理中。
换货件将于本周五前寄往您的公司地址，发出后会短信通知物流单号，请留意查收。
```

差异的本质：DAY 4 的 Agent 没有「重新接待」，而是「接着办理」。

### 1.4 为什么使用 MemOS？

1. **一个 user_id 贯通多渠道**

   渠道身份是路由问题，记忆身份是统一的。在线客服、邮件、电话都向同一个 user_id 读写记忆，消费者换渠道无需重启上下文。渠道本身记入 tags 与 info，用于审计与归因分析。

2. **知识与记忆联合检索**

   一次 searchMemory 调用同时召回个人记忆、偏好与知识库政策。Agent 既知道「这位消费者的换货单到哪了」，也知道「按规定该怎么办」。

3. **客服经验沉淀为 Skill**

   处理某类问题的标准流程可以沉淀为 Skill，由 MemOS 统一管理其沉淀、更新、召回与失效。新坐席、新 Agent 上线即可复用。

4. **权限隔离与审计**

   记忆默认按 user_id 严格隔离，脱敏后的客服经验可写入公共记忆库供全员检索。每次调用带渠道标签，调用日志可审计。

## 2. 搭建教程

本教程搭建一个跨渠道的消费者售后客服助手，覆盖 DAY 1 在线客服受理、DAY 4 邮件追问进度的完整链路，约 10 分钟跑通。

### 2.1 知识库与 Skill 准备（5min）

售后政策等稳定内容上传至知识库，换货处理流程作为 Skill 上传。两种方式任选其一：

- 方式一（推荐）：运行 Demo 自带的初始化命令，自动创建知识库并上传示例政策文档与 Skill：

```bash
python customer_service_demo.py --setup
# 命令输出知识库 ID 后配置：
export MEMOS_KB_ID="base****-****-****-****"
```

- 方式二：通过[控制台](https://memos-dashboard.openmem.net/cn/knowledgeBase/)手动创建知识库，上传时选择对应文件类型（文档 / 技能文件）。

上传后等待文件状态变为「可用」即可，存储、解析、分段、生成记忆全部由 MemOS 完成。

### 2.2 运行代码（5min）

以下代码示例基于 Python 运行环境进行展示。

#### 2.2.1 拷贝完整运行代码

```python
# -*- coding: utf-8 -*-
"""
MemOS 客服场景最佳实践 Demo：跨渠道记忆增强的消费者客服助手

场景：某智能硬件品牌的消费者售后客服。消费者通过「在线客服」「邮件工单」两个
渠道咨询售后问题，MemOS 作为记忆基础设施，为客服 Agent 提供三项能力：

1. 跨渠道、跨会话的用户记忆：未完成事项（换货工单）、消费者偏好自动延续
2. 知识库联合检索：售后政策等稳定内容归入知识库，与个人记忆一起召回
3. 客服 Skill 沉淀与召回：质量问题换货 SOP 作为 Skill 上传，指导 Agent 按标准流程处理
"""

import argparse
import base64
import os
import sys
import time
from datetime import datetime

import requests

try:
    from openai import OpenAI
except ImportError:  # 允许仅做 --setup 时不安装 openai
    OpenAI = None

# ---------------------------------------------------------------------------
# 环境配置
# ---------------------------------------------------------------------------

os.environ.setdefault("MEMOS_API_KEY", "mpg-xxx")   # 替换为你的 MemOS API Key
os.environ.setdefault("OPENAI_API_KEY", "sk-xxx")   # 替换为你的大模型 Key

MEMOS_BASE_URL = os.environ.get(
    "MEMOS_BASE_URL", "https://memos.memtensor.cn/api/openmem/v1"
)
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o")
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL")  # 兼容接口时填写
KNOWLEDGE_BASE_ID = os.environ.get("MEMOS_KB_ID", "")

# 相关性阈值：低于该值的记忆不进入 prompt，防止噪音干扰客服判断
RELATIVITY_THRESHOLD = 0.5

# ---------------------------------------------------------------------------
# 示例知识：售后政策文档（稳定内容，归入知识库）与换货 Skill（可复用流程）
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

EXCHANGE_SKILL_MD = """---
name: 质量问题换货处理
description: 消费者反馈商品性能故障、要求换货时的标准处理流程，覆盖核实、建单、取件与进度同步
---

## Procedure
1. 核对消费者身份与订单号，确认故障商品与故障现象
2. 引导消费者做一次简单排查（如重启、重置连接），排除使用问题
3. 确认属于质量问题后创建换货工单，记录期望收货时间与收货地址
4. 安排上门取件或引导寄回，告知换货双向免运费
5. 换货件发出后，按消费者偏好的渠道同步物流单号

## Experience
- 耳机类「杂音、电流声」问题，先引导重置蓝牙配对再判定故障
- 消费者提出明确时间要求时，在工单中标注并优先处理
"""


# ---------------------------------------------------------------------------
# 客服助手：记忆检索 -> 组装 prompt -> 生成回复 -> 写回记忆
# ---------------------------------------------------------------------------

class CustomerServiceAssistant:
    def __init__(self):
        if OpenAI is None:
            raise RuntimeError("请先安装 openai：pip install openai")
        self.openai_client = OpenAI(
            api_key=os.environ["OPENAI_API_KEY"],
            base_url=OPENAI_BASE_URL or None,
        )
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {os.environ['MEMOS_API_KEY']}",
        }
        self.knowledgebase_ids = [KNOWLEDGE_BASE_ID] if KNOWLEDGE_BASE_ID else []

    # ---- MemOS 读写 ----

    def search_memory(self, query, user_id, conversation_id):
        """检索个人记忆、偏好、知识库与 Skill，按相关性阈值过滤"""
        data = {
            "query": query,
            "user_id": user_id,
            "conversation_id": conversation_id,
            "knowledgebase_ids": self.knowledgebase_ids,
            "include_skill": True,
            "memory_limit_number": 9,
        }
        res = requests.post(
            f"{MEMOS_BASE_URL}/search/memory", headers=self.headers, json=data
        )
        body = res.json()
        if body.get("code") != 0:
            print(f"  [MemOS] 检索记忆失败：{body.get('message')}，本轮按无记忆处理")
            return [], [], []

        result = body.get("data", {})
        memories = [
            m for m in result.get("memory_detail_list", [])
            if m.get("relativity", 0) >= RELATIVITY_THRESHOLD
        ]
        preferences = result.get("preference_detail_list", [])
        skills = result.get("skill_detail_list", [])
        return memories, preferences, skills

    def add_message(self, messages, user_id, conversation_id, channel):
        """写回一轮对话。渠道记入 tags 与 info，便于审计与按渠道分析"""
        data = {
            "user_id": user_id,
            "conversation_id": conversation_id,
            "tags": [channel],
            "info": {"channel": channel, "scene": "consumer_support"},
            "messages": messages,
        }
        res = requests.post(
            f"{MEMOS_BASE_URL}/add/message", headers=self.headers, json=data
        )
        if res.json().get("code") != 0:
            # 写回失败不阻塞本轮回复
            print(f"  [MemOS] 写入记忆失败：{res.json().get('message')}")

    def get_message(self, user_id, conversation_id):
        """获取当前会话的近期消息"""
        data = {
            "user_id": user_id,
            "conversation_id": conversation_id,
            "message_limit_number": 10,
        }
        res = requests.post(
            f"{MEMOS_BASE_URL}/get/message", headers=self.headers, json=data
        )
        if res.json().get("code") == 0:
            return res.json().get("data", {}).get("message_detail_list", [])
        return []

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

# 检索到的信息
<memories>
{memory_text}
</memories>

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
5. 涉及政策、时效、金额的内容，以知识库内容为准。

# 输出要求
1. 直接回答问题，不向消费者提及「记忆」「检索」「知识库」等内部实现。
2. 存在未完成事项时主动衔接进度，不要让消费者重复描述已反馈过的信息。
3. 回答语言与消费者的输入语言一致。"""

    def generate_reply(self, system_prompt, history, query):
        messages = [{"role": "system", "content": system_prompt}, *history,
                    {"role": "user", "content": query}]
        response = self.openai_client.chat.completions.create(
            model=OPENAI_MODEL, messages=messages, temperature=0.3, top_p=0.9
        )
        return response.choices[0].message.content

    # ---- 主流程 ----

    def chat(self, query, user_id, conversation_id, channel):
        # 1. 拉取当前会话近期消息
        history = self.get_message(user_id, conversation_id)

        # 2. 检索跨渠道记忆、偏好、知识库与 Skill
        memories, preferences, skills = self.search_memory(
            query, user_id, conversation_id
        )
        self._print_retrieved(memories, preferences, skills)

        # 3. 组装 prompt 并生成回复
        system_prompt = self.build_system_prompt(channel, memories, preferences, skills)
        reply = self.generate_reply(system_prompt, history, query)

        # 4. 写回本轮对话，沉淀为长期记忆
        self.add_message(
            [{"role": "user", "content": query},
             {"role": "assistant", "content": reply}],
            user_id, conversation_id, channel,
        )
        return reply

    @staticmethod
    def _print_retrieved(memories, preferences, skills):
        print("  ---- MemOS 召回内容 ----")
        for m in memories:
            value = str(m.get("memory_value", "")).replace("\n", " ")
            print(f"  [记忆 {m.get('relativity', 0):.2f}] {value[:80]}")
        for p in preferences:
            print(f"  [偏好] {p.get('preference')}")
        for s in skills:
            value = s.get("skill_value") or {}
            label = value.get("name") or f"id={s.get('id')}"
            print(f"  [Skill {s.get('relativity', 0):.2f}] {label}")
        print("  ------------------------")


# ---------------------------------------------------------------------------
# 知识库初始化：创建知识库，上传政策文档与 Skill，等待处理完成
# ---------------------------------------------------------------------------

def _b64_md(text):
    encoded = base64.b64encode(text.encode("utf-8")).decode("utf-8")
    return f"data:text/markdown;base64,{encoded}"


def setup_knowledge_base():
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {os.environ['MEMOS_API_KEY']}",
    }

    res = requests.post(
        f"{MEMOS_BASE_URL}/create/knowledgebase",
        headers=headers,
        json={
            "knowledgebase_name": "消费者售后政策知识库",
            "knowledgebase_description": "消费者退换货、保修、物流与发票政策，以及客服处理 Skill",
        },
    )
    body = res.json()
    if body.get("code") != 0:
        sys.exit(f"创建知识库失败：{body.get('message')}")
    kb_id = body.get("data", {}).get("id") or body.get("data", {}).get("knowledgebase_id")
    print(f"知识库已创建：{kb_id}")

    res = requests.post(
        f"{MEMOS_BASE_URL}/add/knowledgebase-file",
        headers=headers,
        json={
            "knowledgebase_id": kb_id,
            "file": [
                {"type": "document", "name": "consumer-after-sale-policy.md",
                 "content": _b64_md(POLICY_DOC_MD)},
                {"type": "skill", "name": "quality-exchange-sop.md",
                 "content": _b64_md(EXCHANGE_SKILL_MD)},
            ],
        },
    )
    if res.json().get("code") != 0:
        sys.exit(f"上传文件失败：{res.json().get('message')}")
    print("政策文档与 Skill 已上传，等待解析...")

    for _ in range(40):  # 最长等待约 2 分钟
        time.sleep(3)
        res = requests.post(
            f"{MEMOS_BASE_URL}/get/knowledgebase-file",
            headers=headers,
            json={"knowledgebase_id": kb_id, "page": 1, "page_size": 20},
        )
        files = res.json().get("data", {}).get("file_detail_list", [])
        statuses = {str(f.get("status", "")).lower() for f in files}
        if files and statuses <= {"completed", "available", "failed"}:
            if "failed" in statuses:
                sys.exit("有文件解析失败，请在控制台查看详情")
            break
    else:
        sys.exit("等待文件解析超时，请稍后在控制台确认状态")

    print(f"知识库已就绪。请执行：export MEMOS_KB_ID=\"{kb_id}\"，然后运行演示。")


# ---------------------------------------------------------------------------
# 演示场景：同一消费者，跨「在线客服」与「邮件工单」两个渠道
# ---------------------------------------------------------------------------

CUSTOMER_ID = "customer_001"  # 生产环境中应来自登录态的稳定用户 ID


def run_demo():
    assistant = CustomerServiceAssistant()

    print("=" * 64)
    print("DAY 1 · 在线客服渠道：消费者反馈耳机杂音要求换货，并说明时间与通知偏好")
    print("=" * 64)
    chat_conv = "conv_chat_0821"

    q1 = ("你好，我 8 月 20 日签收的订单 20260820-88，里面的降噪耳机左耳一直有"
          "电流声，杂音很明显，我想换货。")
    print(f"\n[消费者] {q1}")
    print(f"[客服助手] {assistant.chat(q1, CUSTOMER_ID, chat_conv, 'webchat')}")

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
    print("演示结束：DAY 4 的回复应自动关联 DAY 1 的订单、故障商品、收货时间要求")
    print("与通知偏好，无需消费者重复描述。这就是跨渠道记忆带来的体验差异。")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MemOS 客服场景最佳实践 Demo")
    parser.add_argument("--setup", action="store_true",
                        help="创建知识库并上传示例政策文档与 Skill")
    args = parser.parse_args()

    if os.environ["MEMOS_API_KEY"] == "mpg-xxx":
        sys.exit("请先配置 MEMOS_API_KEY")

    if args.setup:
        setup_knowledge_base()
    else:
        if os.environ["OPENAI_API_KEY"] == "sk-xxx":
            sys.exit("请先配置 OPENAI_API_KEY")
        if not KNOWLEDGE_BASE_ID:
            sys.exit("请先运行 python customer_service_demo.py --setup 并配置 MEMOS_KB_ID")
        run_demo()
```

#### 2.2.2 初始化运行环境

```bash
pip install openai requests
```

#### 2.2.3 配置环境变量

登录[控制台](https://memos-dashboard.openmem.net/cn/apikeys/)复制 MemOS 密钥，大模型密钥可替换为任意 OpenAI 兼容接口：

```bash
export MEMOS_API_KEY="mpg-xxx"
export OPENAI_API_KEY="sk-xxx"
export MEMOS_KB_ID="<2.1 创建的知识库 ID>"
```

#### 2.2.4 执行代码

```bash
python customer_service_demo.py
```

### 2.3 演示效果

DAY 1 在线客服渠道，Agent 受理换货并记下消费者的时间要求与通知偏好。DAY 4 消费者改从邮件渠道追问进度，以下是 MemOS 实际召回的内容：

```text
DAY 4 · 邮件工单渠道（新会话、不同渠道、同一 user_id）

[消费者] 你好，我之前反馈的耳机换货，现在进行到哪一步了？
  ---- MemOS 召回内容 ----
  [记忆 0.75] 订单 20260820-88 的耳机换货正在处理中，换货件预计本周五寄达公司地址
  [记忆 0.75] 订单 20260820-88 的耳机问题属于 15 天质量问题换货范围
  [记忆 0.63] 消费者反馈降噪耳机左耳有明显电流声和杂音
  [记忆 0.61] 知识库：换货件发出前支持修改一次收货地址
  [偏好] 换货件本周五前寄至公司地址（上海市浦东新区世纪大道 100 号），短信接收进度通知
  [Skill 0.69] 质量问题换货处理
  ------------------------
[客服助手] 您好，您反馈的订单 20260820-88 耳机换货工单正在处理中：
换货件将于本周五前寄往上海市浦东新区世纪大道 100 号，发出后会短信通知物流单号，请留意查收。
```

新会话、新渠道，但订单号、故障描述、地址要求与通知偏好全部自动衔接，无需消费者重复描述。

### 2.4 代码说明

1. 在环境变量中配置 MemOS 密钥、大模型密钥与知识库 ID。
2. 实例化 `CustomerServiceAssistant`。
3. `run_demo()` 模拟两天、两个渠道的三轮对话。
4. 每轮对话由 `chat()` 执行固定闭环：
   - 调用 `get_message`，拉取当前会话近期消息；
   - 调用 `search_memory`，一次调用联合召回个人记忆、偏好、知识库与 Skill，并按相关性阈值过滤；
   - 用通过筛选的记忆组装 system prompt，注入大模型生成回复；
   - 调用 `add_message` 写回本轮对话，沉淀为长期记忆，渠道记入 tags 与 info。
5. 检索或写回失败时降级为无记忆回复，不阻塞消费者。

## 3. 生产落地建议

### 3.1 user_id 与权限

- user_id 必须来自登录态或 CRM 的稳定标识，不要按会话随机生成。消费者换设备、清缓存、换渠道后，仍能命中同一份记忆。
- 记忆默认按 user_id 隔离。写入时开启 `allow_public` 的记忆进入公共记忆库，项目下所有用户可检索，适合存放脱敏后的客服经验；个体消费者的对话记忆不要写入公共记忆库。
- 多渠道接入时用 tags 或 info 标记渠道来源，便于审计「哪条记忆来自哪个渠道」。

### 3.2 时延与异步

- 检索接口典型响应约 200–300 毫秒，放在生成回复前同步调用即可。
- 记忆写入默认异步执行，后台数秒内完成结构化处理。写回操作不要阻塞客服回复链路。
- 写入后立刻检索可能查不到最新记忆。演示脚本为此预留了等待时间，生产环境中下一轮对话自然命中即可。

### 3.3 召回调优

- 用 `relativity` 控制相关性阈值，用 `memory_limit_number` 控制返回条数。阈值过低会带入噪音，过高会漏掉有效背景，可从 0.5 起步按 badcase 调整。
- 调优按根因分层：回答内容错误优先修订知识库文档；该召回的没召回、召回了不相关内容，再调整检索参数或联系 MemOS 支持。

### 3.4 Skill 生命周期

- 通用服务流程由业务方统一维护为 Skill 并上传知识库，保证全员处理口径一致。
- 坐席个人在授权范围内沉淀的经验，可随对话写入由 MemOS 自动沉淀。
- 检索时开启 `include_skill`，匹配的 Skill 随记忆一起返回。若返回的 Skill 缺少结构化内容字段，可将 SOP 要点同时作为普通文档上传知识库，确保处理流程能进入 prompt。
