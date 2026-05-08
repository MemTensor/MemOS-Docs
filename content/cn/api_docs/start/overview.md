---
title: 概述
---

## 1. 接口介绍

MemOS 提供了完整的接口，通过简单的 API 请求，即可将记忆相关的功能集成到您的 AI 应用内，实现不同用户与 AI 智能体的记忆生产、调度、召回与生命周期管理。

::tip
**快速开始：** 从 [**MemOS 控制台**](https://memos-dashboard.openmem.net/apikeys/) 获取你的接口密钥，一分钟即可完成首次记忆操作。
::

## 2. 入门指南

通过以下两个简单的核心步骤开始使用 MemOS API：

* [**添加消息**](/api_docs/core/add_message)：储存用户对话中的原始消息内容，生成记忆；

* [**检索记忆**](/api_docs/core/search_memory)：检索召回用户的相关记忆片段，为模型生成的回答内容提供参考。

## 3. 接口分类

探索 MemOS 提供的丰富功能接口：

* [**核心操作 API**](/api_docs/core/add_message)：提供记忆核心操作能力，实现记忆生产到消费的全流程。

* [**消息 API**](/api_docs/message/add_feedback)：用于上传与管理原始消息内容数据。

* [**知识库 API**](/api_docs/knowledge/create_kb)：用于上传与管理知识库及其文档。
S
* [**对话 API**](/api_docs/chat/chat)：用于完成带有记忆召回与知识库增强的对话生成。

* [**自研模型 API**](/api_docs/core/extract_memory)：用于调用记忆抽取与重排模型能力。

## 4. 鉴权认证

所有API请求都需要认证，请在请求头的 `Authorization` 中包含您的接口密钥。从[**MemOS 控制台**](https://memos-dashboard.openmem.net/apikeys/)获取接口密钥。

::warning
请勿在客户端或公共仓库中暴露您的接口密钥，所有请求都应通过环境变量或服务器端调用进行。
::

## 5. 下一步行动

* 👉 [**添加消息**](/api_docs/core/add_message)：生成你的第一条记忆；

* 👉 [**检索记忆**](/api_docs/core/search_memory)：使用记忆过滤器实现记忆的高级检索。
