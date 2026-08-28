# 博客上线收尾任务

功能开发已完成并通过验证（见 `docs/blog-integration-progress.md`）。

## 任务 1：提交代码 —— ✅ 已完成

三个 commit，按仓库既有的 conventional commits 习惯拆分：

```
9a4edb7  fix(blog): style column layouts and stop an off-host image killing the page
fcca48e  docs(blog): record the blog integration's plan, progress and open issues
3b9efdc  feat(blog): serve the Railway WordPress as a headless source at /blog
```

改动范围与进度文档第 4 节「文件清单」核对一致，`.env.local` 与 `.next/` 在忽略列表内，工作区已干净。目前在 `pre` 分支，**尚未推送**。

`.env.example` 里 `WORDPRESS_API_URL` 的注释已写明：可选，不设则回落到 Railway 生产地址，且 `next.config.ts` 从同一个变量派生 `next/image` 的域名白名单。

## 任务 2：真实富文本文章验证 —— 🟡 大部分已完成

原计划是登录 wp-admin 建一篇覆盖所有区块的测试文章。实际做法调整为**两段式**：能用外部真实内容验的先验掉，只把非自家环境无法验证的部分留给人工。

### 已完成：区块样式验证（用真实 WordPress 内容）

自家 CMS 只有一篇空白的 `hello-world`，无法产出可验的内容。改为扫描 wptavern 与 wordpress.org 共 200 篇真实已发布文章，把它们的区块类名与 `src/app/blog.css` 做覆盖比对，再把样本文章跑通完整渲染管线检查。

覆盖到的 11 类区块，均已验证 CSS 命中真实 DOM 结构：

| 区块 | 样本量 |
|---|---|
| `wp-block-list` | 149 篇 |
| `wp-block-image` | 86 篇 |
| `wp-block-quote` | 44 篇 |
| `wp-block-table`（含 `has-fixed-layout`） | 50 篇 |
| `has-text-align-center` / `-right` | 51 篇 |
| `wp-block-button` / `buttons` | 27 篇 |
| `wp-block-embed`（youtube / twitter） | 29 篇 |
| `wp-block-separator` | 19 篇 |
| `wp-block-columns` / `column` | 10 篇 |
| `wp-block-gallery` | 14 篇 |
| `wp-block-code` | 1 篇 |
| `alignwide` / `alignfull` | 14 篇 |

新增规则全部落地，且**零条**逃出 `.blog-scope` 约束（正则逐条核对）。

### 这轮验证发现并修复的两个真问题

**1. 分栏完全没有样式。** `wp-block-columns` / `wp-block-column` 一条规则都没有，分栏会塌成上下堆叠。原始方案文档点名要求「分栏」必须保留，属于对既定需求的实打实缺口。已按 WordPress 自己的 782px 断点补齐，用 `flex-grow` 而非固定宽度 —— 编辑器会给手工调过宽度的栏写内联 `flex-basis`（实测确有 `style="flex-basis:20%"`），那个必须优先。顺带补了 gallery、flex group、`has-fixed-layout`、嵌套容器内部段落间距。

**2. 特色图主机不在白名单会让整页崩溃。** 验证途中文章页直接白屏：`next/image` 遇到未配置的 host 会抛错，而渲染期抛错干掉的是**整篇文章页，不是那张图**。已放宽路径白名单到 `/**`，并让 `featuredImage()` 在遇到异源图片时降级成「没有缩略图」+ 打日志提示该加哪个 host。

### 仍需人工完成：两项自家后台才能验的

前面那些区块样式已用真实内容验过，**不必再逐条核对**。只剩下两条链路是外部内容无法覆盖的：

#### A. 特色图（优先，风险最高）

自家 CMS **至今零媒体文件**，所以 WordPress 的实际上传路径从头到尾没被观测过 —— 现有配置是按 WP 默认约定推的。这是唯一还完全没被实测的链路。

1. 后台（`https://wordpress-dot.up.railway.app/wp-admin/`）新建或编辑一篇文章，上传一张图设为 **Featured Image**，发布。
2. 等最多 60 秒（ISR 窗口），检查：
   - `dottypic.com/blog` 列表页卡片上缩略图是否显示（不显示则会是 lime 色圆点占位）
   - `dottypic.com/blog/[slug]` 详情页顶部大图是否显示
3. **如果图不显示**：看部署日志里有没有 `[wordpress] featured image skipped: "xxx" is not in next.config.ts images.remotePatterns` —— 这条日志会直接告诉你要往 `next.config.ts` 的 `remotePatterns` 加哪个 host。这是预期内的降级，不是崩溃。

#### B. 编辑器插入的内链

此前的内链验证读的是别人站点的已发布产物，没走过后台实际插入链接的路径。

1. 同一篇文章正文里，用**编辑器的链接搜索功能**选一篇已发布文章插入（不要手动粘贴 URL）。
2. 发布后访问详情页，点击该链接，确认落在 `dottypic.com/blog/...`，地址栏全程没跳出主站域名。
3. 注意：映射表只含**已发布**文章。链向草稿的话，草稿发布前该链接会指向 WP 域名，发布后 60 秒内自动变成站内链接 —— 这是预期行为，不是 bug。

#### 顺带扫一眼（可选）

同一篇文章里如果顺手加了表格、代码块、分栏、居中对齐，可以扫一眼观感。这些都已用真实内容验证过 CSS 生效，如果观感上想微调（表格太窄、按钮配色不搭之类），改 `src/app/blog.css` 里对应的 `.blog-scope` 规则即可，不需要大改。

### 验收标准

A、B 两项通过即可视为博客验证完成，对运营开放。测试文章可保留作长期样式基准，也可事后删除或转草稿。

## 遗留（不阻塞上线）

- **软 404 状态码仍是 200**，站点级问题，需单独排期。收录层面已缓解，见 `docs/blog-soft-404-mitigation.md`。
- `notFound` 文案三个 locale 都是英文，站点既有内容缺口。
- WP 侧 Apache 的 `X-Forwarded-Proto` 修复未固化到 Dockerfile，不属于前端范围。
