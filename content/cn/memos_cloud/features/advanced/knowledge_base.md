---
title: 知识库
desc: 创建项目关联的知识库，检索记忆时结合用户记忆与知识库补充知识。
---
::warning
**[本文是对【MemOS知识库】功能做展开介绍，可点此直接查看详细 API 文档](/api_docs/knowledge/create_kb)**
::


## 1. MemOS 知识库 vs 传统 RAG

MemOS 知识库支持开发者将业务知识整合进智能应用的长期记忆体系。
<br>
系统以上传的文档为底层数据源，构建并维护独立的记忆层，支撑问答等自然语言交互应用。随着终端用户的持续使用，MemOS 会根据对话内容动态演化和更新记忆，从而推动知识库的自动迭代与自我进化。
<br>
<br>
与传统 RAG 的静态存储不同，MemOS 让知识库成为“记忆”的一部分，有“记忆”的 AI 应用不仅能更准确地查询资料，还能更了解背景与懂用户。让我们来看两个真实的场景来对比两种解决方案：

<br>

**购物客服机器人**

**背景**

```python
DAY 1 用户询问：我家有只三个月大的金毛，买哪款狗粮比较好?对了，它不吃鸡肉口味的。
DAY 1 用户在助手推荐下购买了 A 羊肉幼犬狗粮。
DAY 10 用户询问：狗狗吃这款狗粮会拉稀，我想换一款狗粮。
```

**RAG 方案**

```python
# 根据用户发言检索“幼犬狗粮推荐”“拉稀”相关片段，但无法召回“用户的狗不吃鸡肉口味”。检索到知识：

1. 狗粮拉稀常见原因说明：可以更换低敏狗粮。
2. 低敏幼犬狗粮推荐：B（鸡肉）、C（三文鱼）。

# 🤦 购物助手：如果现在出现拉稀，可以试一试 B（鸡肉味）、C（三文鱼）。
```

**MemOS 方案**

```python
# 根据用户发言检索相关记忆，感知到用户家的狗狗是三个月的金毛幼犬，不喜欢吃鸡肉，需要推荐不会拉稀的幼犬狗粮。检索到记忆：

1. 用户家中有一只三个月大的金毛犬，体重约12斤。
2. 用户家的狗狗不吃鸡肉口味狗粮。
3. 用户之前购买的是羊肉幼犬狗粮。
4. 狗粮拉稀常见原因说明：可以更换低敏狗粮。
5. 低敏幼犬狗粮推荐：B（鸡肉）、C（三文鱼）。

# ✅ 购物助手：你之前提到狗狗是 3 个月大的金毛，而且不能吃鸡肉口味，所以我已帮你排除了所有鸡肉口味的幼犬粮。你之前买过羊肉 + 三文鱼幼犬粮，如果现在出现拉稀，可以尝试更温和的 C（三文鱼幼犬低敏）。
```
<br>
<br>

**企业知识库助手**

**背景**

```python
DAY 1 员工询问：我的电脑是 MacBook Pro 13寸，Intel 芯片。我怎么安装公司内网代理？
DAY 1 助手提供了 Intel 版本的安装步骤。
DAY 20 员工询问：内网代理打不开了，我该重新装哪个版本？
```

**RAG 方案**

```python
# 根据用户发言检索“内网代理”“打不开”相关内容，但无法召回“用户的设备型号”。检索到知识：

1. 内网代理常见故障排查
2. M1/M2（ARM）版本的内网代理安装说明
3. Windows 内网代理客户端安装说明
4. 网络连接与证书问题
5. 通用 FAQ

# 🤦 知识库助手：请尝试重新下载安装最新的Mac M1/M2（ARM）版本或Windows的内网代理客户端。以下是安装步骤：...
```

**MemOS 方案**

```python
# 根据员工问题检索“内网代理”“打不开”相关记忆，自动识别该员工的设备型号，检索到记忆：

1. 用户在20天前安装了公司内网代理，他的设备是 MacBook Pro 13（Intel）
2. 内网代理常见故障排查
3. Intel 版本的内网代理安装说明

# ✅ 知识库助手：你使用的是 Intel 芯片的 MacBook Pro，建议重新安装 Intel 版本 的内网代理客户端。以下是 Intel 版的下载链接和安装步骤：...
```

