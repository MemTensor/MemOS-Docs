---
title: "PolarDB 图数据库"
desc: "MemOS 支持使用 **PolarDB**（基于 Apache AGE 扩展）作为图数据库后端，用于存储和检索知识图谱式的记忆数据。PolarDB 结合了 PostgreSQL 的强大功能和图数据库的灵活性，特别适合需要同时进行关系型和图数据查询的场景。
"
---




## 功能特性

::list{icon="ph:check-circle-duotone"}
- 完整的图数据库操作：节点增删改查、边管理
- 向量嵌入搜索：支持 IVFFlat 索引的语义检索
- 连接池管理：自动管理数据库连接，支持高并发
- 多租户隔离：支持物理和逻辑两种隔离模式
- JSONB 属性存储：灵活的元数据存储
- 批量操作：支持批量插入节点和边
- 自动时间戳：自动维护 `created_at` 和 `updated_at`
- SQL 注入防护：内置参数化查询和字符串转义
::

## 目录结构

```
MemOS/
└── src/
    └── memos/
        ├── configs/
        │   └── graph_db.py              # PolarDBGraphDBConfig 配置类
        └── graph_dbs/
            ├── base.py                  # BaseGraphDB 抽象基类
            ├── factory.py               # GraphDBFactory 工厂类
            └── polardb.py               # PolarDBGraphDB 实现
```

## 快速开始

### 1. 安装依赖

```bash
# 安装 psycopg2 驱动（二选一）
pip install psycopg2-binary  # 推荐：预编译版本
# 或
pip install psycopg2          # 需要 PostgreSQL 开发库

# 安装 MemOS
pip install memos
```

### 2. 配置 PolarDB

#### 方式一：使用配置文件（推荐）

```json
{
  "graph_db_store": {
    "backend": "polardb",
    "config": {
      "host": "localhost",
      "port": 5432,
      "user": "postgres",
      "password": "your_password",
      "db_name": "memos_db",
      "user_name": "alice",
      "use_multi_db": true,
      "auto_create": false,
      "embedding_dimension": 1024,
      "maxconn": 100
    }
  }
}
```

#### 方式二：代码初始化

```python
from memos.configs.graph_db import PolarDBGraphDBConfig
from memos.graph_dbs.polardb import PolarDBGraphDB

# 创建配置
config = PolarDBGraphDBConfig(
    host="localhost",
    port=5432,
    user="postgres",
    password="your_password",
    db_name="memos_db",
    user_name="alice",
    use_multi_db=True,
    embedding_dimension=1024,
    maxconn=100
)

# 初始化数据库
graph_db = PolarDBGraphDB(config)
```

### 3. 基本操作示例

```python
# ========================================
# 步骤 1: 添加节点
# ========================================
node_id = graph_db.add_node(
    label="Memory",
    properties={
        "content": "Python 是一种高级编程语言",
        "memory_type": "Knowledge",
        "tags": ["programming", "python"]
    },
    embedding=[0.1, 0.2, 0.3, ...],  # 1024维向量
    user_name="alice"
)
print(f"✓ 节点已创建: {node_id}")

# ========================================
# 步骤 2: 更新节点
# ========================================
graph_db.update_node(
    id=node_id,
    fields={
        "content": "Python 是一种解释型、面向对象的高级编程语言",
        "updated": True
    },
    user_name="alice"
)
print("✓ 节点已更新")

# ========================================
# 步骤 3: 创建关系
# ========================================
# 先创建第二个节点
node_id_2 = graph_db.add_node(
    label="Memory",
    properties={
        "content": "Django 是 Python 的 Web 框架",
        "memory_type": "Knowledge"
    },
    embedding=[0.15, 0.25, 0.35, ...],
    user_name="alice"
)

# 创建边
edge_id = graph_db.add_edge(
    source_id=node_id,
    target_id=node_id_2,
    edge_type="RELATED_TO",
    properties={
        "relationship": "框架与语言",
        "confidence": 0.95
    },
    user_name="alice"
)
print(f"✓ 关系已创建: {edge_id}")

# ========================================
# 步骤 4: 向量搜索
# ========================================
query_embedding = [0.12, 0.22, 0.32, ...]  # 查询向量

results = graph_db.search_by_embedding(
    embedding=query_embedding,
    top_k=5,
    memory_type="Knowledge",
    user_name="alice"
)

print(f"\n🔍 找到 {len(results)} 个相似节点:")
for node in results:
    print(f"  - {node.get('content')} (相似度: {node.get('score', 'N/A')})")

# ========================================
# 步骤 5: 删除节点
# ========================================
graph_db.delete_node(id=node_id, user_name="alice")
print(f"✓ 节点 {node_id} 已删除")
```

