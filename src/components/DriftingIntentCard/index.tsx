"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type { DriftingIntentCardProps, DriftItem } from "./types";

/* 密度 → 纵向泳道数 × 每道卡片数 */
const DENSITY: Record<
  NonNullable<DriftingIntentCardProps["density"]>,
  { lanes: number; perLane: number }
> = {
  sparse: { lanes: 3, perLane: 2 },
  normal: { lanes: 4, perLane: 3 },
  dense: { lanes: 5, perLane: 4 },
};

const TOP_PAD = 8; // 顶部留白
const CHIP_H = 72; // 小卡预估高度，用于纵向分布边界
const STACK_DX = 6; // 重要卡堆叠：每张向右露出的像素
const STACK_DY = 20; // 重要卡堆叠：每张向下露出的像素（约一个图标高）
const STACK_STAGGER = 0.15; // 重要卡三张出现/消失的错峰间隔（秒）；越小越像一个整体
const IMPORTANT_SPEED = 40; // 重要卡漂移速度（固定 px/s，与普通卡速度解耦）
const MAX_IMPORTANT_STACKS = 1; // 重要堆叠组最多几组：超出的重要项降级为普通卡，避免出现多组堆叠互相重叠
const TITLE_TOP_RATIO = 0.15; // 标题距顶部高度占比（上移，给上方留出卡片通道）
const TITLE_H = 40; // 标题估算高度，用于避开其中段带

/* 确定性伪随机：保证每次渲染分布一致，不会抖动 */
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface PlacedChip extends DriftItem {
  key: string;
  phase: number; // 0..1 横向漂移相位（同一堆叠组共享，整体一起漂）
  y: number; // px 纵向位置
  xOffset: number; // 堆叠时相对基准的横向偏移
  z: number; // 层叠顺序（堆叠组 10+k，确保在普通卡之上且组内 0<1<2）
  transDur: number; // 出现/消失的缩放过渡时长（秒）
  visDur: number; // 可见停留时长（秒）
  invDur: number; // 不可见停留时长（秒）
  visDelay: number; // 可见性节律的随机相位（秒）；堆叠组内按 k 递增实现错峰
  important: boolean; // 是否属于重要堆叠组
  chipSpeed: number; // 该卡漂移速度（px/s），重要卡更慢
}

/** 根据 items 循环复用，铺满指定密度的流场。
 *  普通项 → 单卡；important 项 → 3 张相同卡片组成的堆叠组（左上→右下阶梯偏移，错峰出现/消失）。 */
