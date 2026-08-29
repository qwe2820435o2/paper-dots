# 博客软 404 缓解方案

> 状态：**已实施**。实施过程中做了基线实测，原方案的一条前提被推翻，实际落地内容与初稿有出入，见下文「实测结论」。

## 背景

站点已知问题：`(public)` 路由组下 `notFound()` 返回 HTTP 200 而非 404
（根因在 Next.js 15.5 + next-intl 中间件层面，预渲染产物的 `.meta` 文件
未写入 `status: 404`，属于站点级遗留问题，需要单独排期修复）。

博客上线后 `/blog/[slug]` 命中任意不存在的 slug 都会复现这个问题，相当于
把暴露面从「少数固定路径」放大到「任意字符串」。

## 实测结论（先读这段）

实施前做了一次基线对照：把详情页的 `generateMetadata` 保持成原样（直接调
`notFound()`），构建后请求 `/blog/does-not-exist`，得到：

```html
<meta name="robots" content="noindex"/>
<title>Free Dot Image Generator | Automatic Photo Collage Maker with Polka Dot Pattern</title>
<link rel="canonical" href="https://dottypic.com"/>
<link rel="alternate" hrefLang="en" href="https://dottypic.com"/>
<link rel="alternate" hrefLang="ja" href="https://dottypic.com/jp"/>
<link rel="alternate" hrefLang="id" href="https://dottypic.com/id"/>
```

两点和初稿的假设不一样：

1. **`noindex` 本来就有。** Next 会自动给 `notFound()` 响应注入
   `<meta name="robots" content="noindex">`，真 404 页（`/nope-at-all`）也一样。
   所以「被搜索引擎大量收录空内容 200 页面」这个风险，框架其实已经挡住了 ——
   初稿方案里加 noindex 这一步是**冗余**的。
2. **真正没被处理的是 canonical。** 这些不存在的 URL 从根 layout 继承了
   `alternates`，于是每个都在声明「我是首页的副本」，还附带完整的 hreflang 集合。
   这跟 noindex 是自相矛盾的标记，而且把大量垃圾 URL 指向首页并不是个该发出的信号。

另外标题也不对：一个不存在的 URL 顶着站点首页的 title。

## 实际落地内容

`src/lib/blogSeo.ts` 新增 `blogNotFoundMetadata(locale)`，两个路由的
`generateMetadata` 在「内容不存在」分支返回它，页面组件的 `notFound()` 行为不变：

```typescript
export async function blogNotFoundMetadata(locale: AppLocale): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: "notFound" });

    return {
        title: t("heading"),
        robots: { index: false, follow: false },
        alternates: { canonical: null },
    };
}
```

- `alternates: { canonical: null }` —— 这是**实际起作用的那一条**，替换掉根 layout
  的 alternates，canonical 和 hreflang 全部消失。
- `robots` —— 冗余但保留。不依赖 Next 未文档化的注入行为，也把意图写明。
- `title` —— 从站点首页标题改成「未找到」文案。

覆盖两个路由，不止详情页（初稿把分页路由列在「不在本次范围」，但它同样会产出
带 canonical 的可索引软 404）：

| 路由 | 触发条件 |
|---|---|
| `/blog/[slug]` | `getPostBySlug` 返回 null |
| `/blog/page/[n]` | 页码格式非法，或页码超出总页数 |

分页那条为了和页面主体保持一致，把判断规则提取成了
`isMissingListPage(page, result)`，`generateMetadata` 和 `BlogIndex` 共用同一个函数，
避免两边对「这一页算不算 404」产生分歧。它内部的 `result.ok` 判断是必需的 ——
没有它，一次取数失败会被误读成「这一页不存在」，而这些页面是预渲染的，
构建期一次网络抖动就会把 404 永久烤进静态文件（开发中已经踩过一次）。

## 验证结果

| 路径 | 状态码 | robots | title | canonical / hreflang |
|---|---|---|---|---|
| `/blog/does-not-exist` | 200 | noindex, nofollow | Page not found | **无** |
| `/jp/blog/nope` | 200 | noindex, nofollow | Page not found | **无** |
| `/blog/page/124` | 200 | noindex, nofollow | Page not found | **无** |
| `/blog/page/abc` | 200 | noindex, nofollow | Page not found | **无** |
| `/blog` | 200 | 无 | 正常 | `https://dottypic.com/blog` |
| `/blog/hello-world` | 200 | 无 | 正常 | `https://dottypic.com/blog/hello-world` |

正常页面完全不受影响。`tsc` 与 `lint` 干净，`npm run build` 通过。

## 仍未解决

- **状态码仍是 200。** 这一层只解决收录问题，不解决状态码。根因是站点级的，
  需要单独排期。已确认与 `src/app/not-found.tsx` 无关（把它移走重建后行为不变），
  也与博客代码无关（用一个只含 `notFound()` 的探针路由复现过）。
- **`notFound` 命名空间三个 locale 都是英文。** `messages/{en,jp,id}.json` 里
  `notFound` 的 5 个 key 内容完全相同，jp/id 从未翻译过。所以上表里 jp 的 title
  显示英文不是 locale 解析问题，是文案本身没翻。属于既有内容缺口，不在本次范围。
