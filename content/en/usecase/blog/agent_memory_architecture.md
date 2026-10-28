---
title: "Agent Memory Architecture: Building Cross-Session Memory with MemOS"
---

A user has set email as the default for their weekly reports. A week later, they switch to Slack. Then they ask the assistant, “Email this report; I need to forward it to a client.”

The assistant should email that report and return to Slack for the next one. To do that across conversations, it needs to distinguish the user’s standing preference from a request for a single task.

MemOS provides a memory layer for the application to store that preference, retrieve it in a new conversation, and update it when the user changes their mind.

## Decide when each instruction applies

The reporting assistant has to distinguish a lasting preference from an instruction for the current task:

| User instruction | Scope | Expected behavior |
| --- | --- | --- |
| “Send my weekly reports by email by default.” | Ongoing preference | Use email until the user changes the default. |
| “Use Slack for future weekly reports.” | Updated preference | Use Slack for later reports. |
| “Email this report.” | One report | Use email for this report and keep Slack as the default. |
| “Forget my report-delivery preference.” | Saved preference | Remove the preference and ask where to send a future report if no other instruction applies. |

A question like “Would Slack work?” opens a discussion. “Use Slack from now on” establishes a preference. The email request can remain in the task history while the application applies it only to that report.

MemOS Cloud can extract [preference memories](/memos_cloud/introduction/memory_types) from user statements and interaction history. Your application can combine a retrieved preference with the current request and apply its own rules for defaults and exceptions.

## See how the MemOS components work together

The [MemOS v2.0 open-source architecture](/open_source/modules/mos/overview) separates memory processing into components coordinated by handlers:

| Component | Role in the open-source architecture |
| --- | --- |
| MemReader | Processes inputs into memory items that can be stored. |
| MemCube | Holds memory modules for users and application scenarios. |
| MemScheduler | Coordinates background processing, including storage and indexing. |
| MemChat | Coordinates memory retrieval, response generation, and storage of new memories. |
| MemFeedback | Processes natural-language corrections, additions, and replacements. |

If a saved preference is wrong, you can inspect how the input was processed. If the preference is correct but the assistant misses it, check retrieval and the context passed to the model.

[MemOS Cloud](/memos_cloud/getting_started/overview) provides managed APIs for adding, retrieving, and updating memories. The components above belong to the open-source framework; the reporting workflow below uses Cloud APIs.

## Keep the same user across conversations

Send the user’s messages to the [Add Message API](/memos_cloud/mem_operations/add_message). A typical request includes a `user_id`, a `conversation_id`, and a `messages` array containing each message’s role and content. MemOS extracts memories, including facts and preferences, and checks new information for duplication or conflicts with existing memories.

When the user starts another conversation, call the [Search Memory API](/memos_cloud/mem_operations/search_memory) with the same `user_id` and a query about the task. For a weekly report, the application can search for the user’s current delivery preference and pass the relevant result to the model alongside the current request.

Search combines semantic and keyword retrieval with ranking and filters. Fact and preference memories are included by default, so the assistant can retrieve a delivery preference without reconstructing it from earlier conversations.

Keep the user ID stable across conversations, with a separate conversation ID for each interaction. When you include `conversation_id` in a search, MemOS gives memories from that conversation greater weight while still allowing the user’s historical memories to be retrieved.

For applications serving multiple users, [user and agent memory boundaries](/memos_cloud/introduction/isolation_filters) help determine whose information is retrieved. Your backend should select the user ID from the authenticated account and enforce the permissions appropriate to your application. The application’s email or Slack integration sends the report.

## Update a preference when it changes

When the user says, “Use Slack for future weekly reports,” MemOS can process the new information as messages are added and update conflicting memories. MemOS Cloud also supports direct edits and natural-language corrections.

If your application knows which record needs editing, use [Update Memory](/api_docs/core/update_memory) with its `memory_id`. You can change the content or title of an existing memory, including a preference. This works well when a user edits a saved preference in your application.

For a correction made in conversation, submit [natural-language feedback](/memos_cloud/mem_operations/add_feedback) with `user_id`, `conversation_id`, and `feedback_content`. MemOS uses the feedback and conversation context to locate relevant memories and apply the correction, so the user does not need to find a memory ID.

Keep the one-report email request in the current task context, and make sure it is not saved as a new default. That allows the application to honor the immediate request while using Slack for a later report.

MemOS Cloud’s [time awareness](/memos_cloud/introduction/time_awareness) keeps historical versions of information that changes and uses time clues during retrieval. “Where should this week’s report go?” calls for the current preference; “What was my previous default?” calls for an earlier one. When importing historical conversations, you can provide `chat_time` to preserve the original timing.

## Allow for background processing

MemOS Cloud processes added messages [asynchronously by default](/memos_cloud/features/async_mode). An initial processing stage makes recent messages available for retrieval, while further refinement continues in the background. You can use the returned `task_id` with the [task-status API](/api_docs/message/get_status) to follow processing through completion.

If a user changes a preference and starts another task right away, keep the latest instruction in the current context while memory processing continues. For workflows that need to wait for message processing to finish, you can also use synchronous mode when adding messages.

## Decide what to delete

Use [Delete Memory](/memos_cloud/mem_operations/delete_memory) with `memory_ids` to remove selected memories, or with `user_id` to clear a user’s memories within the current project. To forget only the report-delivery preference, identify and delete the relevant memories. Clearing all memories for the user is a separate operation.

After deletion, search again to check the result. If there is no other delivery instruction, the assistant can ask where the next report should go. If your application also retains summaries or source conversations, handle those records according to the request’s scope so a later import does not recreate the deleted preference.

## Choose the right form of memory

The reporting assistant uses editable information stored outside the model. Our [research framework](https://arxiv.org/abs/2507.03724){target="_blank"} describes three forms of memory:

*   Plaintext memory stores information outside the model, where it can be retrieved and updated.

*   Activation memory holds runtime states, such as KV caches.

*   Parametric memory holds knowledge in model weights.


MemCube brings memory content and metadata together so memory can be organized and managed. The open-source [KV-cache module](/open_source/modules/memories/kv_cache_memory) supports reuse of cached context during inference. For a preference that users may change or delete, external memory is a practical starting point: your application can update the saved information without retraining the model.

## Test the whole flow

You can try the reporting scenario across several conversations with the same user:

1.  Save email as the default, then retrieve it in a new conversation.

2.  Change the default to Slack and check the retrieved preference and assistant response.

3.  Request email for one report, then check that a later report still uses Slack.

4.  Search as a different user and confirm the first user’s private preference is not returned.

5.  Delete the preference, start a new conversation, and check that it is no longer retrieved.


When a result needs investigation, compare the original instruction with the processing status, retrieved memory, and context sent to the model. That helps you see where the preference was captured, selected, or applied differently than intended.

Use the [MemOS Cloud quickstart](/memos_cloud/getting_started/quick_start) to add memory to your application, or explore the [open-source architecture](/open_source/modules/mos/overview) for a self-hosted deployment.
