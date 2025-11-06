---
title: Memory Recall
desc: "In MemOS, memory is not just about archiving information, but also about being dynamically retrieved when needed and transformed into executable input."
---

## 1. Capability Overview

Memory recall is responsible for quickly retrieving the most relevant memory fragments when the user initiates a new request.

*   **Role**: Ensures that the model does not start “from scratch” when generating responses, but instead integrates the user's history, preferences, and context.
    
*   **Returned Results**: The recalled content is presented as plaintext facts.
    
    *   Traceable: Each memory is accompanied by its source, timestamp, and confidence level.
        
    *   Highly controllable: Developers have full control over which memories enter downstream logic.
 
* **Features**:

  * Seamless recall: Users don’t need to repeat their previous choices or preferences.
  
  * Structured output: Separates factual and preference memories, making it easier for developers to control whether to inject them.


## 2. Advanced: Deep Customization

In MemOS, recall and completion are not achieved through a single path, but through combinations of multiple strategies and components. Different scenarios may require different configurations. This section lists the main steps and customizable points for you to flexibly choose according to business needs.

| **Layer** | **Customizable Points** | **Example** |
| --- | --- | --- |
| Memory Recall | Adjust recall strategy | Raise similarity threshold to only return memories with confidence ≥0.9 |
|  | Set filters | Only retrieve the last 30 days of conversations; only preference memories, not factual ones |
| Output Governance & Audit | Compliance fallback | Automatically prepend “Answer must comply with regulations” before completion |
|  | Logging & traceability | Record used memories and few-shot selection each call |
|  | A/B testing | Run two concatenation templates simultaneously, compare user satisfaction differences |


## 3. Next Steps

Learn more about MemOS core capabilities:

*   [Memory Lifecycle Management](/overview/quick_start/mem_lifecycle)
    

## 4. Contact Us

<img src="https://cdn.memtensor.com.cn/img/1758685658684_nbhka4_compressed.png" alt="image" style="width:70%;">
