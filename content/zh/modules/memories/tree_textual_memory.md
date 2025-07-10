---
title: "TreeTextMemory: Structured Hierarchical Textual Memory"
---

Let’s build your first **graph-based, tree-structured memory** in MemOS!

**TreeTextMemory** helps you organize, link, and retrieve memories with rich context and explainability.

[Neo4j](/modules/memories/neo4j_graph_db) is the current backend, with support for additional graph stores planned in the future.


## What You’ll Learn

By the end of this guide, you will:
- Extract structured memories from raw text or conversations.
- Store them as **nodes** in a graph database.
- Link memories into **hierarchies** and semantic graphs.
- Search them using **vector similarity + graph traversal**.

## How It Works

### Memory Structure

Every node in your `TreeTextMemory` is a `TextualMemoryItem`:
- `id`: Unique memory ID (auto-generated if omitted).
- `memory`: the main text.
- `metadata`: includes hierarchy info, embeddings, tags, entities, source, and status.

### Metadata Fields (`TreeNodeTextualMemoryMetadata`)

| Field           | Type                                                  | Description                                |
| --------------- |-------------------------------------------------------| ------------------------------------------ |
| `memory_type`   | `"WorkingMemory"`, `"LongTermMemory"`, `"UserMemory"` | Lifecycle category                         |
| `status`        | `"activated"`, `"archived"`, `"deleted"`              | Node status                                |
| `visibility`    | `"private"`, `"public"`, `"session"`                  | Access scope                               |
| `sources`       | `list[str]`                                           | List of sources (e.g. files, URLs)        |
| `source`        | `"conversation"`, `"retrieved"`, `"web"`, `"file"`    | Original source type                       |
| `confidence`    | `float (0-100)`                                       | Certainty score                            |
| `entities`      | `list[str]`                                           | Mentioned entities or concepts             |
| `tags`          | `list[str]`                                           | Thematic tags                              |
| `embedding`     | `list[float]`                                         | Vector embedding for similarity search     |
| `created_at`    | `str`                                                 | Creation timestamp (ISO 8601)              |
| `updated_at`    | `str`                                                 | Last update timestamp (ISO 8601)           |
| `usage`         | `list[str]`                                           | Usage history                              |
| `background`    | `str`                                                 | Additional context                         |


::note
**Best Practice**<br>
  Use meaningful tags and background — they help organize your graph for
multi-hop reasoning.
::

### Core Steps

When you run this example, your workflow will:

1. **Extract:** Use an LLM to pull structured memories from raw text.


2. **Embed:** Generate vector embeddings for similarity search.


3. **Store & Link:** Add nodes to your graph database (Neo4j) with relationships.


4. **Search:** Query by vector similarity, then expand results by graph hops.


::note
**Hint**<br>Graph links help retrieve context that pure vector search might miss!
::

## API Summary (`TreeTextMemory`)

### Initialization

```python
TreeTextMemory(config: TreeTextMemoryConfig)
```

### Core Methods

| Method                      | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| `add(memories)`             | Add one or more memories (items or dicts)             |
| `replace_working_memory()`  | Replace all WorkingMemory nodes                       |
| `get_working_memory()`      | Get all WorkingMemory nodes                           |
| `search(query, top_k)`      | Retrieve top-k memories using vector + graph search   |
| `get(memory_id)`            | Fetch single memory by ID                             |
| `get_by_ids(ids)`           | Fetch multiple memories by IDs                        |
| `get_all()`                 | Export the full memory graph as dictionary            |
| `update(memory_id, new)`    | Update a memory by ID                                 |
| `delete(ids)`               | Delete memories by IDs                                |
| `delete_all()`              | Delete all memories and relationships                 |
| `dump(dir)`                 | Serialize the graph to JSON in directory              |
| `load(dir)`                 | Load graph from saved JSON file                       |
| `drop(keep_last_n)`         | Backup graph & drop database, keeping N backups       |

## File Storage

When calling `dump(dir)`, the system writes to:

```
<dir>/<config.memory_filename>
```

This file contains a JSON structure with `nodes` and `edges`. It can be reloaded using `load(dir)`.

---

## Your First TreeTextMemory — Step by Step

::steps{}

### Create TreeTextMemory Config
Define:
- your embedder (to create vectors),
- your graph DB backend (Neo4j),
- and your extractor LLM (optional).

```python
from memos.configs.memory import TreeTextMemoryConfig

config = TreeTextMemoryConfig.from_json_file("examples/data/config/tree_config.json")
```


### Initialize TreeTextMemory

```python
from memos.memories.textual.tree import TreeTextMemory

tree_memory = TreeTextMemory(config)
```

### Extract Structured Memories

