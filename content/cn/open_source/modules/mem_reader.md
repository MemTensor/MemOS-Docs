---
title: "MemReader: 记忆读取与解析"
desc: "`MemReader` 是 MemOS 的“明文记忆生产器”：把对话 / 文档 / 多模态输入规范化、切窗/切块，并产出带 embedding 与溯源信息的 `TextualMemoryItem`，用于写入 TextualMemory 与后续检索。"
---

## 什么是 MemReader？

在 MemOS 架构中，**MemReader（记忆读取器）** 负责把“原始输入”转换为“可检索、可追溯的结构化记忆”。

> **核心流程**：原始输入（scene_data） → 归一化（normalize） → 切窗/分块（window/chunk） →（可选）LLM 抽取/总结 → 生成 `TextualMemoryItem[]`（含 embedding / tags / sources / background）。

### MemReader 在系统中的位置

MemOS 的明文记忆生产流水线可以理解为：

```
原始输入(scene_data)
   ↓  (MemReader)
TextualMemoryItem[]（embedding/tags/sources/background）
   ↓  (写入 TextualMemory / 触发 Scheduler 等)
后续检索 / 重写 / 反馈 / 任务调度
```

在代码里，MemOS Core 通过 `MemReaderFactory` 创建实例，并在 add-memory / scheduler 等流程中调用（见 `src/memos/mem_os/core.py`）。

---

## 主要能力

- **多后端支持**：通过 `backend` 选择不同的 Reader 实现（simple / multimodal / strategy）。
- **两种模式**：
  - **Fast**：不调用 LLM，主要进行“窗口化 + embedding”，适合低延迟、短期上下文快照。
  - **Fine**：调用 LLM 抽取结构化记忆 + summary/background，适合长期记忆写入。
- **溯源 (Provenance)**：输出的 `metadata.sources` 记录来源（对话消息、文档路径、文件信息、图片 URL 等）。
- **Fine Transfer**：对已有的粗记忆（例如 fast 产物）进行二次精炼。

如果您“既要兼容未来多模态，又不想被输入格式限制”，优先使用 `MultiModalStructMemReader`。
如果您只进行**纯文本对话/本地文档**抽取，`SimpleStructMemReader` 更为直接。

---

## 结构

MemReader 相关代码主要分为三层：

1. **配置层**：定义后端选择与参数结构（LLM / Embedder / Chunker / 额外参数）。
2. **Reader 层**：实现从 scene_data → memory items 的抽取逻辑。
3. **多模态解析层** (`read_multi_modal/`)：将 role 消息 / content parts / file / image 等统一解析为可处理的中间表示，并为 transfer 提供“来源级抽取”。

核心代码目录：

```
src/memos/
 ├── configs/mem_reader.py               # MemReaderConfigFactory + 各 Reader Config
 ├── mem_reader/
 │    ├── base.py                        # BaseMemReader 抽象接口
 │    ├── factory.py                     # MemReaderFactory：按 backend 创建 Reader
 │    ├── simple_struct.py               # SimpleStructMemReader：对话/文档抽取（文本为主）
 │    ├── multi_modal_struct.py          # MultiModalStructMemReader：多模态增强版本
 │    ├── strategy_struct.py             # StrategyStructMemReader：策略版本（当前实现不完整）
 │    └── read_multi_modal/              # MultiModalParser + 各 role/type parser
 └── templates/
      ├── mem_reader_prompts.py          # chat/doc/general_string 抽取 prompts
      └── tool_mem_prompts.py            # tool trajectory 抽取 prompts

examples/mem_reader/
 ├── runners/                            # 可直接运行的示例入口（run_simple / run_multimodal）
 ├── samples.py                          # 多类输入样例（chat / multimodal / file-url 等）
 ├── parser_demos/                       # 单个 parser 的演示脚本
 └── text1.txt, text2.txt                # doc reader 示例用本地文本
```

