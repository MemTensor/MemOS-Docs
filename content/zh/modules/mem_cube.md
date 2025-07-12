---
title: MemCube 概述
desc: "`MemCube` 是 MemOS 中的核心组织单元，专为封装和管理用户或代理的所有类型记忆而设计。它为加载、保存和操作多个记忆模块提供统一接口，使构建、共享和部署记忆增强应用程序变得容易。"
---
## 什么是 MemCube？

**MemCube** 是一个容器，捆绑了三种主要类型的记忆：

- **明文记忆** (例如，`GeneralTextMemory`、`TreeTextMemory`): 用于存储和检索非结构化或结构化文本知识。
- **激活记忆** (例如，`KVCacheMemory`): 用于存储键值缓存以加速 LLM 推理和上下文重用。
- **参数化记忆** (例如，`LoRAMemory`): 用于存储模型适应参数（如 LoRA 权重）。

每种记忆类型都是独立可配置的，可以根据需要进行交换或扩展。

## 结构

MemCube 由配置定义（参见 `GeneralMemCubeConfig`），该配置为每种记忆类型指定后端和配置。典型结构是：

```
MemCube
 ├── text_mem: TextualMemory
 ├── act_mem: ActivationMemory
 └── para_mem: ParametricMemory
```

所有记忆模块都可通过 MemCube 接口访问：
- `mem_cube.text_mem`
- `mem_cube.act_mem`
- `mem_cube.para_mem`

## API 总结 (`GeneralMemCube`)

### 初始化
```python
from memos.mem_cube.general import GeneralMemCube
mem_cube = GeneralMemCube(config)
```

### 核心方法
| 方法         | 描述                                      |
| --------------| ------------------------------------------------ |
| `load(dir)`   | 从目录加载所有记忆                |
| `dump(dir)`   | 将所有记忆保存到目录                  |
| `text_mem`    | 访问明文记忆模块                  |
| `act_mem`     | 访问激活记忆模块               |
| `para_mem`    | 访问参数化记忆模块               |
| `init_from_dir(dir)` | 从目录加载 MemCube            |
| `init_from_remote_repo(repo, base_url)` | 从远程仓库加载   |

## 文件存储

MemCube 目录包含：
- `config.json` (MemCube 配置)
- `textual_memory.json` (明文记忆)
- `activation_memory.pickle` (激活记忆)
- `parametric_memory.adapter` (参数化记忆)

## 使用示例

```python
from memos.mem_cube.general import GeneralMemCube
# 从本地目录加载
mem_cube = GeneralMemCube.init_from_dir("examples/data/mem_cube_2")
# 从远程仓库加载
mem_cube = GeneralMemCube.init_from_remote_repo("Ki-Seki/mem_cube_2")
# 访问并打印所有记忆
for item in mem_cube.text_mem.get_all():
    print(item)
for item in mem_cube.act_mem.get_all():
    print(item)
mem_cube.dump("tmp/mem_cube")
```

## 开发者说明

* MemCube 强制执行模式一致性以确保安全的加载/转储
* 每种记忆类型都是可插拔的且独立测试
* 参见 `/tests/mem_cube/` 了解集成测试和使用模式
