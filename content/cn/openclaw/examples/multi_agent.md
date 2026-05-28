---
title: 多智能体记忆隔离
---
## 云插件

MemOS Openclaw 云插件支持多个 Agent 之间完全隔离记忆和和消息历史。每个 Agent 都只能看到自己的记忆，不会串台。

### 如何使用 

只需简单配置，即可让不同 Agent 拥有独立的记忆空间。支持自动识别和静态指定两种模式。

#### 1. 开启多 Agent 模式

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

#### 2. 自动识别 Agent

开启后，插件会自动读取 `ctx.agentId` ，不同 Agent 的记忆自动隔离。无需额外配置。

#### 3. 静态指定 Agent（可选）

如果需要固定某个 Agent ID，可以在配置中指定：

```json
{
  "config": {
    "agentId": "marketing_agent"
  }
}
```

#### 4. 按 Agent 单独配置参数（可选）

除了隔离记忆空间，还可以通过 `agentOverrides` 给不同 Agent 单独覆盖知识库、召回条数、相关性阈值、是否写入记忆等参数。未配置的字段会继承全局配置。

```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": {
        "enabled": true,
        "config": {
          "multiAgentMode": true,
          "allowedAgents": ["research-agent", "coding-agent"],
          "knowledgebaseIds": [],
          "memoryLimitNumber": 6,
          "relativity": 0.45,
          "agentOverrides": {
            "research-agent": {
              "knowledgebaseIds": ["kb-research-papers", "kb-academic"],
              "memoryLimitNumber": 12,
              "relativity": 0.3,
              "includeToolMemory": true,
              "captureStrategy": "full_session",
              "queryPrefix": "research context: "
            },
            "coding-agent": {
              "knowledgebaseIds": ["kb-codebase", "kb-api-docs"],
              "memoryLimitNumber": 9,
              "relativity": 0.5,
              "addEnabled": false
            }
          }
        }
      }
    }
  }
}
```

上面的配置表示：

- `research-agent` 使用论文 / 学术知识库，召回更多记忆，并开启工具记忆。
- `coding-agent` 只读取代码库和 API 文档知识库，并关闭记忆写入。
- 其他 Agent 如果被允许使用记忆，则沿用全局的 `knowledgebaseIds`、`memoryLimitNumber` 和 `relativity`。

`.env` 中也可以使用 `MEMOS_AGENT_OVERRIDES` 配置 JSON 字符串，但优先级低于 `openclaw.json` 中的 `agentOverrides`：

```bash
MEMOS_AGENT_OVERRIDES='{"research-agent":{"memoryLimitNumber":12,"relativity":0.3},"coding-agent":{"memoryLimitNumber":9,"addEnabled":false}}'
```

常用可覆盖字段：

| 字段 | 说明 |
| --- | --- |
| `knowledgebaseIds` | 当前 Agent 检索的知识库 ID 列表。 |
| `memoryLimitNumber` | 当前 Agent 最多召回的记忆条数。 |
| `preferenceLimitNumber` | 当前 Agent 最多召回的偏好记忆条数。 |
| `includePreference` | 是否召回偏好记忆。 |
| `includeToolMemory` | 是否召回工具记忆。 |
| `toolMemoryLimitNumber` | 工具记忆最多召回条数。 |
| `relativity` | 相关性阈值，取值范围通常为 `0-1`。 |
| `recallEnabled` | 是否为当前 Agent 开启记忆召回。 |
| `addEnabled` | 是否为当前 Agent 开启记忆写入。 |
| `captureStrategy` | 写入策略，例如 `last_turn` 或 `full_session`。 |
| `queryPrefix` | 当前 Agent 的检索 query 前缀。 |
| `recallFilterEnabled` | 是否开启召回二次过滤。 |
| `allowKnowledgebaseIds` | 当前 Agent 允许写入的知识库 ID 列表。 |
| `tags` | 写入记忆时附加的标签。 |

### 原理介绍

- **/search/memory**：检索记忆——只返回当前 Agent 的记忆
- **/add/message**：添加记录——自动标记为当前 Agent 的数据
- **配置合并**：插件先读取全局配置，再用 `agentOverrides.<agentId>` 覆盖当前 Agent 的局部配置
- **向下兼容**：默认 Agent `"main"` 会被忽略，保证老用户的单 Agent 数据不受影响

### 适用场景

- **多角色协作**：战略/业务/营销/技术 Agent 分工协作
- **业务线独立**：不同业务线的 Agent 独立运行互不干扰
- **人设一致性**：保持 Agent 长期人设和行为风格一致

---

## 本地插件

`@memtensor/memos-local-plugin` 同时支持 OpenClaw 与 Hermes。默认情况下，每个 Agent 使用独立运行目录和本地数据库；如果在同一套运行目录内区分多个会话 / Agent，检索会优先限定在当前 Agent 的上下文中。需要跨实例协作时，可以在 Memory Viewer 的 **Settings → Team Sharing** 中开启团队共享。

### 规则

- **默认隔离**：OpenClaw 使用 `~/.openclaw/memos-plugin/`，Hermes 使用 `~/.hermes/memos-plugin/`，两者不会自动共享数据库。
- **当前 Agent 优先**：检索时优先使用当前 Agent / session 的 Trace、Policy、World Model 和 Skill。
- **可选共享**：开启 `hub.enabled` 后，可在局域网 / VPN 内共享本地结晶的 Skill 和可选 Trace 摘要。
- **失败降级**：Hub 不在算法关键路径上；共享服务不可用时，本地插件自动退回本机记忆模式。

### 操作示例

```text
OpenClaw:
  memory_search("deploy config")
  → 优先检索 OpenClaw 本地库中的 Skill / Trace / World Model

Hermes:
  memory_search("deploy config")
  → 优先检索 Hermes 本地库中的 Skill / Trace / World Model

开启 Hub 后:
  OpenClaw / Hermes 可以拉取团队共享 Skill
  私有 Trace 默认仍留在各自机器和运行目录中
```

### 预期结果

- OpenClaw 与 Hermes 默认互不读取对方的本地数据库
- 同一团队内可显式共享高价值 Skill，减少重复踩坑
- 即使 Hub 不可用，本地记忆写入、召回和技能检索仍然可用
