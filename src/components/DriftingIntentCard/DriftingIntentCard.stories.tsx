import type { Meta, StoryObj } from "@storybook/react";

import { DriftingIntentCard } from "./index";
import { HARM_ITEMS } from "./mockData";

const meta = {
  title: "Components/DriftingIntentCard",
  component: DriftingIntentCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "意图飘动卡：顶部居中的醒目标题宣言意图，卡片内多张半透明小长条卡（左图标右文字）以统一速度从左向右匀速循环漂浮，可遮挡标题、也可互相遮挡。小卡用于逐条解释标题背后的内容（如「危害」）。",
      },
    },
  },
  args: {
    title: "这样做有什么危害",
    items: HARM_ITEMS,
    speed:60,
    density: "normal",
    width: 480,
    height: 480,
    pauseOnHover: false,
  },
  argTypes: {
    density: {
      control: "inline-radio",
      options: ["sparse", "normal", "dense"],
    },
    speed: { control: { type: "range", min: 20, max: 160, step: 5 } },
    width: { control: { type: "range", min: 240, max: 720, step: 20 } },
    height: { control: { type: "range", min: 240, max: 720, step: 20 } },
  },
} satisfies Meta<typeof DriftingIntentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认：标题「这样做有什么危害」+ 飘过的危害小卡 */
export const Default: Story = {};

/** 更密集的流场，标题被更频繁地掠过 */
export const Dense: Story = {
  args: { density: "dense", title: "为什么要重视代码评审" },
};

/** 悬停暂停：鼠标进入卡片时漂浮停下，方便逐条阅读 */
export const PauseOnHover: Story = { args: { pauseOnHover: true } };
