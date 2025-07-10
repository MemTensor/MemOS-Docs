---
title: MOS API for MemOS
desc: The **MOS** (Memory Operating System) is a core component of MemOS that acts as an orchestration layer, managing multiple memory modules (MemCubes) and providing a unified interface for memory-augmented applications.
---

## API Summary (`MOS`)

### Initialization
```python
from memos import MOS
mos = MOS(config: MOSConfig)
```

### Core Methods

| Method | Description |
|--------|-------------|
| `register_mem_cube(mem_cube_name_or_path, mem_cube_id=None, user_id=None)` | Register a new memory cube from a directory or remote repo for a user. |
| `unregister_mem_cube(mem_cube_id, user_id=None)` | Unregister (remove) a memory cube by its ID. |
| `add(messages=None, memory_content=None, doc_path=None, mem_cube_id=None, user_id=None)` | Add new memory (from messages, string, or document) to a cube. |
| `search(query, user_id=None, install_cube_ids=None)` | Search memories across cubes for a query, optionally filtered by cube IDs. |
| `chat(query, user_id=None)` | Chat with the LLM, enhanced by memory retrieval for specified user. |
| `get(mem_cube_id, memory_id, user_id=None)` | Get a specific memory by cube and memory ID for a user. |
| `get_all(mem_cube_id=None, user_id=None)` | Get all memories from a cube (or all cubes for user). |
| `update(mem_cube_id, memory_id, text_memory_item, user_id=None)` | Update a memory in a cube by ID for a user. |
| `delete(mem_cube_id, memory_id, user_id=None)` | Delete a memory from a cube by ID for a user. |
| `delete_all(mem_cube_id=None, user_id=None)` | Delete all memories from a cube for a user. |
| `clear_messages(user_id=None)` | Clear the chat history for the specified user session. |

### User Management Methods

| Method | Description |
|--------|-------------|
| `create_user(user_id, role=UserRole.USER, user_name=None)` | Create a new user with specified role and optional name. |
| `list_users()` | List all active users with their information. |
| `create_cube_for_user(cube_name, owner_id, cube_path=None, cube_id=None)` | Create a new cube for a specific user as owner. |
| `get_user_info()` | Get current user information including accessible cubes. |
| `share_cube_with_user(cube_id, target_user_id)` | Share a cube with another user. |

## Class Overview

`MOS` manages multiple `MemCube` objects, each representing a user's or session's memory. It provides a unified API for memory operations (add, search, update, delete) and integrates with LLMs to enhance chat with contextual memory retrieval. MOS supports multi-user, multi-session scenarios and is extensible to new memory types and backends.

## Example Usage

```python
import uuid

from memos.configs.mem_os import MOSConfig
from memos.mem_os.main import MOS


# init MOS
mos_config = MOSConfig.from_json_file("examples/data/config/simple_memos_config.json")
memory = MOS(mos_config)

# create user
user_id = str(uuid.uuid4())
memory.create_user(user_id=user_id)

# register cube for user
memory.register_mem_cube("examples/data/mem_cube_2", user_id=user_id)

# add memory for user
memory.add(
    messages=[
        {"role": "user", "content": "I like playing football."},
        {"role": "assistant", "content": "I like playing football too."},
    ],
    user_id=user_id,
)
# Later, when you want to retrieve memory for user
retrieved_memories = memory.search(query="What do you like?", user_id=user_id)
# output text_memories: I like playing football, act_memories, para_memories
print(f"text_memories: {retrieved_memories['text_mem']}")
```

## Core Operations Overview

MOS exposes several main operations for interacting with memories:

* **Adding Memories** - Store new information from conversations, documents, or direct content
* **Searching Memories** - Retrieve relevant memories based on semantic queries
* **Chat with Memory** - Enhanced conversations with contextual memory retrieval
* **Memory Management** - Update, delete, and organize existing memories
* **Dumping Memories** - Export memory cubes to persistent storage

## 1. Adding Memories

### Overview

The add operation processes and stores new information through several steps


#### Adding from Conversation Messages

```python
import uuid
from memos.configs.mem_os import MOSConfig
from memos.mem_os.main import MOS

# Initialize MOS
mos_config = MOSConfig.from_json_file("config/simple_memos_config.json")
memory = MOS(mos_config)

# Create user
user_id = str(uuid.uuid4())
memory.create_user(user_id=user_id, user_name="Alice")

# Register memory cube
memory.register_mem_cube("examples/data/mem_cube_2", user_id=user_id)

# Add memory from conversation
memory.add(
    messages=[
        {"role": "user", "content": "I like playing football and watching movies."},
        {"role": "assistant", "content": "That's great! Football is a wonderful sport and movies can be very entertaining."},
        {"role": "user", "content": "My favorite team is Barcelona."},
        {"role": "assistant", "content": "Barcelona is a fantastic team with a rich history!"}
    ],
    mem_cube_id="personal_memories",
    user_id=user_id
)

print("Memory added successfully from conversation")
```

#### Adding Direct Memory Content

```python
# Add specific memory content directly
memory.add(
    memory_content="User prefers vegetarian food and enjoys cooking Italian cuisine",
    mem_cube_id="personal_memories",
    user_id=user_id
)

# Add multiple memory items
memory_items = [
    "User works as a software engineer",
    "User lives in San Francisco",
    "User enjoys hiking on weekends"
]

for item in memory_items:
    memory.add(
        memory_content=item,
        mem_cube_id="personal_memories",
        user_id=user_id
    )
```

#### Adding from Documents

```python

# Add from multiple documents
doc_path="./examples/data"
memory.add(
    doc_path=doc_path,
    mem_cube_id="personal_memories",
    user_id=user_id
)
```

