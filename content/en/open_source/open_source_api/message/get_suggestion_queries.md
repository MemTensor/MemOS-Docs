---
title: Get Suggestions
desc: "Automatically generate 3 follow-up conversation suggestions based on the current dialogue context or recent memories in a Cube."
---

# Get Suggestion Queries

**Endpoint**: `POST /product/suggestions`
**Description**: Implements a "suggested questions" feature. The system generates 3 relevant follow-up questions based on the provided conversation context or recent memories in the target **MemCube**, helping users continue the conversation.

## 1. Core Mechanism: Dual-mode Generation

**SuggestionHandler** supports two flexible generation modes:

* **Context-based (Instant Suggestions)**:
    * **Trigger**: `message` is provided in the request.
    * **Logic**: Analyzes recent conversation to generate 3 closely related follow-up questions.
* **Memory-based (Discovery Suggestions)**:
    * **Trigger**: `message` is not provided.
    * **Logic**: Retrieves recent memories from the specified `mem_cube_id` and generates inspirational questions about the user's recent activities.

## 2. Key Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`user_id`** | `str` | Yes | - | Unique user identifier. |
| **`mem_cube_id`** | `str` | Yes | - | **Core**: The memory space for generating suggestions. |
| **`language`** | `str` | No | `zh` | Language: `zh` (Chinese) or `en` (English). |
| `message` | `list/str` | No | - | Current conversation context. If provided, generates context-based suggestions. |

## 3. How It Works (SuggestionHandler)

1. **Context Detection**: Checks the `message` field. If present, extracts conversation essence; if empty, queries the underlying `MemCube` for recent dynamics.
2. **Template Matching**: Automatically switches between Chinese and English prompt templates based on `language`.
3. **Model Inference**: Calls the LLM to derive 3 questions that are logical and thought-provoking.
4. **Formatted Output**: Returns suggestions as an array for direct rendering as clickable buttons in the frontend.

## 4. Quick Start

```python
from memos.api.client import MemOSClient

client = MemOSClient(api_key="...", base_url="...")

res = client.get_suggestions(
    user_id="dev_user_01",
    mem_cube_id="private_cube_01",
    language="en",
    message=[
        {"role": "user", "content": "I want to learn R visualization."},
        {"role": "assistant", "content": "I recommend learning ggplot2 — it's the core visualization tool in R."}
    ]
)

if res and res.code == 200:
    # Example output: ["How do I install ggplot2?", "What are some classic ggplot2 tutorials?", "What other R visualization packages are there?"]
    print(f"Suggestions: {res.data}")
```

## 5. Suggested Use Cases

**Conversation Guidance**: After the AI responds, automatically call this endpoint and display suggestion buttons below the reply to encourage deeper exploration.

**Cold Start Activation**: When a user enters a new session without sending a message, use memory-based mode to show topics from past sessions, breaking the silence.
