## Examples

### Real-Time Conversation Sync

Use the API to append messages in real time whenever the user receives a model response. This ensures conversations between the user and the assistant are always in sync with MemOS. MemOS continuously updates the user’s memory in the backend as new messages are added.The total token limit for the message being added is 8k.

```python
import os
import json
import requests

# Set your API key and base URL
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

headers = {
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}",
  "Content-Type": "application/json"
}
BASE_URL = os.environ['MEMOS_BASE_URL']

def add_message(user_id, conversation_id, role, content):
    data = {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "messages": [{"role": role, "content": content}]
    }
    
    res = requests.post(f"{BASE_URL}/add/message", headers=headers, data=json.dumps(data))
    result = res.json()
  
    if result.get('code') == 0: 
      print(f"✅ Message added successfully")
    else:
      print(f"❌ Failed to add message: {result.get('message')}")

# === Example ===

# User sends a message
add_message("memos_user_123", "memos_conversation_123", "user","""I ran 5 kilometers this morning and my knees feel a bit sore.""")

# Assistant replies
add_message("memos_assistant_123", "memos_conversation_123", "assistant","""You ran 5 kilometers this morning and your knees feel sore. That means your joints and muscles are still adjusting to the intensity. Tomorrow, try keeping the distance to around 3 kilometers and focus on proper warm-up and cool-down. This will help you stay consistent while giving your knees time to recover.""")
```

### Importing Historical Conversations

If your application already has existing chat logs, you can bulk import them into MemOS. This allows the assistant to access past context immediately and deliver more personalized, consistent responses.

🍬 Tip: The `chat_time` field accepts both structured timestamps and plain Chinese text. MemOS uses this field to improve memory retrieval accuracy.

```python
import os
import json
import requests

# Set your API key and base URL
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

headers = {
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}",
  "Content-Type": "application/json"
}
BASE_URL = os.environ['MEMOS_BASE_URL']

# Example: historical conversation data
history_messages = [
    # Day 1 - User and assistant conversation
    {"role": "user", "content": "I like spicy food.", "chat_time": "2025-09-12 08:00:00"},
    {"role": "assistant", "content": "Got it — I’ll remember that you like spicy food.", "chat_time": "2025-09-12 08:01:00"},

    # A few days later - New conversation
    {"role": "user", "content": "But I don’t really like heavy or oily dishes, like hotpot or spicy beef soup.", "chat_time": "2025-09-25 12:00:00"},
    {"role": "assistant", "content": "So you prefer light but spicy dishes. I can recommend some that might suit your taste!", "chat_time": "2025-09-25 12:01:00"}
]

def add_message(user_id, conversation_id, messages):
    data = {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "messages": messages
    }
    res = requests.post(f"{BASE_URL}/add/message", headers=headers, data=json.dumps(data))
    result = res.json()
  
    if result.get('code') == 0:
        print("✅ Message added successfully")
    else:
        print(f"❌ Failed to add message: {result.get('message')}")

# === Example ===

# Import historical conversation
add_message("memos_user_345", "memos_conversation_345", history_messages)
```

### Storing User Preferences and Behaviors

In addition to conversation data, you can import user preferences and behavioral information—such as interest surveys collected during onboarding—into MemOS as part of the user’s memory.

🍬 Tip: The `content` field must be a string. Both single-line and multi-line text are supported and will be correctly parsed by the system.

```python
import os
import json
import requests

# Set your API key and base URL
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

headers = {
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}",
  "Content-Type": "application/json"
}
BASE_URL = os.environ['MEMOS_BASE_URL']

# Example: user profile and interest data
user_profile_info = [
    {
        "role": "user",
        "content": """
Favorite movie genres: Sci-fi, Action, Comedy
Favorite TV genres: Mystery, Historical dramas
Favorite book genres: Popular science, Technology, Personal growth
Preferred learning formats: Articles, Videos, Podcasts
Exercise habits: Running, Fitness
Dietary preferences: Spicy food, Healthy eating
Travel interests: Nature, Urban culture, Adventure
Preferred conversation style: Humorous, Warm, Casual
Types of support I want from AI: Suggestions, Information lookup, Inspiration
Topics I’m most interested in: Artificial intelligence, Future tech, Film reviews
I’d like AI to help me with: Daily study planning, Movie and book recommendations, Emotional companionship
        """
    }
]

def add_message(user_id, conversation_id, messages):
    data = {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "messages": messages
    }
  
    res = requests.post(f"{BASE_URL}/add/message", headers=headers, data=json.dumps(data))
    result = res.json()
  
    if result.get('code') == 0:
        print("✅ Message added successfully")
    else:
        print(f"❌ Failed to add message: {result.get('message')}")

# === Usage Example ===

# Import user interest and preference data
add_message("memos_user_567", "memos_conversation_id_567", user_profile_info)
```