## 2. Searching Memories

### Overview

The search operation retrieves memories through search api:


#### Basic Memory Search

```python
# Search for relevant memories
results = memory.search(
    query="What sports do I like?",
    user_id=user_id
)

# Access different types of memories
text_memories = results['text_mem']
activation_memories = results['act_mem']
parametric_memories = results['para_mem']

print(f"Found {len(text_memories)} text memories")
for memory in text_memories:
    print(memory)
```

#### Search Across Specific Cubes

```python
# Search only in specific cubes
results = memory.search(
    query="What are my preferences?",
    user_id=user_id,
    install_cube_ids=["personal_memories", "shared_knowledge"]
)

# Process results by cube
for cube_memories in results['text_mem']:
    print(f"\nCube: {cube_memories['cube_id']}")
    for memory in cube_memories['memories']:
        print(f"- {memory}")
```

## 3. Chat with Memory Enhancement

### Overview

The chat operation provides memory-enhanced conversations by:

1. **Memory Retrieval** - Searches for relevant memories based on the query
2. **Context Building** - Incorporates retrieved memories into the conversation context
3. **Response Generation** - LLM generates responses with memory context



#### Basic Chat

```python
# Simple chat with memory enhancement
response = memory.chat(
    query="What do you remember about my interests?",
    user_id=user_id
)
print(f"Assistant: {response}")
```

## 4. Memory Retrieval and Management

### Getting Specific Memory

#### Code Example

```python
# Get a specific memory by ID
memory_item = memory.get(
    mem_cube_id="personal_memories",
    memory_id="memory_123",
    user_id=user_id
)

print(f"Memory ID: {memory_item.memory_id}")
print(f"Content: {memory_item.memory}")
print(f"Created: {memory_item.created_at}")
print(f"Metadata: {memory_item.metadata}")
```

### Getting All Memories



#### Code Example

```python
# Get all memories from a specific cube
all_memories = memory.get_all(
    mem_cube_id="personal_memories",
    user_id=user_id
)

# Get all memories from all accessible cubes
all_memories = memory.get_all(user_id=user_id)

# Access different memory types
for cube_memories in all_memories['text_mem']:
    print(f"\nCube: {cube_memories['cube_id']}")
    print(f"Total memories: {len(cube_memories['memories'])}")

    for memory in cube_memories['memories']:
        print(f"- {memory.memory}")
        print(f"  ID: {memory.memory_id}")
        print(f"  Created: {memory.created_at}")
```

## 5. Memory Updates and Deletion

### Updating Memories



#### Code Example

```python
from memos.memories.textual.item import TextualMemoryItem

# Create updated memory item
updated_memory = TextualMemoryItem(
    memory="User now prefers vegan food and enjoys cooking Mediterranean cuisine",
    metadata={
        "updated_at": "2024-01-15",
        "update_reason": "Dietary preference change"
    }
)

# Update existing memory
memory.update(
    mem_cube_id="personal_memories",
    memory_id="memory_123",
    text_memory_item=updated_memory,
    user_id=user_id
)

print("Memory updated successfully")
```

### Deleting Memories


```python
# Delete a specific memory
memory.delete(
    mem_cube_id="personal_memories",
    memory_id="memory_123",
    user_id=user_id
)

# Delete all memories from a specific cube
memory.delete_all(
    mem_cube_id="personal_memories",
    user_id=user_id
)

# Delete all memories for a user (use with caution!)
memory.delete_all(user_id=user_id)
```

## 6. Dumping Memories

### Overview

The dump operation exports memory cubes to persistent storage, allowing you to:

* **Backup Memories** - Create persistent copies of memory cubes
* **Transfer Memories** - Move memory cubes between systems
* **Archive Memories** - Store memory cubes for long-term preservation
* **Share Memories** - Export memory cubes for sharing with other users

#### Basic Memory Dump

```python
# Dump a specific memory cube to a directory
memory.dump(
    dump_dir="./backup/memories",
    mem_cube_id="personal_memories",
    user_id=user_id
)

print("Memory cube dumped successfully")
```

#### Dump Default Cube

```python
# Dump the default cube for the user (first accessible cube)
memory.dump(
    dump_dir="./backup/default_memories",
    user_id=user_id
)

print("Default memory cube dumped successfully")
```

#### Dump All User Cubes

```python
# Get user info to see all accessible cubes
user_info = memory.get_user_info()

# Dump each accessible cube
for cube_info in user_info['accessible_cubes']:
    if cube_info['is_loaded']:
        memory.dump(
            dump_dir=f"./backup/{cube_info['cube_name']}",
            mem_cube_id=cube_info['cube_id'],
            user_id=user_id
        )
        print(f"Dumped cube: {cube_info['cube_name']}")
```

#### Dump with Custom Directory Structure

```python
import os
from datetime import datetime

# Create timestamped backup directory
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_dir = f"./backups/{timestamp}"

# Ensure directory exists
os.makedirs(backup_dir, exist_ok=True)

# Dump memory cube with organized structure
memory.dump(
    dump_dir=backup_dir,
    mem_cube_id="personal_memories",
    user_id=user_id
)

print(f"Memory cube dumped to: {backup_dir}")
```

## 7. Session Management

### Clearing Chat History


```python
# Clear chat history for a user session
memory.clear_messages(user_id=user_id)

# Verify chat history is cleared
user_info = memory.get_user_info()
print(f"Chat history cleared for user: {user_info['user_name']}")
```

## When to Use MOS

Use MOS when you need to:

- Build LLM applications with persistent, user-specific memory.
- Support multi-user, multi-session memory management.
- Integrate memory-augmented retrieval and reasoning into chatbots or agents.
