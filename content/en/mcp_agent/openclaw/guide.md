---
title: OpenClaw Configuration Guide
desc: Follow the steps below to enable memory capabilities for your Agent in just a few minutes.
---

## MemOS Cloud Two-Step Installation

### 1. Quick Start

Just 3 steps to give your Agent basic memory capabilities.

#### 1.1 Install OpenClaw

Ensure that OpenClaw is installed in your system:

```bash
# Install the latest version
npm install -g openclaw@latest

# Initialize and configure startup
openclaw onboard
```

### 2. Get and Configure API Key

#### 2.1 Get Key

Login/Register on MemOS Cloud to get your API Key 🔗 [MemOS Cloud](https://memos-dashboard.openmem.net/cn/apikeys/)

#### 2.2 Set Variables

Complete the simplest configuration in one command in the terminal:

```bash
mkdir -p ~/.openclaw && echo "MEMOS_API_KEY=mpg-..." > ~/.openclaw/.env
```

#### 2.3 Install Plugin and Test

##### 2.3.1 Install

```bash
openclaw plugins install @memtensor/memos-cloud-openclaw-plugin
openclaw gateway restart
```

* [npm package](https://www.npmjs.com/package/@memtensor/memos-cloud-openclaw-plugin)
* [Github](https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin)

##### 2.3.2 Plugin Will Automatically Start Running

- **Before running**: Retrieve relevant memories from MemOS Cloud and inject into context
- **After running**: Save the current conversation to MemOS Cloud

That's it! The configuration is complete. You can now start testing!

## Open Source Project Advanced Configuration

If you want to unlock more possibilities, you can further explore and configure through the MemOS GitHub project!

### Environment Variable Deep Customization

In addition to the required API Key, you can also adjust plugin behavior through environment variables.

For more detailed configuration options, see the [MemTensor GitHub Official Plugin Repository](https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin)

## Test Memory Functionality

Now, you can have multi-turn conversations with your Agent, for example:

**First Session:**
- "My favorite programming language is Python"
- "I'm developing an e-commerce project"

**Second Session (New Start):**
- "Do you remember what programming language I like to use?"
- "How is the project I mentioned earlier progressing?"

Now, your OpenClaw will retrieve memories from MemOS Cloud and provide accurate answers!
