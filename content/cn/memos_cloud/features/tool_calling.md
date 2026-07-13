---
title: 工具调用ToolCall
desc: 添加工具调用信息，将工具调用的决策、执行结果及其使用轨迹统一纳入 MemOS 记忆。
---

::warning 
注意
<br>
<br>

**[需要先在addMessage的时候传入工具记忆（点此查看详细 API 文档）](/api_docs/core/add_message)**
<br>

**[才能在searchMemory的时候搜索到工具记忆（点此查看详细 API 文档）](/api_docs/core/search_memory)**
<br>
<br>

**本文聚焦于功能说明，详细接口字段及限制请点击上方文字链接查看**

::

## 1. 何时使用

当您的 Agent 需要通过工具（function / tool）获取外部信息，并希望这些「工具调用的上下文与结果」能够被 MemOS 一并理解、关联和沉淀为可检索记忆时，适合使用这种消息结构。

## 2. 工作原理

Step1：添加工具调用信息

`assistant` 消息： `tool_calls` 描述模型决定调用某个工具的行为及其参数。

`tool` 消息：携带真实的工具返回结果，并通过 `tool_call_id` 与对应的 `tool_calls` 精确关联。

<br>

Step2：MemOS 处理工具相关记忆

*  **工具信息（Tool Schema）**：MemOS 支持对工具信息的结构化管理与动态更新，统一不同工具的描述方式，使模型能够高效地进行工具检索、理解与发现，而无需在提示词中硬编码工具细节。

*  **轨迹记忆（Tool Trajectory Memory）**：MemOS 会对工具使用过程中的关键轨迹进行抽取与存储，包括“在什么上下文下调用了什么工具、使用了哪些参数、返回了什么结果”。这些轨迹可在后续对话中被检索和复用，帮助模型更稳定地重现工具使用模式，减少重复试探和调用错误。

## 3.使用示例

有关 API 字段、格式等信息的完整列表，详见[Add Message 接口文档](/api_docs/core/add_message)查看如何添加工具调用信息。

### 添加工具调用信息

::note{icon="websymbol:chat"}
&nbsp;会话 A：用户在对话中询问【北京天气如何】，助手调用【天气工具】，天气工具得出结果【北京，温度7°C，阴天】。
::

```python
import os
import requests
import json

# 替换成你的 MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

# 带 tool_call 的消息序列
tool_schema = [{
    "name": "get_weather",
    "description": "Get current weather information for a given location",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "City name, e.g. Beijing"
            }
        },
        "required": [
            "location"
        ]
    }
}]

data = {
    "user_id": "memos_user_123",
    "conversation_id": "demo-conv-id",
    "messages": [
        {
            "role": "system",
            "content": f"""You are an assistant that can call tools.
When a user's request can be fulfilled by a tool, you MUST call the appropriate tool.
<tool_schema>
{json.dumps(tool_schema, indent=2, ensure_ascii=False)}
</tool_schema>
"""
        },
        {"role": "user", "content": "What's the weather like in Beijing right now?"},
        {
            "role": "assistant",
            "tool_calls": [
                {
                    "id": "call_123",
                    "type": "function",
                    "function": {
                        "name": "get_weather",
                        "arguments": json.dumps({"location": "Beijing"}),
                    },
                }
            ],
        },
        {
            "role": "tool",
            "tool_call_id": "call_123",
            "content": [
                {
                    "type": "text",
                    "text": json.dumps(
                        {"location": "Beijing", "temperature": "7°C", "condition": "Cloudy"}
                    ),
                }
            ],
        },
    ],
}

headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/message"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(json.dumps(res.json(), indent=2, ensure_ascii=False))
```

### 检索工具记忆

::note{icon="websymbol:chat"}
&nbsp;会话 B：在新会话中，用户询问【北京适合穿什么衣服】，MemOS能够召回过往【天气工具调用】的相关工具记忆，模型可在后续使用工具记忆，提升工具使用的准确率、有效性。
::

```python
import os
import requests
import json

os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"


data = {
    "user_id": "memos_user_123",
    "conversation_id": "0928",
    "query": "北京适合穿什么衣服",
    "include_memory_view": ["tool_memory"],
    "memory_limit_number": 10
}

headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/search/memory"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(json.dumps(res.json(), indent=2, ensure_ascii=False))
```

### 输出结果

```python
"tool_memory_detail_list": [
   {
    "id": "7ec50fd8-19ec-42a2-a7c7-ce3cebdb70cf",
    "tool_type": "ToolSchemaMemory",
    "tool_value": {"name": "get_weather", "description": "Get current weather information for a given location", "parameters": {"type": "object", "properties": {"location": {"type": "string", "description": "City name, e.g. Beijing"}}, "required": ["location"]}},
    "create_time": 1766494806624,
    "conversation_id": "demo-conv-id",
    "status": "activated",
    "update_time": 1766494806625,
    "relativity": 0.44700349055540967
  },
  {
    "id": "4b208707-991a-481c-9dd6-c7f0577ff371",
    "tool_type": "ToolTrajectoryMemory",
    "tool_value": "User asked about the current weather in Beijing -> Tool 'get_weather' was called with the parameter 'location' set to 'Beijing' -> The tool returned the weather information: temperature is 7°C and condition is Cloudy.",
    "tool_used_status": [
      {
        "used_tool": "get_weather",
        "error_type": "",
        "success_rate": 1.0,
        "tool_experience": "The 'get_weather' tool requires a valid location parameter and provides current weather information for that location." #新增：当前轨迹中该工具的经验。
      }
    ],
    "create_time": 1768390489180,
    "conversation_id": "demo-conv-id",
    "status": "activated",
    "update_time": 1768390489181,
    "relativity": 0.47883897395535013,
    "experience": "when encountering weather inquiry tasks, then ensure to call the 'get_weather' tool with the correct location parameter." #新增：整个轨迹的程序性经验，作为指导任务完成的总体经验。
  }
]
```
