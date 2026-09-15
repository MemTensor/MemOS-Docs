---
title: Scheduler Status
desc: "Monitor the full lifecycle of MemOS async tasks, including task progress, queue backlog, and system-wide metrics."
---

**Endpoints**:
* **System Overview**: `GET /product/scheduler/allstatus`
* **Task Progress Query**: `GET /product/scheduler/status`
* **User Queue Metrics**: `GET /product/scheduler/task_queue_status`

**Description**: These endpoints provide observability for the async memory production pipeline. Track specific task completion status, monitor Redis queue backlogs, and view system-wide scheduling metrics.

## 1. Core Mechanism: MemScheduler System

In the open-source architecture, **MemScheduler** handles all long-running background tasks (LLM memory extraction, vector index building, etc.):

* **State Transitions**: Tasks progress through `waiting` → `in_progress` → `completed` or `failed`.
* **Queue Monitoring**: Built on Redis Streams for task distribution. Monitor `pending` (delivered but unacknowledged) and `remaining` (queued) counts to assess system pressure.
* **Multi-dimensional Observability**: View status from three perspectives: single task, per-user queue, and system-wide summary.

## 2. Endpoint Details

### 2.1 Task Progress Query (`/status`)

Tracks the current execution stage of a specific async task.

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`user_id`** | `str` | Yes | User identifier for the query. |
| `task_id` | `str` | No | Optional: Query a specific task's status. |

**Status Values**:
* `waiting`: Task is queued, awaiting a free worker.
* `in_progress`: Worker is calling the LLM for memory extraction or writing to the database.
* `completed`: Memory has been persisted and vector index synced.
* `failed`: Task failed.

### 2.2 User Queue Metrics (`/task_queue_status`)

Monitors a user's task backlog in Redis.

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`user_id`** | `str` | Yes | User ID to check queue status. |

**Key Metrics**:
* `pending_tasks_count`: Tasks delivered to workers but not yet acknowledged.
* `remaining_tasks_count`: Tasks still queued and awaiting assignment.
* `stream_keys`: Matching Redis Stream key names.

### 2.3 System Overview (`/allstatus`)

Provides a global overview of the scheduler, typically used for admin monitoring.

**Key Response Data**:
* `scheduler_summary`: Current system load and health status.
* `all_tasks_summary`: Aggregate statistics for all running and queued tasks.

## 3. How It Works (SchedulerHandler)

1. **Cache Retrieval**: First checks Redis status cache for the `task_id`'s real-time progress.
2. **Queue Confirmation**: For queue metrics, calls Redis statistics commands (`XLEN`, `XPENDING`) to analyze Stream state.
3. **Metric Aggregation**: For global status requests, aggregates metrics from all active nodes into a system-level summary.

## 4. Quick Start

```python
from memos.api.client import MemOSClient
import time

client = MemOSClient(api_key="...", base_url="...")

# 1. System overview: Check overall MemOS health
global_res = client.get_all_scheduler_status()
if global_res:
    print(f"System overview: {global_res.data['scheduler_summary']}")

# 2. Queue monitoring: Check a user's task backlog
queue_res = client.get_task_queue_status(user_id="dev_user_01")
if queue_res:
    print(f"Pending tasks: {queue_res.data['remaining_tasks_count']}")
    print(f"Delivered but incomplete: {queue_res.data['pending_tasks_count']}")

# 3. Task progress: Poll until a specific task completes
task_id = "task_888999"
while True:
    res = client.get_task_status(user_id="dev_user_01", task_id=task_id)
    if res and res.code == 200:
        current_status = res.data[0]['status']
        print(f"Task {task_id} status: {current_status}")

        if current_status in ['completed', 'failed', 'cancelled']:
            break
    time.sleep(2)
```
