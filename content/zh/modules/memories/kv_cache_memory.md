---
标题: "KVCacheMemory: KV cache记忆（激活记忆）"
描述: "`KVCacheMemory` 是MemOS中用于存储和管理KV cache的专用记忆模块，主要用于加速大语言模型（LLMs）推理并支持有效的上下文复用。它作为激活记忆有助于对于会话式和生成式人工智能系统。
"
---

## KV Cache记忆使用案例

在MemOS中，KV Cache最适合存储**语义稳定且经常复用的背景信息**，例如：
- 常见问题（FAQs）或特定领域知识
- 先前的对话历史

这些稳定的**明文记忆项**由`MemScheduler`模块自动识别和管理。一旦被选中，它们就会被提前转换成KV格式的表示(`KVCacheItem`)。这个预计算步骤以可复用的格式存储记忆的激活状态（键值对张量），允许它们在推理期间注入到模型的注意力缓存中

一旦进行转换，这些KV记忆就可以**跨查询复用**，而不需要对原始内容重新编码。这减少了处理和存储大量文本的计算开销，使其成为需要**快速响应时间**和**高吞吐量**的应用程序的理想选择。

## 为什么是KV Cache记忆
将`MemScheduler`与KV Cache记忆集成可以实现显著的性能优化，特别是在LLM推理的**预填充阶段**。

### 无KV Cache记忆

- 每个新查询都被添加到完整的提示模板中，包括背景知识。
- 模型必须在整个序列上**重新计算token嵌入和注意力**——即使是未更改的记忆。

### 有KV Cache记忆

- 背景知识以键值对张量的形式**缓存一次**。
- 对于每个查询，只对新用户输入（查询token）进行编码。
- 之前缓存的KV被直接注入到注意力机制中。

### 好处

这种分离减少了预填充阶段的冗余计算，从而导致:

- 跳过背景知识的重复编码
- 更快的查询token和缓存记忆之间的注意力计算
- **降低首次token时间(Time To First Token, TTFT)** 生成过程中的延迟

这种优化在以下方面特别有价值:

- 多回合聊天机器人交互
- 检索增强生成或上下文增强生成(RAG, CAG)
- 在固定文档或FAQ风格记忆上操作的助理


### KV Cache记忆加速评估

为了验证基于KV的记忆注入对性能的影响，我们进行了一组在MemOS中模拟真实记忆复用的对照实验。

#### 实验建立

在典型的使用中，`MemScheduler`模块持续跟踪交互模式，并将高频、稳定的明文记忆提升为KV格式。这些KV记忆作为激活缓存加载到GPU内存中，并在推理过程中重复使用。

评估比较两种记忆策略:

1. **基于提示的注入**: 背景知识被作为原始文本添加
2. **KV Cache注入**: 记忆被直接注入到模型的注意力缓存

我们对这些策略进行了测试:

- **三种文本长度**: 短文本, 中等长度文本和长文本
- **三种查询类型**: 短查询, 中等查询和长查询

主要指标是**首次token时间(TTFT)**，这是响应式生成的关键延迟指标。

#### 实验结果

下表显示了跨三个模型的结果(Qwen3-8B, Qwen3-32B, Qwen2.5-72B).KV Cache注入下的TTFT始终低于基于提示的注入，而两种策略的输出token保持一致.

::note{icon="ri:bnb-fill"}
`Build (s)`是指将记忆转换为KV格式的一次性预处理成本，分摊到多个查询中.
::

