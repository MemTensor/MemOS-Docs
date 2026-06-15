---
title: Add Message
desc: MemOS automatically processes multimodal content such as text, files, and images into retrievable personal memories.
---

::note
**Why memory matters**

- Long-term continuity: preserve information across sessions so it is not lost after one conversation ends.
- Better understanding of user preferences: as interactions accumulate, AI can understand the user more accurately.
- Continuous evolution over time: user memories can be updated dynamically during conversations.
- Cross-product experience: share the same user's memories across multiple applications or products for a consistent experience.
::

## 1. Key Parameters

- **User ID (`user_id`)**: identifies which user the messages belong to. Every added message must be associated with a unique user identifier.
- **Conversation ID (`conversation_id`)**: identifies which conversation the messages belong to. Every added message must be associated with a unique conversation identifier.
- **Messages (`messages`)**: an ordered list of user and AI messages to add to MemOS.

## 2. How It Works

- **Information extraction**: MemOS uses LLMs internally to extract facts, preferences, and other information from messages, then processes them into memories such as fact memories, preference memories, and tool memories.
- **Conflict resolution**: existing memories are checked for duplication or contradiction and updated when needed.
- **Memory storage**: generated memories are stored with vector and graph databases so they can be recalled efficiently later.

All of these steps are triggered by calling the `add/message` API. You do not need to manually operate on user memories.

## 3. Quick Start

::code-group

```python [Python (HTTP)]
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "user_id": "memos_user_123",
  "conversation_id": "0610",
  "messages": [
    {"role": "user", "content": "I have booked a summer trip to Guangzhou. Which hotel chains are available?"},
    {"role": "assistant", "content": "You can consider 7 Days Inn, Ji Hotel, Hilton, and others."},
    {"role": "user", "content": "I choose 7 Days Inn."},
    {"role": "assistant", "content": "Got it. Feel free to ask if you have other questions."}
  ]
}

res = requests.post(
  f"{BASE_URL}/add/message",
  headers={"Authorization": f"Token {API_KEY}"},
  json=data
)

print(res.json())
```

```python [Python (SDK)]
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

messages = [
  {"role": "user", "content": "I have booked a summer trip to Guangzhou. Which hotel chains are available?"},
  {"role": "assistant", "content": "You can consider 7 Days Inn, Ji Hotel, Hilton, and others."},
  {"role": "user", "content": "I choose 7 Days Inn."},
  {"role": "assistant", "content": "Got it. Feel free to ask if you have other questions."}
]

res = client.add_message(
  messages=messages,
  user_id="memos_user_123",
  conversation_id="0610"
)

print(res)
```

```bash [Curl]
export MEMOS_API_KEY="YOUR_API_KEY"
export MEMOS_BASE_URL="https://memos.memtensor.cn/api/openmem/v1"

curl "$MEMOS_BASE_URL/add/message" \
  -H "Authorization: Token $MEMOS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "memos_user_123",
    "conversation_id": "0610",
    "messages": [
      {"role": "user", "content": "I have booked a summer trip to Guangzhou. Which hotel chains are available?"},
      {"role": "assistant", "content": "You can consider 7 Days Inn, Ji Hotel, Hilton, and others."},
      {"role": "user", "content": "I choose 7 Days Inn."},
      {"role": "assistant", "content": "Got it. Feel free to ask if you have other questions."}
    ]
  }'
```

::

:::note
Want to know which memories were generated? Copy and run the code above, then continue to [Search Memory](/memos_cloud/mem_operations/search_memory).
:::

Need the complete field list, request format, and response format? See the [Add Message API documentation](/api_docs/core/add_message).

## 4. When Should You Add Messages?

Raw message content is the foundation of memory. MemOS processes added messages into memories for later retrieval and use. You can choose the right timing based on your scenario:

- **One-time import**: import existing user conversation history into MemOS to quickly build initial memories.
- **Real-time add**: add messages to MemOS whenever the user sends a message.
- **Add by turns**: add user messages every few conversation turns based on your business needs.

## 5. More Usage

The fields below are used to add time, categories, isolation, and business context when adding messages. You can use them separately or combine them as needed.

### `chat_time`: specify when the conversation happened

