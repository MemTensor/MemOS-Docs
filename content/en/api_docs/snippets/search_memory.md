:::code-group

```python [Python (HTTP)]
import os
import requests
import json

# Replace with your API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "query": "A user wants to return headphones purchased three days ago",
  "user_id": "memos_user_123",
  "conversation_id": "0928",
  "knowledgebase_ids": ["kb_xxx"],
  "include_skill": True
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/search/memory"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```

```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/search/memory \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "A user wants to return headphones purchased three days ago",
    "user_id": "memos_user_123",
    "conversation_id": "0928",
    "knowledgebase_ids": ["kb_xxx"],
    "include_skill": true
  }'
```

:::
