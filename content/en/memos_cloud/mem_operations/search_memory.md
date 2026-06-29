---
title: Search Memory
desc: MemOS recalls relevant memories through semantic retrieval and filtering.
---

## 1. What Is Memory Retrieval?

Memory retrieval means that when a user asks a question, MemOS recalls the most relevant and important memories from the memory store, combined with filters predefined by developers. The model can then refer to these memories when generating an answer, making the response more accurate, contextual, and aligned with the user.

::note
**Why memory retrieval is needed**

- Get correct and reliable memories directly instead of rebuilding context from scratch.
- Use filters and other controls to keep recalled memories highly relevant to the current question.
::

## 2. Key Parameters

- **Query (`query`)**: the user's question or statement used for retrieval. MemOS uses semantic matching to find related memories.
- **Memory filter (`filter`)**: JSON-based logical conditions used to filter fields such as `agent_id`, `create_time`, `tags`, and `info`, narrowing the retrieval scope. You can also set separate filters for user memories, public memories, and knowledge base memories.
- **Relevance threshold (`relativity`)**: controls how semantically relevant a recalled memory must be. The current default threshold is `0.45`; memories below this value are filtered out.

## 3. How It Works

- **Query rewriting**: MemOS cleans and semantically enhances the natural-language query, supplementing key information and retrieval intent to improve retrieval accuracy.
- **Memory recall**: the system retrieves candidate memories from available memory sources.
- **Hybrid retrieval and ranking**: based on the rewritten query, the system generates embeddings and combines keyword retrieval with vector semantic retrieval, then ranks candidate memories by relevance.
- **Memory filtering and screening**: structured filters and comparison operators narrow the retrieval scope; the configured relevance threshold controls result quality.
- **Result deduplication**: candidate memories are deduplicated and semantically aggregated across sources.
- **Memory output**: final results are returned according to the configured memory limit, usually within 600 ms, for later reasoning and answer generation.

All of these steps are triggered by calling the `search/memory` API. You do not need to manually operate on user memories.

## 4. Quick Start

::code-group

```python [Python (HTTP)]
import requests

API_KEY = "YOUR_API_KEY"
BASE_URL = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "query": "I want to travel during the National Day holiday. Please recommend a city I have not been to and a hotel brand I have not stayed at.",
  "user_id": "memos_user_123",
  "conversation_id": "0928"
}

res = requests.post(
  f"{BASE_URL}/search/memory",
  headers={"Authorization": f"Token {API_KEY}"},
  json=data
)

print(res.json())
```

```python [Python (SDK)]
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

res = client.search_memory(
  query="I want to travel during the National Day holiday. Please recommend a city I have not been to and a hotel brand I have not stayed at.",
  user_id="memos_user_123",
  conversation_id="0928"
)

print(res)
```

```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/search/memory \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "I want to travel during the National Day holiday. Please recommend a city I have not been to and a hotel brand I have not stayed at.",
    "user_id": "memos_user_123",
    "conversation_id": "0928"
  }'
```

::

::note
`user_id` is required. Each memory retrieval request currently targets a single user.
::

Need the complete field list, request format, and response format? See the [Search Memory API documentation](/api_docs/core/search_memory).

## 5. Prompt Template with Memories

Recalled memories can be added directly to the prompt of your AI application. The following template is a practical reference.

<details class="not-prose my-5 rounded-md border border-default bg-muted/30 px-4 py-3">
  <summary class="cursor-pointer select-none text-sm font-medium text-highlighted">
    Expand the full prompt template
  </summary>
  <div class="mt-4">

```text
# Role
You are an intelligent assistant with long-term memory (MemOS Assistant). Your goal is to combine retrieved memory fragments to provide highly personalized, accurate, and logically rigorous answers.

# System Context
- Current time: 2026-01-06 15:05 (use this as the baseline for judging memory freshness)

# Memory Data
The following information was retrieved by MemOS and is divided into facts and preferences.
- **Facts**: May include user attributes, historical conversations, or third-party information.
- **Important**: Content marked as '[assistant view]' or '[model summary]' represents past AI inference, not the user's original words.
- **Preferences**: Explicit or implicit requirements for response style, format, or reasoning.

<memories>
  <facts>
    -[2025-12-26 21:45] The user plans to travel to Guangzhou during the summer vacation and chose 7 Days Inn as the accommodation option.
    -[2025-12-26 14:26] The user's name is Grace.
  </facts>

  <preferences>
    -[2026-01-04 20:41] [Explicit Preference] The user likes traveling to southern regions.
    -[2025-12-26 21:45] [Implicit Preference] The user may prefer cost-effective hotel options.
  </preferences>
</memories>

# Critical Protocol: Memory Safety
Retrieved memories may contain AI inferences, irrelevant noise, or incorrect subjects. You must apply the following four checks. If a memory fails any check, discard it.

1. Source verification:
   - Distinguish the user's original words from AI inference.
   - If a memory is marked as '[assistant view]', treat it as a past hypothesis, not an absolute user fact.
   - Example: if a memory says '[assistant view] the user loves mangoes' but the user never said so, do not assume the user likes mangoes.
   - Principle: AI summaries are only references and have much lower authority than direct user statements.

2. Attribution check:
   - Is the subject of the memory definitely the user?
   - If the memory describes a third party, candidate, fictional role, or case data, never attribute those traits to the user.

3. Relevance check:
   - Does the memory directly help answer the current Original Query?
   - If it is only a keyword match with a different context, ignore it.

4. Freshness check:
   - Does the memory conflict with the user's latest intent? Treat the current Original Query as the highest-priority source of truth.

# Instructions
1. Review <facts> first, apply the four checks, and remove noise and unreliable AI views.
2. Use only validated memories as background context.
3. Follow the style requirements in <preferences>.
4. Answer directly. Do not mention "memory store," "retrieval," or "AI views."

# Original Query
I want to travel during the National Day holiday. Please recommend a city I have not been to and a hotel brand I have not stayed at.
```

  </div>
