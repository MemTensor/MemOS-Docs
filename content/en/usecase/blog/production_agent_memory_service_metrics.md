---
title: "What to Log and Measure in a Production Agent Memory Service"
---

![Production agent memory service metrics](https://cdn.memtensor.com.cn/img/1794815792040_wolfp0_compressed.png)

Start with a simple question: did the information the agent needed make it from memory into the model’s request?

A retrieval dashboard can look healthy while the application drops a useful record before the model call. Even when the record reaches the model, the task can still fail. To find out where to make a change, track the write, retrieval, context assembly, and final action separately.

Anthropic’s November 6 agent memory study offers one example. On a CL-Bench database task, Sonnet 4.6 earned a mean reward of 0.364 with memory and 0.641 with memory and refined instructions. Those instructions asked the model to read its memory before answering and test its explanations. See [Anthropic’s agent memory study](https://www.anthropic.com/research/components-of-agent-memory){target="_blank"}.

The result is specific to that task, but it illustrates why retrieval alone is not enough to evaluate an application. Teams also need to check what reaches the model and whether the resulting action succeeds.

## Put these measures on the dashboard

Use live request data for reliability and latency. Use labeled replays or reviewed samples for measures that depend on knowing which record or action was correct. Show the sample count beside each rate.

| **Measure** | **Definition and denominator** | **Where to collect it** |
| --- | --- | --- |
| Write readiness | Of accepted writes expected to create or update a known record and whose deadline has passed, the share whose expected result was visible by that deadline. Keep failed and overdue writes in the total. | Write acknowledgment, task status where available, and a scoped read-back probe. Report failed and overdue jobs separately. |
| Lookup failures and latency | Failed or timed-out lookups divided by attempted lookups. Report p95 latency over successful lookups, including empty results, and show the timeout count next to it. | The application's retrieval call, from start to response or timeout. |
| Hit rate at k | Labeled lookups with the expected record in the top k divided by labeled lookups with a known target. Keep k fixed across comparisons. | Retrieval response, before context assembly. |
| Context delivery rate | Of labeled turns that retrieved the expected record, the share that sent the record or its relevant content to the model. | Compare retrieval results with the application’s final context assembly. Track which record IDs contributed to each included block. |
| Stale or out-of-scope context | For each category, divide inspected requests containing a violating record by inspected requests containing any memory. | The outgoing model request after scope and freshness checks. Count blocks separately. |
| Task success | Runs meeting the workflow's outcome criteria divided by scored runs. In a delivery workflow, check the destination actually submitted. | Tool result or business event, joined to the originating turn. |
| Memory processing tokens | For sampled turns with complete usage data, report the tokens or other billed units used by memory-related processing. Keep extraction, embedding, and ranking separate where their usage is available. | Provider usage and billing records for memory-related calls, including linked background work when reported. Show coverage and missing usage. |
| Memory added to the prompt | Estimated tokens in included memory blocks divided by sampled model requests that contain memory. | Final prompt assembly, using the model's tokenizer where available. |

For write readiness, use an authorized probe with a known target and a fixed query. Record the probe interval alongside the observed time.

If the expected record does not appear, check both the write status and the search conditions. A search can miss a record because of its query, filters, or result limit. Count empty responses separately from lookup errors, since some turns need no memory.

For stale context, check the record against the current version or validity window. For scope, alert on any confirmed violation and report how many inputs were inspected. Review task success by case type, including routine recall, a corrected preference, and a case where the agent should ask for clarification.

## Trace a turn from search to action

Give each user turn a trace ID. Record the write job ID when one exists, the retrieval outcome and duration, the record IDs returned and included, and the final action result. Link background jobs back to their originating turn. Keep user and memory IDs in restricted traces, and leave memory text out of routine logs. Use dimensions such as workflow, model version, and result status for aggregate metrics. The estimated prompt footprint is part of the main request. Keep it separate from provider-reported usage for memory-only calls.

OpenTelemetry’s GenAI conventions can help structure model and retrieval telemetry. The application still needs to define how it labels freshness, authorization, and task success for its own workflow. See the [OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai){target="_blank"}.

With MemOS Cloud, keep the task ID returned for an asynchronous write and use [Task Status](/api_docs/message/get_status/) to follow processing. Once the task completes, its response can summarize memory changes and the affected IDs.

Then use a scoped [Search Memory](/memos_cloud/mem_operations/search_memory/) request to check what the application can retrieve. During context assembly, record which returned memories contributed to the model request. This helps distinguish a record that was not found from one that was found but never reached the model.

## Read the rates together

In an illustrative replay of 120 turns, search found the expected record in 96 turns, and 82 of those turns included it in the model request. The hit rate is 80%. Delivery among hits is 85.4%, and delivery across all 120 turns is 68.3%.

The 14 turns where the record was retrieved but not delivered point the team toward context assembly. Inspect those before changing the search index.

If the expected record arrived and the action still failed, hold that record and the tool responses fixed while testing revised instructions. If the agent proposed the right action and the system executed the wrong one, follow the tool call and its receipt. Use matched replays with and without memory when you want to measure its contribution to task success.
