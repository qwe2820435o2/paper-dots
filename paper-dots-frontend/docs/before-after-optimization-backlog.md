# Before & After Photo Maker — 优化清单（待办）

> 2026-08-26 整体审查后的记录。功能已完整上线（菜单入口、引导页、4 种版式、文字标签、手动对齐、PNG/GIF 导出），架构重构（图标栏+单面板+移动端抽屉，对齐 `DecorateApp.tsx`/`MomentCardApp.tsx` 的模式）已完成并验证。这份文档记录还没做的三组优化，供下次继续。

## 已完成

- 菜单入口 → 引导页 → 编辑器完整链路
- 4 种版式：滑块对比 / 并排 / 分屏 / 上下堆叠
- 自定义文字标签（可拖拽定位、字号、颜色）
- 手动辅助对齐（拖拽/缩放/旋转 after 图对齐 before 图）
- PNG 导出 + GIF 导出（仅滑块版式，`gif.js` 客户端编码）
- 编辑器外壳重构：图标栏 + 单面板 + 移动端抽屉（Photos/Layout/Text/Align/Export 五个 tab），替换照片按钮改成常驻可见

## 待办 P1 — 稳定性 / 真实 bug

**1. GIF 导出过程中如果切版式或开对齐模式，会导出一张损坏的 GIF**
`GifExportButton.tsx` 的 `busy` 只是本地 state，没有禁用 `LayoutPicker`/`TextLabelPanel`/`AlignPanel`（现在是 tab 切换，问题依然存在——切 tab 会导致 `Canvas.tsx` 立刻换渲染分支/换 Stage 尺寸，但导出循环还在对着新画面截图喂给 `gif.js`）。`gif.js` 按第一帧尺寸锁定画布，后续帧尺寸不一致会导致输出错位/损坏，用户毫无感知。同理，导出 GIF 期间点"下载 PNG"，截到的是动画扫描过程中的某一帧。
**修法**：把导出中状态提升到 `BeforeAfterApp`（或 redux），GIF 导出期间禁用 tab 切换/PNG 导出按钮。

**2. 三处拖拽逻辑（滑块、对齐、文字标签）在拖拽过程中如果画布尺寸变化，会算错位置**
`Canvas.tsx` 里滑块/对齐/标签三处的 `mousedown` 处理函数把当时的 `canvasW`/`cellW` 存进闭包，后续 `pointermove` 用这个"冻结"的值去除以实时读取的 `rect.width`。如果拖拽过程中容器尺寸变了（比如手机横竖屏切换触发 `ResizeObserver` 重算），闭包里的值是旧的，位置计算会错乱，直到松手才恢复正常。
**修法**：每次 `pointermove` 里从 ref 读最新尺寸，而不是用 mousedown 时闭包住的值。

**3. 三个 `useEffect` 清理函数移除的是过期的 window 监听器，不是实际挂上去的那个**
`Canvas.tsx` 三处（滑块/对齐/标签）的 `useEffect(() => () => {...}, [])` 只在挂载时执行一次，但里面引用的 `onPointerMove`/`onPointerUp` 每次渲染都会重新创建。如果组件在拖拽过程中（松手之前）卸载，卸载时清理的是挂载时那个旧闭包，`removeEventListener` 要求函数引用完全一致，清理会静默失败，监听器永久残留在 `window` 上。
**修法**：把当前处理函数存进 ref，挂载和卸载都从 ref 里取同一个引用。

**4. 换图后，之前调好的对齐/缩放/旋转会原样套用到新照片上，没有任何提示**
`beforeAfterPhotoUpload.ts` 的 `applyBeforeAfterPhoto` 只 dispatch 了 URL，没碰 `afterTransform`。用户拖/缩/转对齐好 after 图后，如果在新的 Photos tab 里换了张新照片，旧的偏移/缩放/旋转会直接套在新照片上，大概率是错位的。
**修法**：换图（`setBeforeUrl`/`setAfterUrl`）时顺带 dispatch `resetAfterTransform()`，或者至少弹个 toast 提示"对齐已重置"。

## 待办 P2 — 视觉一致性 / 细节打磨

**5. 上传区（`Uploader.tsx`）比站内其它工具的上传态明显"素"一档**
对比 `PhotoUploader.tsx`（`variant="canvas"`）：后者有装饰性圆点、80×80 带阴影的图标底、专用字体的标题、`PNG/JPG/WEBP` 格式徽章。`Uploader.tsx` 的两个格子什么都没有。

**6. 文字标签没有宽度限制，长文字会溢出画布且不换行**
`Canvas.tsx` 里的 `Text` 没设 `width`，`TextLabelPanel.tsx` 的输入框也没设 `maxLength`。对比 `MomentCardCanvas.tsx` 的标题/副标题都设了 `width` + `align="center"` 会自动换行。
**修法**：给 `Text` 设一个按画布宽度百分比算的 `width`（比如 90%）+ `align="center"`，输入框加 `maxLength`。

**7. 图片解码失败没有任何提示，编辑器会卡在空白画布上**
`useHTMLImage.ts` 只处理了 `onload`，没处理 `onerror`。这个问题在 `DecorateCanvas`/`MomentCardCanvas` 里也存在，是全站共享的基础设施缺口，不是这个工具独有，但这个工具因为要同时等两张图解码成功，撞上的概率更高。

**8. 引导页文案还停留在"只有滑块版式"的最初版本，没跟上后续加的功能**
`generated/before-after.ts` 文件自己的注释就写着"还没接 Sheet，先手写占位"。Hero 副标题、Features、How-to 全部只提滑块拖拽和 PNG 导出，GIF 导出、文字标签、手动对齐、并排/分屏/堆叠三种版式，一个字都没提到。菜单里的 `navDescription` 也是同样的老文案。而且只有英文，没有 jp/id 翻译（会 fallback，不报错，但内容缺口是实打实的）。

## 待办 P3 — 无障碍访问（优先级较低）

**9. 三处拖拽交互（滑块分割线、对齐拖拽、文字标签拖拽）键盘完全操作不了**
这三处都是 Konva 图形 + `onMouseDown`/`onTouchStart`，没有 `tabIndex`/`onKeyDown`，Konva canvas 节点本身也不在 DOM 的 tab 顺序里。对比同一批面板里所有数值型控件（字号、颜色、缩放、旋转滑块）用的都是 Radix 的 `Slider`，键盘完全可操作。

**10. GIF 导出没有错误/超时兜底**
`GifExportButton.tsx`：`gif.js` 只有 `finished`/`progress`/`abort`/`start` 事件，没有 `error` 事件。如果 `/gif.worker.js` 加载/执行失败，`busy` 会永远卡在 `true`，按钮永久禁用，用户只能刷新页面。

## 不在清单里但顺带确认过的（全站共性，非本工具独有）

- `resetBeforeAfter`/`resetAfterTransform` 里，只有后者被实际调用过；前者是死代码——跟 `decorate`/`moment-card` 的 `resetDecorate`/`resetMomentCard` 同样从未被调用是一个模式。
- 上传的图片用 `URL.createObjectURL` 生成，换图/清除/组件卸载时都没有 `URL.revokeObjectURL`，会一直攒着内存里的 blob。`decorate`/`moment-card` 同样存在这个问题，是系统性缺口；这个工具因为同时抓着两张图、且现在能随时换图，触发概率更高，值得优先处理。
