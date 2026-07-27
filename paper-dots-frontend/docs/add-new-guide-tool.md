# 新增工具引导页指南（Sheet → 引导页）

> 本文档只覆盖"Sheet 内容 → 引导页"这条链路。工具本身的编辑器（React 页面）不在这条自动化里，得单独开发，本文档假设 `appPath` 对应的编辑器页面已经存在（或者你打算先建一个占位引导页、编辑器后补）。
>
> 字段映射以 `scripts/lib/sheet-schema.mjs` 当前内容为准，2026-07-27 已对着 "Photo Overlay Editor" tab 的真实 Sheet 数据逐行核对过。以后这个 schema 文件改了，本文档要跟着更新。

## 一、新增一个工具的完整 Checklist

1. **Sheet 里新建一个 tab**，tab 名任意（这就是 `sheetTab`），按下面"二、表格规则"和"三、字段映射表"填内容。
2. **`src/content/guides/registry.json`** 加一条：
   ```json
   { "slug": "new-tool", "label": "New Tool", "sheetTab": "<Sheet 里的 tab 名>", "guidePath": "/xxx", "appPath": "/create/new-tool" }
   ```
3. **`src/content/guides/registry.ts`** 的 `GUIDE_SLUGS` 数组里加上新 slug 字面量——这是 TS 类型层面的强制要求，漏加会在编译期直接报错提醒你，不会漏掉。
4. **跑同步**，把 Sheet 内容拉成生成文件（见"五、命令速查"）。
5. **`src/content/guides/index.ts`** import 新生成的 `generated/<slug>.ts`，加进 `GUIDES` 映射对象。**顺序不能反**：文件是跑完第 4 步同步才会存在，第 3 步之前这行 import 会报模块找不到。
6. **新建引导页** `src/app/(public)/<guidePath 对应目录>/page.tsx`——照抄现有的四个 guide page.tsx 之一，只改 `SLUG` 常量，其余零硬编码（`buildGuideMetadata`/`buildGuideJsonLd`/`GuideTemplate` 全部从 registry + content 派生）。
7. 编辑器页面若还没搬到 `create/<slug>` 下，按现有四个工具的模式 `git mv` 过去，用 `buildEditorMetadata` 加自指 canonical + `noindex,follow`。
8. 想让新工具出现在 Create 菜单/Footer，就加进 **`src/lib/tools.ts`** 的 `CREATE_TOOLS`（这是菜单唯一数据源）。
9. `npx tsc --noEmit && npm run build` 确认整体通过。
10. `git diff` review 一遍，确认没有意外改动，再 commit。

## 二、Sheet 表格规则

列固定为：`Section | Item ID | Field Name | EN | HTML Tag | JP`

- **`Item ID` 留空 = 单值字段**（整个 tab 只出现一次，如 Meta Title、Hero Headline）；**填了数字 = 集合项**（同一 Section 下相同 Item ID 的若干行组成数组里的一条，如 Feature 1、Feature 2……）。
- **集合项按 Item ID 的数值排序**生成数组，跟这些行在 Sheet 里的物理位置无关；挪动行不影响页面顺序，改 ID 才会。ID 有跳号（1、2、4）会被压实成连续数组并打警告。
- **`HTML Tag` 列不影响实际渲染的标签层级**——标题层级由模板固定（全页一个 H1，每个 section 一个 H2），这一列纯粹给人看、脚本读了但只做提示用。
- **图片单元格留空是合法的**，对应的 `image` 字段整体为 `null`，页面会渲染占位板，不会构建失败。
- **`Url` 列不是内容输入**，是给同步脚本做交叉校验用的：EN 列的值必须等于 `registry.json` 里这个 slug 的 `guidePath`，不一致直接报错中止（只校验 EN 列，JA 列的 `/jp/...` 不参与校验）。
- **必填字段**（缺任意一个，这个 tab 整体中止、不写文件）：`Meta Title`、`Meta Description`、`Hero Headline`、`Hero Primary CTA Text`。
  - 注意 **`Name` 不在必填清单里**，但现在 `<title>`/`og:title`/`twitter:title` 都是从 `Name` 拼出来的（`"{Name} · Dottypic"`，2026-07-27 起的规则），`Name` 空着不会报错，但会拼出一个只有 " · Dottypic" 的空标题——**新建 tab 时务必把 `Name` 填了**。
- **JP 列没填满全部必填项**时，`ja` 这个语言整体被省略（只警告，不报错，页面照样用 EN 兜底）。
- **正文允许的行内 HTML**：`<strong>`（渲染成荧光笔高亮）、`<em>`、`<br>`、`<span class="swash">`（H1 专用下划波浪，仅这个 class 名合法）。允许的字段只有：`Hero Headline`、`Feature Title`、`Feature Description`、`FAQ Answer`——其余字段出现尖括号会被当纯文本原样保留并打警告（不是安全问题，是排版事故：页面上会显示出尖括号）。

## 三、完整字段映射表

### 单值字段（Item ID 留空）

