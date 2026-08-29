import type { Meta, StoryObj } from '@storybook/react';

import { FeatureShowcase } from './index';
import { ModeDropdownMockup } from './mockups/ModeDropdownMockup';
import { PluginPanelMockup } from './mockups/PluginPanelMockup';
import { TrajectoryMockup } from './mockups/TrajectoryMockup';

const meta = {
  title: 'Components/FeatureShowcase',
  component: FeatureShowcase,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '深色主题产品特性展示页：左右分栏 + 纵向滚动叙事，右侧界面预览随滚动渐入并带视差与悬浮效果，可选自定义十字准星光标。内置 DeepSeek Harness 示例分栏，亦可通过 `sections` 完全自定义。',
      },
    },
  },
} satisfies Meta<typeof FeatureShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认：内置 DeepSeek Harness 三段式分栏 + 底部 CTA */
export const Default: Story = {};

/** 关闭自定义十字准星光标（使用系统光标） */
export const SystemCursor: Story = {
  args: { crosshairCursor: false },
};

/** 仅展示「插件管理」界面预览截图 */
export const PluginPanel: Story = {
  args: {
    sections: [
      {
        id: 'plugins',
        title: '插件管理',
        body: '设置面板中的插件市场：搜索、启停、查看状态。',
        visual: <PluginPanelMockup />,
      },
    ],
    footerTitle: '自定义你的 DeepSeek Harness',
  },
  parameters: { layout: 'padded' },
};

/** 仅展示「轨迹」调试界面预览截图 */
export const Trajectory: Story = {
  args: {
    sections: [
      {
        id: 'trajectory',
        title: 'Trajectory',
        body: '按来源查看每一次运行：系统提示、思维链、工具调用与子 Agent 调度。',
        visual: <TrajectoryMockup />,
      },
    ],
    footerTitle: '自定义你的 DeepSeek Harness',
  },
  parameters: { layout: 'padded' },
};

/** 仅展示「运行模式」下拉预览截图 */
export const ModeDropdown: Story = {
  args: {
    sections: [
      {
        id: 'modes',
        title: '运行模式',
        body: '标准 / PTC / 极简 / 创造——在不同场景下切换 Agent 能力边界。',
        visual: <ModeDropdownMockup />,
      },
    ],
    footerTitle: '自定义你的 DeepSeek Harness',
  },
  parameters: { layout: 'padded' },
};
