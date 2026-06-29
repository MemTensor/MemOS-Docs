---
title: Memory Categories
desc: Understand the different categories of memories generated and used by MemOS.
---

MemOS generates and uses different categories of memories. They play different roles during recall: some confirm events, some describe preferences, some guide how an Agent should complete a task, and some provide supporting knowledge. Distinguishing memory categories helps retrieval return more relevant content and gives the model more accurate context.

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

## 3. Self-Evolving Skills

MemOS automatically extracts skills from historical messages to enable self-evolving memory. You can also upload existing skill packages to a knowledge base. Tasks with stable steps, such as travel planning, reimbursement review, and customer issue triage, are good candidates for skills. See [Self-Evolving](/memos_cloud/features/self-evolving).

## 4. Tool Memories

Tool memories record "how to use tools". They are distilled from Tool Schemas, tool call parameters, tool results, and tool trajectories. They help the Agent select tools, fill parameters, and use returned results more reliably. See [Tool Memory](/memos_cloud/features/tool_calling).

## 5. Knowledge Base Memories

Knowledge Base memories come from project-level documents, policies, manuals, FAQs, process files, or Skill files. They are not part of a single user's personal history and are better shared by multiple users or Agents.

Common examples:

- Company reimbursement policy.
- Product manual.
- Return and after-sales policy.

Knowledge Base memories can participate in recall together with user memories. For example, when an employee asks "The intranet proxy does not open. Which version should I reinstall?", the knowledge base provides installation instructions, while user fact memory adds that the employee uses an Intel MacBook Pro. Combining both leads to a more accurate answer. See [Knowledge Base](/memos_cloud/features/knowledge_base).

## 6. How to Generate and Use Them

### Generating memories

Currently, MemOS generates all memory categories by default.

- Fact, preference, and Skill memories are generated after adding messages.
- Tool memories require Tool Call information with `"role": "tool"` when adding messages.
- Knowledge Base memories require creating a knowledge base and uploading documents.

### Using memories

When searching memories, control the following parameters according to the memory categories you need:

- `include_preference`: intelligently recall user preference memories based on the query.
- `include_skill`: intelligently recall user Skill memories based on the query.
- `include_tool_memory`: intelligently recall user tool memories based on the query.
- `knowledgebase_ids`: specify the knowledge bases that can be searched.

::note

For the full field list, request format, and response format, see the [Search Memory API documentation](/api_docs/core/search_memory).

::

## 7. Start Using Directly

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
