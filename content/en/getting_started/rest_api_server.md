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

### With Docker Compose up
::steps{level="4"}
The Development Docker Compose up comes pre-configured with qdrant, neo4j.
The required environment variable to run the server is OPENAI_API_KEY.

#### Create a `.env` file in the root directory and set your environment variables. For example:

```bash
# User key, used to initialize or default request users
OPENAI_API_KEY=your-openai-api-key  

# OpenAI interface address, default https://api.openai.com/v1. If using proxy or self built compatible services, change here.
OPENAI_API_BASE=http://123.129.219.111:3000/v1

# Http-bge (HTTP Service BGE rearrangement) or cosine local (local cosine).
MOS_RERANKER_BACKEND=cosine_local

# universal_api: Using OpenAI chat and embedding, 
# Ollama: using local Ollama embedding
MOS_EMBEDDER_BACKEND=universal_api

# Embedded model
MOS_EMBEDDER_MODEL=bge-m3

# Interface address (OpenAI is) https://api.openai.com/v1 Azure for your endpoint
MOS_EMBEDDER_API_BASE=http://106.75.235.231:8081/v1

# Corresponding provider's key
MOS_EMBEDDER_API_KEY=EMPTY

# Vector dimension
EMBEDDING_DIMENSION=1024

# expand
# MOS_SESSION_ID: Session ID (used for start_mapi-py route)
# MOS_TOP_K: The candidate upper limit for retrieval/recall (such as 30, 50)
# MOS_MAX_TOKENS: LLM generates maximum tokens
# MOS_TOP_P / MOS_TOP_K (Generate): Generate sampling parameters (note that they have different meanings from the top_k retrieved)
# MOS_CHAT_TEMPERATURE: Generate temperature
# MOS_MAX_TURNS_WINDOW: The dialogue window retains the number of rounds
# MOS_EMBEDDER_PROVIDER: openai or azure
```

#### Enter Docker Folder
```bash 
# Enter Docker in the current folder
cd docker
```

#### Start the container using Docker Compose Up in the Docker directory (ensuring proper VPN connection):

```bash
docker compose up
```
#### Access the API at http://localhost:8000.

#### Example process

#### Test case (registered user ->add user memory ->query user memory)

###### Registered [http://localhost:8000/product/users/register](post)
```bash
# response
{
    "code": 200,
    "message": "User registered successfully",
    "data": {
        "user_id": "8736b16e-1d20-4163-980b-a5063c3facdc",
        "mem_cube_id": "b32d0977-435d-4828-a86f-4f47f8b55bca"
    }
}
```

###### Add User Memory [http://localhost:8000/product/add](post)
```bash
# request params
{
  "user_id": "8736b16e-1d20-4163-980b-a5063c3facdc",
  "mem_cube_id": "b32d0977-435d-4828-a86f-4f47f8b55bca",
  "messages": [
    {
      "role": "user",
      "content": "I like strawberry"
    }
  ],
  "memory_content": "",
  "doc_path": "",
  "source": "",
  "user_profile": false
}
# response
{
    "code": 200,
    "message": "Memory created successfully",
    "data": null
}
```

###### Query User Memory [http://localhost:8000/product/search](post)
```bash
# request params
{
  "query": "What do I like",
  "user_id": "8736b16e-1d20-4163-980b-a5063c3facdc",
  "mem_cube_id": "b32d0977-435d-4828-a86f-4f47f8b55bca"
}
# response
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
                  "memory": "[User viewpoint] Users like strawberries.",
                  "metadata": {
                      "user_id": "de8215e3-3beb-4afc-9b64-ae594d62f1ea",
                      "session_id": "root_session",
                      "status": "activated",
                      "type": "fact",
                      "key": "User preference for strawberries",
                      "confidence": 0.99,
                      "source": null,
                      "tags": [
                          "preference",
                          "strawberry"
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
                      "background": "The user expressed a preference for strawberries, indicating their inclination towards dietary preferences.",
                      "relativity": 0.6349761312470591,
                      "vector_sync": "success",
                      "ref_id": "[2f40be8f]",
                      "id": "2f40be8f-736c-4a5f-aada-9489037769e0",
                      "memory": "[User viewpoint] Users like strawberries."
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
```


