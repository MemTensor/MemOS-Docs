::code-group
```python [Python (HTTP)]
import os
import requests
import json

# 替换成你的 API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "name": "客服用户属性",
  "metadata": {
    "基础信息": {
      "姓名": {"value": "", "algorithm_updatable": False},
      "职业": {"value": "", "algorithm_updatable": True}
    },
    "服务偏好": {
      "联系时段": {"value": "工作日白天", "algorithm_updatable": True}
    }
  }
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/profile_template"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```
```bash [Curl]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/add/profile_template \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "客服用户属性",
    "metadata": {
      "基础信息": {
        "姓名": {"value": "", "algorithm_updatable": false},
        "职业": {"value": "", "algorithm_updatable": true}
      },
      "服务偏好": {
        "联系时段": {"value": "工作日白天", "algorithm_updatable": true}
      }
    }
  }'
```
::
