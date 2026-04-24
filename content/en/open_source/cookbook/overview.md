---
title: MemOS Scenario Examples
---

## Introduction

### Cookbook Philosophy: Problem-Oriented Approach

Welcome to the MemOS Cookbook! This is not a traditional technical documentation, but a hands-on guide focused on **solving real problems**.

**Why do we need this Cookbook?**

In AI application development, we often encounter these challenges:

- 🤔 "How can I make my AI application remember user preferences?"
- 🔍 "How can I quickly retrieve relevant information from a large number of documents?"
- 💡 "How can I build an intelligent assistant with long-term memory?"

Traditional documentation tells you **what it is**, API references tell you **how to call it**, while this Cookbook focuses on telling you **how to solve specific problems**.

**Core Philosophy of this Cookbook:**

1. **Problem-Driven**: Each recipe starts from a real use case scenario
2. **Practice-Oriented**: Provides complete code examples that can be run directly
3. **Progressive Learning**: From simple to complex, step by step
4. **Best Practices**: Incorporates experience and recommendations from production environments

---

## 📚 Complete Chapter Navigation

### [Chapter 1: Getting Started: Your First MemCube](/open_source/cookbook/chapter1/api)

**Core Skills**: Environment configuration, MemCube basic operations, data import and management

- **API Version**
  - **Recipe 1.1**: Configure MemOS Development Environment (API Version)
  - **Recipe 1.2**: Build a Simple MemCube from Documents (API Version)
  - **Recipe 1.3**: MemCube Basic Operations (API Version)
- **Ollama Version**
  - **Recipe 1.1**: Configure MemOS Development Environment (Ollama Version)
  - **Recipe 1.2**: Build a Simple MemCube from Documents (Ollama Version)
  - **Recipe 1.3**: MemCube Basic Operations (Ollama Version)

### [Chapter 2: Structured Memory: TreeNodeTextualMemoryMetadata](/open_source/cookbook/chapter2/api)

**Core Skills**: Structured memory, metadata management, multi-source tracking

- **API Version**
  - **Recipe 2.1**: Understanding Core Concepts of `TreeNodeTextualMemoryMetadata`
  - **Recipe 2.2**: Creating Basic Structured Memory (API Version)
  - **Recipe 2.3**: Common Field Descriptions and Configuration
- **Ollama Version**
  - **Recipe 2.1**: Understanding Core Concepts of `TreeNodeTextualMemoryMetadata`
  - **Recipe 2.2**: Creating Basic Structured Memory (Ollama Version)
  - **Recipe 2.3**: Common Field Descriptions and Configuration

### [Chapter 3: Building an Intelligent Novel Analysis System with MemOS](/open_source/cookbook/chapter3/overview)

**Core Skills**: Text preprocessing, AI-driven memory extraction, intelligent reasoning systems, creative application development

- **Recipe 3.0**: Text Preprocessing and API Environment Configuration
- **Recipe 3.1**: AI-Driven Character Recognition and Alias Unification
- **Recipe 3.2**: Structured Memory Content Extraction
- **Recipe 3.3**: Memory-Based Intelligent Reasoning System
- **Recipe 3.4**: Embedding Model Optimization Configuration
- **Recipe 3.5**: Memory Graph Structure Transformer
- **Recipe 3.6**: MemOS Integration and Query Validation
- **Creative Showcase**:
  - Intelligent World Timeline System
  - Dynamic Working Memory World Background
  - MemOS-Driven Interactive Text Game

### [Chapter 4: Using MemOS to Build a Production-Grade Knowledge Q&A System](/open_source/cookbook/chapter4/overview)

**Core Skills**: Concept graph construction, knowledge engineering, production deployment, small model enhancement

- **Phase 1: Building the foundational structure of domain knowledge - Concept graph expansion**
  - Seed concept acquisition: Extract core domain concepts from professional datasets
  - Iterative expansion: Automated concept graph extension based on LLM
  - Convergence and evaluation: Quantitative assessment of graph completeness
- **Phase 2: Generating applicable knowledge content - QA pair generation based on graphs**
  - Single concept knowledge generation: Generate in-depth Q&A for each concept node
  - Relational knowledge generation: Build complex logical associations between concepts
- **Phase 3: Building dynamic knowledge base - MemCube system deployment**
  - Neo4j graph database integration
  - MemOS system configuration and optimization
  - Production environment deployment best practices
