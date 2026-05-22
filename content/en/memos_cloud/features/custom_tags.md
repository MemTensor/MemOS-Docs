---
title: Custom Tags
desc: Use tags according to your business needs when adding messages.
---
::warning 
Note
<br>
<br>

**[You need to pass the tag list when calling addMessage (Click here for detailed API documentation)](/api_docs/core/add_message)**
<br>

**[Only then can you use tags for filtering when calling searchMemory (Click here for detailed API documentation)](/api_docs/core/search_memory)**
<br>
<br>

**This article focuses on functional description. For detailed API fields and limits, please click the text links above.**

::

MemOS automatically generates tags for each memory, but these tags may not be completely consistent with the tags used in your business. You can pass a list of custom tags when adding messages, and MemOS will automatically apply relevant tags to the memory content based on the meaning of the tags you provide.

:::note
When to use custom tags?<br>

You want MemOS to use the product team's existing tag system to label memory content.

You need to apply these tags to generate structured content.
:::

## 1. Tag Mechanism

*   **Automatic Tag Generation**: MemOS analyzes semantics when processing memories and automatically generates relevant tags for subsequent retrieval and filtering.
    
*   **Custom Tags**: When adding messages, you can pass a set of custom tags through the `tags` field as a candidate tag set.
    
*   **Semantic Matching**: MemOS will judge the semantic similarity between the memory content and the tag list provided by the developer, select matching tags from them, and write them into the `tags` field of the memory along with the system-generated tags.
    

## 2. Usage Example

:::note 
Tip<br>
*  Tag content should be concise while clearly distinguishing the meanings of different categories to facilitate identification and matching.

*  Use a unified list under the same project dimension and do not replace it easily to ensure consistency in retrieval and filtering.
:::

## 3. Add Message

```python
import os
import json
import requests

# Replace with your MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "user_id": "memos_user_123",
    "conversation_id": "1210",
    "messages": [
        {"role": "user","content": "How is the weather today?"},
        {"role": "assistant","content": "Shanghai, December 10th, cloudy, temperature 8-12 degrees."}
    ],
    "tags":["Weather","Cloudy"],
    "async_mode":False
}

headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/message"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```

### Search Memory

```python
import os
import json
import requests

# Replace with your MemOS API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "user_id": "memos_user_123",
    "query": "Shanghai Weather"
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/search/memory"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")
```

### Output Result

```json
"memory_detail_list": [
  {
    "id": "9bc102cb-76d8-4a59-86d7-8fd1c4542407",
    "memory_key": "Weather Conditions",
    "memory_value": "On December 10, 2025, the weather in Shanghai was cloudy with temperatures between 8 and 12 degrees.",
    "memory_type": "WorkingMemory",
    "create_time": 1765376340736,
    "conversation_id": "1210",
    "status": "activated",
    "confidence": 0.99,
    "tags": [
      "Weather",
      "Cloudy",
      "Temperature"
    ],
    "update_time": 1765376340737,
    "relativity": 0.82587826
  }
]
```
