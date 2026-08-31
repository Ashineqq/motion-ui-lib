import type { Meta, StoryObj } from '@storybook/react';

import { GlobeAnimation } from './index';

const meta = {
  title: 'Components/GlobeAnimation',
  component: GlobeAnimation,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '3D 点阵地球右旋演出：地球正面左上的起源小人向全球 5 个固定陆地点发出信号，弧线动画逐条生长到目标点，来源/目标小人与连线在转到地球背面时淡出；整段演出循环重播（loop），系统要求减少动态时降级为完整静态画面（起源/目标小人、弧线与对话框全部展示，无运动）。',
      },
    },
  },
  args: {
    landColor: '#f97316',
    diameter: 480,
    rotationSpeed: 8,
    loop: true,
    dialogCard: {
      title: '总结好了',
    },
  },
  argTypes: {
    landColor: { control: 'color' },
    personColor: { control: 'color' },
    rotationSpeed: { control: { type: 'range', min: 1, max: 30, step: 1 } },
    diameter: { control: { type: 'range', min: 320, max: 640, step: 20 } },
    landDotSize: { control: { type: 'range', min: 1, max: 4, step: 0.2 } },
    loop: { control: 'boolean' },
    dialogCard: {
      control: 'object',
      description: '对话框卡片内容（title/content 可编辑；不传则不渲染卡片）',
    },
  },
} satisfies Meta<typeof GlobeAnimation>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认：橙色点阵地球、起源小人发信号到 5 个陆地点、带对话框卡片、循环演出。 */
export const Default: Story = {};

/** 紧凑：直径 360。 */
export const Compact: Story = {
  args: { diameter: 360, rotationSpeed: 8 },
};

/** 无对话框：不传 dialogCard，仅演示起源小人 + 5 条信号连线的生长与淡出。 */
export const NoDialog: Story = {
  args: { dialogCard: undefined },
};
