---
title: 自研模型
desc: MemOS 为何自研记忆与抽取模型，以及能为开发者带来的能力。
---

## 我们为什么做自研模型

通用大模型擅长对话与推理，但在「把对话沉淀成可用记忆」这件事上，往往缺少针对事实、偏好与上下文的专门优化：格式不统一、噪声多、和记忆管线难对齐。MemOS 自研记忆与抽取类模型，是为了与整条记忆服务闭环一致——从写入、抽取到检索与注入——让模型输出**更贴合 MemOS 的数据结构与产品语义**，而不是把通用模型硬塞进记忆场景。

## 带给开发者什么

- **更贴合记忆场景的能力**：面向事实与偏好等记忆类型做抽取与组织，减少你在 Prompt 与后处理上的反复试错。
- **与云服务同一套体验**：接口、鉴权与 Base URL 与 [MemOS Cloud 快速开始](/cn/memos_cloud/quick_start) 一致，接入路径简单、可预期。
- **按需组合**：可与现有 MemOS Cloud 记忆能力配合使用，按业务需要选择是否使用抽取等自研能力，逐步演进。

定价与模型规格请前往 [MemOS 官网定价页](https://memos.openmem.net/cn/pricing) 查看。若已接入云服务，可直接在文档中查看 [使用示例](/cn/self_developed_model/extraction_usage_example) 与 [Extract Memory](/cn/api_docs/core/extract_memory) 接口说明。
