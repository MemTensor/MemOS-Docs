---
title: MemOS 文档
desc: Welcome to the official documentation for MemOS – a Python package designed to empower large language models (LLMs) with advanced, modular memory capabilities.
banner: https://statics.memtensor.com.cn/memos/memos-banner.gif
links:
  - label: 'PyPI'
    to: https://pypi.org/project/MemoryOS/
    target: _blank
    avatar:
      src: https://statics.memtensor.com.cn/icon/pypi.svg
      alt: PyPI logo
  - label: 'Open Source'
    to: https://github.com/MemTensor/MemOS
    target: _blank
    icon: i-simple-icons-github
---

## 什么是 MemOS？

随着大型语言模型（LLMs）不断发展以应对更高级的任务——如多轮对话、规划、决策制定和个性化代理等——它们管理和利用记忆的能力对于实现长期智能和适应性变得至关重要。然而，主流的 LLM 架构往往存在记忆结构化、管理和集成能力薄弱的问题，导致知识更新成本高、行为状态难以持续，以及难以积累用户偏好等问题。

**MemOS** 通过重新定义记忆为关键资源，提供统一的结构、生命周期管理和调度策略，解决了这些问题。它提供了一个 Python 包，为基于 LLM 的应用程序提供统一的记忆层，支持持久化、结构化和高效的记忆操作。这使 LLMs 能够实现长期知识保留、强大的上下文管理和记忆增强推理，支持更智能和适应性的行为。

:Base64Image{src="/assets/memos-architecture.png" alt="MemOS Architecture"}

## 主要功能

- **模块化记忆架构**：支持文本、激活（KV 缓存）和参数（适配器/LoRA）记忆。
- **MemCube**：所有记忆类型的统一容器，易于加载/保存和 API 访问。
- **MOS**：LLMs 的记忆增强聊天编排，具有即插即用的记忆模块。
- **基于图的后端**：原生支持 Neo4j 和其他图数据库，用于结构化、可解释的记忆。
- **易于集成**：与 HuggingFace、Ollama 和自定义 LLMs 兼容。
- **可扩展**：添加您自己的记忆模块或后端。

## 安装

```bash
pip install MemoryOS
```

使用 Ollama 时：

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

对于 transformer 模型，请确保已安装 [PyTorch](https://pytorch.org/get-started/locally/)。

## 文档结构

- **概览**：项目结构和架构
- **示例**：逐步使用和代码示例
- **MOS**：LLMs 的记忆增强编排
- **MemCube**：统一记忆容器
- **记忆**：每种记忆类型的详细信息（文本、树、KV 缓存）
- **基本模块**：核心构建块（例如，Neo4j 图数据库）
- **贡献**：如何贡献
- **故障排除**：网络和环境提示

使用导航侧边栏深入了解每个部分。

## 贡献

我们欢迎贡献！请参阅 [贡献指南](/contribution/overview) 了解设置环境并提交拉取请求的详细信息。

## 许可证

MemOS 在 Apache 2.0 许可证下发布。
