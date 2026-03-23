---
title: MemCube
desc: "`MemCube` is the core organizational unit in MemOS, designed to encapsulate and manage all types of memory for a user or agent. It provides a unified interface for loading, saving, and operating on multiple memory modules, making it easy to build, share, and deploy memory-augmented applications."
---
## What is a MemCube?

A **MemCube** is a container that bundles memory modules for a user/cube.

In MemOS, the `GeneralMemCube` implementation can contain four configured memories:

- **Textual Memory** (`text_mem`) (e.g., `GeneralTextMemory`, `TreeTextMemory`)
- **Activation Memory** (`act_mem`) (e.g., `KVCacheMemory`, `VLLMKVCacheMemory`)
- **Parametric Memory** (`para_mem`) (e.g., `LoRAMemory`)
- **Preference Memory** (`pref_mem`) (a specialized textual memory backend, e.g. `pref_text`)

Each memory type is independently configurable and can be swapped or extended as needed.

## Structure

A MemCube is defined by a configuration (see `GeneralMemCubeConfig`), which specifies the backend and settings for each memory type. The typical structure is:

```
MemCube
 ├── text_mem: TextualMemory
 ├── act_mem: ActivationMemory
 └── para_mem: ParametricMemory
 └── pref_mem: TextualMemory (preference)
```

All memory modules are accessible via the MemCube interface:

- `mem_cube.text_mem`
- `mem_cube.act_mem`
- `mem_cube.para_mem`
- `mem_cube.pref_mem`

## View Architecture

Starting from MemOS 2.0, runtime operations (add/search) should go through the **View architecture**:

### SingleCubeView

Operates on a single MemCube. Use when you have one logical memory space.

```python
from memos.multi_mem_cube.single_cube import SingleCubeView

view = SingleCubeView(
    cube_id="my_cube",
    naive_mem_cube=naive_mem_cube,
    mem_reader=mem_reader,
    mem_scheduler=mem_scheduler,
    logger=logger,
    searcher=searcher,
    feedback_server=feedback_server,  # Optional
)

# Add memories
view.add_memories(add_request)

# Search memories
view.search_memories(search_request)
```

### CompositeCubeView

Operates on multiple MemCubes. Fan-out operations to multiple SingleCubeViews and aggregate results.

```python
from memos.multi_mem_cube.composite_cube import CompositeCubeView

# Create multiple SingleCubeViews
view1 = SingleCubeView(cube_id="cube_1", ...)
view2 = SingleCubeView(cube_id="cube_2", ...)

# Composite view for multi-cube operations
composite = CompositeCubeView(cube_views=[view1, view2], logger=logger)

# Search across all cubes
results = composite.search_memories(search_request)
# Results contain cube_id field to identify source
```

### API Request Fields

| Field                 | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `writable_cube_ids` | Target cubes for add operations                                    |
| `readable_cube_ids` | Target cubes for search operations                                 |
| `async_mode`        | `"async"` (scheduler enabled) or `"sync"` (scheduler disabled) |

## API Summary (`GeneralMemCube`)

### Initialization

```python
from memos.mem_cube.general import GeneralMemCube
from memos.configs.mem_cube import GeneralMemCubeConfig

config = GeneralMemCubeConfig()
mem_cube = GeneralMemCube(config)
```

### Static Data Operations

| Method                                    | Description                                               |
| ----------------------------------------- | --------------------------------------------------------- |
| `init_from_dir(dir)`                    | Load a MemCube from a local directory                     |
| `init_from_remote_repo(cube_id, base_url)` | Load a MemCube from remote repo (e.g., Hugging Face)      |
| `load(dir, memory_types=None)`          | Load selected memories from a directory into the instance |
| `dump(dir, memory_types=None)`          | Save selected memories to a directory for persistence     |

## File Storage

A MemCube directory typically contains:

- `config.json` (MemCube configuration)
- `textual_memory.json` (textual memory)
- `activation_memory.pickle` (activation memory)
- `parametric_memory.adapter` (parametric memory)

## Example Usage

The repository provides runnable examples under `MemOS/examples/mem_cube/`.

### Export Example (dump_cube.py)

