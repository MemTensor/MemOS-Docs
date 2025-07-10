---
title: 你的第一个记忆
desc: 让我们在 MemOS 中构建你的第一个纯文本记忆！**GeneralTextMemory** 是提取、嵌入和搜索简单文本记忆的最简便方式。
---

## 你将学到什么

完成本指南后，你将能够：
- 从纯文本或聊天消息中提取记忆。
- 将它们存储为语义向量。
- 使用向量相似度搜索和管理它们。

## 工作原理

### 记忆结构

每条记忆都存储为一个 `TextualMemoryItem`：
- `memory`：主要文本内容（例如，“用户喜欢番茄。”）
- `metadata`：额外信息，使记忆可搜索且易于管理——类型、时间、来源、置信度、实体、标签、可见性和更新时间。

这些字段使每条记忆都能被查询、筛选和方便治理。

对于每个 `TextualMemoryItem`：

| 字段           | 示例                      | 含义                                   |
| -------------- | ------------------------- | -------------------------------------- |
| `type`         | `"opinion"`               | 分类它是事实、事件还是观点             |
| `memory_time`  | `"2025-07-02"`            | 发生时间                              |
| `source`       | `"conversation"`          | 来源                                 |
| `confidence`   | `100.0`                   | 置信度评分（0–100）                   |
| `entities`     | `["tomatoes"]`            | 关键概念                              |
| `tags`         | `["food", "preferences"]` | 分组用的额外标签                      |
| `visibility`   | `"private"`               | 谁可以访问                           |
| `updated_at`   | `"2025-07-02T00:00:00Z"` | 最后修改时间                         |

::note
**最佳实践**  
你可以根据用例定义任何合适的元数据字段！
::

### 核心步骤
运行此示例时：

1. **提取：**  
你的消息会通过 `extractor_llm`，它返回一个包含 `TextualMemoryItem` 的 JSON 列表。

2. **嵌入：**  
每条记忆的 `memory` 字段会通过 `embedder` 转换成嵌入向量。

3. **存储：**  
嵌入向量保存到本地的 **Qdrant** 集合中。

4. **搜索与管理：**  
你现在可以按语义相似度 `search`，按 ID `update` 或 `delete` 记忆。

::note
**提示**  
确保你的 embedder 输出维度与向量数据库的 `vector_dimension` 匹配，否则可能导致搜索错误！
::

::note
**提示**  
如果搜索结果过于杂乱或无关，检查你的 <code>embedder</code> 配置和向量数据库是否正确初始化。
::

### 示例流程

**输入消息：**

```json
[
  {"role": "user", "content": "我喜欢番茄。"},
  {"role": "assistant", "content": "太好了！番茄很健康。"}
]
````

**提取的记忆：**

```json
{
  "memory": "用户喜欢番茄。",
  "metadata": {
    "type": "opinion",
    "memory_time": "2025-07-02",
    "source": "conversation",
    "confidence": 100.0,
    "entities": ["tomatoes"],
    "tags": ["food", "preferences"],
    "visibility": "private",
    "updated_at": "2025-07-02T00:00:00"
  }
}
```

下面是一个最简脚本，用于创建、提取、存储和搜索记忆：

::steps{level="4"}

#### 创建记忆配置

首先，创建你的最简 GeneralTextMemory 配置。
它包含三个关键部分：

* extractor\_llm：使用 LLM 从对话中提取纯文本记忆。
* embedder：将每条记忆转换成向量。
* vector\_db：存储向量并支持相似度搜索。

```python
from memos.configs.memory import MemoryConfigFactory
from memos.memories.factory import MemoryFactory

