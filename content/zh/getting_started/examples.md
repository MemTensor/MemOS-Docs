---
title: MemOS 示例
desc: "恭喜你——你已经掌握了快速入门并构建了第一个可用的记忆！现在是时候通过结合不同的记忆类型和功能，看看 MemOS 可以实现多大的可能性。使用这些精选示例来激发你自己的智能体、聊天机器人或知识系统的灵感。"
---

::card-group

  :::card
  ---
  icon: ri:play-line
  title: 最简管道
  to: /getting_started/examples#example-1-minimal-pipeline
  ---
  最小的可用管道 — 添加、搜索、更新并导出纯文本记忆。
  :::

  :::card
  ---
  icon: ri:tree-line
  title: 仅 TreeTextMemory
  to: /getting_started/examples#example-2-treetextmemory-only
  ---
  使用 Neo4j 支持的层级记忆，构建结构化、多跳知识图谱。
  :::

  :::card
  ---
  icon: ri:database-2-line
  title: 仅 KVCacheMemory
  to: /getting_started/examples#example-3-kvcachememory-only
  ---
  使用短期 KV 缓存加速会话，实现快速上下文注入。
  :::

  :::card
  ---
  icon: hugeicons:share-07
  title: 混合 TreeText + KVCache
  to: /getting_started/examples#example-4-hybrid
  ---
  在单一 MemCube 中结合可解释的图形记忆和快速 KV 缓存。
  :::

  :::card
  ---
  icon: ri:calendar-check-line
  title: 多记忆调度
  to: /getting_started/examples#example-5-multi-memory-scheduling
  ---
  为多用户、多会话智能体运行动态记忆编排。
  :::

::

## 示例 1：最简管道

### 何时使用：
- 你想要最小的可用示例。
- 你只需要将简单的纯文本记忆存储到向量数据库中。
- 适合入门或测试你的嵌入与向量管道。

### 关键点：
- 仅使用 GeneralTextMemory（无图谱，无 KV 缓存）。
- 支持添加、搜索、更新和导出记忆。
- 集成基础的 MOS 管道。

### 完整示例代码
```python
import uuid
from memos.configs.mem_os import MOSConfig
from memos.mem_os.main import MOS


# 初始化 MOSConfig
mos_config = MOSConfig.from_json_file("examples/data/config/simple_memos_config.json")
mos = MOS(mos_config)

# 创建用户并注册记忆立方体
user_id = str(uuid.uuid4())
mos.create_user(user_id=user_id)
mos.register_mem_cube("examples/data/mem_cube_2", user_id=user_id)

# 添加简单对话
mos.add(
    messages=[
        {"role": "user", "content": "I love playing football."},
        {"role": "assistant", "content": "That's awesome!"}
    ],
    user_id=user_id
)

# 搜索记忆
result = mos.search(query="What do you love?", user_id=user_id)
print("Memories found:", result["text_mem"])

# 导出并重新加载
mos.dump("tmp/my_mem_cube")
mos.load("tmp/my_mem_cube")
````

## 示例 2：仅 TreeTextMemory

### 何时使用：

- 你需要带有可解释关系的层级图形记忆。
- 你想存储结构化知识并追踪连接关系。
- 适用于知识图谱、概念树和多跳推理。

### 关键点：

- 使用由 Neo4j 支持的 TreeTextMemory。
- 需要 extractor\_llm + dispatcher\_llm。
- 存储节点、边，支持遍历查询。

### 完整示例代码

```python
from memos.configs.embedder import EmbedderConfigFactory
from memos.configs.memory import TreeTextMemoryConfig
from memos.configs.mem_reader import SimpleStructMemReaderConfig
from memos.embedders.factory import EmbedderFactory
from memos.mem_reader.simple_struct import SimpleStructMemReader
from memos.memories.textual.tree import TreeTextMemory

# 设置 Embedder
embedder_config = EmbedderConfigFactory.model_validate({
    "backend": "ollama",
    "config": {"model_name_or_path": "nomic-embed-text:latest"}
})
embedder = EmbedderFactory.from_config(embedder_config)

# 创建 TreeTextMemory
tree_config = TreeTextMemoryConfig.from_json_file("examples/data/config/tree_config.json")
my_tree_textual_memory = TreeTextMemory(tree_config)
my_tree_textual_memory.delete_all()

# 设置 Reader
reader_config = SimpleStructMemReaderConfig.from_json_file(
    "examples/data/config/simple_struct_reader_config.json"
)
reader = SimpleStructMemReader(reader_config)

# 从对话中提取
scene_data = [[
    {"role": "user", "content": "Tell me about your childhood."},
    {"role": "assistant", "content": "I loved playing in the garden with my dog."}
]]
memory = reader.get_memory(scene_data, type="chat", info={"user_id": "1234", "session_id": "2222"})
for m_list in memory:
    my_tree_textual_memory.add(m_list)

# 搜索
results = my_tree_textual_memory.search(
    "Talk about the user's childhood story?",
    top_k=10
)

# [可选] 导出并清空
my_tree_textual_memory.dump("tmp/my_tree_textual_memory")
my_tree_textual_memory.drop()
```

## 示例 3：仅 KVCacheMemory

### 何时使用：

- 你想要短期工作记忆以加快多轮对话速度。
- 适合聊天机器人会话加速或提示复用。
- 最适合缓存隐藏状态 / KV 对。

### 关键点：

- 使用 KVCacheMemory，不含显式文本记忆。
- 演示提取 → 添加 → 合并 → 获取 → 删除。
- 展示如何导出/加载 KV 缓存。

### 完整示例代码


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

## 示例 4：混合模式

### 何时使用：
- 你希望同时拥有长期可解释记忆与短期快速上下文。
- 理想场景：用于具备计划能力、能记住事实并保持上下文的复杂智能体。
- 展示多记忆调度能力。

### 工作原理：

- **TreeTextMemory** 将你的长期知识存储在图数据库（Neo4j）中。
- **KVCacheMemory** 将最近或稳定的上下文作为激活缓存保存。
- 二者在一个 **MemCube** 中协同工作，由你的 `MOS` 管道统一管理。


### 完整示例代码

```python
import os

