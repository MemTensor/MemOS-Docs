---
title: 记忆结构设计最佳实践
---

## 记忆类型选择

### 树状文本记忆

**最适用于**：知识管理、研究助理、层级结构数据  
```python
tree_config = {
    "backend": "tree_text",
    "config": {
        "extractor_llm": {
            "backend": "ollama",
            "config": {
                "model_name_or_path": "qwen3:0.6b"
            }
        },
        "graph_db": {
            "backend": "neo4j",
            "config": {
                "host": "localhost",
                "port": 7687
            }
        }
    }
}
````

### 通用文本记忆

**最适用于**：对话式 AI、个人助理、问答系统

```python
general_config = {
    "backend": "general_text",
    "config": {
        "extractor_llm": {
            "backend": "ollama",
            "config": {
                "model_name_or_path": "qwen3:0.6b"
            }
        },
        "vector_db": {
            "backend": "qdrant",
            "config": {
                "collection_name": "general"
            }
        },
        "embedder": {
            "backend": "ollama",
            "config": {
                "model_name_or_path": "nomic-embed-text"
            }
        }
    }
}
```

### 纯文本记忆

**最适用于**：简单应用、原型开发

```python
naive_config = {
    "backend": "naive_text",
    "config": {
        "extractor_llm": {
            "backend": "ollama",
            "config": {
                "model_name_or_path": "qwen3:0.6b"
            }
        }
    }
}
```

## 容量规划

如果你启用了调度器，可以设置记忆容量来控制资源使用情况：

```python
scheduler_config = {
    "memory_capacities": {
        "working_memory_capacity": 20,        # 活跃对话记忆
        "user_memory_capacity": 500,          # 用户知识记忆
        "long_term_memory_capacity": 2000     # 领域知识记忆
    }
}
```
