---
title: Multi-user / Multi-Agent Isolation
desc: Implement memory sharing and isolation across users, Agents, conversations, and more.
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
  "user_id": "memos_user_A",
  "messages": [
    { "role": "user", "content": "I like spicy food." }
  ]
}
```

Search memories for user B:

```json
{
  "user_id": "memos_user_B",
  "query": "Recommend food for me"
}
```

This search only looks in user B's personal memories. It will not retrieve user A's memories. Even if both users are in the same project and talk to the same Agent, different `user_id` values keep the memory boundary clear.

<!-- markdownlint-disable MD033 -->
### Multi-User Memory in Group Chat: Pass a `user_id` List <span style="font-size:11px;background:#10b981;color:#fff;padding:2px 6px;border-radius:4px;vertical-align:middle;position:relative;top:-1px;">NEW</span>
<!-- markdownlint-enable MD033 -->

When multiple users talk in the same conversation, `user_id` can accept a list, and MemOS extracts and maintains memory for each participant.

```json
{
  "user_id": ["memos_user_1", "memos_user_2"],
  "agent_id": "memos_agent",
  "messages": [
    { "role": "user", "role_id": "memos_user_1", "role_name": "Alex", "content": "Does next Tuesday work for everyone for the proposal review?" },
    { "role": "user", "role_id": "memos_user_2", "role_name": "Jordan", "content": "Works for me. How about 2pm?" },
    { "role": "assistant", "role_id": "memos_agent", "content": "Got it. Proposal review next Tuesday at 2pm." }
  ]
}
```

Use `role_id` and `role_name` to identify the speaker of each message so memory text can distinguish who said what.

::note
For more on group chat, see [Group Chat](/memos_cloud/features/group_chat).
::

## 3. Multi-Agent Isolation: Use `agent_id`

If the same user uses multiple Agents, such as a customer service assistant, health assistant, and coding assistant, assign different `agent_id` values to different Agents.

When adding messages for a health assistant, pass `"agent_id": "health_assistant"`:

```json
{
  "user_id": "memos_user_123",
  "agent_id": "health_assistant",
  "messages": [
    { "role": "user", "content": "I ran 5 km today, and my knee feels a little sore." }
  ]
}
```

When searching memories, use `filter` to limit memories to the corresponding Agent:

```json
{
  "user_id": "memos_user_123",
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

<!-- markdownlint-disable MD033 -->
### Create Independent Memory for an Agent <span style="font-size:11px;background:#10b981;color:#fff;padding:2px 6px;border-radius:4px;vertical-align:middle;position:relative;top:-1px;">NEW</span>
<!-- markdownlint-enable MD033 -->

Enable "Create Independent Memory for Agent" when creating or editing a project in the console to give each Agent its own memory.

- Better preserve an AI character's experience, cognition, and state.
- Support scenarios where multiple users share the same Agent, such as a household assistant or a company group-chat assistant.

After enabling this feature:

- When adding messages, MemOS extracts and updates memories for the user and the Agent separately.
- When searching memories, you can search the Agent's independent memory using `agent_id` as the subject.
- The Agent accumulates its own long-term memory, keeping the character consistent across different users and conversations.

This feature is disabled by default. In that case, `agent_id` can still be used for filtering and tagging, but no independent memory instance is created for the Agent.

## 4. Current Conversation: Use `conversation_id`

To help MemOS understand context, you can pass a `conversation_id` when adding user messages. It indicates which conversation or task the message belongs to. If omitted, the system generates one automatically.

```json
{
  "user_id": "memos_user_123",
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
  "user_id": "memos_user_123",
  "query": "Based on my situation and the company policy, can this expense be reimbursed?",
  "knowledgebase_ids": ["kb_finance_policy"]
}
```

### Public Memory

Public memory is suitable for lightweight shared information such as project announcements, team experience, and general rules. If a message should be shared by all users under the project, enable `allow_public` when writing it.

```json
{
  "user_id": "memos_user_123",
  "allow_public": true,
  "messages": [
    { "role": "user", "content": "The reimbursement deadline for this quarter is June 25." }
  ]
}
```

During retrieval, user personal memories and public memories are searched together and relevant content is recalled.
