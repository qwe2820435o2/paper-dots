# Create 菜单引导页模版化 · 落地计划

> 状态：执行中。每完成一个模块，回来勾选下方的进度表。

## 1. 背景

Create 菜单的四个工具（`/dot`、`/moment-card`、`/polka-dot`、`/geometric-patterns`）点进去直接就是全屏编辑器——`useLockBodyScroll()` 锁死滚动，页面上没有 H1 文案、没有 FAQ、没有结构化数据。四个最有商业价值的 URL 在 SEO 上基本是空的。

目标是在每个工具前面加一层**引导页**：

```
Create 菜单  →  引导页（SEO 文案 + 转化）  →  工具页（编辑器）
```

引导页模版化，四个工具共用同一套组件，差异只在文案、图片、title、meta。

文案由非技术同事维护在 Google Sheet 上，需要一条 `Sheet → 代码` 的同步链路：跑一条命令拉取并生成代码文件，人工 review `git diff` 后提交推送。

设计稿：仓库根目录 `dottypic-desktop (2).html`。

## 2. 已确认的决策

| 项 | 决定 |
|---|---|
| URL | ~~引导页占干净路径（`/polka-dot`），编辑器移到 `/polka-dot/app`~~ **2026-07-27 起改为**：引导页占 Sheet 的 `Url` 列指定的 SEO slug，编辑器统一挪到 `create/` 前缀下。详见下方 tab → 路由映射表和 §8 末尾的调整记录。 |
| 同步方式 | Google 服务账号 + Sheets API，表格保持私有，密钥放 `.env.local` |
| 多语言 | 内容层按 `{ en, ja }` 存，JP 列一并拉取；**本次只上线 EN 路由**，不做 `[lang]`/hreflang/语言切换器 |
| 配图 | 全部静态图片，路径由内容层给出，`next/image` 渲染。图缺失不阻塞构建 |
| 字体 | 引入 Bricolage Grotesque + DM Sans + DM Mono，**只作用于引导页**，Header/Footer/现有页面保持 Nunito |
| FAQ 折叠 | 原生 `<details>`，不用 Radix accordion |
| `/x/app` 收录 | `noindex, follow`，并从 sitemap 排除 |

### tab → 路由映射

**2026-07-27 起的现状**（原因见 §8 末尾）：引导页地址以 Sheet 的 `Url` 列为准（`polka-dot` 沿用旧地址不变，其余三个搬到 Sheet 里已经填好的 SEO slug）；编辑器统一搬到 `create/<slug>` 前缀下。

| Sheet Tab | slug | 引导页 | 编辑器 |
|---|---|---|---|
| `Polka Dot Generator` | `polka-dot` | `/polka-dot` | `/create/polka-dot` |
| `Geometric Pattern Generator` | `geometric-patterns` | `/geometric-pattern-generator` | `/create/geometric-patterns` |
| `Photo Quote Maker` | `moment-card` | `/photo-quote-maker` | `/create/moment-card` |
| `Photo Overlay Editor` | `dot` | `/photo-overlay-editor` | `/create/dot` |

`About` / `Header` / `Footer` 三个 tab 是全站共用文案，本轮不动。

## 3. 探查中确认的既有事实

这些是动手前值得知道的，有几条会直接影响实现方式：

- **`src/lib/tools.ts` 的 `CREATE_TOOLS` 是 Create 菜单唯一的数据源**，Header 下拉、移动端菜单、Footer、sitemap 全部由它派生。**它的 href 不需要改**——`/dot`、`/polka-dot` 等正好变成引导页地址，菜单自然就成了"菜单 → 引导页"。
- **`tailwind.config.ts` 是死文件。** `globals.css` 用 `@import "tailwindcss"` 且没有 `@config` 指令，Tailwind v4 从不读它。所以代码里到处引用的 `var(--font-quicksand)` 从来没生效过，一直静默回退到 `sans-serif`。新 token 必须走 `globals.css` 的 `@theme`。
- `tsconfig.json` 已开 `resolveJsonModule`，可以让 TS 和 Node 脚本共读一份 JSON 注册表。
- Node v24.14.0，原生支持 `--env-file-if-exists`，同步脚本不需要 `dotenv`。
- 没装 `tsx`/`ts-node`，同步脚本写成 `.mjs`。
- `.gitignore` 里是通配的 `.env*`，`.env.example` 提交不了，需要加 `!.env.example` 否定规则。
- `useLockBodyScroll` 的 cleanup 会恢复原值，路由移动不会引入滚动锁死的遗留 bug（M4 仍需回归验证）。
- 项目没有测试框架。验证靠 `npm run build` / `npx tsc --noEmit` / `npm run lint` + 手动点击。
- `npm run lint` 跑的是 `next lint`，在 Next 15.5 已废弃、Next 16 会移除。目前仍可用但会打提示，真挂了就退回 `npx eslint .`。

## 4. 给文案同事的表格约定

表格列：`Section | Item ID | Field Name | EN | HTML Tag | JP`

