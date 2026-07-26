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
| URL | 引导页占干净路径（`/polka-dot`），编辑器移到 `/polka-dot/app` |
| 同步方式 | Google 服务账号 + Sheets API，表格保持私有，密钥放 `.env.local` |
| 多语言 | 内容层按 `{ en, ja }` 存，JP 列一并拉取；**本次只上线 EN 路由**，不做 `[lang]`/hreflang/语言切换器 |
| 配图 | 全部静态图片，路径由内容层给出，`next/image` 渲染。图缺失不阻塞构建 |
| 字体 | 引入 Bricolage Grotesque + DM Sans + DM Mono，**只作用于引导页**，Header/Footer/现有页面保持 Nunito |
| FAQ 折叠 | 原生 `<details>`，不用 Radix accordion |
| `/x/app` 收录 | `noindex, follow`，并从 sitemap 排除 |

### tab → 路由映射

| Sheet Tab | slug | 引导页 | 编辑器 |
|---|---|---|---|
| `Polka Dot Generator` | `polka-dot` | `/polka-dot` | `/polka-dot/app` |
| `Geometric Pattern Generator` | `geometric-patterns` | `/geometric-patterns` | `/geometric-patterns/app` |
| `Photo Quote Maker` | `moment-card` | `/moment-card` | `/moment-card/app` |
| `Photo Overlay Editor` | `dot` | `/dot` | `/dot/app` |

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
| `GuideCtaButton.tsx` | 设计稿的 `.btn` 硬阴影 + 按压动效 |
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

### M7 · 同步脚本（3 新文件，2 修改）

只依赖 M1 的 schema，**不依赖任何组件，可与 M3–M6 并行**。

```
scripts/
  sync-guide-content.mjs   入口
  lib/sheet-schema.mjs     FIELD_MAP + COLLECTIONS + REQUIRED
  lib/emit.mjs             确定性 TS 输出
```

```jsonc
"sync:guides":       "node --env-file-if-exists=.env.local scripts/sync-guide-content.mjs",
"sync:guides:check": "node --env-file-if-exists=.env.local scripts/sync-guide-content.mjs --check"
```

`googleapis` 进 **devDependencies**——`src/` 里没有任何东西 import 它，永远不会进 bundle。

标志位：`--check`（不写盘，有偏差就 exit 1）、`--strict`（告警升级为错误）、`--slug=polka-dot`（单个工具）、`--verbose`。

#### 环境变量

```
GOOGLE_SHEETS_SPREADSHEET_ID=1Omxf4GMeQNsDcExgmLzPFu1v6B7ij4PpPW35F_at4FU
GOOGLE_SERVICE_ACCOUNT_EMAIL=...@....iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_B64=<PEM 的 base64>
```

私钥用 base64 是刻意的：Node 的 `--env-file` 解析器处理多行 PEM 和 `\n` 转义是反复踩坑的地方，base64 让它变成一行不透明字符串。

scope 用 `spreadsheets.readonly`。表格把服务账号邮箱加为**查看者**即可。这是开发机上的脚本，任何密钥都不进 Vercel。

#### 一次性配置步骤

1. GCP 建项目 → 启用 Google Sheets API
2. 建 service account → 生成 JSON 密钥并下载
3. Sheet 点共享，把 `xxx@xxx.iam.gserviceaccount.com` 加为查看者
4. `base64 -w0 <key.json 里的 private_key>` → 写进 `.env.local`

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

跑完后把重新生成的 `generated/polka-dot.ts` 和 M1 手写的对照——**diff 应该只有文案，没有结构变化**。如果有结构差异，说明 M1 的 schema 设计错了。这是整条映射链路真正的端到端验证。

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

**M7** —— 干净工作区跑 `npm run sync:guides`，`git diff --stat` 应只动一个文件。

- **连跑两次，第二次必须零 diff**（确定性测试）
- `--check` → exit 0；手改生成文件里一个字符再 `--check` → exit 1 并打出 diff
- 把表格某个必填格清空 → 该 tab 中止、不写盘、exit 非零
- 加一行垃圾 Section → 告警但 exit 0，加 `--strict` → exit 1

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

## 8. 进度

- [x] **M0** 本文档
- [ ] **M1** 内容层骨架
- [ ] **M2** 样式地基
- [ ] **M3** 引导页基础组件
- [ ] **M4** polka-dot 路由迁移 + 首屏
- [ ] **M5** 其余 section
- [ ] **M6** SEO
- [ ] **M7** 同步脚本
- [ ] **M8a** geometric-patterns
- [ ] **M8b** moment-card
- [ ] **M8c** dot
- [ ] **M9** 可选打磨
