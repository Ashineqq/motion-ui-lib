import type { ReactNode } from "react";

/** 单张 logo 的数据 */
export interface LogoMarqueeItem {
  /** 稳定唯一标识，用于 React key（无缝循环时内部会自动复制一份） */
  id: string;
  /**
   * logo 节点，通常用内联 `<svg fill="currentColor">`。
   * 颜色继承容器 `currentColor`（默认 `text-neutral-900/60`），便于随主题切换。
   */
  logo: ReactNode;
  /** 无障碍标签：传入时该 logo 会被当作图片朗读；不传则视为装饰性、加 `aria-hidden` */
  alt?: string;
}

export type TrustedByDirection = "left" | "right";

/** 系统要求「减少动态效果」时的降级行为 */
export type TrustedByReduceMotionMode = "pause" | "static";

export interface TrustedByMarqueeProps {
  /** 左侧标签文案，默认 "Trusted By" */
  label?: ReactNode;
  /** 滚动的 logo 序列（必填）；无缝循环时内部会自动复制一份拼接在后面 */
  items: LogoMarqueeItem[];
  /** 根容器附加 className */
  className?: string;
  /** 单个 logo 序列从起点滚到终点（即一整轮）所需秒数，默认 24 */
  duration?: number;
  /** 滚动方向，默认 "left"（向左） */
  direction?: TrustedByDirection;
  /** 鼠标悬停时暂停滚动、移出恢复，默认 false（与源站一致） */
  pauseOnHover?: boolean;
  /** 相邻 logo 之间的水平间距（px），默认 56 */
  gap?: number;
  /** logo 高度（px），默认 28 */
  logoHeight?: number;
  /** 左侧标签列宽度（px），默认 200 */
  labelWidth?: number;
  /** logo 容器附加 className（可覆盖默认颜色 / 透明度） */
  logoClassName?: string;
  /** 边缘淡出宽度（px）：logo 滚到视口边缘时逐渐隐入背景，默认 80（贴近原站 ~86px） */
  fadeWidth?: number;
  /**
   * 边缘淡出作用边，默认 "both"（左、右都淡出，与原站一致）。
   * "left" 只淡出左侧（logo 滚出左缘处消失），"right" 只淡出右侧，
   * "none" 关闭淡出（硬裁切）。
   */
  fadeEdges?: "both" | "left" | "right" | "none";
  /** 系统要求减少动态时的降级模式，默认 "pause"（停在原位、不滚动） */
  reduceMotion?: TrustedByReduceMotionMode;
}
