:::code-group

```python [上传文档]
import os
import requests
import json

# 替换成你的 API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
  "knowledgebase_id": "basec32f88c6-9dd3-4061-82c8-f0fa0e85a284",  # 替换为要上传文档的知识库 ID
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

```python [上传 Skill]
import os
import requests
import json
import base64

# 替换成你的 API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

skill_markdown = """---
name: 客服退货处理流程
description: 指导客服按标准流程处理用户退货请求
---

## Procedure

1. 确认用户身份和订单号
2. 核实退货原因是否符合政策
3. 引导用户选择退货方式（上门取件/自行寄回）
4. 生成退货单号并告知用户
5. 跟踪物流状态，退款到账后通知用户

## Experience

- 签收 7 天内可无理由退货
- 生鲜类商品不支持退货，需走售后补偿流程
- 高价值商品（>500 元）需主管审批
"""

encoded_skill = base64.b64encode(skill_markdown.encode("utf-8")).decode("utf-8")

data = {
  "knowledgebase_id": "kb_xxx",  # 替换为要上传 Skill 的知识库 ID
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
# 请确保已安装MemOS (pip install MemoryOS -U)
from memos.api.client import MemOSClient

# 使用 API Key 初始化客户端
client = MemOSClient(api_key="YOUR_API_KEY")

knowledgebase_id = "basec32f88c6-9dd3-4061-82c8-f0fa0e85a284"  # 替换为要上传文档的知识库 ID
file = [
  {
    "content": "https://cdn.memtensor.com.cn/file/出差报销额度说明.docx"
  }
]

res = client.add_knowledgebase_file(knowledgebase_id=knowledgebase_id, file=file)
print(f"result: {res}")
```

```bash [Curl]
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