from memos.configs.mem_cube import GeneralMemCubeConfig
from memos.configs.mem_os import MOSConfig
from memos.mem_cube.general import GeneralMemCube
from memos.mem_os.main import MOS

# 1. 配置 CUDA（如需）——用于本地 GPU 推理
os.environ["CUDA_VISIBLE_DEVICES"] = "1"

# 2. 定义用户和路径
user_id = "root"
cube_id = "root/mem_cube_kv_cache"
tmp_cube_path = "/tmp/default/mem_cube_5"

# 3. 初始化 MOSConfig
mos_config = MOSConfig.from_json_file("examples/data/config/simple_treekvcache_memos_config.json")
mos = MOS(mos_config)

# 4. 初始化 MemCube（TreeTextMemory + KVCacheMemory）
cube_config = GeneralMemCubeConfig.from_json_file(
    "examples/data/config/simple_treekvcache_cube_config.json"
)
mem_cube = GeneralMemCube(cube_config)

# 5. 将 MemCube 导出到磁盘
try:
    mem_cube.dump(tmp_cube_path)
except Exception as e:
    print(e)

# 6. 显式注册 MemCube
mos.register_mem_cube(tmp_cube_path, mem_cube_id=cube_id, user_id=user_id)

# 7. 提取并添加一个 KVCache 记忆（模拟稳定上下文）
extract_kvmem = mos.mem_cubes[cube_id].act_mem.extract("I like football")
mos.mem_cubes[cube_id].act_mem.add([extract_kvmem])

# 8. 开始聊天 —— 你的对话现在将使用：
#    - TreeTextMemory：用于结构化的多跳检索
#    - KVCacheMemory：用于快速上下文注入
while True:
    user_input = input("👤 [You] ").strip()
    print()
    response = mos.chat(user_input)
    print(f"🤖 [Assistant] {response}\n")

print("📢 [System] MemChat has stopped.")
````

## 示例 5：多记忆调度

### 何时使用：

- 你希望管理多个用户、多个 MemCube 或动态的记忆流。
- 适用于 SaaS 智能体或多会话 LLM。
- 展示 MemScheduler 与 YAML 配置能力。

### 关键点：

- 使用 parse\_yaml 加载 MOSConfig 和 MemCubeConfig。
- 动态创建用户与 MemCube。
- 展示记忆的运行时调度。

### 完整示例代码

```python
import shutil
import uuid
from pathlib import Path

from memos.configs.mem_cube import GeneralMemCubeConfig
from memos.configs.mem_os import MOSConfig
from memos.mem_cube.general import GeneralMemCube
from memos.mem_os.main import MOS
from memos.mem_scheduler.utils import parse_yaml

# 使用 MemScheduler 加载主 MOS 配置
config = parse_yaml("./examples/data/config/mem_scheduler/memos_config_w_scheduler.yaml")
mos_config = MOSConfig(**config)
mos = MOS(mos_config)

# 创建动态用户 ID
user_id = str(uuid.uuid4())
mos.create_user(user_id=user_id)

# 创建 MemCube 配置并导出
config = GeneralMemCubeConfig.from_yaml_file(
    "./examples/data/config/mem_scheduler/mem_cube_config.yaml"
)
mem_cube_id = "mem_cube_5"
mem_cube_name_or_path = f"./outputs/mem_scheduler/{user_id}/{mem_cube_id}"

# 若存在旧目录则删除
if Path(mem_cube_name_or_path).exists():
    shutil.rmtree(mem_cube_name_or_path)
    print(f"{mem_cube_name_or_path} is not empty, and has been removed.")

# 导出新的 MemCube
mem_cube = GeneralMemCube(config)
mem_cube.dump(mem_cube_name_or_path)

# 为该用户注册 MemCube
mos.register_mem_cube(
    mem_cube_name_or_path=mem_cube_name_or_path,
    mem_cube_id=mem_cube_id,
    user_id=user_id
)

# 添加消息
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

# 聊天循环：展示 TreeTextMemory 节点 + KVCache
while True:
    user_input = input("👤 [You] ").strip()
    print()
    response = mos.chat(user_input, user_id=user_id)
    retrieved_memories = mos.get_all(mem_cube_id=mem_cube_id, user_id=user_id)

    print(f"🤖 [Assistant] {response}")

    # 展示 TreeTextMemory 中的 WorkingMemory 节点
    for node in retrieved_memories["text_mem"][0]["memories"]["nodes"]:
        if node["metadata"]["memory_type"] == "WorkingMemory":
            print(f"[WorkingMemory] {node['memory']}")

    # 展示 KVCache 激活记忆
    if retrieved_memories["act_mem"][0]["memories"]:
        for act_mem in retrieved_memories["act_mem"][0]["memories"]:
            print(f"⚡ [KVCache] {act_mem['memory']}")
    else:
        print("⚡ [KVCache] None\n")
```

::note
**请注意**<br>
使用 dump() 和 load() 来持久化你的记忆立方体。

务必确保你的向量数据库维度与你的嵌入器匹配。

如使用图形记忆功能，你需要安装 Neo4j Desktop（社区版支持即将到来）。
::

## 下一步

你才刚刚开始！接下来可以尝试：

- 选择与你使用场景匹配的示例。
- 组合模块以构建更智能、更持久的智能体！

还需要更多帮助？
查看 API 文档或贡献你自己的示例吧！

