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
  "profile_template_id": "tpl_user_001",
  "metadata": {
    "基础信息": {
      "居住地": {
        "value": "上海",
        "algorithm_updatable": False
      }
    }
  }
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/edit/profile"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
```python [Python (SDK)]
# 请确保已安装 MemOS (pip install MemoryOS -U)
from memos.api.client import MemOSClient

client = MemOSClient(api_key="YOUR_API_KEY")

res = client.edit_profile(
    user_id="memos_user_123",
    profile_template_id="tpl_user_001",
    metadata={
        "基础信息": {
            "居住地": {
                "value": "上海",
                "algorithm_updatable": False
            }
        }
    }
)
print(f"result: {res}")
```
```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/edit/profile \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "user_id": "memos_user_123",
    "profile_template_id": "tpl_user_001",
    "metadata": {
      "基础信息": {
        "居住地": {
          "value": "上海",
          "algorithm_updatable": false
        }
      }
    }
  }'
```
::
