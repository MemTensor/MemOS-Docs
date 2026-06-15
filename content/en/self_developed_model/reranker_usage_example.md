---
title: Usage Examples
desc: Rerank memory relevance based on the self-developed memos-reranker small model.
---

MemOS provides a memory reranking API based on the **memos-reranker** model series (including 0.6B lightweight and 4B enhanced versions, base model uses qwen-reranker post-training). Developers can directly pass a user query and a list of candidate memories to complete memory relevance reranking in one call.

::callout{.rerank-usage-api-hint color="warning"}
Request/response fields and OpenAPI: [Rerank Memory](/api_docs/core/rerank).<br />
Auth, base URL, and calling conventions match [MemOS Cloud Quick Start](/memos_cloud/getting_started/quick_start).
::

## When to use memory reranking

The reranking API fits when you need:

- **Memory recall optimization**: After retrieving a large number of candidate memories, accurately filter out the memories most relevant to the current query through reranking to improve the quality of context injection.
- **Low latency at high QPS**: Based on a 0.6B small model, suitable for latency-sensitive and frequently invoked business scenarios.
- **Flexible sorting control**: Supports custom candidate document lists, can be used with any retrieval system, and does not rely on the MemOS memory store.

Do not call the reranking API directly in these cases:

- You do not have candidate documents yet and only want to search memory content. Call [Search Memory](/memos_cloud/mem_operations/search_memory) first.
- You want to write content into memory. The reranking API does not write to the MemOS memory store; use [Add Message](/memos_cloud/mem_operations/add_message) instead.
- You want to rank a full long document. Retrieve, split, or truncate candidate content first, then pass shorter candidate snippets to `documents`.

## How it works

The memory reranking API and interaction with the model are shown in the figure below:

![Memory Reranking Process](https://cdn.memtensor.com.cn/img/1776755224177_y8jat9_compressed.png)

The end-to-end flow of the reranking model is as follows:

1. **Query Input**  
   Developers pass in the user query (`query`) and the candidate memory document list (`documents`).

2. **Encoding & Representation**  
   After model encoding, relevance scores are output.

3. **Relevance Scoring**  
   The relevance scores are mainly divided into 5 stages as shown in the figure. Developers can set thresholds according to actual scenarios.

## Get started

::code-group
```python [Basic reranking]
import os
import requests
import json

# Replace with your MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    # Available models: memos-reranker-0.6b (lightweight) or memos-reranker-4b (enhanced)
    "model": "memos-reranker-0.6b",
    "query": "Any liquor recommendations for me?",
    "documents": [
        "User prefers Jiangxiang-flavored baijiu, like Moutai.",
        "I don't drink alcohol."
    ]
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/rerank"

res = requests.post(url=url, headers=headers, data=json.dumps(data))
print(f"result: {res.json()}")
```
```python [Reranking combined with memory retrieval]
import os
import requests
import json

# Replace with your MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    # Available models: memos-reranker-0.6b (lightweight) or memos-reranker-4b (enhanced)
    "model": "memos-reranker-0.6b",
    "query": "What are the user's hobbies?",
    "top_n": 3,
    "documents": [
        "User likes playing badminton.",
        "User is a backend developer in Hangzhou.",
        "User prefers concise replies.",
        "User prefers Jiangxiang-flavored baijiu.",
        "User is going on a business trip to Beijing next Wednesday."
    ]
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/rerank"

res = requests.post(url=url, headers=headers, data=json.dumps(data))
print(f"result: {res.json()}")
```
::

## Limits

- `query` is required. Use a clear and concise current question.
- `documents` is required and must be a non-empty string array. The total token limit across all candidate documents is **8k**.
- `top_n` is optional and returns the top N most relevant results. If omitted, all results are returned.
- `model` is optional and supports `memos-reranker-0.6b` and `memos-reranker-4b`.
- The API currently supports **synchronous mode only**. Results are returned once reranking is complete.

## Common Errors and Troubleshooting

| Error Code | Common Cause | How to Fix |
| --- | --- | --- |
| `40000` | The request body structure is invalid, or a field type is incorrect | Check whether `query` is a string and whether `documents` is a string array |
| `40002` / `40003` | A required field is empty, or `documents` is empty | Provide `query` and a non-empty `documents` array |
| `40309` | Token usage exceeds the per-time-window limit | Reduce the number and length of candidate documents, lower concurrency, and retry in batches |
| `50000` | Internal server error | Retry later. If it persists, contact support |

## Compared to Embedding Retrieval

| Dimension | Reranking API | Embedding Retrieval |
| --- | --- | --- |
| Core behavior | Precision ranking of candidate docs, outputting relevance scores | Semantic similarity recall, fast coarse filtering |
| Storage | ❌ Does not write to the MemOS memory store | ❌ Does not write to the MemOS memory store |
| Model | 0.6B/4B reranking models | Embedding model |
| Precision | ✅ High (cross-encoding, query-doc interaction) | General (dual-tower encoding, independent representation) |
| Speed | Slower (requires pair-by-pair computation) | ✅ Fast (vector approximate retrieval) |
| Async | Not supported | Not supported |
| Typical use | Post-retrieval precision ranking / Memory quality assessment | Fast recall from massive memory store |
