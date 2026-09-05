import type { Meta, StoryObj } from '@storybook/react';

import { ScrollCoverStack } from './index';
import type { CoverPage } from './index';

/* 单页内容（仅用于演示，组件本身不耦合任何业务结构） */
function PageInner({
  n,
  kicker,
  title,
  copy,
  align = 'left',
}: {
  n: string;
  kicker: string;
  title: string;
  copy: string;
  align?: 'left' | 'right';
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col justify-between px-8 py-20 text-white">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium uppercase tracking-[0.2em] opacity-60">
          {kicker}
        </span>
        <span className="font-mono text-7xl font-light leading-none opacity-90">{n}</span>
      </div>
      <div className={align === 'right' ? 'text-right' : 'text-left'}>
        <h2 className="text-5xl font-semibold leading-tight md:text-7xl">{title}</h2>
        <p className="mt-4 max-w-xl text-lg opacity-80 md:text-xl">{copy}</p>
      </div>
    </div>
  );
}

const samplePages: CoverPage[] = [
  {
    id: 'p1',
    background: 'linear-gradient(160deg, #f94a00, #fd7b03)',
    children: (
      <PageInner
        n="01"
        kicker="PB"
        title="Add products and brand."
        copy="Store your products, shots and brand look in one place."
      />
    ),
  },
  {
    id: 'p2',
    background: 'linear-gradient(160deg, #48a3d1, #fd7b03)',
    children: (
      <PageInner
        n="02"
        kicker="GO"
        title="AI generates options."
        copy="Concept & scene variations, on-brand, in seconds."
        align="right"
      />
    ),
  },
  {
    id: 'p3',
    background: 'linear-gradient(160deg, #3a54ff, #7a67c5 23%, #fd7b03)',
    children: (
      <PageInner
        n="03"
        kicker="EX"
        title="Export anywhere."
        copy="PDPs, UGC, lifestyle shots, ads — ready to ship."
      />
    ),
  },
  {
    id: 'p4',
    background: 'linear-gradient(160deg, #9a0101, #fd7b03)',
    children: (
      <PageInner
        n="04"
        kicker="SH"
        title="Ship the catalog."
        copy="Your whole catalog, re-shot and on-brand."
        align="right"
      />
    ),
  },
];

const meta = {
  title: 'Components/ScrollCoverStack',
  component: ScrollCoverStack,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '滚动翻盖堆叠：向下滚动时，每一屏（position:sticky）被钉在顶部，随后在 3D 空间后仰、缩小并淡出，下一屏从下方翻上来盖住它。复刻自 fourmula.ai 首页 `.list` 区块。',
      },
    },
  },
  argTypes: {
    endScale: { control: { type: 'range', min: 0.4, max: 1, step: 0.05 } },
    endRotateX: { control: { type: 'range', min: 0, max: 80, step: 1 } },
    endRotateZJitter: { control: { type: 'range', min: 0, max: 20, step: 1 } },
    fadeStart: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    perspective: { control: { type: 'range', min: 400, max: 2000, step: 50 } },
  },
} satisfies Meta<typeof ScrollCoverStack>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 完整演示：前置一段引导区，随后进入翻盖堆叠，最后留一段收尾区 */
export const Demo: Story = {
  args: { pages: samplePages },
  render: (args) => (
    <div className="bg-neutral-950">
      <section className="flex h-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-center text-neutral-100">
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">Four steps</p>
        <h1 className="text-6xl font-semibold md:text-8xl">From idea to assets</h1>
        <p className="mt-2 text-neutral-400">向下滚动 ↓</p>
      </section>

      <ScrollCoverStack {...args} pages={samplePages} />

      <section className="flex h-screen items-center justify-center bg-neutral-950 text-neutral-100">
        <p className="text-neutral-500">— 结束 —</p>
      </section>
    </div>
  ),
};

/** 默认四页堆叠 */
export const Default: Story = {
  args: {
    pages: samplePages,
  },
};
