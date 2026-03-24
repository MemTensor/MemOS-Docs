---
title: 记忆召回的二次过滤
---
## 云插件

MemOS Openclaw 云插件支持使用指定的大语言模型对召回的记忆进行二次精准过滤。过滤后，只有与当前任务高度相关的记忆才会被注入到上下文中，有效避免无关记忆的干扰并节省 Token。

### 如何使用

只需配置兼容 OpenAI 格式的模型接口（如本地 Ollama 或第三方大模型 API）并开启过滤开关，即可启用记忆二次过滤功能。

#### 1. 开启记忆过滤功能

在配置大模型过滤记忆时，**必须**配置 API Key 和 Base URL。

在 `openclaw.json` 配置中添加：
```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": {
        "config": {
          "recallFilterEnabled": true,
          "recallFilterBaseUrl": "http://127.0.0.1:11434/v1",
          "recallFilterApiKey": "sk-...",
          "recallFilterModel": "qwen2.5_7b"
        }
      }
    }
  }
}
```

或设置环境变量：
```bash
MEMOS_RECALL_FILTER_ENABLED=true
MEMOS_RECALL_FILTER_BASE_URL="http://127.0.0.1:11434/v1"
MEMOS_RECALL_FILTER_API_KEY="sk-..."
MEMOS_RECALL_FILTER_MODEL="qwen2.5_7b"
```

#### 2. 配置鉴权与进阶参数（可选）

如果需要调整超时时间及失败策略，可以在配置中指定：
```json
{
  "config": {
    "recallFilterTimeoutMs": 6000,
    "recallFilterFailOpen": true
  }
}
```

### 原理介绍
- **召回后拦截**：在每轮对话前从云端召回记忆后，插件会把候选的记忆条目发送给你配置的过滤模型做二次筛选。
- **精准保留**：过滤模型判断后，只保留被标记为 `keep` 的相关条目，最终注入到 Agent 的上下文中。
- **高可用回退**：默认开启了失败放行（`recallFilterFailOpen: true`）。当过滤模型请求超时或失败时，会自动回退为“不过滤”全量注入，保证当前对话不被中断。

### 适用场景
- **超长记忆精简**：长期对话积累大量记忆时，剔除与当前 Prompt 无关的内容，大幅降低主模型上下文的 Token 消耗。
- **提升推理精度**：为需要专注处理复杂任务的 Agent 过滤掉早期无关的记忆干扰，提高核心任务的推理准确度。
- **本地模型协同**：搭配本地运行的小模型（如 Ollama 运行的 `qwen2.5_7b`）作为低成本前置过滤器，在不增加主模型 API 费用的前提下提升记忆注入质量。

---

## 本地插件

MemOS Openclaw 本地插件支持大模型二次过滤记忆，用于在召回后筛掉不相关内容。

### 配置示例

可在 Memory Viewer 里手动配置模型，也可在 `～/.openclaw/openclaw.json` 里配置模型：

```json
{
  "agents": {
    "defaults": {
      "memorySearch": { "enabled": false }
    }
  },
  "plugins": {
    "entries": {
      "memos-local-openclaw-plugin": {
        "enabled": true,
        "config": {
          "summarizer": {
            "provider": "openai_compatible",
            "endpoint": "https://your-api-endpoint/v1",
            "apiKey": "${OPENAI_API_KEY}",
            "model": "gpt-4o-mini",
            "temperature": 0
          }
        }
      }
    }
  }
}
```

### 预期结果

- 每轮 auto-recall 先召回候选，再由大模型过滤
- 注入上下文的记忆更聚焦，噪音更少
- 模型不可用时自动回退，不影响基础召回
