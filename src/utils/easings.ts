/**
 * 缓动曲线配置（framer-motion `ease` 支持的四点三次贝塞尔数组）。
 * 组件内动画统一从这里取，避免散落的魔法数字。
 */
export const EASINGS = {
  /** 平滑缓出（easeOutCubic 近似），适合入场 */
  smooth: [0.22, 1, 0.36, 1] as const,
  /** 弹性缓出，适合强调 / 回弹 */
  spring: [0.34, 1.56, 0.64, 1] as const,
  /** 标准缓入缓出 */
  standard: [0.4, 0, 0.2, 1] as const,
  /** 快速缓入，适合退场 / 关闭 */
  enter: [0.12, 0, 0.39, 0] as const,
} as const;

export type EasingName = keyof typeof EASINGS;
