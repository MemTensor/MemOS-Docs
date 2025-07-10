---
title: MemOS Examples
desc: "Congratulations - you've mastered the Quick Start and built your first working memory! Now it's time to see how far you can take MemOS by combining different memory types and features. Use these curated examples to inspire your own agents, chatbots, or knowledge systems."
---

::card-group

  :::card
  ---
  icon: ri:play-line
  title: Minimal Pipeline
  to: /getting_started/examples#example-1-minimal-pipeline
  ---
  The smallest working pipeline — add, search, update and dump plaintext memories.
  :::

  :::card
  ---
  icon: ri:tree-line
  title: TreeTextMemory Only
  to: /getting_started/examples#example-2-treetextmemory-only
  ---
  Use Neo4j-backed hierarchical memory to build structured, multi-hop knowledge graphs.
  :::

  :::card
  ---
  icon: ri:database-2-line
  title: KVCacheMemory Only
  to: /getting_started/examples#example-3-kvcachememory-only
  ---
  Speed up sessions with short-term KV cache for fast context injection.
  :::

  :::card
  ---
  icon: hugeicons:share-07
  title: Hybrid TreeText + KVCache
  to: /getting_started/examples#example-4-hybrid
  ---
  Combine explainable graph memory with fast KV caching in a single MemCube.
  :::

  :::card
  ---
  icon: ri:calendar-check-line
  title: Multi-Memory Scheduling
  to: /getting_started/examples#example-5-multi-memory-scheduling
  ---
  Run dynamic memory orchestration for multi-user, multi-session agents.
  :::

::


## Example 1: Minimal Pipeline

### When to Use:
- You want the smallest possible working example.
- You only need simple plaintext memories stored in a vector DB.
- Best for getting started or testing your embedding + vector pipeline.

### Key Points:
- Uses GeneralTextMemory only (no graph, no KV cache).
- Add, search, update and dump memories.
- Integrates a basic MOS pipeline.

### Full Example Code
```python
import uuid
from memos.configs.mem_os import MOSConfig
from memos.mem_os.main import MOS


# init MOSConfig
mos_config = MOSConfig.from_json_file("examples/data/config/simple_memos_config.json")
mos = MOS(mos_config)

# Create a user and register a memory cube
user_id = str(uuid.uuid4())
mos.create_user(user_id=user_id)
mos.register_mem_cube("examples/data/mem_cube_2", user_id=user_id)

# Add a simple conversation
mos.add(
    messages=[
        {"role": "user", "content": "I love playing football."},
        {"role": "assistant", "content": "That's awesome!"}
    ],
    user_id=user_id
)

# Search the memory
result = mos.search(query="What do you love?", user_id=user_id)
print("Memories found:", result["text_mem"])

# Dump and reload
mos.dump("tmp/my_mem_cube")
mos.load("tmp/my_mem_cube")
```

##  Example 2: TreeTextMemory Only

### When to Use:
- You need hierarchical graph-based memories with explainable relations.
- You want to store structured knowledge and trace connections.
- Suitable for knowledge graphs, concept trees, and multi-hop reasoning.

### Key Points:
- Uses TreeTextMemory backed by Neo4j.
- Requires extractor_llm + dispatcher_llm.
- Stores nodes, edges, and supports traversal queries.

### Full Example Code
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
    {"role": "user", "content": "Tell me about your childhood."},
    {"role": "assistant", "content": "I loved playing in the garden with my dog."}
]]
memory = reader.get_memory(scene_data, type="chat", info={"user_id": "1234", "session_id": "2222"})
for m_list in memory:
    my_tree_textual_memory.add(m_list)

# Search
results = my_tree_textual_memory.search(
    "Talk about the user's childhood story?",
    top_k=10
)

