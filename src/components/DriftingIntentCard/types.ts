import type { ReactNode } from "react";

/** 单张漂浮小长条卡的数据 */
export interface DriftItem {
  /** 稳定唯一标识，用于 key 与循环复用 */
  id: string;
  /** 正文文字（必填） */
  label: string;
  /** 左侧图标（ReactNode 插槽）；缺省渲染占位圆点 */
  icon?: ReactNode;
  /** 选填标题：比正文字号相同、对比更强；不传则只显示正文 */
  title?: string;
  /** 标记为重要卡片：渲染为 3 张相同内容的堆叠组（错位层叠、错峰出现/消失） */
  important?: boolean;
}

export type DriftDensity = "sparse" | "normal" | "dense";

/** 在系统要求「减少动态效果」时的降级行为 */
export type ReduceMotionMode = "pause" | "static";

export interface DriftingIntentCardProps {
  /** 醒目标题（意图宣言），渲染在卡片顶部居中 */
  title: ReactNode;
  /** 解释意图的小卡片内容（如危害、要点等） */
  items: DriftItem[];
  /** 透传到根容器的类名 */
  className?: string;
  /** 容器宽度，默认 480（number 视为 px，也可传任意 CSS 长度字符串） */
  width?: number | string;
  /** 容器高度，默认 480（number 视为 px，也可传任意 CSS 长度字符串） */
  height?: number | string;
  /** 匀速漂移速度，单位 px/s，默认 60 */
  speed?: number;
  /** 流场密度（卡片数量），默认 normal */
  density?: DriftDensity;
  /** 纵向泳道数；不传则按 density 取默认值 */
  lanes?: number;
  /** 自定义小卡样式的类名钩子 */
  chipClassName?: string;
  /** 鼠标悬停时暂停漂浮，便于看清某条内容 */
  pauseOnHover?: boolean;
  /** 系统要求减少动态时的降级模式，默认 static（静态布局） */
  reduceMotion?: ReduceMotionMode;
}
