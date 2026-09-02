'use client';

import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { GlobeScrollStory } from './index';

/**
 * story 外层页面包装：前导段落（35vh）→ 滚动篇章（GlobeScrollStory）→ 后续段落（45vh），
 * 用真实页面滚动验证 ScrollTrigger 的 pin 锁定与篇章结束后的 pin 释放。
 * 根容器 overflowX hidden，防止入场水平位移（55% 视口宽）产生横向滚动条。
 */
function StoryPage({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* 前导段落：先于篇章的普通内容 */}
      <section
        style={{
          height: '35vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          textAlign: 'center',
        }}
      >
        <h1 className="text-2xl font-semibold text-[#303030]">滚动查看：全球信号同步</h1>
        <p className="text-sm text-[#90A2B9]">
          向下滚动进入篇章：地球从右侧滑入回正，起源小人与全球 5 个信号点逐条连线点亮。
        </p>
      </section>

      {/* 篇章本体：内部自带 100vh 锁定 + scrollDistance 视口的滚动距离 */}
      {children}

      {/* 后续段落：验证 pin 释放后恢复普通页面滚动 */}
      <section
        style={{
          height: '45vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <p className="text-sm text-[#90A2B9]">篇章结束，继续滚动即恢复正常页面</p>
      </section>
    </div>
  );
}

const meta = {
  title: 'Components/GlobeScrollStory',
  component: GlobeScrollStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '滚动驱动的 3D 地球信号篇章（GSAP ScrollTrigger + React Three Fiber）。页面滚动经过「1.6 视口高度」时锁定 100vh 篇章：入场阶段（进度 0–0.42）地球从右侧 85% 画布宽的位置缓入缓出滑向居中（右侧段停留更久）、50° 偏转回正、整体淡入；随后起源小人（0.44）与左侧对话框（0.455）先后弹出；5 条信号弧线自 0.47 起每条递进 0.06、在 0.045 的生长窗口内画完并点亮对应目标小人，约 0.755 全部完成，之后定格至篇章结束。篇章结束后自动解除 pin，恢复普通页面滚动。系统要求减少动态时（reduceMotion）降级为定格静态场景：完整展示地球、起源/目标小人与满弧线，不创建 ScrollTrigger、不锁定滚动。',
      },
    },
  },
  args: {
    landColor: '#f97316',
    globeSize: 'min(72vmin, 560px)',
    scrollDistance: 1.6,
    dialogCard: {
      title: '总结好了',
    },
  },
  argTypes: {
    landColor: { control: 'color' },
    personColor: { control: 'color' },
    globeSize: { control: 'text' },
    scrollDistance: { control: { type: 'range', min: 1, max: 2.5, step: 0.1 } },
    landDotSize: { control: { type: 'range', min: 1, max: 4, step: 0.2 } },
    dialogCard: {
      control: 'object',
      description: '对话框卡片内容（title/content 可编辑；不传则不渲染卡片）',
    },
  },
  // 统一包一层页面外壳：前导段落 + 篇章 + 后续段落
  render: (args) => (
    <StoryPage>
      <GlobeScrollStory {...args} />
    </StoryPage>
  ),
} satisfies Meta<typeof GlobeScrollStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认：橙色点阵地球滚动篇章，起源小人发信号到 5 个陆地点，带对话框卡片，滚动距离 1.6 视口。 */
export const Default: Story = {};

/** 紧凑：画布固定 420px。 */
export const Compact: Story = {
  args: { globeSize: 420 },
};

/** 无对话框：不传 dialogCard，仅演示起源小人触发 + 5 条信号连线的逐条生长。 */
export const NoDialog: Story = {
  args: { dialogCard: undefined },
};