# [Optional] Dump & Drop
my_tree_textual_memory.dump("tmp/my_tree_textual_memory")
my_tree_textual_memory.drop()
```

## Example 3: KVCacheMemory Only

### When to Use:
- You want short-term working memory for faster multi-turn conversation.
- Useful for chatbot session acceleration or prompt reuse.
- Best for caching hidden states / KV pairs.

### Key Points:
- Uses KVCacheMemory with no explicit text memory.
- Demonstrates extract → add → merge → get → delete.
- Shows how to dump/load KV caches.

### Full Example Code

```python
from memos.configs.memory import MemoryConfigFactory
from memos.memories.factory import MemoryFactory

# Create config for KVCacheMemory (HuggingFace backend)
config = MemoryConfigFactory(
    backend="kv_cache",
    config={
        "extractor_llm": {
            "backend": "huggingface",
            "config": {
                "model_name_or_path": "Qwen/Qwen3-0.6B",
                "max_tokens": 32,
                "add_generation_prompt": True,
                "remove_think_prefix": True,
            },
        },
    },
)

# Instantiate KVCacheMemory
kv_mem = MemoryFactory.from_config(config)

# Extract a KVCacheItem (DynamicCache)
prompt = [
    {"role": "user", "content": "What is MemOS?"},
    {"role": "assistant", "content": "MemOS is a memory operating system for LLMs."},
]
print("===== Extract KVCacheItem =====")
cache_item = kv_mem.extract(prompt)
print(cache_item)

# Add the cache to memory
kv_mem.add([cache_item])
print("All caches:", kv_mem.get_all())

# Get by ID
retrieved = kv_mem.get(cache_item.id)
print("Retrieved:", retrieved)

# Merge caches (simulate multi-turn)
item2 = kv_mem.extract([{"role": "user", "content": "Tell me a joke."}])
kv_mem.add([item2])
merged = kv_mem.get_cache([cache_item.id, item2.id])
print("Merged cache:", merged)

# Delete one
kv_mem.delete([cache_item.id])
print("After delete:", kv_mem.get_all())

# Dump & load caches
kv_mem.dump("tmp/kv_mem")
print("Dumped to tmp/kv_mem")
kv_mem.delete_all()
kv_mem.load("tmp/kv_mem")
print("Loaded caches:", kv_mem.get_all())
```

## Example 4: Hybrid

### When to Use:
- You want long-term explainable memory and short-term fast context together.
- Ideal for complex agents that plan, remember facts, and keep chat context.
- Demonstrates multi-memory orchestration.

### How It Works:

- **TreeTextMemory** stores your long-term knowledge in a graph DB (Neo4j).
- **KVCacheMemory** stores recent or stable context as activation caches.
- Both work together in a single **MemCube**, managed by your `MOS` pipeline.


###  Full Example Code

```python
import os

from memos.configs.mem_cube import GeneralMemCubeConfig
from memos.configs.mem_os import MOSConfig
from memos.mem_cube.general import GeneralMemCube
from memos.mem_os.main import MOS

# 1. Setup CUDA (if needed) — for local GPU inference
os.environ["CUDA_VISIBLE_DEVICES"] = "1"

# 2. Define user & paths
user_id = "root"
cube_id = "root/mem_cube_kv_cache"
tmp_cube_path = "/tmp/default/mem_cube_5"

# 3. Initialize MOSConfig
mos_config = MOSConfig.from_json_file("examples/data/config/simple_treekvcache_memos_config.json")
mos = MOS(mos_config)

# 4. Initialize the MemCube (TreeTextMemory + KVCacheMemory)
cube_config = GeneralMemCubeConfig.from_json_file(
    "examples/data/config/simple_treekvcache_cube_config.json"
)
mem_cube = GeneralMemCube(cube_config)

# 5. Dump the MemCube to disk
try:
    mem_cube.dump(tmp_cube_path)
except Exception as e:
    print(e)

# 6. Register the MemCube explicitly
mos.register_mem_cube(tmp_cube_path, mem_cube_id=cube_id, user_id=user_id)

# 7. Extract and add a KVCache memory (simulate stable context)
extract_kvmem = mos.mem_cubes[cube_id].act_mem.extract("I like football")
mos.mem_cubes[cube_id].act_mem.add([extract_kvmem])

