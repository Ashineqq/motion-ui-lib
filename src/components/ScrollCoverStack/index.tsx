import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useMemo, useRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* 类型                                                                 */
/* ------------------------------------------------------------------ */

export interface CoverPage {
  /** 唯一标识 */
  id: string;
  /** 页面内容（任意 React 节点）；组件只负责滚动覆盖动画，不耦合业务 */
  children: ReactNode;
  /** 页面背景（CSS background 值）。不传则按默认渐变序列循环 */
  background?: string;
}

export interface ScrollCoverStackProps {
  /** 页面数组，按顺序从下往上“翻盖”堆叠（后一页盖住前一页） */
  pages: CoverPage[];
  /** 单页高度（CSS 尺寸），默认 '100vh'：滚一屏翻一页 */
  pageHeight?: string | number;
  /** 3D 透视距离(px)，越大越平缓，默认 1000 */
  perspective?: number;
  /** 离场收尾缩放，默认 0.7（对应源站 scale:0.7） */
  endScale?: number;
  /** 离场 X 轴后仰角(deg)，默认 40（对应源站 rotationX:40） */
  endRotateX?: number;
  /** 离场 Z 轴随机抖动幅度(deg)，默认 5（对应源站 rotationZ ±5）；传 0 关闭 */
  endRotateZJitter?: number;
  /** 收尾淡出起点（滚动进度 0~1），默认 0.6：后 40% 渐隐 */
  fadeStart?: number;
  /** 容器附加 className */
  className?: string;
}

/* 默认背景渐变序列（参考源站 .list 的 is-first..is-fourth 配色） */
const DEFAULT_GRADIENTS = [
  'linear-gradient(160deg, #f94a00, #fd7b03)',
  'linear-gradient(160deg, #48a3d1, #fd7b03)',
  'linear-gradient(160deg, #3a54ff, #7a67c5 23%, #fd7b03)',
  'linear-gradient(160deg, #9a0101, #fd7b03)',
];

function toSize(v: string | number | undefined, fallback: string): string {
  if (v == null) return fallback;
  return typeof v === 'number' ? `${v}px` : v;
}

/* ------------------------------------------------------------------ */
/* 单页                                                                 */
/* ------------------------------------------------------------------ */

interface CoverPageItemProps {
  page: CoverPage;
  index: number;
  pageHeight: string;
  perspective: number;
  endScale: number;
  endRotateX: number;
  endRotateZJitter: number;
  fadeStart: number;
  prefersReduced: boolean | null;
  isLast: boolean;
}

function CoverPageItem({
  page,
  index,
  pageHeight,
  perspective,
  endScale,
  endRotateX,
  endRotateZJitter,
  fadeStart,
  prefersReduced,
  isLast,
}: CoverPageItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  // progress: 0 → 1 覆盖“本页被钉住、直到下一页翻上来盖住”的整段滚动。
  // offset ['start start','end start'] 等价于源站 ScrollTrigger 的
  // pin: 内容包裹层 / start:'top 0%' / end:'+=innerHeight' / scrub:true。
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // 每张页一个固定的轻微随机 Z 轴抖动（确定性，避免重渲染跳动）
  const rotateZTarget = useMemo(
    () => (Math.random() - 0.5) * 2 * endRotateZJitter,
    [endRotateZJitter],
  );

  const scale: MotionValue<number> = useTransform(scrollYProgress, [0, 1], [1, endScale]);
  const rotateX: MotionValue<number> = useTransform(scrollYProgress, [0, 1], [0, endRotateX]);
  const rotateZ: MotionValue<number> = useTransform(scrollYProgress, [0, 1], [0, rotateZTarget]);
  const opacity: MotionValue<number> = useTransform(scrollYProgress, [fadeStart, 1], [1, 0]);

  const background = page.background ?? DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length];

  // 系统要求减少动态 / 末页（无后续页来盖它）时不播放离场动画
  const animated = !prefersReduced && !isLast;

  return (
    <div ref={ref} className="relative w-full" style={{ height: pageHeight }}>
      <motion.div
        className={cn('sticky top-0 flex w-full items-center justify-center overflow-hidden')}
        style={{
          height: pageHeight,
          zIndex: index + 1,
          background,
          transformPerspective: perspective,
          transformOrigin: 'center center',
          scale: animated ? scale : 1,
          rotateX: animated ? rotateX : 0,
          rotateZ: animated ? rotateZ : 0,
          opacity: animated ? opacity : 1,
          boxShadow:
            '0 30px 80px -20px rgba(0,0,0,0.45), 0 8px 24px -8px rgba(0,0,0,0.35)',
        }}
      >
        {page.children}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 容器                                                                 */
/* ------------------------------------------------------------------ */

/**
 * ScrollCoverStack —— 滚动翻盖堆叠。
 *
 * 复刻 fourmula.ai 首页 `.list` 区块的“下一页直接盖住上一页”效果：
 * 每一屏是一个 position:sticky 的整页，滚动时它先被钉在视口顶部，
 * 随后在 3D 空间里后仰(rotateX)、缩小(scale)并淡出，而下一屏从下方
 * 翻上来把它盖住，形成一叠卡片逐张压上的翻页质感。
 *
 * 纯 framer-motion 实现（useScroll + useTransform + sticky），
 * 无第三方滚动库依赖；尊重 prefers-reduced-motion 自动降级为静态堆叠。
 */
export function ScrollCoverStack({
  pages,
  pageHeight = '100vh',
  perspective = 1000,
  endScale = 0.7,
  endRotateX = 40,
  endRotateZJitter = 5,
  fadeStart = 0.6,
  className,
}: ScrollCoverStackProps) {
  const prefersReduced = useReducedMotion();
  const height = toSize(pageHeight, '100vh');

  return (
    <div className={cn('relative w-full', className)}>
      {pages.map((page, i) => (
        <CoverPageItem
          key={page.id}
          page={page}
          index={i}
          pageHeight={height}
          perspective={perspective}
          endScale={endScale}
          endRotateX={endRotateX}
          endRotateZJitter={endRotateZJitter}
          fadeStart={fadeStart}
          prefersReduced={prefersReduced}
          isLast={i === pages.length - 1}
        />
      ))}
    </div>
  );
}

export default ScrollCoverStack;
