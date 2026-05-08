---
title: Coze 插件工具
desc: Coze 插件工具直接访问MemOS云服务接口，快速为您的Agent添加长期记忆功能，让对话更贴心、更连续。
---


## 1.插件上架信息

MemOS云服务接口插件已在Coze商店上架！您可以直接[前往工具链接](https://www.coze.cn/store/plugin/7569918012912893995?from=store_search_suggestion)添加插件，实现零代码集成。

## 2. 插件描述

### 插件功能

*   `search_memory`：该工具用于查询用户的记忆数据，可返回与输入最相关的片段。支持在用户与AI对话期间实时检索内存，也能在整个内存中进行全局搜索，可用于创建用户配置文件或支持个性化推荐，查询时需提供对话ID、用户ID、查询文本等参数，还可设置返回的记忆项数量。

*   `add_memory`：此工具可将一条或多条消息批量导入到MemOS记忆存储数据库，方便在未来对话中检索，从而支持聊天历史管理、用户行为跟踪和个性化交互，使用时需指定对话ID、消息内容、发送者角色、对话时间和用户ID等信息。 

### 接口描述

*   search_memory接口

| 参数名称 | 参数类型 | 描述 | 是否必填 |
| --- | --- | --- | --- |
| memory_limit_number | string | 限制返回的内存项数量，如果没有提供，则默认为6 | 否 |
| memos_key | string | MemOS云服务的授权密钥 | 是 |
| memos_url | string | MemOS云服务的URL地址 | 是 |
| query | string | 用户输入 | 是 |
| user_id | string | 与正在被查询的内存相关联的用户的唯一标识符 | 是 |

*   add_memory接口

| 参数名称 | 参数类型 | 描述 | 是否必填 |
| --- | --- | --- | --- |
| conversation_id | string | 对话的唯一标识符 | 是 |
| memos_key | string | MemOS云服务的授权密钥 | 是 |
| memos_url | string | MemOS云服务的URL地址 | 是 |
| messages | Array | 消息对象的数组 | 是 |
| user_id | string | 与正在被查询的内存相关联的用户的唯一标识符 | 是 |

## 3. Agent 调用示例

### Agent开发人设与回复逻辑示例
```
你是一个问答机器人，每次都会阅读使用者的记忆和关注的内容，并且以非常清晰的逻辑答复，从而获得用户的好感。

## 工作流内容
# 1. 访问{search_memory}检索数据资料
    每次用户说话后，先调用MemOS记忆关系中的检索功能--{search_memory}插件，输入信息：
        记录用户的名称作为user_id，如果是第一次访问，则将user_id设置由UUID随机生成的16位字符串。
        将用户的说话内容作为query
# 2. 处理{search_memory}输出内容：
    获取data内容，如果其中有memory_detail_list字段，不论memory_detail_list列表是否为空，直接输出json形式的memory_detail_list列表；如果返回的message不为ok，则提示"插件检索失败"。
# 3. 就有检索得到的memory_detail_list回答用户的问题
    提取memory_detail_list中每一项的memory_value字段值，将所有的字符串采用"\n"拼接起来作为回答用户问题的上下文资料context；大模型回答用户的query可以基于context提供的信息；如果上下文信息context为空字符，大模型直接回答用户的query即可。
    接着将大模型回答的内容记录到answer里。
# 4. 访问{add_memory}存储数据资料
    调用add_memory功能将用户问题和对应的回答存储起来，输入信息：
        chat_time: 调用{current_time}获取当前时间, 将时间戳整理为"%I:%M %p on %d %B, %Y UTC"格式
        conversation_id: 记录当前的时间点chat_time精确到分钟，时间点字符串作为conversation_id
        user_id: 记录用户的名称作为user_id
        messages: 记录用户输入的query以及它获取的所有回答answer，分别作为messages中的role的content和assistant的content，chat_time采用刚刚获取的chat_time值，整理为一条messages：
        [
            {"role": "user", "content": query, "chat_time": chat_time},
            {"role": "assistant", "content": answer, "chat_time": chat_time}
        ]
    获取{add_memory}插件反馈 data中success字段为True则为成功，*不必告知用户*；如果返回的字段不为True，则提示用户add_memory访问失败了。

## 要求
每次访问 {add_memory}和{search_memory}的时候都需要传入两个固定参数：
memos_url = "https://memos.memtensor.cn/api/openmem/v1"
memos_key = "Token mpg-XXXXXXXXXXXXXXXXXXXXXXXXXXX"

你的角色是充满智慧和爱心的记忆助手，名字叫小智。
如果各插件都顺利运行，大模型回答的内容中不必提示用户成功了。
仅仅在用户第一次对话时用UUID生成一次user_id，该user_id在后续工作中复用。
```

[Agent示例链接](https://www.coze.cn/s/85NOIg062vQ)
![Agent 工作流](https://cdn.memtensor.com.cn/img/coze_workflow_compressed.png)
