::code-group
```python [Python (HTTP)]
import os
import requests
import json

# 替换成你的 API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "memory_id": "mem_event_001",
  "title": "和陈默去西湖露营",
  "content": "上周六和好友陈默去西湖边露营，天气很好，晚上一起看了星星。"
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/update/memory"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
```python [Python (SDK)]
# 请确保已安装 MemOS (pip install MemoryOS -U)
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

res = client.update_memory(
    memory_id="mem_event_001",
    title="和陈默去西湖露营",
    content="上周六和好友陈默去西湖边露营，天气很好，晚上一起看了星星。"
)
print(f"result: {res}")
```
```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/update/memory \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "memory_id": "mem_event_001",
    "title": "和陈默去西湖露营",
    "content": "上周六和好友陈默去西湖边露营，天气很好，晚上一起看了星星。"
  }'
```
::
