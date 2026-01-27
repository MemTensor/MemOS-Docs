---
title: Error Codes
---

| Code | Meaning | Resolution |
| :--- | :--- | :--- |
| **Parameter Errors** | | |
| 40000 | Invalid request parameters | Check parameter names, types, and formats |
| 40001 | Requested data not found | Check if resource ID (e.g., memory_id) is correct |
| 40002 | Required field cannot be empty | Provide missing required fields |
| 40003 | Field is empty | Check if the provided list or object is empty |
| 40006 | Unsupported type | Check the value of the 'type' field |
| 40007 | Unsupported file type | Only upload allowed formats (.pdf, .docx, .doc, .txt, .json, .md, .xml) |
| 40008 | Invalid Base64 content | Check if the Base64 string contains illegal characters |
| 40009 | Invalid Base64 format | Check if the Base64 encoding format is correct |
| 40010 | User ID too long | user_id length cannot exceed 100 characters |
| 40011 | Conversation ID too long | conversation_id length cannot exceed 100 characters |
| 40020 | Invalid Project ID | Confirm the Project ID format is correct |
| **Authentication & Permission Errors** | | |
| 40100 | API Key authentication required | Add a valid API Key to the request header |
| 40130 | API Key authentication required | Add a valid API Key to the request header |
| 40132 | Invalid or expired API Key | Check API Key status or generate a new one |
| **Quota & Rate Limit Errors** | | |
| 40300 | Rate limit exceeded | <a href="/memos_cloud/limit#_4-obtaining-more-quota" target="_blank">Get more quota</a> |
| 40301 | Chat request token quota exceeded | Reduce input content or get more quota |
| 40302 | Chat response token quota exceeded | Shorten expected output or get more quota |
| 40303 | Chat length exceeds model limit | Reduce single input/output length |
| 40304 | Total API call quota exceeded | <a href="/memos_cloud/limit#_4-obtaining-more-quota" target="_blank">Get more quota</a> |
| 40305 | Input content exceeds token limit | Reduce input content |
| 40306 | delete_memory authentication failed | Confirm if you have permission to delete this memory |
| 40307 | Memory for deletion does not exist | Check if the memory_id is valid |
| 40308 | User for deletion does not exist | Check if the user_id is correct |
| **System & Service Errors** | | |
| 50000 | Internal server error | Server busy or anomaly, please contact support |
| 50002 | Operation failed | Check operation logic or try again later |
| 50004 | Memory service is temporarily unavailable | Retry memory write/fetch operations later |
| 50005 | Search service is temporarily unavailable | Retry memory search operations later |
| **Knowledge Base & Operations** | | |
| 50103 | File count exceeds limit | The number of files for a single upload should not exceed 20 |
| 50104 | Single file size exceeds limit | Ensure single file does not exceed 100MB |
| 50105 | Total file size exceeds limit | Ensure total upload size does not exceed 300MB |
| 50107 | Invalid file format | Check and change file format |
| 50120 | Knowledge base not found | Confirm if the knowledgebase_id is correct |
| 50123 | Knowledge base not linked to project | Confirm KB is authorized for the current project |
| 50131 | Task not found | Check if task_id is correct (common in status queries) |
| 50143 | Failed to add memory | Algorithm service anomaly, please try again later |
| 50144 | Failed to add message | Failed to save chat history |
| 50145 | Failed to save feedback and write memory | Anomaly during feedback processing |