## 配置详解

### PolarDBGraphDBConfig 参数说明

| 参数 | 类型 | 默认值 | 必填 | 说明 |
|------|------|--------|------|------|
| `host` | str | - | ✓ | 数据库主机地址 |
| `port` | int | 5432 | ✗ | 数据库端口 |
| `user` | str | - | ✓ | 数据库用户名 |
| `password` | str | - | ✓ | 数据库密码 |
| `db_name` | str | - | ✓ | 目标数据库名称 |
| `user_name` | str | None | ✗ | 租户标识（用于逻辑隔离） |
| `use_multi_db` | bool | True | ✗ | 是否使用多数据库物理隔离 |
| `auto_create` | bool | False | ✗ | 是否自动创建数据库 |
| `embedding_dimension` | int | 1024 | ✗ | 向量嵌入维度 |
| `maxconn` | int | 100 | ✗ | 连接池最大连接数 |

### 多租户模式对比

| 特性 | 物理隔离<br/>(`use_multi_db=True`) | 逻辑隔离<br/>(`use_multi_db=False`) |
|------|-----------------------------------|-------------------------------------|
| **隔离级别** | 数据库级别 | 应用层标签过滤 |
| **配置要求** | `db_name` 通常等于 `user_name` | 必须提供 `user_name` |
| **性能** | 更好（独立资源） | 较好（共享资源） |
| **成本** | 高（每租户独立DB） | 低（共享数据库） |
| **适用场景** | 企业客户、高安全要求 | SaaS 多租户、开发测试 |
| **数据迁移** | 方便（整库导出） | 需要按标签过滤 |

### 配置示例

#### 示例 1：物理隔离（企业版推荐）

```json
{
  "graph_db_store": {
    "backend": "polardb",
    "config": {
      "host": "prod-polardb.example.com",
      "port": 5432,
      "user": "admin",
      "password": "secure_password",
      "db_name": "customer_001",
      "user_name": null,
      "use_multi_db": true,
      "auto_create": false,
      "embedding_dimension": 1536,
      "maxconn": 200
    }
  }
}
```

#### 示例 2：逻辑隔离（SaaS 推荐）

```json
{
  "graph_db_store": {
    "backend": "polardb",
    "config": {
      "host": "shared-polardb.example.com",
      "port": 5432,
      "user": "app_user",
      "password": "app_password",
      "db_name": "shared_memos",
      "user_name": "tenant_alice",
      "use_multi_db": false,
      "auto_create": false,
      "embedding_dimension": 768,
      "maxconn": 50
    }
  }
}
```

## 高级特性

### 1. 批量插入节点

```python
# 批量添加节点（高性能）
nodes_data = [
    {
        "label": "Memory",
        "properties": {"content": f"节点 {i}", "memory_type": "Test"},
        "embedding": [0.1 * i] * 1024,
    }
    for i in range(100)
]

node_ids = graph_db.add_nodes_batch(
    nodes=nodes_data,
    user_name="alice"
)
print(f"✓ 批量创建了 {len(node_ids)} 个节点")
```

### 2. 复杂查询示例

```python
# 查找特定类型的记忆并按时间排序
def get_recent_memories(graph_db, memory_type, limit=10):
    """获取最近的记忆节点"""
    query = f"""
        SELECT * FROM "{graph_db.db_name}_graph"."Memory"
        WHERE properties->>'memory_type' = %s
          AND properties->>'user_name' = %s
        ORDER BY updated_at DESC
        LIMIT %s
    """
    
    conn = graph_db._get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, [memory_type, "alice", limit])
            results = cursor.fetchall()
            return results
    finally:
        graph_db._return_connection(conn)

# 使用示例
recent = get_recent_memories(graph_db, "WorkingMemory", limit=5)
print(f"最近 5 条工作记忆: {len(recent)} 条")
```

### 3. 向量索引优化

```python
# 创建或更新向量索引
graph_db.create_index(
    label="Memory",
    vector_property="embedding",
    dimensions=1024,
    index_name="memory_vector_index"
)
print("✓ 向量索引已优化")
```

### 4. 连接池监控

```python
# 查看连接池状态（仅供调试）
import logging
logging.basicConfig(level=logging.DEBUG)

# 获取连接时会输出详细日志
conn = graph_db._get_connection()
# [DEBUG] [_get_connection] Successfully acquired connection from pool
graph_db._return_connection(conn)
# [DEBUG] [_return_connection] Successfully returned connection to pool
```

