::code-group
```python [Python (HTTP)]
import os
import requests
import json

# 替换成你的 API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "knowledgebase_name": "财务报销知识库",
  "knowledgebase_description": "本公司所有财务报销相关的知识汇总。"
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/create/knowledgebase"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
```python [Python (SDK)]
# 请确保已安装MemoS (pip install MemoryOS -U)
from memos.api.client import MemOSClient

# 使用 API Key 初始化客户端
client = MemOSClient(api_key="YOUR_API_KEY")

knowledgebase_name = "财务报销知识库"
knowledgebase_description = "本公司所有财务报销相关的知识汇总。"

res = client.create_knowledgebase(
    knowledgebase_name=knowledgebase_name,
    knowledgebase_description=knowledgebase_description
)
print(f"result: {res}")
```
```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/create/knowledgebase \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "knowledgebase_name": "财务报销知识库",
    "knowledgebase_description": "本公司所有财务报销相关的知识汇总。"
  }'
```
::
