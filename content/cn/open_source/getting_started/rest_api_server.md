---
title: REST API 服务
desc: MemOS 提供了一个使用 FastAPI 编写的 REST API 服务。用户可以通过 REST 接口执行所有操作。
---

![MemOS Architecture](https://cdn.memtensor.com.cn/img/memos_run_server_success_compressed.png)
<div style="text-align: center; margin-top: 10px">MemOS REST API 服务支持的 API</div>  

### 功能特点

- 注册新用户：使用配置信息和默认的 cube 注册一个新用户。
- 获取推荐查询：为指定用户获取推荐的查询语句。
- 获取用户所有记忆：获取某个用户的所有记忆内容。
- 添加新记忆：为指定用户创建一条新的记忆。
- 搜索记忆：为指定用户搜索其记忆内容。
- 与 MemOS 对话：与 MemOS 进行对话，返回 SSE 流式响应。


## 本地运行



### 配置环境变量

#### 1、在根目录中创建一个 `.env` 文件并设置你的环境变量。完整模式参考 <a href="https://github.com/MemTensor/MemOS/blob/main/docker/.env.example">.env.example</a>。
##### .env 快速模式配置如下
```bash 
# OpenAI API 密钥 (当 provider=openai 时必须)
OPENAI_API_KEY=sk-xxx
# OpenAI API 基础 URL
OPENAI_API_BASE=http://xxx:3000/v1

# 启用默认 cube 配置
MOS_ENABLE_DEFAULT_CUBE_CONFIG=true
# Embedder 模型名称
MOS_EMBEDDER_MODEL=bge-m3
# Embedder API 基础 URL
MOS_EMBEDDER_API_BASE=http://xxx:8081/v1
# Embedder API 密钥
MOS_EMBEDDER_API_KEY=EMPTY
# Embedding 向量维度
EMBEDDING_DIMENSION=1024
# Reranker 后端 (http_bge | etc.)
MOS_RERANKER_BACKEND=cosine_local
# Reranker 服务 URL
MOS_RERANKER_URL=localhost

# Neo4j 连接 URI
# 可选值: neo4j-community | neo4j | nebular | polardb
NEO4J_BACKEND=neo4j-community
# 当 backend=neo4j* 时必须
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=12345678
NEO4J_DB_NAME=neo4j
MOS_NEO4J_SHARED_DB=false

# Bocha 搜索 API 密钥
BOCHA_API_KEY=sk-xxx

# 从 .env.full 添加
DEFAULT_USE_REDIS_QUEUE=false

# Memory Reader LLM 模型
MEMRADER_MODEL=gpt-4o-mini
# Memory Reader API 密钥
MEMRADER_API_KEY=sk-xxx
# Memory Reader API 基础 URL
MEMRADER_API_BASE=http://xxx:3000/v1

# 聊天模型列表
CHAT_MODEL_LIST=[{"backend": "deepseek", "api_base": "http://xxx:3000/v1", "api_key": "sk-xxx", "model_name_or_path": "deepseek-r1", "support_models": ["deepseek-r1"]}]
```



#### 2、配置docker/requirement.txt中依赖包的版本等（可忽略）。完整版可参考 <a href="https://github.com/MemTensor/MemOS/blob/main/docker/requirements.txt">requirements.txt</a>。

### 启动docker 
```bash
 #查看docker状态
 docker ps
 #查看docker镜像 （可不用）
 docker images

```


### 方式一：Docker 使用仓库依赖包镜像启动(推荐使用)
::steps{level="4"}

#### 参考上方配置环境变量，已经好配置.env文件

#### 配置Dockerfile文件(cd docker)
包含快速模式和完整模式，可区分使用精简包和全量包

● 精简包：简化体量过大的 nvidia相关等依赖，对镜像实现轻量化，使本地部署更加轻量快速。

url: registry.cn-shanghai.aliyuncs.com/memtensor/memos-base:v1.0

● 全量包：将 MemOS 全部依赖包打为镜像，可体验完整功能，通过配置 Dockerfile可直接构建启动。

url: registry.cn-shanghai.aliyuncs.com/memtensor/memos-full-base:v1.0.0

```bash
# 精简包 url
FROM registry.cn-shanghai.aliyuncs.com/memtensor/memos-base:v1.0

# 全量包 url
# FROM registry.cn-shanghai.aliyuncs.com/memtensor/memos-full-base:v1.0.0

WORKDIR /app

ENV HF_ENDPOINT=https://hf-mirror.com

ENV PYTHONPATH=/app/src

COPY src/ ./src/

EXPOSE 8000

CMD ["uvicorn", "memos.api.server_api:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

```

#### 使用docker compose up 构建并切动服务 ：
```bash
# 在docker目录下
docker compose up
```
![MemOS buildComposeupSuccess](https://cdn.memtensor.com.cn/img/memos_build_composeup_success_jgdd8e_compressed.png)
<div style="text-align: center; margin-top: 10px">示例图片，端口按 docker 自定义的配置</div>  




#### 通过 [http://localhost:8000/docs](http://localhost:8000/docs) 访问 API。

![MemOS Architecture](https://cdn.memtensor.com.cn/img/memos_run_server_success_compressed.png)


#### 测试用例 (注册用户->添加用户记忆->查询用户记忆) 参考Docker Compose up测试用例

::



### 方式二：客户端install Docker Compose up
::steps{level="4"}
开发环境的 Docker Compose up 已预配置了 qdrant、neo4j。
运行服务器需要环境变量 `OPENAI_API_KEY`。


#### 进入docker文件夹
```bash 
# 当前文件夹下进入docker文件夹
cd docker
```

#### 安装对应依赖模块
```bash

pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt
# 使用阿里云源安装依赖
pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# command not found: pip  使用pip3



```


#### 在docker目录下使用 Docker Compose Up启动容器(保证vpn正常连接)：

```bash

# 首次运行需要build
docker compose up --build
# 再次运行则不需要
docker compose up

```

#### 通过 [http://localhost:8000/docs](http://localhost:8000/docs) 访问 API。

#### 示例流程

#####  (注册用户->查询用户记忆（没有继续往后）->添加用户记忆->查询用户记忆)

##### 注册用户 http://localhost:8000/product/users/register (POST)
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

##### 添加用户记忆 http://localhost:8000/product/add (POST)
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

##### 查询用户记忆 http://localhost:8000/product/search (POST)
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

### 方式三：客户端install 使用 uv 命令

::steps{level="4"}

#### 安装依赖

```bash
# pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt
# 使用阿里云源安装依赖
pip3 install --no-cache-dir -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/


```

#### 在终端中打开运行以下命令进行安装：

```bash

#  目前可能需要手动安装的包 这两个包需要找资源
# neo4j.5.26.4.tar   qdrant.v1.15.3.tar
docker load -i neo4j.5.26.4.tar
docker load -i qdrant.v1.15.3.tar
# 查看是否安装成功
docker images
# 查看是否跑起来了
docker ps -a

# 根目录
 uvicorn memos.api.server_api:app --host 0.0.0.0 --port 8000 --workers 1

#  若启动时出现ModuleNotFoundError: No module named 'memos'，是因为路径匹配有问题，请执行
export PYTHONPATH=/you-file-absolute-path/MemOS/src

```

#### 访问 API

启动完成后，通过 [http://localhost:8000/docs](http://localhost:8000/docs) 访问 API。


::

### 方式四：不使用 Docker
::steps{level="4"}
#### 参考上方配置环境变量，已经好配置.env文件

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
export PATH="/you-path/.local/bin:$PATH"

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

#### 先在docker中启动 neo4j 和 qdrant

#### 启动 FastAPI 服务器（在MomOS目录下）：

```bash
uvicorn memos.api.product_api:app --host 0.0.0.0 --port 8000 --reload
```

#### 服务器运行后,您可以使用OpenAPI文档测试API，网址为 [http://localhost:8000/docs](http://localhost:8000/docs) 或者 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### 测试用例 (注册用户->添加用户记忆->查询用户记忆) 参考Docker Compose up测试用例

::


### 方式五：使用 pyCharm 启动

#### 运行 server_api
```bash
1、进入MemOS/docker/Dockerfile文件，修改运行配置
# Start the docker
CMD ["uvicorn", "memos.api.server_api:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

2、进入目录MemOS/src/memos/api 直接运行server_api.py

```
