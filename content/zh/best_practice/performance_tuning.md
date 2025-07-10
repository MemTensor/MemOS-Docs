---
title: 性能调优
---

## 向量嵌入优化

```python
fast_embedder = {
    "backend": "ollama",
    "config": {
        "model_name_or_path": "nomic-embed-text:latest"
    }
}

slow_embedder = {
    "backend": "sentence_transformer",
    "config": {
        "model_name_or_path": "nomic-ai/nomic-embed-text-v1.5"
    }
}
````

## 推理速度优化

```python
generation_config = {
    "max_new_tokens": 256,  # 限制响应长度
    "temperature": 0.7,
    "do_sample": True
}
```

## 系统资源优化

### 内存容量限制

```python
scheduler_config = {
    "memory_capacities": {
        "working_memory_capacity": 20,         # 活跃上下文
        "user_memory_capacity": 500,           # 用户存储
        "long_term_memory_capacity": 2000,     # 领域知识
        "transformed_act_memory_capacity": 50  # KV 缓存条目
    }
}
```

### 批处理操作

```python
def batch_memory_operations(operations, batch_size=10):
    for i in range(0, len(operations), batch_size):
        batch = operations[i:i + batch_size]
        yield batch  # 批量处理
```
