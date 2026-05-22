---
title: Memory Mechanism Overview
desc: Understand the full MemOS memory flow, from writing information to memory production, scheduling, recall, feedback, and lifecycle management.
---

MemOS is not just a place to store chat logs. It turns raw conversations, user events, and business knowledge into long-term memories that can be searched, updated, scheduled, and injected into future AI responses.

This overview explains the full flow first. You only need to understand four questions: **what gets written, how it becomes memory, when it is recalled, and how it keeps improving**.

## Full Flow

The memory flow can be read as a loop:

1. Write conversations, events, or knowledge.
2. Produce facts, preferences, skills, and other memory types.
3. Store, index, version, deduplicate, and schedule memories.
4. Recall useful memories through retrieval, filtering, and reranking.
5. Use recalled memories in the prompt to generate a response.
6. Feed corrections and updates back into storage and scheduling.

## 1. Write: Send Raw Information to MemOS

Developers usually write user conversations through `addMessage`, but MemOS can also be integrated through APIs, SDKs, CLI, MCP, or Agent plugins. Inputs can include conversations, user events, business knowledge, or tool execution traces.

The key idea is: **you submit raw information, and MemOS turns it into reusable memory**. You do not need to handwrite extraction, deduplication, and long-term maintenance logic yourself.

## 2. Produce: Turn Raw Input Into Structured Memories

Memory production converts raw input into facts, preferences, tool memories, skills, and knowledge-base memories. MemOS processes memory in layers to balance speed and quality:

- **Fast**: write quickly so newly added information can be recalled soon.
- **Fine**: organize recent context and extract stable facts, preferences, and task abilities.
- **Offline**: review globally, deduplicate, merge, repair conflicts, and maintain consistency.

Read more: [Memory Production](/memos_cloud/introduction/mem_production)

## 3. Schedule: Keep Memories Improving in the Background

Memory is not static. As users continue interacting, preferences change and old information may become invalid. The system needs to decide which memories should be updated, merged, downgraded, or deprecated.

Memory scheduling organizes these background tasks so memory quality keeps improving without interrupting the user experience.

Read more: [Memory Schedule](/memos_cloud/introduction/mem_schedule)

## 4. Recall: Retrieve Useful Memories When Needed

When a new request arrives, applications can use `searchMemory` to retrieve relevant memories. Recall is not just keyword matching. It combines semantics, tags, time, user identity, and business context to find memories that actually help answer the current request.

After recall, developers usually assemble useful memories into the prompt so the model can generate a more personalized and continuous response.

Read more: [Memory Recall](/memos_cloud/introduction/mem_recall)

## 5. Feedback and Lifecycle: Correct, Update, and Deprecate Memories

Real users correct the AI. Business state changes. Old preferences can become invalid. MemOS uses Memory Feedback and lifecycle management to feed those changes back into the memory system.

This means MemOS does not only remember what once happened. It also maintains what should be trusted now. A memory can evolve through versions while preserving context and avoiding stale information polluting future responses.

Read more: [Memory Lifecycle](/memos_cloud/introduction/mem_lifecycle)

## Next Steps

To run your first integration, continue with [Quick Start](/memos_cloud/getting_started/quick_start).

To inspect API details, go to the [API Documentation](/api_docs/start/overview).