config = MemoryConfigFactory(
    backend="general_text",
    config={
        "extractor_llm": {
            "backend": "ollama",
            "config": {
                "model_name_or_path": "qwen3:0.6b",
                "temperature": 0.0,
                "remove_think_prefix": True,
                "max_tokens": 8192,
            },
        },
        "vector_db": {
            "backend": "qdrant",
            "config": {
                "collection_name": "test_textual_memory",
                "distance_metric": "cosine",
                "vector_dimension": 768,
            },
        },
        "embedder": {
            "backend": "ollama",
            "config": {
                "model_name_or_path": "nomic-embed-text:latest",
            },
        },
    },
)

m = MemoryFactory.from_config(config)
```

#### 从消息中提取记忆
给你的 LLM 一个简单的对话，看看它如何提取结构化的纯文本记忆。

```python
memories = m.extract(
    [
        {"role": "user", "content": "I love tomatoes."},
        {"role": "assistant", "content": "Great! Tomatoes are delicious."},
    ]
)
print("Extracted:", memories)
````

你将得到一个 TextualMemoryItem 的列表，每条内容类似：

```text
TextualMemoryItem(
  id='...',
  memory='The user loves tomatoes.',
  metadata=...
)
```

#### 将记忆添加到你的向量数据库

将提取的记忆保存到向量数据库中，并演示如何手动添加一条自定义纯文本记忆（带自定义 ID）。

```python
m.add(memories)
m.add([
    {
        "id": "a19b6caa-5d59-42ad-8c8a-e4f7118435b4",
        "memory": "User is Chinese.",
        "metadata": {"type": "opinion"},
    }
])
```

#### 搜索记忆

现在测试相似度搜索！
输入任何自然语言查询，查找相关记忆。

```python
results = m.search("Tell me more about the user", top_k=2)
print("Search results:", results)
```

#### 通过 ID 获取记忆

直接通过 ID 获取任意记忆：

```python
print("Get one by ID:", m.get("a19b6caa-5d59-42ad-8c8a-e4f7118435b4"))
```

#### 更新记忆

需要修正或完善记忆？
通过 ID 更新并重新嵌入新版本。

```python
m.update(
    "a19b6caa-5d59-42ad-8c8a-e4f7118435b4",
    {
        "memory": "User is Canadian.",
        "metadata": {
            "type": "opinion",
            "confidence": 85,
            "memory_time": "2025-05-24",
            "source": "conversation",
            "entities": ["Canadian"],
            "tags": ["happy"],
            "visibility": "private",
            "updated_at": "2025-05-19T00:00:00",
        },
    }
)
print("Updated:", m.get("a19b6caa-5d59-42ad-8c8a-e4f7118435b4"))
```

#### 删除记忆

干净地删除一条或多条记忆：

```python
m.delete(["a19b6caa-5d59-42ad-8c8a-e4f7118435b4"])
print("Remaining:", m.get_all())
```

#### 将记忆导出到磁盘

最后，将所有记忆导出到本地存储：

```python
m.dump("tmp/mem")
print("Memory dumped to tmp/mem")
```

默认情况下，你的记忆会保存到：

```
<your_dir>/<config.memory_filename>
```

可以随时用 `load()` 重新加载。

::note
默认情况下，导出的记忆保存到你配置中的文件路径。
如果想自定义，请务必检查 <code>config.memory\_filename</code>。
::

::

现在你的智能体有记忆了——不再是无状态聊天机器人！

## 接下来做什么？

准备进阶了吗？

- **尝试自己的 LLM 后端：** 切换到 OpenAI、HuggingFace 或 Ollama。
- **探索 [TreeTextMemory](/modules/memories/tree_textual_memory)：** 构建基于图的层级记忆。
- **添加 [Activation Memory](/modules/memories/kv_cache_memory)：** 缓存键值状态，加速推理。
- **深入学习：** 查看 [API Reference](/docs/api/info) 和 [Examples](/getting_started/examples) 了解高级工作流程。

::note
**试试图形文本记忆**
尝试切换到 <code>TreeTextMemory</code>，为你的记忆增加基于图的层级结构。
非常适合需要可解释性和长期结构化知识的场景。
::
