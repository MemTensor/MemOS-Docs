---
title: Multi-user / Multi-Agent Isolation
desc: Understand how MemOS Cloud separates users, Agents, conversations, and shared knowledge.
---

If your product is used by multiple users, Agents, projects, or business scenarios, memories need clear boundaries.

- Project boundaries separate different products or business spaces.
- User boundaries separate personal memories for different users within the same project.
- Agent / application boundaries separate memories produced by different Agents or apps for the same user.
- Conversation context marks which conversation or task a memory came from.
- Shared project knowledge can be placed in a knowledge base or public memory, and used by authorized users.

## 1. Project Boundary: Create a Project and Use an API Key

If you have not registered for the cloud service, first sign in to the [MemOS Console](https://memos-dashboard.openmem.net/quickstart). New users get a default project. If you need to isolate different products or business spaces, create a new project in the console.

Each project has its own API Key list. When you use an API Key from a project, your requests access memories under that project. Go to the [API Key page](https://memos-dashboard.openmem.net/apikeys) to get an API key quickly.

::note

For project creation, switching, and API key management, see [Project Configuration](/api_docs/start/configuration).

::

## 2. User Memories: Use Different `user_id` Values

Each user should have a unique `user_id`. The same user can keep using the same `user_id` across different entries or applications, so MemOS can build continuous long-term memories.

Write a memory for user A:

```json
{
  "user_id": "user_a",
  "messages": [
    { "role": "user", "content": "I like spicy food." }
  ]
}
```

Search memories for user B:

```json
{
  "user_id": "user_b",
  "query": "Recommend a hotel for me"
}
```

This search only looks in user B's personal memories. It will not retrieve user A's memories. Even if both users are in the same project and talk to the same Agent, different `user_id` values keep the memory boundary clear.

## 3. Multi-Agent Isolation: Use `agent_id`

If the same user uses multiple Agents, such as a customer service assistant, health assistant, and coding assistant, assign different `agent_id` values to different Agents.

When adding messages for a health assistant, pass `"agent_id": "health_assistant"`:

```json
{
  "user_id": "user_123",
  "agent_id": "health_assistant",
  "messages": [
    { "role": "user", "content": "I ran 5 km today, and my knee feels a little sore." }
  ]
}
```

When searching memories, use `filter` to limit memories to the corresponding Agent:

```json
{
  "user_id": "user_123",
  "query": "Give me advice based on my recent exercise.",
  "filter": {
    "and": [
      { "agent_id": "health_assistant" }
    ]
  }
}
```

This keeps the user's long-term memory under the same person while still allowing memories from different Agents to be filtered when needed.

::note

For more filtering options, see [Memory Filters](/memos_cloud/features/filters).

::

## 4. Current Conversation: Use `conversation_id`

To help MemOS understand context, pass a `conversation_id` when adding user messages. It indicates which conversation or task the message belongs to.

```json
{
  "user_id": "user_123",
  "conversation_id": "order_refund_001",
  "messages": [
    { "role": "user", "content": "I want to ask about my refund progress." },
    { "role": "assistant", "content": "The refund is still being processed and is expected to arrive within 24 hours." }
  ]
}
```

When searching memories, `conversation_id` is not a mandatory filter. Passing it clarifies the current conversation and gives memories from this conversation higher weight. If you do not pass it, MemOS still searches the user's historical memories.

## 5. Shared Knowledge: Use Knowledge Bases or Public Memory

Not everything should be written into a user's personal memory. Project documents, policies, product manuals, SOPs, and other shared knowledge are better placed in a knowledge base or public memory.

### Knowledge Base

For project documents, policies, and product manuals, create a knowledge base and upload documents. See [Knowledge Base](/memos_cloud/features/knowledge_base) for the full workflow. During search, pass `knowledgebase_ids` in addition to user memory so the answer can also refer to project-level knowledge.

```json
{
  "user_id": "user_123",
  "query": "Based on my situation and the company policy, can this expense be reimbursed?",
  "knowledgebase_ids": ["kb_finance_policy"]
}
```

### Public Memory

Public memory is suitable for lightweight shared information such as project announcements, team experience, and general rules. If a message should be shared by all users under the project, enable `allow_public` when writing it.

```json
{
  "user_id": "user_123",
  "allow_public": true,
  "messages": [
    { "role": "user", "content": "The reimbursement deadline for this quarter is June 25." }
  ]
}
```

During retrieval, user personal memories and public memories are searched together and relevant content is recalled.
