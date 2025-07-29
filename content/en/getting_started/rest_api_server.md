---
title: REST API Server
desc: MemOS provides a REST API server (written using FastAPI). Users can perform all operations through REST endpoints. 
---

![MemOS Architecture](https://statics.memtensor.com.cn/memos/openapi.png)
<div style="text-align: center; margin-top: 10px">APIs supported by MemOS REST API Server</div>

### Features
- Register a new user: Register a new user with configuration and default cube.
- Get suggestion queries: Get suggestion queries for a specific user.
- Get all memories for user: Get all memories for a specific user.
- Add a new memory: Create a new memory for a specific user.
- Search memories: Search memories for a specific user.
- Chat with MemOS: Chat with MemOS for a specific user. Returns SSE stream.

## Running Locally

### With Docker Compose
::steps{level="4"}
The Development Docker Compose comes pre-configured with qdrant, neo4j.

The only required environment variable to run the server is OPENAI_API_KEY.

#### Create a .env file in the server/ directory and set your environment variables. For example:

```bash
OPENAI_API_KEY=your-openai-api-key
```
#### Run the Docker container using Docker Compose:
```bash
docker compose up --build
```
#### Access the API at http://localhost:8000.

#### Making changes to the server code or the library code will automatically reload the server.
::

### With Docker
::steps{level="4"}
#### Create a .env file in the current directory and set your environment variables. For example:
```bash
OPENAI_API_KEY=your-openai-api-key
```
#### Build the docker image locally.
```bash
docker build -t memos-api-server .
```
#### Run the Docker container:
```bash
docker run --env-file .env -p 8000:8000 memos-api-server
```
#### Access the API at http://localhost:8000.
::

### Without Docker
::steps{level="4"}
#### Create a .env file in the current directory and set your environment variables. For example:
```bash
OPENAI_API_KEY=your-openai-api-key
```
#### Install Poetry for dependency management:
```bash
curl -sSL https://install.python-poetry.org | python3 -
```
#### Install all project dependencies and development tools:
```bash
make install
```
#### Start the FastAPI server:
```bash
uvicorn memos.api.product_api:app --reload
```
#### Access the API at http://localhost:8000
::