- **`Item ID` 为空 = 单值字段**（如 Meta Title、Hero Headline）；**非空 = 集合项**（Feature 1..5、FAQ 1..8 等）。
- **集合项按 Item ID 的整数值排序**，页面顺序由 ID 决定，不由行在表格里的位置决定。在表格里挪动行不会改变页面顺序，改 ID 才会。
- **`Url` 列是交叉校验，不是输入。** 路由以代码里的 `registry.json` 为准；两者不一致时同步脚本直接报错。
- **`HTML Tag` 列读取但不用于决定标签。** 标题层级由模版掌握（全页一个 h1，每个 section 用 h2）。该列只用来做一致性告警。
- **`Meta Title` 需自带品牌后缀。** 根 layout 的 `title.template` 是 `"%s"`，代码不会自动拼 `· Dottypic`。
- **正文允许一小撮行内 HTML**：`<strong>`（渲染成青柠色荧光笔）、`<em>`、`<br>`、`<span class="swash">`（H1 的下划波浪）。除 `class="swash"` 外不允许任何属性，超出白名单的会被转义并告警。
- **图片单元格留空是合法的**，页面会渲染占位板，不会崩也不会阻塞上线。
- **必填字段**：`Meta Title`、`Meta Description`、`Hero Headline`、`Hero Primary CTA Text`、`Hero Primary CTA Link`。缺任意一个，该 tab 整体中止、不写盘。
- **JP 列必填项不全**时，整个 `ja` 键会被省略，只提示不报错。

## 5. 模块拆分

每个模块一个 commit，独立可 review，落地后 master 保持可构建。

### M0 · 本文档
单独 commit，不含代码改动。

### M1 · 内容层骨架（5 新文件，0 修改）

```
src/content/guides/
  types.ts              手写 —— 类型契约
  registry.json         手写 —— slug ↔ sheet tab ↔ 路由
  registry.ts           手写 —— 读 registry.json，satisfies 校验
  index.ts              手写 —— 汇总生成模块，导出 getGuideContent()
  generated/
    polka-dot.ts        按最终输出格式手工誊写，作为 M7 的对照基准
```

`registry.json` 用 JSON 而非 TS 是关键：`registry.ts` 靠 `resolveJsonModule` 导入它，同步脚本用 `readFile` 读同一份，tab→路由映射只有一处。

核心类型形状：

```ts
export type GuideLocale = "en" | "ja";
export interface GuideImage { src: string; alt: string }

export interface GuideContent {
  name: string;
  meta: { title: string; description: string };
  hero: { headline: string; subheadline: string; image: GuideImage | null;
          cta: { text: string; href: string }; formats: string[] };
  toolLinks: { lead: string; items: GuideToolLink[] } | null;
  features: GuideFeature[];
  howTo:    { heading: string; steps: GuideItem[] } | null;
  why:      { heading: string; cards: GuideItem[] } | null;
  faq:      { heading: string; items: GuideFaqItem[] } | null;
  finalCta: { heading: string; body: string; cta: GuideCta } | null;
}

// en 必须存在，ja 可选
export type GuideContentByLocale =
  { en: GuideContent } & Partial<Record<GuideLocale, GuideContent>>;
```

三个设计要点：

1. **hero 以下每个 section 都可为 null 或空数组。** 表格只填了一半时页面变短，不会崩、不会构建失败——这是能按工具逐个上线的前提。
2. **`ja` 可选、`en` 必需。** `getGuideContent(slug, locale = "en")` 内部 `?? .en` 兜底。以后加 `/ja` 只动路由，内容层零改动。
3. **路由信息只在 `registry.json`，不进 `GuideContent`。** 跟语言无关的东西不按语言重复，`ja` 也就不可能把 URL 写歪。

**富文本的安全性说明**（要写进 `RichText.tsx` 的注释，免得以后有人来"修复"）：内容字符串携带白名单行内 HTML 并走 `dangerouslySetInnerHTML`，这不是 XSS 缺口——数据不是用户输入，经脚本校验、写入文件、由人 review `git diff` 后提交，可信度和它周围的 JSX 完全相同。

### M2 · 样式地基（2 新文件，1 修改）

- **新增 `src/lib/fonts.ts`**：用 `next/font/google` 声明三套字体为 CSS 变量，导出 `guideFontClass`。
- **`globals.css` 追加 `@theme` 块**，全部用 `guide-` 前缀，与现有 shadcn token 零冲突：

```css
@theme {
  --color-guide-ink: #15200d;    --color-guide-ink-2: #3c4a30;
  --color-guide-mute: #6f7d62;   --color-guide-paper: #fbfcf7;
  --color-guide-lime: #c5e89a;   --color-guide-lime-2: #dcf0c2;
  --color-guide-lime-3: #eef7e2; --color-guide-edge: #e3e9d8;
  --color-guide-pop: #ff5d8f;
  --radius-guide: 26px;          --radius-guide-sm: 16px;
  --shadow-guide: 0 14px 34px rgb(29 48 14 / 0.09);
  --shadow-guide-lg: 0 26px 60px rgb(29 48 14 / 0.14);
}
```

  用 `@theme` 而不是 `@theme inline`——这些是字面值，不是对 `:root` 变量的别名。

- **新增 `src/app/guide.css`**，从 `globals.css` 里 `@import`。放 Tailwind 类表达不好的东西：`clamp()` 字号阶梯、`<strong>` 的渐变荧光笔、`.swash` 的 `box-decoration-break`、`.rail` 的 `radial-gradient` 点线分隔、`<details>` 的 `::-webkit-details-marker` 隐藏和加减号圆圈。**每条选择器都以 `.guide-scope` 打头**，结构上不可能泄漏。

- 设计稿的 `@media(max-width:980px)` 单列坍缩改用 Tailwind 的 `lg:` 断点（1024px），差 44px 但换来一套断点系统而不是两套。

- **字体作用域**：`guideFontClass` 只加在 `GuideTemplate` 的最外层 div，不加在根 layout。这比"根 layout 加载 + 作用域限制"更好——`next/font` 只为真正渲染该组件的路由发 `@font-face` 和 preload，所以 `/`、`/faq`、`/contact` 根本不会下载 Bricolage。Header/Footer 在 `.guide-scope` 之外、也在变量作用域之外，继承 `body` 的 `--font-nunito`，两个方向都不泄漏。

