::code-group
```python [Python (HTTP)]
import os
import requests
import json

# 替换成你的 API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "user_id": "memos_user_123",
  "conversation_id": "memos_feedback_conv",
  "feedback_content": "不对，我们现在改成一线城市餐补150元每天，住宿补贴700元每天；二三线城市还是原来那样。",
  "allow_knowledgebase_ids":["basee5ec9050-c964-484f-abf1-ce3e8e2aa5b7"] # 替换为知识库 ID
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
# # 请确保已安装MemoS (pip install MemoryOS -U)
from memos.api.client import MemOSClient

# 使用 API Key 初始化客户端
client = MemOSClient(api_key="YOUR_API_KEY")

user_id = "memos_user_123"
conversation_id = "memos_feedback_conv"
feedback_content = "不对，我们现在改成一线城市餐补150元每天，住宿补贴700元每天；二三线城市还是原来那样。"
allow_knowledgebase_ids = ["basee5ec9050-c964-484f-abf1-ce3e8e2aa5b7"] # 替换为知识库 ID

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
    "feedback_content": "不对，我们现在改成一线城市餐补150元每天，住宿补贴700元每天；二三线城市还是原来那样。",
    "allow_knowledgebase_ids":["basee5ec9050-c964-484f-abf1-ce3e8e2aa5b7"]
  }'
```
::
