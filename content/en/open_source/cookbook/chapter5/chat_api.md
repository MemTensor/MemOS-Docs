---
title: Unified Chat API for Semantic Search, Q&A, and Memory Management
desc: This chapter introduces a single, unified Chat API that allows AI developers to perform semantic search, conversational Q&A, and memory addition in one interface. By following a simple workflow—searching memory, chatting with the LLM, and adding the current turn to memory—developers can integrate powerful AI capabilities without building separate pipelines for each function. Examples for both streaming and non-streaming API calls are provided for easy integration.
---

## Chapter 5: Chat API

**🎯 Problem Scenario:** You are an AI application developer but do not want to build a complete memory search, Q&A, and memory addition workflow yourself.

**🔧 Solution:** We provide a unified chat interface that allows users to perform semantic search, conversational Q&A, and memory addition without calling multiple separate APIs.

**🔧 Execution Flow:** The execution flow is as follows:
```markdown
A[User Query] --> B[Search Memory] --> C[LLM Chat] --> D[Add to Memory]
```

### Specific Steps
#### Step 1: Start the MemOS API Service
First, you need to configure your Chat Model List in the .env
```dotenv
CHAT_MODEL_LIST=[{"backend": "qwen", "api_base": "https://dashscope.aliyuncs.com/compatible-mode/v1", "api_key": "xxx", "model_name_or_path": "qwen2.5-72b-instruct", "support_models": ["qwen2.5-72b-instruct"]}, {"backend": "deepseek", "api_base": "https://dashscope.aliyuncs.com/compatible-mode/v1", "api_key": "xxx", "model_name_or_path": "deepseek-r1", "support_models": ["deepseek-r1"]}]
```

```bash
uvicorn memos.api.server_api:app --host 0.0.0.0 --port 8001 --workers 8
```

#### Step 2: Call the Chat API

**Non-Streaming**
```bash
curl -X POST "http://0.0.0.0:8001/product/chat/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "memos_user_123",
    "readable_cube_ids": ["xxx"],
    "writable_cube_ids": ["xxx"],
    "query": "I have planned to travel to Guangzhou this summer. What chain hotels are available for accommodation?",
    "model_name_or_path": "deepseek-r1",
    "add_message_on_answer": true
  }'
```

**Streaming**
```bash
curl -N -X POST "http://0.0.0.0:8001/product/chat/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "memos_user_123",
    "readable_cube_ids": ["xxx"],
    "writable_cube_ids": ["xxx"],
    "query": "I have planned to travel to Guangzhou this summer. What chain hotels are available for accommodation?",
    "model_name_or_path": "deepseek-r1",
    "add_message_on_answer": true
  }'
```
