---
title: Overview
---

## 1. API Introduction

The MemOS open-source project provides a high-performance REST API service built with **FastAPI**. The system adopts a **Component + Handler** architecture, where all core logic (memory extraction, semantic search, async scheduling) is accessible through standard REST endpoints.

![MemOS Architecture](https://cdn.memtensor.com.cn/img/memos_run_server_success_compressed.png)
<div style="text-align: center; margin-top: 10px">MemOS REST API Architecture Overview</div>

### Key Features

* **Multi-dimensional Memory Production**: Process conversations, text, or documents through `AddHandler`, automatically transforming them into structured memories.
* **MemCube Physical Isolation**: Data isolation and independent indexing between users or knowledge bases via Cube IDs.
* **End-to-end Conversation Loop**: `ChatHandler` orchestrates the full "Retrieval → Generation → Async Storage" pipeline.
* **Async Task Scheduling**: Built-in `MemScheduler` engine supports load balancing and status tracking for large-scale memory production.
* **Self-correction Mechanism**: Feedback API allows natural-language corrections to stored memories.

## 2. Getting Started

Integrate memory capabilities into your AI application with two core steps:

* [**Add Memory**](../core/add_memory.md): Use `POST /product/add` to write raw message streams into a specified MemCube.
* [**Search Memory**](../core/search_memory.md): Use `POST /product/search` to recall relevant context via semantic similarity across multiple Cubes.

## 3. API Categories

MemOS APIs are organized into the following groups:

* **[Core Memory](../core/add_memory.md)**: CRUD operations for memories.
* **[Chat](../chat/chat.md)**: Memory-augmented streaming or complete chat responses.
* **[Message](../message/feedback.md)**: User feedback, suggestion queries, and enhanced interactions.
* **[Scheduler](../scheduler/get_status.md)**: Monitor background memory extraction task progress and queue status.
* **[Tools](../tools/check_cube.md)**: Cube existence checks and memory-to-user reverse lookups.

## 4. Authentication and Context

### Authentication
All API requests require an `Authorization` header.
* **Development**: Define a custom `API_KEY` in your local `.env` or configuration file.
* **Production**: Extend `RequestContextMiddleware` with OAuth2 or other advanced authentication logic.

### Request Context
* **user_id**: Must be included in the request body for identity tracking in the Handler layer.
* **MemCube ID**: The core isolation unit in the open-source edition. Control read/write boundaries precisely by specifying `readable_cube_ids` or `writable_cube_ids`.

## 5. Next Steps

* 👉 [**System Configuration**](./configuration.md): Configure your LLM provider and vector database engine.
* 👉 [**Add Your First Memory**](../core/add_memory.md): Submit your first batch of conversation messages via SDK or curl.
* 👉 [**Explore Error Codes**](../help/error_codes.md): Understand API status codes and exception handling.
