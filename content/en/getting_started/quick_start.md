---
title: "Quick Start: Get Up and Running with MemOS"
---

## What You'll Learn
Welcome! This guide will help you **install**, **initialize**, and **run your first memory-augmented LLM app** in just a few minutes.

In just a few minutes, you'll learn how to set up a **minimal, working MemOS pipeline** that connects your LLM with persistent, searchable memory.
By the end, you'll be able to **store, retrieve, and update simple memories** for a user or session — the foundation for building memory-augmented chatbots and agents.


::steps{}

### Install MemOS

```bash
pip install MemoryOS
```

::note
**Optional**<br>If you want to use local transformer models, make sure you have PyTorch installed.
::

::note
**Requirement for Neo4j Desktop**<br>If you plan to use Neo4j for graph memory, install Neo4j Desktop (community edition support coming soon!)
::

### Create a Minimal Config

For this Quick Start, we'll use the built-in GeneralTextMemory — no external vector DB or graph DB needed.
```python
from memos.configs.mem_os import MOSConfig

# init MOSConfig
mos_config = MOSConfig.from_json_file("examples/data/config/simple_memos_config.json")
```

### Create a User & Register a MemCube

```python
import uuid
from memos.mem_os.main import MOS

mos = MOS(mos_config)

# Generate a unique user ID
user_id = str(uuid.uuid4())

# Create the user
mos.create_user(user_id=user_id)

# Register a simple memory cube for this user
mos.register_mem_cube("examples/data/mem_cube_2", user_id=user_id)
```

### Add Your First Memory

```python
# Add some conversational history
mos.add(
    messages=[
        {"role": "user", "content": "I love playing football."},
        {"role": "assistant", "content": "That's awesome! "}
    ],
    user_id=user_id
)
```


### Retrieve & Search Memory

```python
# Search for memories related to your query
result = mos.search(
  query="What does the user love?",
  user_id=user_id
)

print("Memories found:", result["text_mem"])
```

### Save & Load Memory

```python
# Save your memory cube
mos.dump("tmp/my_mem_cube")

# Later, you can load it back
mos.load("tmp/my_mem_cube")
```

::

## Next Steps

Congratulations! You've just run a minimal memory-augmented pipeline with MemOS.

Ready to level up?
- Structured Memory: Try TreeTextMemory for graph-based, hierarchical
knowledge.
- Activation Memory: Speed up multi-turn chat with KVCacheMemory.
- Parametric Memory: Use adapters/LoRA for on-the-fly skill injection.
- Graph & Vector Backends: Connect Neo4j or Qdrant for production-scale
  vector/graph search.


## Need Help?
Check out:
- [Core Concepts](/home/core_concepts)
- [API Reference](/docs/api/info)
- [Contribution Guide](/contribution/overview)
