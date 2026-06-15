---
title: FAQ
desc: Understand MemOS concepts such as RAG, open source deployment, private deployment, memory lifecycle, and scheduling.
---

This page answers product-level and concept-level questions about MemOS. If you are already using MemOS Cloud and need help with projects, API Keys, quotas, or API calls, see [Cloud FAQs](/memos_cloud/support/faq) and [Quotas and Limits](/memos_cloud/support/limit).

## How is MemOS different from a standard RAG framework?

| Dimension | RAG | MemOS |
| --- | --- | --- |
| Managed content | Static knowledge chunks or document passages | Memories that evolve with users, tasks, and time |
| Content shape | Usually recalls raw text passages | Converts raw input into memory units such as facts and preferences |
| Update model | Depends on document updates or re-indexing | Supports continuous writing, updates, feedback correction, and lifecycle management |
| Recall goal | Help the model know external knowledge | Help the model understand user state, preferences, and context |

RAG is better for stable external knowledge. MemOS is better for user memories that continuously change during conversations and business workflows. They can be used together.

## Can MemOS work with existing RAG systems or knowledge graphs?

Yes. RAG handles factual retrieval and knowledge augmentation, while MemOS handles continuous memory and state management.

In a business application, you can keep stable content such as policies and product documentation in a knowledge base or RAG system, and let MemOS manage dynamic information such as user conversations, preferences, and task progress. During response generation, the application can use both external knowledge and user memories.

## How does MemOS work?

The basic workflow is:

1. Write raw information through `add/message`, knowledge bases, feedback, or related capabilities.
2. MemOS processes raw input into searchable and updateable memories.
3. Later requests recall relevant memories through `search/memory`, `chat`, or Agent integrations.
4. Memories continue to update through new input, feedback, and lifecycle policies.

If you only want to integrate the cloud service quickly, start with [Integrate into Your App](/memos_cloud/getting_started/quick_start).

## What are the core capabilities of MemOS?

- **User / Agent memory management**: store user-AI interactions and isolate memories across users and Agents.
- **Memory production and updates**: generate reusable memories from conversations, behavior events, and knowledge content.
- **Memory recall and scheduling**: select memories based on relevance, freshness, and context.
- **Memory lifecycle management**: control memory quality and scale through updates, merging, and archiving.
- **Cloud and open source options**: use the managed cloud service, or self-host and extend the open-source project.

## How should I choose between Cloud and Open Source?

Use [MemOS Cloud](/memos_cloud/getting_started/quick_start) if you want quick validation, lower operational cost, and built-in console, API Key, knowledge base, and quota management.

Use [Open Source](/open_source/getting_started/installation) if you need to manage your own deployment environment, modify lower-level implementation, connect custom inference backends, or do deeper secondary development.

For a fuller comparison, see [Cloud Service & Open Source](/memos_cloud/getting_started/cloud_and_opensource).

## Does MemOS support private deployment?

Yes. For private deployment, commercial customization, or deeper business-specific adaptation, contact the MemOS team to confirm deployment mode, data boundaries, and feature scope.

Teams that want to explore and modify MemOS themselves can also start from the open-source project.

## What is the relationship between lifecycle and scheduling?

Lifecycle management controls how memory units change over time, such as updates, merging, consolidation, or archiving. Scheduling decides which memories should enter the current context for a specific request.

In short: lifecycle management maintains memories over the long term; scheduling decides which memories to use now.

## How does MemOS avoid memory bloat?

MemOS does not append all raw history directly into model context. It processes raw input into shorter memory units and controls memory scale through updates, merging, and archiving.

During recall, MemOS selects only memories relevant to the current request, reducing unrelated context.

## Are KV-Cache and activating memory the same thing?

No. KV-Cache is a model inference-level computation cache. Activating memory is a MemOS product concept for describing recently reusable memory state.

In implementation, activating memory can use lower-level cache capabilities to improve recent-context reuse, but the two are not equivalent.

## Will MemOS slow down inference?

MemOS aims to reduce irrelevant context through memory processing and recall, instead of sending all history to the model. Actual latency depends on write volume, recall scope, filters, model calls, and business concurrency.

If you encounter quota or latency issues in cloud API calls, see [Quotas and Limits](/memos_cloud/support/limit) and [Cloud FAQs](/memos_cloud/support/faq).

## If the information is recent, such as “what I did yesterday,” is scheduling still needed?

Yes. Recent information is not always relevant, and it should not always be sent in full. Scheduling considers the current question, conversation, user memories, and relevance to choose the best memories for the current turn.

## What business scenarios is MemOS suitable for?

MemOS is suitable for AI applications that need long-term memory and continuous personalization, such as companionship, games, travel, customer service, knowledge management, investment advisory, production operations, and AI learning assistants.

You can first validate a specific scenario with Cloud APIs, then decide whether to do deeper integration or private deployment.