</details>

## 6. More Usage

### `conversation_id`: prioritize memories from the current conversation

When searching memories, you can pass a specific `conversation_id`. MemOS prioritizes memories related to the current conversation. If you omit it, MemOS searches the user's long-term memories globally, which is suitable when you need the user's overall profile.

```python
data = {
    "user_id": "memos_user_123",
    "query": "Help me continue planning my National Day trip.",
    "conversation_id": "0928"
}
```

### `filter`: precisely narrow the retrieval scope

MemOS supports `filter` to narrow retrieval by tags, time, business fields, and other conditions. You can also set separate filters for user memories, knowledge base memories, and public memories.

Example 1: retrieve all conversation memories related to reading in 2025.

```python
data = {
    "user_id": "memos_user_123",
    "query": "Summarize my reading-related points this year.",
    "filter": {
        "and": [
            {"tags": {"contains": "reading"}},
            {"create_time": {"gte": "2025-01-01"}},
            {"create_time": {"lte": "2025-12-31"}},
            {"scene": "chat"},
        ],
    },
}
```

Example 2: filter knowledge base, user, and public memories separately.

```python
data = {
    "user_id": "memos_user_123",
    "query": "Combine knowledge base policies, my conversation records, and project announcements to summarize compliance points.",
    "knowledgebase_ids": ["kb_xxx"],
    "filter": {
        "knowledgebase": {
            "and": [
                {"tags": {"contains": "policy"}},
                {"create_time": {"gte": "2025-01-01"}},
                {"create_time": {"lte": "2025-12-31"}},
            ]
        },
        "user": {
            "and": [
                {"agent_id": "compliance_assistant"},
                {"scene": "chat"},
                {"create_time": {"gte": "2025-06-01"}},
            ]
        },
        "public": {
            "and": [
                {"tags": {"contains": "announcement"}},
            ]
        },
    },
}
```

::note
For more filter conditions and nested syntax, see [Memory Filters](/memos_cloud/features/filters).
::

### `relativity` / `memory_limit_number`: control recall quality and quantity

Pass `relativity` to raise the relevance threshold. Pass `memory_limit_number` to limit the number of returned memories and reduce the token cost of later prompt injection.

```python
data = {
    "user_id": "memos_user_123",
    "query": "Plan a 5-day trip to Chengdu for me.",
    "relativity": 0.8,
    "memory_limit_number": 9
}
```

## 7. Common Errors and Troubleshooting

| Error Code | Common Cause | How to Fix |
| --- | --- | --- |
| `40000` | The request body structure is invalid, or a field type is incorrect | Check whether `query` is a string and whether `knowledgebase_ids` is a string array |
| `40002` | A required field is missing | Check that both `user_id` and `query` are provided and non-empty |
| `40011` | `conversation_id` is too long | Use a short ID. Do not put the full question or chat history into `conversation_id` |
| `40012` | `relativity` is invalid | Pass a number between 0 and 1 |
| `40305` | A single request exceeds the token limit | Shorten `query`; do not put long documents directly into the search query |
| `50123` | The knowledge base is not associated with the current project | Go to [Project Configuration](/api_docs/start/configuration) and confirm the knowledge base is associated with the project that owns the API Key |
| `50005` | Search service is temporarily unavailable | Retry later. If it persists, contact support |



## 8. More Features

::card-group
  :::card
  ---
  icon: i-ri-tools-line
  title: Recall Tool Memories

  to: /memos_cloud/features/tool_calling
  ---
  Add tool call information and recall tool memories.
  :::

  :::card
  ---
  icon: i-ri-book-read-line
  title: Recall Skills

  to: /memos_cloud/features/self-evolving
  ---
  Automatically generate skills and recall reusable Skill memories.
  :::

  :::card
  ---
  icon: i-ri-database-2-line
  title: Search Knowledge Bases

  to: /memos_cloud/features/knowledge_base
  ---
  Enable knowledge bases and specify which knowledge bases can be searched.
  :::
::
