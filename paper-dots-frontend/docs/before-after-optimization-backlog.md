# Before & After Photo Maker — 优化清单（已清空）

> 2026-08-26 整体审查后的记录。功能已完整上线（菜单入口、引导页、4 种版式、文字标签、手动对齐、PNG/GIF 导出），架构重构（图标栏+单面板+移动端抽屉，对齐 `DecorateApp.tsx`/`MomentCardApp.tsx` 的模式）已完成并验证。2026-08-26 第二轮把清单上的 10 条全部做完了（P1 四条、P2 三条、内容一条、无障碍两条），下面按批次记录改法。文末两条全站共性问题也一并处理了。

## 已完成

- 菜单入口 → 引导页 → 编辑器完整链路
- 4 种版式：滑块对比 / 并排 / 分屏 / 上下堆叠
- 自定义文字标签（可拖拽定位、字号、颜色）
- 手动辅助对齐（拖拽/缩放/旋转 after 图对齐 before 图）
- PNG 导出 + GIF 导出（仅滑块版式，`gif.js` 客户端编码）
- 编辑器外壳重构：图标栏 + 单面板 + 移动端抽屉（Photos/Layout/Text/Align/Export 五个 tab），替换照片按钮改成常驻可见

## 已完成 P1（2026-08-26 第二轮）

**1. GIF 导出期间锁定编辑器** — `busy` 从 `GifExportButton` 提升到 `BeforeAfterApp` 的 `exporting`
state（父组件单一数据源，`busy`/`onBusyChange` 传下去）。导出期间：五个 tab 按钮禁用、`togglePanel`
直接 return、移动端抽屉的关闭按钮也禁用（否则会把正在导出的按钮本身卸载掉）、PNG 导出按钮禁用。
因为版式和对齐模式都只能通过 tab 切换，锁住 tab 就锁住了整个 Stage 尺寸。

**2. 拖拽过程中画布尺寸变化算错位置** — `Canvas.tsx` 三处拖拽统一改用归一化坐标（stage rect 的
0-1 比例），每次 `pointermove` 现读 `getBoundingClientRect()`。滑块位置和标签位置本来就存百分比，
对齐偏移存的是 cell 百分比（对齐模式下 cell 就是整个 stage），所以画布 px 尺寸在换算里正好约掉。

**3. `useEffect` 清理函数移除过期监听器** — 引入 `DragHandlers`（`{move, up}` 一对）+
`attachDrag`/`detachDrag`，三对 handler 用 `useMemo` 保持引用稳定，挂载和卸载取的是同一个引用。

**4. 换图后旧对齐套用到新照片** — `applyBeforeAfterPhoto` 顺带 dispatch `resetAfterTransform()`，
新增 `clearBeforeAfterPhoto` 让清空按钮走同一条路。`Uploader.tsx` 在换图/清空前用新增的
`hasAfterTransform()` 判断，只有真调过对齐才弹 toast（`editor.toast.alignReset`，已补 en/jp/id）。

## 已完成 P2（2026-08-26 第二轮）

**5. 上传空态对齐站内其它工具** — 六颗装饰圆点从 `PhotoUploader` 抽成共享的
`decorate/UploadDropzoneDots.tsx`（两边都改成引用它，就是当初漂移的根源），before-after 空态补上
带阴影的图标底、Quicksand 标题（用槽位名 Before/After 当标题——这里唯一不显然的信息就是哪张放哪边）、
PNG/JPG/WEBP 徽章。尺寸比 `PhotoUploader` 的 canvas 变体小一档，因为两个方格要挤在一个的位置上；
`sm` 以下方格只有 ~170px 宽，图标/字号再降一级、徽章直接隐藏，否则会撑破格子。

**6. 文字标签换行** — `Canvas.tsx` 的 `Text` 加 `width={canvasW * LABEL_WIDTH_RATIO}`（0.9）+
`align="center"`。有了固定宽度后 `offsetX` 直接就是半个盒子，不用再测；只有换行后的高度还要从节点上量，
且它随盒宽变化，所以测量 effect 的依赖加了 `labelWidth`。`TextLabelPanel` 输入框加 `maxLength={60}`。

**7. 图片解码失败提示** — `useHTMLImage.ts` 补 `onerror`：`setImg(null)`（否则会留着上一张图，看起来
像"新图加载成功了"）+ `toast.error(t("imageLoadFailed"))`，key 已存在。toast 按 `src` 设 id，
polka-dot 的 preview 和 export panel 加载同一个 `config.iconUrl`，失败时只弹一次而不是叠两条。
`t` 存在 ref 里，让 effect 的依赖保持只有 `src`——否则每次 render 拿到新函数都会重新解码整张图。
全站三个编辑器（decorate / moment-card / polka-dot）一起受益。

## 已完成 — 内容与无障碍（2026-08-26 第二轮）

