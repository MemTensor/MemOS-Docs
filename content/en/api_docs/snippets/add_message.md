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
    "conversation_id": "0610",
    "messages": [
      {"role": "user", "content": "I’ve planned to travel to Guangzhou this summer. What chain hotels are available for accommodation?"},
      {"role": "assistant", "content": "You can consider options like 7 Days Inn, All Seasons, Hilton, etc."},
      {"role": "user", "content": "I’ll choose 7 Days Inn."},
      {"role": "assistant", "content": "Alright, feel free to ask me if you have any other questions."}
    ]
  }
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/message"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
```python [Python (SDK)]
# Please ensure that MemOS has been installed (pip install MemoryOS -U)
from memos.api.client import MemOSClient

# Initialize MemOS client with API Key to start sending requests
client = MemOSClient(api_key="YOUR_API_KEY")

messages = [
  {"role": "user", "content": "I’ve planned to travel to Guangzhou this summer. What chain hotels are available for accommodation?"},
  {"role": "assistant", "content": "You can consider options like 7 Days Inn, All Seasons, Hilton, etc."},
  {"role": "user", "content": "I’ll choose 7 Days Inn."},
  {"role": "assistant", "content": "Alright, feel free to ask me if you have any other questions."}
]
user_id = "memos_user_123"
conversation_id = "0610"

res = client.add_message(messages=messages, user_id=user_id, conversation_id=conversation_id)

print(f"result: {res}")
```
```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/add/message \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "user_id": "memos_user_123",
    "conversation_id": "0610",
    "messages": [
      {"role": "user", "content": "I’ve planned to travel to Guangzhou this summer. What chain hotels are available for accommodation?"},
      {"role": "assistant", "content": "You can consider options like 7 Days Inn, All Seasons, Hilton, etc."},
      {"role": "user", "content": "I’ll choose 7 Days Inn."},
      {"role": "assistant", "content": "Alright, feel free to ask me if you have any other questions."}
    ]
  }'
```
::