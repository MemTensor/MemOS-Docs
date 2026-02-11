---
title: Add Feedback
desc: 添加用户自然语言反馈，MemOS将自动更新记忆。
---

::warning
**[直接查看 API 文档请点击这里](/api_docs/core/add_feedback)** 
<br>
<br>

**本文聚焦于功能说明，详细接口字段及限制请点击上方文字链接查看**
::

## 1. 何时添加反馈？

::note
MemOS 反馈机制（Feedback）用于接收用户对模型回答的自然语言反馈，驱动记忆内容自动校正与更新，而无需开发者手动定位具体记忆条目。<br>
通过单独的 addFeedback 接口，达成 **降低人工维护成本 + 提高记忆准确率 + 支持持续自我修正** 的目标。
::

如下表所示，区别于修改特定的记忆，自然语言反馈机制更适合**真实业务使用路径**与**非技术用户操作**。

| 对比维度       | 自然语言反馈           | 定点修改记忆        |
| ---------- | ---------------- | ------------------ |
| 使用方式       | 用自然语言描述问题或修正信息   | 直接指定某条 memory 进行编辑 |
| 用户门槛       | 低，适合非技术用户        | 较高，通常由开发者或管理员操作    |
| 系统参与度      | 系统自动解析、定位、关联更新   | 人工主导更新             |
| 更新范围       | 可能影响多条相关记忆       | 通常只影响单条记忆          |
| 适用场景       | 对话纠错、知识过期、业务规则变更 | 精确修订、结构化维护         |

## 2. 关键参数

*   **反馈内容（feedback\_content）**：用户对模型回答的自然语言反馈内容，用于理解记忆更新的需求。

*   **知识库范围（allow_knowledgebase\_ids）**：用户的自然语言反馈内容指向的知识库，用于限定可修改的[知识库记忆](/memos_cloud/features/advanced/knowledge_base)范围。

*   **会话标识（conversation\_id）**：用户自然反馈内容所关联的唯一会话标识符，用于关联当前反馈内容的上下文信息。

## 3. 工作原理

如下图所示，以 Chabot 场景为例，用户在模型回答内容下方点击“反馈错漏”按钮,填写对本次回答的反馈并提交。
![image.png](https://cdn.memtensor.com.cn/img/1770716602140_1z3yi5_compressed.png)

根据反馈内容，后端完成一次 MemOS `add/feedback` 接口调用，触发记忆更新，无需对用户的记忆手动操作。

- **有效性分析**：当用户提交反馈后，MemOS 会结合当前会话上下文，对反馈内容进行解析，判断其是否为有效信息、是否与对话内容相关，从而决定是否进入记忆更新流程。

- **更新类型识别**：MemOS 会将反馈驱动的记忆更新请求自动分类为关键词替换和语义更新两种类型，并基于反馈内容与上下文语义完成判定。

- **更新记忆**：根据分类结果执行记忆更新操作，写入新记忆，对存在冲突、过时或被纠正的已有记忆进行更新或覆盖。
  - **关键词替换**：检索包含目标关键词的相关记忆条目，并执行定点更新；
  - **语义更新**：基于用户反馈生成新的语义记忆，召回相关记忆内容后进行合并或替换更新。


## 4. 使用示例

### 语义更新知识库记忆

在企业中，常会出现企业政策/知识已更新，而知识库更新不及时的问题。尝试一下，用最简单的交互方式驱动知识库始终保持最新。

::note{icon="websymbol:chat"}
&nbsp;会话 A：2025-12-12 发生<br>
<div style="padding-left: 2em;">
财务主管在会话中，反馈【办公类软件的采购上限为600元，而不是800元】。
</div>
::

```python
import os
import requests
import json

# 替换成你的 MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "user_id": "memos_user_123",
    "conversation_id": "1212",
    "feedback_content": "办公类软件的采购上限是600元，而不是800元。",
    "allow_knowledgebase_ids":["idxxxxx"]  # 替换成上方创建的知识库ID
}

headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/feedback"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```

::note{icon="websymbol:chat"}
&nbsp;会话 A：2025-12-12 发生<br>
<div style="padding-left: 2em;">
任意其他用户搜索【软件报销制度】时，获取一条新增高权重记忆【办公类软件的采购上限为600元，而不是800元】。
</div>
::

```python
import os
import requests
import json

# 替换成你的 MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "user_id": "memos_user_123",
    "conversation_id": "1211",
    "query": "帮我查一下软件采购报销额度。",
    "knowledgebase_ids":["idxxxxx"]  # 替换成上方创建的知识库ID
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/search/memory"

res = requests.post(url=url, headers=headers, data=json.dumps(data))


# 美化 JSON 输出
json_res = res.json()
print(json.dumps(json_res, indent=2, ensure_ascii=False))
```

输出结果如下（简化版）：

```python
"memory_detail_list": [
  {
    "id": "8a4f3d2e-c417-4e53-bc25-54451abd5ac8",
    "memory_key": "软件采购报销制度（试行版）",
    "memory_value": "该制度旨在规范公司各类软件的采购与报销流程，要求所有软件采购遵循特定品类的采购金额上限。设计类软件的采购上限为1000元，适用于平面设计、视频编辑和原型设计，示例包括Photoshop和Premiere。代码/开发类软件的采购上限为1500元，适用范围包括IDE和开发框架，示例有PyCharm和Visual Studio。办公类软件的采购上限为800元，适用于文档编辑和表格处理，示例包括Office套件和WPS。数据分析类软件的采购上限为1200元，适用范围为数据统计和可视化，示例包括Tableau和Power BI。安全与防护类软件的采购上限为1000元，适用于杀毒和防火墙。协作/项目管理类软件的采购上限为900元，示例包括Jira和Slack。特殊行业软件的采购上限为2000元，需专项审批。所有采购必须符合公司预算与信息安全要求，超出限额的软件需提供业务说明并提交专项审批。",
    "memory_type": "LongTermMemory",
    "create_time": 1765525947718,
    "conversation_id": "default_session",
    "status": "activated",
    "confidence": 0.99,
    "tags": [
      "软件采购",
      "报销制度",
      "审批流程",
      "预算",
      "信息安全",
      "mode:fine",
      "multimodal:file"
    ],
    "update_time": 1765525947720,
    "relativity": 0.8931847
  },
  {
    "id": "a72a04d1-d7ba-4ebd-9410-0097bfa6c20d",
    "memory_key": "办公软件采购上限",
    "memory_value": "用户确认办公类软件的采购上限是600元，而不是800元。",
    "memory_type": "WorkingMemory",
    "create_time": 1765531700539,
    "conversation_id": "1212",
    "status": "activated",
    "confidence": 0.99,
    "tags": [
      "采购",
      "办公软件",
      "预算"
    ],
    "update_time": 1765531700540,
    "relativity": 0.7196722
  }
]
```

[控制台-知识库](https://memos-dashboard.openmem.net/knowledgeBase/)中展示了知识库中所有通过自然语言交互，更正或补全知识库记忆的详情。

![image.png](https://cdn.memtensor.com.cn/img/1765970178683_5tuxe4_compressed.png)


### 关键字替换记忆

如下所示，除了更新语义记忆，MemOS 还支持通过描述对特定词汇进行替换修改，此场景下无需输入会话标识（conversation_id）。

```python
data = {
    "user_id": "memos_user_123",
    "feedback_content": "从现在开始我改名了，把用户1号统一替换为用户2号",
    "allow_knowledgebase_ids": ["123", "456"]
  }
```

