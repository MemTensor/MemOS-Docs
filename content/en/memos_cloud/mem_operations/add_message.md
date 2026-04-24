---
title: Add Message
desc: MemOS will automatically process the multimodal content you add—such as text, files, images—into personal, retrievable memories.
---

::warning
**[Go directly to API Docs](/api_docs/core/add_message)**
<br>
<br>

**This article focuses on functionality. For detailed interface fields and restrictions, please click the link above.**
::

## 1. How to Add a Message?

Memories in MemOS are based on original message content. Any message you add is uniformly processed into retrievable memories, ready for future querying and use. When building AI applications, you can decide when to add messages to MemOS, whether you are already managing user memories or just getting started. Typical scenarios include:

*   **Batch Import**: Import existing user conversation history into MemOS at once to quickly establish initial memories.
    
*   **Real-time Addition**: Add messages to MemOS in real time every time a user sends a message.
    
*   **Add Every N Turns**: For your business needs, set to add user messages every fixed number of dialogue turns.

::note
**&nbsp;Why is memory important?**
<div style="padding-left: 2em;">

* Enables long-term memory across sessions to prevent information loss after a conversation ends.

* With ongoing interactions, the AI understands the user better and better.

* Continuously writes new information during chats, dynamically updating the user's memory.

* Shares user memories across your multiple apps or products, ensuring consistent user experience.

</div>
::


## 2. Key Parameters

*   **User ID (`user_id`)**: Uniquely identifies the user to whom the message belongs. All conversations must be associated with a specific and unique user identifier.
    
*   **Conversation ID (`conversation_id`)**: Uniquely identifies the conversation to which the message belongs. All messages must be tied to a specific and unique conversation ID.
    
*   **Messages (`messages`)**: Ordered list of messages between the user and AI, to be added to MemOS.
     

## 3. Working Principle

*   **Information Extraction**: Internally, MemOS uses an LLM to extract facts, preferences, etc., from messages and process them into memories, including types like factual memory, preference memory, tool usage memory, etc.
    
*   **Conflict Resolution**: Existing memories are checked for duplication or conflict and updated accordingly.
    
*   **Memory Storage**: Generated memories are stored in vector databases and graph databases for efficient recall during future retrieval.

All of these processes are triggered by calling the `add/message` API. Manual memory operations are not required.


## 4. Quick Start

```python
import os
import requests
import json

# Replace with your MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "user_id": "memos_user_123",
    "conversation_id": "0610",
    "messages": [
      {"role": "user", "content": "I've planned to travel to Guangzhou this summer. What chain hotels are available?"},
      {"role": "assistant", "content": "You can consider {'7 Days', 'Atour', 'Hilton'}, among others."},
      {"role": "user", "content": "I'll choose 7 Days."},
      {"role": "assistant", "content": "Alright! Let me know if you have any other questions."}
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
:::note
Want to see which memories were generated? Just copy and run the code above, then go to [**Search Memory**](/memos_cloud/mem_operations/search_memory).
:::

## 5. More Ways to Use

### Real-time Import of Conversations

You can call the API to add messages each time the user receives a reply from the model, synchronizing conversations between users and assistants with MemOS in real time. MemOS will continually update the user’s memory backend as new dialogs come in.

```python
import os
import json
import requests

os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

# Headers and Base URL
headers = {
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}",
  "Content-Type": "application/json"
}
BASE_URL = os.environ['MEMOS_BASE_URL']

def add_message(user_id, conversation_id, messages):
    data = {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "messages": messages
    }
    
    res = requests.post(f"{BASE_URL}/add/message", headers=headers, data=json.dumps(data))
    result = res.json()
  
    if result.get('code') == 0: 
      print(f"✅ Successfully added")
    else:
      print(f"❌ Add failed, {result.get('message')}")

# Add user-assistant conversation messages
add_message("memos_user_123", "memos_conversation_123",
            [{"role": "user", "content": "I ran 5 kilometers this morning, my knees feel a bit sore"}, 
             {"role": "assistant", "content": "You ran 5km this morning and feel a bit of knee soreness, which shows your joints and muscles are still adapting to the intensity. For tomorrow, I suggest reducing to about 3km, focusing on warming up and relaxation. This way you can maintain your rhythm while allowing time for recovery."}])

