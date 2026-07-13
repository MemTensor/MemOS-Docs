::code-group
```python [Python (HTTP)]
import os
import requests
import json

# Replace with your API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "memory_id": "mem_event_001",
  "title": "Camping at West Lake with Chen Mo",
  "content": "Last Saturday I went camping by West Lake with my friend Chen Mo. The weather was great and we watched the stars together at night."
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
# Ensure MemOS is installed (pip install MemoryOS -U)
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

res = client.update_memory(
    memory_id="mem_event_001",
    title="Camping at West Lake with Chen Mo",
    content="Last Saturday I went camping by West Lake with my friend Chen Mo. The weather was great and we watched the stars together at night."
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
    "title": "Camping at West Lake with Chen Mo",
    "content": "Last Saturday I went camping by West Lake with my friend Chen Mo. The weather was great and we watched the stars together at night."
  }'
```
::
