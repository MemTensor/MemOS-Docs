---
title: Memory Recall
desc: Memory recall finds the content that is most relevant, trustworthy, and suitable to inject into context when a user makes a request.
---

## 1. What Is Memory Recall

Memory recall is the core ability of MemOS when reading memories. After a user sends a new request, MemOS combines the input, conversation context, filters, and memory states to find memories that can help the model complete the current task.

The goal is not to return all history. It is to put the most useful facts, preferences, tool experience, skill clues, or knowledge content into the limited context window.

## 2. Why Context Alone Is Not Enough

If a model only relies on the current conversation window, three problems appear:

- **Users must repeat themselves**: preferences, background, and long-term matters cannot continue naturally.
- **Historical information is easily lost**: earlier conversations, cross-session behavior, and tool results do not automatically appear in the current context.
- **Input becomes overloaded**: adding all raw history is costly and makes answers less stable.

The value of memory recall is to turn long-term memories into usable input for the current task when needed.

## 3. What Recall Returns

| Memory category | Typical use |
| --- | --- |
| Fact memories | Add clear facts such as user identity, long-term matters, and business status |
| Preference memories | Continue the user's tone, style, choice habits, or constraints |
| Tool memories | Help Agents select the right tool and invocation pattern in similar tasks |
| Skill memories | Reuse execution steps and constraints distilled from multi-turn tasks |
| Knowledge content | Provide documents, images, multimodal content, or knowledge base evidence |

Recall results usually include source, time, type, tags, confidence, and status. Developers can further filter, rank, or decide whether to inject them into downstream models.

## 4. Key Stages in Recall

| Stage | Role |
| --- | --- |
| Understand the request | Decide what background, preferences, or knowledge the current input needs |
| Filter the scope | Limit candidate memories by user, conversation, time, tags, type, and other conditions |
| Retrieve candidates | Find semantically relevant or condition-matched memories from the memory base |
| Rank and select | Combine relevance, confidence, freshness, and status to choose more reliable results |
| Govern injection | Control which memories enter model context, avoiding excessive, outdated, or non-compliant content |

Together, these stages determine whether recalled memories are actually useful. Too little recall leaves the model without background; too much recall adds noise and cost.

## 5. Next Steps

::card-group
  :::card
  ---
  icon: i-ri-filter-3-line
  title: Memory Filters
  to: /memos_cloud/features/filters
  ---
  Use filters to control recall scope and reduce irrelevant memories
  :::

  :::card
  ---
  icon: i-ri-search-2-line
  title: Search Memory
  to: /memos_cloud/mem_operations/search_memory
  ---
  View how to integrate memory recall
  :::
::
