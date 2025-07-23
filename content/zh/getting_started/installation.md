---
title: "安装指南"
desc: "MemOS 完整安装指南。"
---

## 基础安装

安装 MemOS 最简单的方法是使用 pip：

```bash
pip install MemoryOS -U
```

有关详细的开发环境设置、工作流程指南和贡献最佳实践，请参阅我们的 [贡献指南](/contribution/overview)。

## 可选依赖

MemOS 为不同功能提供了多个可选依赖组。您可以根据需要进行安装。

| 功能       | 包名                      |
| ---------- | ------------------------- |
| 树形记忆   | `MemoryOS[tree-mem]`      |
| 记忆读取器 | `MemoryOS[mem-reader]`    |
| 记忆调度器 | `MemoryOS[mem-scheduler]` |

安装命令示例：

```bash
pip install MemoryOS[tree-mem]
pip install MemoryOS[tree-mem,mem-reader]
pip install MemoryOS[mem-scheduler]
pip install MemoryOS[tree-mem,mem-reader,mem-scheduler]
```

## 外部依赖

### Ollama 支持

要将 MemOS 与 [Ollama](https://ollama.com/) 一起使用，请先安装 Ollama CLI：

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Transformers 支持

要使用基于 `transformers` 库的功能，请确保已安装 [PyTorch](https://pytorch.org/get-started/locally/)（建议使用 CUDA 版本以实现 GPU 加速）。

### Neo4j 支持

::note
**Neo4j Desktop 要求**<br>如果您计划使用 Neo4j 作为图记忆，请安装 Neo4j Desktop（社区版支持即将推出！）
::

### 下载示例

要下载示例代码、数据和配置，请运行以下命令：

```bash
memos download_examples
```

## 验证安装

要验证您的安装，请运行：

```bash
pip show MemoryOS
python -c "import memos; print(memos.__version__)"
```
