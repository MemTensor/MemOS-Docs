---
title: OpenClaw Plugin Changelog
---

::OpenclawReleaseTimeline
---
releases:
  - date: '2026-03-24'
    plugins:
      - title: 'Cloud Plugin'
        version: 'v0.1.10'
        sections:
          - items:
            - '**Improved memory ingestion quality:** Added and strengthened cleanup for OpenClaw inbound metadata, timestamp wrappers, and trailing Feishu system hints to reduce noisy writes into memory.'
            - '**Multi-channel message prefix cleanup improvements**: Expanded and standardized envelope/prefix stripping for channels such as WebChat, WhatsApp, Telegram, Slack, Discord, and Zalo, reducing platform wrapper noise in memory ingestion and recall quality.'
            - '**More accurate recall display**: Recall timestamps now prioritize update time for better temporal consistency.'
            - '**More robust Recall Filter**: Default parameters are aligned with runtime fallback values (timeout and retries), improving stability in local model scenarios.'
            - '**Timeout and resource management optimization**: Fixed timer cleanup behavior to prevent resource leaks on exceptional code paths.'
            - '**Configuration completeness**: Completed Recall Filter-related fields in the plugin schema for more complete and controllable configuration.'
            - '**Enhanced observability**: Added before/after filtering count logs to make recall quality and filter effect troubleshooting easier.'
  - date: '2026-03-13'
    plugins:
      - title: 'Cloud Plugin'
        version: 'v0.1.9'
        summary: 'Silent upgrade and memory recall optimization. This release includes the following improvements to enhance usability and Token efficiency:'
        sections:
          - title: 'Silent Self-Detection and Upgrade'
            items:
              - 'Added a plugin version self-check mechanism that periodically checks the latest version from the NPM registry in the background.'
              - 'When a new version is detected, a silent upgrade is triggered automatically so users can continuously receive the latest capabilities and fixes without manual actions.'
          - title: 'Support Custom Models for Memory Recall'
            items:
              - 'Introduced LLM-based secondary filtering for memory recall.'
              - 'Added configuration options such as recallFilterModel and recallFilterBaseUrl, allowing an independent model to evaluate relevance.'
              - 'Effectively removes noisy results and keeps only memory snippets that are truly useful for the current conversation.'
          - title: 'Lean Prompt Injection (System Prompt Optimization)'
            items:
              - 'Refactored memory injection logic by moving static protocols and instructions to appendSystemContext.'
              - 'prependContext now keeps only dynamically retrieved memory-list data.'
              - 'Significantly reduces Token usage caused by repetitive prompts and improves model focus on core memory.'
  - date: '2026-03-09'
    plugins:
      - title: 'Cloud Plugin'
        version: 'v0.1.8'
        summary: 'Added support for multi-agent mode, enabling agent identification from context for memory isolation, with a compatibility switch for older versions.'

  - date: '2026-03-05'
    plugins:
      - title: 'Cloud Plugin'
        version: 'v0.1.7'
        summary: 'Added support for user-defined relativity in the searchMemory API.'
  
  - date: '2026-02-26'
    plugins:
      - title: 'Cloud Plugin'
        version: 'Other Historical Versions (Core Capabilities)'
        summary: 'Supports searchMemory in the before_agent_start event and addMessage in the agent_end event.'
---
::
