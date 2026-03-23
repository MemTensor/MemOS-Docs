---
title: OpenClaw 插件更新日志
---

::OpenclawReleaseTimeline
---
releases:
  - date: '2026-03-13'
    plugins:
      - title: '云插件'
        version: 'v0.1.9'
        summary: '无感升级与记忆召回优化。本次更新主要包含以下改进，旨在提升插件的易用性与 Token 利用率：'
        sections:
          - title: '插件无感自检测升级'
            items:
              - '新增插件版本自检测机制，后台定期检查 NPM 仓库最新版本。'
              - '检测到新版本后自动触发静默升级流程，用户无需手动操作即可持续获取最新能力与修复。'
          - title: '支持用户配置模型进行 Memory Recall'
            items:
              - '引入基于 LLM 的记忆二次筛选能力。'
              - '新增 recallFilterModel、recallFilterBaseUrl 等配置项，可指定独立模型进行相关性评审。'
              - '可有效剔除干扰项，仅保留对当前对话真正有用的记忆片段。'
          - title: '对话注入瘦身（System Prompt 优化）'
            items:
              - '重构记忆注入逻辑，将静态协议与指令移动到 appendSystemContext。'
              - 'prependContext 仅保留动态检索得到的 memory-list 数据。'
              - '显著降低重复提示词带来的 Token 消耗，并提升模型对核心记忆的聚焦。'
  - date: '2026-03-09'
    plugins:
      - title: '云插件'
        version: 'v0.1.8'
        summary: '支持用户开启多Agent模式，实现从上下文中识别agent进行记忆隔离，同时做了开关，兼容旧版本。'

  - date: '2026-03-05'
    plugins:
      - title: '云插件'
        version: 'v0.1.7'
        summary: '支持用户自定义searchMemory接口的relativity字段。'
  
  - date: '2026-02-26'
    plugins:
      - title: '云插件'
        version: '其他历史版本（基础功能）'
        summary: '支持 before_agent_start 事件中 searchMemory、在 agent_end 事件中进行 addMessage。'
---
::