---

## 选择哪个 Reader？

| backend             | 对应实现                        | 推荐场景                                              | 关键限制/备注                                                     |
| ------------------- | --------------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| `simple_struct`     | `SimpleStructMemReader`     | 纯文本对话抽取、**本地文档**抽取                                | chat 只接受 `content: str`（多模态 content list 会被跳过）；doc fast 不支持 |
| `multimodal_struct` | `MultiModalStructMemReader` | 多模态输入（file/image/tool schema/trajectory）与更通用的输入形态 | image 在 **fast** 模式不会产出 item；file 的 fine 目前主要支持 **URL 下载**  |
| `strategy_struct`   | `StrategyStructMemReader`   | 实验性策略提示词版本                                        | 当前代码存在未修复问题（见文末“常见问题”）                                       |

---

## API 总结

### 统一入口：`MemReaderFactory`

**路径：** `src/memos/mem_reader/factory.py`

- `MemReaderConfigFactory.backend` 决定创建哪个 Reader。
- 映射关系：
  - `"simple_struct"` → `SimpleStructMemReader`
  - `"multimodal_struct"` → `MultiModalStructMemReader`
  - `"strategy_struct"` → `StrategyStructMemReader`

最常见用法：

```python
from memos.configs.mem_reader import MemReaderConfigFactory
from memos.mem_reader.factory import MemReaderFactory

cfg = MemReaderConfigFactory.model_validate({...})
reader = MemReaderFactory.from_config(cfg)
```

### 核心方法：`get_memory(...)`

> 实际生产中强烈建议您**显式传入 `mode`**，不要依赖默认值。

- **作用**：从输入场景提取记忆
- **签名（以实现类为准）**：`get_memory(scene_data, type, info, mode="fine")`
- **关键参数**：
  - `scene_data`：输入场景（支持多种形态，见下节）
  - `type`：惯例使用 `"chat"` / `"doc"`（主要影响 doc 的归一化）
  - `info`：至少包含 `user_id` / `session_id`（可选 `custom_tags`）
  - `mode`：`"fast"` 或 `"fine"`
- **返回**：`list[list[TextualMemoryItem]]`
  外层 list 是“按内部切窗后的分组”；内层 list 是该窗口抽取出的 memory items。

### Fine Transfer：`fine_transfer_simple_mem(...)`

- **作用**：对已有 memory items 进行二次精炼（典型：先 fast 写入，再 transfer 为结构化）
- **实现差异**：
  - `SimpleStructMemReader.fine_transfer_simple_mem(input_memories: list[TextualMemoryItem], type: str, custom_tags: list[str] | None = None)`
  - `MultiModalStructMemReader.fine_transfer_simple_mem(...)` 会走多模态的 transfer 流程

`BaseMemReader` 中的抽象签名与具体实现存在差异（尤其是 `input_memories` 的嵌套层级）。编写业务代码时请以您实际使用的 Reader 实现为准。

---

## 输入与输出

### 输入：scene_data 支持哪些形态？

`scene_data` 会先经过 `coerce_scene_data(...)` 进行归一化（`src/memos/mem_reader/read_multi_modal/utils.py`），核心类型来自 `memos.types.MessagesType`：

- `str`：纯文本
- `MessageList`：role 消息列表 (`{"role", "content", ...}`)
- `RawMessageList`：content parts 列表 (`{"type": "text" | "file" | "image_url", ...}`)

同时实现层还兼容 legacy 形态（尤其是 `list[list[dict]]` 作为 chat scenes）。

对外接入时，最稳健的做法是将输入组织成「**scenes 列表**」：

- chat: `list[list[{"role", "content"}]]`
- doc: `list[str]`（本地路径或文本）
- multimodal: `list[list[{"role", "content": [...parts...]}]]`

### 输出：`TextualMemoryItem`

**路径：** `src/memos/memories/textual/item.py`

