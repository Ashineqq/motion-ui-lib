import { motion, useAnimation } from 'framer-motion';
import type { TargetAndTransition } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EASINGS } from '@/utils/easings';

/* ------------------------------------------------------------------ */
/* 数据结构                                                             */
/* ------------------------------------------------------------------ */

export interface SplitCard {
  /** 唯一标识 */
  id: string;
  /** 标题（必填） */
  title: string;
  /** 正文（可选，不传不渲染） */
  body?: string;
  /** 其他附加内容（可选，不传不渲染） */
  extra?: ReactNode;
}

export interface SplitCardStackProps {
  /** 卡片数据数组 */
  cards: SplitCard[];
  /** 舞台容器附加 className */
  className?: string;
  /** 组件宽度（CSS 尺寸），默认 '100%'：占满父容器（页面主体时即整屏宽度） */
  width?: string;
  /** 舞台高度（px），默认 600 */
  height?: number;
  /** 卡片宽度（px）。默认 = 组件宽度的 50%（组件 100% 时即屏幕宽度的一半）；不传则响应式跟随 */
  cardWidth?: number;
  /** 卡片高度（px）。默认 = cardWidth 的 3/4（保持 4:3 宽高比） */
  cardHeight?: number;
}

/* ------------------------------------------------------------------ */
/* 常量                                                                */
/* ------------------------------------------------------------------ */

/** 左右列中心相对舞台中心的横向偏移系数（相对卡片宽度），保证相邻卡在中间轻微交叠 */
const COL_X_RATIO = 0.3;
/** 列内横向抖动幅度（px） */
const X_JITTER = 18;
/** 纵向错落抖动幅度（px） */
const Y_JITTER = 14;
/** 单张卡片最大旋转角度（度），模拟纸张随意散落 */
const MAX_ROTATE = 15;
/** 卡片纵向步进系数（相对卡片高度）：前一张压住后一张上部，标题区露出 */
const ROW_GAP = 0.45;
/** 收拢堆时置顶卡片的 z-index（远高于普通卡片） */
const TOP_Z = 50;

/** 第三阶段堆叠姿态表（按窗口位次 k = 0..3）：角度（位置偏移随卡片尺寸动态计算） */
const STACK_TILT = 5; // 堆叠相邻卡片的旋转角度（度）
const STACK_ANGLE = [0, STACK_TILT, STACK_TILT * 2, -STACK_TILT] as const;

type Mode = 'spread' | 'stacked';
type Side = 'left' | 'right';

/** 确定性伪随机数：相同 seed 输出恒定（避免重渲染时布局跳动），范围 [-1, 1] */
function scatter(seed: number): number {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (v - Math.floor(v)) * 2 - 1;
}

/** 每张卡片的目标姿态：与 framer-motion animate 直接兼容 */
type Pose = TargetAndTransition;

