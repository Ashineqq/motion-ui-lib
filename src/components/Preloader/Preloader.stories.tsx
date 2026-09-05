import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useState } from 'react';

import { Preloader } from './index';

/* 演示页内容：仿 lusion 首页风格的占位场景（组件不耦合任何业务内容） */
function DemoScene() {
  return (
    <div className="relative flex h-full min-h-[60vh] flex-col justify-between overflow-hidden bg-neutral-950 px-8 py-10 text-white md:px-16 md:py-14">
      {/* 背景渐变光斑 */}
      <div
        aria-hidden
        className="absolute -right-40 top-1/3 h-[70vh] w-[70vh] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ff5c1a, transparent 65%)' }}
      />
      <header className="relative z-10 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight">Lusion®</span>
        <span className="text-xs uppercase tracking-[0.25em] text-neutral-500">
          loading → ready
        </span>
      </header>
      <main className="relative z-10">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
          Award winning 3D studio
        </p>
        <h1 className="mt-3 max-w-3xl text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
          Digital experiences that move brands forward.
        </h1>
      </main>
      <footer className="relative z-10 flex items-center justify-between text-xs text-neutral-500">
        <span>replicated preloader — lusion.co</span>
        <span>© 2025</span>
      </footer>
    </div>
  );
}

const meta = {
  title: 'Motions/Preloader',
  component: Preloader,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    minDuration: { control: { type: 'range', min: 0.4, max: 4, step: 0.1 } },
    settleDelay: { control: { type: 'range', min: 0, max: 2, step: 0.1 } },
    revealDuration: { control: { type: 'range', min: 0.2, max: 3, step: 0.1 } },
    backgroundColor: { control: 'color' },
    digitColor: { control: 'color' },
    digitFontSize: { control: 'text' },
  },
} satisfies Meta<typeof Preloader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认：模拟加载进度（先快后慢，~1.2s 到 100，短暂停顿后撕开揭示） */
export const Default: Story = {
  args: {
    minDuration: 1.2,
    settleDelay: 0.4,
    revealDuration: 1.2,
  },
  render: (args) => (
    <Preloader {...args}>
      <DemoScene />
    </Preloader>
  ),
};

/** 真实任务加载：3 个异步任务完成后才揭幕 */
export const WithTasks: Story = {
  render: (args) => (
    <Preloader
      {...args}
      settleDelay={0.2}
      tasks={[
        new Promise((r) => setTimeout(r, 600)),
        new Promise((r) => setTimeout(r, 1200)),
        new Promise((r) => setTimeout(r, 2000)),
      ]}
    >
      <DemoScene />
    </Preloader>
  ),
};

/** 演示控制器：每次点击重新播放 */
export const Replayable: Story = {
  render: () => {
    const [key, setKey] = useState(0);
    const replay = useCallback(() => setKey((k) => k + 1), []);
    return (
      <div className="bg-neutral-950">
        <button
          onClick={replay}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:scale-105 active:scale-95"
        >
          ↻ 重新播放
        </button>
        <Preloader key={key} onComplete={() => console.log('preloader done')}>
          <DemoScene />
        </Preloader>
      </div>
    );
  },
};