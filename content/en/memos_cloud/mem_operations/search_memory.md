---
title: Search Memory
desc: MemOS recalls relevant memories through semantic retrieval and filtering capabilities.
---

::warning
**[Click here to view the API documentation directly](/api_docs/core/search_memory)**
<br>
<br>

**This article focuses on functionality instructions. For detailed interface fields and restrictions, please click the link above.**
::

## 1. What is Memory Retrieval?

Memory retrieval refers to how MemOS, upon receiving a user's query, returns the most relevant and critical memory content from the memory database, combined with developer-defined filtering conditions. When generating answers, the model refers to these recalled memories to provide more accurate, relevant, and context-aware responses.

::note
**&nbsp;Why is memory retrieval needed?**
<div style="padding-left: 2em;">

*  No need to build context from scratch; directly access correct and reliable memories.

*  Use filters and other methods to ensure that recalled memories are always highly relevant to the current question.
</div>
::


## 2. Key Parameters

*   **Query Content (query)**: The user's question or statement, expressed in natural language, used to retrieve relevant memories through semantic matching.

*   **Memory Filter (filter)**: Logic conditions in JSON format to filter on agent, create_time, tags, info, and other fields, narrowing the scope of memory retrieval. For example, retrieve only "memories from the last 30 days".

*   **Relevance Threshold (relativity)**: Relevance refers to the semantic similarity between retrieved memories and the user's query; the higher the relevance score, the more closely the memory matches the current question. The relevance threshold controls the minimum matching level for retrieval. Default is 0.45, and memories below this value will be filtered out.

## 3. How It Works

- **Query Rewriting**: MemOS cleans and semantically enhances the user’s natural language query, automatically supplementing key information and retrieval intent for improved accuracy.

- **Memory Recall**

  - **Hybrid Retrieval and Ranking**: The system generates embedding vectors based on the rewritten query and uses a hybrid of keyword and vector semantic retrieval strategies to recall candidate memories that are then ranked uniformly.

  - **Memory Filtering and Selection**: Logical conditions and comparison operators are used to filter memories structurally, narrowing the retrieval range. Only the memories over the developer-set relevance threshold are kept to ensure quality results.

  - **Deduplication**: Cross-source deduplication and semantic aggregation are conducted on the recalled candidate memories.

- **Output Memories**: The final results are returned up to the set number of memory items, with a response time within 600ms, supporting subsequent reasoning and answer generation.

All these processes are triggered with a single call to the `search/memory` endpoint—no manual memory operations are required.


## 4. Quick Start
::code-group
```python [Python (HTTP)]
import os
import requests
import json

# Replace with your MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "query": "I want to go out for National Day. Please recommend me a city I haven't been to and a hotel brand I haven't stayed at.",
  "user_id": "memos_user_123",
  "conversation_id": "0928" # The current conversation ID (optional). If provided, MemOS gives higher weight to this conversation's memories but won't force a hit.
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/search/memory"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
```python [Output]
# Example output (simplified for demonstration purposes)
{
  # Fact memories
  memory_detail_list [
    {
      "memory_key": "Summer Vacation Guangzhou Travel Plan",
      "memory_value": "The user plans to travel to Guangzhou during the summer vacation and has chosen 7 Days Inn as their accommodation.",
      "conversation_id": "0610",
      "tags": [
        "travel",
        "Guangzhou",
        "accommodation",
        "hotel"
      ]
    }
  ],
  # Preference memories
  preference_detail_list [
    {
      "preference_type": "implicit_preference",  # Implicit preference
      "preference": "The user may prefer cost-effective hotel choices.",
      "reasoning": "7 Days Inn is generally known for being affordable; the user's choice indicates a preference for good value. Although the user hasn't explicitly mentioned budget or hotel preferences, selecting 7 Days may reflect a focus on price and practicality.",
      "conversation_id": "0610"
    }
  ]
}
```
::

::note
&nbsp;Note: `user_id` is required; each memory retrieval must specify a single user.
::

## 5. Example: Assembling Retrieved Memories into a Prompt

::note
**Memory Prompt Assembling**<br>

Using retrieved memories effectively requires certain techniques; here’s an example.
::

```text
# Role
You are an intelligent assistant (MemOS Assistant) with long-term memory capabilities. Your goal is to use the recalled memory fragments to provide highly personalized, accurate, and logically sound answers for the user.

