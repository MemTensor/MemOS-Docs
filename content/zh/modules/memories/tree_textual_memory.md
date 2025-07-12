---
标题: "TreeTextMemory: 分层结构的明文记忆"
---

让我们在MemOS中构建你的第一个**基于图的、树形明文记忆**！

**TreeTextMemory** 支持以结构化方式组织、关联并检索记忆，同时保留丰富的上下文信息与良好的可解释性。

当前使用[Neo4j](/modules/memories/neo4j_graph_db)作为后端，未来计划支持更多图数据库。


## 你将学习到:

在本指南的最后，你会:
- 从原始文本或对话中提取结构化记忆
- 在图数据库中存储他们作为**节点**
- 将记忆链接成**层次结构**和语义图
- 使用**向量相似度+图遍历**进行搜索

## 如何工作

### 记忆结构

每个节点在`TreeTextMemory` 是一个 `TextualMemoryItem`:
- `id`: 唯一记忆ID（如果省略则自动生成）
- `memory`: 主要文本
- `metadata`: 包括层次结构信息、嵌入、标签、实体、源和状态

### 元数据字段 (`TreeNodeTextualMemoryMetadata`)

| 字段           | 类型                                                  | 描述                                |
| --------------- |-------------------------------------------------------| ------------------------------------------ |
| `memory_type`   | `"WorkingMemory"`, `"LongTermMemory"`, `"UserMemory"` | 生命周期分类                         |
| `status`        | `"activated"`, `"archived"`, `"deleted"`              | 节点状态                                |
| `visibility`    | `"private"`, `"public"`, `"session"`                  | 访问范围                               |
| `sources`       | `list[str]`                                           | 来源列表 (例如: 文件, URLs)        |
| `source`        | `"conversation"`, `"retrieved"`, `"web"`, `"file"`    | 原始来源类型                       |
| `confidence`    | `float (0-100)`                                       | 确定性得分                           |
| `entities`      | `list[str]`                                           | 提及的实体或概念             |
| `tags`          | `list[str]`                                           | 主题标签                              |
| `embedding`     | `list[float]`                                         | 基于向量嵌入的相似性搜索     |
| `created_at`    | `str`                                                 | 创建时间戳(ISO 8601)              |
| `updated_at`    | `str`                                                 | 最近更新时间戳(ISO 8601)           |
| `usage`         | `list[str]`                                           | 使用历史                           |
| `background`    | `str`                                                 | 附加上下文                        |


::注意
**最佳实践**<br>
  使用有意义的标签和背景——它们有助于组织你的图进行多跳推理。
::

### 核心步骤

当您运行此示例时，您的工作流将:

1. **抽取:** 使用LLM从原始文本中提取结构化记忆.


2. **嵌入:** 为相似性搜索生成向量嵌入.


3. **存储和链接:** 将具有关系的节点添加到图数据库（Neo4j）中.


4. **搜索:** 通过向量相似度查询，然后通过图跳数展开结果.


::注意
**提示**<br>图链接有助于检索纯向量搜索可能遗漏的上下文!
::

## API总结(`TreeTextMemory`)

### 初始化

```python
TreeTextMemory(config: TreeTextMemoryConfig)
```

### 核心方法

| 方法                      | 描述                                           |
| --------------------------- | ----------------------------------------------------- |
| `add(memories)`             | 添加一个或多个记忆（项目或字典）             |
| `replace_working_memory()`  | 更换所有的WorkingMemory节点                      |
| `get_working_memory()`      | 得到所有的WorkingMemory节点                          |
| `search(query, top_k)`      | 使用向量+图搜索检索top-k个记忆   |
| `get(memory_id)`            | 通过ID获取单个记忆                             |
| `get_by_ids(ids)`           | 通过IDs获取多个记忆                        |
| `get_all()`                 | 将整个记忆图导出为字典            |
| `update(memory_id, new)`    | 通过ID更新记忆                                 |
| `delete(ids)`               | 通过IDs删除记忆                                |
| `delete_all()`              | 删除所有的记忆和关系                 |
| `dump(dir)`                 | 在目录中将图序列化为JSON              |
| `load(dir)`                 | 从保存的JSON文件加载图                     |
| `drop(keep_last_n)`         | 备份图和删除数据库，保留N个备份       |

## 文件存储

当调用 `dump(dir)`, 系统写到:

```
<dir>/<config.memory_filename>
```

这个文件包含一个JSON结构，有 `nodes` and `edges`. 它可以使用 `load(dir)`重新加载.

---

## 您的第一个TreeTextMemory - 一步一步进行

::steps{}

### 创建 TreeTextMemory 配置
定义:
- 你的嵌入（创建向量）,
- 你的图数据库后端(Neo4j),
- 记忆抽取器（基于LLM）（可选）.

```python
from memos.configs.memory import TreeTextMemoryConfig

config = TreeTextMemoryConfig.from_json_file("examples/data/config/tree_config.json")
```


