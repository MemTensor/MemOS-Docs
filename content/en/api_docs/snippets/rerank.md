::code-group
```python [Python (HTTP)]
import os
import requests
import json

# Replace with your API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

url = f"{os.environ['MEMOS_BASE_URL']}/rerank"

payload = {
    "model": "memos-reranker-0.6b",
    "query": "What are the user's hobbies?",
    "documents": [
        "User likes playing badminton",
        "User is a backend developer in Hangzhou",
        "User prefers concise replies",
        "User prefers Jiangxiang-flavored baijiu",
        "User is going on a business trip to Beijing next Wednesday"
    ]
}

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
print(response.json())
```
```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/rerank \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "memos-reranker-0.6b",
    "query": "What are the user'\''s hobbies?",
    "documents": [
        "User likes playing badminton",
        "User is a backend developer in Hangzhou",
        "User prefers concise replies",
        "User prefers Jiangxiang-flavored baijiu",
        "User is going on a business trip to Beijing next Wednesday"
    ]
}'
```
::
