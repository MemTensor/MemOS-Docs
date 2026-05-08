::code-group
```python [Python (HTTP)]
import os
import requests
import json

# Replace with your API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "user_id": "memos_user_123",
  "conversation_id": "memos_chat_conv",
  "query": "Introduce MemOS to me"
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/chat"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
```python [Python (SDK)]
# Ensure MemoS is installed (pip install MemoryOS -U)
from memos.api.client import MemOSClient

# Initialize client with API Key
client = MemOSClient(api_key="YOUR_API_KEY")

user_id = "memos_user_123"
conversation_id = "memos_chat_conv"
query = "Introduce MemOS to me"

res = client.chat(user_id=user_id,conversation_id=conversation_id,query=query)
print(f"result: {res}")
```
```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/chat \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "user_id": "memos_user_chat_123",
    "conversation_id": "memos_chat_conv",
    "query": "Introduce MemOS to me"
  }'
```
::
