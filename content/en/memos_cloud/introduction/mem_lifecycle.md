---
title: Memory Lifecycle Management
desc: Memory lifecycle management keeps memories evolving through generation, use, merging, archiving, and cleanup, so the memory base stays accurate, clean, and traceable.
---

## 1. What Is Memory Lifecycle Management

A memory is not a record that stays unchanged forever after it is written. As user states, task stages, and business facts change, the same kind of memory may need to be updated, merged, downgraded, archived, or cleaned up.

Memory lifecycle management focuses on long-term evolution at the storage layer: which memories are still trustworthy, which are outdated, which need historical traces, and which can be removed from the active index.

## 2. Why Lifecycle Management Is Needed

If memories only grow without governance, three problems appear:

- **Duplicate memories increase**: similar facts and preferences are written repeatedly, increasing recall noise.
- **Outdated information interferes**: old addresses, old preferences, and completed tasks are still treated as current facts.
- **Conflicts are hard to judge**: when new and old information conflict, the system needs to know which one should be trusted now.

The goal of lifecycle management is to preserve memories long term without continuously bringing outdated, duplicate, or low-value information into reasoning.

## 3. Key Lifecycle States

| State | Meaning | Common handling |
| --- | --- | --- |
| Generated | A new memory is written with source, time, type, confidence, and other metadata | Enters the memory base and waits for future use |
| Activated | A memory is frequently used in recent tasks or scheduled to a higher priority | Easier to recall and inject into context |
| Merged | Similar or complementary memories are integrated into a more stable expression | Reduces duplication and forms an updated trusted memory |
| Archived | Long-term low-frequency memories, or memories not suitable for the current task, are downgraded | Participates less in reasoning by default, but remains traceable |
| Expired | A memory exceeds its validity period or is judged unusable by policy | Removed from the active index; minimal audit info may be retained |
| Frozen | Compliance, audit, or business-critical memories cannot be automatically rewritten | Preserves full history and limits updates or deletion |

Specific state names and policies may vary by integration, but the core idea is the same: memories need continuous governance based on time and usage.

## 4. Example: Changing Learning Preferences

Suppose you are building an online education assistant with MemOS to help students solve math problems.

:::steps{level="4"}
#### Generated

The student says for the first time: "I always confuse quadratic functions with linear functions."

The system extracts a memory:

```json
{
  "content": "The student often confuses quadratic functions with linear functions",
  "confidence": 0.99,
  "create_time": "2025-09-11"
}
```

State: `Generated`  
Behavior: stored in the memory base, waiting for future use.

#### Activated

In the next several problem-solving sessions, the system frequently uses this memory to assist with answers.

State: `Activated`  
Behavior: prioritized by the scheduling mechanism to improve later retrieval and context injection efficiency.

#### Merged

With more interactions, the system discovers that the student not only confuses linear and quadratic functions, but also struggles with exponential functions.

The system merges multiple similar memories into a new one:

```json
{
  "content": "The student is confused about function concepts, especially linear, quadratic, and exponential functions",
  "history": "The student often confuses quadratic functions with linear functions",
  "version": "v1"
}
```

State: `Merged`  
Behavior: old entries are compressed into a more complete new version, reducing redundancy.

#### Archived

Three months later, the student has mastered function-related concepts, and this memory has not been scheduled for a long time.

State: `Archived`  
Behavior: downgraded to a low-frequency state. It does not participate in reasoning by default, but can be used in "learning trajectory backtracking".

#### Expired

Another year later, the student advances to a new grade. The old "junior high function confusion" memory is judged invalid by policy.

State: `Expired`  
Behavior: removed from the index, retaining only minimal audit information.

```json
{
  "deleted_fact_id": "12345",
  "deleted_at": "2026-09-11"
}
```

#### Frozen (special state)

At the same time, the student's "final exam evaluation report" is a compliance file and must not be automatically modified.

State: `Frozen`  
Behavior: locked against automatic updates, with full modification history retained for audit and compliance review.
:::

## 5. Relationship with Production, Scheduling, and Recall

| Capability | Focus |
| --- | --- |
| Memory production | How raw input is processed into usable memories |
| Lifecycle management | How memories are updated, merged, archived, and cleaned after writing |
| Memory scheduling | Which memories should be more active at the current stage |
| Memory recall | Which memories should be retrieved and used for one request |

Lifecycle management provides memory state for scheduling and recall. Active, trustworthy, and unexpired memories are better suited for current reasoning. Archived, expired, or frozen memories need to be handled carefully according to policy.
