# dottypic.com 博客集成 — 进度与完成情况

> 交接文档。假定读者看不到代码库，因此关键代码、决策理由、以及为什么排除了某些做法都写在文里。
>
> 姊妹文档：`docs/dottypic-blog-integration.md`（原始方案）、`docs/blog-soft-404-mitigation.md`（软 404 缓解的实测记录）。

## 1. 背景

`dottypic.com` 是 Next.js 站点，需要接入一个博客。方案文档已确定架构：**Headless WordPress + Next.js SSG/ISR**。

- WordPress 部署在 Railway（`https://wordpress-dot.up.railway.app`），只作内容源，不渲染任何前台页面。
- Next.js 通过 REST API 拉数据，用站内自己的 React 组件渲染，Header/Footer 与主站完全一致。
- 明确**不采用**反向代理，也**不采用**在 WP 主题里用 CSS 重新还原 Header/Footer。

技术栈：Next.js 15.5.14（App Router）、React 19、TypeScript、next-intl 4.13、Tailwind CSS v4（CSS-first 配置，无 `@tailwindcss/typography`），部署在 Vercel。

三个 locale：`en` / `jp` / `id`，默认 `en`，`localePrefix: "as-needed"`（en 不带前缀）。

WordPress 当前状态：REST API 正常，`x-wp-total: 1`，只有一篇默认的 `hello-world`，无特色图，无媒体文件。固定链接结构是 `/%year%/%monthnum%/%day%/%postname%/`。

## 2. 完成情况总览

| 任务 | 状态 |
|---|---|
| WordPress API 请求工具 | ✅ 完成（重写） |
| `/blog` 列表页 | ✅ 完成 |
| `/blog/[slug]` 详情页 | ✅ 完成 |
| `/blog/page/[n]` 分页 | ✅ 完成 |
| Gutenberg 区块样式覆盖 | ✅ 完成 |
| 导航栏 Blog 菜单项 | ✅ 完成 |
| Sitemap 收录 | ✅ 完成 |
| 文章内链改写 | ✅ 完成（方案外追加） |
| 软 404 收录缓解 | ✅ 完成（方案外追加） |
| 软 404 状态码根因修复 | ❌ 未做，站点级问题，需单独排期 |

`tsc --noEmit` 干净，`npm run lint` 只剩两条既有警告，`npm run build` 通过。**改动全部在工作区，尚未提交。**

## 3. 三个已确认的产品决策

1. **三语路由都生成，并预留多语言接口。** WP 现在只有一套英文文章，将来可能上 Polylang/WPML。所以 `/blog`、`/jp/blog`、`/id/blog` 现在就都存在；UI 文案走 i18n，正文暂时是英文，canonical 统一指向 en 版避免 SEO 判重。数据层一律带 `locale` 参数（当前实现忽略它）。将来 WP 上了多语言，改动收敛在两个文件里，路由/导航/sitemap 一行不用动。
2. **视觉沿用 guide/首页那套**：Bricolage Grotesque / DM Sans 字体、`#fbfcf7` 纸底、lime 强调色、1180px 容器、圆角卡片。
3. **列表页做了分页**，路径式 `/blog` + `/blog/page/[n]`，每页 9 篇。

## 4. 文件清单

### 新增（共约 1166 行）

| 文件 | 行数 | 作用 |
|---|---|---|
| `src/app/blog.css` | 310 | Gutenberg 区块样式覆盖，全部 `.blog-scope` 前缀隔离 |
| `src/lib/blogSeo.ts` | 188 | canonical 策略、日期格式化、metadata、JSON-LD、未找到页 metadata |
| `src/lib/blogContent.ts` | 88 | 文章正文里的 WP 内链改写成站内路径 |
| `src/app/[locale]/(public)/blog/[slug]/page.tsx` | 122 | 文章详情页 |
| `src/components/blog/BlogPostCard.tsx` | 73 | 单张文章卡片 |
| `src/components/blog/BlogIndex.tsx` | 57 | 列表页主体，两个列表路由共用 |
| `src/app/[locale]/(public)/blog/page/[pageNumber]/page.tsx` | 52 | 列表第 2 页起 |
| `src/components/blog/BlogPagination.tsx` | 50 | 上一页 / 页码 / 下一页 |
| `src/app/[locale]/(public)/blog/page.tsx` | 25 | 列表第 1 页 |

### 修改

