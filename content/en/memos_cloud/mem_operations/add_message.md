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
- **Conversation ID (`conversation_id`)**: identifies which conversation the messages belong to. When passed, multiple turns of messages under the same `conversation_id` are recognized as the same context.
- **Messages (`messages`)**: an ordered list of user and AI messages to add to MemOS.

## 2. How It Works

- **Information extraction**: MemOS extracts information from messages and processes it into memories, including facts, preferences, [Profile](/memos_cloud/features/profile), [Event Memory](/memos_cloud/features/event_memory), tool memories, and more.
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

### Write User Preferences or Behavior Data

Besides conversations, user preferences, behavior data, and any other text information can be written to MemOS as raw content.

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

### Write Multimodal Content

Besides text, MemOS also supports extracting multimodal memories. When a message contains multimodal content, MemOS extracts text, visual information, and other content, then processes it into user memories.

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "1211",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "I am researching MemOS."
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://cdn.memtensor.com.cn/img/1758706201390_iluj1c_compressed.png"
                    }
                }
            ]
        },
        {"role": "assistant", "content": "Sure, would you like me to explain it?"}
    ]
}
```

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

#### Create Memory for the Agent

If [Create Independent Memory for an Agent](/memos_cloud/introduction/isolation_filters#create-independent-memory-for-an-agent) is enabled, MemOS not only extracts memories for the user, but also generates a separate memory for the Agent under that `agent_id`. This gives the Agent its own long-term memory, while still supporting simultaneous conversations and memory for multiple users.

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

### `allow_memory_view`: control which memory categories are generated

Use `allow_memory_view` to specify which [memory categories](/memos_cloud/introduction/memory_types) are allowed to be generated after this add-message call. If omitted, all categories are generated by default.

As shown below, only event memory and Profile are generated. Fact memories, preference memories, and others are not generated.

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0624",
    "allow_memory_view": ["event", "profile"],
    "messages": [
        {"role": "user", "content": "Last Tuesday afternoon, Li Si and I did a proposal review, and the customer was satisfied with the second version."},
        {"role": "assistant", "content": "Got it. Would you like me to summarize the review conclusions?"}
    ]
}
```

### `custom_extract_prompt`: customize extraction prompts

By default, MemOS uses built-in strategies to extract memories from messages. If the default strategy does not fit your business needs, you can pass custom extraction prompts via `custom_extract_prompt` to specify "what to extract" for a given stage. This configuration only takes effect for the current request and is not saved.

Supported keys fall into two categories:

| Category | Values | Stage |
| --- | --- | --- |
| Memory category | `detail_factual`, `preference`, `skill`, `profile`, `event`, `tool_memory` | Extraction of the corresponding [memory category](/en/memos_cloud/introduction/memory_types) |
| Input modality | `image`, `document` | Extraction of image content and file content |

Note the following when using this field:

* A custom prompt only replaces the default extraction strategy of the corresponding stage. Output formats and other protocol constraints are still enforced by the server, and memories are returned in the default structure.
* If `document` is not configured, file content falls back to the custom prompt of `detail_factual`.
* A memory-category key takes effect only when that category is allowed by `allow_memory_view`. `image` and `document` are not affected by `allow_memory_view`.

As shown below, this call only extracts facts related to travel arrangements, and only visible text is extracted from images:

```python
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0827",
    "custom_extract_prompt": {
        "detail_factual": "Extract only facts related to travel arrangements, and ignore greetings and small talk.",
        "image": "Extract only visible text and ticket information from the image."
    },
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "Please take a look at this flight itinerary."},
                {"type": "image_url", "image_url": {"url": "https://example.com/itinerary.png"}}
            ]
        }
    ]
}
```

### Group Chat: Pass a List for `user_id`

When multiple users talk in the same conversation, `user_id` can accept a list, indicating the subjects that own the memories. Use `role_id` and `role_name` to identify the speaker of each message. See [Group Chat](/memos_cloud/features/group_chat).

```python
data = {
    "user_id": ["memos_user_1", "memos_user_2"],
    "agent_id": "memos_agent",
    "conversation_id": "group_conv_001",
    "messages": [
        {"role": "user", "role_id": "memos_user_1", "role_name": "Alex", "content": "Does next Tuesday work for the proposal review?"},
        {"role": "user", "role_id": "memos_user_2", "role_name": "Jordan", "content": "Works for me, 2pm."},
        {"role": "assistant", "role_id": "memos_agent", "content": "Got it. Proposal review next Tuesday at 2pm."}
    ]
}
```


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
  icon: i-ri-timer-flash-line
  title: Async Mode
  to: /memos_cloud/features/async_mode
  ---
  Control how messages are processed after writing.
  :::

  :::card
  ---
  icon: i-ri-group-line
  title: Group Chat
  to: /memos_cloud/features/group_chat
  ---
  Multiple users in the same conversation; memory is extracted for each participant.
  :::

::