**8. 引导页文案重写 + 补齐 jp/id** — `generated/before-after.ts` 从 145 行（只有 en）重写到 530 行
（en/jp/id 三语），并对齐站内其它引导页的结构：features 5 / howTo 3 / why 4 / faq 8（原来是 4/3/3/3）。
内容补上了 4 种版式、GIF 导出（含"仅滑块版式"这个限制）、手动对齐、文字标签，不再只讲滑块+PNG。
`messages/*.json` 的 `tools.beforeAfter.navDescription` 三语同步改成覆盖 slider/GIF/并排。

**9. 三处拖拽的键盘可达性** — 没有去给 Konva 节点硬塞 `tabIndex`（canvas 里的图形本来就不在 DOM 的
tab 顺序里，也收不到键盘事件），而是按面板里已有的 Radix `Slider` 模式，把三个只能拖的值各补一个
真正可聚焦的控件：`LayoutPicker` 加"境界线位置"（仅滑块版式显示）、`AlignPanel` 加水平/垂直偏移、
`TextLabelPanel` 加标签水平/垂直位置（有文字时才显示）。顺带对鼠标用户也更好发现。
新增 i18n：`editor.common.horizontal`/`vertical`、`editor.beforeAfter.dividerPosition`/`labelPosition`、
`editor.beforeAfter.align.position`，三语齐全。

**10. GIF 导出兜底** — `gif.js` 只有 `start`/`progress`/`finished`/`abort`，没有 `error`：worker 脚本
404 或抛异常时它就是不再回消息，`finished` 永远不来。现在导出会冻结整个编辑器，卡死等于把用户锁在
界面里只能刷页面，所以补了 `renderGif()`——按 `progress` 事件重置的停滞计时器（20s），超时就
`gif.abort()` 并 reject，走已有的 catch（复位滑块位置 + 报错 toast）和 finally（解锁编辑器）。
用停滞计时而不是总时长上限：总时长要长到够最慢的手机跑完整轮，那样两种失败都抓不及时。

## 已完成 — 全站共性两条（2026-08-26 第二轮）

**object URL 从不 revoke** — 新增 `src/lib/objectUrl.ts`：`createTrackedObjectUrl` /
`revokeTrackedObjectUrl`，用一个 Set 记账，所以 revoke 可以安全地喂任何 store 里可能存的字符串
（polka-dot 图标那种 data URL、打包资源路径、null），只有本模块造出来的才会真的 revoke。

**只在"被替换/被清除"时 revoke，绝不在组件卸载时 revoke**：`store` 是模块级单例，客户端路由切换
不销毁，而且"引导页上传后跳转到编辑器"这条链路依赖 URL 跨路由存活。卸载时释放会让 store 留着一个
死 URL，切回来就是裂图。改成替换时释放后，每个槽位最多一个活的 object URL，泄漏就封死了。

三个上传辅助函数改成 thunk（要读被自己顶掉的那个 URL，必须能 `getState()`）：
`applyBeforeAfterPhoto` / `clearBeforeAfterPhoto` / `applyDecoratePhoto` / `applyMomentCardPhoto`，
外加新的 `applyDecorateBgPhoto`（`PaperPicker.tsx` 原来直接内联 `URL.createObjectURL`）。
调用处从 `applyXxx(dispatch, file)` 改成 `dispatch(applyXxx(file))`，共 6 处。
释放放在新 URL 已经 dispatch 进 store 之后，保证任何时刻都没有组件指着一个已释放的 URL。

导出用的 blob URL（5 处）本来就已经 1 秒后 revoke，没动。polka-dot 的自定义图标走 `FileReader`
数据 URL，不涉及。

**三个 reset reducer 是死代码** — 按 Travis 的选择补按钮而不是删代码：新增共享的
`components/common/ResetAllButton.tsx`，接到 `resetBeforeAfterEditor` / `resetDecorateEditor` /
`resetMomentCardEditor` 三个 thunk（先 revoke 照片再 dispatch reducer），三个编辑器的交互从此和
`polka-dot`/`geometric` 已有的 Reset all 一致。`editor.common.resetAll` 三语早就存在，没加翻译。
按钮放在各自的 upload/photos 面板而不是 export 面板——换照片本来就来这里，也让破坏性操作离下载按钮远一点。

## 附：这两条原本的记录（全站共性，非本工具独有）

- `resetBeforeAfter`/`resetAfterTransform` 里，只有后者被实际调用过；前者是死代码——跟 `decorate`/`moment-card` 的 `resetDecorate`/`resetMomentCard` 同样从未被调用是一个模式。
- 上传的图片用 `URL.createObjectURL` 生成，换图/清除/组件卸载时都没有 `URL.revokeObjectURL`，会一直攒着内存里的 blob。`decorate`/`moment-card` 同样存在这个问题，是系统性缺口；这个工具因为同时抓着两张图、且现在能随时换图，触发概率更高，值得优先处理。
