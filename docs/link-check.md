# 文档链接检查与云效接入

检查本次构建的 `.output/public`，默认覆盖 HTML、单页 Markdown，以及根目录和 `/cn/` 下的 `llms.txt`、`llms-full.txt`。站内页面、资源和 HTML 锚点基于本地产物验证；外链使用只读 HEAD / GET 请求。

## 本地使用

使用项目固定的 pnpm 10.12.1，安装时需要包含 devDependencies。已在 Node.js 24.22.0 下完成本地验证。

```bash
pnpm install --frozen-lockfile --prod=false
pnpm run test:links
pnpm run publish --env=prod
pnpm run check:links
```

仅检查站内链接（用于离线排查，不作为正式发布的完整门禁）：

```bash
pnpm run check:links:internal
```

可指定产物、报告和配置位置，支持空格及 `=` 两种参数格式：

```bash
pnpm run check:links --public-dir=.output/public --report-dir=.output/reports/link-check --config=scripts/check-links.config.json
```

默认输出：

- 控制台：统计摘要及前 30 个确定错误。
- `.output/reports/link-check/links.json`：所有检查结果、全部引用位置、提交 SHA、时间和退出码。
- `.output/reports/link-check/links.md`：错误、待确认项、跳过项及例外清单。

完整报告和控制台输出默认使用简体中文，包括统计、问题说明、重定向路径、引用位置和配置错误。报告时间显示为北京时间。JSON 保留原有英文字段名、状态值及错误代码供流水线解析，`message` 使用中文，并以 `language: "zh-CN"` 标识报告语言；URL、文件名及底层网络诊断保留原值以便定位。

报告目录必须位于发布目录之外。`.output` 已被 Git 忽略；报告不会自动提交或随站点上传。

## 判定规则

| 情况 | 结果 | 阻断部署 |
|---|---|---|
| 站内页面、资源不存在 | error / MISSING_FILE | 是 |
| HTML 目标缺少对应 id / a[name] | error / MISSING_ANCHOR | 是 |
| URL 或编码非法 | error / INVALID_URL | 是 |
| 外链 GET 复核为 404 / 410 | error / HTTP_BROKEN | 是 |
| HTTP 或 HTML refresh 重定向循环、超出上限 | error | 是 |
| HTTP 401 / 403、其他未确认的响应 | warning | 默认否 |
| 超时、429 / 5xx、DNS 或 TLS 错误 | 重试后 warning | 默认否 |
| 外链大面积未验证，或达到整体时限 | complete=false | 是 |
| mailto / tel / sms / data / blob / javascript | skipped | 否 |
| 本地服务地址或配置中的示例域名 | skipped，并保留引用和原因 | 否 |

退出码：`0` 无阻断错误（仍可能有 warning）；`1` 确定失效；`2` 检查未完成或配置、产物、运行环境异常。流水线同时拦截 `1` 和 `2`。

检查范围与 URL 语义：

- HTML 提取 a / area 的 href，img / source 的 src 和 srcset，video 的 src / poster，audio / iframe / embed 的 src，object 的 data，图片 input 的 src，以及 HTML refresh 跳转。包含全局导航和页头页脚。
- Markdown 使用语法树提取普通、引用式链接、图片、GFM 自动链接和内嵌 HTML；跳过代码块、行内代码及 frontmatter。元数据经渲染的链接由 HTML 检查覆盖。
- 同站完整域名也指向本次产物，不请求线上旧版本。配置中的文档站别名域名按同样规则处理；Dashboard、产品官网等其他域名属于外链。
- 目录型 HTML 用 `/path/` 作为公开地址，同时识别 `/path`；兼容 `/path.html` 产物。Markdown 的 `/path.md` 必须存在自己的文件，不能用 HTML 替代。
- 相对路径按当前产物的公开 URL 解析。全文汇总文件里的相对链接按汇总文件 URL 解析，不借用原始文章的目录掩盖失效问题。
- 文件定位忽略 query，外链请求保留 query。HTML 锚点区分大小写，并处理中文、URL 编码和显式 a[name]。
- 指向 Markdown、txt、PDF 等非 HTML 资源的 fragment 依赖具体阅读器，列为 warning；外站 fragment 不验证，报告单独统计引用数量。
- 检查确认资源存在或 URL 可访问。外站返回 HTTP 200 的登录页、软 404、JavaScript 运行后才出现的链接，以及查询参数的业务含义，仍需相应的页面或业务验证。
- API 基地址、配置项默认值等若只是示例值，应使用行内代码或代码块展示。裸 URL 可能被 Markdown 自动转换成链接；它返回 GET 404 时会触发检查，但这不等于 API 的实际业务请求失效，需要结合原文处理。

## 配置与例外

配置位于 `scripts/check-links.config.json`：

| 参数 | 默认值 | 含义 |
|---|---|---|
| siteUrl / internalOrigins | 当前正式文档站 | 公开 URL 和站内域名别名；预发检查时使用实际域名 |
| exampleHosts | localhost、回环地址、example.com / org / net 等 | 精确匹配的示例域名；另识别 127.* 和 *.localhost |
| timeoutMs | 10000 | 每次 HTTP 请求超时 |
| retries / retryDelayMs | 2 / 500 | GET 临时错误额外重试次数，间隔按 500ms、1000ms 递增 |
| concurrency / perOriginConcurrency | 8 / 2 | 全局和单 origin 的请求并发上限，重定向也受限制 |
| maxRedirects | 5 | 重定向次数上限 |
| maxDurationMs | 600000 | 整轮外链检查上限，超时的未执行项也进入报告 |
| incompleteMinUrls / incompleteRatio | 5 / 0.5 | 外链至少 5 个且未验证比例严格超过 50% 时，返回检查未完成 |

