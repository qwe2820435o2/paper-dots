# dottypic.com Blog 集成方案（Headless WordPress + Next.js）

## 背景与目标

- 主站 `dottypic.com` 使用 Next.js + Tailwind CSS 搭建。
- 已在 Railway 部署一个独立的 WordPress + MariaDB 实例，作为博客的内容源，
  域名为 `https://wordpress-dot.up.railway.app`。
- 运营人员在 WordPress 后台（Gutenberg 编辑器）排版、发布文章。
- 目标：`dottypic.com/blog` 展示这些文章列表和详情页，Header/Footer 与主站
  其他页面完全一致（不能让用户感觉跳转到另一个网站），且排版效果需要
  1:1 还原运营人员在 WordPress 后台编排的样式。

## 已确定的架构：Headless WordPress + Next.js SSG/ISR

**不采用**反向代理（Next.js rewrites 直接转发到 WordPress 渲染 HTML）方案，
也**不采用**在 WordPress 主题里用 CSS 重新还原 Header/Footer 的方案。

原因：
1. 反代方案下，Header/Footer 需要在 WordPress 主题里用纯 CSS 重新实现一遍，
   主站样式一改这边容易漏改、跑偏。
2. 反代方案每次请求都要现场跑 WordPress 的 PHP + MySQL 查询再渲染，比
   Headless + SSG/ISR（提前生成好静态 HTML）慢。
3. Headless 架构下 Header/Footer 直接复用 Next.js 现有 React 组件，天然保持
   一致，无需额外维护。

**采用的架构**：
- WordPress 只作为内容源，通过 REST API 提供文章数据，不负责任何前台页面
  渲染。
- Next.js 新增 `/blog`（列表页）和 `/blog/[slug]`（详情页）两个路由，用
  `fetch` + ISR（`revalidate: 60`）拉取 WordPress REST API 数据，用 Next.js
  自己的 React 组件（含现有 Header/Footer）渲染整个页面。
- WordPress 返回的 `content.rendered` 字段是已经序列化好的 HTML（包含运营
  人员在 Gutenberg 编辑器里排版的全部格式信息：分栏、图片位置、加粗、列表、
  引用块等），直接渲染即可保留排版；只需要额外写一份 CSS 覆盖 Gutenberg
  默认区块 class（如 `wp-block-image`、`wp-block-quote`、
  `has-text-align-center` 等），使其符合站点视觉风格。

## WordPress 侧现状（已完成，仅供参考，不需要 Claude Code 处理）

- 部署在 Railway，服务名 Primary（WordPress + Apache）+ MariaDB。
- 域名：`https://wordpress-dot.up.railway.app`
- **WordPress 地址 (URL)** 和 **站点地址 (URL)** 均设置为
  `https://wordpress-dot.up.railway.app`（两者保持一致，**不要**指向
  `dottypic.com/blog`，否则 WordPress 生成的图片链接、REST API 返回的 URL
  会指向一个不存在对应资源服务的路径）。
- REST API 已验证可正常访问：
  `https://wordpress-dot.up.railway.app/wp-json/wp/v2/posts` 返回正常 JSON。
- 之前部署过程中踩过的坑（仅记录，不需要再处理）：
  - Volume 挂载路径必须是 `/var/www/html/wp-content`，不能是
    `/var/www/html`（否则会覆盖 WordPress 程序文件导致 403）。
  - 因为 Railway 边缘代理是 HTTPS→容器内部 HTTP，Apache 需要识别
    `X-Forwarded-Proto` 头，已通过
    `/etc/apache2/conf-available/https-forward.conf` 配置
    `SetEnvIf X-Forwarded-Proto https HTTPS=on` 解决 Mixed Content 导致
    CSS/JS 加载失败的问题（这个修复目前是手动改的运行中容器，未固化到
    Dockerfile，如果容器被完全重建可能需要重新执行，不在本次任务范围内）。

## 需要 Claude Code 完成的任务

### 1. WordPress API 请求工具函数

新建 `src/lib/wordpress.ts`：

```typescript
const WORDPRESS_API_URL = "https://wordpress-dot.up.railway.app/wp-json/wp/v2";

export interface WPPost {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
}

/** Fetches the list of published posts, newest first. Revalidates every 60s (ISR) so a
 *  newly published post shows up without a full redeploy. */
export async function getPosts(): Promise<WPPost[]> {
  const res = await fetch(`${WORDPRESS_API_URL}/posts?_embed`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status}`);
  }
  return res.json();
}