### M3 · 引导页基础组件（5 新文件）

`src/components/guide/` 下，**全部是 server component**：

| 组件 | 职责 |
|---|---|
| `RichText.tsx` | `{ as, html, className }`，白名单 HTML 渲染 |
| `GuideMedia.tsx` | `image === null` 时渲染占位组件，否则 `next/image` 用 `fill` + 固定宽高比容器（`fill` 让表格不必提供图片尺寸） |
| `GuideMediaPlaceholder.tsx` | 青柠点阵占位板，复用 `.rail` 的 radial-gradient |
| `GuideCtaButton.tsx` | 设计稿的 `.btn` 硬阴影 + 按压动效。**实现时改为 client component**——M4 要求它打 GA 点击事件（见下），这是整棵引导页组件树里唯一的 `"use client"` 边界，其余全部维持 server component |
| `GuideRail.tsx` | 点线分隔条 |

### M4 · polka-dot 路由迁移 + 引导页首屏（**必须单个 commit**）

只移编辑器不建引导页，`/polka-dot` 会 404，所以两半必须同时落地。

文件移动（`./PolkaDotApp` 这个相对引用在两个文件一起移动后保持有效，无需改动）：

```
git mv "src/app/(public)/polka-dot/page.tsx"        "src/app/(public)/polka-dot/app/page.tsx"
git mv "src/app/(public)/polka-dot/PolkaDotApp.tsx" "src/app/(public)/polka-dot/app/PolkaDotApp.tsx"
```

**不要**建 `src/app/(public)/polka-dot/layout.tsx`——它会连 `/polka-dot/app` 一起包住。

新增组件 `GuideHero.tsx`、`GuideToolLinks.tsx`、`GuideTemplate.tsx`（本模块只接首屏 + rail + toolLinks），以及新的 `(public)/polka-dot/page.tsx`。

页面用静态 `export const metadata` 而非 `generateMetadata`——路由没有动态参数，内容是模块级常量，没有需要 await 的东西。等 `[lang]` 来了再改。

需要改指向的调用点：

| 文件 | 现在 | 改成 | 理由 |
|---|---|---|---|
| `Header.tsx:105` | `/polka-dot` | `/polka-dot/app` | "Get Started" 是交易意图 |
| `Header.tsx:159` | `/polka-dot` | `/polka-dot/app` | 同上，移动端 |
| `HeroSection.tsx:36` | `router.push("/polka-dot")` | `/polka-dot/app` | 它会 dispatch `resetPolkaDot()` 并显示 loader，明确是编辑器意图 |
| `CtaSection.tsx:15` | `router.push("/polka-dot")` | `/polka-dot/app` | 同上 |
| `Header.tsx:18` | `/dot`（Create 父级） | **不动** | 下拉父级落到 Dot 引导页是对的 |
| `src/lib/tools.ts` | `/dot`、`/polka-dot`… | **不动** | 这些已经就是引导页 URL |

**本模块顺带加 GA 埋点**（不推迟到 M9）：`GuideCtaButton` 上打一个 gtag 事件。根 layout 已经加载了 gtag，五行代码的事。没有这个数字，上线后看到流量变化将无法区分是排名效应还是漏斗效应。

### M5 · 其余 section（6 新文件，1 修改）

`GuideFeatures` / `GuideFeatureBlock`（`flip={i % 2 === 1}`，对上设计稿的第 2、4 块）、`GuideHowTo`、`GuideWhy`、`GuideFaq`、`GuideFinalCta`，接进 `GuideTemplate`。

**丢掉设计稿里 feature 的装饰性 overlay 小卡片**——它们是逐个手写的，表格里没有对应字段。

**FAQ 用原生 `<details>`，不用现有的 `src/components/ui/accordion.tsx`。** 决定性理由不是包体积：Radix 的 `Accordion.Content` 在关闭状态下**会卸载内容**（除非 `forceMount`）。一个整体目的就是承载 SEO 文案、并且还要输出 `FAQPage` 结构化数据的页面，八个答案里有七个不在服务端 HTML 里、而 JSON-LD 却声称它们存在——这是不该主动去踩的结构化数据不一致。次要理由：整个 FAQ 区能保持 server component、零 hydration；键盘和读屏行为白送；设计稿的 `summary::after` 加减号是纯 CSS，1:1 可移植。

`src/components/ui/accordion.tsx` 不动，`/faq` 继续用它。（把 `/faq` 也迁到 `<details>` 是同理的好后续，本次不做。）

### M6 · SEO（2 新文件，3 修改）

- 新增 `src/lib/site.ts` 收敛 `SITE_URL`（目前在 4 个文件里重复）。
- 新增 `src/lib/guideSeo.ts`：
  - `buildGuideMetadata(content, route, locale?)` → title / description / `alternates.canonical` / openGraph。**`locale` 参数现在就留出来**（虽然只传 `"en"`），以后加 `alternates.languages` 是改一行而不是改四个页面文件。
  - **代码里不要拼 `" · Dottypic"`**，品牌后缀由表格的 `Meta Title` 自带。
  - `buildGuideJsonLd(content, route)` → 一个 `@graph`，含 `SoftwareApplication`（`featureList` 取自 feature 标题）、`FAQPage`（答案需剥离行内 HTML，JSON-LD 里必须是纯文本）、`BreadcrumbList`。**不做 `HowTo`**——Google 2023 年已下线 HowTo 富结果，加了不产生任何可见收益。