| 文件 | 改动 |
|---|---|
| `src/lib/wordpress.ts` | 完全重写（原本是方案文档里的初版代码），201 行 |
| `next.config.ts` | `images.remotePatterns` 加 WP 媒体域名白名单 |
| `src/app/sitemap.ts` | 改成 async，动态收录博客 URL |
| `src/app/globals.css` | 加一行 `@import "./blog.css";` |
| `src/components/layout/Header.tsx` | `navLinks` 加一项 blog |
| `messages/{en,jp,id}.json` | `header.navBlog` + 新的 `blog` 命名空间 |
| `.env.example` | 记录可选的 `WORDPRESS_API_URL` |

## 5. 关键设计决策与理由

### 5.1 路由放在 `(public)` 路由组下

方案文档原本说在页面里手动 import Header/Footer。**这是错的** —— 项目里 Header/Footer 在 `src/app/[locale]/(public)/layout.tsx` 中，博客路由放进 `(public)/` 就自动带上，手动引入会重复渲染。

### 5.2 数据层为多语言预留接口

`src/lib/wordpress.ts` 里所有取数函数都带 `locale: AppLocale` 参数，当前实现通过一张表忽略它：

```ts
/** Per-locale REST query fragment. WordPress currently holds a single English post set, so every
 *  locale reads the same posts and all three fragments are empty ...
 *  This table is the switch point for going multilingual: under Polylang/WPML these become
 *  `&lang=en` / `&lang=ja` / `&lang=id`, and nothing outside this file has to change. */
const LOCALE_QUERY: Record<AppLocale, string> = { en: "", jp: "", id: "" };
```

`generateStaticParams` 也已按 locale × slug 的形状生成，将来译文 slug 分叉时不用改结构。

### 5.3 CMS 故障绝不能弄挂构建

Railway 上的 WP 可能休眠。所有取数函数**不抛异常**，而是返回带 `ok` 标志的结果：

```ts
export interface PostsPage {
    posts: WPPost[];
    totalPages: number;
    total: number;
    /** False only when WordPress could not be reached. Callers use it to tell "no posts yet"
     *  apart from "the CMS is down" ... and, more importantly, never fails `next build`. */
    ok: boolean;
}
```

**`ok` 不是防御性代码，是必需的。** 开发过程中这里出过一个真 bug：最初写成

```ts
if (page > 1 && result.posts.length === 0) notFound();
```

用一个有 1105 篇文章的真实 WordPress 压测时，构建期请求撞上 429 限流，这行代码把「取数失败」误读成「这一页不存在」，于是把一个 404 **永久烤进了静态文件**。加 `result.ok` 守卫后，不可达的 CMS 退化成「暂时无法加载」提示（可经 ISR 自愈）。

> ⚠️ 接手时不要把这个判断当成冗余给「优化」掉。

后来这条规则被提取成 `isMissingListPage(page, result)`，由 `BlogIndex` 和分页路由的 `generateMetadata` 共用，避免两边对「这一页算不算 404」产生分歧。

### 5.4 canonical 策略集中在一处

```ts
/** All three locales serve the same English posts today, so every blog URL canonicalises to the
 *  unprefixed English one and no hreflang set is emitted. The two are mutually exclusive:
 *  hreflang requires each alternate to be self-canonical ...
 *  This function is the single switch point for going multilingual. */
function blogAlternates(path: string): Metadata["alternates"] {
    return { canonical: localizedPath(path, DEFAULT_LOCALE) };
}
```

相应地，**sitemap 只收录 en 版博客 URL**。三语都收录和「canonical 统一指向 en」是自相矛盾的 —— sitemap 只该列 canonical URL。为此把 `/blog` 从 `ROUTES` 数组里拿出来单独处理。

### 5.5 日期必须用 `date_gmt`

WP 的 `date` 字段是站点本地时间且不带时区偏移，服务端预渲染和浏览器 hydration 会格式化出不同结果。统一用 `date_gmt` 补上 `Z`，并以 `timeZone: "UTC"` 格式化。

### 5.6 CSS 作用域

照 `src/app/guide.css` 的既有惯例：从 `globals.css` 全局 `@import`，但**每条选择器都加 `.blog-scope` 前缀**做结构性隔离。方案文档原说「仅在 blog 路由下 import」，改成了项目既有模式。覆盖 `wp-block-image` / `quote` / `list` / `heading` / `table` / `code` / `buttons` / `separator` / `embed` 及对齐类。颜色全部复用 `globals.css` 里已有的 `guide-*` token，不建第二套设计系统。

### 5.7 卡片摘要用纯文本

`excerpt.rendered` 会包一层 `<p>`，还可能带 "Continue reading" 的 `<a>`。整张卡片本身是 `<a>`，块级元素和嵌套锚点在里面都是非法 HTML。所以摘要走 `plainText()` 剥标签+解码实体，标题仍走 `dangerouslySetInnerHTML` 以保留 `<em>` 之类。

### 5.8 内链改写

