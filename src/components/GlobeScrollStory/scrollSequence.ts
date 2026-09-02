import { PERSON_SPOTS, type PersonSpot } from '../GlobeAnimation/worldData';

/** 单条信号线的分镜状态（与 targets 一一对应） */
export interface ScrollLineState {
  /** 弧线生长进度 0..1 */
  progress: number;
  /** 是否已画完（目标小人开始弹跳/波纹） */
  targetActive: boolean;
}

/** 整幕滚动分镜的派生状态（由滚动进度 p 纯计算得出，无 React 依赖） */
export interface ScrollSceneState {
  /** 地球组水平位移（世界单位，向右为正；入场时从右侧滑入，结束后恒为 0） */
  globeX: number;
  /** 地球组绕 Y 轴角度（弧度；入场时从 50° 偏转回正，结束后恒为 0） */
  yaw: number;
  /** 地球点阵整体透明度 0..1（入场淡入，结束后恒为 1） */
  globeOpacity: number;
  /** 起源小人是否已弹出（弹跳 + 波纹） */
  srcActive: boolean;
  /** 对话框卡片是否已弹出 */
  dialogActive: boolean;
  /** 各目标连线状态，与 targets 一一对应 */
  lines: ScrollLineState[];
}

/* ───────────────────────── 分镜常数（调研定稿） ───────────────────────── */

/**
 * 入场结束进度：p ∈ [0, 0.42] 完成水平滑入 + 偏转回正 + 淡入。
 * 拉长后地球在右侧停留更久，从右往中间滑的语气更长更从容。
 */
export const ENTRY_END = 0.42;
/** 入场起始水平位移 = 85% 个视口宽（世界单位）：起点更靠右，滑动距离更长 */
export const ENTRY_SLIDE_VIEWPORT = 0.85;
/** 入场起始偏转角度（度，绕 Y 轴，随滚动回正到 0） */
export const ENTRY_YAW_DEG = 50;
/** 起源小人弹出进度（弹跳 + 波纹，紧随入场完成后） */
export const SRC_POP_AT = 0.44;
/** 对话框卡片弹出进度（紧随起源小人） */
export const DIALOG_POP_AT = 0.455;
/** 第 0 条线的起始进度 */
export const LINE_START_BASE = 0.47;
/** 每条线起始进度的递进间隔（信号段微压缩，给定格留空间） */
export const LINE_START_STEP = 0.06;
/** 每条线的生长窗口（进度差，画完即到 targetActive） */
export const LINE_WINDOW = 0.045;

/** 目标小人：PERSON_SPOTS 中 role==='target'，按原顺序（与 scripts 顺序一致） */
export const TARGETS: PersonSpot[] = PERSON_SPOTS.filter((s) => s.role === 'target');

/** 数值约束到 [0, 1] */
function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** 三次缓入缓出：入场位移/偏转/淡入的缓动曲线（滚动 tween 保持 linear，缓动在派生函数里做）。
 *  右侧段慢出发、慢收尾：地球在右侧缓缓显现并停留，再慢慢滑向中间。 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * 入场进度因子 e ∈ [0,1]：p∈[0,ENTRY_END] 内由缓入缓出曲线推进，超过后恒为 1。
 * 外层 DOM（画布容器）用它做 translateX 滑入 + opacity 淡入；
 * 3D 内部的 yaw 回正也用同一因子，保证滑入与回正同拍。
 */
export function entryFactor(p: number): number {
  return easeInOutCubic(clamp01(p / ENTRY_END));
}

/**
 * 由滚动进度 p 派生整幕分镜（纯函数）。
 *
 * 换算说明：入场水平位移以 R3F 的 viewport 宽度（z=0 平面的世界宽度，世界单位）
 * 为基准——`globeX = (1 - e) * 0.85 * viewportWidth`，即入场起始位置位于
 * 视口右缘外 85% 个视口宽处，随滚动缓入缓出滑向画面正中（0）。viewport.width 由
 * R3F 按容器尺寸与相机参数自动计算，resize 时自动保持正确，无需在组件里做
 * 像素 ↔ 世界单位的手动换算。
 *
 * 注意：globeX / globeOpacity 仅供类型与调试参考——组件实际用 entryFactor（缓入缓出）在
 * 外层 DOM（CSS translateX/opacity）完成滑入与淡入，3D 场景保持静态配置
 * （EarthGlobe opacity 恒 1），规避点阵着色器在透明度动画下的兼容性问题。
 *
 * @param p 滚动进度 0..1（ScrollTrigger scrub 驱动的代理值，线性）
 * @param viewportWidth R3F viewport 宽度（世界单位），入场位移以此为基准
 */
export function computeScrollSequence(p: number, viewportWidth: number): ScrollSceneState {
  // ── 入场（p ∈ [0, ENTRY_END]）：缓出滑入、偏转回正、点阵淡入 ──
  const e = entryFactor(p);
  // 从右（正 x）滑向 0：起始位移 = 55% 个 viewport 宽度（世界单位）
  const globeX = ENTRY_SLIDE_VIEWPORT * viewportWidth * (1 - e);
  // 偏转从 50° 回正（弧度）
  const yaw = (ENTRY_YAW_DEG * (1 - e) * Math.PI) / 180;
  const globeOpacity = e;

  // ── 起源小人 / 对话框：到达阈值即弹出，之后一直保持 ──
  const srcActive = p >= SRC_POP_AT;
  const dialogActive = p >= DIALOG_POP_AT;

  // ── 5 条信号线：逐条错峰生长 ──
  const lines: ScrollLineState[] = TARGETS.map((_, i) => {
    const start = LINE_START_BASE + i * LINE_START_STEP;
    const progress = clamp01((p - start) / LINE_WINDOW);
    return { progress, targetActive: progress >= 1 };
  });

  return { globeX, yaw, globeOpacity, srcActive, dialogActive, lines };
}