| Section | Field Name | 落到 GuideContent | 备注 |
|---|---|---|---|
| Name | Name | `name` | 用于 JSON-LD 结构化数据，以及拼 `<title>`/`og:title`/`twitter:title`（格式 `"{Name} · Dottypic"`） |
| Url | URL | 不落地 | 仅交叉校验 EN 列 == `registry.json` 的 `guidePath` |
| Meta Information | Meta Title | `meta.title` | **必填，但目前不驱动任何可见输出**——`<title>` 已改用 `Name`（见上）。历史遗留字段，填了会被存进生成文件但没处渲染 |
| Meta Information | Meta Description | `meta.description` | 渲染为 `<meta name="description">` / `og:description` / `twitter:description` |
| Hero | Headline | `hero.headline` | 页面 H1，允许行内 HTML |
| Hero | Subheadline | `hero.subheadline` | 纯文本 |
| Hero | Hero Image | `hero.image.src` | 留空则 `hero.image` 整体为 `null`，走居中单列布局 |
| Hero | Hero Image Alt | `hero.image.alt` | |
| Hero | Primary CTA Text | `hero.cta.text` | 必填 |
| Hero | Primary CTA Link | `hero.cta.href` | 留空则渲染时回退到 `registry.json` 的 `appPath` |
| Hero | Format | `hero.formats[]` | 特例：可以单格逗号分隔（`SVG, PNG, JPEG`），也可以按 Item ID 拆成多行，两种写法都认 |
| Tool Recommendation | Lead | `toolLinks.lead` | 工具推荐条的引导语 |
| How To | How to Title | `howTo.heading` | |
| How To | How to Image | *未接入* | `GuideContent` 类型目前没有这个位置，非空值会打警告 |
| Why | Why Title | `why.heading` | 这是"区块标题"（Item ID 留空的那一行）；卡片小标题是集合项，Field Name 同名但 Item ID 非空，见下表 |
| FAQ | FAQ Title | `faq.heading` | |
| CTA | CTA Headline | `finalCta.heading` | 注意 Section 名是 **`CTA`**，不是 `Final CTA` |
| CTA | CTA Subtext | `finalCta.body` | |
| CTA | Button Text | `finalCta.cta.text` | |
| CTA | Button Link | `finalCta.cta.href` | 留空回退到 `appPath` |

### 集合字段（Item ID = 1、2、3……）

| Section | Field Name | 落到 GuideContent | 备注 |
|---|---|---|---|
| Tool Recommendation | Tool Name | `toolLinks.items[].label` | |
| Tool Recommendation | Tool Link | `toolLinks.items[].href` | 留空则按 Tool Name 去 `registry.json` 按 `label` 解析 `guidePath`；解析不到、或指向工具自己的引导页，整张卡片会被丢弃并告警（绝不会输出 `href="#"` 死链） |
| Feature | Feature Title | `features[].heading` | 允许行内 HTML |
| Feature | Feature Description | `features[].body` | 允许行内 HTML |
| Feature | Feature Image | `features[].image.src` | 留空则该条 `image` 整体为 `null` |
| Feature | Feature Image Alt | `features[].image.alt` | |
| Feature | Feature Button | *未接入* | 同 How to Image，非空值会打警告 |
| How To | Step Title | `howTo.steps[].heading` | |
| How To | Step Description | `howTo.steps[].body` | |
| Why | Why Title | `why.cards[].heading` | Item ID 非空时，是卡片小标题 |
| Why | Why Description | `why.cards[].body` | |
| FAQ | Question | `faq.items[].question` | |
| FAQ | Answer | `faq.items[].answer` | 允许行内 HTML |

## 四、常见坑

- **该填 Item ID 却漏填**：这一行会被当成单值字段去匹配上表左边那份"单值字段表"，多半匹配不到，打印 `unrecognized Section/Field Name` 警告并跳过——不会崩溃，也不会静默丢数据（警告默认就打印，不用加 `--verbose`）。
- **Section 或 Field Name 打错字**：如果这个 Field Name 在同类字段（单值或集合各自的池子）里全局唯一，脚本会兜底匹配上并打警告提示"配对上了但 Section 对不上"；如果不唯一，直接跳过并警告。
- **想加一个表里还没有的字段**（比如 `How to Image`、`Feature Button`）：光在 Sheet 里填不会自动出现在页面上。得先去 `src/content/guides/types.ts` 的 `GuideContent` 类型加位置、去对应渲染组件接上，再回来把 `scripts/lib/sheet-schema.mjs` 的 `FIELD_MAP`/`COLLECTIONS` 加上映射。
- **Name 字段没填**：不会报错中止，但 `<title>` 会变成只有 `" · Dottypic"`，务必检查。

## 五、命令速查

```bash
npm run sync:guides:check -- --slug=<slug> --verbose   # 只读检查，不写文件，看有没有警告/差异
npm run sync:guides -- --slug=<slug> --verbose          # 真实同步并落盘
npm run sync:guides                                      # 同步 registry.json 里的全部工具
npx tsc --noEmit && npm run build                         # 类型检查 + 构建验证
```

同步脚本从不执行 `git`，只负责生成/更新 `src/content/guides/generated/<slug>.ts`，review `git diff` 和 commit 是你手动做的一步。
