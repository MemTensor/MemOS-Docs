---
title: 知识库使用
desc: 在 MemOS Cloud 控制台创建知识库，并在 OpenClaw 云插件中配置知识库 ID 进行检索。
---

## 云插件

MemOS OpenClaw 云插件可以在每轮任务开始前，基于当前问题同时召回个人记忆和指定知识库内容。适合把产品文档、公司制度、项目资料、代码规范等长期资料接入 OpenClaw，让 Agent 在执行任务时自动参考这些资料。

### 1. 创建知识库并获取 ID

知识库需要先在 [MemOS Cloud Dashboard](https://memos-dashboard.openmem.net) 中创建。

操作步骤：

1. 登录 [MemOS Cloud Dashboard](https://memos-dashboard.openmem.net)。
2. 进入知识库管理页面，创建新的知识库。
3. 上传需要被 Agent 检索的文档或 Skill 文件。
4. 等待文件处理完成。
5. 在知识库详情页复制知识库 ID，例如 `kb-company-handbook`。

::warning
请使用控制台中复制到的真实知识库 ID 替换下面示例里的 `kb-company-handbook`。知识库名称只是展示名，插件配置需要填写知识库 ID。
::

### 2. 配置全局知识库

知识库相关配置分为两个方向：

- `knowledgebaseIds` / `MEMOS_KNOWLEDGEBASE_IDS`：负责查询知识库，插件在 `/search/memory` 阶段从这些知识库中召回内容。
- `allowKnowledgebaseIds` / `MEMOS_ALLOW_KNOWLEDGEBASE_IDS`：负责写入知识库，插件在 `/add/message` 阶段允许把新增记忆写入这些知识库。

如果希望所有 OpenClaw 会话都可以检索同一个知识库，可以在 `~/.openclaw/openclaw.json` 中配置 `knowledgebaseIds`：

```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": {
        "enabled": true,
        "config": {
          "apiKey": "YOUR_MEMOS_API_KEY",
          "knowledgebaseIds": ["kb-company-handbook"],
          "memoryLimitNumber": 6,
          "relativity": 0.45
        }
      }
    }
  }
}
```

配置完成后重启 OpenClaw gateway：

```bash
openclaw gateway restart
```

### 3. 使用环境变量配置

也可以在 `~/.openclaw/.env` 中配置知识库 ID：

```bash
MEMOS_API_KEY=YOUR_MEMOS_API_KEY
MEMOS_KNOWLEDGEBASE_IDS="kb-company-handbook,kb-product-docs"
```

`MEMOS_KNOWLEDGEBASE_IDS` 对应检索阶段的知识库范围，也就是插件调用 `/search/memory` 时会读取这些知识库。

如果需要把对话新增记忆写入知识库，需要额外配置写入参数：

```bash
MEMOS_ALLOW_KNOWLEDGEBASE_IDS="kb-company-handbook"
```

::warning
知识库写入会让 Agent 产生的信息进入对应知识库，但知识库内容本身不会按 `agent_id` 做隔离过滤。也就是说，一旦多个 Agent 都配置读取同一个知识库，写入该知识库的信息就可能被这些 Agent 共同召回，从而削弱多 Agent 记忆隔离效果。

如果你希望严格保持 Agent 隔离，建议不要把对话记忆写入共享知识库；只有在明确希望沉淀为团队共享知识时，再配置 `allowKnowledgebaseIds` 或 `MEMOS_ALLOW_KNOWLEDGEBASE_IDS`。
::

### 4. 多 Agent 分别绑定知识库

当不同 Agent 负责不同任务时，建议开启多 Agent 模式，并通过 `agentOverrides` 为每个 Agent 配置自己的知识库：

```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": {
        "enabled": true,
        "config": {
          "multiAgentMode": true,
          "allowedAgents": ["research-agent", "coding-agent"],
          "memoryLimitNumber": 6,
          "relativity": 0.45,
          "agentOverrides": {
            "research-agent": {
              "knowledgebaseIds": ["kb-research-papers"],
              "memoryLimitNumber": 12,
              "queryPrefix": "research context: "
            },
            "coding-agent": {
              "knowledgebaseIds": ["kb-codebase", "kb-api-docs"],
              "memoryLimitNumber": 9,
              "includeToolMemory": true,
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

- `research-agent` 会优先检索论文 / 研究资料知识库。
- `coding-agent` 会检索代码库和 API 文档知识库，并关闭对话写入，避免把临时调试过程沉淀到长期记忆中。
- 未出现在 `agentOverrides` 中的 Agent 会继承全局配置。

如果在多 Agent 场景中开启知识库写入，请确保写入目标不是多个 Agent 共同读取的共享知识库，否则不同 Agent 的信息可能通过知识库互相可见。

### 5. 验证知识库召回

配置完成后，可以向 OpenClaw 提问一个只有知识库文档中才有答案的问题：

```text
你：根据公司报销制度，设计软件采购超过多少金额需要特殊审批？
OpenClaw：根据知识库中的采购规则，设计软件采购超过 1000 元需要特殊审批……
```

如果回答没有引用知识库内容，可以按下面顺序排查：

- 确认知识库文件在 Dashboard 中已经处理完成。
- 确认 `knowledgebaseIds` 或 `MEMOS_KNOWLEDGEBASE_IDS` 使用的是知识库 ID，不是知识库名称。
- 确认 OpenClaw gateway 已重启并加载了最新配置。
- 如果使用多 Agent，确认当前 Agent 在 `allowedAgents` 中，并且对应 `agentOverrides` 配置正确。

### 配置参考

知识库相关配置请参考 [MemOS-Cloud-OpenClaw-Plugin 官方仓库](https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin)：

| 配置项 | 用途 |
| --- | --- |
| `knowledgebaseIds` | 查询知识库。插件配置中的知识库检索范围，对应 `/search/memory`。 |
| `MEMOS_KNOWLEDGEBASE_IDS` | 查询知识库。环境变量形式的知识库检索范围，多个 ID 用英文逗号分隔。 |
| `allowKnowledgebaseIds` | 写入知识库。插件配置中的新增记忆允许写入知识库范围，对应 `/add/message`。 |
| `MEMOS_ALLOW_KNOWLEDGEBASE_IDS` | 写入知识库。环境变量形式的新增记忆允许写入知识库范围。 |
| `agentOverrides.<agentId>.knowledgebaseIds` | 多 Agent 场景下，为某个 Agent 单独指定知识库。 |