- 四个 `/x/app/page.tsx` 各加自指 canonical + `robots: { index: false, follow: true }`。
- `sitemap.ts` 改为遍历 `GUIDE_REGISTRY`：引导页 priority 0.9，`/app` 路由排除。

**为什么 `/x/app` 设 noindex**：`/app` 页面内容单薄、重度依赖 JS、主题上和对应引导页完全重合，两个都收录只会互相蚕食，信号应该全部集中到引导页。**不要**把 `/x/app` canonical 到 `/x`——两者内容不同，Google 会忽略这个声明，反而白丢信号。

**不需要新增任何 redirect。** 引导页占的是既有 URL，`/x/app` 是全新路径，没有 URL 会 404，也不损失外链权重。`next.config.ts` 里既有的 `/decorate → /dot` 保持不变。

### M7 · 同步脚本

只依赖 M1 的 schema，**不依赖任何组件，可与 M3–M6 并行**。

```
scripts/
  sync-guide-content.mjs      入口：CLI 参数、拉取、逐 tab 处理、汇总、退出码
  lib/sheets-client.mjs       唯一碰网络的模块：env 校验、JWT 鉴权、拉 tab 列表/行
  lib/registry.mjs            读 registry.json（与 app 端 registry.ts 共享同一份文件）
  lib/sheet-schema.mjs        FIELD_MAP + COLLECTIONS + REQUIRED_PATHS + 富文本白名单
  lib/rich-text.mjs           行内 HTML 校验（允许 tag 直通，其余转义）
  lib/transform.mjs           纯函数：行数组 → GuideContentByLocale（无网络/文件 IO，可单测）
  lib/emit.mjs                确定性 TS 输出 + 只在字节变化时才写盘
  test/
    transform.smoke.mjs       用合成行还原 M1 手写的 generated/polka-dot.ts，逐字节比对
    transform.edgecases.mjs   12 个边界用例：必填缺失中止、ID 跳号压实、HTML 白名单、
                               工具推荐解析/自链接丢弃、Url 校验、JA 不完整则整体省略……
    emit.smoke.mjs            writeIfChanged 的幂等性：内容不变不写盘、变了才写、dryRun 不落盘
```

**已实现，本地跑法（无需真实凭据）：**

```
node scripts/test/transform.smoke.mjs      # 合成表格行 -> 与 generated/polka-dot.ts 逐字节一致
node scripts/test/transform.edgecases.mjs  # 12 个边界用例
node scripts/test/emit.smoke.mjs           # 写盘幂等性
```

三个测试当前全部通过。`npm run sync:guides` 本身需要真实的服务账号凭据才能跑（见下方一次性配置），我没有这些凭据，所以脚本对私有表格的实际拉取路径未经真实验证——写好之后 Travis 第一次跑通时,大概率会因为下面这份 **Field Name 猜测表** 与真实表格措辞不完全一致而报"unrecognized Field Name"告警,属预期,照告警提示改 `scripts/lib/sheet-schema.mjs` 里的字符串即可,不是逻辑 bug。

```jsonc
"sync:guides":       "node --env-file-if-exists=.env.local scripts/sync-guide-content.mjs",
"sync:guides:check": "node --env-file-if-exists=.env.local scripts/sync-guide-content.mjs --check"
```

`googleapis` 进 **devDependencies**——`src/` 里没有任何东西 import 它，永远不会进 bundle。

标志位：`--check`（不写盘，有偏差就 exit 1）、`--strict`（告警升级为错误）、`--slug=polka-dot`（单个工具）、`--verbose`。

#### 环境变量

```
GOOGLE_SHEETS_SPREADSHEET_ID=1qHeRinNDikBlDFwwkXQfxx4DBlzRKCycyGC5Y0Rwmhc
GOOGLE_SERVICE_ACCOUNT_EMAIL=...@....iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_B64=<PEM 的 base64>
```

私钥用 base64 是刻意的：Node 的 `--env-file` 解析器处理多行 PEM 和 `\n` 转义是反复踩坑的地方，base64 让它变成一行不透明字符串。

scope 用 `spreadsheets.readonly`。表格把服务账号邮箱加为**查看者**即可。这是开发机上的脚本，任何密钥都不进 Vercel。

#### 一次性配置步骤

1. GCP 建项目 → 启用 Google Sheets API
2. 建 service account → 生成 JSON 密钥并下载
3. Sheet 点共享，把 `xxx@xxx.iam.gserviceaccount.com` 加为查看者
4. `base64 -w0 <key.json 里的 private_key>` → 写进 `.env.local`（可参考仓库里的 `.env.example`）

#### 脚本认的 Section / Field Name

以下是 `scripts/lib/sheet-schema.mjs` 里 `FIELD_MAP` / `COLLECTIONS` 当前认的字符串（大小写、多余空格不敏感）。Name/Meta/Hero/Tool Recommendation 这几行是照着已经填好的表格截图核对过的；Feature/How To/Why/FAQ/Final CTA 是按同一措辞习惯（Field Name 一般不重复 Section 名，除非像"Hero Image"这种有歧义的）推断的，还没有对着真表格跑过。跑第一次遇到"unrecognized Field Name"告警，十有八九是这里猜的字眼和表格实际用词对不上，改这个文件里的字符串即可，不用改代码逻辑。