# 8. Start chatting — now your chat uses:
#    - TreeTextMemory: for structured multi-hop retrieval
#    - KVCacheMemory: for fast context injection
while True:
    user_input = input("👤 [You] ").strip()
    print()
    response = mos.chat(user_input)
    print(f"🤖 [Assistant] {response}\n")

print("📢 [System] MemChat has stopped.")
```

## Example 5: Multi-Memory Scheduling

### When to Use:
- You want to manage multiple users, multiple MemCubes, or dynamic memory flows.
- Good for SaaS agents or multi-session LLMs.
- Demonstrates MemScheduler + config YAMLs.

### Key Points:
- Uses parse_yaml to load MOSConfig and MemCubeConfig.
- Dynamic user and cube creation.
- Shows runtime scheduling of memories.

### Full Example Code

```python
import shutil
import uuid
from pathlib import Path

from memos.configs.mem_cube import GeneralMemCubeConfig
from memos.configs.mem_os import MOSConfig
from memos.mem_cube.general import GeneralMemCube
from memos.mem_os.main import MOS
from memos.mem_scheduler.utils import parse_yaml

# Load main MOS config with MemScheduler
config = parse_yaml("./examples/data/config/mem_scheduler/memos_config_w_scheduler.yaml")
mos_config = MOSConfig(**config)
mos = MOS(mos_config)

# Create user with dynamic ID
user_id = str(uuid.uuid4())
mos.create_user(user_id=user_id)

# Create MemCube config and dump it
config = GeneralMemCubeConfig.from_yaml_file(
    "./examples/data/config/mem_scheduler/mem_cube_config.yaml"
)
mem_cube_id = "mem_cube_5"
mem_cube_name_or_path = f"./outputs/mem_scheduler/{user_id}/{mem_cube_id}"

# Remove old folder if exists
if Path(mem_cube_name_or_path).exists():
    shutil.rmtree(mem_cube_name_or_path)
    print(f"{mem_cube_name_or_path} is not empty, and has been removed.")

# Dump new cube
mem_cube = GeneralMemCube(config)
mem_cube.dump(mem_cube_name_or_path)

# Register MemCube for this user
mos.register_mem_cube(
    mem_cube_name_or_path=mem_cube_name_or_path,
    mem_cube_id=mem_cube_id,
    user_id=user_id
)

# Add messages
messages = [
    {
        "role": "user",
        "content": "I like playing football."
    },
    {
        "role": "assistant",
        "content": "I like playing football too."
    },
]
mos.add(messages, user_id=user_id, mem_cube_id=mem_cube_id)

# Chat loop: show TreeTextMemory nodes + KVCache
while True:
    user_input = input("👤 [You] ").strip()
    print()
    response = mos.chat(user_input, user_id=user_id)
    retrieved_memories = mos.get_all(mem_cube_id=mem_cube_id, user_id=user_id)

    print(f"🤖 [Assistant] {response}")

    # Show WorkingMemory nodes in TreeTextMemory
    for node in retrieved_memories["text_mem"][0]["memories"]["nodes"]:
        if node["metadata"]["memory_type"] == "WorkingMemory":
            print(f"[WorkingMemory] {node['memory']}")

    # Show Activation Memory
    if retrieved_memories["act_mem"][0]["memories"]:
        for act_mem in retrieved_memories["act_mem"][0]["memories"]:
            print(f"⚡ [KVCache] {act_mem['memory']}")
    else:
        print("⚡ [KVCache] None\n")
```



::note
**Keep in Mind**<br>
Use dump() and load() to persist your memory cubes.

Always check your vector DB dimension matches your embedder.

For graph memory, you'll need Neo4j Desktop (community version support coming soon).
::

## Next Steps
You're just getting started!Next, try:

- Pick the example that matches your use case.
- Combine modules to build smarter, more persistent agents!

Need more?
See the API Reference or contribute your own example!