## BaseGraphDB 接口

PolarDB 实现了 `BaseGraphDB` 抽象类的所有方法，确保与其他图数据库后端的互换性。

### 核心方法

| 方法 | 说明 | 参数 |
|------|------|------|
| `add_node()` | 添加单个节点 | label, properties, embedding, user_name |
| `add_nodes_batch()` | 批量添加节点 | nodes, user_name |
| `update_node()` | 更新节点属性 | id, fields, user_name |
| `delete_node()` | 删除节点 | id, user_name |
| `delete_node_by_params()` | 按条件删除节点 | params, user_name |
| `add_edge()` | 创建关系 | source_id, target_id, edge_type, properties, user_name |
| `update_edge()` | 更新关系属性 | edge_id, properties, user_name |
| `delete_edge()` | 删除关系 | edge_id, user_name |
| `search_by_embedding()` | 向量相似度搜索 | embedding, top_k, memory_type, user_name |
| `get_node()` | 获取单个节点 | id, user_name |
| `get_memory_count()` | 统计节点数量 | memory_type, user_name |
| `remove_oldest_memory()` | 清理旧记忆 | memory_type, keep_latest, user_name |

### 完整方法签名示例

```python
from typing import Any

# 添加节点
def add_node(
    self,
    label: str = "Memory",
    properties: dict[str, Any] | None = None,
    embedding: list[float] | None = None,
    user_name: str | None = None
) -> str:
    """添加一个新节点到图数据库"""
    pass

# 向量搜索
def search_by_embedding(
    self,
    embedding: list[float],
    top_k: int = 10,
    memory_type: str | None = None,
    user_name: str | None = None,
    filters: dict[str, Any] | None = None
) -> list[dict[str, Any]]:
    """基于向量嵌入进行相似度搜索"""
    pass

# 批量操作
def add_nodes_batch(
    self,
    nodes: list[dict[str, Any]],
    user_name: str | None = None
) -> list[str]:
    """批量添加多个节点"""
    pass
```

## 扩展开发指南

如果需要基于 PolarDB 实现自定义功能，可以继承 `PolarDBGraphDB` 类：

```python
from memos.graph_dbs.polardb import PolarDBGraphDB
from memos.configs.graph_db import PolarDBGraphDBConfig

class CustomPolarDBGraphDB(PolarDBGraphDB):
    """自定义 PolarDB 图数据库实现"""
    
    def __init__(self, config: PolarDBGraphDBConfig):
        super().__init__(config)
        # 自定义初始化逻辑
        self.custom_index_created = False
    
    def create_custom_index(self):
        """创建自定义索引"""
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(f"""
                    CREATE INDEX IF NOT EXISTS idx_custom_field
                    ON "{self.db_name}_graph"."Memory" 
                    ((properties->>'custom_field'));
                """)
                conn.commit()
                self.custom_index_created = True
                print("✓ 自定义索引已创建")
        except Exception as e:
            print(f"❌ 创建索引失败: {e}")
            conn.rollback()
        finally:
            self._return_connection(conn)
    
    def search_by_custom_field(self, field_value: str):
        """基于自定义字段搜索"""
        query = f"""
            SELECT * FROM "{self.db_name}_graph"."Memory"
            WHERE properties->>'custom_field' = %s
        """
        
        conn = self._get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, [field_value])
                results = cursor.fetchall()
                return results
        finally:
            self._return_connection(conn)

# 使用自定义实现
config = PolarDBGraphDBConfig(
    host="localhost",
    port=5432,
    user="postgres",
    password="password",
    db_name="custom_db"
)

custom_db = CustomPolarDBGraphDB(config)
custom_db.create_custom_index()
results = custom_db.search_by_custom_field("special_value")
```

## 参考资源

- [Apache AGE 官方文档](https://age.apache.org/)
- [PostgreSQL 连接池文档](https://www.psycopg.org/docs/pool.html)
- [PolarDB 官方文档](https://www.alibabacloud.com/product/polardb)
- [MemOS GitHub 仓库](https://github.com/MemOS-AI/MemOS)

## 下一步

- 了解 [Neo4j 图数据库](./neo4j_graph_db.md) 的使用
- 查看 [通用文本记忆](./general_textual_memory.md) 的配置
- 探索 [树形文本记忆](./tree_textual_memory.md) 的高级特性