Use your extractor to parse conversations, files, or docs into `TextualMemoryItem`s.

```python
from memos.mem_reader.simple_struct import SimpleStructMemReader

reader = SimpleStructMemReader.from_json_file("examples/data/config/simple_struct_reader_config.json")

scene_data = [[
    {"role": "user", "content": "Tell me about your childhood."},
    {"role": "assistant", "content": "I loved playing in the garden with my dog."}
]]

memories = reader.get_memory(scene_data, type="chat", info={"user_id": "1234"})
for m_list in memories:
    tree_memory.add(m_list)
```

### Search Memories

Try a vector + graph search:
```python
results = tree_memory.search("Talk about the garden", top_k=5)
for i, node in enumerate(results):
    print(f"{i}: {node.memory}")
```

### Replace Working Memory

Replace your current `WorkingMemory` nodes with new ones:
```python
tree_memory.replace_working_memory(
    [{
        "memory": "User is discussing gardening tips.",
        "metadata": {"memory_type": "WorkingMemory"}
    }]
)
```

### Backup & Restore
Dump your entire tree structure to disk and reload anytime:
```python
tree_memory.dump("tmp/tree_memories")
tree_memory.load("tmp/tree_memories")
```

::


### Whole Code

This combines all the steps above into one end-to-end example — copy & run!

```python
from memos.configs.embedder import EmbedderConfigFactory
from memos.configs.memory import TreeTextMemoryConfig
from memos.configs.mem_reader import SimpleStructMemReaderConfig
from memos.embedders.factory import EmbedderFactory
from memos.mem_reader.simple_struct import SimpleStructMemReader
from memos.memories.textual.tree import TreeTextMemory

# Setup Embedder
embedder_config = EmbedderConfigFactory.model_validate({
    "backend": "ollama",
    "config": {"model_name_or_path": "nomic-embed-text:latest"}
})
embedder = EmbedderFactory.from_config(embedder_config)

# Create TreeTextMemory
tree_config = TreeTextMemoryConfig.from_json_file("examples/data/config/tree_config.json")
my_tree_textual_memory = TreeTextMemory(tree_config)
my_tree_textual_memory.delete_all()

# Setup Reader
reader_config = SimpleStructMemReaderConfig.from_json_file(
    "examples/data/config/simple_struct_reader_config.json"
)
reader = SimpleStructMemReader(reader_config)

# Extract from conversation
scene_data = [[
    {
        "role": "user",
        "content": "Tell me about your childhood."
    },
    {
        "role": "assistant",
        "content": "I loved playing in the garden with my dog."
    },
]]
memory = reader.get_memory(scene_data, type="chat", info={"user_id": "1234", "session_id": "2222"})
for m_list in memory:
    my_tree_textual_memory.add(m_list)

# Search
results = my_tree_textual_memory.search(
    "Talk about the user's childhood story?",
    top_k=10
)
for i, r in enumerate(results):
    print(f"{i}'th result: {r.memory}")

# [Optional] Add from documents
doc_paths = ["./text1.txt", "./text2.txt"]
doc_memory = reader.get_memory(
  doc_paths, "doc", info={
      "user_id": "your_user_id",
      "session_id": "your_session_id",
  }
)
for m_list in doc_memory:
    my_tree_textual_memory.add(m_list)

# [Optional] Dump & Drop
my_tree_textual_memory.dump("tmp/my_tree_textual_memory")
my_tree_textual_memory.drop()
```

## What Makes TreeTextMemory Different?

- **Structured Hierarchy:** Organize memories like a mind map — nodes can
have parents, children, and cross-links.
- **Graph-Style Linking:** Beyond pure hierarchy — build multi-hop reasoning
  chains.
- **Semantic Search + Graph Expansion:** Combine the best of vectors and
  graphs.
- **Explainability:** Trace how memories connect, merge, or evolve over time.

::note
**Try This**<br>Add memory nodes from documents or web content. Link them
manually or auto-merge similar nodes!
::

## What’s Next?

- **Know more about [Neo4j](/modules/memories/neo4j_graph_db):** TreeTextMemory is powered by a graph database backend.
  Understanding how Neo4j handles nodes, edges, and traversal will help you design more efficient memory hierarchies, multi-hop reasoning, and context linking strategies.
- **Add [Activation Memory](/modules/memories/kv_cache_memory):**
  Experiment with
  runtime KV-cache for session
  state.
- **Explore Graph Reasoning:** Build workflows for multi-hop retrieval and answer synthesis.
- **Go Deep:** Check the [API Reference](/docs/api/info) for advanced usage, or run more examples in `examples/`.

Now your agent remembers not just facts — but the connections between them!
