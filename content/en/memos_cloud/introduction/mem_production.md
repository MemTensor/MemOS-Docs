---
title: Memory Production
desc: Memory production turns raw conversations, behavior events, tool calls, and knowledge content into structured memories that can be searched, updated, and scheduled.
---

## 1. What Is Memory Production

Memory production is the write and processing stage of the MemOS workflow. After developers submit raw information, MemOS extracts facts, preferences, tool usage processes, skill clues, and knowledge content, then generates memory units that can later be searched, filtered, scheduled, and updated.

Raw information may be stored in full first, but what enters later reasoning is usually not the whole original text. It is the memory produced after extraction, denoising, structuring, and version governance.

## 2. Why Not Just Store Raw Text

If all raw information is stored directly and pasted into the model next time, three problems appear:

- **High context cost**: raw conversations, logs, and files often contain greetings, repetition, and irrelevant details. Pasting them directly wastes tokens.
- **Unstable retrieval quality**: long unprocessed text lacks clear topics and structure, so it can recall fragments that look relevant but do not help.
- **Hard long-term consistency**: user preferences, locations, and states change. Raw text alone cannot clearly express "what should be trusted now".

The goal of memory production is to turn "what happened" into "what can be used later".

## 3. Key Processing Stages

From raw input to usable memory, the middle step is not simple text saving. It is an ongoing process of organizing information into long-term usable understanding. It usually includes:

| Stage | Role |
| --- | --- |
| Extraction | Identify information worth keeping long term from raw conversations, events, or documents |
| Structuring | Organize information into distinguishable memory categories such as facts, preferences, tools, skills, and knowledge |
| Denoising | Filter greetings, repeated content, temporary context, and low-value logs |
| Merging | Merge identical or similar information to reduce duplicate memories |
| Evolution | Update currently trusted memories when user state or preferences change, while keeping necessary history |

## 4. Example: From Conversation to Memory

Raw conversation:

```text
User: I have booked a summer trip to Guangzhou. Which hotel chains are available?
Assistant: You can consider 7 Days Inn, Ji Hotel, Hilton, and others.
User: I'll choose 7 Days Inn.
Assistant: Got it. Feel free to ask if you have other questions.
```

Possible generated memories:

- Fact memories come from explicit statements in the original text.
- Preference memories combine context and reasoning to summarize user preferences.

```text
- Fact memory: The user plans to travel to Guangzhou during the summer vacation.
- Fact memory: The user chose 7 Days Inn from the accommodation options in Guangzhou.

- Implicit preference: The user may prefer economical and practical hotels. <Reasoning: the user chose 7 Days Inn among 7 Days Inn, Ji Hotel, Hilton, and other options, but the original conversation did not explicitly mention budget reasons.>
```

## 5. Next Steps

::card-group
  :::card
  ---
  icon: ri:inbox-archive-line
  title: Raw Input Content
  to: /memos_cloud/introduction/raw_inputs
  ---
  Confirm what content can be written
  :::

  :::card
  ---
  icon: ri:price-tag-3-line
  title: Memory Categories
  to: /memos_cloud/introduction/memory_types
  ---
  Understand facts, preferences, tools, skills, and other memory categories
  :::

  :::card
  ---
  icon: ri:message-3-line
  title: Add Message
  to: /memos_cloud/mem_operations/add_message
  ---
  View how message writing and memory production are integrated
  :::
::
