# Doc Agent 修复建议

## 问题
`content/cn/open_source/modules/memories/kv_cache_memory.md` 中的命令执行失败：
- `from memos.configs.memory import MemoryConfigFactory` → ModuleNotFoundError

## Root Cause
`outdated_command` - `memos` 模块的结构或名称在 v2.0 中可能已更改，导致无法找到该模块。

## 修复内容
- 将 `from memos.configs.memory import MemoryConfigFactory` 修改为正确的导入路径，以确保能够找到 `MemoryConfigFactory`。具体的导入路径需要根据最新的模块结构进行确认。

## 暂未自动应用，建议人工处理：

### `content/cn/open_source/modules/memories/kv_cache_memory.md` (mode=line_replace)

修复导入路径以解决模块未找到错误

未应用原因：find 在文件中出现 2 次，无法精确替换

**找到原文：**

```text
from memos.configs.memory import MemoryConfigFactory
```

**替换为：**

```text
from memos.memory_config import MemoryConfigFactory
```

> 本文件由 Doc Agent 自动生成，请人工 review 后决定是否采纳。
