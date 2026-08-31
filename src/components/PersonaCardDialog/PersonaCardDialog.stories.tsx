import type { Meta, StoryObj } from "@storybook/react";
import { PersonaCardDialog } from "./index";
import { PERSONAS } from "./mockData";

const meta = {
  title: "Components/PersonaCardDialog",
  component: PersonaCardDialog,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "卡片原地展开组件：两张人物卡（学习者/创作者），点击后卡片在原位展开——背景图上移缩小为装饰条，详情内容填入下方，无遮罩。",
      },
    },
  },
} satisfies Meta<typeof PersonaCardDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认：内置学习者/创作者两张人物卡 */
export const Default: Story = {
  args: {
    personas: PERSONAS,
  },
};

/** 自定义人物卡数据 */
export const CustomPersonas: Story = {
  args: {
    personas: [
      {
        key: "developer",
        title: "开发者",
        tagline: "快速原型开发",
        scenario:
          "你有一个新的项目想法，需要快速搭建原型验证可行性，但不想花太多时间在基础架构上。",
        features: [
          {
            label: "模板化启动",
            desc: "一键生成项目基础架构和常用组件",
          },
          {
            label: "实时预览",
            desc: "修改代码后自动更新预览，无需手动刷新",
          },
          {
            label: "组件库集成",
            desc: "内置常用 UI 组件，开箱即用",
          },
          {
            label: "类型安全",
            desc: "TypeScript 全类型覆盖，减少运行时错误",
          },
        ],
        flow: "选择模板 → 配置项目 → 开始编码 → 实时预览 → 部署上线",
      },
    ],
  },
};

/** 单张卡片 */
export const SingleCard: Story = {
  args: {
    personas: [PERSONAS[0]],
  },
};