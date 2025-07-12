---
title: MemReader 入门
desc: 本指南将带您逐步了解如何使用 `SimpleStructMemReader`——借助大语言模型（LLMs）和嵌入模型，从对话和文档中提取结构化记忆。它非常适合用于构建具备记忆能力的对话式 AI、知识库和语义搜索系统。
---

##  初始化 `SimpleStructMemReader`

首先，使用您首选的 LLM 和嵌入器模型配置并初始化读取器。

### 示例：

```python
from memos.configs.mem_reader import SimpleStructMemReaderConfig
from memos.mem_reader.simple_struct import SimpleStructMemReader
reader_config = SimpleStructMemReaderConfig.from_json_file(
    "examples/data/config/simple_struct_reader_config.json"
)
reader = SimpleStructMemReader(reader_config)
```
::tip
您可以根据环境自定义模型名称或后端。
::
---

## 获取您的第一个聊天记忆

从用户和助手之间的对话中提取结构化记忆。

### 示例输入：

```python
conversation_data = [
    [
        {"role": "user", "content": "I have a meeting tomorrow at 3 PM"},
        {"role": "assistant", "content": "What's the meeting about?"},
        {"role": "user", "content": "It's about the Q4 project deadline"}
    ]
]
```

### 提取记忆：

```python
memories = reader.get_memory(
    conversation_data,
    type="chat",
    info={"user_id": "user_001", "session_id": "session_001"}
)
```

### 示例输出：

```json
[
    TextualMemoryItem(
        id='2d5965f9-4c9b-4c24-9068-325b53db098b',
        memory='Tomorrow at 3:00 PM, the user will meet with the Q4 project team to discuss the deadline.',
        metadata=TreeNodeTextualMemoryMetadata(
            user_id='user_001',
            session_id='session_001',
            status='activated',
            type='fact',
            confidence=0.99,
            tags=['deadline', 'project'],
            visibility=None,
            updated_at='2025-07-03T14:34:33.535844',
            memory_type='UserMemory',
            key='Meeting schedule',
            sources=[
                "user: I have a meeting tomorrow at 3 PM",
                "assistant: What's the meeting about?",
                "user: It's about the Q4 project deadline"
            ],
            embedding=[0.0058597163, ..., 0.009375607],
            created_at='2025-07-03T14:34:33.535860',
            usage=[],
            background="The user plans to meet with the Q4 project team tomorrow at 3:00 PM to address the project's deadline. This action reflects their proactive approach to managing project timelines and their focus on ensuring timely completion."
        )
    )
]
```
::note
读取器从对话会话中提取相关记忆和标签。
::
---

## 获取您的第一个文档记忆

处理文本文件以提取结构化摘要和标签。

### 示例代码：

```python
doc_paths = [
    "examples/mem_reader/text1.txt",
    "examples/mem_reader/text2.txt",
]

doc_memories = reader.get_memory(
    doc_paths,
    type="doc",
    info={
        "user_id": "user_001",
        "session_id": "session_001",
        "chunk_size": 512,
        "chunk_overlap": 128
    }
)
```

### 示例输出：

```json
[
    TextualMemoryItem(
        id='24dabd9f-200b-40c4-84cc-2c0fccaaf8fd',
        memory='This is another sample document content for testing purposes.',
        metadata=TreeNodeTextualMemoryMetadata(
            user_id='user_001',
            session_id='session_001',
            status='activated',
            type='fact',
            memory_time=None,
            source=None,
            confidence=0.99,
            entities=None,
            tags=['Testing', 'Sample'],
            visibility=None,
            updated_at='2025-07-03T14:38:29.776147',
            memory_type='LongTermMemory',
            key='',
            sources=['examples/mem_reader/text2.txt_0'],
            embedding=[0.028731367, ..., -0.018501928],
            created_at='2025-07-03T14:38:29.776213',
            usage=[],
            background=''
        )
    )
]
```
::note
文档被分块和摘要以创建可搜索的知识项。
::

### 支持的文件

我们使用 [`markitdown`](https://github.com/microsoft/markitdown) 将文件转换为 Markdown 格式文本。

**MarkItDown 目前支持从以下格式转换：**  

```
PDF  
PowerPoint  
Word  
Excel  
Images (EXIF metadata and OCR)  
Audio (EXIF metadata and speech transcription)  
HTML  
Text-based formats (CSV, JSON, XML)  
ZIP files (iterates over contents)  
YouTube URLs  
EPUBs  
... and more!
```
*(内容来源于 [MarkItDown GitHub 仓库](https://github.com/microsoft/markitdown))*

---


## 试试看：打印提取的记忆

```python
for memory_list in memories:
    for memory_item in memory_list:
        print("🧠 Memory:", memory_item.memory)
        print("🏷 Tags:", memory_item.metadata.tags)
        print("👤 User ID:", memory_item.metadata.user_id)
        print("📅 Created At:", memory_item.metadata.created_at)
        print("---")
```

---

您现在已成功：
- 初始化了 `SimpleStructMemReader`
- 从聊天对话中提取了结构化记忆
- 从文档中提取了知识
