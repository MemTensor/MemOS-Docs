---
title: 统一聊天接口（Chat API）——语义搜索、问答与记忆管理
desc: 本章节介绍一个统一的聊天接口，帮助 AI 开发者通过一个接口完成语义搜索、对话问答和记忆添加。接口遵循简单流程：先检索记忆，再与 LLM 对话，最后将当前轮对话写入记忆。提供了流式与非流式调用示例，方便快速集成与使用。
---

## 第五章：Chat API

**🎯 问题场景：** 你是一名AI应用开发者，但不想自己开发一套记忆搜索、问答、记忆添加的流程。

**🔧 解决方案：** 我们提供了一个统一的聊天接口，用户通过它即可完成语义搜索、对话问答、记忆添加，无需单独调用多个接口。

**🔧 执行流程：** 执行流程如下：
```markdown
A[用户查询] --> B[搜索记忆] --> C[LLM聊天] --> D[添加记忆]
```

### 具体步骤
#### 步骤1：启动MemOS API服务
首先您需要在.env中配置您的Chat Model List
```dotenv
CHAT_MODEL_LIST=[{"backend": "qwen", "api_base": "https://dashscope.aliyuncs.com/compatible-mode/v1", "api_key": "xxx", "model_name_or_path": "qwen2.5-72b-instruct", "support_models": ["qwen2.5-72b-instruct"]}, {"backend": "deepseek", "api_base": "https://dashscope.aliyuncs.com/compatible-mode/v1", "api_key": "xxx", "model_name_or_path": "deepseek-r1", "support_models": ["deepseek-r1"]}]
```
```bash
uvicorn memos.api.server_api:app --host 0.0.0.0 --port 8001 --workers 8
```

#### 步骤2：调用chat api接口

**非流式**
```bash
curl -X POST "http://0.0.0.0:8001/product/chat/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "memos_user_123",
    "readable_cube_ids": ["xxx"],
    "writable_cube_ids": ["xxx"],
    "query": "我暑假定好去广州旅游，住宿的话有哪些连锁酒店可选？",
    "model_name_or_path": "deepseek-r1",
    "add_message_on_answer": true
  }'
```

**流式**
```bash
curl -N -X POST "http://0.0.0.0:8001/product/chat/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "memos_user_123",
    "readable_cube_ids": ["xxx"],
    "writable_cube_ids": ["xxx"],
    "query": "我暑假定好去广州旅游，住宿的话有哪些连锁酒店可选？",
    "model_name_or_path": "deepseek-r1",
    "add_message_on_answer": true
  }'
```
