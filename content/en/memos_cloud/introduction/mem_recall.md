---
title: Memory Recall
desc: "In MemOS, memory is not just about archiving information, but also about being dynamically retrieved when needed and transformed into executable input."
---

::warning
**[Go directly to API Docs](/api_docs/core/search_memory)**
<br>
<br>

**This article focuses on functional explanation. For detailed interface fields and limits, please click the link above.**
::

## 1. Capability Overview

Memory recall is responsible for quickly retrieving the most relevant memory fragments for a task when a user initiates a new request.

*   **Purpose:** Ensures that when generating responses, the model does not "start from scratch," but instead incorporates user history, preferences, and context.
    
*   **Returned Results:** The recalled memories can include four types: facts, preferences, tools, and skills.
    
    *   Traceability: Each memory is accompanied by its source, timestamp, and confidence.
        
    *   High Controllability: Developers have full control over which memories are passed on to downstream logic.

*   **Features:**
    
    *   Seamless Recall: Users do not need to repeat their prior choices or preferences.
        
    *   Structured Output: Memory types are distinguished, making it easier for developers to control which are injected.

*   **Functional Support:**
    *   [Set Filters](/memos_cloud/features/basic/filters): e.g., only retrieve conversations from the past 30 days; only return preference memories, not factual ones, etc.

    *   [Adjust Recall Strategies](memos_cloud/mem_operations/search_memory): e.g., increase similarity threshold, only return memories with confidence ≥0.9, etc.

    *   Recall memory content based on the [Knowledge Base](/memos_cloud/features/advanced/knowledge_base) and [Multimodal Messages](/memos_cloud/features/basic/multimodal)

## 2. Advanced: For Deep Customization

In MemOS, the implementation of recall and completion is not a single path, but a combination of multiple strategies and components. Different scenarios may call for different configurations. This section outlines the main stages and customizable points to help you make flexible choices according to your business needs.

| **Layer** | **Customizable Point** | **Example** |
| --- | --- | --- |
| Output Governance & Auditing | Safety Guardrails | Automatically add "Please answer in accordance with compliance guidelines" before completion prompts |
|  | Logging & Traceability | Record every memory entry used and each few-shot selection for every call |
|  | A/B Testing | Run two stitching templates in parallel and compare user satisfaction differences |


## 3. Next Steps

Learn more about MemOS core capabilities:

*   [Memory Lifecycle Management](/memos_cloud/introduction/mem_lifecycle)
