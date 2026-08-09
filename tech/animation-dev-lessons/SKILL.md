---
name: animation-dev-lessons
description: framer-motion 动画组件开发复盘 —— 实际犯过的技术错误与必须注意的点（animate prop keyframes 去重、ResizeObserver 尺寸回调、CSS 高度过渡与滚动定位、运算符优先级、分支顺序等）
---

# Animation Dev Lessons — 动画组件开发复盘

记录用 framer-motion 开发动画组件时**真实犯过的错误**和**必须注意的技术点**。所有条目都是可复用的通用技术问题，写动画代码前先过一遍。

## 一、犯过的技术错误（含根因与修复）

### 1. 运算符优先级 bug：伪随机函数返回巨大数值
```js
// ❌ 实际是 v - (Math.floor(v) * 2) - 1；v 是大数量级时结果 ≈ -25000
return v - Math.floor(v) * 2 - 1;
// ✅ 正确落在 [-1, 1]
return (v - Math.floor(v)) * 2 - 1;
```
**根因**：`v - Math.floor(v) * 2 - 1` 少了括号，`*` 优先于 `-`。返回值直接用作坐标偏移（乘抖动幅度后上万像素），元素全部被甩出容器/视口，只剩背景。
**验证**：写完用 `node -e` 跑 1000 个 seed 打印 min/max 确认范围。

### 2. 不能用 `motion.div` 的 `animate` prop 触发"必须每次重放"的动画
**原因**：framer-motion 的 `animate` prop 对目标值做**去重比较**——keyframes 数组走 `shallowCompare`（逐元素 `===`），普通值走 `!==`。**当目标与上次相同（含往返场景：A→B→A）时不重触发动画**。所以"切下一页 → 立即切回 → 再切"这类**往返切换**，第二次动画不播放，第三次才生效。
**修复**：改用 `useAnimation()` + 显式 `controls.start(target)`——`controls.start` 是命令式调用，**无条件触发**（绕开 target 去重）。配合 `animateKey`（每次切换递增的 state）+ `useEffect([animateKey])`；目标值经 `ref` 读取最新，避免无关 render 触发重放。首帧用 `controls.set()` 直接放置（等价 `initial={false}`）。
**注意**：`controls.start` 与 `whileHover`/`whileTap` 手势可共存；组件级 `transition` prop 仍作用于 controls 动画。

### 3. ResizeObserver 对"任何尺寸变化"都回调：动画被反复重启
**原因**：`ResizeObserver` 在元素宽、高任一变化时都会回调。若容器高度在动画期间变化（如从内容高收拢到视口高），回调**逐帧触发**；回调里若无条件 `setState`/递增动画键，动画会被反复重启——表现是"动画特别慢 / 永远收不完"，而且只在"容器尺寸变化的那次切换"出现（尺寸不变的切换正常）——**这个不对称性是定位线索**。
**修复**：回调里用 ref 记录上次宽度，**只在宽度真正变化时**才触发动画/更新状态；高度变化仅更新宽度 state（相同值 React 自动跳过渲染）。

### 4. 容器 `height` 的 CSS transition 打断 `scrollTo` 平滑滚动
**原因**：`window.scrollTo({ behavior: 'smooth' })` 启动后，若容器高度同时在做 CSS 过渡，页面内容高度**逐帧变化**，浏览器平滑滚动被持续干扰/目标漂移，最终停在页面顶部（看起来"没滚"）。
**修复**：
- 容器高度**不做 CSS transition**（需要时让高度渲染瞬间到位）
- `scrollTo` 用 `requestAnimationFrame` 包裹，等 React 渲染（布局稳定）后再执行
- 滚动目标按**最终布局预计算**（`容器顶部 + 最终内容高/2 + 元素相对偏移 − 视口高/2`），不要依赖元素当前 DOM 位置（动画中会漂移）

