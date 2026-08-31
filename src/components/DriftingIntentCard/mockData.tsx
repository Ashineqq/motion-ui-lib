import type { DriftItem } from "./types";

/** 内联 SVG 图标插槽：调用方也可直接传 lucide / 任意 ReactNode */
function Glyph({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

/**
 * 示例数据：标题「这样做有什么危害」时，逐条飘过的危害。
 * 仅用于 Storybook 演示，真实业务可替换为任意 DriftItem[]。
 */
export const HARM_ITEMS: DriftItem[] = [
  {
    id: "leak",
    title: "数据泄露",
    label: "敏感信息可能被第三方获取与滥用，难以追回。",
    important: true,
    icon: (
      <Glyph d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    ),
  },
  {
    id: "lock",
    title: "账号被盗",
    label: "凭证泄露后，权限可能被他人长期掌控。",
    icon: (
      <Glyph d="M12 2a10 10 0 0 0-10 10v3a2 2 0 0 0 2 2h2v-5a6 6 0 0 1 12 0v5h2a2 2 0 0 0 2-2v-3A10 10 0 0 0 12 2Z" />
    ),
  },
  {
    id: "perf",
    title: "性能下降",
    label: "页面卡顿、加载变慢，体验明显劣化。",
    icon: <Glyph d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />,
  },
  {
    id: "debt",
    title: "技术债堆积",
    label: "改动成本越来越高，迭代速度持续走低。",
    icon: <Glyph d="M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
  },
  {
    id: "trust",
    title: "信任流失",
    label: "用户对你的产品逐渐失去信心与耐心。",
    icon: <Glyph d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />,
  },
  {
    id: "cost",
    title: "成本飙升",
    label: "运维与人力开销随问题扩散而快速上涨。",
    icon: <Glyph d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  },
  {
    id: "compat",
    title: "兼容崩坏",
    label: "旧设备与环境开始出现无法预期的异常。",
    icon: <Glyph d="M8 3 4 7v2a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V7l-4-4M3 11h18M12 7v10" />,
  },
  {
    id: "burn",
    title: "精力耗尽",
    label: "团队在救火中消耗，难以投入长期建设。",
    icon: (
      <Glyph d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />
    ),
  },
];
