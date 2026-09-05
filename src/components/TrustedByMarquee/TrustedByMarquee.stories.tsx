import type { Meta, StoryObj } from "@storybook/react";

import { TrustedByMarquee } from "./index";
import { trustedByItems } from "./mockData";

const meta = {
  title: "Motions/TrustedByMarquee",
  component: TrustedByMarquee,
  parameters: { layout: "fullscreen" },
  args: {
    items: trustedByItems,
    label: "Trusted By",
    duration: 24,
    direction: "left",
    pauseOnHover: true,
    gap: 56,
    logoHeight: 28,
    labelWidth: 200,
    fadeWidth: 80,
    fadeEdges: "both",
  },
  argTypes: {
    duration: { control: { type: "range", min: 6, max: 60, step: 1 } },
    gap: { control: { type: "range", min: 16, max: 120, step: 4 } },
    logoHeight: { control: { type: "range", min: 16, max: 64, step: 2 } },
    labelWidth: { control: { type: "range", min: 0, max: 400, step: 10 } },
    fadeWidth: { control: { type: "range", min: 0, max: 240, step: 4 } },
    direction: { control: "inline-radio", options: ["left", "right"] },
    fadeEdges: { control: "inline-radio", options: ["both", "left", "right", "none"] },
    pauseOnHover: { control: "boolean" },
    label: { control: "text" },
  },
} satisfies Meta<typeof TrustedByMarquee>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认：标签在左、logo 序列向左无限滚动（悬停暂停） */
export const Default: Story = {
  render: (args) => (
    <div className="min-h-screen bg-white px-6 py-24">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <TrustedByMarquee {...args} />
      </div>
    </div>
  ),
};

/** 反向：logo 向右滚动 */
export const ScrollRight: Story = {
  args: { direction: "right" },
  render: (args) => (
    <div className="min-h-screen bg-neutral-900 px-6 py-24">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-sm">
        <TrustedByMarquee
          {...args}
          logoClassName="text-neutral-100/70"
          className="[&_span]:text-neutral-100"
        />
      </div>
    </div>
  ),
};