运营用编辑器链接搜索指向另一篇文章时，Gutenberg 插入的是绝对地址（`https://wordpress-dot.up.railway.app/2026/08/28/hello-world/`），读者点了会跳到裸 WordPress 上。

`rewriteInternalLinks(html, posts, locale)` 用 `getAllPosts()` 建 **WP 固定链接 → slug 的精确映射表**（同时收 `post.link` 和 `post.guid` 的 `?p=1` 形式），命中才改写。

刻意**不用**「取 URL 最后一段当 slug」的启发式：它在当前固定链接结构下碰巧是对的且零成本，但 WP 后台改一次固定链接设置就静默出错，而且会把 `/category/uncategorized/` 变成一个 404 链接。实测中它也确实会在 `/podcast/148-xxx` 这种自定义文章类型上出错。

两个易漏的点：
- **改写结果必须带 locale 前缀。** 正文是 `dangerouslySetInnerHTML` 注入的裸 `<a>`，不走 next-intl 的 `Link`。写成 `/blog/other` 会把 `/jp/blog/…` 上的读者甩回英文 URL。所以走 `localizedPath(blogPostPath(slug), locale)`。
- **只处理 `href`，不碰 `src`。** 图片本来就该从 WP 域名加载。

额外成本是详情页多调一次 `getAllPosts(locale)`。实际接近零：三个 locale 的请求 URL 完全相同，Next 的 fetch 缓存在整次构建里去重。

### 5.9 软 404 收录缓解

详见 `docs/blog-soft-404-mitigation.md`。核心结论：**Next 本来就会给 `notFound()` 响应注入 `noindex`**（基线实测确认），收录风险框架已经挡住了；真正没被处理的是**这些不存在的 URL 从根 layout 继承了 canonical，每个都在声明自己是首页的副本**。已用 `alternates: { canonical: null }` 消除，并修正了标题。覆盖 `/blog/[slug]` 和 `/blog/page/[n]` 两个路由。

### 5.10 正文 HTML 不做净化

这是 headless WP 的标准做法，也是方案文档指定的。前提是 WP 后台只有自己人有账号 —— 一旦有账号被攻破，就等于 dottypic.com 上的存储型 XSS。

注意这跟 `src/components/guide/RichText.tsx` 不是一回事：那份 HTML 来自表格、过了同步脚本校验、还在 `git diff` 里被人看过；WP 正文这三条都不满足。这个信任假设已写进代码注释。

### 5.11 上线前真实内容验证发现的两个问题

用真实文章跑 CSS 覆盖比对时发现的，都已修复：

**分栏没有样式。** `wp-block-columns` / `wp-block-column` 完全没被覆盖，分栏会塌成上下堆叠。原始方案文档点名要求「分栏」必须保留，所以这是对既定需求的实打实的缺口。已按 WordPress 自己的 782px 断点补齐，并用 `flex-grow` 而非固定宽度 —— 编辑器会给手工调过宽度的栏写内联 `flex-basis`，那个必须优先。顺带补了 `wp-block-gallery`、`wp-block-group` 的 flex 布局、表格的 `has-fixed-layout`、以及嵌套容器内部的段落间距。

**特色图主机不在白名单会让整页崩溃。** `next/image` 遇到未配置的 host 会抛错，结果不是图片裂开而是**整篇文章页渲染失败**。两处修复：`next.config.ts` 的 `remotePatterns` 路径从 `/wp-content/**` 放宽到 `/**`（主机本来就是我们自己的，收窄换不来安全，却换来一个整页崩溃的失败模式），以及 `featuredImage()` 增加同主机检查，真遇到异源图片时降级成「没有缩略图」并打日志提示要往 `remotePatterns` 里加什么。

这个问题在自家 CMS 上目前不会触发（零媒体文件），但只要日后装个 CDN 卸载插件就会全站爆掉。

## 6. 验证结果

所有验证都基于实际运行的构建产物，不是推断。因为自家 CMS 只有一篇空文章，凡是需要真实内容的项目都改用公开的真实 WordPress 站点验证。