# System Context
- Current time: 2026-01-06 15:05 (use this as the basis for memory freshness judgment)

# Memory Data
Below are the relevant facts and preferences retrieved by MemOS, divided into "Facts" and "Preferences".
- **Facts**: May include user attributes, history, or third-party information.
- **Caution**: Items tagged with '[assistant’s opinion]' or '[model summary]' indicate past AI inferences, **not** the user’s original words.
- **Preferences**: Explicit or implicit requirements for answer style, format, or logic.

<memories>
  <facts>
    -[2025-12-26 21:45] The user plans to travel to Guangzhou during the summer vacation and has chosen 7 Days Inn as their accommodation.
    -[2025-12-26 14:26] The user's name is Grace.
  </facts>

  <preferences>
    -[2026-01-04 20:41] [Explicit Preference] The user likes to travel to southern China.
    -[2025-12-26 21:45] [Implicit Preference] The user may prefer cost-effective hotel options.
  </preferences>
</memories>

# Critical Protocol: Memory Safety
Retrieved memories may contain **AI speculation**, **irrelevant noise**, or **subject errors**. You must strictly execute the following **"Four-Step Judgment"**: if any step fails, **discard** that memory.

1. **Source Verification**:
   - **Core**: Distinguish between user’s original words and AI inference.
   - If the memory is tagged with '[assistant’s opinion]', it is only an AI **assumption** and **must not** be treated as a user’s hard fact.
   - *Counter-example*: '[assistant’s opinion] The user loves mangoes.' If the user never said it, do NOT assume so to prevent AI feedback loops.
   - **Principle: AI summaries are for reference only and hold much lower weight than direct user statements.**

2. **Attribution Check**:
   - Is the memory’s subject really "the user"?
   - If the memory describes a **third party** (e.g., "candidate", "interviewee", "fictional character", "case data"), NEVER attribute their qualities to the user.

3. **Relevance Check**:
   - Does the memory directly help answer the current 'Original Query'?
   - If it’s just a keyword match but a totally different context, it MUST be ignored.

4. **Freshness Check**:
   - Does the memory conflict with the user's latest intent? The 'Original Query' always takes precedence.

# Instructions
1. **Examine**: Read '<facts>' and execute the Four-Step Judgment, removing noisy or untrustworthy AI findings.
2. **Execute**:
   - Only use filtered memories as background.
   - Strictly follow style requirements in '<preferences>'.
3. **Output**: Answer the question directly, and NEVER mention "memory database", "retrieval", "AI opinion", or other system-internal terms.

# Original Query
I want to go out for National Day. Please recommend me a city I haven't been to and a hotel brand I haven't stayed at.

```

## 6. More Usage Methods
### Retrieve Overall User Profile

If you need user analysis for your application, or want to display "key personal impressions" to users in your AI app in real time, you can call MemOS to retrieve user's global memories to help LLMs build personalized profiles. No need to specify `conversation_id`.

As shown below, if you’ve tried [adding a message](/memos_cloud/mem_operations/add_message) before for `memos_user_123`, you can copy this sample directly to retrieve user memories.

::code-group
```python [Python (HTTP)]
import os
import json
import requests

os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

# Headers and base URL
headers = {
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}",
  "Content-Type": "application/json"
}
BASE_URL = os.environ['MEMOS_BASE_URL']

# Directly ask for a user profile, as query
query_text = "What are my personal keywords?"

data = {
    "user_id": "memos_user_123",
    "query": query_text,
}

