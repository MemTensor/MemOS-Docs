---
title: 多智能体记忆隔离
---

MemOS 云插件支持按 Agent 完全隔离记忆和消息历史。每个 Agent 只能看到自己的记忆，不会串台。

## 【云插件】中如何使用

只需简单配置，即可让不同 Agent 拥有独立的记忆空间。支持自动识别和静态指定两种模式。

### 1. 开启多 Agent 模式

在 `openclaw.json` 配置中添加：

```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": {
        "config": {
          "multiAgentMode": true
        }
      }
    }
  }
}
```

或设置环境变量：

```bash
MEMOS_MULTI_AGENT_MODE=true
```

### 2. 自动识别 Agent

开启后，插件会自动读取 `ctx.agentId` ，不同 Agent 的记忆自动隔离。无需额外配置。

### 3. 静态指定 Agent（可选）

如果需要固定某个 Agent ID，可以在配置中指定：

```json
{
  "config": {
    "agentId": "marketing_agent"
  }
}
```

## 原理介绍

- **/search/memory**：检索记忆——只返回当前 Agent 的记忆
- **/add/message**：添加记录——自动标记为当前 Agent 的数据
- **向下兼容**：默认 Agent `"main"` 会被忽略，保证老用户的单 Agent 数据不受影响

## 适用场景

- **多角色协作**：战略/业务/营销/技术 Agent 分工协作
- **业务线独立**：不同业务线的 Agent 独立运行互不干扰
- **人设一致性**：保持 Agent 长期人设和行为风格一致
