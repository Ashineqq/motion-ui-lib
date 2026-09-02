import type { ReactNode } from 'react';

import type { GlobeDialogCard, GlobeReduceMotionMode } from '../GlobeAnimation/types';

// 滚动分镜的派生状态类型定义在 scrollSequence.ts（纯函数模块），在此重导出
export type { ScrollLineState, ScrollSceneState } from './scrollSequence';

export interface GlobeScrollStoryProps {
  /** 陆地点的颜色（点阵颜色），默认 '#f97316' */
  landColor?: string;
  /** 陆地点的渲染尺寸（px），默认 2.0 */
  landDotSize?: number;
  /** 信号连线颜色，默认取 landColor */
  lineColor?: string;
  /** 信号连线宽度（px），默认 2 */
  lineWidth?: number;
  /** 自定义小人插槽 */
  personIcon?: ReactNode;
  /** 内置小人的颜色，默认 '#475569' */
  personColor?: string;
  /** 对话框卡片（左侧弹出）；不传则不渲染 */
  dialogCard?: GlobeDialogCard;
  /** 地球画布尺寸：数字视为 px，字符串视为 CSS 长度；默认 'min(72vmin, 560px)' */
  globeSize?: number | string;
  /** 动效篇章滚动距离（视口倍数），默认 1.6（即 end: '+=160%'） */
  scrollDistance?: number;
  /** 系统减弱动态时的降级模式，默认 'static'（渲染定格画面、不锁滚动） */
  reduceMotion?: GlobeReduceMotionMode;
  /** 透传到根容器的类名 */
  className?: string;
}
