---
title: Secondary Filtering for Memory Recall
---

## Cloud Plugin

The MemOS Openclaw cloud plugin supports secondary filtering of recalled memories with a specified large language model. After filtering, only memories that are highly relevant to the current task are injected into context, which reduces irrelevant noise and saves tokens.

### How to Use

Just configure an OpenAI-compatible model endpoint (such as local Ollama or a third-party LLM API) and enable the filter switch to turn on secondary memory filtering.

#### 1. Enable Memory Filtering

Add the following in your `openclaw.json` config:

```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": {
        "config": {
          "recallFilterEnabled": true,
          "recallFilterBaseUrl": "http://127.0.0.1:11434/v1",
          "recallFilterModel": "qwen2.5:7b"
        }
      }
    }
  }
}
```

Or set environment variables:
```bash
MEMOS_RECALL_FILTER_ENABLED=true
MEMOS_RECALL_FILTER_BASE_URL="http://127.0.0.1:11434/v1"
MEMOS_RECALL_FILTER_MODEL="qwen2.5:7b"
```

#### 2. Configure Authentication and Advanced Parameters (Optional)

If your model endpoint requires an API key, or if you need to adjust timeout and failure strategy, specify:

```json
{
  "config": {
    "recallFilterApiKey": "sk-...",
    "recallFilterTimeoutMs": 6000,
    "recallFilterFailOpen": true
  }
}
```

### How It Works
- **Post-recall interception**: Before each conversation round, after memories are recalled from the cloud, the plugin sends candidate memory entries (`memory / preference / tool_memory`) to your configured filtering model for secondary screening.
- **Precise retention**: After model judgment, only entries marked as `keep` are retained and injected into the agent context.
- **High-availability fallback**: Fail-open (`recallFilterFailOpen: true`) is enabled by default. If the filtering model times out or fails, it automatically falls back to full injection without filtering, so the current conversation is not interrupted.

### Typical Use Cases
- **Pruning long-term memory**: In long-running conversations with many accumulated memories, remove content unrelated to the current prompt to significantly reduce main-model context token usage.
- **Improving reasoning accuracy**: For agents handling complex tasks, filter out early irrelevant memories to improve reasoning quality on the core task.
- **Working with local models**: Use a locally running small model (such as `qwen2.5:7b` via Ollama) as a low-cost pre-filter to improve memory injection quality without increasing main-model API costs.

---

## Local Plugin

The MemOS Openclaw local plugin supports secondary memory filtering with an LLM to remove irrelevant content after recall.

### Configuration Example

You can configure the model manually in Memory Viewer, or configure it in `~/.openclaw/openclaw.json`:

```json
{
  "agents": {
    "defaults": {
      "memorySearch": { "enabled": false }
    }
  },
  "plugins": {
    "entries": {
      "memos-local-openclaw-plugin": {
        "enabled": true,
        "config": {
          "summarizer": {
            "provider": "openai_compatible",
            "endpoint": "https://your-api-endpoint/v1",
            "apiKey": "${OPENAI_API_KEY}",
            "model": "gpt-4o-mini",
            "temperature": 0
          }
        }
      }
    }
  }
}
```

### Expected Results

- In each auto-recall round, candidates are recalled first and then filtered by an LLM
- Injected memories are more focused with less noise
- If the model is unavailable, it automatically falls back without affecting basic recall
