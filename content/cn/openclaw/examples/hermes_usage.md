---
title: Hermes 本地插件使用
desc: MemOS Hermes 本地插件的 API 工具、团队共享和多智能体使用示例。
---

## 基本使用

安装完成后，运行 `hermes chat` 即可开始对话。每轮对话自动存入记忆，可通过 `http://127.0.0.1:18901` 访问 Memory Viewer 查看和管理。

```bash
hermes chat
```

### 验证记忆功能

1. 与 Hermes Agent 进行任意对话。
2. 打开 Memory Viewer（`http://127.0.0.1:18901`），确认对话内容已出现在记忆列表中。
3. 新开一个对话，让 Agent 回忆之前的内容：

```
你：你还记得我之前让你帮我处理过什么事情吗？
Agent：（调用 memory_search）是的，我们之前讨论过……
```

---

## API 工具

Hermes 插件通过以下工具与 Agent 交互，Agent 可在对话中按需调用。

### memory_search — 记忆搜索

参数：`query`（必填），`maxResults`（默认 20），`minScore`（默认 0.45），`role`。

返回 excerpts（原文片段）+ chunkId / task_id，不含 summary；经 LLM 相关性过滤。

```text
Agent 调用示例：
  memory_search(query="Nginx 部署配置")
  → 返回相关记忆片段，附带 chunkId 和 task_id
```

### memory_get — 获取记忆原文

通过 `chunkId` 获取记忆块完整原文。可选 `maxChars` 限制返回长度。

### memory_timeline — 上下文邻居

以 `chunkId` 为锚点，获取前后相邻的记忆块。参数 `window` 默认 2。

### task_summary — 任务摘要

通过 `taskId` 或 `query` 获取任务结构化摘要（目标/步骤/结果/关键细节）。

```text
Agent 调用示例：
  memory_search(query="数据库迁移") → 返回 task_id: "task_42"
  task_summary(taskId="task_42") → 返回完整的结构化任务摘要
```

### skill_get / skill_install — 技能获取与安装

- `skill_get` 支持 `skillId` 或 `taskId`（按任务解析技能）
- `skill_install` 将技能安装到工作区

### memory_write_public — 写入公共记忆

写入公共记忆（owner="public"），所有 Agent 均可检索。参数 `content`（必填），`summary`（可选）。

### skill_search — 技能搜索

搜索技能：FTS5 关键词 + 向量语义双通道，RRF 融合后经 LLM 判断相关性。

参数：`query`（必填），`scope`（"mix" | "self" | "public"，默认 "mix"）。

### skill_publish / skill_unpublish — 技能发布

- `skill_publish` 将技能设为公开，其他 Agent 可通过 `skill_search` 发现并安装
- `skill_unpublish` 设为私有

### memory_viewer — Viewer URL

返回 Memory Viewer 的访问地址。

---

## 团队共享

Team Sharing 将多个 Hermes 实例连接为协作网络。一个实例作为 **Hub**（团队服务端），其他实例作为 **Client** 连接。私有数据始终留在本地，仅明确共享的任务、记忆和技能对团队可见。

### 启动 Hub（团队服务端）

在 Viewer 设置页面配置或通过 Bridge Config JSON：

```json
{
  "sharing": {
    "enabled": true,
    "role": "hub",
    "hub": {
      "teamName": "My Team",
      "teamToken": "${MEMOS_TEAM_TOKEN}"
    }
  }
}
```

### 加入 Hub（客户端）

```json
{
  "sharing": {
    "enabled": true,
    "role": "client",
    "client": {
      "hubAddress": "192.168.1.100:18902"
    }
  }
}
```

::tip
也可以通过 **Viewer → 设置 → 团队共享** 面板直接配置，无需手动编辑 JSON。
::

### 管理员功能

| 功能 | 说明 |
|------|------|
| 审批加入 | 审批或拒绝待审用户 |
| 提升/降级 | 提升成员为管理员或降级为普通成员；被操作用户收到通知 |
| 移除成员 | 移除团队成员（带确认弹窗，不可移除自己） |
| 团队概览 | 查看团队名称、总成员数、活跃成员数 |
| Hub 关闭通知 | 关闭 Hub 时自动通知所有客户端 |

### 团队共享 API 工具

| Tool | 说明 |
|------|------|
| `task_share` / `task_unshare` | 将任务推送到 / 移除出团队 |
| `skill_publish` / `skill_unpublish` | 发布 / 取消发布技能到团队 |
| `network_memory_detail` | 获取团队记忆完整内容 |
| `network_skill_pull` | 拉取团队技能到本地 |
| `network_team_info` | 查看当前团队连接状态 |

### 多实例部署

同一台机器上可运行多个 Hermes 实例，端口和数据完全隔离：

| 资源 | 隔离方式 | 示例 |
|------|---------|------|
| Viewer | MEMOS_VIEWER_PORT | 18901 / 18903 |
| Daemon | MEMOS_DAEMON_PORT | 18992 / 18994 |
| Database | MEMOS_STATE_DIR | ~/.hermes/memos-state/ / ~/hermes-work/memos-state/ |

---

## 多智能体协同

MemOS 原生支持多 Agent 场景。每个 Agent 的记忆和任务通过 `owner` 字段隔离（Hermes 默认 owner 为 `hermes`），检索时自动过滤为当前 Agent + public。

- **记忆隔离**：Agent A 无法检索 Agent B 的私有记忆
- **公共记忆**：通过 `memory_write_public` 写入 owner="public" 的记忆，所有 Agent 可检索
- **技能共享**：通过 `skill_publish` 将技能设为公开，其他 Agent 可通过 `skill_search` 发现并安装
- **技能检索**：`skill_search` 支持 scope 参数（mix/self/public），FTS + 向量双通道 + RRF 融合 + LLM 相关性判断

### 操作示例

```text
Agent Alpha:
  memory_search("deploy config")
  → 仅看到自己 + public 的记忆
  memory_write_public("shared deploy config")
  skill_publish("nginx-proxy") ✓ 现在是公共技能

Agent Beta:
  memory_search("alpha private deploy detail")
  → 看不到 Alpha 的私有记忆
  memory_search("shared deploy config")
  → 找到公共记忆
  skill_search("nginx deployment")
  → 找到: nginx-proxy (public)
  skill_install("nginx-proxy") ✓ 已安装
```

---

## Viewer HTTP API

Memory Viewer 提供以下 HTTP 接口：

| Method | Path | 说明 |
|--------|------|------|
| GET | / | Memory Viewer HTML |
| POST | /api/auth/* | setup / login / reset / logout |
| GET | /api/memories | 记忆列表（分页、过滤） |
| GET | /api/search | 混合搜索（向量 minScore 0.64 + FTS5 降级） |
| POST/PUT/DELETE | /api/memory/:id | 记忆 CRUD |
| GET | /api/tasks | 任务列表（状态过滤） |
| GET/PUT/DELETE | /api/task/:id | 任务详情/编辑/删除 |
| POST | /api/task/:id/retry-skill | 重试技能生成 |
| GET | /api/skills | 技能列表 |
| GET/PUT/DELETE | /api/skill/:id | 技能详情/编辑/删除 |
| PUT | /api/skill/:id/visibility | 设置公开/私有 |
| GET | /api/skill/:id/download | 技能 ZIP 下载 |
| GET | /api/stats, /api/metrics | 统计与分析 |
| GET | /api/logs | 工具调用日志 |
| GET/PUT | /api/config | 在线配置 |
