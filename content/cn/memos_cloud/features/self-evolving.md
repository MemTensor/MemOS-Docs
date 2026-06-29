---
title: 记忆自进化 Self-Evolving
desc: 记忆不只是存储——MemOS 会自动从对话中提炼可复用的结构化方法，让 Agent 的能力随使用持续进化。
---

## 什么是记忆自进化（Self-Evolving）？

在 AI Agent 的语境中，**Skill** 是一套可复用的任务处理方法。它告诉 Agent「遇到某类任务该怎么做」，例如：

- 如何规划一次旅行
- 如何处理一笔退货工单
- 如何按公司规范生成周报

技能可以弥补大模型在长期运行中经验难以沉淀的问题，主要体现在：

- 可维护：把真实任务中的稳定流程沉淀为结构化方法，方便持续迭代。
- 按需调用：由 Agent 根据当前任务召回相关技能，而不是把所有流程都放进上下文。
- 个性化：将不同用户的偏好、习惯和禁忌转化为可复用的执行方式。

通过在对话中提炼可复用的Skill，MemOS可以实现记忆的自进化，持续增强Agent的能力。

---

## MemOS 如何为 Agent 提供记忆自进化能力？

### 1. 自动生成个性化技能

MemOS 主张“记忆即资产”，在真实对话中沉淀下来的解决路径与用户偏好，就是最宝贵的技能素材。

你不需要准备任何文件，只要添加用户与 Agent 的对话原文，MemOS **会从用户记忆中自动提炼技能**——将零散的交互历史固化为可复用、个性化的专业能力。

### 2. 上传自定义技能

现在，MemOS 也支持直接上传你已有的技能文件，上传 Markdown 文件或 ZIP 包到知识库，MemOS 就能在检索时返回相关的技能给 Agent。

---

## 自动生成个性化技能

### 工作原理

