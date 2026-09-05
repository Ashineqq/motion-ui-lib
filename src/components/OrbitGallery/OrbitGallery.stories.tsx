import type { Meta, StoryObj } from "@storybook/react";

import { OrbitGallery } from "./index";
import { ORBIT_ITEMS } from "./mockData";

const meta = {
  title: "Components/OrbitGallery",
  component: OrbitGallery,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "OrbitGallery：把「若干照片绕着中心元素匀速转圈」的动效抽象为可复用组件。轨道层整体绕圆心匀速旋转，每张照片以反向等速旋转保持正立，仅做公转；图片按 360/n 均匀分布，圆心可放任意元素。旋转由 useMotionValue + useAnimationFrame 驱动，悬停暂停无回弹。",
      },
    },
  },
  args: {
    items: ORBIT_ITEMS,
    size: 680,
    speed: 32,
    direction: "clockwise",
    itemSize: { width: 104, height: 128 },
    itemRadius: 16,
    spin: true,
    pauseOnHover: false,
  },
  argTypes: {
    direction: {
      control: "inline-radio",
      options: ["clockwise", "counterclockwise"],
    },
    size: { control: { type: "range", min: 320, max: 900, step: 20 } },
    speed: { control: { type: "range", min: 6, max: 80, step: 1 } },
    spin: { control: "boolean" },
    pauseOnHover: { control: "boolean" },
  },
} satisfies Meta<typeof OrbitGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认：8 张示例图绕中心占位方块顺时针匀速旋转（32s/圈，与原站点一致） */
export const Default: Story = {};

/** 逆时针旋转 */
export const CounterClockwise: Story = {
  args: { direction: "counterclockwise" },
};

/** 自定义圆心：把中心换成品牌 Logo / 标题等任意元素 */
export const CustomCenter: Story = {
  args: {
    center: (
      <div className="grid h-36 w-36 place-items-center rounded-full bg-neutral-900 px-6 text-center text-sm font-medium text-white">
        你的品牌
      </div>
    ),
  },
};

/** 更快的旋转节奏 */
export const Faster: Story = {
  args: { speed: 12 },
};

/** 悬停暂停：鼠标进入时停止旋转，方便看清某张图 */
export const PauseOnHover: Story = {
  args: { pauseOnHover: true },
};

/** 静态分布：不旋转，仅按角度排布（等同 reduce-motion 场景） */
export const Static: Story = {
  args: { spin: false },
};