```

<br>

### Import Historical Conversations

If you already have an AI chat application, MemOS supports batch importing existing chat records, helping your chatbot remember users and provide more personalized replies.

```python
# Sample historical conversation data
"messages": [
  # User's conversation with AI on the first day
    {"role": "user", "content": "I love spicy food", "chat_time": "2025-09-12 08:00:00"},
    {"role": "assistant", "content": "Noted, I’ve remembered you prefer spicy food.", "chat_time": "2025-09-12 08:01:00"},
  # Conversation a few days later
    {"role": "user", "content": "But I don't like greasy foods, like spicy hotpot or braised dishes.", "chat_time": "2025-09-25 12:00:00"},
    {"role": "assistant", "content": "So you prefer light yet spicy dishes. I can recommend some suitable spicy foods for you~", "chat_time": "2025-09-25 12:01:00"}
]
```

<br>

### Record User Preferences or Behaviors

Besides importing conversations, you can also import user preferences or behavioral data (e.g., questionnaire info at first app launch) as part of their memories in MemOS.

```python
# Sample user interest information
"messages": [
    {
      "role": "user",
      "content": """
Favorite movie genres: Sci-fi, Action, Comedy
Favorite TV genres: Mystery, Historical
Favorite book genres: Popular Science, Technology, Self-improvement
Preferred learning modes: Articles, Videos, Podcasts
Exercise habits: Running, Fitness
Dietary habits: Prefer spicy, healthy eating
Travel preferences: Natural scenery, Urban culture, Adventure
Favorite chat style: Humorous, Warm, Casual
Types of help wanted from AI: Advice, Information queries, Inspiration
Topics I’m most interested in: AI, Future technologies, Film reviews
What I want AI to help with: Daily study planning, Movie & book recommendations, Providing emotional companionship
      """
    }
]
```

<br>

### Adding Messages with Memory Filters

MemOS supports recalling memories from specified ranges based on your needs. When adding messages, use the following fields to tag generated memories, so you can filter with [Memory Filter](/memos_cloud/features/basic/filters) at retrieval time.


1. **Same User Talking to Multiple Agents (Across Multiple Apps)**

Add fields like `agent_id`, `app_id` when adding a message, to mark which agent/app this dialog is associated with. This distinguishes memories of "the same user under different agents/apps".

```python
data = {
  "user_id": "memos_user_123",
  "agent_id":"health_assistant", # The agent of the current conversation, provided by the developer
  "conversation_id": 610,
  "messages":[
    {"role": "user", "content": "I ran 5 kilometers this morning, my knees feel a bit sore"}, 
    {"role": "assistant", "content": "You ran 5km this morning and feel a bit sore, which shows your joints and muscles are still adapting to the exercise. Tomorrow, limit the distance to about 3km, focus on warming up and relaxation. This keeps up your training rhythm and allows time for knee recovery."}
  ]
}

# Later, you can use "agent_id":"health_assistant" to retrieve memories of chats with this agent.
```

<br>

2. **Semantic Classification with Your Own Tagging System**

MemOS auto-generates tags for every memory, but you might want to use your own business tags. Add custom `tags` when adding messages, and MemOS will apply those labels to content as well.

```python
data = {
  "user_id": "memos_user_123",
  "conversation_id": 610,
  "tags":["Exercise Advice", "Fitness Plan", "Workout Record"], # Your custom topic classification tags
  "messages":[
    {"role": "user", "content": "I ran 5 kilometers this morning, my knees feel a bit sore"}, 
    {"role": "assistant", "content": "You ran 5km this morning and feel a bit sore, which shows your joints and muscles are still adapting. Tomorrow, limit to 3km, with focus on warm-up and relaxation."}
  ]
}

# Later, you can pass "tags":"Exercise Advice" to retrieve memories on workout suggestions.
```

::note
Want to know more? See [Custom Tagging](/memos_cloud/features/basic/custom_tags)
::

<br>

3. **Precise Filtering with Business Information**

Add `info` with structured business fields or other custom information (like `scene=order`), to precisely distinguish current scene, business line, source, status, etc.


```python
data = {
  "user_id": "memos_user_123",
  "conversation_id": 610,
  "messages":[
    {"role": "user", "content": "Help me find flights with proper timing"}, 
    {"role": "assistant", "content": "I found several flights that fit your time:\n1. Beijing → Shanghai, Feb 15, 08:30–12:30\n2. Beijing → Shanghai, Feb 15, 14:00–18:00\n3. Beijing → Shanghai, Feb 16, 09:00–13:00\nWhich would you like to book, or do you want me to filter by other options?"}
  ],
  "info":{
    "scene":"flight_ticket"
  }
}

# Later, you can use "info":{"scene":"flight_ticket"} to retrieve flight-purchase related memories.
```

<br>

**Usage Tips**

`info` supports any custom key-value pairs; all fields are stored and can be retrieved as filters.

The following fields have optimized query performance (because they are indexed):
- business_type (business type)
- biz_id (business unique identifier)
- scene (business or conversation scenario)
- custom_status (custom status)

You are not required to use these fields. Other custom fields will function the same, though query performance may vary.

::note
Note: `info` should be a flat key-value object, with both key and value as strings (for query filtering); non-string values should be converted to a string before passing in.
::

<br>

## 6. More Features

:::note
For the complete list of API fields, formats, and details, see the [Add Message API documentation](/api_docs/core/add_message).
:::

| **Function** | **Field** | **Description** |
| --- | --- | --- |
| Multimodal Messages | `messages` | Message list to add.<br>Supported roles: user / assistant / system / tool;<br>Supported message types:<br>• Text<br>• Documents, Images, see [Multimodal Messages](/memos_cloud/features/basic/multimodal).<br>• Tool call info, see [Tool Calling](/memos_cloud/features/advanced/tool_calling). |
| Async Mode | `async_mode` | Controls post-message-addition processing. Supports both async and sync modes; details in [Async Mode](/memos_cloud/features/basic/async_mode). |
| Write to Public Memory | `allow_public` | Controls whether memories from this user's messages are written to project-level shared memory (available to all users under the project). Off by default. |
| Write to Knowledge Base Memory | `allow_knowledgebase_ids` | Controls whether memories are written to specified knowledge bases associated with the project (available to all with KB access). Default is empty array; pass your target KBs as needed. See [Knowledge Base](/memos_cloud/features/advanced/knowledge_base). |
