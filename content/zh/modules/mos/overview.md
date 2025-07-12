---
标题: MemOS的MOS API
描述: "**MOS**（记忆操作系统）是MemOS的核心组件，它作为一个编排层，管理多个记忆模块（MemCubes），并为记忆增强应用程序提供统一的接口."
---

## API总结 (`MOS`)

### 初始化
```python
from memos import MOS
mos = MOS(config: MOSConfig)
```

### 核心方法

| 方法 | 描述 |
|--------|-------------|
| `register_mem_cube(mem_cube_name_or_path, mem_cube_id=None, user_id=None)` | 从目录或远程仓库为用户注册一个新的记忆立方 |
| `unregister_mem_cube(mem_cube_id, user_id=None)` | 根据ID取消注册(移除)一个记忆立方 |
| `add(messages=None, memory_content=None, doc_path=None, mem_cube_id=None, user_id=None)` | 将新记忆（来自消息、字符串或文档）添加到立方体 |
| `search(query, user_id=None, install_cube_ids=None)` | 通过立方体IDs搜索记忆，跨多个立方体，过滤可选项 |
| `chat(query, user_id=None)` | 与LLM聊天，通过指定用户的记忆检索增强 |
| `get(mem_cube_id, memory_id, user_id=None)` | 为用户通过立方体和记忆ID获取特定记忆 |
| `get_all(mem_cube_id=None, user_id=None)` | 从一个立方体得到所有记忆 |
| `update(mem_cube_id, memory_id, text_memory_item, user_id=None)` | 通过ID在立方体中为用户更新记忆 |
| `delete(mem_cube_id, memory_id, user_id=None)` | 通过ID为用户从立方体中删除一个记忆 |
| `delete_all(mem_cube_id=None, user_id=None)` | 为一个用户从立方体中删除所有记忆 |
| `clear_messages(user_id=None)` | 清除指定用户会话的聊天记录 |

### 用户管理方法

| 方法 | 描述 |
|--------|-------------|
| `create_user(user_id, role=UserRole.USER, user_name=None)` | 使用指定的角色和可选的名称创建新用户 |
| `list_users()` | 列出所有活跃用户及其信息 |
| `create_cube_for_user(cube_name, owner_id, cube_path=None, cube_id=None)` | 为特定用户创建一个新的立方体 |
| `get_user_info()` | 获得当前用户的信息 |
| `share_cube_with_user(cube_id, target_user_id)` | 和其他用户共享立方体 |

## 类别概述

`MOS` 管理多个 `MemCube` 对象, 每个代表一个用户或会话的记忆。它为记忆操作（增删改查）提供了统一的API，并与LLM集成，通过上下文记忆检索增强聊天功能。MOS支持多用户、多会话场景，并可扩展到新的记忆类型和后端。

## 使用样例

```python
import uuid

from memos.configs.mem_os import MOSConfig
from memos.mem_os.main import MOS


# 初始化MOS
mos_config = MOSConfig.from_json_file("examples/data/config/simple_memos_config.json")
memory = MOS(mos_config)

# 创建用户
user_id = str(uuid.uuid4())
memory.create_user(user_id=user_id)

# 为用户注册记忆立方
memory.register_mem_cube("examples/data/mem_cube_2", user_id=user_id)

# 为用户添加记忆
memory.add(
    messages=[
        {"role": "user", "content": "I like playing football."},
        {"role": "assistant", "content": "I like playing football too."},
    ],
    user_id=user_id,
)
# 之后，当您想为用户检索记忆时
retrieved_memories = memory.search(query="What do you like?", user_id=user_id)
# 输出明文记忆: I like playing football, act_memories, para_memories
print(f"text_memories: {retrieved_memories['text_mem']}")
```

## 核心操作概述

MOS提供了几个与记忆交互的主要操作:

* **添加记忆** - 存储来自对话、文档或直接输入文本中的新信息
* **搜索记忆** - 基于语义查询检索相关记忆
* **与记忆对话** - 增强对话与上下文记忆检索
* **记忆管理** - 组织现有记忆（增删改）
* **记忆存储** - 将记忆立方导出进行持久存储

## 1. 添加记忆

### 概述

添加操作通过几个步骤处理和存储新信息


#### 从对话消息添加

```python
import uuid
from memos.configs.mem_os import MOSConfig
from memos.mem_os.main import MOS

# 初始化MOS
mos_config = MOSConfig.from_json_file("config/simple_memos_config.json")
memory = MOS(mos_config)

# 创建用户
user_id = str(uuid.uuid4())
memory.create_user(user_id=user_id, user_name="Alice")

# 注册记忆立方
memory.register_mem_cube("examples/data/mem_cube_2", user_id=user_id)

# 从对话中添加记忆
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

#### 直接添加记忆

```python
# 直接添加特定的记忆
memory.add(
    memory_content="User prefers vegetarian food and enjoys cooking Italian cuisine",
    mem_cube_id="personal_memories",
    user_id=user_id
)

# 添加多个记忆项
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

#### 从文档添加

```python

# 从多个文档添加
doc_path="./examples/data"
memory.add(
    doc_path=doc_path,
    mem_cube_id="personal_memories",
    user_id=user_id
)
```

## 2. 搜索记忆

### 概述

搜索操作通过搜索API检索记忆:


#### 基础的记忆搜索

