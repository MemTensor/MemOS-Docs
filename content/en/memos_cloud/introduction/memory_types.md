---
title: Memory Categories
desc: Understand the different categories of memories generated and used by MemOS.
---

MemOS generates and uses different categories of memories. They play different roles during recall: some confirm facts, some describe preferences, some summarize user profiles and complete events, some guide how an Agent should complete a task, and some provide supporting knowledge. Distinguishing memory categories helps retrieval return more relevant content and gives the model more accurate context.

## 1. Fact Memories

Fact memories describe relatively objective information, usually from explicit user statements, behavior events, files, or feedback.

Common examples:

- The user lives in Shanghai.
- The user's device is a 13-inch Intel MacBook Pro.

Fact memories are useful for answering questions such as "who is the user", "what has the user done", "what state is the user currently in", and "whether something happened".

::note

Memories may change over time. MemOS combines [Time Awareness](/memos_cloud/introduction/time_awareness) and [Memory Lifecycle Management](/memos_cloud/introduction/mem_lifecycle) to handle these changes.

::

## 2. Preference Memories

Preference memories describe long-term or stage-specific user tendencies. They may come from explicit user statements, or from summaries and inferences based on repeated behavior.

Common examples:

- The user prefers concise and direct answers.
- When planning trips, the user prefers cultural attractions and dislikes shopping malls.
- When buying pet food, the user needs to avoid chicken flavor.

Preference memories are useful for recommendation, generation, ranking, and personalized decisions. They do more than answer "what did the user say"; they help the Agent decide "what would better fit this user".

## 3. Profile

Profile memories build a structured picture of a user. Scattered information from conversations is extracted and mapped to predefined attribute fields, then automatically updated and completed as the conversation continues. Core characteristics include:

- **Structured**: the profile is made up of predefined fields, stored centrally and ready to use directly, instead of being scattered across separate memories.
- **Continuously updated**: as the conversation continues, MemOS automatically updates attribute fields so the profile always reflects the user's latest state.
- **Field-level control**: you can configure whether each field allows automatic updates. Key fields can be locked to keep core settings stable.

Example structure:

```plaintext
Basic Info
  Name: Zhang San
  Occupation: Engineer
  Location: Hangzhou
Interests
  Hobbies: camping, indie games
  Favorite music: folk
Personality Tags
  Three keywords: cheerful, curious, meticulous
```

Suitable for scenarios such as personal assistants and emotional companion / virtual characters, to strengthen conversation consistency and stability and let AI remember who the user is over the long term. See [Profile](/memos_cloud/features/profile).

## 4. Event Memory

Event memory extracts structured events from conversations, keeping key elements such as time, location, and participants.

Common examples:

- On June 14, Zhang San went camping with friends by West Lake, watched the stars together at night, and talked about life plans.
- On June 10, customer Li Si submitted a return request. The support agent approved it, and it was completed on June 13.

Event memory summarizes and organizes a segment of conversation, preserving the key timeline, location, and participants. See [Event Memory](/memos_cloud/features/event_memory).

## 5. Self-Evolving Skills

MemOS automatically extracts skills from historical messages to enable self-evolving memory. You can also upload existing skill packages to a knowledge base. Tasks with stable steps, such as travel planning, reimbursement review, and customer issue triage, are good candidates for skills. See [Self-Evolving](/memos_cloud/features/self-evolving).

## 6. Tool Memories

Tool memories record "how to use tools". They are distilled from Tool Schemas, tool call parameters, tool results, and tool trajectories. They help the Agent select tools, fill parameters, and use returned results more reliably. See [Tool Memory](/memos_cloud/features/tool_calling).

## 7. Knowledge Base Memories

Knowledge Base memories come from project-level documents, policies, manuals, FAQs, process files, or Skill files. They are not part of a single user's personal history and are better shared by multiple users or Agents.

Common examples:

- Company reimbursement policy.
- Product manual.
- Return and after-sales policy.

Knowledge Base memories can participate in recall together with user memories. For example, when an employee asks "The intranet proxy does not open. Which version should I reinstall?", the knowledge base provides installation instructions, while user fact memory adds that the employee uses an Intel MacBook Pro. Combining both leads to a more accurate answer. See [Knowledge Base](/memos_cloud/features/knowledge_base).

## 8. How to Generate and Use Them

### Generating memories

Currently, MemOS generates all memory categories by default. You can use `allow_memory_view` to control which categories are allowed to be generated:

- Fact, preference, event, and skill memories are automatically extracted and updated after adding messages.
- Profile memories require creating a template and binding it to the user first. They are then automatically extracted and updated when messages are added.
- Tool memories require Tool Call information with `"role": "tool"` when adding messages.
- Knowledge Base memories require creating a knowledge base and uploading documents.

### Using memories

When searching memories, use `include_memory_view` to control which memory categories can be retrieved. If omitted, fact memories and preference memories are recalled by default. The mapping between values is as follows:

| Memory Category | Value |
| --- | --- |
| Fact Memory | `detail_factual` |
| Preference Memory | `preference` |
| Profile | `profile` |
| Event Memory | `event` |
| Skill Memory | `skill` |
| Tool Memory | `tool_memory` |

For Knowledge Base memories, pass `knowledgebase_ids` when searching to specify which knowledge bases participate in recall. Example usage:

```json
{
  "user_id": "memos_user_123",
  "query": "What is coming up recently?",
  "knowledgebase_ids": ["memos_kb_001"]
}
```

::note

For the full field list, request format, and response format, see the [Search Memory API documentation](/memos_cloud/mem_operations/search_memory).

::

## 9. Start Using Directly

::card-group
  :::card
  ---
  icon: i-ri-message-3-line
  title: Add Message
  to: /memos_cloud/mem_operations/add_message
  ---
  Write user conversations, files, and tool call traces
  :::

  :::card
  ---
  icon: i-ri-search-2-line
  title: Search Memory
  to: /memos_cloud/mem_operations/search_memory
  ---
  Retrieve different categories of memories
  :::
::