#### Making changes to the server code or the library code will automatically reload the server.
::

### With Docker
::steps{level="4"}
#### Create a `.env` file in the root directory and set your environment variables. For example:

```bash
OPENAI_API_KEY=your-openai-api-key




# Starting in Docker neo4j and qdrant
QDRANT_HOST=host.docker.internal

NEO4J_URI=bolt://host.docker.internal:7687
```

#### Build the docker image locally.
```bash
docker build -t memos-api-server .
```

#### Start in Docker first [neo4j](neo4j) and [qdrant](qdrant)


#### Run the Docker container:

```bash
docker run --env-file .env -p 8000:8000 memos-api-server
```

#### Access the API at http://localhost:8000.


#### Test cases (register user ->add user memory ->query user memory) refer to Docker Compose up test cases

::

### Without Docker
::steps{level="4"}
#### Create a `.env` file in the root directory and set your environment variables. For example:

```bash
OPENAI_API_KEY=your-openai-api-key

OPENAI_API_BASE=http://123.129.219.111:3000/v1

MOS_RERANKER_BACKEND=cosine_local

MOS_EMBEDDER_BACKEND=universal_api

MOS_EMBEDDER_MODEL=bge-m3

MOS_EMBEDDER_API_BASE=http://106.75.235.231:8081/v1

MOS_EMBEDDER_API_KEY=EMPTY

EMBEDDING_DIMENSION=1024


# Starting in Docker neo4j and qdrant
QDRANT_HOST=host.docker.internal

NEO4J_URI=bolt://host.docker.internal:7687

```

#### Install Poetry for dependency management:
```bash
curl -sSL https://install.python-poetry.org | python3 -
```
#### Configure Poetry environment variables:

```bash

# To start using Poetry, ensure its bin directory (/Users/jinyunyuan/.local/bin) is in your PATH.
# The default shell for modern macOS systems is zsh. You can confirm with the command below.
1. Check which shell you are using

echo $SHELL
# If the output is /bin/zsh or /usr/bin/env zsh, then you are using zsh.
# (If your system version is older and you may still be using bash, the output will be /bin/bash)
2. Open the corresponding shell configuration file
# If using zsh (in the vast majority of cases):
# Using the Nano editor (recommended for beginners)
nano ~/.zshrc

# Or use the vim editor
# vim ~/.zshrc
# If you are using bash:
nano ~/.bash_profile
# Or
nano ~/.bashrc

3. Add the PATH environment variable

# At the end of the opened file, add a new line and paste the command suggested by the installer:
export PATH="/Users/jinyunyuan/.local/bin:$PATH"

4. Save and exit the editor

# If you are using nano:
# Press Ctrl + O to write (save), then press Enter to confirm the filename.
# Then press Ctrl + X to exit the editor.

# If you are using vim:
# Press i to enter insert mode, paste the code, then press ESC to exit insert mode.
# Type :wq and press Enter to save and exit.

5. Apply the configuration immediately
# The modified configuration file will not take effect in the current open terminal window automatically; run one of the following commands to reload it:

# For zsh:
source ~/.zshrc

# For bash:
source ~/.bash_profile

6. Verify the installation
# Now, run the test command suggested above to verify everything is ready:
poetry --version
# It should show the version number, e.g., Poetry (version 2.2.0)

```

#### Install all project dependencies and development tools:
```bash
make install
```

#### Start in Docker first [neo4j](neo4j) and [qdrant](qdrant)


#### Start the FastAPI server:
```bash
uvicorn memos.api.product_api:app --host 0.0.0.0 --port 8000 --reload
```
#### Access the API at http://localhost:8000

#### Test cases (register user ->add user memory ->query user memory) refer to Docker Compose up test cases

::
