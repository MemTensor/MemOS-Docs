---
title: "MemScheduler: The Scheduler for Memory Organization"
desc: "`MemScheduler` is a concurrent memory management system parallel running with the MemOS system, which coordinates memory operations between working memory, long-term memory, and activation memory in AI systems. It handles memory retrieval, updates, and compaction through event-driven scheduling. <br/> This system is particularly suited for conversational agents and reasoning systems requiring dynamic memory management."
---
# Memory Scheduler Overview

![Memory Management](https://img.shields.io/badge/Component-Memory_Management-blue)
![Event-Driven](https://img.shields.io/badge/Architecture-Event_Driven-green)

`MemScheduler` is a concurrent memory management system that works in parallel with MemOS, coordinating memory operations across working memory, long-term memory, and activation memory in AI systems. Designed for conversational agents and reasoning systems, it provides dynamic memory management through event-driven scheduling.

## Key Features

- 🚀 **Concurrent operation** with MemOS system
- 🧠 **Multi-memory coordination** (Working/Long-Term/User memory)
- ⚡ **Event-driven scheduling** for memory operations
- 🔍 **Efficient retrieval** of relevant memory items
- 📊 **Comprehensive monitoring** of memory usage
- 📝 **Detailed logging** for debugging and analysis
- 
## Memory Scheduler Architecture

The `MemScheduler` system is structured around several key components:

1. **Message Handling**: Processes incoming messages through a dispatcher with labeled handlers
2. **Memory Management**: Manages different memory types (Working, Long-Term, User)
3. **Retrieval System**: Efficiently retrieves relevant memory items based on context
4. **Monitoring**: Tracks memory usage, frequencies, and triggers updates
5. **Dispatcher (Router)**: Trigger different memory reorganization strategies by checking messages from MemOS systems.
6. **Logging**: Maintains logs of memory operations for debugging and analysis

## Message Processing

The scheduler processes messages through a dispatcher with dedicated handlers:

### Message Types

| Message Type | Handler Method                  | Description                                |
|--------------|---------------------------------|--------------------------------------------|
| `QUERY_LABEL` | `_query_message_consume`       | Handles user queries and triggers retrieval |
| `ANSWER_LABEL`| `_answer_message_consume`      | Processes answers and updates memory usage |

### Schedule Message Structure 

The scheduler processes messages from its queue using the following format:

ScheduleMessageItem:

| Field         | Type                 | Description                                   |
|---------------|----------------------|-----------------------------------------------|
| `item_id`     | `str`                | UUID (auto-generated) for unique identification |
| `user_id`     | `str`                | Identifier for the associated user            |
| `mem_cube_id` | `str`                | Identifier for the memory cube                |
| `label`       | `str`                | Message label (e.g., `QUERY_LABEL`, `ANSWER_LABEL`) |
| `mem_cube`    | `GeneralMemCube｜str` | Memory cube object or reference               |
| `content`     | `str`                | Message content                               |
| `timestamp`   | `datetime`           | Time when the message was submitted           |


Meanwhile the scheduler will send the scheduling messages by following structures.

ScheduleLogForWebItem:

| Field                  | Type               | Description                                                                 | Default Value                          |
|------------------------|--------------------|-----------------------------------------------------------------------------|----------------------------------------|
| `item_id`              | `str`              | Unique log entry identifier (UUIDv4)                                        | Auto-generated (`uuid4()`)             |
| `user_id`              | `str`              | Associated user identifier                                                  | (Required)                             |
| `mem_cube_id`          | `str`              | Linked memory cube ID                                                       | (Required)                             |
| `label`                | `str`              | Log category identifier                                                     | (Required)                             |
| `from_memory_type`     | `str`              | Source memory partition<br>Possible values:<br>- `"LongTermMemory"`<br>- `"UserMemory"`<br>- `"WorkingMemory"` | (Required)                             |
| `to_memory_type`       | `str`              | Destination memory partition                                                | (Required)                             |
| `log_content`          | `str`              | Detailed log message                                                        | (Required)                             |
| `current_memory_sizes` | `MemorySizes`      | Current memory utilization                                                  | <pre>DEFAULT_MEMORY_SIZES = {<br>  "long_term_memory_size": -1,<br>  "user_memory_size": -1,<br>  "working_memory_size": -1,<br>  "transformed_act_memory_size": -1<br>}</pre> |
| `memory_capacities`    | `MemoryCapacities` | Memory partition limits                                                     | <pre>DEFAULT_MEMORY_CAPACITIES = {<br>  "long_term_memory_capacity": 10000,<br>  "user_memory_capacity": 10000,<br>  "working_memory_capacity": 20,<br>  "transformed_act_memory_capacity": -1<br>}</pre> |
| `timestamp`            | `datetime`         | Log creation time                                                           | Auto-set (`datetime.now`)              |

##  Execution Example

`examples/mem_scheduler/schedule_w_memos.py` is a demonstration script showcasing how to utilize the `MemScheduler` module. It illustrates memory management and retrieval within conversational contexts.

### Code Functionality Overview

This script demonstrates two methods for initializing and using the memory scheduler:

1. **Automatic Initialization**: Configures the scheduler via configuration files
2. **Manual Initialization**: Explicitly creates and configures scheduler components

The script simulates a pet-related conversation between a user and an assistant, demonstrating how memory scheduler manages conversation history and retrieves relevant information.

### Core Code Structure

```python
def init_task():
    # Initialize sample conversations and questions
    conversations = [
        {"role": "user", "content": "I just adopted a golden retriever puppy yesterday."},
        {"role": "assistant", "content": "Congratulations! What did you name your new puppy?"},
        # More conversations...
    ]

    questions = [
        {"question": "What's my dog's name again?", "category": "Pet"},
        # More questions...
    ]
    return conversations, questions

def run_with_automatic_scheduler_init():
    # Automatic initialization: Load configuration from YAML files
    # Create user and memory cube
    # Add conversations to memory
    # Process user queries and display answers
    # Show web logs

def run_with_manual_scheduler_init():
    # Manual initialization: Explicitly create and configure scheduler components
    # Initialize MemOS, user, and memory cube
    # Manually submit messages to the scheduler
    # Process user queries and display answers
    # Show web logs

if __name__ == '__main__':
    # Run both initialization methods sequentially
    run_with_automatic_scheduler_init()
    run_with_manual_scheduler_init()
```
