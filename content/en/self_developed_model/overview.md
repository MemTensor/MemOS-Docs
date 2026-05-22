---
title: Self-developed Models
desc: Why MemOS builds in-house memory and extraction models, and what developers gain.
---

## Why we build in-house models

General-purpose LLMs excel at dialogue and reasoning, but turning conversations into **reliable, usable memory** often needs more than a generic prompt: inconsistent structure, noisy extractions, and a poor fit with your memory pipeline. MemOS trains memory- and extraction-focused models so outputs align with **MemOS data shapes and product semantics** across write, extract, retrieve, and inject—not by forcing a general model into a memory-only workflow.

## What developers get

- **Capabilities tuned for memory**: Extraction and structuring oriented toward facts, preferences, and related memory types, so you spend less time on prompt hacks and cleanup.
- **Same integration model as MemOS Cloud**: Auth, base URL, and calling patterns match [Quick Start](/memos_cloud/getting_started/quick_start)—predictable and easy to adopt.
- **Composable with cloud memory**: Use extraction and other in-house capabilities alongside existing MemOS Cloud features and grow usage as your product needs evolve.

For pricing and model specs, see the [MemOS pricing page](https://memos.openmem.net/en/pricing). If you already use the cloud service, see [Usage Examples](/self_developed_model/extraction_usage_example) and the [Extract Memory](/api_docs/core/extract_memory) API reference.
