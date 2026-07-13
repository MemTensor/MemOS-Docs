::code-group
```python [Python (HTTP)]
import os
import requests
import json

# Replace with your API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "messages": [
        {"role": "user", "content": "I’ve booked a summer trip to Guangzhou. What chain hotels can you recommend for accommodation?"},
        {"role": "assistant", "content": "You can consider options like 7 Days Inn, All Seasons, Hilton, and others."},
        {"role": "user", "content": "I’ll go with 7 Days Inn."},
        {"role": "assistant", "content": "Alright—ask me anytime if you have more questions."}
    ],
    "extraction_types": ["memory", "preference"]
}
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/extract/memory"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
```python [Python (SDK)]
# Ensure MemOS is installed (pip install MemoryOS -U)
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

messages = [
    {"role": "user", "content": "I booked a summer trip to Guangzhou. What chain hotels can you recommend?"},
    {"role": "assistant", "content": "You can consider options like 7 Days Inn, All Seasons, Hilton, and others."},
    {"role": "user", "content": "I will go with 7 Days Inn."},
    {"role": "assistant", "content": "Alright—ask me anytime if you have more questions."}
]

res = client.extract_memory(messages=messages, extraction_types=["memory", "preference"])
print(f"result: {res}")
```
```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/extract/memory \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "messages": [
      {"role": "user", "content": "I booked a summer trip to Guangzhou. What chain hotels can you recommend for accommodation?"},
      {"role": "assistant", "content": "You can consider options like 7 Days Inn, All Seasons, Hilton, and others."},
      {"role": "user", "content": "I will go with 7 Days Inn."},
      {"role": "assistant", "content": "Alright—ask me anytime if you have more questions."}
    ],
    "extraction_types": ["memory", "preference"]
  }'
```
::
