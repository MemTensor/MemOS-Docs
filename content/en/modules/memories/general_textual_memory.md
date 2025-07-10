---
title: "GeneralTextMemory: General-Purpose Textual Memory"
desc: "`GeneralTextMemory` is a flexible, vector-based textual memory module in MemOS, designed for storing, searching, and managing unstructured knowledge. It is suitable for conversational agents, personal assistants, and any system requiring semantic memory retrieval."
---

## Memory Structure

Each memory is represented as a `TextualMemoryItem`:

| Field      | Type                        | Description                        |
| ---------- | --------------------------- | ---------------------------------- |
| `id`       | `str`                       | UUID (auto-generated if omitted)   |
| `memory`   | `str`                       | The main memory content (required) |
| `metadata` | `TextualMemoryMetadata`     | Metadata for search/filtering      |

### Metadata Fields (`TextualMemoryMetadata`)

| Field         | Type                                               | Description                         |
| ------------- | -------------------------------------------------- | ----------------------------------- |
| `type`        | `"procedure"`, `"fact"`, `"event"`, `"opinion"` | Memory type                         |
| `memory_time` | `str (YYYY-MM-DD)`                                 | Date/time the memory refers to      |
| `source`      | `"conversation"`, `"retrieved"`, `"web"`, `"file"` | Source of the memory                |
| `confidence`  | `float (0-100)`                                    | Certainty/confidence score          |
| `entities`    | `list[str]`                                        | Key entities/concepts               |
| `tags`        | `list[str]`                                        | Thematic tags                       |
| `visibility`  | `"private"`, `"public"`, `"session"`            | Access scope                        |
| `updated_at`  | `str`                                              | Last update timestamp (ISO 8601)    |

All values are validated. Invalid values will raise errors.

## API Summary (`GeneralTextMemory`)

### Initialization
```python
GeneralTextMemory(config: GeneralTextMemoryConfig)
```

### Core Methods
| Method                   | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `extract(messages)`      | Extracts memories from message list (LLM-based)     |
| `add(memories)`          | Adds one or more memories (items or dicts)          |
| `search(query, top_k)`   | Retrieves top-k memories using vector similarity    |
| `get(memory_id)`         | Fetch single memory by ID                           |
| `get_by_ids(ids)`        | Fetch multiple memories by IDs                      |
| `get_all()`              | Returns all memories                                |
| `update(memory_id, new)` | Update a memory by ID                               |
| `delete(ids)`            | Delete memories by IDs                              |
| `delete_all()`           | Delete all memories                                 |
| `dump(dir)`              | Serialize all memories to JSON file in directory    |
| `load(dir)`              | Load memories from saved file                       |

## File Storage

When calling `dump(dir)`, the system writes to:

```
<dir>/<config.memory_filename>
```

This file contains a JSON list of all memory items, which can be reloaded using `load(dir)`.

## Example Usage

```python
from memos.configs.memory import MemoryConfigFactory
from memos.memories.factory import MemoryFactory

config = MemoryConfigFactory(
    backend="general_text",
    config={
        "extractor_llm": { ... },
        "vector_db": { ... },
        "embedder": { ... },
    },
)
m = MemoryFactory.from_config(config)

# Extract and add memories
memories = m.extract([
    {"role": "user", "content": "I love tomatoes."},
    {"role": "assistant", "content": "Great! Tomatoes are delicious."},
])
m.add(memories)

# Search
results = m.search("Tell me more about the user", top_k=2)

# Update
m.update(memory_id, {"memory": "User is Canadian.", ...})

# Delete
m.delete([memory_id])

# Dump/load
m.dump("tmp/mem")
m.load("tmp/mem")
```

## Developer Notes

* Uses Qdrant (or compatible) vector DB for fast similarity search
* Embedding and extraction models are configurable (Ollama/OpenAI supported)
* All methods are covered by integration tests in `/tests`
