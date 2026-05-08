:::code-group

```python [Upload Document]
import os
import requests
import json

# Replace with your API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "knowledgebase_id": "basec32f88c6-9dd3-4061-82c8-f0fa0e85a284",  # Replace with the Knowledge Base ID to upload documents to
  "file": [
    {"content": "https://cdn.memtensor.com.cn/file/出差报销额度说明.docx"}
  ]
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/knowledgebase-file"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```

```python [Upload Skill]
import os
import requests
import json
import base64

# Replace with your API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

skill_markdown = """---
name: Customer Return SOP
description: Guide customer support agents through a standard return request workflow.
---

## Procedure

1. Confirm the user's identity and order number
2. Check whether the return reason meets the policy
3. Guide the user to choose pickup or self-shipping
4. Generate the return request number and inform the user
5. Track logistics and notify the user after the refund is completed

## Experience

- Standard products can be returned within 7 days after delivery
- Fresh goods do not support returns and should use after-sales compensation
- High-value products over 500 CNY require supervisor approval
"""

encoded_skill = base64.b64encode(skill_markdown.encode("utf-8")).decode("utf-8")

data = {
  "knowledgebase_id": "kb_xxx",  # Replace with the Knowledge Base ID to upload the Skill to
  "file": [
    {
      "type": "skill",
      "name": "customer-return-sop.md",
      "content": f"data:text/markdown;base64,{encoded_skill}"
    }
  ]
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/knowledgebase-file"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```

```python [Python (SDK)]
# Make sure MemOS is installed (pip install MemoryOS -U)
from memos.api.client import MemOSClient

# Initialize client with API Key
client = MemOSClient(api_key="YOUR_API_KEY")

knowledgebase_id = "basec32f88c6-9dd3-4061-82c8-f0fa0e85a284"  # Replace with the Knowledge Base ID
file = [
  {
    "content": "https://cdn.memtensor.com.cn/file/出差报销额度说明.docx"
  }
]

res = client.add_knowledgebase_file(knowledgebase_id=knowledgebase_id, file=file)
print(f"result: {res}")
```

```bash [Curl Skill URL]
curl --request POST \
  --url https://memos.memtensor.cn/api/openmem/v1/add/knowledgebase-file \
  --header 'Authorization: Token YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "knowledgebase_id": "basec32f88c6-9dd3-4061-82c8-f0fa0e85a284",
    "file": [
      {
        "type": "skill",
        "content": "https://cdn.memtensor.com.cn/file/SKILL.md"
      }
    ]
  }'
```

:::
