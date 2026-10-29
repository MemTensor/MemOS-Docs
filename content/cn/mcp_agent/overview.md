---
title: 接入总览
desc: 四种接入方式调用同一套记忆服务，差异在于运行环境、记忆存放位置与集成成本。
---

MemOS 面向 Agent 提供 MCP 服务、MemOS 插件、CLI 与 Coze 插件工具四种接入方式，其中插件包含云插件与本地插件两种形态。下表列出各方式适用的客户端与记忆存放位置；已经确定所用客户端的，可参考后文「按客户端选择」一节。

## 接入方式对照

| 接入方式 | 适用客户端 | 记忆存放位置 |
| --- | --- | --- |
| [MCP 服务](/cn/mcp_agent/mcp/guide) | Claude Desktop、Cursor、VS Code 或 Trae、Chatbox 等支持 MCP 的客户端 | MemOS 云服务，也可自部署 MCP 服务 |
| [云插件](/cn/openclaw/guide) | OpenClaw、DeepSeek Harness | MemOS 云服务，多 Agent 跨设备共享 |
| [本地插件](/cn/openclaw/local_plugin) | OpenClaw、Hermes Agent、DeepSeek Harness | 本机 SQLite，数据不出本地 |
| [CLI](/cn/mcp_agent/cli/guide) | 可执行 shell 命令的 Agent 与终端环境 | MemOS 云服务 |
| [Coze 插件工具](/cn/mcp_agent/agent/guide) | Coze 平台智能体，零代码集成 | MemOS 云服务 |

## 按客户端选择

- **Claude Desktop、Cursor、VS Code、Trae、Chatbox**：使用 MCP 服务。在客户端配置中填写 MemOS MCP 地址即可，无需编写代码。
- **OpenClaw**：云插件与本地插件的差异见[对比说明](/cn/openclaw/plugin_compare)。要求开箱即用、多台设备共享记忆时，云插件更合适；要求数据保留在本机，并需要可观测性时，本地插件更合适。
- **Hermes Agent**：使用本地插件。Hermes 通过 Python Provider 接入同一套本地记忆核心。
- **DeepSeek Harness**：云插件与本地插件均支持，按记忆是否允许离开本机区分。
- **Coze**：使用 Coze 商店上架的插件工具，在智能体中添加即可，无需部署。
- **自建 Agent，可执行命令行**：使用 CLI。它把 `add`、`search`、`get` 等记忆操作封装为命令，也便于多个框架共用同一份记忆。

## 云插件与本地插件的取舍

这两种方式都面向 OpenClaw、Hermes Agent 与 DeepSeek Harness 这类本地运行的 Agent，差异在于记忆的存放位置与管理方式。

| 维度 | 云插件 | 本地插件 |
| --- | --- | --- |
| 记忆存放 | MemOS 云服务 | 本机 SQLite |
| 跨设备与多 Agent 共享 | 支持 | 仅本机 |
| 数据是否离开本机 | 是 | 否 |
| 可观测性 | 云端调用日志 | 本地管理面板，含任务轨迹、Analytics 与 Logs |
| 适合场景 | 快速接入、跨设备协作、生产环境 | 隐私敏感、本地化运行、长期沉淀可复用经验 |

两种插件的完整对比与安装步骤见[云插件 vs 本地插件](/cn/openclaw/plugin_compare)。