```python
# 从相关记忆搜索
results = memory.search(
    query="What sports do I like?",
    user_id=user_id
)

# 访问不同类型的记忆
text_memories = results['text_mem']
activation_memories = results['act_mem']
parametric_memories = results['para_mem']

print(f"Found {len(text_memories)} text memories")
for memory in text_memories:
    print(memory)
```

#### 跨立方的记忆搜索

```python
# 只在特定的记忆立方中搜索
results = memory.search(
    query="What are my preferences?",
    user_id=user_id,
    install_cube_ids=["personal_memories", "shared_knowledge"]
)

# 通过立方处理结果
for cube_memories in results['text_mem']:
    print(f"\nCube: {cube_memories['cube_id']}")
    for memory in cube_memories['memories']:
        print(f"- {memory}")
```

## 3. 聊天增强记忆

### 概述

聊天操作通过以下方式提供记忆增强的对话:

1. **记忆检索** - 根据查询搜索相关记忆
2. **上下文构建** - 将检索到的记忆整合到会话上下文中
3. **生成响应** - LLM使用记忆上下文生成响应



#### 基础对话

```python
# 简单的聊天记忆增强
response = memory.chat(
    query="What do you remember about my interests?",
    user_id=user_id
)
print(f"Assistant: {response}")
```

## 4. 记忆的检索和管理

### 生成指定记忆

#### 示例代码

```python
# 通过ID获取特定记忆
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

### 获取所有记忆



#### 示例代码

```python
# 从特定的立方得到全部记忆
all_memories = memory.get_all(
    mem_cube_id="personal_memories",
    user_id=user_id
)

# 从所有可访问的立方得到全部记忆
all_memories = memory.get_all(user_id=user_id)

# 访问不同的记忆类型
for cube_memories in all_memories['text_mem']:
    print(f"\nCube: {cube_memories['cube_id']}")
    print(f"Total memories: {len(cube_memories['memories'])}")

    for memory in cube_memories['memories']:
        print(f"- {memory.memory}")
        print(f"  ID: {memory.memory_id}")
        print(f"  Created: {memory.created_at}")
```

## 5. 记忆更新和删除

### 更新记忆



#### 示例代码

```python
from memos.memories.textual.item import TextualMemoryItem

# 创建更新后的记忆项
updated_memory = TextualMemoryItem(
    memory="User now prefers vegan food and enjoys cooking Mediterranean cuisine",
    metadata={
        "updated_at": "2024-01-15",
        "update_reason": "Dietary preference change"
    }
)

# 更新存在的记忆
memory.update(
    mem_cube_id="personal_memories",
    memory_id="memory_123",
    text_memory_item=updated_memory,
    user_id=user_id
)

print("Memory updated successfully")
```

### 删除记忆


```python
# 删除一个特定记忆
memory.delete(
    mem_cube_id="personal_memories",
    memory_id="memory_123",
    user_id=user_id
)

# 从一个特定的立方删除所有记忆
memory.delete_all(
    mem_cube_id="personal_memories",
    user_id=user_id
)

# 删除用户的所有记忆（请谨慎使用！）
memory.delete_all(user_id=user_id)
```

## 6. 记忆存储

### 概述

存储操作将记忆立方导出进行持久存储，支持您进行:

* **记忆备份** - 为记忆立方创建持久化副本
* **记忆迁移** - 在系统中移除记忆立方
* **记忆归档** - 存储记忆立方以进行长期保存
* **记忆共享** - 导出记忆立方与其他用户共享

#### 基本存储

```python
# 将特定记忆立方存储到目录中
memory.dump(
    dump_dir="./backup/memories",
    mem_cube_id="personal_memories",
    user_id=user_id
)

print("Memory cube dumped successfully")
```

#### 存储默认立方

```python
# 存储用户的默认立方（第一个可访问的立方）
memory.dump(
    dump_dir="./backup/default_memories",
    user_id=user_id
)

print("Default memory cube dumped successfully")
```

#### 存储默认立方

```python
# 获取用户信息以查看所有可访问的立方
user_info = memory.get_user_info()

# 存储每个可访问的立方
for cube_info in user_info['accessible_cubes']:
    if cube_info['is_loaded']:
        memory.dump(
            dump_dir=f"./backup/{cube_info['cube_name']}",
            mem_cube_id=cube_info['cube_id'],
            user_id=user_id
        )
        print(f"Dumped cube: {cube_info['cube_name']}")
```

#### 存储自定义目录结构

```python
import os
from datetime import datetime

# 创建带时间戳的备份目录
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_dir = f"./backups/{timestamp}"

# 确保目录存在
os.makedirs(backup_dir, exist_ok=True)

# 存储具有组织结构的记忆立方
memory.dump(
    dump_dir=backup_dir,
    mem_cube_id="personal_memories",
    user_id=user_id
)

print(f"Memory cube dumped to: {backup_dir}")
```

## 7. 会话管理

### 清除对话历史


```python
# 清除用户会话的聊天记录
memory.clear_messages(user_id=user_id)

# 验证聊天记录已清除
user_info = memory.get_user_info()
print(f"Chat history cleared for user: {user_info['user_name']}")
```

## 何时使用MOS

当你需要使用MOS时:

- 使用持久的、特定于用户的记忆构建LLM应用程序.
- 支持多用户、多会话记忆管理.
- 将记忆增强检索和推理集成到聊天机器人或代理中.
