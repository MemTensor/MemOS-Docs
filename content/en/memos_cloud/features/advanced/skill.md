---
title: Skills
desc: Generate reusable Skill files for Agents by adding user conversation messages.
---

## 1. What are MemOS Skills?

**Skills** are **modular capability packages** that an Agent can dynamically invoke while executing tasks. They are automatically dispatched and injected by the Agent based on the conversation context, requiring no manual intervention from the user. These skills are typically built by developers collaborating with LLMs, based on open-source projects or original concepts, and are continuously optimized through actual use.

MemOS advocates that "Memory is Asset." We believe that the resolution paths and user preferences precipitated in real conversations are essentially the most valuable materials for skills. Based on this philosophy, MemOS **now supports automatically extracting skills from user memories**—solidifying fragmented interaction histories into reusable, personalized professional capabilities.

::note
**How are MemOS Skills different from existing memories?**

* **Static Facts → Dynamic Execution**

Memories are usually static and factual, such as: "I live in Shanghai" or "I like concise replies." This information provides the necessary context for Agent reasoning.

Skills are executable behavioral capabilities built upon memory. They encapsulate a clear set of task-processing logic, such as "How to plan a complete travel itinerary," guiding the Agent's decisions and actions.

* **Fragmented → Structured**

Memories are often fragmented, with each entry describing a single fact or preference.

Skills are highly structured, integrating multiple related memories into a complete task solution that can be reused across different tasks.
::

## 2. How It Works