| Section | Item ID | Field Name | 落到 |
|---|---|---|---|
| Name | – | Name | `name` |
| Meta Information | – | Meta Title / Meta Description | `meta.title` / `meta.description` |
| Meta Information | – | Url | 仅做交叉校验，不落地 |
| Hero | – | Headline / Subheadline | `hero.headline` / `hero.subheadline` |
| Hero | – | Hero Image / Hero Image Alt | `hero.image.src` / `.alt`（留空则整个 `image` 为 `null`） |
| Hero | – | Primary CTA Text / Primary CTA Link | `hero.cta.text` / `.href`（Link 留空则用编辑器路由兜底） |
| Hero | – 或 1..n | Format | `hero.formats[]`（单个逗号分隔格或多行均可） |
| Tool Recommendation | – | Lead | `toolLinks.lead` |
| Tool Recommendation | 1..n | Tool Name / Tool Link | `toolLinks.items[]`（Link 留空则按 Name 去 registry 解析，解析不到或指向自己会被丢弃并告警） |
| Feature | 1..n | Heading / Body / Image / Image Alt | `features[]`（Body 允许 `<strong>`） |
| How To | – | Heading | `howTo.heading` |
| How To | 1..n | Heading / Body | `howTo.steps[]` |
| Why | – | Heading | `why.heading` |
| Why | 1..n | Heading / Body | `why.cards[]` |
| FAQ | – | Heading | `faq.heading` |
| FAQ | 1..n | Question / Answer | `faq.items[]`（Answer 允许 `<strong>`） |
| Final CTA | – | Heading / Body / CTA Text / CTA Link | `finalCta.*` |

只有 `Hero::Headline`、`Feature::Body`、`FAQ::Answer` 这三类字段会经 `RichText` 渲染，允许携带 `<strong>`/`<em>`/`<br>`/`<span class="swash">`；其余字段一律纯文本渲染，混进标签会被原样保留但打告警（不是安全问题，是会在页面上显示出尖括号的排版事故）。

#### tab 发现

先 `spreadsheets.get` 拿真实 tab 列表，和 `registry.json` 求交集：

- registry 里有、表格里没有 → **报错**（两边任一处打错字都是你想立刻知道的 bug）
- 表格里有、registry 里没有 → 仅提示（`About`/`Header`/`Footer` 属预期）
- **列按表头名解析，不按下标**——有人插一列不会把同步搞崩

#### 行 → 对象的确定性映射

以 `Item ID` 是否为空区分两类：单值行按 `normalize(Section)::normalize(Field Name)` 查显式映射表；集合行按 Section 查 `COLLECTIONS` 配置。四条保证确定性的规则：

1. Item ID 按**整数排序**，数组下标是排序位次而非原始 ID。跳号（1,2,4）压实成密集数组并告警。
2. 输出对象的键顺序由 schema 声明顺序固定，**与表格行序无关**——这是让 `git diff` 只出现真实文案变更的关键。
3. 先严格匹配 `Section::Field Name`；未命中且该 Field Name 在全表**全局唯一**时，退化为仅按 Field Name 匹配并对 Section 不符告警。容忍 section 表头打错字，又不产生歧义。
4. 图片单元格为空 → 整个 `image` 对象置 **`null`**（而不是 `{src:"",alt:""}`），渲染端只需判一次 `=== null`。

**Tool Recommendation 的链接**：目前已知表格只有 `Tool Name` 列。脚本拿名字去 `registry.json` 解析（精确 → 忽略大小写 → slug 化），解析不到就**丢弃该卡片**并告警（绝不输出 `href="#"` 死链），同时丢弃指向当前工具自己的卡片。

#### 校验的核心规则

**按 tab 全有或全无。** 任一 tab 出错，该 tab 不写任何文件，进程 exit 非零——绝不会提交一个填了一半的页面。

#### 输出必须确定性

整套 review 流程都建立在 `git diff` 上：不写时间戳、不写运行计数、不写源行号；`JSON.stringify(obj, null, 2)`；字符串一律由 `JSON.stringify` 转义而非手工拼引号；trim 后把 `\r\n` 归一成 `\n`（Sheets 特别爱夹带 CR）；内容字节无变化就不写盘。

**脚本永不执行 `git`。** 这句话写在文件头注释里。

这条"跑完后与 M1 手写版对照"的端到端验证已经自动化成 `transform.smoke.mjs`，不用等真实凭据就能确认映射逻辑本身是对的；等 Travis 配好凭据、第一次对着真表格跑 `npm run sync:guides` 之后，再看一次 `git diff generated/polka-dot.ts`，理论上应该是空的或者只有文案层面的出入——如果出现结构性差异（多/少了字段、数组顺序变了），说明 schema 猜的字段名和真表格对不上，回到上面那张表去修。

顺带：`.gitignore` 加 `!.env.example` 否定规则，或者把三个环境变量写进 README。

### M8 · 推广到另外三个工具（每工具一个 commit）

每个：2 个文件移动 + 1 个新引导页 + registry 一行。`not-found.tsx:20` 的 `/dot` → `/dot/app` 在最后一个 commit 改。

**用同步脚本的完整度摘要作为放行闸门。** 某个工具的文案没填完就不要上线它的引导页——用一个三段话的引导页替换掉一个能用的编辑器、还是在有排名的 URL 上，严格劣于什么都不做。

### M9 · 可选打磨

`Reveal.tsx` 滚动进场、每个引导页独立的 `opengraph-image.tsx`、`/faq` 迁到 `<details>`、`SITE_URL` 去重、删掉死掉的 `tailwind.config.ts`。

**如果做滚动进场，强制模式是**：服务端 HTML 里内容**默认可见**，客户端组件挂载后给自己的 wrapper 加一个 `js-reveal` 类，由这个类去激活 `opacity: 0 → 1`。**绝不能无条件写 `.reveal { opacity: 0 }`**——那会对任何不执行 JS 的东西隐藏掉整个 SEO 正文，而这恰恰是这个页面唯一输不起的东西。

## 6. 验证