- **Practical case**: Cardiovascular medicine domain knowledge Q&A system
- **Performance validation**: Small model vs large model professional capability comparison

---

## 🎯 Recommended Learning Paths

### 🟢 Beginner Path (Total 4-6 hours)

```
Chapter 1 (API or Ollama version) → Chapter 2 (corresponding version)
```

**For**: Developers new to MemOS
**Goal**: Master basic operations and structured memory

### 🟡 Intermediate Path (Total 8-12 hours)

```
Chapter 1 → Chapter 2 → Chapter 3 (Intelligent Novel Analysis System)
```

**For**: Developers with some AI development experience
**Goal**: Master complex text processing, AI-driven memory extraction and intelligent reasoning systems

### 🔴 Advanced Path (Total 15-25 hours)

```
Chapter 1 → Chapter 2 → Chapter 3 → Chapter 4 (Production-Grade Knowledge Q&A System)
```

**For**: Developers who want to build production-grade applications
**Goal**: Master knowledge engineering, concept graph construction and production deployment

### 🚀 Expert Path (Total 20-30 hours)

```
Complete learning of all chapters + creative extension practice + custom domain applications
```

**For**: AI architects and senior developers
**Goal**: Master all MemOS features and be able to design innovative AI memory systems

---

## How to Use This Cookbook Effectively

**📖 Reading Suggestions:**

- **Beginners**: Recommended to read in chapter order, practice each recipe hands-on
- **Experienced developers**: Can jump directly to recipes of interest
- **Problem solvers**: Use the directory above to quickly locate relevant recipes
- **Path learners**: Follow the learning paths above for systematic learning

**🛠️ Practice Suggestions:**

1. **Prepare environment**: Ensure Python 3.10+ and related dependencies are installed
2. **Hands-on practice**: Each recipe contains complete runnable code
3. **Experiment with variations**: Try modifying parameters to observe different effects
4. **Problem solving**: Check FAQ sections or seek community help when encountering issues

**🔧 Code Conventions:**

```python
# 💡 Tip: Important concepts or best practices
# ⚠️ Note: Items requiring special attention
# 🎯 Goal: Purpose of current step
```

---

## 🔧 Environment Preparation

### System Requirements

- Python 3.10+
- 8GB+ RAM (16GB recommended)
- 50GB+ available disk space

### Dependency Installation

```bash
pip install MemoryOS
# Optional: Neo4j, Ollama, OpenAI API
```

### Installation Verification

```python
import memos
print(f"MemOS Version: {memos.__version__}")
```

---

### Relationship with Other Documentation (Tutorials, API References, etc.)

**Documentation Ecosystem:**

- **🏁 Quick Start Tutorial**: Helps you get started with MemOS basic features in 5 minutes
- **📚 This Cookbook**: In-depth practical recipes to solve specific problems
- **📖 API Reference**: Detailed technical specifications of functions and classes
- **🏗️ Architecture Documentation**: System design and extension guides

**When to use which documentation:**

| Scenario | Recommended Documentation | Description |
| --- | --- | --- |
| New to MemOS | Quick Start Tutorial | Learn basic concepts and core features |
| Solving specific problems | **This Cookbook** | Find corresponding recipes and solutions |
| Looking up function usage | API Reference | View parameter and return value details |
| System design | Architecture Documentation | Understand internal mechanisms and extension methods |

---

## 📞 Getting Help

- **GitHub Issues**: Submit technical issues and bug reports at [MemOS Issues](https://github.com/MemTensor/MemOS/issues)
- **GitHub Discussions**: Exchange experiences and ask questions at [MemOS Discussions](https://github.com/MemTensor/MemOS/discussions)
- **Discord Community**: Join [MemOS Discord Server](https://discord.gg/Txbx3gebZR) for real-time communication
- **Official Documentation**: Check [MemOS Official Documentation](https://memos-docs.openmem.net/open_source/home/overview/) for detailed usage guides
- **API Reference**: Check [MemOS API Documentation](https://memos-docs.openmem.net/api-reference/search-memories/) for interface details
- **WeChat Group**: Scan [QR Code](https://statics.memtensor.com.cn/memos/qr-code.png) to join WeChat technical exchange group

---

*Let's start this exciting MemOS learning journey!* 