---
title: "Installation Guide"
desc: "Complete installation guide for MemOS."
---

## Basic Installation

The simplest way to install MemOS is using pip:

```bash
pip install MemoryOS -U
```

For detailed development environment setup, workflow guidelines, and contribution best practices, please see our [Contribution Guide](/contribution/overview).

## Optional Dependencies

MemOS provides several optional dependency groups for different features. You can install them based on your needs.

| Feature          | Package Name              |
| ---------------- | ------------------------- |
| Tree Memory      | `MemoryOS[tree-mem]`      |
| Memory Reader    | `MemoryOS[mem-reader]`    |
| Memory Scheduler | `MemoryOS[mem-scheduler]` |

Example installation commands:

```bash
pip install MemoryOS[tree-mem]
pip install MemoryOS[tree-mem,mem-reader]
pip install MemoryOS[mem-scheduler]
pip install MemoryOS[tree-mem,mem-reader,mem-scheduler]
```

## External Dependencies

### Ollama Support

To use MemOS with [Ollama](https://ollama.com/), first install the Ollama CLI:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Transformers Support

To use functionalities based on the `transformers` library, ensure you have [PyTorch](https://pytorch.org/get-started/locally/) installed (CUDA version recommended for GPU acceleration).

### Neo4j Support

::note
**Neo4j Desktop Requirement**<br>If you plan to use Neo4j for graph memory, install Neo4j Desktop (community edition support coming soon!)
::

### Download Examples

To download example code, data and configurations, run the following command:

```bash
memos download_examples
```

## Verification

To verify your installation, run:

```bash
pip show MemoryOS
python -c "import memos; print(memos.__version__)"
```
