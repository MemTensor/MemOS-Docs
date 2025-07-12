---
title: MemOS 文档
desc: 欢迎来到 MemOS 官方文档 – 一个专为大型语言模型 (LLMs) 提供高级模块化记忆功能的 Python 包。
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

随着大型语言模型（LLMs）的不断演进，其所承担的任务日益复杂，包括多轮对话、规划、决策制定以及个性化代理等。在此背景下，如何高效管理和利用记忆，成为实现长期智能与适应性能力的关键因素。
然而，主流 LLM 架构往往在记忆结构化、管理和集成方面存在不足，导致知识更新成本高、行为状态不可持续以及难以积累用户偏好。

**MemOS** 通过将记忆重新定义为具有统一结构、生命周期管理和调度策略的核心一级资源来解决这些挑战。它提供了一个 Python 包，为基于 LLM 的应用程序提供统一的记忆层，实现持久化、结构化和高效的记忆操作。这使 LLMs 具备长期知识保留、强大的上下文管理和记忆增强推理能力，支持更智能和自适应的行为。

:Base64Image{src="/assets/memos-architecture.png" alt="MemOS Architecture"}

## 主要特性

- **模块化记忆架构**：支持明文、激活（KV cache）和参数（适配器/LoRA）记忆。
- **MemCube**：所有记忆类型的统一容器，易于加载/保存和 API 访问。
- **MOS**：LLMs 的记忆增强系统，具有即插即用的记忆模块。
- **基于图的后端**：原生支持 Neo4j 和其他图数据库，用于结构化、可解释的记忆。
- **易于集成**：与 HuggingFace、Ollama 和自定义 LLMs 兼容。
- **可扩展**：添加您自己的记忆模块或后端。


## 安装

```bash
pip install MemoryOS
```

要与 Ollama 一起使用：

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

对于基于 transformer 的模型，确保安装了 [PyTorch](https://pytorch.org/get-started/locally/)。

## 文档结构


- **概览**：项目结构和架构
- **示例**：逐步使用和代码示例
- **MOS**：LLMs 的记忆增强系统
- **MemCube**：统一记忆容器
- **记忆**：每种记忆类型的详细信息（明文、KV cache）
- **基本模块**：核心构建模块（例如，Neo4j 图数据库）
- **贡献**：如何贡献
- **故障排除**：网络和环境提示


使用导航侧边栏详细探索每个部分。

## 贡献

我们欢迎贡献！请参阅 [贡献指南](/contribution/overview) 了解设置环境和提交 pull request 的详细信息。

## 许可证

MemOS 在 Apache 2.0 许可证下发布。
