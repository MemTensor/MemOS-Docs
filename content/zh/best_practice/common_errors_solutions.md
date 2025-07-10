---
title: 常见错误与解决方案
---

## 配置错误

### 缺失必要字段

```python
# ✅ 始终包含必填字段
llm_config = {
    "backend": "openai",
    "config": {
        "api_key": "your-api-key",
        "model_name_or_path": "gpt-4"
    }
}
````

### 后端类型不匹配

```python
# ✅ KVCache 需要使用 HuggingFace 后端
kv_config = {
    "backend": "kv_cache",
    "config": {
        "extractor_llm": {
            "backend": "huggingface",
            "config": {
                "model_name_or_path": "Qwen/Qwen3-1.7B"
            }
        }
    }
}
```

## 服务连接问题

```bash
# 启动所需服务
docker run -p 6333:6333 qdrant/qdrant
ollama serve
```

## 内存问题

### 加载失败

```python
try:
    mem_cube.load("memory_dir")
except Exception:
    mem_cube = GeneralMemCube(config)
    mem_cube.dump("memory_dir")
```

### GPU 显存不足

```python
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "0"
# 若 GPU 显存不足，可使用较小的模型，例如：Qwen/Qwen3-0.6B
```

## 用户管理

```python
# 先注册用户
mos.register_mem_cube(cube_path="path", user_id="user_id", cube_id="cube_id")

# 检查用户是否已存在
try:
    user_id = mos.create_user(user_name="john", role=UserRole.USER)
except ValueError:
    user = mos.user_manager.get_user_by_name("john")
```
