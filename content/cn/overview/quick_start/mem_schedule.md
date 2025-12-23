---
title: 记忆调度
desc: 记忆调度就像记忆系统的神经中枢，在后台通过组织和协调记忆的添加、更新、转换、检索等操作，动态分配和回收认知资源，以不断优化整个记忆系统。
---

## 0. 入口与初始化流程

**入口文件**

- `MemOS/src/memos/api/server_api.py`：FastAPI 应用入口，只负责挂载路由与异常处理。
- `MemOS/src/memos/api/routers/server_router.py`：API Router，执行 `handlers.init_server()` 完成组件装载，并拿到 `mem_scheduler`。

**初始化逻辑**（`MemOS/src/memos/api/handlers/component_init.py`）

1. 初始化 Redis 客户端（用于状态追踪、队列支持）。
2. 构建 LLM、Embedder、GraphDB、Reranker、MemReader 等核心组件。
3. 创建 `OptimizedScheduler` (`BaseScheduler`类型)（通过 `SchedulerFactory` + `SchedulerConfigFactory`）。
4. 调用 `mem_scheduler.initialize_modules(...)` 与 `mem_scheduler.init_mem_cube(...)` 绑定资源。
5. 如果 `API_SCHEDULER_ON=true`（默认），则调用 `mem_scheduler.start()` 启动调度器。

**调度器启动**（`BaseScheduler.start()`）

- `start_consumer()`：启动消息消费者线程/进程。
- `start_background_monitor()`：启动队列监控线程（采样队列长度等指标）。

> 线程/进程模式由 `scheduler_startup_mode` 控制，默认为 `thread`。

## 1. 功能简介

MemScheduler 是 **生产者-消费者 + 线程池并行**。

**整体链路**

```text
API 请求
  -> BaseScheduler.submit_messages
     -> 优先级分流 (LEVEL_1 直达 / 其他进入队列)
        -> 消费线程 _message_consumer
           -> Dispatcher.dispatch (线程池并发)
              -> Handler 执行业务逻辑
              -> Status Tracker 更新状态 + Redis ACK
```


### 1.1 队列模型

#### 本地队列（SchedulerLocalQueue）

- 当 `use_redis_queue=False` 时启用。
- 适用于单机部署或开发环境。

#### Redis 队列（SchedulerRedisQueue）

Redis 版本是 **生产环境推荐默认路径**，支持多实例部署和断点恢复。

**Stream Key 格式**

```
{prefix}:{user_id}:{mem_cube_id}:{task_label}
```

- 默认前缀：`scheduler:messages:stream:v2.0`
- Consumer Group：`scheduler_group`
  - Redis 队列前缀可通过 `MEMSCHEDULER_REDIS_STREAM_KEY_PREFIX` 覆盖。
  - 默认常量 `DEFAULT_STREAM_KEY_PREFIX` 可由 `MEMSCHEDULER_STREAM_KEY_PREFIX` 覆盖（如需统一风格建议只配置前者）。


### 1.2 状态追踪（TaskStatusTracker）

调度系统通过 Redis Hash 追踪任务状态：

- **任务主表**：`memos:task_meta:{user_id}`
  - field: `item_id`
  - value: JSON payload (status, task_type, mem_cube_id, timestamps...)
  - TTL: 7 天
- **业务任务关联表**：`memos:task_items:{user_id}:{task_id}`
  - value: set[item_id]
  - TTL: 7 天

**状态流转**

```
waiting -> in_progress -> completed / failed
```

**TTL**

- 所有 tracking key 默认 7 天过期。

**聚合查询**

- 当多个 `item_id` 共享同一个 `task_id`，`get_task_status_by_business_id` 会聚合：
  - 任一失败 → failed
  - 任一 in_progress/waiting → in_progress
  - 全部完成 → completed

### 1.3 消息协议

#### ScheduleMessageItem

调度器接收的核心消息结构：

| 字段 | 类型 | 必需 | 说明 |
| :--- | :--- | :--- | :--- |
| `item_id` | `str` | 是 | 单条消息 UUID。 |
| `redis_message_id` | `str` | 否 | Redis Stream 消息 ID（消费后写入）。 |
| `stream_key` | `str` | 否 | Redis stream key。 |
| `user_id` | `str` | 是 | 用户 ID。 |
| `trace_id` | `str` | 否 | Trace ID，用于链路追踪。 |
| `mem_cube_id` | `str` | 是 | MemCube ID。 |
| `session_id` | `str` | 否 | Session ID（软过滤使用）。 |
| `label` | `str` | 是 | 调度指令。 |
| `content` | `str` | 是 | JSON 字符串或文本载荷。 |
| `timestamp` | `datetime` | 否 | 提交时间（自动生成）。 |
| `user_name` | `str` | 否 | 用户展示名。 |
| `info` | `dict` | 否 | 扩展信息（如 source_doc_id）。 |
| `task_id` | `str` | 否 | 业务任务 ID（用于聚合状态）。 |

