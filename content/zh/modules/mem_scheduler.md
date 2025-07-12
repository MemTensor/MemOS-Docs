---
title: "MemScheduler: 记忆组织调度器"
desc: "`MemScheduler` 是一个与 MemOS 系统并行运行的并发记忆管理系统，它协调 AI 系统中工作记忆、长时记忆和激活记忆之间的记忆操作。它通过事件驱动调度处理记忆检索、更新和压缩。<br/> 该系统特别适合需要动态记忆管理的对话代理和推理系统。"
---
# 记忆调度器概述

![Memory Management](https://img.shields.io/badge/Component-Memory_Management-blue)
![Event-Driven](https://img.shields.io/badge/Architecture-Event_Driven-green)

`MemScheduler` 是一个与 MemOS 并行工作的并发记忆管理系统，协调 AI 系统中工作记忆、长时记忆和激活记忆之间的记忆操作。专为对话代理和推理系统设计，它通过事件驱动调度提供动态记忆管理。

## 主要特性

- 🚀 **与 MemOS 系统并发操作**
- 🧠 **多记忆协调** (工作/长时/用户记忆)
- ⚡ **事件驱动调度** 用于记忆分配
- 🔍 **高效检索** 相关记忆项
- 📊 **全面监控** 记忆使用情况
- 📝 **详细日志记录** 用于调试和分析
- 
## 记忆调度器架构

`MemScheduler` 系统围绕几个关键组件构建：

1. **消息处理**: 通过带有标记处理器的调度器处理传入消息
2. **记忆管理**: 管理不同的记忆类型 (工作、长时、用户)
3. **检索系统**: 基于上下文高效检索相关记忆项
4. **监控**: 跟踪记忆使用、频率和触发更新
5. **调度器 (路由器)**: 通过检查来自 MemOS 系统的消息触发不同的记忆重分配策略。
6. **日志记录**: 维护记忆操作日志用于调试和分析

## 消息处理

调度器通过带有专用处理器的调度器处理消息：

### 消息类型

| 消息类型 | 处理器方法                  | 描述                                |
|--------------|---------------------------------|--------------------------------------------|
| `QUERY_LABEL` | `_query_message_consume`       | 处理用户查询并触发检索 |
| `ANSWER_LABEL`| `_answer_message_consume`      | 处理答案并更新记忆使用 |

### 调度消息结构 

调度器使用以下格式处理来自其队列的消息：

ScheduleMessageItem:

| 字段         | 类型                 | 描述                                   |
|---------------|----------------------|-----------------------------------------------|
| `item_id`     | `str`                | UUID (自动生成) 用于唯一标识 |
| `user_id`     | `str`                | 关联用户的标识符            |
| `mem_cube_id` | `str`                | mem cube 的标识符                |
| `label`       | `str`                | 消息标签 (例如，`QUERY_LABEL`、`ANSWER_LABEL`) |
| `mem_cube`    | `GeneralMemCube｜str` | mem cube 对象或引用               |
| `content`     | `str`                | 消息内容                               |
| `timestamp`   | `datetime`           | 消息提交时间           |


同时调度器将按照以下结构发送调度消息。

ScheduleLogForWebItem:

| 字段                  | 类型               | 描述                                                                 | 默认值                          |
|------------------------|--------------------|-----------------------------------------------------------------------------|----------------------------------------|
| `item_id`              | `str`              | 唯一日志条目标识符 (UUIDv4)                                        | 自动生成 (`uuid4()`)             |
| `user_id`              | `str`              | 关联用户标识符                                                  | (必需)                             |
| `mem_cube_id`          | `str`              | 链接的 mem cube ID                                                       | (必需)                             |
| `label`                | `str`              | 日志类别标识符                                                     | (必需)                             |
| `from_memory_type`     | `str`              | 源记忆分区<br>可能的值：<br>- `"LongTermMemory"`<br>- `"UserMemory"`<br>- `"WorkingMemory"` | (必需)                             |
| `to_memory_type`       | `str`              | 目标记忆分区                                                | (必需)                             |
| `log_content`          | `str`              | 详细日志消息                                                        | (必需)                             |
| `current_memory_sizes` | `MemorySizes`      | 当前记忆利用率                                                  | <pre>DEFAULT_MEMORY_SIZES = {<br>  "long_term_memory_size": -1,<br>  "user_memory_size": -1,<br>  "working_memory_size": -1,<br>  "transformed_act_memory_size": -1<br>}</pre> |
| `memory_capacities`    | `MemoryCapacities` | 记忆分区限制                                                     | <pre>DEFAULT_MEMORY_CAPACITIES = {<br>  "long_term_memory_capacity": 10000,<br>  "user_memory_capacity": 10000,<br>  "working_memory_capacity": 20,<br>  "transformed_act_memory_capacity": -1<br>}</pre> |
| `timestamp`            | `datetime`         | 日志创建时间                                                           | 自动设置 (`datetime.now`)              |

##  执行示例

`examples/mem_scheduler/schedule_w_memos.py` 是一个演示脚本，展示如何使用 `MemScheduler` 模块。它说明了对话上下文中的记忆管理和检索。

### 代码功能概述

此脚本演示了初始化和使用记忆调度器的两种方法：

1. **自动初始化**: 通过配置文件配置调度器
2. **手动初始化**: 显式创建和配置调度器组件

该脚本模拟用户和助手之间关于宠物的对话，演示记忆调度器如何管理对话历史并检索相关信息。

### 核心代码结构

```python
def init_task():
    # 初始化示例对话和问题
    conversations = [
        {"role": "user", "content": "I just adopted a golden retriever puppy yesterday."},
        {"role": "assistant", "content": "Congratulations! What did you name your new puppy?"},
        # 更多对话...
    ]

    questions = [
        {"question": "What's my dog's name again?", "category": "Pet"},
        # 更多问题...
    ]
    return conversations, questions

def run_with_automatic_scheduler_init():
    # 自动初始化：从 YAML 文件加载配置
    # 创建用户和 mem cube
    # 将对话添加到记忆
    # 处理用户查询并显示答案
    # 显示网络日志

def run_with_manual_scheduler_init():
    # 手动初始化：显式创建和配置调度器组件
    # 初始化 MemOS、用户和 mem cube
    # 手动向调度器提交消息
    # 处理用户查询并显示答案
    # 显示网络日志

if __name__ == '__main__':
    # 按顺序运行两种初始化方法
    run_with_automatic_scheduler_init()
    run_with_manual_scheduler_init()
```
