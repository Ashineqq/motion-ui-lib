import type { ReactNode } from 'react';

/** 起点小人左侧弹出的对话框卡片内容（通过组件 props 传入） */
export interface GlobeDialogCard {
  /** 卡片标题 */
  title: string;
  /** 卡片正文（可省略，仅标题时卡片更紧凑） */
  content?: string;
  /** 可选图标插槽 */
  icon?: ReactNode;
}

/** 系统要求减少动态效果时的降级行为（与库内其他组件保持一致） */
export type GlobeReduceMotionMode = 'pause' | 'static';

export interface GlobeAnimationProps {
  /** 陆地点的颜色（点阵颜色），默认 "#f97316"（橙色系） */
  landColor?: string;
  /** 陆地点的渲染尺寸（px），默认 2.0 */
  landDotSize?: number;
  /** 地球直径（px），默认 480（容器更大，弧线/线头不越界） */
  diameter?: number;
  /** 向右自旋速度（度/秒），默认 8（慢速，便于阅读） */
  rotationSpeed?: number;
  /** 信号连线颜色，默认取 landColor */
  lineColor?: string;
  /** 信号连线宽度（px），默认 2（部分显卡渲染为 1px，以线头光点补充粗细感） */
  lineWidth?: number;
  /** 起点小人的对话框卡片内容（不传则不渲染卡片） */
  dialogCard?: GlobeDialogCard;
  /** 自定义小人插槽；缺省使用内置的简洁小人 SVG（圆头 + 圆润身体） */
  personIcon?: ReactNode;
  /** 内置小人的颜色，默认 "#475569" */
  personColor?: string;
  /** 是否循环整段演出：地球持续右旋，起源小人回到正面后自动重播；默认 true */
  loop?: boolean;
  /** 容器宽度（number 视为 px，也可传任意 CSS 长度字符串），默认等于 diameter */
  width?: number | string;
  /** 容器高度（number 视为 px，也可传任意 CSS 长度字符串），默认等于 diameter */
  height?: number | string;
  /** 透传到根容器的类名 */
  className?: string;
  /** 系统要求减少动态时的降级模式，默认 "static" */
  reduceMotion?: GlobeReduceMotionMode;
}
