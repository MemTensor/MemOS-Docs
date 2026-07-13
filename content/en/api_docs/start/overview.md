---
title: Overview
---

## 1. Interface Introduction

MemOS provides a complete set of interfaces. Through simple API requests, you can integrate memory-related functions into your AI applications, realizing memory production, scheduling, recall, and lifecycle management for different users and AI agents.

::tip
**Quick Start:** Get your API key from the [**MemOS Console**](https://memos-dashboard.openmem.net/apikeys/) and complete your first memory operation in one minute.
::

## 2. Getting Started

Start using MemOS API through these two simple core steps:

* [**Add Message**](/api_docs/core/add_message): Store original message content from user conversations and generate memories;

* [**Search Memory**](/api_docs/core/search_memory): Retrieve and recall relevant user memory fragments to provide reference for model-generated responses.

### Add Message

::code-group
```python [Python (HTTP)]
import os, requests, json

os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "user_id": "user_001",
  "conversation_id": "conv_001",
  "messages": [
    {"role": "user", "content": "I have a business trip to Beijing next Tuesday"},
    {"role": "assistant", "content": "Sure, shall I check the weather or hotels in Beijing for you?"}
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
        {"role": "user", "content": "I have a business trip to Beijing next Tuesday"},
        {"role": "assistant", "content": "Sure, shall I check the weather or hotels in Beijing for you?"}
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
      {"role": "user", "content": "I have a business trip to Beijing next Tuesday"},
      {"role": "assistant", "content": "Sure, shall I check the weather or hotels in Beijing for you?"}
    ]
  }'
```
::

### Search Memory

::code-group
```python [Python (HTTP)]
import os, requests, json

os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "query": "What travel plans does the user have recently?",
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
    query="What travel plans does the user have recently?",
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
    "query": "What travel plans does the user have recently?",
    "user_id": "user_001"
  }'
```
::

## 3. Interface Categories

Explore the rich functional interfaces provided by MemOS:

* [**Core Operations API**](/api_docs/core/add_message): Core memory operations including adding messages, searching, deleting, updating memories, and feedback.

* [**Profile API**](/api_docs/core/bind_profile_template): Manage Profile template binding, editing, and deletion.

* [**Self-developed Model API**](/api_docs/core/extract_memory): Call memory extraction and reranking model capabilities.

* [**Message API**](/api_docs/message/get_message): Query historical messages and async task status.

* [**Chat API**](/api_docs/chat/chat): Generate chat responses with memory recall and knowledge base enhancement.

* [**Knowledge Base API**](/api_docs/knowledge/create_kb): Create and manage knowledge bases and their documents.

## 4. Authentication

All API requests require authentication. Please include your API key in the `Authorization` header of the request. Get your API key from the [**MemOS Console**](https://memos-dashboard.openmem.net/apikeys/).

::warning
Do not expose your API key in client-side code or public repositories. All requests should be made via environment variables or server-side calls.
::

## 5. Next Steps

* 👉 [**Add Message**](/api_docs/core/add_message): Generate your first memory;

* 👉 [**Search Memory**](/api_docs/core/search_memory): Use memory filters to implement advanced memory retrieval.
