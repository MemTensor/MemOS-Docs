---
title: Tool Calling
desc: Add tool calling information, integrating tool calling decisions, execution results, and usage trajectories into MemOS memory.
---

::warning 
Note
<br>
<br>

**[You must first pass tool memory when calling addMessage (Click here for detailed API documentation)](/api_docs/core/add_message)**
<br>

**[Only then can you search for tool memory when calling searchMemory (Click here for detailed API documentation)](/api_docs/core/search_memory)**
<br>
<br>

**This article focuses on functional description. For detailed API fields and limits, please click the text links above.**

::

## 1. When to Use

This message structure is suitable when your Agent needs to obtain external information through tools (function / tool), and you want these "tool calling contexts and results" to be understood, associated, and precipitated as retrievable memories by MemOS.

## 2. How it Works

Step 1: Add Tool Calling Information

`assistant` message: `tool_calls` describes the model's decision to call a tool and its parameters.

`tool` message: Carries the actual tool execution result and precisely associates with the corresponding `tool_calls` via `tool_call_id`.

<br>

Step 2: MemOS Processes Tool-Related Memory

*  **Tool Schema**: MemOS supports structured management and dynamic updates of tool information, unifying the description of different tools. This enables the model to efficiently retrieve, understand, and discover tools without hardcoding tool details in prompts.

*  **Tool Trajectory Memory**: MemOS extracts and stores key trajectories during tool usage, including "what tool was called in what context, what parameters were used, and what result was returned". These trajectories can be retrieved and reused in subsequent conversations, helping the model reproduce tool usage patterns more stably and reducing repetitive trial-and-error and calling errors.

## 3. Usage Example

For a complete list of API fields, formats, etc., please refer to the [Add Message API Documentation](/api_docs/core/add_message) to see how to add tool calling information.

### Add Tool Calling Information

::note{icon="websymbol:chat"}
&nbsp;Session A: User asks [How is the weather in Beijing] in the conversation. The assistant calls the [Weather Tool]. The weather tool returns the result [Beijing, Temperature 7°C, Cloudy].
::

```python
import os
import requests
import json

# Replace with your MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

# Message sequence with tool_call
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

### Retrieve Tool Memory

::note{icon="websymbol:chat"}
&nbsp;Session B: In a new session, the user asks [What clothes are suitable for Beijing]. MemOS can recall relevant tool memories from past [Weather Tool Calls]. The model can use tool memories in the future to improve the accuracy and effectiveness of tool usage.
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
    "query": "What clothes are suitable for Beijing",
    "memory_limit_number": 10,
    "include_preference": True,
    "preference_limit_number": 10,
    "include_tool_memory":True,
    "tool_memory_limit_number":10,
}

headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/search/memory"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(json.dumps(res.json(), indent=2, ensure_ascii=False))
```

### Output Result

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
        "tool_experience": "The 'get_weather' tool requires a valid location parameter and provides current weather information for that location." # New: Experience with this tool in the current trajectory.
      }
    ],
    "create_time": 1768390489180,
    "conversation_id": "demo-conv-id",
    "status": "activated",
    "update_time": 1768390489181,
    "relativity": 0.47883897395535013,
    "experience": "when encountering weather inquiry tasks, then ensure to call the 'get_weather' tool with the correct location parameter." # New: Procedural experience of the entire trajectory, serving as overall guidance for task completion.
  }
]
```
