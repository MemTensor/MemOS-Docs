---
title: Error Codes
---

| Error Code | Meaning | Recommended Solution |
| :--- | :--- | :--- |
| **Parameter Errors** | | |
| 40000 | Invalid request parameters | Check parameter names, types, and formats |
| 40001 | Requested data does not exist | Verify the resource ID (e.g., memory_id) |
| 40002 | Required parameter is empty | Provide missing required fields |
| 40003 | Parameter is empty | Check that lists or objects are not empty |
| 40006 | Unsupported type | Check the `type` field value |
| 40007 | Unsupported file type | Only upload allowed formats (.pdf, .docx, .doc, .txt) |
| 40008 | Illegal Base64 content | Check the Base64 string for invalid characters |
| 40009 | Invalid Base64 format | Verify the Base64 encoding format |
| 40010 | User ID too long | `user_id` must not exceed 100 characters |
| 40011 | Session ID too long | `conversation_id` must not exceed 100 characters |
| 40020 | Invalid project ID | Confirm the Project ID format |
| **Authentication & Permission Errors** | | |
| 40100 | API Key authentication required | Add a valid API Key to the request header |
| 40130 | API Key authentication required | Add a valid API Key to the request header |
| 40132 | API Key is invalid or expired | Check API Key status or regenerate |
| **Quota & Rate Limiting** | | |
| 40300 | API call limit exceeded | Request additional quota |
| 40301 | Request token limit exceeded | Reduce input content or request more quota |
| 40302 | Response token limit exceeded | Shorten expected output or request more quota |
| 40303 | Single conversation length exceeded | Reduce single input/output length |
| 40304 | Total API calls exhausted | Request additional quota |
| 40305 | Input exceeds single token limit | Reduce input content |
| 40306 | Memory deletion auth failed | Confirm you have permission to delete this memory |
| 40307 | Memory to delete does not exist | Check if the memory_id is valid |
| 40308 | User for memory deletion not found | Check if the user_id is correct |
| **System & Service Errors** | | |
| 50000 | Internal system error | Server is busy or encountered an exception — contact support |
| 50002 | Operation failed | Check operation logic or retry later |
| 50004 | Memory service temporarily unavailable | Retry memory write/read operations later |
| 50005 | Search service temporarily unavailable | Retry memory search operations later |
| **Knowledge Base & Operation Errors** | | |
| 50103 | File count limit exceeded | Maximum 20 files per upload |
| 50104 | Single file size exceeded | Ensure each file is under 100MB |
| 50105 | Total file size exceeded | Ensure total upload size is under 300MB |
| 50107 | File upload format not supported | Check and change the file format |
| 50120 | Knowledge base does not exist | Confirm the knowledge base ID |
| 50123 | Knowledge base not linked to this project | Confirm the knowledge base is authorized for the current project |
| 50131 | Task does not exist | Check the task_id (common when querying processing status) |
| 50143 | Failed to add memory | Algorithm service error — retry later |
| 50144 | Failed to add message | Chat history save failed |
| 50145 | Failed to save feedback and write memory | Exception during feedback processing |