HEAD 未成功时会用 GET 复核。GET 探测收到响应头后关闭响应流，避免下载整段视频或压缩包。不同页面重复引用同一外链时只探测一次，报告保留所有来源；外链去重时忽略 fragment，保留 query。

默认例外清单为空。确实需要暂时豁免时，使用完整解析后的 URL，并记录原因、负责人及短期到期时间。例如（日期需替换为有效的未来日期）：

```json
{
  "url": "https://partner.example.org/login-required",
  "source": "/cn/memos_cloud/getting_started/quick_start/",
  "reason": "合作方正在迁移，关联问题 DOC-123",
  "owner": "文档负责人",
  "expires": "2026-11-05"
}
```

将该项加入 `exceptions` 数组。`source` 可选，填写时只豁免这个准确的公开路径；省略时豁免该完整 URL 的全部引用。到期日按 UTC 当日结束计算，过期、无负责人或日期非法会返回 `2`，避免例外永久遗留。

## 云效接入：直接阻断

在现有流水线中保留 GitHub 代码源，在现有 **Node.js 构建任务** 内加入链接检查，顺序为：

```text
拉取指定提交 → 安装依赖 → 检查器测试 → 构建文档 → 链接检查
                                                      ↓ 通过
                                          构建物上传 → 原有部署
```

云效 Flow 支持在任务中添加“执行命令”“构建物上传”“报告上传”等步骤，参见[官方流程配置文档](https://help.aliyun.com/zh/yunxiao/user-guide/process-configuration)。

1. 编辑当前流水线，打开 Node.js 构建任务。确认 Node.js 版本与项目兼容，并提供 pnpm 10.12.1；镜像未提供时，可以先执行 `npm install -g pnpm@10.12.1`。
2. 构建命令在仓库根目录运行，安装 devDependencies；不要缓存或复用旧 `.output`。
3. 在现有构建命令后追加链接检查。如果当前使用的不是 `publish`，保留原构建命令，但必须保证全部 Markdown / LLM 导出已完成。

```bash
set -eu

pnpm install --frozen-lockfile --prod=false
pnpm run test:links
pnpm run publish --env=prod
pnpm run check:links
```

4. 将当前“构建物上传”或 OSS 上传步骤放在检查成功之后。上传内容仍为 `.output/public`，不要上传整个 `.output`。
5. 后续部署必须依赖这个任务成功；保持失败即停止。正式发布使用 `check:links`，不能替换为 `check:links:internal`，也不能追加 `|| true`。
6. 给构建任务保留足够的时间：原构建耗时之外，完整外链检查最多需要 10 分钟。

**构建、检查在同一任务内完成**，然后上传已检查的产物。云效任务之间工作区独立；若拆任务，应通过构建物传递产物，见[官方工作区说明](https://help.aliyun.com/zh/yunxiao/build-common-error-troubleshooting)。部署阶段直接使用这份产物，不再次构建。

该方式会立即阻断错误，报告路径和主要问题可从执行日志查看。

## 云效接入：失败时也保留完整报告

需要从云效下载失败报告时，在同一个构建任务内按以下顺序设置串行步骤。报告归档和最终门禁分开，确保归档不受链接错误阻断。

| 顺序 | 云效步骤 | 操作 |
|---|---|---|
| 1 | 执行命令 / Node.js 构建 | 安装依赖、测试、构建，使用上面的命令但先不执行最后一行 check:links |
| 2 | 执行命令：采集链接结果 | 使用下面的采集命令，保存真实退出码 |
| 3 | 构建物上传：链接检查报告 | 上传路径 `.output/reports/link-check`，使用独立于站点产物的名称 |
| 4 | 执行命令：链接发布门禁 | 恢复退出码，错误时终止任务 |
| 5 | 原有站点构建物上传 / OSS 上传 | 仅在门禁通过后运行，内容为 `.output/public` |

步骤 2，采集命令：

```bash
set -eu

link_status=0
pnpm run check:links || link_status=$?
mkdir -p .output/reports/link-check
printf '%s\n' "$link_status" > .output/reports/link-check/exit-code
```

这一采集步骤结束后继续归档报告，随后步骤 4 必须执行以下门禁：

```bash
set -eu

link_status="$(cat .output/reports/link-check/exit-code)"
case "$link_status" in
  0|1|2) exit "$link_status" ;;
  *) echo "链接检查结果无效或未完成" >&2; exit 2 ;;
esac
```

缺失状态文件、错误退出码、`1` 和 `2` 都会阻断。采集、归档、门禁三个步骤必须在同一个任务内顺序执行；门禁位于站点上传及任何生产资源修改之前。普通构建失败仍会在步骤 1 直接停止。

## OSS 元数据操作迁移

`publish` / `generate` 现在只生成本地产物，即使设置了 `OSS_BUCKET`，也不再自动修改远端对象元数据。

如果原有上传步骤已经正确设置 `.md`、LLM txt、JSON 等 Content-Type，可继续使用该能力。如果依赖本仓库 `oss:meta` 脚本，应将它移到 **链接门禁通过、OSS 文件上传完成之后**：

```bash
pnpm run oss:meta
```

该步骤沿用原来的 `OSS_BUCKET`、可选 `OSS_PREFIX` 和 `OSSUTIL_BIN`。需要 Node.js、ossutil 及对应权限；运行环境必须能访问本次提交的 `scripts/` 和同一份 `.output/public`，因为脚本会从本地产物生成元数据清单。若原部署任务只有云效 OSS 插件、没有这些文件或工具，可将元数据步骤放在具备这些条件的上传任务末尾。

## 首次启用

先在需求分支上运行并下载完整报告，修复已有死链或登记有依据的短期例外，再开启正式发布门禁。现有历史错误会真实阻断，检查器不会自动生成忽略基线。
