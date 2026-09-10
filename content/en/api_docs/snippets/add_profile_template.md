::code-group
```python [Python (HTTP)]
import os
import requests
import json

# Replace with your API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "name": "Customer Service User Profile",
  "metadata": {
    "Basic Info": {
      "Name": {"value": "", "algorithm_updatable": False},
      "Occupation": {"value": "", "algorithm_updatable": True}
    },
    "Service Preferences": {
      "Preferred Contact Time": {"value": "Weekday daytime", "algorithm_updatable": True}
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
    "name": "Customer Service User Profile",
    "metadata": {
      "Basic Info": {
        "Name": {"value": "", "algorithm_updatable": false},
        "Occupation": {"value": "", "algorithm_updatable": true}
      },
      "Service Preferences": {
        "Preferred Contact Time": {"value": "Weekday daytime", "algorithm_updatable": true}
      }
    }
  }'
```
::