### 初始化 TreeTextMemory

```python
from memos.memories.textual.tree import TreeTextMemory

tree_memory = TreeTextMemory(config)
```

### 抽取结构化记忆

使用记忆抽取器将对话、文件或文档解析为多个`TextualMemoryItem`.

```python
from memos.mem_reader.simple_struct import SimpleStructMemReader

reader = SimpleStructMemReader.from_json_file("examples/data/config/simple_struct_reader_config.json")

scene_data = [[
    {"role": "user", "content": "Tell me about your childhood."},
    {"role": "assistant", "content": "I loved playing in the garden with my dog."}
]]

memories = reader.get_memory(scene_data, type="chat", info={"user_id": "1234"})
for m_list in memories:
    tree_memory.add(m_list)
```

### 搜索记忆

尝试向量搜索+图搜索:
```python
results = tree_memory.search("Talk about the garden", top_k=5)
for i, node in enumerate(results):
    print(f"{i}: {node.memory}")
```

### 替换工作记忆

用一个新的节点替换你当前的 `WorkingMemory`:
```python
tree_memory.replace_working_memory(
    [{
        "memory": "User is discussing gardening tips.",
        "metadata": {"memory_type": "WorkingMemory"}
    }]
)
```

### 备份与恢复
支持树结构的持久化存储与随时重载:
```python
tree_memory.dump("tmp/tree_memories")
tree_memory.load("tmp/tree_memories")
```

::


### 完整代码

该示例整合了上述所有步骤，提供一个端到端的完整流程 —— 复制即可运行！

```python
from memos.configs.embedder import EmbedderConfigFactory
from memos.configs.memory import TreeTextMemoryConfig
from memos.configs.mem_reader import SimpleStructMemReaderConfig
from memos.embedders.factory import EmbedderFactory
from memos.mem_reader.simple_struct import SimpleStructMemReader
from memos.memories.textual.tree import TreeTextMemory

# 嵌入设置
embedder_config = EmbedderConfigFactory.model_validate({
    "backend": "ollama",
    "config": {"model_name_or_path": "nomic-embed-text:latest"}
})
embedder = EmbedderFactory.from_config(embedder_config)

# 创建TreeTextMemory
tree_config = TreeTextMemoryConfig.from_json_file("examples/data/config/tree_config.json")
my_tree_textual_memory = TreeTextMemory(tree_config)
my_tree_textual_memory.delete_all()

# 阅读器设置
reader_config = SimpleStructMemReaderConfig.from_json_file(
    "examples/data/config/simple_struct_reader_config.json"
)
reader = SimpleStructMemReader(reader_config)

# 从对话中抽取
scene_data = [[
    {
        "role": "user",
        "content": "Tell me about your childhood."
    },
    {
        "role": "assistant",
        "content": "I loved playing in the garden with my dog."
    },
]]
memory = reader.get_memory(scene_data, type="chat", info={"user_id": "1234", "session_id": "2222"})
for m_list in memory:
    my_tree_textual_memory.add(m_list)

# 搜索
results = my_tree_textual_memory.search(
    "Talk about the user's childhood story?",
    top_k=10
)
for i, r in enumerate(results):
    print(f"{i}'th result: {r.memory}")

# 从文档添加[可选项]
doc_paths = ["./text1.txt", "./text2.txt"]
doc_memory = reader.get_memory(
  doc_paths, "doc", info={
      "user_id": "your_user_id",
      "session_id": "your_session_id",
  }
)
for m_list in doc_memory:
    my_tree_textual_memory.add(m_list)

# 转储和丢弃[可选项]
my_tree_textual_memory.dump("tmp/my_tree_textual_memory")
my_tree_textual_memory.drop()
```

## 是什么让TreeTextMemory不同?

- **结构层次:** 像思维导图一样组织记忆——节点可以有父母、孩子和交叉链接。
- **图风格的链接:** 超越纯粹的层次结构-建立多跳推理链。
- **语义搜索+图扩展:** 结合向量和图形的优点。
- **可解释性:** 追踪记忆是如何连接、合并或随时间演变的.

::注意
**尝试一下**<br>从文档或web内容中添加记忆节点。手动链接它们或自动合并类似的节点！
::

## 下一步是什么?

- **了解更多[Neo4j](/modules/memories/neo4j_graph_db):** treeTextMemory由图数据库后端提供支持。了解Neo4j如何处理节点、边和遍历将帮助您设计更有效的记忆层次结构、多跳推理和上下文链接策略。
- **添加 [Activation Memory](/modules/memories/kv_cache_memory):** 使用运行时KV-cache来测试会话状态。
- **探索图推理:** 为多跳检索和答案合成构建工作流。
- **更进一步:** 为高级应用检查 [API Reference](/docs/api/info), 或者在 `examples/`运行更多的示例.

现在你的代理不仅能记住事实，还能记住它们之间的联系！
