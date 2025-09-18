---
title: REST API 服务
desc: MemOS 提供了一个使用 FastAPI 编写的 REST API 服务。用户可以通过 REST 接口执行所有操作。
---

![MemOS Architecture](https://statics.memtensor.com.cn/memos/openapi.png)
<div style="text-align: center; margin-top: 10px">MemOS REST API 服务支持的 API</div>  

### 功能特点
以下是你的英文内容的中文翻译，专有名词保持不变：

- 注册新用户：使用配置信息和默认的 cube 注册一个新用户。
- 获取推荐查询：为指定用户获取推荐的查询语句。
- 获取用户所有记忆：获取某个用户的所有记忆内容。
- 添加新记忆：为指定用户创建一条新的记忆。
- 搜索记忆：为指定用户搜索其记忆内容。
- 与 MemOS 对话：与 MemOS 进行对话，返回 SSE 流式响应。


## 本地运行

### 使用 Docker Compose up
::steps{level="4"}
开发环境的 Docker Compose up 已预配置了 qdrant、neo4j。
运行服务器需要环境变量 `OPENAI_API_KEY`。

#### 在根目录中创建一个 `.env` 文件并设置你的环境变量。例如：

```bash
# 用户key，用于初始化或默认请求用户
OPENAI_API_KEY=your-openai-api-key  

# OpenAI 接口地址，默认 https://api.openai.com/v1。如走代理或自建兼容服务，改这里。
OPENAI_API_BASE=http://123.129.219.111:3000/v1

# http_bge（HTTP 服务版 BGE 重排）或 cosine_local（本地余弦）。
MOS_RERANKER_BACKEND=cosine_local

# universal_api：使用 OpenAI 聊天与嵌入 ，
# Ollama：使用本地 Ollama 嵌入
MOS_EMBEDDER_BACKEND=universal_api

# 嵌入模型
MOS_EMBEDDER_MODEL=bge-m3

# 接口地址（OpenAI 为 https://api.openai.com/v1；Azure 为你的 endpoint）
MOS_EMBEDDER_API_BASE=http://106.75.235.231:8081/v1

# 对应 provider 的 Key
MOS_EMBEDDER_API_KEY=EMPTY

# 向量维度
EMBEDDING_DIMENSION=1024

# 扩展
# MOS_SESSION_ID: 会话 ID（用于 start_api.py 路线）
# MOS_TOP_K: 检索/召回的候选上限（如 30、50）
# MOS_MAX_TOKENS: LLM 生成最大 tokens
# MOS_TOP_P / MOS_TOP_K（生成）: 生成采样参数（注意与检索的 top_k 含义不同）
# MOS_CHAT_TEMPERATURE: 生成温度
# MOS_MAX_TURNS_WINDOW: 对话窗口保留轮数
# MOS_EMBEDDER_PROVIDER: openai 或 azure
```

#### 进入docker文件夹
```bash 
# 当前文件夹下进入docker文件夹
cd docker
```

#### 在docker目录下使用 Docker Compose Up启动容器(保证vpn正常连接)：

```bash
docker compose up
```

#### 通过 [http://localhost:8000](http://localhost:8000) 访问 API。

#### 示例流程

#####  (注册用户->查询用户记忆（没有继续往后）->添加用户记忆->查询用户记忆)

##### 注册用户 [http://localhost:8000/product/users/register](post)
```bash
# 响应
{
    "code": 200,
    "message": "User registered successfully",
    "data": {
        "user_id": "8736b16e-1d20-4163-980b-a5063c3facdc",
        "mem_cube_id": "b32d0977-435d-4828-a86f-4f47f8b55bca"
    }
}
```

##### 添加用户记忆 [http://localhost:8000/product/add](post)
```bash
# 请求参数
{
  "user_id": "8736b16e-1d20-4163-980b-a5063c3facdc",
  "mem_cube_id": "b32d0977-435d-4828-a86f-4f47f8b55bca",
  "messages": [
    {
      "role": "user",
      "content": "我喜欢草莓"
    }
  ],
  "memory_content": "",
  "doc_path": "",
  "source": "",
  "user_profile": false
}
# 响应
{
    "code": 200,
    "message": "Memory created successfully",
    "data": null
}
```

##### 查询用户记忆 [http://localhost:8000/product/search](post)
```bash
# 请求参数
{
  "query": "我喜欢什么",
  "user_id": "8736b16e-1d20-4163-980b-a5063c3facdc",
  "mem_cube_id": "b32d0977-435d-4828-a86f-4f47f8b55bca"
}
# 响应
{
    "code": 200,
    "message": "Search completed successfully",
    "data": {
        "text_mem": [
          {
            "cube_id": "7231eda8-6c57-4f6e-97ce-98b699eebb98",
            "memories": [
              {
                  "id": "2f40be8f-736c-4a5f-aada-9489037769e0",
                  "memory": "[user观点]用户喜欢草莓。",
                  "metadata": {
                      "user_id": "de8215e3-3beb-4afc-9b64-ae594d62f1ea",
                      "session_id": "root_session",
                      "status": "activated",
                      "type": "fact",
                      "key": "用户对草莓的喜好",
                      "confidence": 0.99,
                      "source": null,
                      "tags": [
                          "喜好",
                          "草莓"
                      ],
                      "visibility": null,
                      "updated_at": "2025-09-18T08:23:44.625479000+00:00",
                      "memory_type": "UserMemory",
                      "sources": [],
                      "embedding": [],
                      "created_at": "2025-09-18T08:23:44.625511000+00:00",
                      "usage": [
                          "{\"time\": \"2025-09-18T08:24:17.759748\", \"info\": {\"user_id\": \"de8215e3-3beb-4afc-9b64-ae594d62f1ea\", \"session_id\": \"root_session\"}}"
                      ],
                      "background": "用户表达了对草莓的喜好，显示出他们在饮食偏好上的倾向。",
                      "relativity": 0.6349761312470591,
                      "vector_sync": "success",
                      "ref_id": "[2f40be8f]",
                      "id": "2f40be8f-736c-4a5f-aada-9489037769e0",
                      "memory": "[user观点]用户喜欢草莓。"
                  },
                  "ref_id": "[2f40be8f]"
              },
              ...
            }
          }
        ],
        "act_mem": [],
        "para_mem": []
    }
}



# 响应失败，原因排查
# src/memos/api/config.py
# 检查get_neo4j_community_config方法中配置的"neo4j_vec_db"和"EMBEDDING_DIMENSION"
```


#### 对服务器代码或库代码进行修改将自动重新加载服务器。

::

### 使用 Docker
::steps{level="4"}
#### 在根目录中创建一个 `.env` 文件并设置你的环境变量。例如：

```bash
OPENAI_API_KEY=your-openai-api-key  



# 在docker 配置用于neo4j和qdrant
QDRANT_HOST=host.docker.internal

NEO4J_URI=bolt://host.docker.internal:7687

```

#### 本地构建 Docker 镜像：

```bash
docker build -t memos-api-server .  
```

#### 先在docker中启动 [neo4j](neo4j) 和 [qdrant](qdrant)

#### 运行 Docker 容器：

```bash
docker run --env-file .env -p 8000:8000 memos-api-server
```


#### 通过 [http://localhost:8000](http://localhost:8000) 访问 API。


#### 测试用例 (注册用户->添加用户记忆->查询用户记忆) 参考Docker Compose up测试用例

::

### 不使用 Docker
::steps{level="4"}
#### 在根目录中创建一个 `.env` 文件并设置你的环境变量。例如：

```bash
OPENAI_API_KEY=your-openai-api-key  

OPENAI_API_BASE=http://123.129.219.111:3000/v1

MOS_RERANKER_BACKEND=cosine_local

MOS_EMBEDDER_BACKEND=universal_api

MOS_EMBEDDER_MODEL=bge-m3

MOS_EMBEDDER_API_BASE=http://106.75.235.231:8081/v1

MOS_EMBEDDER_API_KEY=EMPTY

EMBEDDING_DIMENSION=1024


# 配置用于neo4j和qdrant
QDRANT_HOST=host.docker.internal

NEO4J_URI=bolt://host.docker.internal:7687
```

#### 安装 Poetry 用于依赖管理：

```bash
curl -sSL https://install.python-poetry.org | python3 - 
```

#### Poetry 环境变量配置：

```bash

#要开始使用，您需要在“PATH”中找到Poetry的bin目录（/Users/jinyunyuan/.local/bin）`环境变量
# 现代 macOS 系统默认的 Shell 是 zsh。你可以通过以下命令确认
1. 确定你使用的 Shell

echo $SHELL
# 如果输出是 /bin/zsh 或 /usr/bin/env zsh，那么你就是 zsh。
# (如果你的系统版本较老，可能还在使用 bash，输出会是 /bin/bash)
2. 打开对应的 Shell 配置文件
# 如果使用的是 zsh (绝大多数情况)：
# 使用 nano 编辑器（推荐新手）
nano ~/.zshrc

# 或者使用 vim 编辑器
# vim ~/.zshrc
# 如果使用的是 bash：
nano ~/.bash_profile
# 或者
nano ~/.bashrc

3. 添加 PATH 环境变量

# 在打开的文件的最末尾，新起一行，粘贴安装提示给你的那行命令：
export PATH="/Users/jinyunyuan/.local/bin:$PATH"

4. 保存并退出编辑器

# 如果你用的是 nano：
# 按 Ctrl + O 来写入（保存），按 Enter 确认文件名。
# 然后按 Ctrl + X 退出编辑器。

# 如果你用的是 vim：
# 按 i 进入插入模式，粘贴代码后，按 ESC 键退出插入模式。
# 输入 :wq，然后按 Enter 来保存并退出。

5. 使配置立刻生效
# 刚刚修改的配置文件不会自动在当前已打开的终端窗口生效，你需要运行以下命令之一来重新加载它：

# 对于 zsh：
source ~/.zshrc

# 对于 bash：
source ~/.bash_profile

6. 验证安装是否成功
# 现在，你可以执行提示中的测试命令来检查一切是否就绪：
poetry --version
# 成功后将显示版本号 Poetry (version 2.2.0)

```

#### 安装所有项目依赖和开发工具：

```bash
make install  
```

#### 先在docker中启动 [neo4j](neo4j) 和 [qdrant](qdrant)

#### 启动 FastAPI 服务器（在MomOS目录下）：

```bash
uvicorn memos.api.product_api:app --host 0.0.0.0 --port 8000 --reload
```

#### 服务器运行后,您可以使用OpenAPI文档测试API，网址为 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### 测试用例 (注册用户->添加用户记忆->查询用户记忆) 参考Docker Compose up测试用例

::
