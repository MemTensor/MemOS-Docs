---
title: Graph Memory Backend
desc: "This module provides graph-based memory storage and querying for memory-augmented systems such as RAG, cognitive agents, or personal memory assistants. <br/>It defines a clean abstraction (`BaseGraphDB`) and includes a production-ready implementation using **Neo4j**."
---

## Why Graph for Memory?

Unlike flat vector stores, a graph database allows:

- Structuring memory into **chains, hierarchies, and causal links**
- Performing **multi-hop reasoning** and **subgraph traversal**
- Supporting memory **deduplication, conflict detection, and scheduling**
- Dynamically evolving a memory graph over time

This forms the backbone of long-term, explainable, and compositional memory reasoning.

## Features

- Unified interface across different graph databases
- Built-in support for Neo4j
- Support for vector-enhanced retrieval (`search_by_embedding`)
- Modular, pluggable, and testable
## Directory Structure

```

src/memos/graph_dbs/
├── base.py            # Abstract interface: BaseGraphDB
├── factory.py         # Factory to instantiate GraphDB from config
├── neo4j.py           # Neo4jGraphDB: production implementation

````

## How to Use

```python
from memos.graph_dbs.factory import GraphStoreFactory
from memos.configs.graph_db import GraphDBConfigFactory

# Step 1: Build factory config
config = GraphDBConfigFactory(
    backend="neo4j",
    config={
        "uri": "bolt://localhost:7687",
        "user": "your_neo4j_user_name",
        "password": "your_password",
        "db_name": "memory_user1",
        "auto_create": True,
        "embedding_dimension": 768
    }
)

# Step 2: Instantiate the graph store
graph = GraphStoreFactory.from_config(config)

# Step 3: Add memory
graph.add_node(
    id="node-001",
    content="Today I learned about retrieval-augmented generation.",
    metadata={"type": "WorkingMemory", "tags": ["RAG", "AI"], "timestamp": "2025-06-05"}
)
````

## Pluggable Design

### Interface: `BaseGraphDB`

All implementations must implement:

* `add_node`, `update_node`, `delete_node`
* `add_edge`, `delete_edge`, `edge_exists`
* `get_node`, `get_path`, `get_subgraph`, `get_context_chain`
* `search_by_embedding`, `get_by_metadata`
* `deduplicate_nodes`, `detect_conflicts`, `merge_nodes`
* `clear`, `export_graph`, `import_graph`

See src/memos/graph_dbs/base.py for full method docs.

### Current Backend:

| Backend | Status | File       |
| ------- | ------ | ---------- |
| Neo4j   | Stable | `neo4j.py` |

## Extending

You can add support for any other graph engine (e.g., **TigerGraph**, **DGraph**, **Weaviate hybrid**) by:

1. Subclassing `BaseGraphDB`
2. Creating a config dataclass (e.g., `DgraphConfig`)
3. Registering it in:

   * `GraphDBConfigFactory.backend_to_class`
   * `GraphStoreFactory.backend_to_class`

See `src/memos/graph_dbs/neo4j.py` as a reference implementation.
