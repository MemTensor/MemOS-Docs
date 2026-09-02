---
title: "Help Your Customer Service Agent Remember Users: Cross-Session Memory with MemOS"
desc: Separate user memories, Agent Skills, and policy knowledge so a customer service Agent can continue user cases across sessions and reuse general workflows.
---

A user reports a faulty headset through web chat. The next day, they follow up by email, only to be asked for their order number and a description of the issue all over again. To the user, this feels like a break in service. The system-level cause is usually simple: the new session does not have the information that was already confirmed.

A customer service Agent needs to remember two different types of information. One belongs to the current user, such as orders, open cases, and notification preferences. The other belongs to the Agent, such as reusable tool workflows for handling similar requests. After-sales policies remain centrally managed in a knowledge base.

This guide uses Python snippets to show how these three types of information work together in a complete customer service memory architecture.

## Key Ideas

- Write user facts and preferences to user memory, and use a stable `user_id` to retrieve them across sessions.
- Submit each task record to the customer service Agent's independent memory, and let MemOS decide whether to create or update a Skill.
- Store after-sales policies in a policy knowledge base, and retrieve them together with Agent Skills from the Agent's perspective.
- Before generating a response, run two retrievals: one for user facts and preferences, and another for Agent Skills and policies.
- Let the Agent manage the current session history while MemOS manages cross-session memory.

## What You Will Build

The example covers three stages of a customer service case:

```text
DAY 1 · Web chat
customer_001 submits a headset exchange request. The customer service Agent
looks up the order, checks the policy, creates a ticket, and records the requested
delivery time, address, and SMS notification preference.

DAY 4 · Email ticket
customer_001 follows up on the exchange in a new conversation_id.

DAY 7 · Web chat
customer_002 reports a similar headset noise issue. The customer service Agent
tries to reuse a Skill learned from the earlier case.
```

DAY 4 verifies that user facts and preferences persist across sessions. DAY 7 uses a different customer to verify that user information remains isolated while the customer service Agent can still reuse a general Skill.

## Separate the Three Information Scopes

The architecture divides customer service context into three scopes:

1. **User memory** stores orders, product issues, ticket status, addresses, and notification preferences. It belongs only to the current `user_id`.
2. **Agent Skills** store general workflows distilled from complete task traces. They belong to a stable `agent_id`.
3. **Policy knowledge base** stores official rules for returns, exchanges, warranties, shipping, and invoices. It is centrally maintained by the business.

Put simply, the policy knowledge base answers "What should we do according to policy?" User memory answers "How far have we progressed with this customer?" An Agent Skill answers "What steps usually complete this type of task?"

## End-to-End Flow

Each customer service request follows this flow:

```text
User request
  │
  ├─ Agent reads the current session history from the business application
  │
  ├─ Retrieval 1: user_id → user facts and preferences
  │
  ├─ Retrieval 2: agent_id → general Skills + policy knowledge base
  │
  ├─ Merge context and call order, ticket, and notification tools
  │
  ├─ LLM generates the final response from the tool results
  │
  ├─ Write 1: user_id → facts and preferences
  │
  └─ Write 2: agent_id → request Skill creation or update
```

Both writes use the same task record, but `allow_memory_view` assigns a different set of memory types to each one. The user perspective does not generate Skills, and the Agent perspective does not duplicate user facts or preferences.

## Prerequisites

