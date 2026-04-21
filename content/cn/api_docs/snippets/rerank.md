::code-group
```python [Python (HTTP)]
import os
import requests
import json

# 替换成你的 API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

url = f"{os.environ['MEMOS_BASE_URL']}/rerank"

payload = {
    "model": "memos-reranker-0.6b",
    "query": "用户有什么兴趣爱好",
    "documents": [
        "用户喜欢打羽毛球",
        "用户在杭州做后端开发",
        "用户偏好简洁的回复风格",
        "用户比较喜欢酱香型白酒",
        "用户下周三要去北京出差"
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
    "query": "用户有什么兴趣爱好",
    "documents": [
        "用户喜欢打羽毛球",
        "用户在杭州做后端开发",
        "用户偏好简洁的回复风格",
        "用户比较喜欢酱香型白酒",
        "用户下周三要去北京出差"
    ]
}'
```
::