#### 指令集（Task Labels）

| Label | 优先级 | 处理器 | 说明 |
| :--- | :--- | :--- | :--- |
| `query` | Level 1 | `_query_message_consumer` | 检索与激活记忆。 |
| `answer` | Level 1 | `_answer_message_consumer` | 记录回答。 |
| `add` | Level 1 | `_add_message_consumer` | 新记忆写入。 |
| `mem_update` | Level 3 | `_memory_update_consumer` | 长时记忆索引更新。 |
| `mem_read` | Level 3 | `_mem_read_message_consumer` | 文件解析后的记忆增强。 |
| `mem_organize` | Level 3 | `_mem_reorganize_message_consumer` | 记忆合并与整理。 |
| `mem_archive` | Level 3 | 未注册 | 记忆归档预留 Label（当前版本未注册 handler）。 |
| `pref_add` | Level 3 | `_pref_add_message_consumer` | 用户偏好记录。 |
| `mem_feedback` | Level 3 | `_mem_feedback_message_consumer` | 点赞/点踩反馈学习。 |
| `api_mix_search` | Level 3 | `_api_mix_search_message_consumer` | API 侧混合检索（异步增强）。 |

> 任务优先级由 `SchedulerOrchestrator.tasks_priorities` 决定，未配置的 label 默认 Level 3。

### 1.4 管理与监控 API

**调度器状态**

- `GET /product/scheduler/status`
  - 参数：`user_id`, `task_id`(可选)
  - `task_id` 既可传业务任务 ID（聚合状态），也可传单条 `item_id`。
  - 返回：指定任务或用户所有任务的状态列表。

- `GET /product/scheduler/allstatus`
  - 返回：全局聚合统计（waiting / in_progress / failed / completed...）。

**队列积压**

- `GET /product/scheduler/task_queue_status`
  - 参数：`user_id`
  - 仅在启用 Redis 队列时可用（`use_redis_queue=True`）。
  - 返回：Redis Stream 维度的 pending 与 remaining 统计。

**请求 / 响应示例**

`GET /product/scheduler/status?user_id=u_123`

```json
{
  "data": [
    { "task_id": "9b4b8f3b-7c4e-4f9f-9cf0-0a4f5d2e3b10", "status": "completed" },
    { "task_id": "c0d3b7a1-5a9e-4e4a-90e0-6b8a6df6a2aa", "status": "in_progress" }
  ]
}
```

`GET /product/scheduler/status?user_id=u_123&task_id=task_20240722_001`

```json
{
  "data": [
    { "task_id": "task_20240722_001", "status": "completed" }
  ]
}
```

`GET /product/scheduler/task_queue_status?user_id=u_123`

```json
{
  "data": {
    "user_id": "u_123",
    "user_name": null,
    "mem_cube_id": null,
    "stream_keys": [
      "scheduler:messages:stream:v2.0:u_123:mem_001:query",
      "scheduler:messages:stream:v2.0:u_123:mem_001:add"
    ],
    "users_count": 1,
    "pending_tasks_count": 2,
    "remaining_tasks_count": 5,
    "pending_tasks_detail": [
      "scheduler:messages:stream:v2.0:u_123:mem_001:query:1",
      "scheduler:messages:stream:v2.0:u_123:mem_001:add:1"
    ],
    "remaining_tasks_detail": [
      "scheduler:messages:stream:v2.0:u_123:mem_001:query:3",
      "scheduler:messages:stream:v2.0:u_123:mem_001:add:2"
    ]
  }
}
```

`GET /product/scheduler/allstatus`

```json
{
  "data": {
    "scheduler_summary": {
      "waiting": 2,
      "in_progress": 1,
      "pending": 2,
      "completed": 15,
      "failed": 0,
      "cancelled": 0,
      "total": 18
    },
    "all_tasks_summary": {
      "waiting": 3,
      "in_progress": 1,
      "pending": 3,
      "completed": 24,
      "failed": 1,
      "cancelled": 0,
      "total": 29
    }
  }
}
```