```python
import json
import os
import shutil

from memos.api.handlers import init_server
from memos.api.product_models import APIADDRequest
from memos.log import get_logger
from memos.multi_mem_cube.single_cube import SingleCubeView

logger = get_logger(__name__)
EXAMPLE_CUBE_ID = "example_dump_cube"
EXAMPLE_USER_ID = "example_user"

# 1. Initialize server
components = init_server()
naive = components["naive_mem_cube"]

# 2. Create SingleCubeView
view = SingleCubeView(
    cube_id=EXAMPLE_CUBE_ID,
    naive_mem_cube=naive,
    mem_reader=components["mem_reader"],
    mem_scheduler=components["mem_scheduler"],
    logger=logger,
    searcher=components["searcher"],
    feedback_server=components["feedback_server"],
)

# 3. Add memories via View
result = view.add_memories(APIADDRequest(
    user_id=EXAMPLE_USER_ID,
    writable_cube_ids=[EXAMPLE_CUBE_ID],
    messages=[
        {"role": "user", "content": "This is a test memory"},
        {"role": "user", "content": "Another memory to persist"},
    ],
    async_mode="sync",  # Use sync mode to ensure immediate completion
))
print(f"✓ Added {len(result)} memories")

# 4. Export specific cube_id data
output_dir = "tmp/mem_cube_dump"
if os.path.exists(output_dir):
    shutil.rmtree(output_dir)
os.makedirs(output_dir, exist_ok=True)

# Export graph data (only data for current cube_id)
json_data = naive.text_mem.graph_store.export_graph(
    include_embedding=True,  # Include embeddings for semantic search
    user_name=EXAMPLE_CUBE_ID,  # Filter by cube_id
)

# Fix embedding format: parse string to list for import compatibility
import contextlib
for node in json_data.get("nodes", []):
    metadata = node.get("metadata", {})
    if "embedding" in metadata and isinstance(metadata["embedding"], str):
        with contextlib.suppress(json.JSONDecodeError):
            metadata["embedding"] = json.loads(metadata["embedding"])

print(f"✓ Exported {len(json_data.get('nodes', []))} nodes")

# Save to file
memory_file = os.path.join(output_dir, "textual_memory.json")
with open(memory_file, "w", encoding="utf-8") as f:
    json.dump(json_data, f, indent=2, ensure_ascii=False)
print(f"✓ Saved to: {memory_file}")
```

### Import and Search Example (load_cube.py)

> **Note on Embeddings**: The sample data uses the **bge-m3** embedding model with **1024 dimensions**. If your environment uses a different embedding model/dimension, semantic search after import may be inaccurate.

```python
import json
import os

from memos.api.handlers import init_server
from memos.api.product_models import APISearchRequest
from memos.log import get_logger
from memos.multi_mem_cube.single_cube import SingleCubeView

logger = get_logger(__name__)
EXAMPLE_CUBE_ID = "example_dump_cube"
EXAMPLE_USER_ID = "example_user"

# 1. Initialize server
components = init_server()
naive = components["naive_mem_cube"]

# 2. Create SingleCubeView
view = SingleCubeView(
    cube_id=EXAMPLE_CUBE_ID,
    naive_mem_cube=naive,
    mem_reader=components["mem_reader"],
    mem_scheduler=components["mem_scheduler"],
    logger=logger,
    searcher=components["searcher"],
    feedback_server=components["feedback_server"],
)

# 3. Load data from file into graph_store
load_dir = "examples/data/mem_cube_tree"
memory_file = os.path.join(load_dir, "textual_memory.json")

with open(memory_file, encoding="utf-8") as f:
    json_data = json.load(f)

naive.text_mem.graph_store.import_graph(json_data, user_name=EXAMPLE_CUBE_ID)

nodes = json_data.get("nodes", [])
print(f"✓ Imported {len(nodes)} nodes")

# 4. Display loaded data
print(f"\nLoaded {len(nodes)} memories:")
for i, node in enumerate(nodes[:3], 1):  # Show first 3
    metadata = node.get("metadata", {})
    memory_text = node.get("memory", "N/A")
    mem_type = metadata.get("memory_type", "unknown")
    print(f"  [{i}] Type: {mem_type}")
    print(f"      Content: {memory_text[:60]}...")

# 5. Semantic search verification
query = "test memory dump persistence demonstration"
print(f'\nSearching: "{query}"')

search_result = view.search_memories(
    APISearchRequest(
        user_id=EXAMPLE_USER_ID,
        readable_cube_ids=[EXAMPLE_CUBE_ID],
        query=query,
    )
)

text_mem_results = search_result.get("text_mem", [])
memories = []
for group in text_mem_results:
    memories.extend(group.get("memories", []))

print(f"✓ Found {len(memories)} relevant memories")
for i, mem in enumerate(memories[:2], 1):  # Show first 2
    print(f"  [{i}] {mem.get('memory', 'N/A')[:60]}...")
```

### Complete Examples

See examples in the code repository:

- `MemOS/examples/mem_cube/dump_cube.py` - Export MemCube data (add + export)
- `MemOS/examples/mem_cube/load_cube.py` - Import MemCube data and perform semantic search (import + search)

### Legacy API Notes

Directly operating on memory modules (e.g., calling `mem_cube.text_mem.get_all()` from application code) is considered legacy; prefer the View architecture for runtime add/search.

## Developer Notes

* MemCube enforces schema consistency for safe loading/dumping
* Each memory type is pluggable and independently tested
* See `/tests/mem_cube/` for integration tests and usage patterns
