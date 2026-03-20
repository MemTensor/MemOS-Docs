---
title: OpenClaw Cloud Plugin
desc: Enhance your OpenClaw's memory and reduce token by 60%. MemOS OpenClaw plugin is now live!
---

OpenClaw's going viral lately. But if you've actually used it for a while, you'll find two issues you can hardly avoid:

1. **Tokens burn way too quickly**：OpenClaw can handle many long-tail tasks, but the cost is that each run consumes a huge number of tokens. When you have it monitoring your screen, running scheduled tasks, or handling complex workflows, the token consumption is painfully fast.

    > <b>("u know token is money🫠")</b>

2. **Its memory function is rather poor**：Many claim OpenClaw's memory outperforms ChatGPT. Yet in practice, you'll find it does retain some information—but often not what you need. Crucial preferences may be forgotten, while trivial chatter is remembered in vivid detail.

    > <b>("can u please remember something really matter to me???")</b>

::tip
**NOT OpenClaw's fault, ALL AI agents suffering.**
::

This tutorial guides you through using the MemOS OpenClaw plugin to figure out these 3 pain issues:
- **Significantly reduce token consumption** — intelligently retrieve relevant memories without indiscriminately loading all history
- **Make memories genuinely useful** — professional memory categorisation and management, remembering what should be retained and forgetting what should be discarded
- **Preserve OpenClaw's core strengths** — cross-device control, proactive interaction, and human-like experience remain intact

---

## Why is OpenClaw now a Token Killer🥷？

### Issues with OpenClaw

```plaintext
1st convo: 500 tokens
2nd convo: 500 + 800 = 1,300 tokens
3rd convo: 1,300 + 600 = 1,900 tokens
10th convo: 10,000+ tokens
```

When you have OpenClaw monitoring your screen, performing executive tasks, and running on a schedule, this figure increases even more rapidly.

### Three critical points in OpenClaw's native memory management

OpenClaw's memories reside in local `.md` files, categorised as global memories and daily memories. While this sounds promising, practical use reveals three unavoidable issues:

#### 1. Global memories become booming
As global memories accumulate, context overload ensues. Moreover, these memories persistently interfere with current conversations. You might simply wish to ask a straightforward question, yet it dredges up every utterance from three months prior.

#### 2. Daily memory recall proves difficult
Accumulating daily memories invariably makes retrieval cumbersome. To recall yesterday's activities, one must undergo an additional retrieval process. Maintaining cross-session memory becomes nearly impossible.

#### 3. Memory relies on the model's proactive logging
OpenClaw's memory system relies on the model to log information itself, rather than automatic logging. This means it frequently misses details—you mention something, and it promptly forgets.

> I've encountered this several times myself: I'd explicitly emphasised a particular project configuration, yet when restarting the conversation the next day, it had no recollection whatsoever, requiring me to explain it all over again.

---

## OpenClaw vs OpenClaw + MemOS: Memory Solution Comparison

### OpenClaw Native Memory Solution

#### Memory Storage Solution

**Core Philosophy: File is Truth** — Abandoning opaque vector databases in favor of Markdown files as the core carrier of memory.

