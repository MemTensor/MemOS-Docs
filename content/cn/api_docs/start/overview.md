---
title: 概述
---

## 1. 接口介绍

MemOS 提供了完整的接口，通过简单的 API 请求，即可将记忆相关的功能集成到您的 AI 应用内，实现不同用户与 AI 智能体的记忆生产、调度、召回与生命周期管理。

::tip
**快速开始：** 从 [**MemOS 控制台**](https://memos-dashboard.openmem.net/apikeys/) 获取你的接口密钥，一分钟即可完成首次记忆操作。
::

## 2. 入门指南

通过以下两个简单的核心步骤开始使用 MemOS API：

* [**添加消息**](/api_docs/core/add_message)：储存用户对话中的原始消息内容，生成记忆；

* [**检索记忆**](/api_docs/core/search_memory)：检索召回用户的相关记忆片段，为模型生成的回答内容提供参考。

### 添加消息

::code-group
```python [Python (HTTP)]
import os, requests, json

os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "user_id": "user_001",
  "conversation_id": "conv_001",
  "messages": [
    {"role": "user", "content": "我下周二要去北京出差"},
    {"role": "assistant", "content": "好的，需要我帮你查北京的天气或酒店吗？"}
  ]
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
res = requests.post(f"{os.environ['MEMOS_BASE_URL']}/add/message", headers=headers, data=json.dumps(data))
print(res.json())
```
```python [Python (SDK)]
# pip install MemoryOS -U
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

res = client.add_message(
    user_id="user_001",
    conversation_id="conv_001",
    messages=[
        {"role": "user", "content": "我下周二要去北京出差"},
        {"role": "assistant", "content": "好的，需要我帮你查北京的天气或酒店吗？"}
    ]
)
print(res)
```
```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/add/message \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "user_id": "user_001",
    "conversation_id": "conv_001",
    "messages": [
      {"role": "user", "content": "我下周二要去北京出差"},
      {"role": "assistant", "content": "好的，需要我帮你查北京的天气或酒店吗？"}
    ]
  }'
```
::

### 检索记忆

::code-group
```python [Python (HTTP)]
import os, requests, json

os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "query": "用户最近有什么出行计划？",
  "user_id": "user_001"
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
res = requests.post(f"{os.environ['MEMOS_BASE_URL']}/search/memory", headers=headers, data=json.dumps(data))
print(res.json())
```
```python [Python (SDK)]
# pip install MemoryOS -U
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

res = client.search_memory(
    query="用户最近有什么出行计划？",
    user_id="user_001"
)
print(res)
```
```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/search/memory \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "用户最近有什么出行计划？",
    "user_id": "user_001"
  }'
```
::

## 3. 接口分类

探索 MemOS 提供的丰富功能接口：

* [**核心操作 API**](/api_docs/core/add_message)：提供记忆核心操作能力，包括添加消息、检索记忆、删除记忆、修改记忆、反馈等。

* [**属性记忆 API**](/api_docs/core/bind_profile_template)：管理属性记忆模板的绑定、编辑与删除。

* [**自研模型 API**](/api_docs/core/extract_memory)：调用记忆抽取与重排模型能力。

* [**消息 API**](/api_docs/message/get_message)：查询历史消息与异步任务状态。

* [**对话 API**](/api_docs/chat/chat)：完成带有记忆召回与知识库增强的对话生成。

* [**知识库 API**](/api_docs/knowledge/create_kb)：创建与管理知识库及其文档。

## 4. 鉴权认证

所有API请求都需要认证，请在请求头的 `Authorization` 中包含您的接口密钥。从[**MemOS 控制台**](https://memos-dashboard.openmem.net/apikeys/)获取接口密钥。

::warning
请勿在客户端或公共仓库中暴露您的接口密钥，所有请求都应通过环境变量或服务器端调用进行。
::

## 5. 下一步行动

* 👉 [**添加消息**](/api_docs/core/add_message)：生成你的第一条记忆；

* 👉 [**检索记忆**](/api_docs/core/search_memory)：使用记忆过滤器实现记忆的高级检索。
