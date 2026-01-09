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

#### 准备开发依赖

确保本地已安装：

- Git
- Python 3.9+
- Make

验证 Python：

```bash
python3 --version
```

#### 安装 Poetry

MemOS 使用 Poetry 管理 Python 依赖。推荐使用官方安装脚本：

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

验证安装是否成功：

```bash
poetry --version
```

如果提示 `poetry: command not found`，请将安装器输出中提示的 Poetry 可执行文件目录加入 PATH，然后重新打开终端再验证。

更多安装选项参考：[官方安装指南](https://python-poetry.org/docs/#installing-with-the-official-installer)。

#### 安装依赖并设置 Pre-commit 钩子

在仓库根目录安装所有依赖与开发工具：

```bash
make install
```

提示：

- 如果你切换分支或依赖发生变化，可能需要**重新运行 `make install`** 以保持环境一致

::