# agent-motion-ui-task.md
## Description
搭建自用 React 原子动效组件库，依托 framer-motion 实现各类页面微交互、入场退场、滚动联动、状态切换动画；依托 Storybook 独立调试组件，打包为标准 ESM 包，仅聚焦动画逻辑，无业务耦合。

## Tech Stack
组件库本体
- Build：Vite + Rollup
- Core：React 18 + TypeScript
- Animation：framer-motion
- Style：Tailwind CSS V4
- Debug：Storybook(Vite)
- Lint：OXLint + Prettier
- Package Manager：pnpm

## Directory Structure
```
motion-ui-lib/
├── .storybook/                # Storybook 全局配置
├── src/
│   ├── components/            # 动效组件，组件与stories就近存放
│   │   ├── AnimateButton/
│   │   │   ├── index.tsx
│   │   │   ├── AnimateButton.stories.tsx
│   │   ├── ScrollInView/
│   │   ├── ModalAnimate/
│   │   ├── PageTransition/
│   │   ├── ThemeSwitch/
│   │   └── TextAnimate/
│   ├── hooks/                 # 动画通用自定义hooks
│   ├── utils/                  # 动画工具、缓动配置
│   └── index.ts               # 统一导出入口
├── vite.config.ts
├── tsconfig.json
└── package.json
```