---
title: MemOS 概览
desc: 记忆操作系统(Memory Operation System)，让 AI 应用获得长期记忆。
---

MemOS 是面向 AI 应用与 Agent 的记忆托管平台。把信息写入 MemOS，系统会自动生成、召回和更新记忆，在后续请求中持续为 AI 提供精简、准确的上下文。

你不需要重复解决“AI 如何记忆”的问题，调用云服务接口，即可接入长期记忆能力。



## MemOS 带给你什么？

- **让 AI 长期连续**：跨会话保留用户事实、偏好和任务进展，让 AI 不再每次从零开始。
- **记忆始终有用**：持续抽取、去重、更新和修正记忆，保证记忆准确、有效。
- **降低工程成本**：生产级记忆平台，托管生产、调度、召回与生命周期管理的全流程，降低自建记成本。
- **扩展能力**：支持知识库、Skill、工具记忆、多模态和 Agent 工作流，覆盖更多业务场景。



## 核心工作流程

![MemOS 如何工作](https://cdn.memtensor.com.cn/img/1779180005737_hr407r_compressed.png)

::steps{level="3"}

### 添加原始信息

把用户聊天、行为事件、知识文件、图片、技能等一系列原始信息传入给 MemOS。

### 生成并更新记忆

MemOS 会在后台把原始信息加工成可检索的记忆内容，并持续自动更新、实时调度、基于自然语言反馈修正记忆，管理记忆的全生命周期。

### 检索记忆

在检索记忆时，MemOS 筛选并召回最相关的记忆，用于模型回答、Agent 决策或业务流程，让 AI 在后续请求中保持连续理解。

::

## 选择如何开始

::card-group
  :::card
  ---
  icon: ri:rocket-line
  title: 快速开始

  to: /cn/memos_cloud/getting_started/quick_start
  ---
  从这里开始创建第一个项目
  :::

  :::card
  ---

  icon: ri:brain-line
  title: MemOS 工作原理

  to: /cn/memos_cloud/introduction/mem_production
  ---

  想要先理解 MemOS 的记忆机制
  :::  

:::card
  ---

  icon: ri:dashboard-line
  title: 云服务与开源方案

  to: /cn/memos_cloud/getting_started/cloud_and_opensource
  ---
  没想好使用云服务还是开源自部署？先看这里
  :::

  :::card
  ---
  icon: ri:robot-line
  title: 在 Agent 中使用

  to: /cn/memos_cloud/getting_started/agent_usage
  ---
  接入 OpenClaw、Hermes 或其他 AI 工具
  :::
::