每个模块的基线：`npm run build`、`npx tsc --noEmit`、`npm run lint`。

**M2** —— 构建后确认 `/` 渲染无变化，DevTools 里 Header 字体仍是 Nunito。在产物 CSS 里搜 `.guide-scope`，确认没有任何一条规则漏了前缀。

**M4** —— `npm run dev` 后：

- `/polka-dot` 出引导页首屏，`/polka-dot/app` 出可用的编辑器
- Header → Create → Polka Dot ⇒ 引导页；"Get Started" ⇒ 编辑器；引导页 CTA ⇒ 编辑器
- **滚动锁回归**：引导页 → 编辑器（客户端导航）→ 浏览器后退 ⇒ 引导页必须能滚动
- `curl -s localhost:3000/polka-dot | grep -c Bricolage` → 非零
- `curl -s localhost:3000/faq | grep -c Bricolage` → **0**（字体作用域的证明）

**M5** —— 1440px 和 390px 下与设计稿对照。

- `curl -s localhost:3000/polka-dot | grep -c '<details'` → 8
- **grep 最后一条 FAQ 答案的正文**，必须出现在原始 HTML 里（这正是选原生 `<details>` 的全部意义）
- 键盘 Tab 到每个 `<summary>`，Enter 可开合
- 临时把某张图设成 `null`，确认占位板渲染且构建通过

**M6** —— `grep 'rel="canonical"'` → `/polka-dot`。把 `application/ld+json` 内容贴进 Google Rich Results Test，`FAQPage` 和 `SoftwareApplication` 都要零错误通过。`curl -s localhost:3000/sitemap.xml` → 4 个引导页 URL 在、`/app` 不在。

**M7** —— 无凭据也能跑的部分（已验证，全部通过）：

- `node scripts/test/transform.smoke.mjs` —— 合成表格行还原 `generated/polka-dot.ts` 逐字节一致
- `node scripts/test/transform.edgecases.mjs` —— 必填缺失中止、ID 跳号压实、HTML 白名单转义、工具推荐解析/自链接丢弃、Url 校验、JA 不完整整体省略等 12 项
- `node scripts/test/emit.smoke.mjs` —— 内容不变不写盘、变了才写、`dryRun` 不落盘
- `node scripts/sync-guide-content.mjs`（不设环境变量）→ 干净报错，exit 1，不是裸 crash

Travis 配好服务账号凭据后还需要跑一遍（这部分我没有凭据，没法替你验证）：

- 干净工作区跑 `npm run sync:guides`，`git diff --stat` 看一下改了哪些文件、diff 是否只有文案
- **连跑两次，第二次必须零 diff**（确定性测试，跑真实网络请求这条路径我没法本地模拟）
- `npm run sync:guides:check` → exit 0；手改生成文件里一个字符再跑 → exit 1 并打出 diff
- 把表格某个必填格清空 → 该 tab 中止、不写盘、exit 非零
- 如果告警里出现"unrecognized Field Name"，对照上面那张 Field Name 表调整 `scripts/lib/sheet-schema.mjs`

**M8** —— 每个工具重复 M4/M5 的点击路径，并确认另外三个工具没坏。`npm run build` 输出里应有 8 条工具路由（4 引导 + 4 编辑器）为静态。

## 7. 风险

1. **`/polka-dot` 的排名意图被改变**（最需要盯的一条）。这个 URL 现在是以编辑器的身份在排名和转化，现在要整页换内容、把意图从交易型改成信息型，Google 会重新评估。缓解措施基本不在代码里而在表格里：**上线 M4 之前，先从 GSC 把 `/polka-dot` 当前的排名查询词拉出来，核对新的 H1 和 Meta Title 是否保留了同一批头部词**。这是整个项目里杠杆最高的一件事。另外 CTA 必须保持在首屏内——一个此前秒开工具的页面，如果"打开生成器"按钮掉到折叠线以下，互动指标会掉。
2. **回滚路径。** 编辑器文件是"移动"而非"修改"，所以引导页 commit 和路由迁移 commit 要分开，才能只回滚其中一个。
3. **首屏的招牌元素被降级了。** 设计稿的 hero 是个可实时拖拽的生成器，那是这个页面的转化引擎；改成静态图后，若 `Hero Image` 单元格上线时还是空的，最值钱的版面上会出现一块占位板。已内建缓解：`hero.image === null` 时 `GuideHero` 渲染**居中单列**布局，而不是右边留个空框。更长期可以考虑把已经存在的客户端组件 `PolkaDotPreview` 嵌进去当 hero 视觉。
4. **首页标题自我蚕食。** 首页 title 里已经含 "Polka Dot Pattern" 且主打 "dot image generator"。polka-dot 引导页的 `Meta Title` 如果高度重合，两个页面会互相竞争。M6 之前值得核一下表格文案。
5. **两处 URL 事实来源**（表格 `Url` 列 vs `registry.json`）。已通过"registry 为准 + 脚本对不上就报错"解决，但要告诉文案同事：表格的 `Url` 列是交叉校验，不是输入。
6. **提交图片二进制但没有任何管线。** `public/guides/<tool>/` 会放约 6 张 × 4 个工具，没有东西约束体积。现在就定约定：预先切好的 WebP，≤200 KB，hero 宽度 ≤1600px。（`next.config.ts` 里对 `.webp` 的一年 immutable 缓存头已经覆盖了。）
7. **真正的关键路径是文案产能。** 4 个工具 × 约 30 行 × 2 种语言 ≈ 240 格原创 SEO 文案。代码一定会比表格先就绪。M8 的排期应该围绕文案就绪度来定，并用脚本的完整度摘要当闸门。
8. **Header 与引导页的背景接缝。** 白色 sticky header 压在 `#fbfcf7` 纸色上，两者差 2%。属观感问题，M4 验收时确认能否接受。
9. **三个精简引导页正文单薄就直接上线索引。** geometric-patterns/moment-card/dot 的引导页只有 Hero + 工具推荐条，没有 Features/FAQ 等 SEO 正文，且 Travis 决定不走 noindex 过渡期、直接 index 上线——这和风险 1 是同一类问题，但没有风险 1 那样先核对 GSC 排名词的缓解措施。这几个 URL 原本是全屏编辑器（交易型意图），换成单薄的信息型页面后，短期内的排名/互动指标值得盯一下；等 Sheet 同步补全 Features/How To/Why/FAQ 后风险会自然消退。