### 1.5. 观测与监控事件

调度器在关键阶段发送监控事件：

- `enqueue` / `dequeue` / `start` / `finish`
- 记录 `queue_wait_ms`, `exec_duration_ms`, `total_duration_ms`
- 支持 trace_id 贯通 API 与调度链路

这些事件是调度性能分析与问题排查的核心依据。

        

## 2. 进阶：如果你想做深度定制

开发者可以通过 **扩展调度策略** 来定制系统行为，主要包括：

| **扩展点** | **可配置内容** | **示例场景** |
| --- | --- | --- |
| 调度策略 | 定义不同任务下的记忆选择逻辑 | 对话系统优先用激活记忆；科研系统优先检索最新明文 |
| 转换规则 | 设定跨类型迁移条件 | 高频 FAQ → KV 缓存；稳定范式 → 参数模块 |
| 上下文绑定 | 将记忆与角色/用户挂钩 | 学生用户自动加载学习偏好；企业用户加载项目档案 |
| 权限与治理 | 调度时结合访问控制与合规检查 | 医疗记录仅医生可见；敏感内容不可跨域共享 |
| 调度指标 | 基于访问频率、延迟需求优化调度 | 高频热记忆提升优先级；低频冷记忆降级存档 |

### 深度定制指南：注册与触发自定义记忆管理任务

Memos 的调度器支持开发者注册异步的后台任务（如定期整理记忆、批量导出数据、或执行耗时的分析）。你可以通过注册 **Handler** 并向调度器提交带有特定 **Label** 的消息来触发这些任务。

以下是实现自定义异步任务的完整流程，可以参考 `examples/mem_scheduler/scheduler_for_async_tasks.py`：

#### 1. 定义处理函数 (Handler)

首先，定义一个处理函数，它接收一批 `ScheduleMessageItem` 消息。这是实际执行业务逻辑的地方。

```python
from memos.mem_scheduler.schemas.message_schemas import ScheduleMessageItem
import time

def my_async_task_handler(messages: list[ScheduleMessageItem]):
    """
    处理一批调度消息。
    """
    print(f"收到 {len(messages)} 个任务，开始处理...")
    
    for msg in messages:
        # 获取任务详情
        task_id = msg.item_id
        content = msg.content
        user_id = msg.user_id
        
        # 在这里执行你的记忆管理逻辑（例如：文件读写、API调用、数据分析）
        print(f"正在为用户 {user_id} 处理任务 {task_id}: {content}")
        time.sleep(1) # 模拟耗时操作
        
    print("所有任务处理完毕。")
```

#### 2. 注册 Handler

为你的任务定义一个唯一的 Label，并将 Handler 注册到全局调度器实例 `mem_scheduler` 中。

```python
from memos.api.routers.server_router import mem_scheduler

# 定义任务的唯一标识
MY_TASK_LABEL = "my_custom_async_task"

# 注册 Handler
mem_scheduler.register_handlers({
    MY_TASK_LABEL: my_async_task_handler
})

# (可选) 设置该任务类型的最小空闲时间 (毫秒)
# 这可以防止任务过于频繁地执行，适合低优先级的后台任务
mem_scheduler.orchestrator.tasks_min_idle_ms[MY_TASK_LABEL] = 5000 
```

#### 3. 提交任务触发调度

构建一个 `ScheduleMessageItem` 并提交到调度队列。调度器会根据 Label 自动将消息分发给你的 Handler。

```python
from memos.mem_scheduler.schemas.message_schemas import ScheduleMessageItem

# 创建任务消息
task_item = ScheduleMessageItem(
    user_id="user_123",
    mem_cube_id="default_cube",
    label=MY_TASK_LABEL,          # 必须与注册时的 Label 一致
    content="需要处理的数据内容",    # 传递给 Handler 的载荷
    item_id="unique_task_id_001"   # (可选) 任务ID，若不填会自动生成 UUID
)

# 提交到调度队列
print("正在提交任务...")
mem_scheduler.memos_message_queue.submit_messages([task_item])

# 此时，调度器会在后台异步调用 my_async_task_handler
```

通过这种方式，你可以轻松地将复杂的记忆管理逻辑解耦，交由 Memos 的调度系统在后台可靠执行。


## 3. 联系我们
<img src="https://cdn.memtensor.com.cn/img/1758685658684_nbhka4_compressed.png" alt="image" style="width:70%;">