| Model       | Ctx    | CtxTok | Qry    | QryTok | Build (s) | KV TTFT (s) | Dir TTFT (s) | Speedup (%) |
| ----------- | ------ | ------ | ------ | ------ | --------- | ----------- | ------------ | ----------- |
| Qwen3-8B    | long   | 6064   | long   | 952.7  | 0.92      | 0.50        | 2.37         | 79.1        |
|             |        |        | medium | 302.7  | 0.93      | 0.19        | 2.16         | 91.1        |
|             |        |        | short  | 167    | 0.93      | 0.12        | 2.04         | 94.2        |
|             | medium | 2773   | long   | 952.7  | 0.41      | 0.43        | 1.22         | 64.6        |
|             |        |        | medium | 302.7  | 0.41      | 0.16        | 1.08         | 85.1        |
|             |        |        | short  | 167    | 0.43      | 0.10        | 0.95         | 89.7        |
|             | short  | 583    | long   | 952.7  | 0.12      | 0.39        | 0.51         | 23.0        |
|             |        |        | medium | 302.7  | 0.12      | 0.14        | 0.32         | 55.6        |
|             |        |        | short  | 167    | 0.12      | 0.08        | 0.29         | 71.3        |
| Qwen3-32B   | long   | 6064   | long   | 952.7  | 0.71      | 0.31        | 1.09         | 71.4        |
|             |        |        | medium | 302.7  | 0.71      | 0.15        | 0.98         | 84.3        |
|             |        |        | short  | 167    | 0.71      | 0.11        | 0.96         | 88.8        |
|             | medium | 2773   | long   | 952.7  | 0.31      | 0.24        | 0.56         | 56.9        |
|             |        |        | medium | 302.7  | 0.31      | 0.12        | 0.47         | 75.1        |
|             |        |        | short  | 167    | 0.31      | 0.08        | 0.44         | 81.2        |
|             | short  | 583    | long   | 952.7  | 0.09      | 0.20        | 0.24         | 18.6        |
|             |        |        | medium | 302.7  | 0.09      | 0.09        | 0.15         | 39.6        |
|             |        |        | short  | 167    | 0.09      | 0.07        | 0.14         | 53.5        |
| Qwen2.5-72B | long   | 6064   | long   | 952.7  | 1.26      | 0.48        | 2.04         | 76.4        |
|             |        |        | medium | 302.7  | 1.26      | 0.23        | 1.82         | 87.2        |
|             |        |        | short  | 167    | 1.27      | 0.15        | 1.79         | 91.4        |
|             | medium | 2773   | long   | 952.7  | 0.58      | 0.39        | 1.05         | 62.7        |
|             |        |        | medium | 302.7  | 0.58      | 0.18        | 0.89         | 79.2        |
|             |        |        | short  | 167    | 0.71      | 0.23        | 0.82         | 71.6        |
|             | short  | 583    | long   | 952.7  | 0.16      | 0.33        | 0.43         | 23.8        |
|             |        |        | medium | 302.7  | 0.16      | 0.15        | 0.27         | 43.2        |
|             |        |        | short  | 167    | 0.16      | 0.10        | 0.25         | 60.5        |


## KV Cache的记忆结构

通过`KVCacheMemory`实现基于KV的记忆复用，在保持相同输出的同时，大大减少了模型大小和查询类型之间的延迟。通过将可复用记忆从明文提示转移到预先计算的KV Cache，MemOS消除了冗余的上下文编码，并实现了更快的响应时间，特别是在实时的、记忆增强的LLM应用程序中。

每个缓存被存储为一个`KVCacheItem`:

| 字段         | 类型           | 描述                                 |
| ------------- | -------------- | ------------------------------------------- |
| `kv_cache_id` | `str`          | 缓存中的唯一ID(UUID)              |
| `kv_cache`    | `DynamicCache` | 实际的KV Cache(transformers)   |
| `metadata`    | `dict`         | 元数据 (源, 抽取时间等.)    |


## API总结 (`KVCacheMemory`)

### 初始化
```python
KVCacheMemory(config: KVCacheMemoryConfig)
```

### 核心方法
| 方法                   | 描述                                              |
| ------------------------ | -------------------------------------------------------- |
| `extract(text)`          | 使用LLM从输入文本中提取KV Cache        |
| `add(memories)`          | 添加一个或多个`KVCacheItem`到记忆中                |
| `get(memory_id)`         | 根据ID获取单个缓存                               |
| `get_by_ids(ids)`        | 根据IDs获取多个缓存                             |
| `get_all()`              | 返回所有存储的缓存                                |
| `get_cache(cache_ids)`   | 从多个IDs合并并返回组合缓存      |
| `delete(ids)`            | 通过IDs删除缓存                                     |
| `delete_all()`           | 删除所有缓存                                        |
| `dump(dir)`              | 将所有缓存序列化到目录中的pickle文件       |
| `load(dir)`              | 从目录中的pickle文件加载缓存              |
| `from_textual_memory(mem)` | 将`TextualMemoryItem` 转换为 `KVCacheItem`      |


当调用`dump(dir)`, 系统写到:

```
<dir>/<config.memory_filename>
```

该文件包含所有KV Cache的pickle字典，可以使用`load(dir)`重新加载。


## 如何使用

```python
from memos.configs.memory import KVCacheMemoryConfig
from memos.memories.activation.kv import KVCacheMemory

config = KVCacheMemoryConfig(
    extractor_llm={
        "backend": "huggingface",
        "config": {"model_name_or_path": "Qwen/Qwen3-1.7B"}
    }
)
mem = KVCacheMemory(config)

# Extract and add a cache
cache_item = mem.extract("The capital of France is Paris.")
mem.add([cache_item])

# Retrieve and merge caches
merged_cache = mem.get_cache([cache_item.kv_cache_id])

# Save/load
mem.dump("tmp/act_mem")
mem.load("tmp/act_mem")
```


## 开发者注意事项

* 使用HuggingFace `DynamicCache` 高效的键值存储
* 基于pickle的序列化，用于快速加载/保存
* `/tests`中的集成测试涵盖了所有方法。