![image.png](https://cdn.memtensor.com.cn/img/1769653199709_6ol3n7_compressed.png)

上图展示了终端用户、你构建的 AI Agent 与 MemOS 的完整交互流程：

1. 调用 `add/message` 接口将用户的对话消息传入 MemOS。
2. MemOS 接收到请求后，会依次完成以下处理，生成技能（Skill）文件：

    a. **智能切片**：识别历史对话中的任务边界，切分成任务文本块；

    b. **聚类提取**：将同类型的任务文本块聚类，结合用户的历史记忆，提取出结构化的技能文本。

    c. **技能转化**：将技能转化为可运行、可被识别的技能（Skill）文件。
3. 调用 `search/memory` 接口检索记忆，MemOS 会统一返回与上下文相关的用户事实、偏好、工具记忆与匹配的技能（Skill）文件。
4. 下载技能文件，将记忆和技能文件统一传给你自己部署的大模型，从而实现对长期经验与自动生成技能的有效利用。

整个过程无需手动上传任何技能文件。

### 旅行规划示例

以「旅行规划」为例，展示同一个任务如何为不同用户生成不同技能。

#### 1. 添加对话

用户在对话中表达了自己的旅行规划偏好：不走回头路、行程紧凑、偏好文化景点、需要提前检查天气。

```python
import os
import json
import requests

os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "user_id": "memos_user_j",
    "conversation_id": "travel_0127",
    "messages": [
        {
            "role": "user",
            "content": "下周我要去成都玩，帮我规划一个5天的出行计划。我喜欢不走回头路的特种兵出行，也帮我标注路途中值得品尝的美食。"
        },
        {"role": "assistant", "content": "...此处省略..."},
        {
            "role": "user",
            "content": "我比较喜欢逛文化景点，商场什么的不太感兴趣。"
        },
        {"role": "assistant", "content": "...此处省略..."},
        {
            "role": "user",
            "content": "帮我在规划的时候提前确认天气和温度，方便我准备行李。"
        },
        {"role": "assistant", "content": "...此处省略..."}
    ]
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/message"

res = requests.post(url=url, headers=headers, data=json.dumps(data))
print(f"result: {res.json()}")
```

#### 2. 检索技能

当同一用户下次提出类似需求时，传入 `include_skill=true`：

```python
data = {
    "query": "清明节我打算去云南，帮我规划7天的行程。",
    "user_id": "memos_user_j",
    "conversation_id": "travel_0301",
    "include_skill": True
}

res = requests.post(
    url=f"{os.environ['MEMOS_BASE_URL']}/search/memory",
    headers=headers,
    data=json.dumps(data)
)
print(f"result: {res.json()}")
```

#### 3. MemOS 生成技能

同样是「旅行规划」，不是所有用户套同一个模板，而是把每个用户长期对话中的偏好沉淀为专属、可复用的能力。
如下所示，MemOS 为这位高能量 J 人生成的技能可能如下：

```markdown
---
name: 旅行行程规划
description: 为高能量旅行者设计多日行程，包括高效动线、文化景点、美食与天气适配建议。
---

## Procedure
1. 确定旅行天数、目的地和用户偏好
2. 收集目的地文化景点、美食点位和交通信息
3. 按区域规划每日路线，避免来回折返
4. 将美食点位穿插进交通动线中
5. 检查天气预报，调整每日路线和行李建议

## Experience
- 优先安排文化景点，减少购物商场类行程
- 路线要紧凑，适合高能量、特种兵式旅行
- 每日行程尽量按地理位置顺路推进

## User Preferences
- 不走回头路
- 偏好文化景点
- 希望提前确认天气和温度
```

如果另一个用户是「低能量 P 人」，在对话中表达了"夜猫子、早上起不来、不想去太远、喜欢小众景点"，MemOS 生成的技能会明显不同：

```markdown
---
name: 旅行行程规划
description: 帮助低能量旅行者规划轻松、灵活、偏下午和夜间体验的旅行行程。
---

## Procedure
1. 确认用户当天精力、起床时间和不可接受的通勤距离
2. 优先筛选距离近、交通简单、不需要赶早的景点
3. 将行程重心放在下午、傍晚和夜间活动
4. 穿插小众景点，避免过度热门和拥挤路线
5. 保留弹性时间，允许用户临时调整

## Experience
- 避免安排早起项目
- 避免长距离奔波和过密行程
- 优先推荐地铁直达或短途打车可达的地点

## User Preferences
- 夜猫子，早上起不来
- 不喜欢赶路
- 喜欢小众、不走寻常路的体验
```

---

## 上传自定义技能

### 客服退货示例

当你已有明确的标准流程，可以直接上传技能文件到知识库，MemOS 将统一检索并返回相关的技能。下述示例以「客服 Agent 退货处理流程」举例，讲解从技能上传到检索使用的全流程。

#### 1. 通过 API 上传到知识库

通过上传知识库文件，上传一份指导客服 Agent 协助用户完成退货的技能文件。

:::code-group

```python [URL 上传]
import os
import json
import requests

os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}

data = {
    "knowledgebase_id": "kb_xxx",  # 替换为你的知识库 ID
    "file": [
        {
            "type": "skill",
            "content": "https://cdn.memtensor.com.cn/file/SKILL.md"  # 替换为你要上传的文件地址
        }
    ]
}

url = f"{os.environ['MEMOS_BASE_URL']}/add/knowledgebase-file"

res = requests.post(url=url, headers=headers, data=json.dumps(data))
print(f"result: {res.json()}")
```

```python [Base64 上传]
import os
import json
import base64
import requests

os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

skill_markdown = """---
name: 客服退货处理流程
description: 指导客服按标准流程处理用户退货请求
---

## Procedure

1. 确认用户身份和订单号
2. 核实退货原因是否符合政策
3. 引导用户选择退货方式（上门取件/自行寄回）
4. 生成退货单号并告知用户
5. 跟踪物流状态，退款到账后通知用户

## Experience

- 签收 7 天内可无理由退货
- 生鲜类商品不支持退货，需走售后补偿流程
- 高价值商品（>500 元）需主管审批

## User Preferences

- 优先推荐上门取件，减少用户操作成本
- 退款方式默认原路退回

## Examples

### Example 1: 普通商品退货
用户：我三天前买的耳机想退货。
助手：好的，已确认您的订单在 7 天无理由退货范围内。请问您希望上门取件还是自行寄回？
"""

encoded_skill = base64.b64encode(skill_markdown.encode("utf-8")).decode("utf-8")

data = {
    "knowledgebase_id": "kb_xxx",  # 替换为你的知识库 ID
    "file": [
        {
            "type": "skill",
            "name": "customer-return-sop.md",
            "content": f"data:text/markdown;base64,{encoded_skill}"
        }
    ]
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/knowledgebase-file"

res = requests.post(url=url, headers=headers, data=json.dumps(data))
print(f"result: {res.json()}")
```


:::

#### 2. 通过控制台上传技能文件

前往 [控制台 - 知识库](https://memos-dashboard.openmem.net/knowledgeBase/)，选择目标知识库，点击「上传文档」，将 `.md` 或 `.zip` 文件拖入即可。上传时选择文件类型为「技能文件」。

![image](https://cdn.memtensor.com.cn/img/1778148120408_c3xk8d_compressed.png)

#### 3. 检索技能

上传成功后，检索时传入 `knowledgebase_ids` 并开启 `include_skill`，MemOS 会返回与查询内容相关的技能。如下所示，Agent 可按「客服退货处理流程」引导用户完成退货。

```python
data = {
    "query": "用户想退一件三天前买的耳机",
    "user_id": "memos_user_123",
    "conversation_id": "session_001",
    "knowledgebase_ids": ["kb_xxx"],
    "include_skill": True
}

res = requests.post(
    url=f"{os.environ['MEMOS_BASE_URL']}/search/memory",
    headers=headers,
    data=json.dumps(data)
)
print(f"result: {res.json()}")
```

### Skill 文件规范

#### 1. 单文件 `.md`

- 约束条件如下：
  - 大小限制：≤ 100KB
  - 文件内容：必须包含 `name` 和 `description`

- 推荐按以下格式组织正文：

```text
---
name: （技能名称）
description: （一句话描述技能的用途和适用场景）
---

## Procedure
1. 步骤一
2. 步骤二
3. 步骤三

## Experience
- 经验或注意事项一
- 经验或注意事项二

## User Preferences
- 偏好设定一
- 偏好设定二

## Examples

### Example 1: （场景描述）
（完整的输入输出示例）

## Additional Information
（补充说明，如参考链接、特殊规则等）
```

#### 2. 技能压缩包 `.zip`

- 约束条件如下：

| 约束 | 要求 |
| --- | --- |
| 格式 | 标准 ZIP，不支持 rar/7z |
| zip 大小 | ≤ 20MB |
| 解压后文件数 | ≤ 200 |
| 解压后单文件 | ≤ 10MB |
| SKILL.md | ≤ 100KB，`name`/`description` 必填，须在压缩包第一层 |

- 推荐按以下格式组织正文：

```text
refund-sop-v1.zip
├── SKILL.md             
├── references/
│   └── 退货政策摘要.md
├── scripts/
│   └── check_order.py    
└── assets/
    └── flowchart.png
```

---

## 如何使用召回的技能

无论技能来源是自动生成还是知识库上传，检索返回的 `skill_detail_list` 中每个技能包含两个字段：

| 字段 | 说明 |
| --- | --- |
| `skill_value` | 技能的结构化内容，可直接转为字符串注入 Agent 的 prompt |
| `skill_url` | 技能文件的下载链接；如果是 zip 技能包，Agent 可下载后获取脚本、参考资料等附件 |

### 用法参考

根据你调用的 Agent 是否具备使用 Skill 的能力，可参考以下两种用法：

#### 1. Agent 支持 Skill

将 `skill_url` 提供给 Agent，让它下载链接中的文件，可以把它写进 prompt：

```python
skill_detail = result["skill_detail_list"][0]
skill_url = skill_detail.get("skill_url")

system_prompt = f"""你是一个客服助手。遇到用户退货，可使用以下 Skill 文件完成任务：

{skill_url}
"""
```

#### 2. Agent 不支持 Skill

将 `skill_value` 转成字符串，添加到 prompt 中：

```python
skill_detail = result["skill_detail_list"][0]
skill = str(skill_detail["skill_value"])

system_prompt = f"""你是一个客服助手。请参考以下技能执行任务：

{skill}
"""
```

:::tip
检索时，MemOS 会同时搜索个人对话生成的技能和知识库中上传的技能，统一排序返回。你无需区分来源。
:::

---

**现在就开始探索 MemOS 记忆自进化能力吧！**

- 前往 [控制台 - 技能页面](https://memos-dashboard.openmem.net/cn/skill/)，查看自动生成的技能。
- 还没有技能？[添加消息](/memos_cloud/mem_operations/add_message)即可触发生成。
- 想上传自定义技能？前往 [控制台 - 知识库](https://memos-dashboard.openmem.net/knowledgeBase/)上传。