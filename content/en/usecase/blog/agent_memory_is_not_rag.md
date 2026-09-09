---
title: "Agent Memory Is Not RAG: A 2026 Production Field Guide"
---

An agent can retrieve a policy PDF, remember that a customer prefers concise answers, keep a workflow alive across tool calls, and query a live order system. Those are four different jobs. Calling all of them “memory” makes production design—and vendor comparison—needlessly vague.

The useful distinction is simple. Retrieval-augmented generation (RAG) finds external evidence needed to answer now. Agent memory preserves useful state across turns, sessions, or workflows. A larger context window gives a model more working material for one inference; it does not itself decide what should persist, update an outdated preference, or enforce a deletion request. Oracle’s developer guidance makes the same operational point: durable memory needs explicit identity and scope, provenance, lifecycle rules, and permission-aware recall. [Oracle Developers](https://blogs.oracle.com/developers/agent-memory-is-not-rag)

That is why “we have a vector database” is not an answer to “how does our agent remember?” A vector index can be an excellent retrieval component. It is not, by itself, a policy for promotion, correction, expiration, isolation, or audit.

Choosing an AI memory solution starts with understanding what you need it to remember, where that information should be available, and how it should change over time. Different products approach these needs through memory APIs, temporal graphs, stateful agents, or broader memory-management systems.

In this guide, we compare Mem0, Zep/Graphiti, Letta, MemOS, and Supermemory across memory lifecycle, retrieval, deployment, and application fit. We explain where MemOS fits among these approaches and outline the questions that can help you choose a solution for your workflow. The goal is to make the differences clear enough to support a practical decision, whether you are exploring AI memory or evaluating a system for production.

## Start with the four layers

**Prompt context** is the bounded set of tokens visible to the model for a specific inference. It can include the current user message, system instructions, tool outputs, a running summary, retrieved documents, and selected memories. Context engineering is the process of selecting, filtering, compressing, and refreshing that set at decision time—not merely writing a better prompt. [Redis](https://redis.io/blog/ai-agent-context/)

**RAG** retrieves evidence from a corpus: source documents, records, tables, or other authorized materials. Its primary obligation is grounding: use relevant, accessible, current source material and preserve enough provenance for the answer to be checked. RAG may be stateless. A good RAG pipeline uses tenant and ACL filters, document versions, chunking or structured retrieval, and citations where the user needs evidence. It is the right mechanism for “What does the current policy say?”

**A vector database or vector index** stores embeddings and enables similarity retrieval; many products also provide filtering, keyword search, metadata, or hybrid retrieval. It is infrastructure, not an agent-memory policy. It can power RAG, semantic recall, or both. It does not decide whether “the user changed their preferred language yesterday” supersedes an old fact, nor does it supply a cross-session identity model.

**Agent memory** is durable, scoped state selected for later use. Its units are typically preferences, facts with timestamps, task state, summaries, decisions, learned procedures, or previously validated tool results. The hard problems are not only storage and search. They are promotion (what gets saved), scope (which user, tenant, agent, thread, and permission context may retrieve it), evolution (what updates or invalidates it), and governance (who can inspect, correct, delete, or audit it).

In a production stack, these layers often coexist. A support agent might assemble: current prompt instructions; a thread summary; customer memories scoped to the customer and tenant; policy citations from RAG; and real-time account status from a tool. Do not replace the last item with memory: live operational data should remain a live source of truth.

## Where MemOS fits

We built MemOS to make long-term memory a manageable part of AI applications and agents. It provides a dedicated layer for retaining useful context, retrieving it when relevant, and updating it as preferences, facts, and tasks change. This supports applications that need continuity across conversations, personalized interactions, or reusable context across agent workflows.

MemOS combines memory storage and retrieval with support for multiple memory types and memory scheduling. Its Cloud API provides operations for adding conversations, searching memories, updating and deleting records, and incorporating feedback to correct remembered information. Filters, tags, asynchronous processing, knowledge-base features, and chat APIs support different integration needs.

You can access MemOS through our managed Cloud service, open-source framework, and supported agent integrations. These options let you choose how much infrastructure you want to operate and how closely you want to customize memory behavior for your application.

[MemOS website](https://memos.openmem.net/) · [MemOS Cloud overview](https://memos-docs.openmem.net/memos_cloud/getting_started/overview/) · [MemOS API overview](https://memos-docs.openmem.net/api_docs/start/overview/) · [MemOS GitHub](https://github.com/MemTensor/MemOS)

MemTensor is the company behind MemOS. We build memory infrastructure for AI applications and research long-term memory and continual learning, with the goals of reducing hallucinations, improving personalization, and helping AI systems make better use of prior experience.

Our work spans Memory³ research, the MemOS memory system, agent memory infrastructure, and research into foundation models with native memory. Across these efforts, we connect research with practical systems for storing, retrieving, and maintaining useful information over time. MemOS brings this focus into applications that need to carry context beyond a single conversation.

> **Product boundary: MemOS is not Memmy.**
>
> MemOS and Memmy address different needs within our product lineup. MemOS provides memory capabilities for AI applications and agents through APIs, open-source components, and integrations. It is suited to workflows where memory needs to become part of an application or an existing agent setup, with a choice of managed services and components you can operate yourself.
>
> Memmy is our personal AI agent and local memory hub. It brings together a desktop app, a local memory service, a CLI, and integrations that help individuals reuse context across supported AI tools. Its focus is the day-to-day experience of maintaining personal context and continuing work across connected agents.
>
> Choose MemOS when you want to add or customize memory capabilities in an application or agent workflow. Choose Memmy when you want a personal agent and local memory hub that brings supported tools together around shared context.
>
> [Memmy website](https://memmy.bot/) · [Memmy official GitHub](https://github.com/MemTensor/memmy-agent)

## A production selection rubric

Before comparing products, write a one-page memory contract. Name the data classes you may store; the scopes that must never cross; who owns correction and deletion; the authoritative sources of truth; and the failure behavior when memory is unavailable. Then evaluate products against these seven dimensions.

### 1. Lifecycle

Can the system selectively add, update, delete, expire, merge, or roll back memories? Can the application keep a raw event, an extracted memory, and the rule that promoted it separate? Look for timestamps, source references, conflict handling, retention controls, and an explicit correction path. “We embed every message” is ingestion, not lifecycle design.

### 2. Retrieval and context assembly

Ask what is retrieved—documents, facts, graph edges, profiles, memory blocks, summaries, or a mix—and how filtering happens before generation. Test tenant, user, agent, conversation, time, memory type, and permission filters. Evaluate result quality and context budget together: a relevant ten-line memory may be more useful than twenty similar chunks. Retrieval should be measurable by task quality, leakage rate, recall precision, and added latency.

### 3. Deployment and data boundary

Choose an operating model before choosing an SDK. Does the public documentation show a library, a self-hosted service, a managed cloud service, or multiple paths? Identify each dependency: model provider, embeddings, database, graph store, object store, telemetry service, and outbound network path. A self-hosted package does not automatically establish a complete private-deployment architecture or every enterprise control.

### 4. Governance and isolation

Treat a memory read as a data access decision. Require explicit tenant, user, agent, thread or conversation, request, and permission identifiers where relevant. Define redaction and secret-exclusion rules before ingestion. Verify per-scope deletion, correction, retention, access control, and audit evidence in the exact product edition you will run. Cloudflare’s agent-memory discussion similarly frames scoped, durable state—not a growing transcript—as the operating problem. [Cloudflare](https://blog.cloudflare.com/introducing-agent-memory/)

### 5. Observability

For each model turn, record the retrieval request, filters, candidate IDs, selected memory IDs, source/provenance, timestamps, token count, model response, and user feedback. Instrument promotion, mutation, deletion, and rollback separately. You need to answer: “Why was this item supplied?” and “Why was this old item still present?” without dumping sensitive memory into logs.

### 6. Ecosystem and application fit

Evaluate the interfaces you will actually use: Python, TypeScript, REST, MCP, agent frameworks, tool calling, or cloud platform. Prefer an integration path that preserves your identity and authorization model. Availability of an integration is not evidence that it implements your organization’s governance policy.

### 7. Operational maturity in your environment

Maturity is not a star count, a benchmark result, or a product label. Test upgrade behavior, backups, disaster recovery, model-provider failures, rate limits, schema changes, migrations, and incident support against your requirements. Public sources can establish that code, docs, or a deployment option exist; they do not establish that a product meets your particular SLA or compliance program.

## Five AI memory solutions compared

### Mem0

**Overview.** Mem0’s official repository documents a memory library, a self-hosted server, and a managed platform. The self-hosted setup uses Docker Compose and documents default-on authentication, an administrator/bootstrap flow, API keys, and a dashboard. The same repository documents Python and npm installation and a CLI with add and search commands keyed by a user ID. Its repository is published under Apache-2.0. [Mem0 repository](https://github.com/mem0ai/mem0) · [self-hosted setup](https://github.com/mem0ai/mem0/blob/main/docs/open-source/setup.mdx)

**Best suited for.** Consider Mem0 when a team wants a memory-focused integration surface and can choose among library, managed, or self-hosted paths. Its documented self-hosted path gives a concrete starting point for teams that will operate their own stack; the hosted platform is a separate operating choice.

**What to consider** Confirm how the extraction and retrieval configuration behaves for corrections, conflicting facts, per-tenant isolation, deletion propagation, and your own authorization model. Benchmark retrieval quality and cost with your model and data rather than assuming an SDK abstraction selects the right memory.

### Zep/Graphiti

**Overview.** Graphiti and Zep are related but distinct choices. Graphiti is Zep’s Apache-2.0 open-source temporal context-graph framework; its repository documents episode ingestion, hybrid retrieval, graph-distance reranking, an MCP server, and graph-store options. Zep is a managed agent-memory service built on Graphiti. Zep’s documentation describes users and threads, context assembly, and deployment and governance options including Zep Cloud, BYOK, and BYOC. [Graphiti repository](https://github.com/getzep/graphiti) · [Zep versus Graphiti](https://help.getzep.com/zep-vs-graphiti) · [Zep concepts](https://help.getzep.com/concepts) · [Zep security and compliance](https://help.getzep.com/v3/security-compliance)

**Best suited for.** Consider Graphiti when temporal relationships and graph-aware retrieval are central and the team wants to build and operate the surrounding memory service. Consider Zep when the same class of context-graph capability is wanted as a managed service with documented user/thread abstractions and enterprise deployment options.

**Trade-offs to test.** Graphiti puts graph infrastructure, extraction, entity resolution, temporal invalidation, concurrency, and authorization design on the implementing team. Zep reduces some of that operating burden but introduces a commercial service, contract, and data-boundary decision. In either path, test whether time-bounded relationships improve the real task enough to justify the additional graph and ingestion complexity.

### Letta

**Overview.** Letta presents a platform for building stateful agents and documents an API, Python and TypeScript clients, self-hosted base-URL use, and memory blocks that can be attached to or detached from agents. The official repository is Apache-2.0 and calls Letta an open-source project; it also documents a local CLI and an API path. The official TypeScript documentation describes sharing a block by attaching it to more than one agent. [Letta repository](https://github.com/letta-ai/letta) · [Letta TypeScript documentation](https://docs.letta.com/api/typescript)

**Best suited for.** Consider Letta when memory is closely coupled to the agent runtime and an agent-centric state model—rather than an independently selected retrieval service—is the intended abstraction. Shared blocks may be useful when shared-agent context is deliberate and access-controlled.

**Trade-offs to test.** Agent-attached memory can be compelling, but teams should test isolation, block sharing, edits, deletion, export, model behavior, tool state, and migration as first-class cases. Decide whether your system needs portable application-level memory independent of a single agent runtime.

### MemOS

**Overview.** MemOS brings memory storage, retrieval, updates, and management into a dedicated layer for AI applications and agents. Our Apache-2.0 open-source framework supports multiple memory types and scheduling. MemOS Cloud provides APIs for memory extraction, search, updates, deletion, and feedback-based correction, alongside knowledge-based and chat capabilities. We also offer private deployment and custom integration options for enterprise needs. [MemOS repository](https://github.com/MemTensor/MemOS) · [MemOS Cloud docs](https://memos-docs.openmem.net/memos_cloud/getting_started/overview/) · [MemOS API overview](https://memos-docs.openmem.net/api_docs/start/overview/) · [MemOS website](https://memos.openmem.net/)

**Best suited for.** MemOS is a strong fit for applications that need persistent context across conversations and agent workflows, with explicit control over how memories are retrieved and maintained. Choose the Cloud API for managed integration, or explore our open-source framework and agent integrations to match your setup.

**Trade-offs to test.** Test the specific memory types and scheduling behaviors needed for your workload, the identity/scope fields carried through every call, lifecycle behavior under correction and deletion, integration fit, and the operational design of the selected edition. A broad memory abstraction can add flexibility; it also requires a clear policy for what is allowed to become reusable memory.

### Supermemory

**Overview.** Supermemory’s official repository is MIT-licensed and documents a memory/context API, JavaScript and Python SDKs, container tags, document ingestion, semantic and hybrid search, and API-key authentication. Its public repository documents a self-hosting quick start with a local server and embedded engine, and says the SDKs can point to a self-hosted base URL. [Supermemory repository](https://github.com/supermemoryai/supermemory) · [self-hosting quick start](https://github.com/supermemoryai/supermemory/blob/main/apps/docs/self-hosting/quickstart.mdx) · [SDK documentation](https://github.com/supermemoryai/supermemory/blob/main/apps/docs/integrations/supermemory-sdk.mdx)

**Best suited for.** Consider Supermemory when a team wants an API-oriented path that combines user-context patterns with document retrieval, and wants to evaluate both managed-style API usage and the documented local/self-hosted route.

**Trade-offs to test.** Evaluate whether a container-tag design maps cleanly to your tenant, user, agent, and conversation boundaries. Test profile or extracted-memory freshness, document-versus-memory retrieval, deletion propagation, model/provider dependency, and the scale and persistence properties of the self-hosted design under your workload.

## A short path from comparison to decision

Avoid a universal ranking. A product may be an excellent fit for one memory shape and a poor fit for another. A graph-first system can be appropriate for temporally changing relationships; an agent-runtime system for stateful agent control; a memory API for fast integration; and a broader memory operating layer for lifecycle and scheduling across several forms of memory.

Run a time-boxed proof of concept with your own data contract. Give every request tenant, user, agent, thread, conversation, and request identifiers as applicable. Create known-correct facts, deliberately stale facts, conflicting updates, sensitive values that must never persist, and cross-tenant near-duplicates. Measure retrieval precision, task success, latency, token cost, write cost, deletion completion, and the ease of explaining each selected item. Include a simulated provider failure and a restore exercise.

The decision is production-ready when the team can explain, for every memory: who it belongs to, why it was saved, what supersedes it, who may retrieve it, where it is stored, how it is observed, and how it is removed. RAG then remains what it should be: a companion system for source-grounded evidence, not an overloaded substitute for durable agent state.
