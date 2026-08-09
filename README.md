# motion-ui-lib

React 原子动效组件库：基于 framer-motion 的页面微交互、入场退场、滚动联动、状态切换动画组件。聚焦动画逻辑，无业务耦合，打包为标准 ESM 包。

## Tech Stack

- Build：Vite（library mode）+ Rollup
- Core：React 18 + TypeScript
- Animation：framer-motion
- Style：Tailwind CSS V4
- Debug：Storybook (Vite)
- Lint：OXLint + Prettier
- Package Manager：pnpm

## 快速开始

```bash
pnpm install
pnpm storybook   # 打开组件调试（默认 http://localhost:6006）
```

## 开发命令

| 命令 | 说明 |
| --- | --- |
| `pnpm storybook` | 启动 Storybook 调试 |
| `pnpm build` | 打包 ESM 产物到 `dist/`（含类型声明 + `motion-ui.css`） |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm lint` / `pnpm lint:fix` | OXlint 静态检查 / 自动修复 |
| `pnpm format` / `pnpm format:check` | Prettier 格式化 / 校验 |

## 使用组件库

```bash
pnpm add motion-ui-lib framer-motion react react-dom
```

```tsx
import { AnimateButton } from 'motion-ui-lib';
import 'motion-ui-lib/styles.css';

<AnimateButton variant="secondary" loading={false}>
  Click me
</AnimateButton>
```

## 目录结构

```
src/
├── components/     # 动效组件，组件与 stories 就近存放
│   ├── AnimateButton/
│   ├── SplitCardStack/   # 三阶段卡片交互：散列堆叠 → 点击收拢抽入 → 详情浏览
│   └── ui/               # shadcn/ui 基础组件（button 等）
├── hooks/          # 动画通用自定义 hooks
├── lib/            # cn() 等通用工具
├── utils/          # 动画工具、缓动配置
└── index.ts        # 统一导出入口
```
