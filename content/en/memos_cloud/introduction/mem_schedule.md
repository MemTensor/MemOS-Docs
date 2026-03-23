---
title: Memory Scheduling
desc: Memory scheduling works like the brain's attention mechanism, dynamically deciding which memories to call up at the right moment.
---

## 1. Capability Overview

In MemOS, **Memory Scheduling** orchestrates memories with different efficiency tiers (parameters > active > working > other plaintext) so the model can retrieve what the user needs more efficiently and accurately. While conversations or tasks run, it predicts which memories might be required next and proactively loads higher efficiency types such as active or working memories to accelerate reasoning.

::note{icon="ri:triangular-flag-fill"}
**Why is scheduling needed?**
::

In complex interactions, relying only on a basic global search each time can lead to:

* **Too slow**: Waiting until the user finishes before searching causes high first-token latency.
* **Inaccurate**: Too much history can bury key information and make retrieval harder.

<br>

Scheduling equips the system with “just-in-time preparation and rapid response” capabilities:

* **Preloading**: Load the user’s frequently used background right at the start of a conversation.
* **Predictive fetch**: Prepare likely-to-be-used memories before the user finishes typing.

<br>

::note
**How it works — combine task semantics, context, access frequency, lifecycle, and other signals to dynamically arrange memory invocation and storage.**
::

| Dimension | Description |
| --- | --- |
| What to schedule? | Parameter memories (long-term knowledge and skills)<br><br>Active memories (runtime KV cache and hidden states)<br><br>Plaintext memories (externally editable facts, user preferences, retrieved snippets)<br><br>Supports dynamic migration across `plaintext ⇆ active ⇆ parameter`: frequently used plaintext snippets can be compiled into KV cache in advance, while stable templates can settle into parameters. |
| When to schedule? | When existing context plus high-efficiency memories are insufficient to answer the user, optimize the memory structure.<br><br>Prepare memories in advance according to user intent and needs.<br><br>During continuous questioning, keep the dialog context efficient and accurate via scheduling. |
| Who receives it? | The current user, specific agent roles, or cross-task shared contexts. |
| What form? | Memories are tagged with heat, freshness, and importance. The scheduler uses these signals to decide who loads first, who goes to cold storage, and who needs archiving. |

When you use the MemOS Cloud service, you can observe scheduling through the `searchMemory` API:

* It quickly returns relevant memories, avoiding context gaps.
* Returned content has already been optimized by the scheduler, so results stay relevant without overloading the model input.

## 2. Example: Memory Scheduling in a Home Assistant Scenario

*Earlier:* The user was busy looking for a house.

::card-group

  :::card
  ---
  title: The user often says
  ---
  * “Help me check the average second-hand price in XX community.”
  * “Remind me to view houses on Saturday.”
  * “Record the latest mortgage rate changes.”
  :::

  :::card
  ---
  title: ✨ What MemOS does
  ---
  * The system initially writes these entries as **plaintext memories**.
  * Because the house-hunting topic appears frequently, the scheduler identifies it as a **core theme** and migrates the related plaintext memories into **active memories** so follow-up queries are faster and more direct.
  :::

::

<br>

*Recently:* The user bought the house and started renovating.

::card-group

  :::card
  ---
  title: The user now says
  ---
  * “I’m going to look at tiles this weekend.”
  * “Remind me to confirm electrical and plumbing work with the contractor.”
  * “Note next week’s furniture delivery schedule.”
  :::

  :::card
  ---
  title: ✨ What MemOS does
  ---
  * The system keeps generating new **plaintext memories**.
  * The scheduler detects that “renovation” has become the new high-frequency topic, so it upgrades those entries into **active memories**.
  * Previously active house-hunting memories are no longer used, so they are automatically **downgraded back to plaintext** to free active capacity.
  :::

::

<br>

*Right now:* The user casually says, “I feel like everything is piling up—please sort it out for me.”

::card-group

  :::card
  ---
  title: Without scheduling, a full-database retrieval would return
  ---
  * Check tiles (renovation)
  * Confirm electrical and plumbing (renovation)
  * Furniture delivery (renovation)
  * Check housing prices (house-hunting, outdated)
  * View houses (house-hunting, outdated)
  * Grocery shopping (chores)
  * Watch movies (chores)
  :::

  :::card
  ---
  title: ✨ With scheduling, the system quickly returns
  ---
  * Check tiles
  * Confirm electrical and plumbing
  * Furniture delivery
  :::

::

<br>

👉 **User experience improves**

* Faster responses (no need for full-database scans).
* The list contains exactly what the user cares about—so the assistant “really gets me.”

## 3. Advanced: If You Want Deep Customization

Developers can **extend scheduling strategies** to customize system behavior, for example:

| Category | Description | Example Scenario |
| --- | --- | --- |
| Permissions & governance | Combine scheduling with access control and compliance checks. | Medical records are visible only to doctors; sensitive content cannot be shared across domains. |
| Scheduling metrics | Optimize scheduling based on access frequency and latency needs. | High-frequency hot memories gain priority; low-frequency cold memories are downgraded to archival storage. |

## 4. Next Steps

Learn more about MemOS core capabilities:

* [Memory Recall](/overview/quick_start/mem_recall)
* [Memory Lifecycle Management](/overview/quick_start/mem_lifecycle)