function buildChips(
  items: DriftItem[],
  lanes: number,
  perLane: number,
  height: number,
  speed: number,
): PlacedChip[] {
  const count = lanes * perLane;
  const rand = mulberry32(count * 2654435761 + items.length * 40503);
  // 顶部区（标题之上，供卡片从标题上方飘过）与底部区（标题之下），均避开标题中段带
  const topLanes = 1; // 标题上方只放一排卡片
  const titleTop = height * TITLE_TOP_RATIO;
  const overflow = CHIP_H * 0.5; // 允许溢出容器的量，超出部分由 overflow-hidden 裁切（不渲染）
  const topBottom = titleTop - 16 - CHIP_H; // 卡片底部不越过标题
  const topRegion = {
    top: Math.min(TOP_PAD - overflow, topBottom), // 可向上溢出容器（被裁切）
    bottom: topBottom,
  };
  const botRegion = {
    top: titleTop + TITLE_H + 16,
    bottom: height - CHIP_H + overflow, // 可向下溢出容器（被裁切）
  };
  const out: PlacedChip[] = [];
  let importantStacksEmitted = 0; // 已生成的重要堆叠组数量，用于限制上限
  for (let i = 0; i < count; i++) {
    const base = items[i % items.length];
    const lane = i % lanes;
    // 重要项超出上限时降级为普通卡：避免出现多组堆叠互相重叠（如循环取数导致同一重要项出现多次）
    const important = !!base.important && importantStacksEmitted < MAX_IMPORTANT_STACKS;
    // 重要堆叠组固定放在标题下方；普通卡按泳道分到上/下两区，避开标题
    const inTop = important ? false : lane < topLanes;
    const region = inTop ? topRegion : botRegion;
    const lanesInBand = inTop ? topLanes : Math.max(lanes - topLanes, 1);
    const laneInBand = inTop ? lane : lane % lanesInBand;
    const regionH = Math.max(region.bottom - region.top, CHIP_H);
    const laneH2 = regionH / lanesInBand;
    const y =
      region.top +
      laneInBand * laneH2 +
      (laneH2 - CHIP_H) / 2 +
      (rand() - 0.5) * Math.min(laneH2 - CHIP_H, 12);

    const transDur = 0.15 + rand() * 0.1; // 缩放过渡 0.15–0.25s（≈0.2s，更快 + 回弹更明显）
    const visDur = 4 + rand() * 3; // 可见停留 4–7s
    const invDur = 1.5 + rand() * 2.5; // 不可见停留 1.5–4s
    const visDelay = rand() * 0.6; // 初始错峰上限（秒）：小而随机即可让开场约 0.6s 内错峰铺满，不长时间空场；
    // 真正的不整齐划一由每张卡随机的 visDur/invDur（周期各异）随时间自然错开保证

    // 普通卡横向相位：同一区内按 slot 均匀错开，保证同行卡片间距恒定、不扎堆；
    // 不同泳道加一个相位偏移，避免纵向对齐。
    const slot = Math.floor(i / lanes);
    const lanePhase = (lane * 0.137) % 1;
    const normalPhase = ((slot / perLane) + lanePhase + rand() * 0.03) % 1;

    if (important) {
      importantStacksEmitted++;
      // 重要卡：3 张相同内容堆叠，共享漂移相位，整体以固定 50px/s 漂移（与普通卡速度解耦）；
      // 三张同时可见（呈阶梯堆叠），仅以 visDelay+k*STACK_STAGGER 做轻微错峰级联（第 1 张先、第 3 张后）
      const phase = rand();
      const stackY = Math.min(y, height - TOP_PAD - CHIP_H - 2 * STACK_DY); // 留出堆叠高度，避免底部裁切
      for (let k = 0; k < 3; k++) {
        out.push({
          ...base,
          key: `${base.id}-stack-${k}`,
          phase,
          y: stackY + k * STACK_DY,
          xOffset: k * STACK_DX,
          z: 10 + k,
          transDur,
          visDur,
          invDur,
          visDelay: visDelay + k * STACK_STAGGER, // 第 1 张先、第 3 张后
          important: true,
          chipSpeed: IMPORTANT_SPEED, // 固定 50px/s，与普通卡速度无关
        });
      }
    } else {
      out.push({
        ...base,
        key: `${base.id}-${i}`,
        phase: normalPhase,
        y,
        xOffset: 0,
        z: 0,
        transDur,
        visDur,
        invDur,
        visDelay,
        important: false,
        chipSpeed: speed,
      });
    }
  }
  return out;
}

function DefaultGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <circle cx="12" cy="12" r="5" fill="currentColor" />
    </svg>
  );
}

/* 单张卡片向外暴露的运行时句柄，供父级做碰撞检测 */
interface ChipHandle {
  x: MotionValue<number>;
  y: number;
  w: number;
  h: number;
  important: boolean;
  disappearFast: () => void;
}