You can find a runnable [complete demo](#complete-demo) at the end of this guide. Expand the code block, copy everything with one click, and save it locally for verification.

You need a MemOS API key and access to OpenAI or an OpenAI-compatible model endpoint.

Create a Python environment in your project and install the dependencies:

```bash
python3 -m venv .venv
./.venv/bin/python -m pip install openai requests
```

Configure these values in your integration:

```python
MEMOS_API_KEY = "YOUR_MEMOS_API_KEY"
OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"
MEMOS_BASE_URL = "YOUR_MEMOS_BASE_URL"
OPENAI_MODEL = "YOUR_MODEL_NAME"
OPENAI_BASE_URL = "YOUR_OPENAI_BASE_URL"
AGENT_ID = "YOUR_AGENT_ID"
```

Derive `user_id` from the user's authenticated identity or CRM record. Use a stable `agent_id` for the same customer service Agent across users and sessions.

In the console, enable **Create Independent Memory for an Agent** for the current project. This option is disabled by default. When it is disabled, `agent_id` can only tag and filter memories; it cannot act as an independent subject for writing or retrieving Agent Skills. See [Multi-Agent Isolation](/memos_cloud/introduction/isolation_filters#create-independent-memory-for-an-agent) for details.

## Step 1: Prepare the Policy Knowledge Base

During initialization, create a policy knowledge base, upload the after-sales policy document, and wait until processing is complete:

```python
def create_policy_knowledge_base():
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {MEMOS_API_KEY}",
    }
    policy_kb_id = _create_kb(
        headers,
        "Consumer After-Sales Policy",
        "Policies for returns, exchanges, warranties, shipping, and invoices",
    )
    _upload_file(
        headers,
        policy_kb_id,
        "consumer-after-sale-policy.md",
        POLICY_DOC_MD,
    )
    print("Policy document uploaded. Waiting for processing...")
    _wait_kb_ready(headers, policy_kb_id)
    print(f"Policy knowledge base is ready: {policy_kb_id}")
    return policy_kb_id
```

Use the knowledge base ID returned by the create API to initialize the customer service assistant:

```python
policy_kb_id = create_policy_knowledge_base()
assistant = CustomerServiceAssistant(policy_kb_id)
```

## Step 2: Separate the Write Types

Use different write views for the user and the Agent:

```python
USER_WRITE_VIEWS = ["detail_factual", "preference"]
AGENT_SKILL_WRITE_VIEWS = ["skill"]
USER_CONTEXT_VIEWS = ["detail_factual", "preference"]
AGENT_CONTEXT_VIEWS = ["detail_factual", "skill"]
```

This lets the same task record enter two memory spaces without generating duplicate memory types.

### Write User Facts and Preferences

The first `/add/message` request passes only `user_id`:

```python
def add_user_memories(self, messages, user_id, conversation_id, channel):
    """First write: generate only facts and preferences from the user's perspective."""
    user_data = {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "info": {"channel": channel, "scene": "consumer_support"},
        "allow_memory_view": USER_WRITE_VIEWS,
        "messages": messages,
    }
    self._post_memory(user_data, "User facts and preferences", timeout_seconds=120)
```

MemOS decides whether the conversation contains a fact or preference worth storing. If a turn does not express a stable preference, it may generate only facts.

### Write Agent Skills

The second `/add/message` request passes only `agent_id` and allows only Skill generation:

```python
def add_agent_skill(self, messages, conversation_id, channel):
    """Second write: request Skill creation or update from the Agent's perspective."""
    skill_data = {
        "agent_id": AGENT_ID,
        "conversation_id": conversation_id,
        "info": {"channel": channel, "scene": "consumer_support"},
        "allow_memory_view": AGENT_SKILL_WRITE_VIEWS,
        "custom_extract_prompt": {"skill": SKILL_EXTRACT_PROMPT},
        "messages": messages,
    }
    self._post_memory(skill_data, "Agent Skill", timeout_seconds=300)
```

Run this write after every response. The caller only declares that the request may generate a Skill and does not try to predict whether the current conversation should produce one. MemOS evaluates the task trace and existing Skills, then decides whether to create, update, or skip a Skill.

## Step 3: Keep Skills General

MemOS handles Skill extraction. Use `custom_extract_prompt.skill` to add generalization requirements for the customer service scenario:

- Compare Skills by business goal, trigger conditions, core tool sequence, and success criteria.
- Merge into an existing Skill when the workflow is equivalent, and avoid duplicates when there is no new reusable information.
- Remove names, addresses, user IDs, order numbers, ticket numbers, and specific dates.
- Replace instance values with parameters such as `order_id`, `ticket_id`, and `shipping_address`.
- Do not turn personal preferences or one-time timing requirements into general rules.
- Keep only execution steps supported by tool results.

MemOS compares the new task with existing Skills and handles similarity and updates. The caller does not need to manage Skill IDs or implement merge logic.

## Step 4: Run Two Retrievals

Before generating a response, retrieve user context separately from Agent Skills and policy knowledge.

### Retrieve User Facts and Preferences

Use `user_id` as the subject for the first retrieval, and request only the current user's facts and preferences:

```python
context_data = {
    "query": query,
    "user_id": user_id,
    "conversation_id": conversation_id,
    "include_memory_view": USER_CONTEXT_VIEWS,
    "memory_limit_number": 9,
    "preference_limit_number": 6,
}
```

The response contains only facts and preferences for the current user.

### Retrieve Agent Skills and Policies

Use the stable `agent_id` as the subject for the second retrieval, and include the policy knowledge base in the same search:

```python
agent_data = {
    "query": f"General methods needed to handle this customer service request: {query}",
    "agent_id": AGENT_ID,
    "knowledgebase_ids": self.knowledgebase_ids,
    "include_memory_view": AGENT_CONTEXT_VIEWS,
    "memory_limit_number": 9,
}
```

This keeps user facts and preferences in the user perspective while making general Skills and official policies available to the customer service Agent. Different users can reuse the same Agent Skills, and policy responses remain consistent.

## Step 5: Write Back the Complete Task Trace

Use `role_id` on each message to identify the actual speaker. User messages use `user_id`; customer service responses and tool calls use `agent_id`:

```python
memory_messages = [
    {"role": "user", "role_id": user_id, "content": query}
]

# Tool-call messages use role_id=AGENT_ID
# Tool results are linked to their calls through tool_call_id

memory_messages.append({
    "role": "assistant",
    "role_id": AGENT_ID,
    "content": reply,
})
```

The customer service Agent maintains the current session history in the business application. When writing to MemOS, combine the user request, tool calls, tool results, and final response into a complete task record:

```text
user
→ assistant.tool_calls
→ tool
→ assistant
```

The complete trace is used for Skill extraction. User facts and preferences are generated from the same record.

## Step 6: Verify the Memory Behavior

After completing the integration, verify reads, writes, and isolation across the three stages:

1. After the DAY 1 exchange task, confirm that user facts and preferences are written to the User Cube and that the same task record is submitted to the Agent Cube for Skill evaluation.
2. On DAY 4, use a new `conversation_id` and confirm that `customer_001` still retrieves the earlier order, product issue, and notification preference.
3. On DAY 7, use `customer_002` and confirm that it does not receive the first customer's personal facts but can retrieve general Skills from the current customer service Agent.

When user memory, Agent Skills, and the policy knowledge base have clear boundaries, the customer service Agent can remember the current user, follow consistent policies, and turn completed tasks into reusable workflows.

## Complete Demo

Expand the code block below and use the copy button in the upper-right corner to copy everything. Save it as `app.py`, fill in the values under **Demo configuration**, and run it locally.

<details class="not-prose my-5 rounded-md border border-default bg-muted/30 px-4 py-3">
  <summary class="cursor-pointer select-none text-sm font-medium text-highlighted">
    Expand and copy the complete Python demo
  </summary>
  <div class="mt-4">

```python
# -*- coding: utf-8 -*-
"""
MemOS customer service best practice: a cross-channel, memory-enhanced
customer service Agent.

Scenario: consumer after-sales support. MemOS provides the customer service
Agent with three capabilities:

1. Each turn requests separate writes for user facts/preferences and Agent
   Skills. MemOS decides what should actually be stored.
2. After-sales policies are stored in a policy knowledge base and retrieved
   together with Agent memory.
3. Facts and preferences are retrieved by user_id, while Skills are retrieved
   from the Agent perspective and reused across users.

The demo enables only three memory types: facts, preferences, and Skills.
MemOS automatically distills Skills from complete task traces
(user → assistant.tool_calls → tool → assistant). Skill generation is
asynchronous and does not require a pre-uploaded Skill.

Run:
    pip install openai requests

    # Fill in each value under "Demo configuration" below.
    python app.py
"""

import base64
import sys
import time
from datetime import datetime

import requests

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

# ---------------------------------------------------------------------------
# Demo configuration
# ---------------------------------------------------------------------------

MEMOS_API_KEY = "YOUR_MEMOS_API_KEY"
OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"
MEMOS_BASE_URL = "https://memos.memtensor.cn/api/openmem/v1"
OPENAI_MODEL = "YOUR_MODEL_NAME"
OPENAI_BASE_URL = "YOUR_OPENAI_BASE_URL"
AGENT_ID = "YOUR_AGENT_ID"

# The user and Agent write different memory types; retrieval also uses two paths.
USER_WRITE_VIEWS = ["detail_factual", "preference"]
AGENT_SKILL_WRITE_VIEWS = ["skill"]
USER_CONTEXT_VIEWS = ["detail_factual", "preference"]
AGENT_CONTEXT_VIEWS = ["detail_factual", "skill"]

SKILL_EXTRACT_PROMPT = """Distill a reusable, cross-user Skill from the complete
customer service task trace.

Define Skill identity by its business goal, trigger conditions, core tool
sequence, and success criteria. Compare against existing Skills before
extracting a new one:
- If an existing Skill covers the same goal, trigger conditions, and core tool
  sequence, merge the new information into that Skill instead of creating a
  duplicate.
- If this trace adds no reusable steps, decision branches, or supporting
  evidence, do not generate a Skill.
- Create a new Skill only when the business goal or core workflow is
  materially different.

Generalize all Skill content:
- Remove names, contact details, addresses, user IDs, Agent IDs, conversation
  IDs, order numbers, ticket numbers, and specific dates.
- Replace instance values with parameters such as order_id, ticket_id, and
  shipping_address.
- Do not retain personal preferences or turn one user's timing or notification
  requirements into general rules.
- Do not copy specific policy conclusions. Describe only that the current
  policy must be queried and validated.
- Keep only steps supported by tool results. Do not present model suggestions
  or unexecuted actions as verified experience.

Use a stable, concise Skill name based on the issue type and handling goal.
Do not include user or case information in the name.
"""

# Memories below this relevance score are not added to the prompt.
RELATIVITY_THRESHOLD = 0.5

# ---------------------------------------------------------------------------
# Example policy uploaded to the policy knowledge base
# ---------------------------------------------------------------------------

POLICY_DOC_MD = """# Consumer After-Sales Policy (Example)

## Returns and exchanges
- Unopened products that remain fit for resale can be returned within seven
  days after delivery.
- Products with performance defects can be exchanged within 15 days, with
  shipping covered in both directions.
- Customized products are not eligible for no-reason returns or exchanges.

## Warranty
- The main device is covered for 12 months, and included accessories for six
  months.
- Non-human-caused damage is repaired free of charge during the warranty.
  Human-caused damage is repaired at cost.

## Shipping
- SF Express is the default carrier. The system sends the tracking number by
  SMS after the replacement ships.
- The delivery address can be changed once before the replacement ships.

## Invoices
- Electronic standard invoices are issued by default and can be requested
  from the order page after the order is completed.
"""


# ---------------------------------------------------------------------------
# Customer service Agent: retrieve memory -> build prompt -> generate -> write
# ---------------------------------------------------------------------------

class CustomerServiceAssistant:
    def __init__(self, policy_kb_id):
        self.openai_client = OpenAI(
            api_key=OPENAI_API_KEY,
            base_url=OPENAI_BASE_URL or None,
        )
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {MEMOS_API_KEY}",
        }
        self.knowledgebase_ids = [policy_kb_id]
        # The Agent owns current-session history; MemOS handles long-term memory.
        self.conversation_histories = {}

    # ---- MemOS reads and writes ----

    def search_memory(self, query, user_id, conversation_id):
        """Retrieve user facts/preferences and Agent Skills/policies separately."""
        agent_data = {
            "query": f"General methods needed for this support request: {query}",
            "agent_id": AGENT_ID,
            "knowledgebase_ids": self.knowledgebase_ids,
            "include_memory_view": AGENT_CONTEXT_VIEWS,
            "memory_limit_number": 9,
        }
        agent_res = requests.post(
            f"{MEMOS_BASE_URL}/search/memory",
            headers=self.headers,
            json=agent_data,
        )
        agent_body = agent_res.json()
        if agent_body.get("code") == 0:
            agent_result = agent_body.get("data") or {}
            policy_memories = [
                item for item in agent_result.get("memory_detail_list", [])
                if item.get("relativity", 0) >= RELATIVITY_THRESHOLD
            ]
            skills = agent_result.get("skill_detail_list", [])
        else:
            print(
                "  [MemOS] Failed to retrieve Agent Skills and policies: "
                f"{agent_body.get('message')}"
            )
            policy_memories = []
            skills = []

        context_data = {
            "query": query,
            "user_id": user_id,
            "conversation_id": conversation_id,
            "include_memory_view": USER_CONTEXT_VIEWS,
            "memory_limit_number": 9,
            "preference_limit_number": 6,
        }
        context_res = requests.post(
            f"{MEMOS_BASE_URL}/search/memory",
            headers=self.headers,
            json=context_data,
        )
        context_body = context_res.json()
        if context_body.get("code") == 0:
            context_result = context_body.get("data", {})
        else:
            print(
                "  [MemOS] Failed to retrieve user context: "
                f"{context_body.get('message')}"
            )
            context_result = {}

        user_memories = [
            item for item in context_result.get("memory_detail_list", [])
            if item.get("relativity", 0) >= RELATIVITY_THRESHOLD
        ]
        preferences = context_result.get("preference_detail_list", [])
        return [*user_memories, *policy_memories], preferences, skills

    def add_user_memories(self, messages, user_id, conversation_id, channel):
        """First write: generate only facts and preferences for the user."""
        user_data = {
            "user_id": user_id,
            "conversation_id": conversation_id,
            "info": {"channel": channel, "scene": "consumer_support"},
            "allow_memory_view": USER_WRITE_VIEWS,
            "messages": messages,
        }
        self._post_memory(user_data, "user facts and preferences", timeout_seconds=120)

    def add_agent_skill(self, messages, conversation_id, channel):
        """Second write: request a Skill create or update for the Agent."""
        skill_data = {
            "agent_id": AGENT_ID,
            "conversation_id": conversation_id,
            "info": {"channel": channel, "scene": "consumer_support"},
            "allow_memory_view": AGENT_SKILL_WRITE_VIEWS,
            "custom_extract_prompt": {"skill": SKILL_EXTRACT_PROMPT},
            "messages": messages,
        }
        self._post_memory(skill_data, "Agent Skill", timeout_seconds=300)

    def _post_memory(self, data, label, timeout_seconds):
        res = requests.post(
            f"{MEMOS_BASE_URL}/add/message", headers=self.headers, json=data
        )
        body = res.json()
        if body.get("code") != 0:
            print(f"  [MemOS] Failed to write {label}: {body.get('message')}")
            return

        details = body.get("data") or {}
        if details.get("status") == "running" and details.get("task_id"):
            self._wait_for_task(details["task_id"], label, timeout_seconds)

    def _wait_for_task(self, task_id, label, timeout_seconds):
        """Wait for an asynchronous memory task to finish."""
        deadline = time.time() + timeout_seconds
        while time.time() < deadline:
            time.sleep(2)
            res = requests.post(
                f"{MEMOS_BASE_URL}/get/status",
                headers=self.headers,
                json={"task_id": task_id},
            )
            body = res.json()
            if body.get("code") != 0:
                sys.exit(f"Failed to query memory task: {body.get('message')}")
            status = (body.get("data") or {}).get("status")
            if status == "completed":
                print(f"  [MemOS] Finished writing {label}")
                return
            if status in {"failed", "error", "cancelled", "canceled"}:
                sys.exit(f"Memory task failed: {task_id} -> {status}")
        sys.exit(f"Timed out waiting for {label}: {task_id}")

    # ---- Prompt and generation ----

    def build_system_prompt(self, channel, memories, preferences, skills):
        channel_name = {
            "webchat": "web chat",
            "email": "email ticket",
        }.get(channel, channel)

        memory_text = "\n".join(
            f"{i}. {item.get('memory_value')}"
            for i, item in enumerate(memories, 1)
        ) or "(No relevant memories)"
        preference_text = "\n".join(
            f"{i}. {item.get('preference')}"
            for i, item in enumerate(preferences, 1)
        ) or "(No preference records)"
        # Inject only Skills with structured content.
        valid_skills = [
            item for item in skills
            if isinstance(item.get("skill_value"), dict)
            and item["skill_value"].get("name")
        ]
        skill_text = "\n".join(
            f"{i}. {item['skill_value']}"
            for i, item in enumerate(valid_skills, 1)
        ) or "(No matching Skills)"

        return f"""# Role
You are the brand's official customer service Agent, currently helping a
consumer through {channel_name}.
Use the retrieved memories, preferences, after-sales policies, and Skills to
give an accurate, personalized, and actionable response.

# Current time
{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

# Retrieved user memories, policies, and Agent Skills
<agent_memories>
{memory_text}
</agent_memories>

<preferences>
{preference_text}
</preferences>

<skills>
{skill_text}
</skills>

# Memory safety rules
1. Distinguish the consumer's direct statements from system inferences. Treat
   inferences only as supporting context and give direct statements priority.
2. Confirm that a memory describes the current consumer, not another user or
   a historical example. Never mix information between users.
3. Use only memories directly relevant to the current request. Ignore keyword
   matches from a different context.
4. If a memory conflicts with the consumer's latest message, follow the latest
   message.
5. For policies, timelines, and monetary amounts, follow the policy knowledge
   base.

# Response requirements
1. Answer directly. Do not mention internal concepts such as memory or
   retrieval to the consumer.
2. Proactively continue open cases without asking the consumer to repeat
   information they already provided.
3. Respond in the same language as the consumer."""

    def generate_reply(self, system_prompt, messages):
        response = self.openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "system", "content": system_prompt}, *messages],
            temperature=0.3,
            top_p=0.9,
        )
        return response.choices[0].message.content

    # ---- Main flow ----

    def chat(self, query, user_id, conversation_id, channel, tool_steps=None):
        # 1. Read current-session history from the Agent's own state.
        history_key = (user_id, conversation_id)
        history = self.conversation_histories.get(history_key, [])

        # 2. Retrieve facts/preferences and Agent Skills/policies separately.
        memories, preferences, skills = self.search_memory(
            query, user_id, conversation_id
        )
        self._print_retrieved(memories, preferences, skills)

        # 3. Build the task trace and generate a response from tool results.
        llm_turn = [{"role": "user", "content": query}]
        memory_messages = [{"role": "user", "role_id": user_id, "content": query}]
        for step in tool_steps or []:
            tool_call = {
                "role": "assistant",
                "content": "",
                "tool_calls": [{
                    "id": step["id"],
                    "type": "function",
                    "function": {
                        "name": step["name"],
                        "arguments": step["arguments"],
                    },
                }],
            }
            tool_result = {
                "role": "tool",
                "tool_call_id": step["id"],
                "content": step["result"],
            }
            llm_turn.extend([tool_call, tool_result])
            memory_messages.extend([
                {**tool_call, "role_id": AGENT_ID},
                tool_result,
            ])

        system_prompt = self.build_system_prompt(
            channel, memories, preferences, skills
        )
        reply = self.generate_reply(system_prompt, [*history, *llm_turn])

        # 4. Save the session locally and write user context and Agent Skills.
        self.conversation_histories.setdefault(history_key, []).extend([
            {"role": "user", "content": query},
            {"role": "assistant", "content": reply},
        ])
        memory_messages.append({
            "role": "assistant",
            "role_id": AGENT_ID,
            "content": reply,
        })
        self.add_user_memories(memory_messages, user_id, conversation_id, channel)
        self.add_agent_skill(memory_messages, conversation_id, channel)
        return reply

    @staticmethod
    def _print_retrieved(memories, preferences, skills):
        print("  ---- Retrieved MemOS Agent memory ----")
        for item in memories:
            value = str(item.get("memory_value", "")).replace("\n", " ")
            print(f"  [Memory {item.get('relativity', 0):.2f}] {value[:80]}")
        for item in preferences:
            print(f"  [Preference] {item.get('preference')}")
        for item in skills:
            value = item.get("skill_value") or {}
            label = value.get("name") or f"id={item.get('id')}"
            print(f"  [Skill {item.get('relativity', 0):.2f}] {label}")
            print(f"  [Skill details] {value}")
        print("  --------------------------------------")


# ---------------------------------------------------------------------------
# Initialize the policy knowledge base
# ---------------------------------------------------------------------------

def _b64_md(text):
    encoded = base64.b64encode(text.encode("utf-8")).decode("utf-8")
    return f"data:text/markdown;base64,{encoded}"


def _create_kb(headers, name, description):
    res = requests.post(
        f"{MEMOS_BASE_URL}/create/knowledgebase",
        headers=headers,
        json={"knowledgebase_name": name, "knowledgebase_description": description},
    )
    body = res.json()
    if body.get("code") != 0:
        sys.exit(f"Failed to create knowledge base: {body.get('message')}")
    kb_id = (
        body.get("data", {}).get("id")
        or body.get("data", {}).get("knowledgebase_id")
    )
    if not kb_id:
        sys.exit(f"Knowledge base created, but no ID was returned: {name}")
    print(f"Knowledge base created: {name} -> {kb_id}")
    return kb_id


def _upload_file(headers, kb_id, name, text):
    res = requests.post(
        f"{MEMOS_BASE_URL}/add/knowledgebase-file",
        headers=headers,
        json={
            "knowledgebase_id": kb_id,
            "file": [{"type": "document", "name": name, "content": _b64_md(text)}],
        },
    )
    if res.json().get("code") != 0:
        sys.exit(f"Failed to upload policy: {res.json().get('message')}")


def _wait_kb_ready(headers, kb_id):
    for _ in range(40):
        time.sleep(3)
        res = requests.post(
            f"{MEMOS_BASE_URL}/get/knowledgebase-file",
            headers=headers,
            json={"knowledgebase_id": kb_id, "page": 1, "page_size": 20},
        )
        files = res.json().get("data", {}).get("file_detail_list", [])
        statuses = {str(item.get("status", "")).lower() for item in files}
        if files and statuses <= {"completed", "available", "failed"}:
            if "failed" in statuses:
                sys.exit(f"Policy processing failed for knowledge base {kb_id}")
            return
    sys.exit(f"Timed out waiting for policy knowledge base {kb_id}")


def create_policy_knowledge_base():
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Token {MEMOS_API_KEY}",
    }
    policy_kb_id = _create_kb(
        headers,
        "Consumer After-Sales Policy",
        "Policies for returns, exchanges, warranties, shipping, and invoices",
    )
    _upload_file(
        headers,
        policy_kb_id,
        "consumer-after-sale-policy.md",
        POLICY_DOC_MD,
    )
    print("Policy uploaded. Waiting for processing...")
    _wait_kb_ready(headers, policy_kb_id)
    print(f"Policy knowledge base is ready: {policy_kb_id}")
    return policy_kb_id


# ---------------------------------------------------------------------------
# Demo: isolate user context and reuse Agent Skills across users
# ---------------------------------------------------------------------------

CUSTOMER_ID = "customer_001"    # Use a stable authenticated user ID in production.
CUSTOMER_ID_2 = "customer_002"  # Verifies Skill reuse and user isolation.


def run_demo():
    policy_kb_id = create_policy_knowledge_base()
    assistant = CustomerServiceAssistant(policy_kb_id)

    print("=" * 64)
    print("DAY 1 · Web chat: exchange request with delivery preferences")
    print("=" * 64)
    chat_conv = "conv_chat_0821"

    q1 = (
        "Hi, I received order 20260820-88 on August 20. The left side of the "
        "noise-canceling headset has a strong buzzing noise, and I want to "
        "exchange it."
    )
    print(f"\n[Consumer] {q1}")
    # The Agent's actual work in order, ticket, and notification systems is
    # written to MemOS as task-trace material for Skill extraction.
    tool_steps = [
        {
            "id": "call_1",
            "name": "query_order",
            "arguments": '{"order_id": "20260820-88"}',
            "result": (
                '{"order_id": "20260820-88", "product": '
                '"noise-canceling headset", "sign_date": "2026-08-20", '
                '"status": "delivered"}'
            ),
        },
        {
            "id": "call_2",
            "name": "check_exchange_policy",
            "arguments": (
                '{"order_id": "20260820-88", '
                '"issue": "buzzing noise in left side"}'
            ),
            "result": (
                '{"eligible": true, "policy": "15-day exchange for performance '
                'defects", "shipping": "covered both ways"}'
            ),
        },
        {
            "id": "call_3",
            "name": "create_exchange_ticket",
            "arguments": (
                '{"order_id": "20260820-88", '
                '"reason": "buzzing noise in left side", '
                '"type": "defective product exchange"}'
            ),
            "result": (
                '{"ticket_id": "EX20260821-03", "status": "created"}'
            ),
        },
        {
            "id": "call_4",
            "name": "update_ticket",
            "arguments": (
                '{"ticket_id": "EX20260821-03", '
                '"address": "100 Century Avenue, Pudong, Shanghai", '
                '"deliver_before": "Friday", "notify": "sms"}'
            ),
            "result": '{"ticket_id": "EX20260821-03", "updated": true}',
        },
        {
            "id": "call_5",
            "name": "schedule_notification",
            "arguments": (
                '{"ticket_id": "EX20260821-03", "channel": "sms", '
                '"events": ["shipped", "out for delivery"]}'
            ),
            "result": '{"scheduled": true, "channel": "sms"}',
        },
    ]
    print(
        f"[Customer Service] "
        f"{assistant.chat(q1, CUSTOMER_ID, chat_conv, 'webchat', tool_steps=tool_steps)}"
    )

    q2 = (
        "One more thing: I am traveling next week. Please send the replacement "
        "to my office at 100 Century Avenue, Pudong, Shanghai by Friday, and "
        "send progress updates by SMS."
    )
    print(f"\n[Consumer] {q2}")
    print(f"[Customer Service] {assistant.chat(q2, CUSTOMER_ID, chat_conv, 'webchat')}")

    print()
    print("=" * 64)
    print("DAY 4 · Email ticket: same consumer, new session and channel")
    print("=" * 64)
    mail_conv = "conv_mail_0824"

    q3 = "Hi, what is the status of the headset exchange I reported earlier?"
    print(f"\n[Consumer] {q3}")
    print(f"[Customer Service] {assistant.chat(q3, CUSTOMER_ID, mail_conv, 'email')}")

    print()
    print("=" * 64)
    print("DAY 7 · Web chat: another consumer with a similar issue")
    print("=" * 64)
    conv_2 = "conv_chat_0828"

    q4 = "Hi, my new noise-canceling headset has a buzzing noise. What should I do?"
    print(f"\n[Consumer] {q4}")
    print(f"[Customer Service] {assistant.chat(q4, CUSTOMER_ID_2, conv_2, 'webchat')}")

    print()
    print("Demo complete. Verify these three points:")
    print("1. The User Cube generates only facts and preferences; the Agent Cube")
    print("   generates only Skills.")
    print("2. DAY 4 retrieves facts and preferences from customer_001 memory.")
    print("3. DAY 7 does not expose facts or preferences from customer_001, but")
    print(f"   it can retrieve generalized Skills from {AGENT_ID}.")


if __name__ == "__main__":
    config = {
        "MEMOS_API_KEY": MEMOS_API_KEY,
        "OPENAI_API_KEY": OPENAI_API_KEY,
        "MEMOS_BASE_URL": MEMOS_BASE_URL,
        "OPENAI_MODEL": OPENAI_MODEL,
        "OPENAI_BASE_URL": OPENAI_BASE_URL,
        "AGENT_ID": AGENT_ID,
    }
    missing = [
        name
        for name, value in config.items()
        if not value or value.startswith("YOUR_")
    ]
    if missing:
        sys.exit(f"Configure these values at the top of the file: {', '.join(missing)}")
    if OpenAI is None:
        sys.exit("Install the OpenAI SDK first: pip install openai")
    run_demo()
```

  </div>
</details>