- `TextualMemoryItem.memory`：可检索的记忆文本
- `TextualMemoryItem.metadata` (`TreeNodeTextualMemoryMetadata`) 关键字段：
  - `user_id`, `session_id`
  - `memory_type`: `LongTermMemory` / `UserMemory` / `ToolSchemaMemory` / `ToolTrajectoryMemory` 等
  - `tags`: 如 `mode:fast`、语言等
  - `embedding`
  - `sources`: 溯源（会被自动规整为 `SourceMessage`）
  - `background`: fine 模式下常来自 LLM summary

---

## 实现概览

这一节简述“对开发者最重要的行为”，避免过度展开源码细节。

### SimpleStructMemReader 如何处理 chat？

**核心点**：文本对话 → 切窗 → fast/fine。

- **输入要求**：chat 场景里的每条消息必须是 `{"role": "...", "content": "..."}`（`content` 必须是字符串）。
- **切窗策略**：
  - 先按消息条数切：每窗最多 10 条，重叠 2 条 (`get_scene_data_info`)
  - 再按 token 滑窗：`chat_window_max_tokens`（默认 1024），overlap 默认 200 tokens (`_iter_chat_windows`)
- **fast 模式**：
  - 每个 token window 生成一个 memory item
  - embedding 对 window 文本计算
- **fine 模式**：
  - 每个 token window 调用 LLM，按 prompt 输出结构化 JSON
  - 将 `"长期记忆"/"用户记忆"` 映射到 `LongTermMemory`/`UserMemory`
  - `background` 使用 summary 字段

`SimpleStructMemReader` 对“多模态 content (`list[parts]`)”并不友好：如果 `content` 不是字符串会直接跳过该消息。多模态请使用 `MultiModalStructMemReader`。

### SimpleStructMemReader 如何处理 doc？

- doc 输入最终会被归一化为 `RawMessageList`，且**每个 scene 长度必须为 1**：
  - `[{ "type": "file", "file": {"filename": "...", "file_data": "..."} }]`
  - 或 `[{ "type": "text", "text": "..." }]`
- **只支持 fine**：`mode="fast"` 会抛出 `NotImplementedError`
- 基本流程：合并文本 → `chunker.chunk(...)` → 对每个 chunk 调用 LLM → 生成 memory items

doc reader 代码中按 `chunk.text` 获取内容，因此如果您将 chunker 切换成返回 `list[str]` 的实现，可能需要额外适配。

### MultiModalStructMemReader 做了什么增强？

MultiModalStruct 的思路是：**先用 fast 把输入变成“带 sources 的可读文本片段”，再在 fine 模式做更深的抽取与来源级 transfer。**

- **fast 模式**：
  - 通过 `MultiModalParser` 解析 role/type 消息
  - 聚合成 token 窗口（逻辑与 SimpleStruct 的滑窗类似）
  - 为聚合窗口批量计算 embedding
- **fine 模式**（在 fast 的基础上追加三件事）：
  1. **对聚合后的文本再调一次 LLM**（`chat` 或 `general_string` prompt）
  2. **抽取 Tool Trajectory**（见 `templates/tool_mem_prompts.py`）
  3. **对 sources 做 transfer**（system/file/image 等来源级抽取）

当前实现里：

- `ImageParser.parse_fast()` 会返回空列表（也就是说图片不会在 fast 阶段产生 item）。
- `FileContentParser.parse_fine()` 主要支持 **URL 下载**；本地路径 / base64 / 纯文本 file_data 的 fine 逻辑仍是 TODO 分支。
- `audio` 类型 parser 目前是占位（不会产出有效结果）。

---

## 配置 (Config)

**路径：** `src/memos/configs/mem_reader.py`

- 顶层：`MemReaderConfigFactory` (`backend` + `config`)
- 具体后端 config：
  - `SimpleStructMemReaderConfig`
  - `MultiModalStructMemReaderConfig`
  - `StrategyStructMemReaderConfig`

