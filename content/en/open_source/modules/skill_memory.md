---
title: "Skill Memory"
desc: "Skill Memory automatically distills reusable methodologies from conversations — turning fragmented chat interactions into structured, executable skill packages that agents can invoke in future tasks."
---

## 1. Overview

**Skill Memory** bridges the gap between static memory (facts, preferences) and dynamic action. While standard textual memories store _what happened_, Skill Memory extracts _how things were done_ — capturing procedures, tools, scripts, and user preferences into portable packages.

When MemOS processes a conversation via `add_message`, the Skill Memory pipeline can:

1. **Chunk** the conversation into distinct task segments (e.g., "Travel Planning", "Code Review")
2. **Recall** existing skills related to each task from the memory store
3. **Extract** a generalized skill template from the conversation, or **update** an existing one
4. **Generate** supporting artifacts: executable Python scripts, tool schemas, reference documents
5. **Package** everything into a downloadable `.zip` skill file (stored locally or on OSS)

Each extracted skill is stored as a `TextualMemoryItem` with `memory_type="SkillMemory"`, making it searchable and retrievable alongside other memories.

---

## 2. Architecture

The Skill Memory pipeline is implemented in `memos/mem_reader/read_skill_memory/process_skill_memory.py` and orchestrated by the main entry point:

```
process_skill_memory_fine(fast_memory_items, info, searcher, llm, embedder, ...)
```

### Processing Pipeline

```
Input: fast_memory_items (from MemReader)
        │
        ▼
┌─────────────────────┐
│ Reconstruct Messages │  ← Flatten source messages from memory items
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Task Chunking (LLM) │  ← Split conversation into independent task segments
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Recall Related      │  ← Search existing SkillMemory items per task
│  Skills (parallel)   │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Extract Skills (LLM)│  ← Generate or update skill schemas (parallel)
└─────────┬───────────┘
          ▼
┌─────────────────────────┐
│  Generate Details (LLM)  │  ← Scripts, tool schemas, reference docs (parallel)
│  (only in full mode)     │
└─────────┬───────────────┘
          ▼
┌─────────────────────┐
│  Write & Package     │  ← Create SKILL.md + scripts/ + reference/ → .zip
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Upload (Local/OSS)  │  ← Store the .zip and attach URL to memory item
└─────────┬───────────┘
          ▼
Output: list[TextualMemoryItem] with memory_type="SkillMemory"
```

All LLM-driven stages run in **parallel** using `ContextThreadPoolExecutor` (up to 5 workers per stage).

---

## 3. Skill Schema

Each extracted skill follows a structured JSON schema. The LLM is prompted to produce:

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | `str` | Generic skill name (e.g., "Travel Itinerary Planning", "Code Review Workflow") |
| `description` | `str` | What the skill accomplishes and its scope |
| `trigger` | `list[str]` | Keywords that should activate this skill during recall |
| `procedure` | `str` | Step-by-step process, abstract and reusable |
| `experience` | `list[str]` | General lessons, principles, error handling strategies |
| `preference` | `list[str]` | User's overarching preference patterns |
| `examples` | `list[str]` | Complete output templates showing deliverable format (markdown) |
| `scripts` | `dict` | Python scripts as `{"filename.py": "code..."}`, or `null` |
| `tool` | `list[str]` | External tools needed (websearch, APIs), or `null` |
| `others` | `dict` | Reference documents as `{"reference.md": "content..."}`, or `null` |
| `update` | `bool` | `true` if updating an existing skill, `false` if new |
| `old_memory_id` | `str` | ID of the skill being updated (empty if new) |

### Update vs. Create Logic

The pipeline checks existing skills for topic overlap:

- If a similar skill exists (same theme) → set `update: true` and `old_memory_id` to merge into the existing skill
- If no match → create a new skill entry

This prevents skill proliferation (e.g., "Keto Diet Planning" when "Dietary Planning" already exists).

---

## 4. Skill File Output

Each skill is packaged into a directory and zipped:

