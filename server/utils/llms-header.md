# MemOS

> MemOS is a long-term memory system for AI agents and applications. It automatically extracts, stores, and retrieves personalized memories from conversations so your AI remembers users across sessions.

## For agents reading this file

- To get raw Markdown of any page below, append `.md` to its URL.
- **Locale**: links use their actual language paths. Chinese pages start with `/cn/`; some pages are available in only one language. Chinese documentation index: [/cn/llms.txt](/cn/llms.txt).
- Full documentation text: [/llms-full.txt](/llms-full.txt)
- OpenAPI spec (Cloud): [/cn/api_docs/api.json](/cn/api_docs/api.json)
- Source repo: https://github.com/MemTensor/MemOS
- CLI: `pip install memos-cli` — see [CLI guide](/mcp_agent/cli/guide)
- Dashboard: https://memos-dashboard.openmem.net

### Quick integration

```bash
pip install MemoryOS -U
```

```python
import os
import requests
import json

os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"  # Get from https://memos-dashboard.openmem.net/apikeys/
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}

# 1. Store a conversation as memory
data = {
    "user_id": "memos_user_123",
    "conversation_id": "0610",
    "messages": [
        {"role": "user", "content": "I've planned to travel to Guangzhou this summer. What chain hotels are available?"},
        {"role": "assistant", "content": "You can consider 7 Days Inn, All Seasons, Hilton, etc."},
        {"role": "user", "content": "I'll choose 7 Days Inn."},
        {"role": "assistant", "content": "Alright, feel free to ask if you have any other questions."}
    ]
}
res = requests.post(
    f"{os.environ['MEMOS_BASE_URL']}/add/message",
    headers=headers,
    data=json.dumps(data)
)
print(f"add result: {res.json()}")

# 2. Recall relevant memories later
data = {
    "query": "I want to travel during National Day. Recommend a city I haven't been to and a hotel I haven't stayed at.",
    "user_id": "memos_user_123",
    "conversation_id": "0928"
}
res = requests.post(
    f"{os.environ['MEMOS_BASE_URL']}/search/memory",
    headers=headers,
    data=json.dumps(data)
)
print(f"search result: {res.json()}")
```

### Routing guide

| User wants to... | Start here |
|---|---|
| Add memory to their app (API) | [Integrate into Your App](/memos_cloud/getting_started/quick_start) |
| Use via MCP / CLI / Plugin | [Use in Agents](/memos_cloud/getting_started/agent_usage) |
| Understand concepts | [Overview](/memos_cloud/getting_started/overview) |
| Self-host open source | [Installation Guide](/open_source/getting_started/installation) |
| API reference | [API Overview](/api_docs/start/overview) |

---