| 项目 | 结果 |
|---|---|
| `tsc --noEmit` / `npm run lint` | 干净（两条警告是 `opengraph-image.tsx` 既有的） |
| `npm run build` | 通过，`/blog` 与 `/blog/hello-world` 三语全部预渲染 |
| canonical | en 与 jp 均指向 `https://dottypic.com/blog/hello-world`，无 hreflang（按设计） |
| Railway 域名泄漏 | 三个页面均 0 处 |
| JSON-LD | BlogPosting + BreadcrumbList 结构完整 |
| 三语文案 | 导航、标题、本地化日期（`2026年8月28日` / `28 Agustus 2026`）、按钮全部正确 |
| blog.css | 9 条关键规则全部落地，**零条**未受 `.blog-scope` 约束 |
| 分页 | 用 1105 篇文章的真实站点实测：第 1/2/3 页各 9 篇，第 123 页 7 篇，页码与上下页链接正确，第 1 页指向 `/blog` 而非 `/blog/page/1` |
| `next/image` 远程图片 | 优化器返回 200 `image/jpeg` |
| CMS 完全不可达 | 构建成功、页面显示「暂时无法加载」、sitemap 保留 28 条静态路由 |
| 内链改写（逻辑层） | 16 处内链改写 14 处；媒体地址被改动 **0**、外部链接被改动 **0**、href 之外的标记被改动 **0**（逐字节比对） |
| 内链改写（运行时） | en 渲染出 `/blog/x`，jp 渲染出 `/jp/blog/x`，正文里 WP 域名锚点残留 0 |
| 软 404 缓解 | 4 个不存在的 URL 全部 `noindex, nofollow` + 无 canonical + 无 hreflang；正常页面零影响 |
| 既有页面回归 | 7 个页面全 200，`/jp/privacy` 的 canonical 与 4 条 hreflang 未变，sitemap 29 条不变 |

未命中的 2 处内链分别是「超出 2000 篇抓取上限的旧文」和「`podcast` 自定义文章类型」，都被正确留存并告警，在自家 CMS 上不会发生。

## 7. 已知问题

### 7.1 软 404 状态码（既有问题，非本次引入；已做收录缓解，根因未修）

`notFound()` 在任何 `(public)` 路由下都返回 **HTTP 200 而不是 404**。

已用一个只含 `notFound()`、不含任何博客代码的探针路由确认这是站点既有问题，也排除了 `src/app/not-found.tsx` 是原因（把它移走重建后行为不变）。根因在 Next 15.5 + next-intl 中间件重写层面：预渲染产物的 `.meta` 文件里根本没写入 `status: 404`。页面 UI 是对的，只有状态码错。

收录层面已缓解（见 5.9），**状态码仍是 200**，需要站点级单独排期。

### 7.2 `src/app/not-found.tsx` 在 dev 下报错（既有问题）

dev 模式下报 `not-found.tsx doesn't have a root layout` 并返回 500。生产构建下降级成 404，能用。未处理。

### 7.3 `notFound` 文案三个 locale 都是英文（既有问题）

`messages/{en,jp,id}.json` 里 `notFound` 命名空间的 5 个 key 内容完全相同，jp/id 从未翻译过。所以 `/jp/blog/nope` 的未找到页显示英文并不是 locale 解析问题，是文案本身没翻。属于站点既有内容缺口，不在博客范围内。

### 7.4 未验证项

Gutenberg 样式已用 wptavern 和 wordpress.org 的真实文章覆盖验证过 11 类区块（含表格、分栏、对齐类、alignwide/alignfull、代码块、按钮、引用、列表、分隔线、嵌入、画廊）。这轮验证发现并修掉了两个真问题，见 5.11。

**仍未在自家环境验证的**：从 wp-admin 编辑器实际操作产出的内容（此前的验证读的都是别人站点已发布的产物），以及特色图 —— 自家 CMS 至今零媒体文件，所以**上传路径从未被实测过**。`docs/blog-launch-checklist.md` 任务 2 就是干这个的。

### 7.5 内链改写的前提

映射表来自 `getAllPosts()`，只包含**已发布**的文章。如果 A 文里链向一篇还是草稿的 B 文，B 发布之前那个链接会指向 WP 域名；B 一发布，60 秒 ISR 窗口过后自动变成站内链接。行为合理，但排查时容易困惑。

## 8. 部署注意

- `WORDPRESS_API_URL` 是**可选**环境变量，不设则回落到 Railway 生产地址。`next.config.ts` 从同一个变量派生 `next/image` 的远程域名白名单，两者不会走偏。
- ISR `revalidate: 60`，新文章 60 秒内自动出现，无需重新部署。
- `robots.ts` 不需要改动。

## 9. 下一步待办

1. **提交改动**（目前全在工作区未提交）。
2. **站点级修复 `notFound()` 的 404 状态码**（见 7.1）—— 博客侧已做收录缓解，但状态码仍是 200。
3. 运营发一篇富文本文章后，复验 Gutenberg 样式（表格 / 代码块 / 对齐 / 特色图）（见 7.4）。
4. 可选：翻译 `notFound` 命名空间的 5 个 key（见 7.3）。
5. 方案文档里提到的 WP 侧遗留项（Apache 的 `X-Forwarded-Proto` 修复未固化到 Dockerfile），不属于前端范围。
