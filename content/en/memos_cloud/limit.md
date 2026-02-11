---
title: Limits
desc: Register and log in to enjoy free quota, facilitating quick experience and verification of memory functions.
---


## 1. Quota

![image.png](https://cdn.memtensor.com.cn/img/1766630472243_emn5fx_compressed.png)

MemOS Cloud Services currently provides multiple pricing plans, from the free tier to the enterprise tier, to meet the needs of teams of different sizes. All plans are currently free for a limited time. Visit [MemOS Pricing page](https://memos.openmem.net/en/pricing) to apply for the plan that fits your needs.
Take action now and use MemOS Cloud Services to support the growth of your projects.

::note
**Note**
- The free quota is provided per **developer account** and is shared across all projects under that account.
- Failed requests (authentication failure, parameter error, exceeding limits, etc.) **do not consume quota**.
::

## 2. Resource Limits

To ensure service stability and security, MemOS Cloud Services imposes the following limits on core API calls, calculated per account:

| **API Name**    | **Single Input Limit**  | **Single Output Limit** |
|-----------------|------------------------|-------------------------|
| addMessage      | 20,000 tokens          | -                       |
| searchMemory    | 20,000 tokens          | Fact Memory: 25 items<br>Preference Memory: 25 items<br>Tool Memory: 25 items<br>Skills: 25 items |

In addition, the document upload feature for the knowledge base currently has the following limitations: each file must not exceed 100MB, 500 pages, or 20,000 tokens, and a maximum of 20 files can be uploaded at one time.
If you have higher-level or special requirements, please contact the project team for further discussion.

::note
**Note**
- Requests exceeding the per-call limit will return the corresponding error code without deducting quota.
- Additionally, we recommend a maximum QPS ≤ 50 (i.e., up to 50 requests per second). This is not a strict limit, but high concurrency may be affected by platform capacity, so control request frequency according to actual needs.
::

## 3. Usage Monitoring

You can view the remaining quota for each API through the **API Console**, with filters for project, API key, and date to facilitate tracking and managing usage.

<img width="3024" height="1890" alt="image" src="https://cdn.memtensor.com.cn/img/1766632428696_iufnrl_compressed.png" />