# Call /search/memory to retrieve relevant memories
res = requests.post(f"{BASE_URL}/search/memory", headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
```python [Output]
# Example output (simplified for demonstration purposes)

{
  # Fact memories
  memory_detail_list [
    {
      "memory_key": "AI-Assisted Requests",
      "memory_value": "The user wants AI to help plan daily studies, recommend movies and books, and provide emotional companionship.",
      "conversation_id": "0610",
      "tags": [
        "help",
        "study plan",
        "recommend",
        "companionship"
      ]
    },
    {
      "memory_key": "Type of Help Wanted from AI",
      "memory_value": "The user wants AI to provide advice, information lookup, and inspiration.",
      "conversation_id": "0610",
      "tags": [
        "AI",
        "help",
        "type"
      ]
    }
  ]
}
```
::


### Precisely Filter the Memory Retrieval Scope

MemOS provides powerful memory filter functionality, allowing developers to accurately filter retrieved memories. This is especially useful for searching by memory characteristics such as creation time, tags, or metadata.

::note
Below is an example of using memory filters. Suppose a user wants an annual summary of all "chat" memories tagged with "reading" from 2025. You can filter for memories tagged "reading", created in 2025, and where the scene is "chat":
::

::code-group
```python [Python (HTTP)]
import os
import json
import requests

os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

# Headers and base URL
headers = {
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}",
  "Content-Type": "application/json"
}
BASE_URL = os.environ['MEMOS_BASE_URL']

query_text = "My yearly reading summary"

data = {
    "user_id": "memos_user_123",
    "query": query_text,
    "filter": {
        "and": [
            {"tags": {"contains": "reading"}}, # Tags extracted by MemOS
            {"create_time": {"gte": "2025-01-01"}}, # Memory creation time
            {"create_time": {"gte": "2025-12-31"}}, # Memory creation time
            {"info":{"scene":"chat"}} # Custom field set by developer when adding message
        ]
    } # Filter for all memories tagged "reading", created in 2025, in "chat" scene.
}

# Call /search/memory to retrieve relevant memories
res = requests.post(f"{BASE_URL}/search/memory", headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
::

::note
For more filter options, see [Memory Filter](/memos_cloud/features/basic/filters).
::

### Memory Retrieval with Fewer Tokens

To help the model get higher-quality and more token-efficient memory content (reducing the number of tokens injected), MemOS supports developer-specified **Relevance Threshold (`relativity`)** and **max number of returned memories (`memory_limit_number`)**.

As shown below, setting `relativity = 0.8` and `memory_limit_number = 9` returns up to 9 memories, all with relevance above 0.8.

```python
data = {
    "user_id": "memos_user_123",
    "query": "Plan a 5-day trip to Chengdu for me.",
    "relativity": 0.8, # Relevance threshold. If not given, the default is 0 (no min relevance).
    "memory_limit_number": 9 # Max number of memories to return. Default is 9 if not provided.
}
```
Note: Currently, the `relativity` field only takes effect for factual and preference memories.


## 7. More Functions

::note
&nbsp;For the complete list of API fields, formats, and more, see [Search Memory API documentation](/api_docs/core/search_memory).
::

| **Function**       | **Related Fields**                                            | **Description**                                                     |
| ------------------ | --------------------------------------------------- | ------------------------------------------------------------------- |
| Recall preference memories   | `include_preference`<br><span style="line-height:0.6;">&nbsp;</span><br>`preference_limit_number`   | Preference memories are user preference information generated by MemOS based on user chat history. Enable this to recall user preferences in results. |
| Recall tool memories   | `include_tool_memory`<br><span style="line-height:0.6;">&nbsp;</span><br>`tool_memory_limit_number` | Tool memories are generated by MemOS from tool invocation information you've added. Enable this to recall tool memories, see [Tool Calling](/memos_cloud/features/advanced/tool_calling). |
| Recall skills   | `include_skill`<br><span style="line-height:0.6;">&nbsp;</span><br>`skill_limit_number` | Skills are reusable agent abilities generated from user memories. Enable this to recall skills, see [Skills](/memos_cloud/features/advanced/skill). |
| Specify knowledge bases | `knowledgebase_ids`                                 | Use this to restrict retrieval to specified project knowledge bases. This supports fine-grained permission control and flexible definition of accessible knowledge bases per user. See [Knowledge Base](/memos_cloud/features/advanced/knowledge_base).     |