共同核心字段：

- `llm`: `LLMConfigFactory`
- `embedder`: `EmbedderConfigFactory`
- `chunker`: `ChunkerConfigFactory`
- `remove_prompt_example`: 是否移除 prompt 示例（影响 few-shot）
- （可选）`chat_window_max_tokens`：控制滑窗大小（Simple/MultiModal 会读取此字段；未配置则默认 1024）
- MultiModal 专属：
  - `direct_markdown_hostnames`：URL host 白名单，命中后将响应体当作 markdown 直接读取（并可启用 markdown 图片抽取）

---

## 使用示例

> 这一节的示例代码已按当前仓库的 `examples/mem_reader/` 结构修正。

### 1、初始化 SimpleStructMemReader

```python
from memos.configs.mem_reader import SimpleStructMemReaderConfig
from memos.mem_reader.simple_struct import SimpleStructMemReader

cfg = SimpleStructMemReaderConfig.from_json_file(
    "examples/data/config/simple_struct_reader_config.json"
)
reader = SimpleStructMemReader(cfg)
```

### 2、 抽取第一段 chat 记忆 (SimpleStruct)

```python
conversation = [
    [
        {"role": "user", "content": "我明天下午 3 点有个会"},
        {"role": "assistant", "content": "会议主题是什么？"},
        {"role": "user", "content": "讨论 Q4 项目截止日期"},
    ]
]

memories = reader.get_memory(
    conversation,
    type="chat",
    mode="fine",
    info={
        "user_id": "user_001",
        "session_id": "session_001",
        # 可选：会被 pop，只用于 fine prompt
        "custom_tags": ["project:q4"],
    },
)
```

如果您希望低延迟先写“快照”，请设置 `mode="fast"`；后续再用 Fine Transfer 精炼（见下一个示例）。

### 3、 Fine Transfer：把 fast 产物二次精炼 (SimpleStruct)

```python
info = {"user_id": "user_001", "session_id": "session_001"}

fast_groups = reader.get_memory(conversation, type="chat", mode="fast", info=info.copy())
fast_items = [item for group in fast_groups for item in group]

refined_groups = reader.fine_transfer_simple_mem(
    fast_items,
    type="chat",
    custom_tags=["refine"],
)
```

### 4、 文档抽取 (SimpleStruct, fine only)

```python
docs = [
    "examples/mem_reader/text1.txt",
    "examples/mem_reader/text2.txt",
]

memories = reader.get_memory(
    docs,
    type="doc",
    mode="fine",
    info={"user_id": "user_001", "session_id": "session_001"},
)
```

### 5、 多模态抽取 

仓库里提供了直接可运行的 Runner（推荐先跑它看行为）：

```bash
python examples/mem_reader/runners/run_multimodal.py --example multimodal --mode fine
```

如果您想在代码里快速复用示例的初始化方式：

```python
from examples.mem_reader.builders import build_multimodal_reader

reader = build_multimodal_reader()

scene_data = [
    [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "请总结文件要点，并描述图片内容。"},
                {
                    "type": "file",
                    "file": {
                        "filename": "README.md",
                        "file_data": "https://raw.githubusercontent.com/run-llama/llama_index/main/README.md",
                    },
                },
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/demo.png"},
                },
            ],
            "chat_time": "2025-11-24T10:21:00Z",
            "message_id": "mm-1",
        }
    ]
]

memories = reader.get_memory(
    scene_data,
    type="chat",
    mode="fine",
    info={"user_id": "user_001", "session_id": "session_001"},
)
```

- 图片抽取走 `ImageParser.parse_fine()`，需要您的 LLM 后端支持图像输入格式（否则会报错并跳过）。
- file 的 fine 抽取目前对 **URL** 支持最好（`file_data` 可以是 `http(s)://...` 或 `@http(s)://...`，`@` 会被剥离）。


