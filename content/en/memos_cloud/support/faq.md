---
title: Cloud FAQs
desc: Troubleshoot common MemOS Cloud issues related to accounts, projects, API Keys, quotas, knowledge bases, and API calls.
---

This page answers common questions about using MemOS Cloud. If you want to understand MemOS concepts such as RAG, open source deployment, private deployment, or memory scheduling, see [FAQ](/memos_cloud/introduction/faq).

## Which document should a new user read first?

If you have not logged in to the console yet, choose the entry point based on how you plan to use MemOS Cloud:

- If you want Agent tools such as Claude Code or Cursor to help with integration, start with [Use in Agents](/memos_cloud/getting_started/agent_usage).
- If you want to call Cloud APIs from your own application, start with [Integrate into Your App](/memos_cloud/getting_started/quick_start).

[Configuration](/api_docs/start/configuration) is more useful when you need to manage multiple projects, edit or delete projects, or understand how knowledge bases are bound to projects.

## What is the relationship between API Keys and projects?

Each project has its own API Key. When you call an API with a specific API Key, you can only access memories, messages, knowledge bases, and configuration under that project.

If data is visible in the console but not returned by the API, check:

- Whether the console project matches the project that owns the API Key.
- Whether the request uses the same `user_id`.
- Whether the search request uses an overly narrow `filter`, `knowledgebase_ids`, or a high `relativity`.

## How do I troubleshoot authentication or permission errors?

Start by checking the request header:

```text
Authorization: Token YOUR_API_KEY
```

Common issues include:

- Missing `Authorization`.
- Missing the `Token` prefix.
- Incomplete API Key copied from the console.
- API Key belongs to another project.
- API Key is invalid, expired, or has no permission for the current resource.

If the response returns `40100`, `40130`, or `40132`, go back to [Configuration](/api_docs/start/configuration) and check the API Key and project.

## Why did Search Memory or Chat not recall knowledge base content?

First confirm that the knowledge base is bound to the current project and that the files have finished processing. Also check the API request:

- If `knowledgebase_ids` is not provided, knowledge bases are not searched by default.
- If `knowledgebase_ids` is provided, make sure the IDs belong to knowledge bases accessible from the current project.
- If `filter` is too narrow or `relativity` is too high, relevant content may be filtered out.

For upload, binding, and processing status, see [Knowledge Base](/memos_cloud/features/knowledge_base).

## What should I do when I hit quota or rate limits?

First identify which limit was reached:

- Single input or output is too long: reduce the current input, history, or expected output.
- API call quota is exhausted: wait for quota recovery or request more quota.
- Too many requests in a short period: reduce request frequency and avoid repeated retries.

For quota details, see [Quotas and Limits](/memos_cloud/support/limit).

## Why can I not search a memory immediately after writing it?

After memory is written, it still needs to be extracted, processed, and indexed. If you search immediately after writing, processing may not be finished yet.

Check:

- The write and search requests use the same `user_id`.
- The request is not restricted by an overly narrow `conversation_id`, `filter`, or `knowledgebase_ids`.
- If asynchronous writing is used, wait for the task to finish before searching.

## What should I check when Delete Memory fails?

When deleting individual memories, prefer `memory_ids`. Do not use `conversation_id`, `user_id`, or knowledge base IDs as `memory_id`.

Only pass `user_id` when you need to delete all memories for that user under the current project. This is a high-risk operation, so confirm the API Key, project, and user ID before running it.

## Why are console and API data ranges different?

Both the console and APIs isolate data by project. Inconsistent data ranges are usually caused by:

- The selected console project is different from the project that owns the API Key.
- The API request uses a different `user_id`.
- Extra filters are applied in the API request.
- The knowledge base is not authorized for the current project.

If an API response returns a specific `code`, see [Error Codes](/api_docs/help/error_codes).
