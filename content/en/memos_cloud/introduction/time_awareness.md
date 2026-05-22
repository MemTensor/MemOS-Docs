---
title: Time Awareness
desc: How memories update over time, keep history, and understand "now" and "before" during retrieval.
---

We treat memories as objects that evolve over time, not as static text. A user's preferences, state, and facts may change; one-time events also need to keep when they happened. With time awareness, MemOS can decide when to use the latest current understanding and when to trace back to historical versions.

## 1. What Problems It Solves

### New and old information conflicts

- The user first says "I like apples", and later says "I don't like apples anymore".

- **How MemOS handles it**: MemOS automatically detects the change. During retrieval, it returns only the currently valid understanding: "does not like apples". Historical versions are not deleted and can still be traced when needed.

### "Now" and "before" should return different answers

- The user used to live in Beijing, then moved to Shanghai.

- **How MemOS handles it**: MemOS understands time clues in the question. When the user asks "Where do I live now?", it retrieves Shanghai. When the user asks "Where did I live before?", it retrieves Beijing.

### Events should not be forcibly merged

- The user traveled to Xi'an during last year's National Day holiday and to Hangzhou during this year's May Day holiday.

- **How MemOS handles it**: MemOS keeps the complete information for each event instead of merging everything into "the user likes travel". When the user asks "Where did I travel recently?", it can prioritize Hangzhou.

## 2. Processing Flow

::steps{level="3"}

### At write time: use `chat_time` to anchor historical time

Real-time conversations usually do not require a timestamp. MemOS uses the message ingestion time. If you import historical data, pass `chat_time` so memories are anchored to when the event actually happened.

```json
{
  "user_id": "memos_user_123",
  "messages": [
    { "role": "user", "content": "I like spicy food.", "chat_time": "2025-09-12 08:00:00" },
    { "role": "user", "content": "I can't eat very oily or spicy food now, and I prefer something lighter.", "chat_time": "2025-09-25 12:00:00" }
  ]
}
```

### Time handling for two kinds of memories

MemOS handles memories differently:

- **States that may change**, such as where the user lives, what they like, or their current stage goal, keep different time versions. This lets retrieval use the current version while still allowing historical recall.

- **One-time events**, such as where the user went or what they did, keep the details of each event. This lets retrieval return complete event information.

### At search time: understand the time target in the question

- **No explicit time target**: retrieve normally and prefer currently valid memories.
- **With time clues**: understand the time target and select the corresponding version or event.

If you already know the time range, you can also combine [Memory Filters](/memos_cloud/features/filters) with `create_time` to narrow candidate memories:

```json
{
  "user_id": "memos_user_123",
  "query": "Summarize my reading-related records in December 2025",
  "filter": {
    "and": [
      { "create_time": { "gte": "2025-12-01" } }
    ]
  }
}
```

::

## 3. Example

Try writing a set of events with time information:

```json
{
  "user_id": "test_user",
  "messages": [
    { "role": "user", "content": "I live in Beijing.", "chat_time": "2025-01-10 10:00:00" },
    { "role": "user", "content": "I moved to Shanghai.", "chat_time": "2025-06-01 10:00:00" },
    { "role": "user", "content": "I traveled to Xi'an during last year's National Day holiday.", "chat_time": "2025-10-08 10:00:00" },
    { "role": "user", "content": "I traveled to Hangzhou during this year's May Day holiday.", "chat_time": "2026-05-02 10:00:00" }
  ]
}
```

| Type | Search query | Expected result |
| --- | --- | --- |
| Current state | "Where do I live now?" | Shanghai, using the latest state |
| Historical state | "Where did I live before?" | Beijing, tracing back to the historical version |
| Up to now | "Where have I traveled?" | Xi'an and Hangzhou, with Hangzhou ranked first |

## 4. Usage Suggestions

- Pass accurate `chat_time` when importing historical data; otherwise, old events may be treated as if they just happened.
- For current-state information, let users naturally express updates. MemOS will update the current understanding automatically.

## 5. Next Steps

::card-group
  :::card
  ---
  icon: ri:message-3-line
  title: Add Message
  to: /memos_cloud/mem_operations/add_message
  ---
  Write historical messages with timestamps
  :::

  :::card
  ---
  icon: ri:search-2-line
  title: Search Memory
  to: /memos_cloud/mem_operations/search_memory
  ---
  Search and verify time-related memories
  :::
::
