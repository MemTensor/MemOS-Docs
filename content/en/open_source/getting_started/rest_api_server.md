---
title: REST API Server
desc: MemOS provides a REST API service written using FastAPI. Users can perform all operations via REST interfaces.
---

![MemOS Architecture](https://statics.memtensor.com.cn/memos/openapi.png)
<div style="text-align: center; margin-top: 10px">APIs supported by MemOS REST API Server</div>  

### Features
The following is the English translation of your content, keeping proper nouns unchanged:

- Register new user: Register a new user using configuration information and default cube.
- Get recommended queries: Get recommended query statements for a specific user.
- Get all user memories: Get all memory content for a specific user.
- Add new memory: Create a new memory for a specific user.
- Search memories: Search for memory content for a specific user.
- Chat with MemOS: Chat with MemOS, returning SSE streaming response.


## Run Locally



### Configure Environment Variables

#### 1. Create a `.env` file in the root directory and set your environment variables. Reference <a href="https://github.com/MemTensor/MemOS/blob/main/docker/.env.example">.env.example</a>.

#### 2. Configure dependency versions in docker/requirement.txt, etc. Reference <a href="https://github.com/MemTensor/MemOS/blob/main/docker/requirements.txt">requirements.txt</a>.


### Start Docker 
```bash
 # Check docker status
 docker ps
 # Check docker images (optional)
 docker images

```



### Client Install with Docker Compose up
::steps{level="4"}
Development Docker Compose up comes pre-configured with qdrant, neo4j.
Running the server requires the `OPENAI_API_KEY` environment variable.


#### Enter docker folder
```bash 
# Enter docker folder from current directory
cd docker
```

#### Install corresponding dependency modules
```bash

pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt
# Install dependencies using Aliyun source
pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# command not found: pip  use pip3



```


#### Start container using Docker Compose Up in docker directory (ensure vpn connects normally):

```bash

# Build required for first run
docker compose up --build
# Not required for subsequent runs
docker compose up

```

#### Access API via [http://localhost:8000/docs](http://localhost:8000/docs).

#### Example process

#####  (Register user -> Query user memory (stop if none) -> Add user memory -> Query user memory)

##### Register User http://localhost:8000/product/users/register (POST)
```bash
# Response
{
    "code": 200,
    "message": "User registered successfully",
    "data": {
        "user_id": "8736b16e-1d20-4163-980b-a5063c3facdc",
        "mem_cube_id": "b32d0977-435d-4828-a86f-4f47f8b55bca"
    }
}
```

##### Add User Memory http://localhost:8000/product/add (POST)
```bash
# Request params
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
# Response
{
    "code": 200,
    "message": "Memory created successfully",
    "data": null
}
```

##### Query User Memory http://localhost:8000/product/search (POST)
```bash
# Request params
{
  "query": "What do I like",
  "user_id": "8736b16e-1d20-4163-980b-a5063c3facdc",
  "mem_cube_id": "b32d0977-435d-4828-a86f-4f47f8b55bca"
}
# Response
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
                  "memory": "[user viewpoint] User likes strawberries.",
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
                      "memory": "[user viewpoint] User likes strawberries."
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



# Response failure, troubleshooting
# src/memos/api/config.py
# Check "neo4j_vec_db" and "EMBEDDING_DIMENSION" configured in get_neo4j_community_config method
```


#### Modifications to server code or library code will automatically reload the server.


::

### Client Install with uv

::steps{level="4"}

#### Install dependencies

```bash
# pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt
# Install dependencies using Aliyun source
pip3 install --no-cache-dir -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/


```

#### Open terminal and run the following command to install:

```bash

# Packages that might need manual installation currently. Need to find resources for these two packages
# neo4j.5.26.4.tar   qdrant.v1.15.3.tar
docker load -i neo4j.5.26.4.tar
docker load -i qdrant.v1.15.3.tar
# Check if installed successfully
docker images
# Check if running
docker ps -a



# Root directory
 uvicorn memos.api.server_api:app --host 0.0.0.0 --port 8000 --workers 1

# If ModuleNotFoundError: No module named 'memos' appears during startup, it is due to path matching problem, please execute
export PYTHONPATH=/you-file-absolute-path/MemOS/src

```

#### Access API

After startup is complete, access API via [http://localhost:8000/docs](http://localhost:8000/docs).


::

### Docker use repository dependency package image/start (Recommended use)
::steps{level="4"}

#### Reference configuration environment variables above, .env file should be configured

#### Configure Dockerfile (Current Dockerfile is in root directory)
```bash
# Lean package url
FROM registry.cn-shanghai.aliyuncs.com/memtensor/memos:base-v1.0

WORKDIR /app

ENV HF_ENDPOINT=https://hf-mirror.com

ENV PYTHONPATH=/app/src

COPY src/ ./src/

EXPOSE 8000

CMD ["uvicorn", "memos.api.server_api:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

```

#### Local build - supports amd x86: windows, intel chip build method (choose step 2 ignore step 3 according to chip type)
##### (Image name:version: Example: memos-api-server:v1.0.1):

```bash
docker build -t memos-api-server:v1.0.1 .  
```

![MemOS buildSuccess](https://cdn.memtensor.com.cn/img/memos_build_success_ay2epm_compressed.png)
<div style="text-align: center; margin-top: 10px；font-size:12px">Example image, build command as per custom image name:version</div>  

##### Start service using docker run:

```bash
docker run --env-file .env -p 8000:8000 memos-api-server:v1.0.1
```

#### Local build - arm: mac m chip (choose step 3 ignore step 2 according to chip type)
##### Support arm: mac m chip build method docker compose up
##### Enter docker directory, configure docker-compose.yml file. Reference <a href="https://github.com/MemTensor/MemOS/blob/main/docker/docker-compose.yml">docker-compose.yml</a>.

##### Build and start service using docker compose up:
```bash
# Enter docker directory
docker compose up
```
![MemOS buildComposeupSuccess](https://cdn.memtensor.com.cn/img/memos_build_composeup_success_jgdd8e_compressed.png)
<div style="text-align: center; margin-top: 10px">Example image, port as per docker custom configuration</div>  






#### Access API via [http://localhost:8000/docs](http://localhost:8000/docs).

![MemOS Architecture](https://statics.memtensor.com.cn/memos/openapi.png)


#### Test cases (Register user->Add user memory->Query user memory) Refer to Docker Compose up test cases

::

### Without Docker
::steps{level="4"}
#### Reference configuration environment variables above, .env file should be configured

#### Install Poetry for dependency management:

```bash
curl -sSL https://install.python-poetry.org | python3 - 
```

#### Poetry environment variable configuration:

```bash

# To start using, you need to find Poetry's bin directory in "PATH" (/Users/jinyunyuan/.local/bin) environment variable
# Modern macOS systems default Shell is zsh. You can confirm via following command
1. Determine which Shell you are using

echo $SHELL
# If output is /bin/zsh or /usr/bin/env zsh, then you are zsh.
# (If your system version is older, might still be using bash, output will be /bin/bash)
2. Open corresponding Shell config file
# If using zsh (vast majority of cases):
# Use nano editor (recommended for beginners)
nano ~/.zshrc

# Or use vim editor
# vim ~/.zshrc
# If using bash:
nano ~/.bash_profile
# Or
nano ~/.bashrc

3. Add PATH environment variable

# At the very end of opened file, start a new line, paste installation prompt command:
export PATH="/you-path/.local/bin:$PATH"

4. Save and exit editor

# If using nano:
# Press Ctrl + O to write (save), press Enter to confirm filename.
# Then press Ctrl + X to exit editor.

# If using vim:
# Press i to enter insert mode, paste code, then press ESC key to exit insert mode.
# Input :wq, then press Enter to save and exit.

5. Make configuration take effect immediately
# Newly modified config file won't automatically take effect in currently open terminal window, you need to run one of the following commands to reload it:

# For zsh:
source ~/.zshrc

# For bash:
source ~/.bash_profile

6. Verify if installation is successful
# Now, you can execute test command in prompt to check if everything is ready:
poetry --version
# Success will show version number Poetry (version 2.2.0)

```

#### Install all project dependencies and development tools:

```bash
make install  
```

#### First start neo4j and qdrant in docker

#### Start FastAPI server (In MomOS directory):

```bash
uvicorn memos.api.product_api:app --host 0.0.0.0 --port 8000 --reload
```

#### After server runs, you can use OpenAPI docs to test API, URL is [http://localhost:8000/docs](http://localhost:8000/docs) or [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

#### Test cases (Register user->Add user memory->Query user memory) Refer to Docker Compose up test cases

::


### Start using pyCharm

#### Run server_api
```bash
1. Enter MemOS/docker/Dockerfile file, modify run configuration
# Start the docker
CMD ["uvicorn", "memos.api.server_api:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

2. Enter directory MemOS/src/memos/api directly run server_api.py

```