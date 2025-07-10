---
title: MemCube Overview
desc: "`MemCube` is the core organizational unit in MemOS, designed to encapsulate and manage all types of memory for a user or agent. It provides a unified interface for loading, saving, and operating on multiple memory modules, making it easy to build, share, and deploy memory-augmented applications."
---
## What is a MemCube?

A **MemCube** is a container that bundles three major types of memory:

- **Textual Memory** (e.g., `GeneralTextMemory`, `TreeTextMemory`): For storing and retrieving unstructured or structured text knowledge.
- **Activation Memory** (e.g., `KVCacheMemory`): For storing key-value caches to accelerate LLM inference and context reuse.
- **Parametric Memory** (e.g., `LoRAMemory`): For storing model adaptation parameters (like LoRA weights).

Each memory type is independently configurable and can be swapped or extended as needed.

## Structure

A MemCube is defined by a configuration (see `GeneralMemCubeConfig`), which specifies the backend and settings for each memory type. The typical structure is:

```
MemCube
 ├── text_mem: TextualMemory
 ├── act_mem: ActivationMemory
 └── para_mem: ParametricMemory
```

All memory modules are accessible via the MemCube interface:
- `mem_cube.text_mem`
- `mem_cube.act_mem`
- `mem_cube.para_mem`

## API Summary (`GeneralMemCube`)

### Initialization
```python
from memos.mem_cube.general import GeneralMemCube
mem_cube = GeneralMemCube(config)
```

### Core Methods
| Method         | Description                                      |
| --------------| ------------------------------------------------ |
| `load(dir)`   | Load all memories from a directory                |
| `dump(dir)`   | Save all memories to a directory                  |
| `text_mem`    | Access the textual memory module                  |
| `act_mem`     | Access the activation memory module               |
| `para_mem`    | Access the parametric memory module               |
| `init_from_dir(dir)` | Load a MemCube from a directory            |
| `init_from_remote_repo(repo, base_url)` | Load from remote repo   |

## File Storage

A MemCube directory contains:
- `config.json` (MemCube configuration)
- `textual_memory.json` (textual memory)
- `activation_memory.pickle` (activation memory)
- `parametric_memory.adapter` (parametric memory)

## Example Usage

```python
from memos.mem_cube.general import GeneralMemCube
# Load from local directory
mem_cube = GeneralMemCube.init_from_dir("examples/data/mem_cube_2")
# Load from remote repo
mem_cube = GeneralMemCube.init_from_remote_repo("Ki-Seki/mem_cube_2")
# Access and print all memories
for item in mem_cube.text_mem.get_all():
    print(item)
for item in mem_cube.act_mem.get_all():
    print(item)
mem_cube.dump("tmp/mem_cube")
```

## Developer Notes

* MemCube enforces schema consistency for safe loading/dumping
* Each memory type is pluggable and independently tested
* See `/tests/mem_cube/` for integration tests and usage patterns