/* ------------------------------------------------------------------ */
/* 图标（内联 SVG，随主题色渲染）                                        */
/* ------------------------------------------------------------------ */

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ArrowIcon({ direction, className }: { direction: 'up' | 'down'; className?: string }) {
  const d = direction === 'up' ? 'M12 19V5M5 12l7-7 7 7' : 'M12 5v14M5 12l7 7 7-7';
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* 卡片面                                                                */
/* ------------------------------------------------------------------ */

interface CardFaceProps {
  title: string;
  body?: string;
  extra?: ReactNode;
  showDetail: boolean;
}

function CardFace({ title, body, extra, showDetail }: CardFaceProps) {
  const contentCls = cn(
    'transition-[filter,opacity] duration-500',
    showDetail ? 'opacity-100 blur-none' : 'opacity-70 blur-[5px]',
  );

  return (
    <div className="relative flex h-full w-full flex-col rounded-2xl border border-neutral-900/10 bg-[#f7f2e9] p-6 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)]">
      {/* 其他附加内容：卡片上方（不传则留白） */}
      {extra && <div className={cn('text-xs text-neutral-500', contentCls)}>{extra}</div>}

      {/* 中部留白，让标题/正文贴底，模拟纸张下方书写区 */}
      <div className="flex-1" />

      {/* 底部：标题在左下角，正文在右下角 */}
      <div className="flex items-end justify-between gap-4">
        <h3 className="font-serif text-3xl font-semibold leading-snug tracking-wide text-neutral-800">
          {title}
        </h3>
        {body && (
          <p
            className={cn(
              'max-w-[55%] text-right text-sm leading-relaxed text-neutral-600',
              contentCls,
            )}
          >
            {body}
          </p>
        )}
      </div>

      {/* 顶部附加内容模糊淡出 */}
      {!showDetail && extra && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 rounded-t-2xl bg-gradient-to-b from-[#f7f2e9] to-transparent" />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 单张卡片（显式动画控制，保证往返切换也重放抽离/抽出动画）              */
/* ------------------------------------------------------------------ */

interface CardMotionProps {
  pose: Pose;
  animateKey: number;
  duration: number;
  card: SplitCard;
  side: Side;
  mode: Mode;
  isActive: boolean;
  cardWidth: number;
  cardHeight: number;
  onOpen: (id: string, side: Side) => void;
}

function CardMotion({
  pose,
  animateKey,
  duration,
  card,
  side,
  mode,
  isActive,
  cardWidth,
  cardHeight,
  onOpen,
}: CardMotionProps) {
  const controls = useAnimation();
  const mountedRef = useRef(false);
  // 始终保存最新 pose，动画仅由 animateKey 驱动（避免无关 render / 视口变化触发重放）
  const poseRef = useRef(pose);
  poseRef.current = pose;

  useEffect(() => {
    // 首帧直接放置（无动画）；之后每次 animateKey 变化显式 start，
    // 绕开 framer 对相同 target 的去重，确保「切下一页→切上一页」这类往返切换一定重放动画
    if (!mountedRef.current) {
      controls.set(poseRef.current);
      mountedRef.current = true;
    } else {
      controls.start(poseRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 由 animateKey 驱动，pose 经 ref 读取最新值
  }, [animateKey]);

  return (
    <motion.div
      role="button"
      tabIndex={mode === 'spread' ? 0 : -1}
      aria-label={card.title}
      aria-expanded={isActive || undefined}
      onClick={() => onOpen(card.id, side)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(card.id, side);
        }
      }}
      className={cn('absolute left-1/2 top-1/2 select-none', mode === 'spread' && 'cursor-pointer')}
      style={{
        width: cardWidth,
        height: cardHeight,
        marginLeft: -cardWidth / 2,
        marginTop: -cardHeight / 2,
      }}
      animate={controls}
      transition={{ duration, ease: EASINGS.smooth, times: [0, 0.4, 1] }}
      whileHover={mode === 'spread' ? { scale: 1.03, transition: { duration: 0.25 } } : undefined}
      whileTap={mode === 'spread' ? { scale: 0.98 } : undefined}
    >
      <CardFace title={card.title} body={card.body} extra={card.extra} showDetail={isActive} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* 主组件                                                                */
/* ------------------------------------------------------------------ */

export function SplitCardStack({
  cards,
  className,
  width = '100%',
  height = 600,
  cardWidth,
  cardHeight,
}: SplitCardStackProps) {
  const [mode, setMode] = useState<Mode>('spread');
  const [activeId, setActiveId] = useState<string | null>(null);
  // 本次抽离方向：入场时按卡片归属左右（左向左、右向右）；阶段3切换固定从左侧
  const enterDirRef = useRef<-1 | 1>(-1);
  // 切换轮换记录：被换下/换上的卡片角色由「上一次 activeIndex + 切换方向」判定
  const prevActiveRef = useRef(-1);
  const switchDirRef = useRef<'next' | 'prev' | null>(null);

  // 容器宽度测量：卡片宽度默认 = 组件宽度 50%，随窗口/容器尺寸响应式变化
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const lastWidthRef = useRef(0);
  // 视口高度：第三阶段容器收拢到视口高度 → 页面不滚动、卡片居中
  const [viewportHeight, setViewportHeight] = useState<number>(() =>
    typeof window === 'undefined' ? 800 : window.innerHeight,
  );
  // 动画触发键：每次需要重放卡片动画时递增（切换 / 收拢 / 复位 / 容器宽度变化）
  const [animateKey, setAnimateKey] = useState(0);
  const bumpAnimate = () => setAnimateKey((k) => k + 1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setContainerWidth((prev) => (prev === w ? prev : w));
      // 仅在宽度真正变化时触发动画：容器高度过渡（入场收拢 / 复位散开）
      // 会逐帧触发 ResizeObserver，若不拦截会导致卡片动画被反复重启、永远收不完
      if (w !== lastWidthRef.current) {
        lastWidthRef.current = w;
        bumpAnimate();
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 解析卡片尺寸：未显式传入时，宽 = 组件宽 50%（测量前用 360 兜底），高 = 宽 3/4（4:3）
  const resolvedCardWidth =
    cardWidth ?? (containerWidth > 0 ? Math.round(containerWidth * 0.5) : 360);
  const resolvedCardHeight = cardHeight ?? Math.round(resolvedCardWidth * 0.75);

  const stepY = resolvedCardHeight * ROW_GAP;
  const colX = Math.round(resolvedCardWidth * COL_X_RATIO);
  // 抽离最远点：卡片中心拉到 colX + 1.15 卡宽处，保证该点与堆内卡片完全脱离（无重叠）
  const pullX = colX + Math.round(resolvedCardWidth * 1.15);
  // 堆叠位置偏移：全部为 0 —— 收拢后卡片堆完全居中（水平 + 垂直）
  const stackPos = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];

  // 散列阶段卡片的纵向占用：Z 字形瀑布总跨度 + 上下留白（含旋转/抖动余量）。
  // 传入的 height 只作为下限，不足时自动抬高，避免卡片被 overflow-hidden 裁剪。
  const minHeight = Math.ceil((cards.length - 1) * stepY + resolvedCardHeight + 64);

  const activeIndex = cards.findIndex((c) => c.id === activeId);

  // 动画时长：统一 0.9s（入场收拢 / 复位散开 / 阶段3切换保持同一平缓节奏）
  const animDuration = 0.9;

  const handleOpen = (id: string, side: Side) => {
    if (mode !== 'spread') return;
    // 入场：左侧队列的卡向左抽出，右侧队列的卡向右抽出
    enterDirRef.current = side === 'left' ? -1 : 1;
    switchDirRef.current = null;
    prevActiveRef.current = -1;
    bumpAnimate();
    setActiveId(id);
    setMode('stacked');
  };

  const handleClose = () => {
    // 记录当前顶层卡（第三阶段正在浏览的卡），并立即把页面定位到它在散列布局中的最终位置
    const targetId = activeId;
    bumpAnimate();
    setMode('spread');
    setActiveId(null);
    if (targetId && containerRef.current) {
      const targetIndex = cards.findIndex((c) => c.id === targetId);
      // 该卡在散列布局中的最终纵向位置（相对容器中心，与 buildPose 的 spread 分支保持一致）
      const relY =
        (targetIndex - (cards.length - 1) / 2) * stepY + scatter(targetIndex * 13 + 5) * Y_JITTER;
      // 最终容器中心 = 容器顶部 + minHeight/2（容器顶部不随高度变化）
      const containerTop = containerRef.current.getBoundingClientRect().top + window.scrollY;
      const targetCenter = containerTop + minHeight / 2 + relY;
      // 等 React 渲染（容器高度已到位）后再滚动，避免 smooth 滚动被内容高度变化打断
      requestAnimationFrame(() => {
        window.scrollTo({ top: targetCenter - window.innerHeight / 2, behavior: 'smooth' });
      });
    }
  };

  const handlePrev = () => {
    enterDirRef.current = -1; // 阶段3切换统一从左侧抽出
    switchDirRef.current = 'prev';
    prevActiveRef.current = activeIndex;
    bumpAnimate();
    setActiveId(cards[(activeIndex - 1 + cards.length) % cards.length].id);
  };

  const handleNext = () => {
    enterDirRef.current = -1; // 阶段3切换统一从左侧抽出
    switchDirRef.current = 'next';
    prevActiveRef.current = activeIndex;
    bumpAnimate();
    setActiveId(cards[(activeIndex + 1) % cards.length].id);
  };

  /** 计算单张卡片的目标姿态（散列 / 收拢置顶） */
  const buildPose = (index: number, side: Side): Pose => {
    // 阶段1：初始布局 —— Z 字形交错瀑布：第 1 张在左、第 2 张在右、第 3 张在左……
    // 每张依次下移，前一张压住后一张上部（z-index 递减），标题在左下角，全部露出。
    if (mode === 'spread') {
      const dirX = side === 'left' ? -1 : 1;
      return {
        x: dirX * colX + scatter(index * 7 + 1) * X_JITTER,
        y: (index - (cards.length - 1) / 2) * stepY + scatter(index * 13 + 5) * Y_JITTER,
        rotate: scatter(index * 29 + 9) * MAX_ROTATE,
        scale: 1,
        opacity: 1,
        zIndex: cards.length - index, // 前面的卡在上，压住后面的卡
      };
    }

    // 阶段2/3：收拢堆叠。堆内只显示 4 张（环形窗口，从置顶卡起数 4 张）：
    //   位 1（顶层）摆正 0°；位 2 顺时针 10°；位 3 顺时针 20°；位 4 向左（逆时针）10°。
    // 切下一页：顶层抽出移向堆尾、持续缩小到尺寸归零；原 2、3 号左转 10°，原 4 号右转 30°，新顶层摆正。
    // 切上一页：堆底（位 4）抽出上浮、由 3/4 大小放大恢复原尺寸；原 1、2 号右转 10°，原 3 号左转 30°，顶层摆正。
    // 抽出方向：入场时按卡片归属左右（左向左、右向右），阶段3切换统一从左侧；抽离点与堆完全脱离。
    const n = cards.length;
    const k = (index - (activeIndex % n) + n) % n;
    const enterDir = enterDirRef.current;
    // 切下一页：被抽出的旧顶层（可能已移出窗口）优先执行「抽离拉开 → 移至堆尾 → 持续缩小到最小」动画
    const isRetiring = switchDirRef.current === 'next' && index === prevActiveRef.current;
    if (isRetiring) {
      return {
        x: [null, enterDir * pullX, stackPos[3].x],
        y: [null, -70, stackPos[3].y],
        rotate: [0, -8, -STACK_TILT],
        // 前段（拉开）保持原尺寸，后段（移向堆尾）持续缩小，归位时缩到最小
        scale: [1, 1, 0],
        opacity: 1,
        zIndex: 1,
      };
    }
    const inWindow = k < Math.min(4, n);
    if (!inWindow) {
      return { x: 0, y: 0, rotate: 0, scale: 0.6, opacity: 0, zIndex: -1 };
    }
    if (k === 0) {
      // 切下一页：第二张卡片直接归正（平滑转正到 0°、居中、满尺寸），不做抽离绕行
      if (switchDirRef.current === 'next') {
        return { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, zIndex: TOP_Z };
      }
      // 入场 / 切上一页：顶层有「抽离 → 放入」动画，归位后摆正
      const fromPrev = switchDirRef.current === 'prev';
      return {
        x: [null, enterDir * pullX, 0],
        y: [null, -70, 0],
        rotate: [null, -8, 0],
        scale: fromPrev ? [0.75, 0.9, 1] : [null, 0.9, 1],
        // 从窗口外进入（prev 且 n>4）时 opacity 随拉开段 0→1 快速显现，归位瞬间已全显
        opacity: [null, 1, 1],
        zIndex: TOP_Z,
      };
    }
    // 其余窗口内卡片：直接补间到新位姿态（角度/位置随位次变化；静止时所有卡片同尺寸）
    return {
      x: stackPos[k].x,
      y: stackPos[k].y,
      rotate: STACK_ANGLE[k],
      scale: 1,
      opacity: 1,
      zIndex: 4 - k,
    };
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-visible rounded-3xl bg-[#a79dba]', className)}
      style={{
        width,
        // 展开态 = 散列总高（可上下滚动）；收拢态 = 视口高度（页面不滚动、卡片居中）。
        // 高度不做 CSS 过渡：避免关闭后滚动定位被内容高度变化打断
        height: mode === 'stacked' ? viewportHeight : Math.max(height, minHeight),
      }}
    >

      {cards.map((card, index) => {
        const side: Side = index % 2 === 0 ? 'left' : 'right';
        const isActive = mode === 'stacked' && card.id === activeId;
        const pose = buildPose(index, side);

        return (
          <CardMotion
            key={card.id}
            pose={pose}
            animateKey={animateKey}
            duration={animDuration}
            card={card}
            side={side}
            mode={mode}
            isActive={isActive}
            cardWidth={resolvedCardWidth}
            cardHeight={resolvedCardHeight}
            onOpen={handleOpen}
          />
        );
      })}

      {/* 阶段3：右侧固定竖向悬浮控制面板（不跟随卡片动画） */}
      {mode === 'stacked' && (
        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: EASINGS.smooth, delay: 0.2 }}
          className="absolute top-1/2 right-6 z-[60] flex -translate-y-1/2 flex-col items-center gap-3"
          aria-label="卡片浏览控制面板"
        >
          <Button
            size="icon"
            onClick={handleClose}
            aria-label="关闭，返回初始布局"
            className="size-11 rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <XIcon className="size-4" />
          </Button>
          <div className="my-1 h-px w-6 bg-white/15" />
          <Button
            size="icon"
            onClick={handlePrev}
            aria-label="上一张"
            className="size-10 rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <ArrowIcon direction="up" className="size-4" />
          </Button>
          <Button
            size="icon"
            onClick={handleNext}
            aria-label="下一张"
            className="size-10 rounded-full border border-white/10 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <ArrowIcon direction="down" className="size-4" />
          </Button>
        </motion.aside>
      )}
    </div>
  );
}
