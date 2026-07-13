::code-group
```python [Python (HTTP)]
import os
import requests

# 替换成你的 API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

memory_id = "mem_event_001"  # 替换为真实的记忆 ID

headers = {
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/get/memory/{memory_id}"

res = requests.get(url=url, headers=headers)

print(f"result: {res.json()}")
```
```python [Python (SDK)]
# 请确保已安装 MemOS (pip install MemoryOS -U)
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

res = client.get_memory_by_id(memory_id="mem_event_001")
print(f"result: {res}")
```
```bash [Curl]
curl --request GET \
  --url https://memos.memtensor.cn/api/openmem/v1/get/memory/mem_event_001 \
  --header 'Authorization: Token YOUR_API_KEY'
```
::