::note{icon="ri:triangular-flag-fill"}
**&nbsp;优势总结**<br>
RAG 擅长从知识库中检索与查询语义相似的信息，但它是**无状态的**：每一次查询都是独立的，缺乏对具体用户和上下文的理解。<br>

MemOS 能够理解**关系、时间与偏好**等信息，将当前问题与历史记忆关联起来，在“带着背景”的前提下查找和使用知识：<br>

* **懂用户**：MemOS 知道“你是谁”“在做什么”，只需提出问题，MemOS 会自动补全上下文。<br>

* **个性化**：不同岗位和工作习惯，MemOS 能记住“这个客户不喜欢过于激进的推销”、“你更常使用 Python 而非 Java”、“你上次咨询过报销政策，这次是否需要进入申请流程”。<br>

* **知识进化**：当实际流程中存在未写入文档的“经验规则”时，MemOS 会将其沉淀为新的记忆，持续补全和完善知识体系。
::


## 2. 工作原理

1.  **上传**：通过控制台或 API 创建知识库，并上传文档。

2.  **校验**：完成鉴权，并对文档的格式、大小等进行合规性校验。

3.  **存储**：文档上传成功后由 MemOS 保存，并进入处理队列。

4.  **解析**：按不同文件类型解析文档原文内容。

5.  **智能分段**：根据标题、结构与语义将文档拆分为更细粒度的内容片段。

6.  **生成记忆**：MemOS 基于分片内容生成知识记忆，与用户长期记忆共同构成完整的项目记忆库。

7.  **嵌入与索引**：将所有记忆内容写入数据库，并建立嵌入索引以支持毫秒级检索。


## 3. 知识库要求

### 容量限制

MemOS 云服务目前为所有开发者提供了从免费版到企业版的多种定价方案，不同版本对应的知识库容量与数量限制不同。