By default, MemOS uses the Beijing time when a message is submitted as the memory time. If you are importing historical conversations in bulk, pass `chat_time` for each message so generated memories keep a more accurate timeline.

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0930",
    "messages": [
        {"role": "user", "content": "I like spicy food.", "chat_time": "2025-09-12 08:00:00"},
        {"role": "assistant", "content": "I have noted that you like spicy flavors.", "chat_time": "2025-09-12 08:01:00"},
        {"role": "user", "content": "I do not like heavy oil.", "chat_time": "2025-09-25 12:00:00"},
        {"role": "assistant", "content": "Got it. You prefer spicy food with a lighter taste.", "chat_time": "2025-09-25 12:01:00"}
    ]
}
```

### `content`: write user preferences or behavior data

Besides conversations, user preferences, behavior data, questionnaire information, and similar content can also be written to MemOS through `content`.

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0901",
    "messages": [
        {
            "role": "user",
            "content": """
Favorite movie genres: sci-fi, action, comedy
Favorite TV genres: mystery, historical drama
Favorite book genres: popular science, technology, self-growth
Preferred chat style: humorous, warm, casual
Types of AI help wanted: suggestions, information lookup, inspiration
Topics I care about most: artificial intelligence, future technology, film reviews
What I want AI to help with: daily study planning, movie and book recommendations, emotional companionship
            """
        }
    ]
}
```

### `agent_id`: isolate memories by Agent

When adding messages, pass `agent_id` to identify which Agent the current conversation belongs to. This helps distinguish memories produced by the same user under different Agents.

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0610",
    "agent_id": "health_assistant",
    "messages": [
        {"role": "user", "content": "I ran 5 kilometers today and my knee feels a bit sore."},
        {"role": "assistant", "content": "I suggest lowering the intensity tomorrow."}
    ]
}
```

::note
During later retrieval, you can pass `"agent_id":"health_assistant"` in the `filter` parameter to retrieve memories from this user's conversations with that assistant. See [Memory Filters](/memos_cloud/features/filters).
::

### `tags`: classify memories semantically

MemOS automatically generates tags for every memory. If your business already has a tag system, you can also pass custom `tags` when adding messages, so memories better match your business classification. See [Custom Tags](/memos_cloud/features/custom_tags).

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0610",
    "tags": ["exercise advice", "fitness planning"],
    "messages": [
        {"role": "user", "content": "I ran 5 kilometers today and my knee feels a bit sore."},
        {"role": "assistant", "content": "I suggest lowering the intensity tomorrow."}
    ]
}
```

::note
During later retrieval, you can pass `"tags":"exercise advice"` in the `filter` parameter to retrieve user memories around that tag. See [Memory Filters](/memos_cloud/features/filters).
::

### `info`: pass custom information

When adding messages, include `info` to write structured information such as business scenario, source, or status. It can later be used for precise filtering during retrieval.

Common fields include:

| Field | Use |
| --- | --- |
| `business_type` | Business type |
| `biz_id` | Unique business identifier |
| `scene` | Business or conversation scenario |
| `custom_status` | Custom status |

You can also pass other custom key-value pairs. All fields can be stored and retrieved normally.

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0610",
    "messages": [
        {"role": "user", "content": "Help me find flights with suitable times."},
        {"role": "assistant", "content": "I found several flights from Beijing to Shanghai."}
    ],
    "info": {
        "scene": "flight"
    }
}
```

::note
During later retrieval, you can pass `"scene":"flight"` in the `filter` parameter to retrieve user memories around that scenario. See [Memory Filters](/memos_cloud/features/filters).
::

## 6. Common Errors and Troubleshooting

| Error Code | Common Cause | How to Fix |
| --- | --- | --- |
| `40000` | The request JSON structure is invalid, or a field type is incorrect | Check whether `messages` is an array, and whether `role` / `content` are inside each message object |
| `40002` | A required field is empty | Check that `user_id`, `conversation_id`, and `messages` are all provided and non-empty |
| `40011` | `conversation_id` is too long | Use a short ID. Do not put full conversations, user input, or JSON into `conversation_id` |
| `40013` | Total `messages` length exceeds the limit | Split historical conversations and write them in multiple requests |
| `40305` | A single request exceeds the token limit | Shorten the content in one write request and keep the key user facts and preferences first |
| `40309` | Token usage exceeds the per-time-window limit | Lower concurrency and bulk import speed, then retry in batches |
| `50143` / `50144` | Memory or message writing failed | Check the request content and retry later. If it persists, contact support |

## 7. More Features

If you need more complex write methods, continue with these extended capabilities.

::card-group
  :::card
  ---
  icon: i-ri-image-line
  title: Multimodal Messages
  to: /memos_cloud/features/multimodal
  ---
  Support text, images, documents, and other input content.
  :::

  :::card
  ---
  icon: i-ri-tools-line
  title: Tool Memory
  to: /memos_cloud/features/tool_calling
  ---
  Write tool call processes and results into user memory.
  :::

  :::card
  ---
  icon: i-ri-timer-flash-line
  title: Async Mode
  to: /memos_cloud/features/async_mode
  ---
  Control how messages are processed after writing, suitable for different latency requirements.
  :::

  :::card
  ---
  icon: i-ri-database-2-line
  title: Knowledge Base Memories
  to: /memos_cloud/features/knowledge_base
  ---
  Write memories generated from messages into a specified knowledge base.
  :::
::