## 8. 进度

状态更新于 2026-07-27。M0–M8c 对应的 14 个 commit（`fe3d67c` .. `10810e3`）之前已完成、全部未 push。**2026-07-27 这次会话的改动（M7 真实联调 + 路由架构调整，见下）还没有 commit**，工作区当前是脏的。

### 已完成（历史 commit，2026-07-26 及之前）

- [x] **M0** 本文档 —— `fe3d67c`
- [x] **M1** 内容层骨架 —— `5b76199`（+ `bd16e65` 修 CRLF/LF 问题）。`types.ts` / `registry.json` / `registry.ts` / `index.ts` / `generated/polka-dot.ts`（手工誊写设计稿文案，作为 M7 的对照基准）。
- [x] **M2** 样式地基 —— `9af7b65`。`guide-` 前缀 token、`guide.css`、三套字体只作用于引导页。已验证：产物 CSS 里 guide 规则全部带 `.guide-scope` 前缀，`/faq` 等其他页面不加载 Bricolage。
- [x] **M3** 引导页基础组件 —— `3219d0c`。`RichText`/`GuideMedia`/`GuideMediaPlaceholder`/`GuideCtaButton`/`GuideRail`。`GuideCtaButton` 实现时改成了 client component（打 GA 事件），是引导页组件树里唯一的 `"use client"` 边界。
- [x] **M4** polka-dot 路由迁移 + 首屏 —— `b359de9`。`/polka-dot` = 引导页首屏（Hero + 工具推荐条），`/polka-dot/app` = 原编辑器（纯移动，未改内容）。Header/HeroSection/CtaSection 的入口按钮已重指向 `/polka-dot/app`。已在生产构建下实测所有路由 200，字体作用域生效（`/polka-dot` 预加载 5 个字体文件，`/faq` 只有 1 个）。**滚动锁定的浏览器回归（引导页→编辑器→后退→引导页应能滚动）没有实测**——这个环境没有浏览器自动化工具，只做了代码走读确认 `useLockBodyScroll` 的 cleanup 逻辑是对的，建议 Travis 找时间在浏览器里点一遍。
- [x] **M5** 其余 section —— `8202a91`。Features/How To/Why/FAQ（原生 `<details>`）/Final CTA，全部接进 `GuideTemplate`。过程中发现并修了一个真 bug：`guide.css` 里一条全局 `p` 颜色规则的特异性高于 Tailwind 类，会静默吃掉暗色区块里设置的浅色文字。
- [x] **M6** SEO —— `d7c9e27`。`buildGuideMetadata`/`buildGuideJsonLd`（`SoftwareApplication` + `FAQPage` + `BreadcrumbList`）、`/polka-dot/app` 加自指 canonical + `noindex,follow`、sitemap 改遍历 `GUIDE_REGISTRY`。已验证 canonical、robots meta、JSON-LD 结构、sitemap 内容均符合预期。
- [x] **M7** 同步脚本 —— `3d29d0e`。CLI + `lib/sheets-client.mjs`（网络）+ `lib/transform.mjs`（纯函数，行→内容）+ `lib/emit.mjs`（确定性写盘）+ 3 个本地测试，全部通过：
  - `transform.smoke.mjs`：合成表格行还原 `generated/polka-dot.ts` 逐字节一致
  - `transform.edgecases.mjs`：12 个边界用例（必填缺失中止、ID 跳号压实、HTML 白名单转义、工具卡片解析/自链接丢弃、Url 校验、JA 不完整整体省略……）
  - `emit.smoke.mjs`：写盘幂等性
- [x] **M8a** geometric-patterns 引导页 —— `750114b`。精简版：仅 Hero + 工具推荐条，`features: []`、`howTo`/`why`/`faq`/`finalCta` 全部 `null`。`meta`/`hero` 文案手写，来源是 `tools.ts` 的一句话描述、原 `page.tsx` 的 meta description，以及 `ExportPanel.tsx` 里实际支持的导出格式（SVG/PNG/JPEG），没有编造功能或素材。`hero.image: null`，`GuideHero` 走内建的居中单列布局。
- [x] **M8b** moment-card 引导页 —— `e53f134`。同上模式，导出格式据 `MomentCardExportButton.tsx` 只有 PNG。
- [x] **M8c** dot 引导页 —— `10810e3`。同上模式，导出格式据 `ExportButton.tsx` 只有 PNG。顺带把 `not-found.tsx:20` 的 `/dot` 改成 `/dot/app`（这是编辑器意图的链接）。

三个工具都已直接 index 上线（未走 noindex 过渡），`npm run build` 确认全部 8 条工具路由（4 引导 + 4 编辑器）为静态，`tsc`/`lint` 均无新增错误。

### 已完成（2026-07-27 会话，尚未 commit）