/** Fetches a single post by slug. Returns null if not found (caller renders notFound()). */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  const res = await fetch(
    `${WORDPRESS_API_URL}/posts?slug=${encodeURIComponent(slug)}&_embed`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch post: ${res.status}`);
  }
  const posts: WPPost[] = await res.json();
  return posts[0] ?? null;
}
```

注意：
- WordPress API 地址目前是硬编码的 Railway 域名，建议改为读取环境变量
  （例如 `WORDPRESS_API_URL`），方便未来更换域名或本地开发时切换。
- `_embed` 参数会让 API 把特色图片等关联数据一起返回，避免额外请求；如果
  用到特色图，需要从 `_embedded["wp:featuredmedia"][0].source_url` 取图片
  URL。

### 2. `/blog` 文章列表页

路由：`src/app/[locale]/blog/page.tsx`（项目使用 next-intl 的
`[locale]` 动态路由结构，需要遵循现有 i18n 约定，参考其他页面如
`src/app/[locale]/layout.tsx` 的写法）。

- 调用 `getPosts()` 拉取文章列表。
- 使用现有 `Header` / `Footer` 组件（`src/components/layout/Header.tsx`、
  `src/components/layout/Footer.tsx`），保持和站内其他页面视觉一致。
- 每篇文章展示标题（`title.rendered`，注意用 `dangerouslySetInnerHTML` 渲染，
  因为可能包含 HTML 实体）、摘要（`excerpt.rendered`，同样需要
  `dangerouslySetInnerHTML`）、发布日期（`date`），链接到
  `/blog/[slug]`。
- 页面整体宽度、间距等布局建议参考 `src/components/guide/guideLayout.ts`
  中 `GUIDE_WRAP`（`mx-auto max-w-[1180px] px-6 lg:px-10`）保持与站内其他
  内容页一致的容器宽度。
- 需要配置 `generateMetadata` 输出合理的 title/description，参考
  `src/app/[locale]/layout.tsx` 中已有的 SEO 元数据写法（`metadataBase`、
  `alternates`、`openGraph`、`twitter` 字段）。

### 3. `/blog/[slug]` 文章详情页

路由：`src/app/[locale]/blog/[slug]/page.tsx`

- 调用 `getPostBySlug(slug)`，如果返回 null，调用 Next.js 的
  `notFound()`。
- 渲染 `content.rendered`（用 `dangerouslySetInnerHTML`），标题、发布日期。
- 同样套用现有 Header/Footer。
- `generateMetadata` 需要输出该文章的 title/description/canonical/OG 信息，
  canonical 应指向 `https://dottypic.com/blog/[slug]`（**不是**
  wordpress-dot.up.railway.app 那个域名，这是内容源地址，不应暴露给搜索
  引擎和用户）。
- 建议使用 `generateStaticParams` 预生成已知文章的静态路径，配合 ISR，让
  新文章通过 fallback 机制在首次访问时生成并缓存。

### 4. Gutenberg 区块默认样式覆盖 CSS

WordPress 编辑器输出的 HTML 会带有一批标准 class，例如：
- `wp-block-paragraph`
- `wp-block-image`（及内部的 `<figure>` / `<figcaption>`）
- `wp-block-quote`
- `wp-block-list`（`<ul>` / `<ol>`）
- `wp-block-heading`（`<h2>` ~ `<h6>`）
- `has-text-align-center` / `has-text-align-right` 等对齐类
- `wp-block-button` / `wp-block-buttons`

需要新增一个 CSS 文件（例如 `src/app/blog.css`，仅在 blog 路由下
import），针对这些 class 编写样式，使其视觉上匹配 dottypic.com 的设计
系统。设计 token 参考 `src/app/globals.css` 中已定义的变量，例如：

- 正文颜色：`--foreground: #1a1a2e`，次要文字：`--muted-foreground: #64748b`
- 圆角：`--radius: 0.625rem`
- 强调色/边框：`--border: #D2EAAA`
- 字体：站点默认走 Nunito（`--font-nunito`，通过 body 的 `font-sans`
  继承），除非产品要求 blog 正文用 guide 页面那套字体（Bricolage
  Grotesque / DM Sans，定义在 `src/lib/fonts.ts` 的 `guideFontClass`），
  默认沿用 Nunito 即可。

不需要引入完整的 `@wordpress/block-library` 包，手写覆盖上述常见区块的
CSS 即可，目标是让图片、引用块、列表、按钮等常见元素在视觉上融入站点风格
（合适的间距、圆角、颜色），而不需要覆盖每一种 WordPress 支持的区块类型。

### 5. 导航栏加 Blog 菜单项

修改 `src/components/layout/Header.tsx` 中的 `navLinks` 数组，新增一项：

```typescript
{
    id: "blog",
    labelKey: "navBlog",
    href: "/blog",
},
```

需要在对应的 i18n 翻译文件（`header` 命名空间）中，为所有站点支持的
locale 添加 `navBlog` 的翻译文案（"Blog" 或对应语言的翻译）。

### 6. Sitemap 收录

修改 `src/app/sitemap.ts`，在 `ROUTES` 数组中加入 `/blog` 静态页面，并
动态拉取所有文章 slug 加入 sitemap（每篇文章一条 URL，路径为
`/blog/[slug]`，各 locale 各一条，参照现有 `ROUTES.flatMap` 的写法）。
文章的 sitemap 条目建议：
- `changeFrequency: "monthly"`
- `priority: 0.6`（可根据实际需求调整，供参考）

需要在 `sitemap.ts` 里调用 `getPosts()`（或类似函数）动态生成，避免每次
发新文章都要手动改代码。

## 需要确认/待办事项（不属于本次开发范围，但需要留意）

1. WordPress 那边"Apache 识别 X-Forwarded-Proto"的手动修复未固化到
   Dockerfile，如果 Railway 重建容器可能失效，需要另外处理（不在本次
   Next.js 开发任务范围内）。
2. 图片：WordPress 媒体库图片会以 `wordpress-dot.up.railway.app` 域名
   直接返回真实地址，Next.js 侧直接引用即可，不需要做额外的图片代理或
   搬运，但如果用 `next/image` 组件，需要在 `next.config.js` 的
   `images.remotePatterns` 中加入这个域名的白名单。
3. `robots.txt`（`src/app/robots.ts`）目前允许全站抓取，`/blog` 无需
   额外配置即可被收录，不需要改动。