/* ───────── 单张漂浮小卡 ───────── */
function DriftChip({
  item,
  containerW,
  staticMode,
  paused,
  chipClassName,
  register,
}: {
  item: PlacedChip;
  containerW: number;
  staticMode: boolean;
  paused: boolean;
  chipClassName?: string;
  register?: (key: string, handle: ChipHandle | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [chipW, setChipW] = useState(0);
  const [chipH, setChipH] = useState(0);
  const progress = useMotionValue(0);
  // x 由 progress 经取模映射：progress 在 [0,1] 循环时，(p+phase)%1 在回跳点处两侧都为 phase，
  // 故横向位置连续无缝、且两端都落在可视区之外 → 无限循环无“回跳”。phase 决定开场分散位（无空场）。
  // 叠加 xOffset：重要卡堆叠组各张的阶梯横向错位
  const x = useTransform(progress, (p) => {
    const pp = (p + item.phase) % 1;
    return pp * (containerW + chipW) - chipW + item.xOffset;
  });
  // 可见性脉冲：各自独立、随机相位的“由小长到大—停留—由大缩到小—停留”循环，
  // 驱动 scale，使卡片在不定时、不定位置由中心果断地出现 / 消失；与横向漂移解耦。
  const vis = useMotionValue(0);
  const xControls = useRef<AnimationPlaybackControls | null>(null);
  const visControls = useRef<AnimationPlaybackControls | null>(null);
  const deadRef = useRef(false); // 碰撞后正在消失/重生，避免重复触发
  const mountedRef = useRef(true);

  // 用 ref 持有最新尺寸，保证 disappearFast 回调身份稳定且不读过期值
  const containerWRef = useRef(containerW);
  containerWRef.current = containerW;
  const chipWRef = useRef(chipW);
  chipWRef.current = chipW;

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  // 测量自身尺寸，用于计算完整穿越距离与碰撞盒
  useLayoutEffect(() => {
    if (ref.current) {
      setChipW(ref.current.offsetWidth);
      setChipH(ref.current.offsetHeight);
    }
  }, [item.label]);

  // 横向漂移：progress 在 [0,1] 循环（取模映射保证无缝、无回跳）；开场 progress=0 →
  // pp=phase → 卡片已分散在场内（无空场）。使用 item.chipSpeed：重要卡固定 50px/s、普通卡受 speed 控制。
  useEffect(() => {
    if (staticMode || containerW <= 0) return;
    const period = (containerW + chipW) / item.chipSpeed;
    progress.set(0);
    xControls.current = animate(progress, [0, 1], {
      duration: period,
      ease: "linear",
      repeat: Infinity,
    });
    return () => xControls.current?.stop();
  }, [progress, item.phase, containerW, chipW, item.chipSpeed, staticMode]);

  // 可见性脉冲：每张卡独立、随机相位的“由中心长大出现 / 缩小消失”（scale），
  // 因此出现/消失彼此错开、不整齐划一。与横向漂移完全解耦（漂移已用取模保证无缝，无需同步节律）。
  useEffect(() => {
    if (staticMode || containerW <= 0) return;
    const fade = item.transDur;
    const total = fade + item.visDur + fade + item.invDur;
    const tIn = fade / total;
    const tHold = (fade + item.visDur) / total;
    const tOut = (fade + item.visDur + fade) / total;
    vis.set(0);
    visControls.current = animate(vis, [0, 1, 1, 0, 0], {
      duration: total,
      times: [0, tIn, tHold, tOut, 1],
      ease: ["backOut", "linear", "backIn", "linear"],
      repeat: Infinity,
      delay: item.visDelay,
    });
    return () => visControls.current?.stop();
  }, [vis, item.transDur, item.visDur, item.invDur, item.visDelay, staticMode]);

  // 悬停暂停 / 恢复（漂移与可见性同步暂停）
  useEffect(() => {
    [xControls.current, visControls.current].forEach((c) => {
      if (!c) return;
      if (paused) c.pause();
      else c.play();
    });
  }, [paused]);

  // 碰撞后：极短停留(mock) → 快速缩小消失 → 从左侧重新进入，保持流场不空
  const disappearFast = useCallback(() => {
    if (deadRef.current || !mountedRef.current) return;
    deadRef.current = true;
    xControls.current?.stop();
    visControls.current?.stop();
    window.setTimeout(() => {
      if (!mountedRef.current) return;
      animate(vis, 0, { duration: 0.12, ease: "backIn" });
      window.setTimeout(() => {
        if (!mountedRef.current) return;
        const period = (containerWRef.current + chipWRef.current) / item.chipSpeed;
        // 从左侧屏外重新进入（取模下 progress=(1-phase)%1 → pp=0 → 屏外左），避免立刻再次相撞
        progress.set((1 - item.phase) % 1);
        xControls.current = animate(progress, [0, 1], {
          duration: period,
          ease: "linear",
          repeat: Infinity,
        });
        // 可见性节律独立、随机相位，与漂移解耦
        const fade = item.transDur;
        const total = fade + item.visDur + fade + item.invDur;
        const tIn = fade / total;
        const tHold = (fade + item.visDur) / total;
        const tOut = (fade + item.visDur + fade) / total;
        vis.set(0);
        visControls.current = animate(vis, [0, 1, 1, 0, 0], {
          duration: total,
          times: [0, tIn, tHold, tOut, 1],
          ease: ["backOut", "linear", "backIn", "linear"],
          repeat: Infinity,
          delay: item.visDelay,
        });
        deadRef.current = false;
      }, 250);
    }, 100);
  }, [vis, progress, item.chipSpeed, item.transDur, item.visDur, item.invDur, item.visDelay, item.phase]);

  // 注册到父级碰撞系统
  useEffect(() => {
    register?.(item.key, {
      x,
      y: item.y,
      w: chipW,
      h: chipH,
      important: item.important,
      disappearFast,
    });
    return () => register?.(item.key, null);
  }, [register, item.key, item.y, chipW, chipH, item.important, disappearFast]);

  const staticX = staticMode
    ? item.phase * Math.max(containerW - chipW, 0) + item.xOffset
    : 0;

  return (
    <motion.div
      ref={ref}
      style={{
        x: staticMode ? staticX : x,
        scale: staticMode ? 1 : vis,
        top: item.y,
        zIndex: item.z,
        transformOrigin: "center",
        willChange: "transform",
      }}
      className={cn(
        "absolute left-0 flex w-fit max-w-[250px] flex-col items-start gap-1 rounded-xl border border-dashed border-slate-100 bg-white/90 px-3 py-2.5",
        chipClassName,
      )}
    >
      <span className="flex size-5 shrink-0 items-center justify-center text-slate-400">
        {item.icon ?? <DefaultGlyph />}
      </span>
      {item.title && (
        <p className="text-sm font-semibold leading-snug text-[#303030]">
          {item.title}
        </p>
      )}
      <p className="text-xs leading-snug text-[#90A2B9]">{item.label}</p>
    </motion.div>
  );
}

/* ───────── 主组件 ───────── */
export function DriftingIntentCard({
  title,
  items,
  className,
  width = 480,
  height = 480,
  speed = 80,
  density = "normal",
  lanes,
  chipClassName,
  pauseOnHover = false,
  reduceMotion = "static",
}: DriftingIntentCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hovering, setHovering] = useState(false);
  const prefersReduced = useReducedMotion();

  const staticMode = useMemo(() => {
    if (!prefersReduced) return false;
    // 系统要求减少动态效果时，两种降级模式都渲染静态布局
    return reduceMotion === "pause" ? true : true;
  }, [prefersReduced, reduceMotion]);

  const cfg = DENSITY[density];
  const laneCount = lanes ?? cfg.lanes;

  // 运行时注册表：每张卡把自身的位置句柄交给父级，用于碰撞检测
  const registry = useRef<Map<string, ChipHandle>>(new Map());
  const registerChip = useCallback((key: string, handle: ChipHandle | null) => {
    if (handle) registry.current.set(key, handle);
    else registry.current.delete(key);
  }, []);

  // 测量容器尺寸，驱动循环距离与纵向分布
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ width: r.width, height: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const chips = useMemo(
    () =>
      size.height
        ? buildChips(items, laneCount, cfg.perLane, size.height, speed)
        : [],
    [items, laneCount, cfg.perLane, size.height, speed],
  );

  // 碰撞检测：普通卡与重要卡（堆叠组任一张）重叠 → 普通卡极快消失并从左侧重生
  useEffect(() => {
    if (staticMode) return;
    let raf = 0;
    const loop = () => {
      const regs = registry.current;
      const normals: ChipHandle[] = [];
      const imps: ChipHandle[] = [];
      regs.forEach((h) => (h.important ? imps.push(h) : normals.push(h)));
      for (const n of normals) {
        const nx = n.x.get();
        const ny = n.y;
        for (const im of imps) {
          const ix = im.x.get();
          if (
            nx < ix + im.w &&
            nx + n.w > ix &&
            ny < im.y + im.h &&
            ny + n.h > im.y
          ) {
            n.disappearFast();
            break;
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [staticMode, registry]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900",
        className,
      )}
      style={{ width, height }}
      onMouseEnter={pauseOnHover ? () => setHovering(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setHovering(false) : undefined}
    >
      {/* 顶部柔和暗角，为标题区增加层次 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(0,0,0,0.05),transparent)]" />

      {/* 标题层：下移到约 26% 高度，给上方留出卡片通道；位于漂浮层之下，被遮时也仅有极小交叠 */}
      <div
        className="absolute inset-x-0 z-10 flex justify-center px-6"
        style={{ top: `${TITLE_TOP_RATIO * 100}%` }}
      >
        <h3
          className="text-center text-2xl font-bold tracking-tight sm:text-3xl"
          style={{
            textShadow:
              "0 0 18px rgba(255,255,255,0.95), 0 1px 4px rgba(255,255,255,1)",
          }}
        >
          {title}
        </h3>
      </div>

      {/* 漂浮层（在标题之上，半透明、可互相遮挡） */}
      <div className="absolute inset-0 z-20">
        {chips.map((c) => (
          <DriftChip
            key={c.key}
            item={c}
            containerW={size.width}
            staticMode={staticMode}
            paused={hovering}
            chipClassName={chipClassName}
            register={registerChip}
          />
        ))}
      </div>
    </div>
  );
}

export type {
  DriftingIntentCardProps,
  DriftItem,
  DriftDensity,
  ReduceMotionMode,
} from "./types";