![image.png](https://cdn.memtensor.com.cn/img/1769759436251_3tx57c_compressed.png)

The diagram above illustrates the complete interaction flow between the end-user, your AI Agent, and MemOS:

1.  Call the `add/message` interface to pass the user's conversation messages into MemOS.

2.  Upon receiving the request, MemOS processes it in sequence to generate a Skill file:

    a.  **Intelligent Slicing**: Identifies task boundaries in historical conversations and slices them into task text blocks.

    b.  **Clustering & Extraction**: Clusters similar task blocks and combines them with the user's historical memory to extract structured skill text.

    c.  **Skill Transformation**: Converts the skill into an executable and recognizable Skill file.

3.  Call the `search/memory` interface to retrieve memories. MemOS will return a unified result including context-related user facts, preferences, tool memories, and matching Skill files.

4.  Download the Skill file and pass both the memories and the Skill file to your self-deployed LLM, enabling the effective utilization of long-term experience and automatically generated skills.

## 3. Usage Example

The following demonstrates an example of MemOS generating a "Travel Planning" skill based on historical conversations.

### 1. **Add Messages**

Add a conversation between a "High-Energy J-type person" and a "Travel Planning Assistant." The user expresses several requirements for the trip:

* Dislikes backtracking; "Special Forces" style (intensive) travel.

* Prefers cultural attractions.

* Needs to confirm weather and temperature in advance.

```python
import os
import requests
import json

# Replace with your API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"

data = {
    "user_id": "memos_user_123",
    "conversation_id": "0127",
    "messages": [
      {"role": "user", "content": "I'm going to Chengdu next week. Help me plan a 5-day trip. I like 'Special Forces' style travel without backtracking. Please mark delicious local food along the way."},
      {"role": "assistant", "content": "...omitted..."},
      {"role": "user", "content": "I prefer visiting cultural sites; I'm not very interested in shopping malls."},
      {"role": "assistant", "content": "...omitted..."},
      {"role": "user", "content": "When planning, please check the weather and temperature in advance so I can pack my luggage."},
      {"role": "assistant", "content": "...omitted..."}
    ]
  }
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/add/message"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")

```

### 2. **Retrieve Memory**

Suppose the user makes another travel planning request. Pass the user's query and enable skill recall:

```python
import os
import requests
import json

# Replace with your API Key
os.environ["MEMOS_API_KEY"] = "YOUR_API_KEY"
os.environ["MEMOS_BASE_URL"] = "https://memos.memtensor.cn/api/openmem/v1"
data = {
  "query": "I plan to go to Yunnan during the Qingming Festival. Help me plan a 7-day itinerary.",
  "user_id": "memos_user_123",
  "conversation_id": "0301",
  "include_skill": True # Enable skill
}
headers = {
  "Content-Type": "application/json",
  "Authorization": f"Token {os.environ['MEMOS_API_KEY']}"
}
url = f"{os.environ['MEMOS_BASE_URL']}/search/memory"

res = requests.post(url=url, headers=headers, data=json.dumps(data))

print(f"result: {res.json()}")

```

### 3. **Result Display**

In the retrieval results below, the skill includes:

* Planning "Special Forces" itineraries.
* Recommending cultural attractions.
* Focusing on weather/temperature and recommending suitable clothing.

```markdown
# Below is the Skill.md generated by MemOS 

---
name: Travel Itinerary Planning
description: Design multi-day itineraries for travelers, including attraction arrangements, transportation, and weather adaptation suggestions.
---

## Procedure
1. Determine the traveler's interests and preferences 2. Gather information on attractions and activities at the destination 3. Plan the daily itinerary, ensuring high efficiency and no backtracking 4. Add local food recommendations to enrich the experience 5. Provide transportation and accommodation suggestions, balancing convenience and comfort 6. Check weather forecasts, adjust the itinerary, and prepare luggage

## Experience
1. Efficient route design reduces commute time
2. Prioritize attractions; avoid overly commercialized places
3. Food recommendations increase the richness of the experience
4. Weather adaptation ensures comfortable travel

## User Preferences
- Itinerary arrangements without backtracking
- Priority for cultural attractions, focusing on history and cultural experiences
- Adjust itinerary and prepare luggage based on weather

## Examples

### Example 1

# Travel Itinerary Planning Example
## Day 1
- **Itinerary**: Panda Base → Eastern Suburb Memory → Jianshe Road Food Street
- **Weather Adaptation**: Cloudy and windy, suitable for visiting cultural districts
- **Food Recommendation**: Juntun Guokui (Pot-baked pancake), Soy milk
- **Transportation**: Subway + Walking

## Day 2
- **Itinerary**: People's Park → Chengdu Museum → Wenshu Monastery
- **Weather Adaptation**: Light rain, focus on indoor museums
- **Food Recommendation**: Zhong Dumplings, Chen Mapo Tofu
- **Transportation**: Subway + Ride-hailing

...

## Additional Information

### Luggage Preparation Guide
Based on destination weather characteristics, use the "onion layering" method for easy adjustment.

### Cultural Attraction Reservation Guide
Provide reservation channels, ticket prices, and opening hours.

```

::note
**Two Ways to Use Skills** 

* If the Model/Agent you call has the capability to use Skill files, you can directly download the file from the `skill_url` link.
* If the Model/Agent you call does not have the capability to use Skill files, you can directly convert `skill_value` into a string and add it to the prompt.
::

### 4. **Build Your Personalized Skills**

Based on different users' conversation messages, MemOS can create skills exclusive to individuals. For instance, we constructed another conversation between a "Low-Energy P-type person" and a "Travel Planning Assistant." When they requested:

* Night owl, can't get up early.
* Doesn't want to go to far-off places that require rushing.
* Interspersed with niche attractions, off the beaten path.

The Skill file built by MemOS included:

* Planning afternoon-to-evening, relaxed itineraries.
* Recommending routes that aren't too far or rushed.
* Interspersing niche attractions.

```markdown
# Below is the Skill.md generated by MemOS 
---
name: Travel Itinerary Planning
description: Help users plan travel itineraries, ensuring comfortable and efficient exploration of the destination.

---

## Procedure

1. Determine travel purpose and preferences 2. Gather information on destination attractions and activities 3. Filter attractions based on user preferences 4. Arrange daily schedules, including transportation and dining 5. Provide tips and precautions

## Experience

1. Avoid long-distance travel; choose attractions with convenient transportation
2. Reasonably arrange daily schedules, balancing leisure and exploration
3. Fully utilize nighttime activities and attractions to enhance the travel experience
4. Discover niche attractions to avoid crowds and enjoy unique experiences

## User Preferences

- User prefers waking up late and avoiding long-distance travel
- Priority for attractions directly accessible by subway
- Values nighttime activities and experiences
- Explores niche and non-traditional travel routes

## Examples

### Example 1

### Day 1: Giant Panda Afternoon + Niche Old Street Night Tour
- **Noon**: Wake up naturally + Huixinglou Street Food
- **Afternoon**: Chengdu Research Base of Giant Panda Breeding
- **Evening**: Night tour of Shizi Alley + Guihua Alley + Paotongshu Street
...

### Example 2

### Day 2: Three Kingdoms Culture + Dongmen Market Night Market
- **Noon**: Wake up naturally + Wuhouci Street Food
- **Afternoon**: Wuhou Shrine + Red Walls and Bamboo Shadows
- **Evening**: Dongmen Market + Jiuyanqiao Bar Street
...

```

::note
**Start exploring MemOS Skills now! 🚀**

* Go to the [Console - Skill Page](https://memos-dashboard.openmem.net/skill/) to view Skill files automatically generated based on user conversation history.
* Don't have any skills yet? Just [Add Messages](/memos_cloud/mem_operations/add_message) to trigger generation.
::
