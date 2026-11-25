---
title: "How Long-Term AI Memory Works, From Ingestion to Forgetting"
---

![How Long-Term AI Memory Works, From Ingestion to Forgetting](https://cdn.memtensor.com.cn/img/1795606158134_xfh8s0_compressed.png)

A warehouse supervisor tells an assistant to send repair tickets through the maintenance portal. A week later, the portal goes down and the supervisor approves email for one urgent repair. What should the assistant do with the next ticket? Use the portal again, unless someone authorized to change the site default has changed it.

That distinction runs through the lifecycle of long-term AI memory. The application needs to record who set a rule and where it applies, retrieve it for the right task, and use the updated rule when it changes. Once the rule is retired, an old summary or a restored index can still contain enough information to send a ticket to the wrong place.

At Ignite on November 17, Microsoft described Microsoft IQ as a way for organizations to capture and govern knowledge that agents can use. Here we follow one narrower question through a test case: when a warehouse changes or removes its default, where does the next repair ticket actually go?

## 1. Ingest an authorized record

Start with the supervisor’s instruction: “Use the maintenance portal for repair tickets at this site.” The application checks that the supervisor can change the site’s settings, then records the site, the setting being changed, the source event ID, when the change takes effect, and its business version. If the same event is delivered twice, the application recognizes the retry and applies the change once. A question such as “Should we switch to email?” leaves the default alone.

In [MemOS Cloud’s asynchronous write mode](/memos_cloud/features/async_mode/), keep the returned task ID. Record when the service acknowledges the write and when a search for this site first returns the portal as its default. The two times can differ, and a memory may be searchable while refinement continues. If the task completes but the default still doesn’t appear, use the [task status response](/api_docs/message/get_status/) to see which memory IDs were affected. Check the relevant record, then check the scope and filters on the search.

## 2. Retrieve and apply the current version

The portal goes down. The supervisor says, “Email this repair ticket to maintenance.” The application looks up the default within the worker’s authorized site scope, checks that the record is current, and includes the supervisor’s one-ticket exception in the model request. The test receipt should show that this ticket went by email.

Once the portal is available again, open a fresh repair case for the same site. This time the receipt should show a portal submission. If the second ticket also goes by email, compare the memory ID and business version returned by search, the information supplied to the model, and the destination sent to the repair tool. That will show whether the exception was saved as a default, carried over in a case summary, or introduced when the tool call was built.

## 3. Update in confirmation order

The supervisor now says, “Starting now, send all repair tickets for this site through the field service app.” The application records that decision as version 2. MemOS Cloud lets an application [update a saved memory by ID](/memos_cloud/mem_operations/update_memory/). The application also needs a rule for deciding which confirmed version is current when background jobs finish out of order.

Test that rule by letting version 2 finish indexing, then replaying an indexing job for version 1, the portal default. A new ticket should still go to the field service app. One implementation keeps a separate record for each version and updates the site’s current-version pointer only if the incoming version is newer. That comparison and the pointer change must happen together so a late job cannot put version 1 back in force.

Run a separate test for a request already in progress. Start with the portal as the default and pause a ticket just after search returns version 1. Confirm the switch to the field service app, then resume the ticket. Before sending the model request, the application should replace the old routing instruction with the current one. If the rule changes after the model has prepared the tool call, the submission service should check the destination again. If it can’t verify the current route, hold the ticket for review.

## 4. Forget the record and prevent it from returning

A temporary exception can expire when its repair case closes. Deleting the site default takes a different action. After an authorized supervisor requests deletion, the application must stop using the affected versions by the time it has promised. MemOS Cloud supports [deleting specific memories by ID](/memos_cloud/mem_operations/delete_memory/). The application must also invalidate any cached instructions or summaries it uses to route tickets. If it retains the original messages under its retention policy, it needs enough deletion history to keep a later import from recreating the retired default.

Give the site an unrelated language preference before the test. After deleting the routing default, open a new case. The assistant should still use the site’s preferred language and ask where to send this ticket. It should have no standing instruction to use the portal or the field service app, and the earlier email exception applied only to its own ticket.

Now restore a snapshot from before the deletion in a staging environment. Rebuild the index, reapply the deletion history, and release a queued job for version 1. Before reopening reads, verify that the affected records are ineligible across the paths that will serve the application. Repeat the fresh-case test: the language preference should still work, and the ticket should still need a destination. Finally, have the supervisor authorize a new default. A new ticket should use that decision. The old snapshot and the late indexing job should have no say in where it goes.
