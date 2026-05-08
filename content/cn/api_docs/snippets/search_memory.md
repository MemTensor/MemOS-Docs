:::code-group

```python [Python (HTTP)]
import os
import requests
import json

# 替换成你的 API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "query": "我国庆想出去玩，帮我推荐个没去过的城市，以及没住过的酒店品牌",
  "user_id": "memos_user_123",
  "conversation_id": "0928"
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/search/memory"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```

```python [Python (SDK)]
# 请确保已安装MemOS (pip install MemoryOS -U)
from memos.api.client import MemOSClient

# 使用 API Key 初始化客户端
client = MemOSClient(api_key="YOUR_API_KEY")

query = "我国庆想出去玩，帮我推荐个没去过的城市，以及没住过的酒店品牌"
user_id = "memos_user_123"
conversation_id = "0928"

res = client.search_memory(query=query, user_id=user_id, conversation_id=conversation_id)

print(f"result: {res}")
```

```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/search/memory \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "query": "我国庆想出去玩，帮我推荐个没去过的城市，以及没住过的酒店品牌",
    "user_id": "memos_user_123",
    "conversation_id": "0928"
  }'
```

:::
