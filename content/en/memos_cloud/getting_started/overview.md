---
title: MemOS Overview
desc: Memory Operation System, giving AI applications long-term memory.
---

MemOS is a managed memory platform for AI applications and Agents. After information is written to MemOS, the system automatically produces, recalls, and updates memories, then keeps providing concise and accurate context in later requests.

You do not need to repeatedly solve the problem of "how AI remembers." By calling the cloud service APIs, you can add long-term memory to your application.

## What MemOS Gives You

- **Long-term continuity for AI**: preserve user facts, preferences, and task progress across sessions, so AI does not start from zero every time.
- **Useful memories over time**: continuously extract, deduplicate, update, and correct memories to keep them accurate and effective.
- **Lower engineering cost**: use a production memory platform that manages memory production, scheduling, recall, and lifecycle management instead of building the full memory stack yourself.
- **Room to extend**: support knowledge bases, Skills, tool memories, multimodal input, and Agent workflows for broader business scenarios.

## Core Workflow

![How MemOS Works](https://cdn.memtensor.com.cn/img/1779432830540_evti9q_compressed.png)

::steps{level="3"}

### Add Raw Information

Pass user chats, behavior events, knowledge files, images, Skills, and other raw information into MemOS.

### Produce and Update Memories

MemOS processes raw information in the background into retrievable memory content, then continuously updates memories, schedules them in real time, corrects them with natural-language feedback, and manages their full lifecycle.

### Retrieve Memories

When retrieving memories, MemOS filters and recalls the most relevant memories for model responses, Agent decisions, or business workflows, helping AI maintain continuous understanding in later requests.

::

## Choose How to Start

::card-group
  :::card
  ---
  icon: ri:rocket-line
  title: Quick Start

  to: /memos_cloud/getting_started/quick_start
  ---
  Create your first project from here
  :::

  :::card
  ---
  icon: ri:brain-line
  title: How MemOS Works

  to: /memos_cloud/introduction/mem_production
  ---
  Understand the memory mechanism before integration
  :::

  :::card
  ---
  icon: ri:dashboard-line
  title: Cloud Service & Open Source

  to: /memos_cloud/getting_started/cloud_and_opensource
  ---
  Compare cloud service and open-source self-hosting options
  :::

  :::card
  ---
  icon: ri:robot-line
  title: Use in Agents

  to: /memos_cloud/getting_started/agent_usage
  ---
  Integrate with OpenClaw, Hermes, or other AI tools
  :::
::