```
skill_name/
├── SKILL.md           # Main skill document with frontmatter
├── scripts/           # Generated Python scripts (optional)
│   ├── main_task.py
│   └── utils.py
└── reference/         # Supplementary markdown docs (optional)
    └── best_practices.md
```

### SKILL.md Format

```markdown
---
name: travel_itinerary_planning
description: A reusable methodology for planning travel itineraries
---

## Trigger
travel, trip, itinerary, vacation

## Procedure
1. Gather destination preferences and constraints
2. Research transportation and accommodation options
3. Build day-by-day schedule with activities
...

## Experience
1. Always check visa requirements before booking
2. Buffer time between activities for unexpected delays

## User Preferences
- Prefers cultural attractions over tourist traps
- Budget-conscious, values mid-range hotels

## Examples
### Example 1
(markdown template of a complete travel itinerary)

## Scripts
- `./scripts/budget_calculator.py`

## Tool Usage
websearch for real-time pricing
```

---

## 5. Extraction Modes

The pipeline supports two extraction strategies, controlled by the `complete_skill_memory` parameter:

### Simple Extract (`complete_skill_memory=False`)

Single-stage LLM extraction. Produces the core skill schema (name, description, procedure, experience, preference, examples) without generating scripts, tools, or reference documents. Faster but less complete.

### Full Extract (`complete_skill_memory=True`, default)

Two-stage pipeline:

1. **Stage 1 — Batch Extract Skills**: Extract base skill structures from all task chunks in parallel
2. **Stage 2 — Batch Generate Details**: For each extracted skill, generate scripts (via `SCRIPT_GENERATION_PROMPT`), identify tools (via `TOOL_GENERATION_PROMPT`), and create reference docs (via `OTHERS_GENERATION_PROMPT`) in parallel

---

## 6. Configuration

Skill Memory is configured through the `MemReaderConfigFactory`. Key config fields:

### Storage Backend

Set via the `SKILLS_REPO_BACKEND` environment variable:

| Value | Description |
| :--- | :--- |
| `LOCAL` | Store skill packages on the local filesystem (default) |
| `OSS` | Upload to Alibaba Cloud OSS |

### skills_dir_config (in MemReader config)

```python
{
    "skills_local_tmp_dir": "/tmp/memos_skills",      # Temp directory for building packages
    "skills_local_dir": "/data/memos_skills",          # Permanent local storage
    "skills_oss_dir": "skills/"                        # OSS prefix path (OSS mode only)
}
```

### Environment Variables

| Variable | Description |
| :--- | :--- |
| `SKILLS_REPO_BACKEND` | `LOCAL` or `OSS` — where to store skill packages |
| `SKILLS_LLM` | Optional: override the default LLM model for skill extraction |
| `OSS_REGION` | Alibaba Cloud OSS region (OSS mode) |
| `OSS_ENDPOINT` | OSS endpoint URL (OSS mode) |
| `OSS_BUCKET_NAME` | OSS bucket name (OSS mode) |

---

## 7. Bilingual Support

The pipeline automatically detects the conversation language and selects the appropriate prompt templates:

- **English conversations** → English extraction and generation prompts
- **Chinese conversations** → Chinese prompts (suffixed with `_ZH`)

Language detection is handled by `detect_lang()` from the multimodal reader module.

---

## 8. Integration with MemOS

Skill Memory items are stored as standard `TextualMemoryItem` objects with special metadata:

```python
metadata = TreeNodeTextualMemoryMetadata(
    memory_type="SkillMemory",
    type="skills",
    name="Travel Itinerary Planning",
    description="...",
    procedure="...",
    experience=[...],
    preference=[...],
    examples=[...],
    scripts={...},
    others={...},
    url="https://..."  # Link to the downloadable .zip package
)
```

These items are:
- **Searchable** via the standard `search_memory` API (they participate in semantic recall)
- **Retrievable** by ID via `get_memory`
- **Used during recall**: When processing a new conversation, the pipeline recalls related SkillMemory items to decide whether to update an existing skill or create a new one
