---
title: 配置开发环境
desc: 若要参与 MemOS 的开发，你需要在本地配置开发环境。
---

::steps{level="4"}

#### Fork 并克隆仓库

在本地设置项目仓库：

- 在 GitHub 上 fork 仓库
- 将你的 fork 克隆到本地：
    ```bash
    git clone https://github.com/YOUR-USERNAME/MemOS.git
    cd MemOS
    ```
- 添加上游仓库作为远程源：
    ```bash
    git remote add upstream https://github.com/MemTensor/MemOS.git
    ```

#### 安装 Poetry

使用 Poetry 进行依赖管理：

```bash
curl -sSL https://install.python-poetry.org | python3 -
````

或者参照 [官方安装指南](https://python-poetry.org/docs/#installing-with-the-official-installer)。

验证安装是否成功：

```bash
poetry --version
```

#### 安装依赖并设置 Pre-commit 钩子

安装所有项目依赖和开发工具：

```bash
make install
```

由于提交历史中环境可能发生变化，你可能需要**不时重新运行 `make install`**，以确保所有依赖都是最新的。

::
