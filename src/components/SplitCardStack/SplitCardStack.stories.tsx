import type { Meta, StoryObj } from '@storybook/react';

import { SplitCardStack } from './index';
import type { SplitCard } from './index';

/** 示例卡片：左右队列按奇偶自动分配，验证三阶段交互 */
const sampleCards: SplitCard[] = [
  {
    id: 'c1',
    title: 'The Loom of Time',
    body: '织机声里，年轮层层缠绕成经纬。每一次穿梭都让过去与未来在梭尖相遇，织出一匹从未重复的锦。',
    extra: (
      <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800/10 bg-neutral-900/5 px-2 py-0.5 font-mono tracking-wide">
        ✦ CH.01
      </span>
    ),
  },
  {
    id: 'c2',
    title: 'Cartographer of Clouds',
    body: '云不是天的涂鸦，而是风的笔迹。他追着积雨云航行十年，只为在一张泛黄的海图上，标出每片云回头的渡口。',
    extra: (
      <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800/10 bg-neutral-900/5 px-2 py-0.5 font-mono tracking-wide">
        ✦ CH.02
      </span>
    ),
  },
  {
    id: 'c3',
    title: 'The Last Lighthouse',
    body: '灯塔熄灭那天，海面升起一层薄雾。守塔人没有离开，他在雾里点了一盏小灯，等一艘知道光在何处的船。',
  },
  {
    id: 'c4',
    title: 'Moonlit Script',
    body: '古卷在月光下显露出墨迹的纹路，像退潮后的沙滩。学者小心誊写，每落一笔，滩上便多一颗发亮的沙粒。',
    extra: (
      <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800/10 bg-neutral-900/5 px-2 py-0.5 font-mono tracking-wide">
        ✦ CH.04
      </span>
    ),
  },
  {
    id: 'c5',
    title: 'Winter Archive',
    body: '档案馆只收藏冬天：结霜的窗、冻住的时间、以及雪地上未被踩过的第一行脚印。管理员说，这里没有夏天，只有迟迟不化的记忆。',
    extra: (
      <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800/10 bg-neutral-900/5 px-2 py-0.5 font-mono tracking-wide">
        ✦ CH.05
      </span>
    ),
  },
];

const meta = {
  title: 'Components/SplitCardStack',
  component: SplitCardStack,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '三阶段卡片交互：初始左右分列堆叠 → 点击任意卡片全局收拢并定向抽入置顶 → 居中详情浏览（右侧固定控制面板），支持关闭复位。',
      },
    },
  },
  argTypes: {
    height: { control: { type: 'range', min: 400, max: 800, step: 20 } },
    cardWidth: { control: { type: 'range', min: 220, max: 340, step: 10 } },
    cardHeight: { control: { type: 'range', min: 300, max: 460, step: 10 } },
  },
} satisfies Meta<typeof SplitCardStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cards: sampleCards,
    height: 620,
  },
};

/** 卡片仅含标题（不传正文与附加内容时对应区域不渲染） */
export const MinimalCards: Story = {
  args: {
    height: 620,
    cards: [
      { id: 'm1', title: 'Only a Title' },
      { id: 'm2', title: 'Serif Whisper' },
      { id: 'm3', title: 'Quiet Note' },
      { id: 'm4', title: 'Bare Chapter' },
    ],
  },
};

/** 更多卡片（左右队列各 4 张），验证队列纵向堆叠密度 */
export const ManyCards: Story = {
  args: {
    height: 680,
    cards: [
      ...sampleCards,
      {
        id: 'c6',
        title: 'Paper Lanterns',
        body: '纸灯顺河而下，灯里的火在风里摇晃，却始终不灭，像一句没有被说出口的告别。',
      },
      {
        id: 'c7',
        title: 'Salt & Starlight',
        body: '潮汐把星光卷进贝壳，又吐回沙滩。拾贝人只捡那些会回响的，说它们记得海的歌。',
      },
      {
        id: 'c8',
        title: 'The Unwritten',
        body: '空白页不是等待，而是另一种书写。墨水在纸下漫游，等一个敢留白的人。',
      },
    ],
  },
};
