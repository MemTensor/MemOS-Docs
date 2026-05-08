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
  "conversation_id": "memos_feedback_conv",
  "feedback_content": "No, we are changing the meal allowance for tier-1 cities to 150 yuan/day and accommodation allowance to 700 yuan/day; tier-2 and tier-3 cities remain unchanged.",
  "allow_knowledgebase_ids":["basee5ec9050-c964-484f-abf1-ce3e8e2aa5b7"] # Replace with Knowledge Base ID
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/feedback"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
```python [Python (SDK)]
# Ensure MemoS is installed (pip install MemoryOS -U)
from memos.api.client import MemOSClient

# Initialize client with API Key
client = MemOSClient(api_key="YOUR_API_KEY")

user_id = "memos_user_123"
conversation_id = "memos_feedback_conv"
feedback_content = "No, we are changing the meal allowance for tier-1 cities to 150 yuan/day and accommodation allowance to 700 yuan/day; tier-2 and tier-3 cities remain unchanged."
allow_knowledgebase_ids = ["basee5ec9050-c964-484f-abf1-ce3e8e2aa5b7"] # Replace with Knowledge Base ID

res = client.add_feedback(
    user_id=user_id,
    conversation_id=conversation_id,
    feedback_content=feedback_content,
    allow_knowledgebase_ids=allow_knowledgebase_ids
)

print(f"result: {res}")
```
```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/add/feedback \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "user_id": "memos_user_123",
    "conversation_id": "memos_feedback_conv",
    "feedback_content": "No, we are changing the meal allowance for tier-1 cities to 150 yuan/day and accommodation allowance to 700 yuan/day; tier-2 and tier-3 cities remain unchanged.",
    "allow_knowledgebase_ids":["basee5ec9050-c964-484f-abf1-ce3e8e2aa5b7"]
  }'
```
::