::note
目前，所有版本限时免费，欢迎前往[官网-价格](https://memos.openmem.net/cn/pricing)，申请符合你需求的版本。
::

| **版本**   | **知识库存储限制**                        |
| ---------- | ----------------------------------------- |
| **免费版** | 知识库个数：10个；单知识库存储空间：1G    |
| **入门版** | 知识库个数：30个；单知识库存储空间：10G   |
| **专业版** | 知识库个数：100个；单知识库存储空间：100G |


::warning
&nbsp;注意<br>
当你的服务等级发生降级时，若现有知识库已超出当前版本的容量限制，MemOS <strong>不会清空已有知识库数据</strong>，但将限制以下操作：<br>

* 无法创建新的知识库
* 无法继续上传新文档

需将使用量调整至当前版本的容量范围内后，相关功能可恢复。
::

### 文档限制

1.  支持上传的文档类型：PDF、DOCX、DOC、TXT、JSON、MD、XML

2.  单文件大小上限：不超过 100 MB、500页

3.  单次上传的文件数量上限：不超过20个

::warning
&nbsp;注意<br>
当单次上传的文件数量、单文件大小或页数超过上述限制时，该次上传任务将被判定为<strong>处理失败</strong>。<br>
请根据限制要求调整文件后，重新发起上传请求。
::

## 4. 使用示例

以下是一个完整的知识库使用示例，帮助您快速上手使用构建专属您的「知识库助手」。

### 创建知识库：财务报销知识库

::code-group
```python [Python (HTTP)]
import os
import requests
import json

# 替换成你的 MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "knowledgebase_name": "财务报销知识库",
    "knowledgebase_description": "本公司所有财务报销相关的知识汇总"
  }
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/create/knowledgebase"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
```python [输出]
"result": {
  "code": 0,
  "data": {
    "id": "idxxxxx"  # 替换成上方创建的知识库ID
  },
  "message": "ok"
}
```
::

### 上传文档：软件采购报销制度

::code-group
```python [Python (HTTP)]
import os
import requests
import json

# 替换成你的 MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "knowledgebase_id": "idxxxxx",  # 替换成上方创建的知识库ID
    "file": [
        {"content": "https://cdn.memtensor.com.cn/file/软件采购报销制度.pdf"}
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
```python [输出]
"result": {
  "code": 0,
  "data": [
    {
      "id": "1f35642253606ed1e9dd8cd8113a8998",
      "name": "软件采购报销制度.pdf",
      "sizeMB": 0.06331157684326172,
      "status": "PROCESSING"
    }
  ],
  "message": "ok"
}
```
::

### 添加用户对话

::note{icon="websymbol:chat"}
&nbsp;会话 A：2025-06-10 发生<br>
<div style="padding-left: 2em;">
设计师在聊天中表明了自己是【创意平台部门的设计师】的岗位。
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
    "conversation_id": "0610",
    "messages": [
    {
        "role": "user",
        "content": "我是创意平台部门的设计师。"
    },
    {
        "role": "assistant",
        "content": "好的，我记住了。"
    }
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

### 检索知识库记忆

::note{icon="websymbol:chat"}
&nbsp;会话 A：2025-12-12 发生<br>
<div style="padding-left: 2em;">
用户在一个新的会话中，询问【软件报销制度】，MemOS 会自动召回【知识库记忆：软件报销制度内容】【用户记忆：创意平台设计师】，从而回答更加明确且“懂用户”的软件报销内容。
</div>
::
  
::code-group

```python [Python (HTTP)]
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

```python [输出]
"memory_detail_list": [
  {
    "id": "2c760355-de4b-4a8f-b98d-b92851d23fa7",
    "memory_key": "软件采购报销制度（试行版）",
    "memory_value": "该制度旨在规范公司各类软件的采购与报销流程，要求所有软件采购遵循特定品类的采购金额上限。设计类软件的采购上限为1000元，适用于平面设计、视频编辑和原型设计，示例包括Photoshop和Premiere。代码/开发类软件的采购上限为1500元，适用范围包括IDE和开发框架，示例有PyCharm和Visual Studio。办公类软件的采购上限为800元，适用于文档编辑和表格处理，示例包括Office套件和WPS。数据分析类软件的采购上限为1200元，适用范围为数据统计和可视化，示例包括Tableau和Power BI。安全与防护类软件的采购上限为1000元，适用于杀毒和防火墙。协作/项目管理类软件的采购上限为900元，示例包括Jira和Slack。特殊行业软件的采购上限为2000元，需专项审批。所有采购必须符合公司预算与信息安全要求，超出限额的软件需提供业务说明并提交专项审批。",
    "memory_type": "WorkingMemory",
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
    "relativity": 0.89308184
  },
  {
    "id": "81fd1e79-65be-4d4e-81e0-8f76ba697c55",
    "memory_key": "职位信息",
    "memory_value": "用户是创意平台部门的设计师。",
    "memory_type": "WorkingMemory",
    "create_time": 1765526247112,
    "conversation_id": "0610",
    "status": "activated",
    "confidence": 0.99,
    "tags": [
      "职位",
      "部门",
      "设计"
    ],
    "update_time": 1765526247113,
    "relativity": 1.6319022e-05
  }
]
```
::

### 反馈优化知识库

在企业中，常会出现企业政策/知识已更新，而知识库更新不及时的问题。目前，MemOS 支持通过**自然语言对话**对知识库的记忆反馈，用于快速更新知识库记忆，从而提高准确性与时效性。

尝试一下，用最简单的交互方式驱动知识库始终保持最新。

::note{icon="websymbol:chat"}
&nbsp;会话 A：2025-12-12 发生<br>
<div style="padding-left: 2em;">
财务主管在另一个新的会话中，反馈【办公类软件的采购上限为600元，而不是800元】。
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

::note
有关反馈 API 字段、格式等信息的完整列表，详见[Add Feedback 接口文档](/api_docs/message/add_feedback)。
::
