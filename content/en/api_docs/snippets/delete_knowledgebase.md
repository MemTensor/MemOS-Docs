::code-group
```python [Python (HTTP)]
import os
import requests
import json

# Replace with your API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "knowledgebase_id": "basee5ec9050-c964-484f-abf1-ce3e8e2aa5b7" # Replace with the Knowledge Base ID to delete
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/delete/knowledgebase"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
```python [Python (SDK)]
# Ensure MemoS is installed (pip install MemoryOS -U)
from memos.api.client import MemOSClient

# Initialize client with API Key
client = MemOSClient(api_key="YOUR_API_KEY")

knowledgebase_id = "basee5ec9050-c964-484f-abf1-ce3e8e2aa5b7" # Replace with the Knowledge Base ID to delete

res = client.delete_knowledgebase(knowledgebase_id=knowledgebase_id)
print(f"result: {res}")
```
```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/delete/knowledgebase \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "knowledgebase_id": "basee5ec9050-c964-484f-abf1-ce3e8e2aa5b7"
  }'
```
::
