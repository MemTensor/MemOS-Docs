---
title: "What Does a Production Agent Memory Architecture Need?"
---

![What Does a Production Agent Memory Architecture Need?](https://cdn.memtensor.com.cn/img/1795606097065_5di9eu_compressed.png)

A support agent submits a replacement request. The shipping service accepts it, but the worker stops before it can save the receipt. When another worker picks up the case, how does it know whether to submit the request or tell the customer their replacement is already on its way through the system?

For an agent that handles cases across shifts and remembers customers across cases, we recommend designing for six responsibilities: workflow state, ingestion, durable storage, retrieval with access control, context assembly, and lifecycle management. A policy assistant answering a single question may need only retrieval and enough context to answer. A replacement workflow also needs a checkpoint so another worker can resume it, and persistent memory if customer preferences should carry over to the next case.

When Replit introduced Missions on November 17, it described an independent AI judge that checks work against agreed success criteria. For this support workflow, one criterion is easy to verify against the shipping service’s own records: after a restart, the customer should have one approved replacement request, and the case should accurately report its status.

## What each component owns

| **Component** | **What it does** | **Evidence in a replacement shipment** |
| --- | --- | --- |
| Workflow state | Checkpoints the case, pending approvals, and action references | A new process resumes the same case and identifies its pending step |
| Ingestion | Decides which facts and preferences to save, who they belong to, where they came from, and when they apply | “Text me about future cases” updates the customer’s preference. “Email me about this replacement” applies to this case only. |
| Durable storage | Preserves stable record IDs and current versions across cases | A fresh case can read the current channel preference without loading old transcripts |
| Retrieval and access control | Filters by verified identity and scope, then selects relevant, current records | Two customers asking the same question each get their own applicable records |
| Context assembly | Prioritizes the current request, selected memories, and fresh tool results within the input budget | The exact request sent to the model contains the chosen preference and current shipment status |
| Lifecycle management | Applies corrections and expiration rules to saved memories and the summaries or cached results the application reuses | After the customer changes their preferred channel, a new case uses the updated preference even if an older summary still mentions the previous one. |

LangGraph illustrates the distinction. Its checkpointer saves workflow state for a thread, while a store can hold application data across threads. To test recovery after a process restart, use a checkpointer backed by persistent storage. In this example, the checkpoint tells the next worker which case to resume. The shipping service holds the record of whether it accepted the replacement request.

Before the worker submits the request, save the pending step, the operation ID, the approved request parameters, and a reference to the approval. A case summary can explain why the customer needs a replacement. The operation ID gives the next worker a way to look up this particular request if the shipping service supports that lookup.

## Put the checkpoint on both sides of a business action to the test

Start each run with a fresh test case and an approved replacement. In the first run, stop the worker after it saves the operation ID and request details but before it calls the shipping service. Verify that the test service received no request. Restart the worker, check that it still has permission and that the approval still covers the request, then let it submit. The service should accept one replacement, and the receipt saved on the case should match it.

In the second run, let the service accept the request, then drop its response. On restart, the case still shows a pending step. If the service supports lookup by operation ID, use it to recover the receipt. If the outcome remains unclear, retry only if the request is still authorized and the service documents a safe retry with the original key and parameters. The key must still be valid.

If neither route establishes the outcome, leave the case pending review and tell the customer that confirmation is pending. For this run, the test team knows the service accepted the original request. Check the service’s records for the case: there should be exactly one accepted replacement, including any submission made under a different key. The worker should either recover the matching receipt or hand off the unresolved case without claiming success.

For the third test, give customers A and B different contact preferences and a pending replacement case each. Run the worker with access to B’s case only. It should be able to resume B’s case and use B’s preference. A request to resume A’s case should be denied, and neither A’s case details nor A’s preference should appear in the records returned to the worker or in the model input.

If B’s pending step is missing after restart, inspect the checkpoint. If retrieval returned B’s preference but it never reached the model, inspect how the application assembled the request. If the shipping service accepted two replacements for the same case, compare both submissions, including their operation IDs and retry keys.

## Connect memory evidence to the final outcome

With MemOS Cloud, the application can [submit a customer’s message for memory processing](/memos_cloud/mem_operations/add_message/) and later [retrieve customer memories alongside a specified knowledge base](/memos_cloud/features/knowledge_base/). The application uses the signed-in identity to select the customer and the knowledge bases they can access. In a fresh case, the worker can then retrieve the customer’s standing preference for text updates along with the applicable replacement policy. The request to use email for the previous replacement should stay with that case.

Test a correction, too. If the customer switches to email for future cases, the application can [update the saved preference by memory ID](/memos_cloud/mem_operations/update_memory/). Open a fresh case and check which channel the worker actually uses. If retrieval returns email but an old summary puts text messaging back into the model input, the trace tells you where to make the correction.

Give the support team a way to follow one case through the system. Record which memory IDs retrieval returned, which records the application included in the model request, and which receipt the shipping service issued for the operation. Keep customer text out of routine logs and use a restricted trace when someone needs to inspect the content. A worker taking over mid-shift can then answer the customer’s two practical questions: “Did you request my replacement?” and “How will you let me know?”