- [x] **M7 真实联调** —— Travis 提供了服务账号密钥文件（`dottypic-guide-sync-*.json`）。过程中处理/发现：
  - **安全**：密钥文件当时处于 `git add` 暂存状态且未被 `.gitignore` 排除，已 `git restore --staged` 退出暂存并在 `.gitignore` 加规则排除；`.env.local`（存放 base64 私钥等）本身已被既有 `.env*` 规则排除
  - **修正**：`docs/guide-pages.md` 里记的 spreadsheet ID 是错的，已换成真实 ID（`1qHeRinNDikBlDFwwkXQfxx4DBlzRKCycyGC5Y0Rwmhc`）
  - **修正**：`scripts/lib/sheet-schema.mjs` 里 Feature/How To/Why/FAQ/CTA 的 Field Name 是 M7 落地时的推测，跟真表格核对后大部分猜错了（例如 `Feature::Heading` 实为 `Feature::Feature Title`，`Final CTA` 这个 section 实为 `CTA`），已按真实表头改对——上面 §M7 的字段对照表已同步更新
  - **修了两处真 bug**（不是字段名猜测问题）：`transform.mjs` 的 Url 交叉校验 (a) 认错了 Section 名 (b) 对 JA 列也生效，导致 JA 列的 `/jp/xxx` 必然跟 EN-only 的 registry 路径对不上而死螺报错；`sync-guide-content.mjs` 里单个 tab 读表头失败会抛出未捕获异常、拖垮整个 `--check` 进程，已加 try/catch 做到"按 tab 隔离失败"
  - **四个 tab 现状**：`polka-dot`/`moment-card`/`dot` 三个 tab 内容干净、可以正常同步；`geometric-patterns` 因 Sheet 表头 A1 单元格是空的（应填 `Section`）暂时无法同步，需要请文案同事补上
  - 跑了真的 `npm run sync:guides`（非 `--check`），`generated/polka-dot.ts`/`moment-card.ts`/`dot.ts` 从设计稿誊写 / M8 手写占位内容换成了真实 Sheet 内容（含 Features/How To/Why/FAQ/Final CTA，且 JA 列完整）

- [x] **路由架构调整** —— 详见下方"2026-07-27 路由方案调整"小节

### 未完成 / 被阻塞

- [ ] **geometric-patterns 的 Sheet 同步** —— 表头 A1 单元格空着，等文案同事补上 `Section` 之后跑 `npm run sync:guides -- --slug=geometric-patterns` 才能拿到真实内容；目前这个工具仍是 M8a 的手写占位版（仅 Hero + 工具推荐条）
- [ ] **Tool Recommendation（工具推荐卡片）暂时是空的** —— 真实 Sheet 里 `polka-dot`/`moment-card`/`dot` 三个 tab 的 Tool Recommendation 区目前一行都没填（Tool Name/Tool Link 都是空），所以这次真实同步出来的 `toolLinks` 都是 `null`。等 Sheet 补上后重新跑同步即可，不用改代码
- [ ] **`scripts/test/transform.smoke.mjs` 需要重做 fixture** —— 这个本地测试拿 `generated/polka-dot.ts` 当比对基准，这次被真实内容覆盖后基准变了，本地再跑这个测试会失败（不影响 `build`/`lint`，两者都没接入这个测试）。测试设计前提"`polka-dot.ts` 保持 M1 手写内容不变"已经不成立，需要用当前真实内容重做一份合成 fixture，或者换一种验证方式
- [ ] **M9** 可选打磨 —— 未开始（滚动进场动画、per-guide OG 图、`/faq` 迁移到原生 `<details>`、删除死掉的 `tailwind.config.ts`）

### 2026-07-27 路由方案调整

M4 定下、M8a-c 落地的方案是"引导页占干净路径，编辑器挪到 `/x/app`"。文案同事（Joan）确定了实际的 SEO slug 规划后，改成了相反的模式：**引导页占 Sheet `Url` 列给定的专用 SEO slug，编辑器统一收进 `create/<slug>` 前缀**。四个工具的最终地址见上面"tab → 路由映射"表。

具体改动：
- `registry.json` 的 4 条 `guidePath`/`appPath` 全部改为新值；`guideSeo.ts`/`sitemap.ts`/四个 `page.tsx` 都是从 registry 读路径，零硬编码，不用改代码
- `git mv` 四个引导页目录（`polka-dot` 不动）+ 四个编辑器目录到 `create/` 下
- `Header.tsx`/`HeroSection.tsx`/`CtaSection.tsx`/`not-found.tsx`/`tools.ts` 里的硬编码链接同步改掉
- `next.config.ts` 给旧的四个引导页地址和四个 `/x/app` 地址各加了一条 301，保排名权重不断
- 顺带跑了一次真·`npm run sync:guides`（见上"M7 真实联调"）：`moment-card`/`dot` 换成了真实同步内容；`geometric-patterns` 仍是手写占位版，只手动改了里面三个 `toolLinks` 硬编码 href 到新地址

**生产构建实机验证**（`rm -rf .next && npm run build` 后 `next start`）：
- 8 条新地址（4 引导页 + 4 `/create/*` 编辑器）全部 200
- 8 条旧地址（`/dot`、`/moment-card`、`/geometric-patterns`、`/decorate`、4 个旧 `/x/app`）全部 301 到正确的新地址
- 引导页 canonical 自指；编辑器页 `noindex,follow` + 自指 canonical 都对
- `sitemap.xml` 只列 4 个引导页新地址，不含编辑器
- 首页 Header 菜单、CTA 按钮、`not-found.tsx` 按钮渲染出的 `href` 都指向新地址

**遗留**：见上方"未完成/被阻塞"里的 `transform.smoke.mjs` 条目。