![Memory Storage Solution](https://cdn.memtensor.com.cn/img/1772697758585_b155tx_compressed.png)


#### Memory Retrieval Solution: Dual-Engine Drive

| Engine | Technology | Features |
|-----|------|------|
| **Vector Search** | Cosine Similarity | Captures semantic associations, excels at "concept matching", e.g., associating "login flow" with "authentication" |
| **BM25 Search** (Lexical Matching) | FTS5-based lexical matching | Handles "exact tokens", such as error codes, function names, or specific IDs |

**Retrieval Trigger**: Triggered via Prompt, model decides automatically

**Weighted Score Fusion**: `Score = (0.7 * VectorScore) + (0.3 * BM25Score)`

#### Pain Points of Existing Solutions

- **Rudimentary Retrieval Algorithms**: Unstable recall, weak relevance, Agent repeats trial and error, Token accumulates rapidly
- **Excessive Context Injection**: Fixed reading of today + yesterday + long-term memory, high proportion of invalid context
- **Lack of Structure and Deduplication in Memory**: Tool call long outputs are written directly and re-transmitted repeatedly, costs snowball

### OpenClaw + MemOS Memory Solution

![MemOS-OpenClaw](https://cdn.memtensor.com.cn/img/1772679552943_lsuh81_compressed.png)

#### Three Core Effects

**Effect 1: Controllable Token Costs 💰**
> From "Full Context Stuffing" to "Precise Recall per Task"

OpenClaw no longer stuffs today+yesterday+long-term memory every time. Instead, MemOS retrieves the most relevant few memories based on the current task (recall budget/count can be set), significantly reducing the proportion of invalid context and avoiding Token snowballing.

**Effect 2: More Stable and Accurate Retrieval 🎯**
> Reduce repeated trial and error and re-asking, improve one-shot hit rate

MemOS provides stronger memory organization and retrieval capabilities (structured, hierarchical/multi-granular, semantic retrieval + rule filtering, etc.), making OpenClaw's recalled content more relevant and stable, reducing repeated reasoning and confirmation caused by "unstable recall".

**Effect 3: Cleaner and More Usable Memory ✨**
> Structured + Deduplicated + High Compression, avoiding "Long Output Pollution"

Long outputs from tool calls (such as traversal results, config/schema, etc.) are not written back to the context verbatim repeatedly; MemOS can summarize/compress, deduplicate, and archive, making it "cleaner" over long-term operation, with memory quality improving rather than deteriorating over time.

---

## After integrating the MemOS OpenClaw plugin👇🏻

- ✅ Retrieve only 3–5 relevant memories at a time
- ✅ Maintain context stability within 2,000–3,000 tokens
- ✅ Cost remains manageable regardless of dialogue length

### MemOS plugins can enhance your OpenClaw

| 功能 | 说明 |
|-----|------|
| **Automatically remember all conversations** | without relying on models to actively log, ensuring no critical information is missed |
| **Precise recall** | retrieve relevant memories based on current task intent, avoiding irrelevant historical data |
| **Remember user preferences** | categorise and store preference information specifically, remaining effective across sessions |

MemOS OpenClaw has restructured the token consumption model, transforming costs from a ‘historical length function’ into a ‘task relevance function’. Your local OpenClaw costs become manageable, and the system operates more stably.

---

## Quick Start

Three steps to boost your Agent with basic memory capabilities.

### 1. Install OpenClaw

Ensure that the OpenClaw environment is installed on your system:

```bash
# Install the newest version
npm install -g openclaw@latest

# Initialize and configure startup
openclaw onboard
```

### 2. Get and configure your API Key

#### 2.1 Get your Key

Log in to or register with MemOS Cloud to get your API Key  🔗 [MemOS Cloud](https://memos-dashboard.openmem.net/apikeys/)

![image.png](https://cdn.memtensor.com.cn/img/1772443326905_kkxve6_compressed.webp)

#### 2.2 Set Environment Variables

The plugin tries env files in order (**openclaw → moltbot → clawdbot**). For each key, the first file with a value wins.
If none of these files exist (or the key is missing), it falls back to the process environment.

**Where to configure**
- Files (priority order):
  - `~/.openclaw/.env`
  - `~/.moltbot/.env`
  - `~/.clawdbot/.env`
- Each line is `KEY=value`

**Quick setup (shell)**
```bash
echo 'export MEMOS_API_KEY="mpg-..."' >> ~/.zshrc
source ~/.zshrc
# or

echo 'export MEMOS_API_KEY="mpg-..."' >> ~/.bashrc
source ~/.bashrc
```

**Quick setup (Windows PowerShell)**
```powershell
[System.Environment]::SetEnvironmentVariable("MEMOS_API_KEY", "mpg-...", "User")
```

If `MEMOS_API_KEY` is missing, the plugin will warn with setup instructions and the API key URL.

**Minimal config**
```env
MEMOS_API_KEY=YOUR_TOKEN
```

### 3. Install Plugins

#### Option A — NPM (Recommended)

```bash
openclaw plugins install @memtensor/memos-cloud-openclaw-plugin@latest
openclaw gateway restart
```

> Note for Windows Users: If you encounter Error: spawn EINVAL, this is a known issue with OpenClaw's plugin installer on Windows. Please use Option B (Manual Install) below.

Make sure it’s enabled in ~/.openclaw/openclaw.json:

```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": { "enabled": true }
    }
  }
}
```

#### Option B — Manual Install (Workaround for Windows)

1. Download the latest `.tgz` from [NPM](https://www.npmjs.com/package/@memtensor/memos-cloud-openclaw-plugin).
2. Extract it to a local folder (e.g., `C:\Users\YourName\.openclaw\extensions\memos-cloud-openclaw-plugin`).
3. Configure `~/.openclaw/openclaw.json` (or `%USERPROFILE%\.openclaw\openclaw.json`):

```json
{
  "plugins": {
    "entries": {
      "memos-cloud-openclaw-plugin": { "enabled": true }
    },
    "load": {
      "paths": [
        "C:\\Users\\YourName\\.openclaw\\extensions\\memos-cloud-openclaw-plugin\\package"
      ]
    }
  }
}
```

::tip
Note: The extracted folder usually contains a package subfolder. Point to the folder containing package.json.
::

Restart the gateway after config changes.

## Advanced Configuration for Open-Source Projects

If you wanna unlock further possibilities, you may explore and configure additional features via the MemOS GitHub project!

### Deep customisation of environment variables

In addition to the required API Key, you may also adjust the plugin's behaviour via environment variables。

Further configuration details can be found in [the MemTensor official plugin repo](https://github.com/MemTensor/MemOS/tree/main/apps/MemOS-Cloud-OpenClaw-Plugin)

## Testing

Now, you can engage in multi-turn conversations with your Agent, for example:

**First convo:**
- "My favourite programming language is Python"
- "I'm developing an e-commerce project"

**Second convo (new convo):**
- "Do you recall which programming language I prefer?"
- "How is the project I mentioned previously progressing?"

Now, your OpenClaw will retrieve memories from MemOS Cloud and provide accurate responses ✅