### 5. 分支判断顺序：特殊动画分支被通用分支抢先
**原因**：判断"某元素是否执行特殊动画（抽离/抽入）"时，把它放在"通用隐藏/普通补间"分支**之后**——当该元素同时满足特殊条件与通用条件时，先命中通用分支，特殊动画（含关键路径上的 transform/opacity 序列）完全不执行。
**修复**：高优先级的特殊分支（抽离/抽入/退出动画）必须放在通用分支**之前**，并用明确的谓词判定（如方向 + 前一次索引）。

### 6. 覆盖层（渐变遮罩）盖住重要内容
**原因**：给模糊内容加"底部自然淡出"的渐变遮罩，内容布局调整后（文字移到遮罩区域内），遮罩把文字盖住。
**修复**：遮罩方向/位置与内容区域联动；内容移到底部后遮罩改到顶部（或移除）。涉及 absolute 覆盖层时，先确认它不与任何可见内容重叠。

### 7. 固定像素偏移在响应式大尺寸下失效
**原因**：布局偏移写成固定像素（如 `8/16/−10px`），当元素尺寸随容器成比例放大（如宽度 = 容器 50%）后，几十像素的偏移相对元素尺寸等于零，下层元素被完全遮挡。
**修复**：偏移、间距等与尺寸相关的量**按元素/容器尺寸的比例计算**，或用 clamp 保证最小可见量；不要假定固定像素在所有尺寸下有意义。

### 8. framer-motion 语法与类型注意
- `transition_hover` 不是合法 prop → 把 `transition` 内联进手势目标：`whileHover={{ scale: 1.05, transition: { ... } }}`
- keyframes 数组可用 `null` 首元素表示"从当前值开始"：`[null, a, b]`；TS 下需确认目标类型与 `TargetAndTransition` 匹配（必要时给 pose 对象显式类型标注）
- `zIndex` 是离散值：切换时瞬变（不做插值），用于层级切换没问题

### 9. 工具链：JSON 重复键 / 批量编辑原子性 / lint 规则名
- JSON 配置文件（`.oxlintrc.json` 等）出现**重复键**时后者静默覆盖前者，配置"没生效"——检查无重复键
- 批量编辑工具（`multi_edit`）是原子的：任一处匹配失败则**整个调用不落盘**——先读取准确文本再改
- oxlint 规则名用**下划线**前缀：`jsx_a11y/label-has-associated-control`（不是 `jsx-a11y/...`）；framer 的 `motion.*` 组件会被 `label-has-associated-control` 误报，组件库无表单可关闭该规则

## 二、必须注意的技术点

- **framer-motion keyframes**：`[null, a, b]` 首元素 null = 从当前值开始；`times` 数组长度与 keyframes 一致；keyframes 目标会被 `shallowCompare` 去重（见错误 2）
- **动画触发架构**：所有"必须每次重放"的动画走 `animateKey` + `useAnimation`；不要把触发寄托在 `animate` prop 的 target 比较上
- **ResizeObserver 测量**：用于响应式尺寸（子元素 = 容器宽度比例）时只监听宽度变化驱动更新；注意高度变化也会触发回调（见错误 3）
- **确定性伪随机**（正弦散列 `scatter(seed)`）：相同 seed 恒定输出，避免重渲染时布局跳动；`Math.random()` 会导致布局每帧乱跳
- **两态高度与滚动策略**：展开态容器高度 = 内容总高（可滚动）、收拢态 = 视口高度（不滚动、内容居中）；两态切换时高度不做 CSS 过渡（见错误 4）
- **组件库构建**：Vite library mode 输出 ESM；`react/react-dom` 及动画库放 `peerDependencies` 并在 `rollupOptions.external` 外部化；`vite-plugin-dts` 生成类型；`cssCodeSplit: false` 合并样式
- **沙箱限制**：环境无法执行 pnpm 时，安装/构建命令汇总成一条消息交给用户在真实终端执行
- **验证习惯**：改完跑 `tsc --noEmit` + lint + 格式化；纯逻辑（如伪随机范围、布局公式）用 `node -e` 快速验证
