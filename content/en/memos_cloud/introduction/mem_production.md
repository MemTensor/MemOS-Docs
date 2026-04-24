---
title: Memory Production
desc: The memory production module transforms raw messages or events into storable and retrievable memory units, serving as the starting point of the entire MemOS workflow.
---

::warning
**[Go directly to API documentation here](/api_docs/core/add_message)**
<br>
<br>

**This article focuses on functional explanations. For detailed API fields and constraints, please click the link above.**
::

## 1. Introduction: Why process raw messages into memories

In MemOS, what you submit is the **raw information** (conversations between users and AI, operation logs / activity traces in your app, etc.), and the system automatically completes the "memorization" process.

::note{icon="ri:triangular-flag-fill"}
**Why process memory?**
::

If you simply save all the original conversations and provide them directly to a large model upon reuse, several problems may occur:

- **Context too long**: Raw messages are usually lengthy and contain much redundant or irrelevant content. Feeding them in full to a model will substantially increase the context window, making processing inefficient and wasting tokens.
- **Inaccurate retrieval**: Unstructured and unextracted raw text rarely highlights the key information in conversation. Retrieval may return a lot of noisy content, affecting response quality.
- **Inconsistent experience**: Raw conversation is static one-time text and can’t perceive changes in user preferences, emotions, business background, or rules, resulting in an inconsistent conversational experience.

<br>

::note
**What are memories processed by MemOS?**
::

MemOS converts raw messages into structured memory units, automatically summarizing:

- **Fact Memories**:
  - Extracts factual information from user conversations, e.g., "The user plans to travel to Guangzhou during the summer of 2025."
- **User Preferences**:
  - Extracts explicit preferences expressed in user conversations, e.g., "The user mentioned enjoying family trips."
  - Extracts implicit reasoning patterns, e.g., "The user may prefer more cost-effective hotel options."
  - MemOS retains preference patterns, guiding the model to maintain consistency in subsequent answers. For example, if the user shows a "preference for clear and logical writing" when using AI-assisted writing, MemOS will continue to guide the model to maintain a "logical writing style" in other tasks.

<br>

**Example**:

```json
User: I've booked a summer trip to Guangzhou. What chain hotels are available?
Assistant: You can consider [7 Days Inn, Atour, Hilton], etc.
User: I'll choose 7 Days Inn.
Assistant: Okay, let me know if you have any other questions.
```

```json
Fact Memory: The user plans to travel to Guangzhou during the summer and has chosen 7 Days Inn as their accommodation.

Preference Memory: The user may prefer hotels with a higher cost-performance ratio.
Reasoning: 7 Days Inn is known for being economical, and the user's choice suggests a preference for higher cost-effectiveness in accommodation. Although the user did not explicitly mention a budget constraint or specific hotel preferences, choosing 7 Days Inn from the suggested options likely reflects an emphasis on price and practicality.
```

> For you, this means: as long as you store the original conversation, you don’t need to implement your own “keyword extraction” or “intent recognition” logic to obtain user preferences that can be called in the long term.

<br>

Beyond dialogue, for Agent task execution, MemOS also adapts for tool memory and skills:
- **[Tool Memory](/memos_cloud/features/advanced/tool_calling)**:
  - Extracts tool usage information during Agent tasks as memories, recording tool types, usage scenarios, and outcome characteristics for future prioritization in similar tasks.
- **[Skills](/memos_cloud/features/advanced/skill)**:
  - Extracts user conversations to generate reusable executable abilities.
  - For example, after several rounds of dialogue about "creating a travel itinerary," MemOS can extract an actionable "travel planning skill" including destination analysis, itinerary breakdown, and budget constraints. This goes beyond just storing "the user likes adventure travel" as a preference memory for model reasoning.


In addition, MemOS also supports memory processing based on the [Knowledge Base](/memos_cloud/features/advanced/knowledge_base) and [multimodal messages](/memos_cloud/features/basic/multimodal).

<br>

::note
**How are memories processed?**
::

MemOS always treats memory as an evolving record rather than a static one. It needs to remember users quickly, accurately, and continuously.
<br>
To better handle the "memory triangle" (real-time, accuracy, consistency), MemOS divides the memory processing workflow into three stages:
| Stage    | Goal                | Features                                                                  |
|----------|---------------------|--------------------------------------------------------------------------|
| Fast     | No memory loss      | Original text is quickly processed and stored in milliseconds; instantly retrievable in the next conversation. |
| Fine     | Short-term organization | Reviews current context and memory; if conflicts are found, a new version is generated on the original Memory ID. |
| Offline  | Global organization | Regular, long-term review and revision of earlier undetected conflicts to maintain consistency overall.         |

The result is not two conflicting memories, but:
> An evolutionary chain of the same Memory ID: V1 / V2 / V3...

**Example**:

```json
# Assume it's 2025
User: I'm Xiaoyi, currently living in Shanghai, and can't really eat spicy food.

# Assume it's 2026
User: I recently moved to Chengdu. I've suddenly fallen in love with Sichuan hot pot and now like spicy food!
```

```json
V1 version memory: The user is Xiaoyi, lives in Shanghai, and can't eat spicy food.
V2 version memory: The user is Xiaoyi, lives in Chengdu, likes spicy food, and likes Sichuan hot pot.
```

When the user asks:
- "Do I like spicy food?" → Returns current status only: Likes it.
- "Did I ever like it before?" → Returns historical status.

This allows a single memory to evolve over time, providing both reliable current understanding and a complete historical trajectory.

<br>

This solves the original issues mentioned:
- **More efficient invocation**: When prompting the model, only concise memories are sent, reducing token usage.
- **Faster, more accurate retrieval**: Directly targets factual / preference / tool / skill memories rather than a long string of raw messages.
- **More consistent experience**: The model can continuously maintain understanding of user habits, without drifting due to lost context.

<br>

## 2. Advanced: Customizing Deeply If Desired

In MemOS, **memory production** is the entire process of transforming raw input into schedulable and retrievable memory units. Pipeline details (such as extraction methods, embedding models, storage backends) will evolve with new versions and community practices—this section does not provide a single fixed process, but highlights **extensible points** where you can customize as needed.

| **Extensible Point**  | **Default Behavior**                               | **Customizable Methods**                                                    |
|-----------------------|----------------------------------------------------|----------------------------------------------------------------------------|
| Extraction & Structuring | Generates MemoryItem (with content, timestamp, source, etc.) | Replace extraction model/template or add domain fields to the schema        |
| Splitting & Embedding    | System splits long texts and runs embedding models              | Adjust splitting granularity or switch to a more suitable embedding model (e.g. bge, e5) |
| Storage Backend           | Uses vector databases (e.g., Qdrant) by default                | Switch to graph databases, or use a hybrid                                  |
| Merging & Governance      | System automatically handles duplicates/conflicts               | Implement custom rules (e.g., time-priority, source-priority), etc.         |


## 3. Next Steps

Learn more about core MemOS capabilities:

- [Memory Scheduling](/memos_cloud/introduction/mem_schedule)
- [Memory Recall](/memos_cloud/introduction/mem_recall)
- [Memory Lifecycle Management](/memos_cloud/introduction/mem_lifecycle)
