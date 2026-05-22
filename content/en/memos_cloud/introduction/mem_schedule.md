---
title: Memory Scheduling
desc: Memory scheduling decides which memories should be prepared in advance, prioritized, or temporarily downgraded while conversations and tasks are running.
---

## 1. What Is Memory Scheduling

Memory scheduling is MemOS's runtime ability to manage memory availability. It is not just about "which memory is found". Based on the current task, user state, historical topics, and memory heat, it decides which memories should stay closer to model context and which can remain in low-frequency storage.

You can think of memory scheduling as attention management in the memory system. When a user enters a task scenario, the system prepares the memories most likely to be needed and reduces interference from irrelevant history.

## 2. Why Scheduling Is Needed

If every request only performs a full retrieval, the system faces three problems:

- **Slower response**: waiting until the user asks before searching all history increases first-token latency.
- **Context overload**: recalling too much history may bury the information actually needed for the current task.
- **Unnatural topic switching**: when the user's recent focus changes, the system needs to raise the priority of the new topic and downgrade the old one.

The goal of scheduling is not to store more content, but to make the right memories available at the right time.

## 3. What Scheduling Looks At

| Signal | Role |
| --- | --- |
| Current task | Determines which topic or scenario the user is working on |
| Memory relevance | Identifies which memories are closer to the current input, conversation, and business goal |
| Freshness | Prioritizes information that is still valid and reduces the impact of outdated content |
| Usage frequency | Frequently used memories are more likely to be prepared in advance or kept active |
| Permission scope | Ensures scheduling respects user, Agent, tenant, and business isolation rules |

Scheduling affects later recall and context injection. Relevant, active, and trustworthy memories are more likely to be used first; low-frequency, outdated, or context-inappropriate memories are delayed.

## 4. Example: From Buying a Home to Renovation

**Earlier stage: buying a home is the core topic**

::card-group

  :::card
  ---
  icon: i-ri-message-3-line
  title: User input
  ---
  "Help me check the average second-hand home price around Binjiang."<br>
  "Remind me to view houses on Saturday."<br>
  "Record the latest mortgage rate changes."
  :::

  :::card
  ---
  icon: i-ri-timer-flash-line
  title: Scheduling result
  ---
  Generate memories about communities, house-viewing schedules, and mortgage rates.<br>
  Determine that "home buying" is a recent high-frequency topic.<br>
  Keep home-buying memories at a higher priority.
  :::

::

<br>

**Recently: renovation becomes the new active topic**

::card-group

  :::card
  ---
  icon: i-ri-message-3-line
  title: User input
  ---
  "I'm going to look at tiles this weekend."<br>
  "Remind me to confirm plumbing and electrical work with the contractor."<br>
  "Note next week's furniture delivery time."
  :::

  :::card
  ---
  icon: i-ri-timer-flash-line
  title: Scheduling result
  ---
  Continue generating renovation-related memories.<br>
  Determine that "renovation" has become the new high-frequency topic.<br>
  Move renovation memories to a higher priority.<br>
  Keep home-buying memories, but gradually downgrade them.
  :::

::

<br>

The user casually says: "I feel like a lot of things are piling up. Please sort them out for me."

::card-group

  :::card
  ---
  class: border-amber-200 bg-amber-50/70 dark:border-amber-800/50 dark:bg-amber-950/20
  color: warning
  icon: i-ri-error-warning-line
  title: Without scheduling: temporary full retrieval
  ---
  Needs to retrieve from all memories on the spot.<br>
  May mix in low-relevance items such as checking housing prices, viewing houses, grocery shopping, or watching movies.<br>
  The answer is slower and more likely to drift away from the current task.
  :::

  :::card
  ---
  class: border-emerald-200 bg-emerald-50/70 dark:border-emerald-800/50 dark:bg-emerald-950/20
  color: success
  icon: i-ri-checkbox-circle-line
  title: With scheduling: prepare the current topic first
  ---
  Prioritize renovation memories such as looking at tiles, confirming plumbing and electrical work, and furniture delivery.<br>
  No need to re-evaluate the full history every time.<br>
  Responses are faster and closer to what the user is currently worried about.
  :::

::

## 5. Relationship with Recall

Scheduling and recall are not the same thing:

| Capability | Focus |
| --- | --- |
| Memory scheduling | Which memories should be more active and closer to model context at the current stage |
| Memory recall | Which memories should be retrieved and used in a specific request |

Scheduling is runtime preparation and priority management. Recall is retrieval and selection for one request. When scheduling works well, recall is usually faster, more accurate, and less affected by irrelevant history.
