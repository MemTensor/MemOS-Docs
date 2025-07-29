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

### 使用 Docker Compose
::steps{level="4"}
开发环境的 Docker Compose 已预配置了 qdrant、neo4j。

运行服务器需要环境变量 `OPENAI_API_KEY`。

#### 在根目录中创建一个 `.env` 文件并设置你的环境变量。例如：

```bash
OPENAI_API_KEY=your-openai-api-key  
```

#### 使用 Docker Compose 启动容器：

```bash
docker compose up --build  
```

#### 通过 [http://localhost:8000](http://localhost:8000) 访问 API。

#### 对服务器代码或库代码进行修改将自动重新加载服务器。

::

### 使用 Docker
::steps{level="4"}
#### 在根目录中创建一个 `.env` 文件并设置你的环境变量。例如：

```bash
OPENAI_API_KEY=your-openai-api-key  
```

#### 本地构建 Docker 镜像：

```bash
docker build -t memos-api-server .  
```

#### 运行 Docker 容器：

```bash
docker run --env-file .env -p 8000:8000 memos-api-server
```

#### 通过 [http://localhost:8000](http://localhost:8000) 访问 API。

::

### 不使用 Docker
::steps{level="4"}
#### 在根目录中创建一个 `.env` 文件并设置你的环境变量。例如：

```bash
OPENAI_API_KEY=your-openai-api-key  
```

#### 安装 Poetry 用于依赖管理：

```bash
curl -sSL https://install.python-poetry.org | python3 -  
```

#### 安装所有项目依赖和开发工具：

```bash
make install  
```

#### 启动 FastAPI 服务器：

```bash
uvicorn memos.api.product_api:app --reload  
```

#### 通过 [http://localhost:8000](http://localhost:8000) 访问 API

::
