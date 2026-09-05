import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

/** CSS 媒体查询 hook（组件内自足，不依赖外部） */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    mql.addListener(onChange);
    onChange();
    return () => mql.removeListener(onChange);
  }, [query]);
  return matches;
}

/* ------------------------------------------------------------------ */
/* 说明                                                                 */
/* ------------------------------------------------------------------ */
/*
 * 复刻自 lusion.co 首页首屏加载动画（preloader）：
 *  - 纯黑全屏幕布 + 左下角巨型三位计数器（Aeonik，桌面 clamp(7rem,8vw,20rem)，移动端 13vw）
 *  - 每位数字是"上下两枚堆叠数字"的结构，容器 translateY(±50%) 翻转滚动；
 *    数字值带指数平滑（1 - exp(-7·dt)），数字追进度"先快后慢"非常跟手
 *  - 显示进度 = 30% 初始化进度 + 70% 加载进度：
 *    先冲到 ~70% 短暂停顿（等"初始化"），随后快速补满 100
 *  - 揭示：白色对角线细线扫过（源站 TransitionOverlay 的 lineTransform）
 *    → 数字列逐位下滑退场 → 黑幕沿主对角线撕开、内容露出
 * 进度/数字/退场的参数与逐帧算法均按源站 `Preloader` 类逐行还原。
 */

/* ------------------------------------------------------------------ */
/* 源站参数                                                             */
/* ------------------------------------------------------------------ */

/** 显示进度追赶真实进度的速率：每帧 dt / 1s，计数器爬满至少 1 秒 */
const MIN_PRELOAD_DURATION = 1;
/** 初始化进度在显示进度中的权重，加载进度权重为 1 - 0.3 = 0.7 */
const PERCENT_BETWEEN_INIT_AND_START = 0.3;
/** 初始化进度从 0 追到 100% 所需秒数 */
const MIN_DURATION_BETWEEN_INIT_AND_START = 0.25;
/** 数字指数平滑系数（源站 1 - exp(-7·dt)） */
const EXP_SMOOTH = 7;
/** 数字列数量（三位数 000–100） */
const DIGIT_COUNT = 3;
/**
 * 单枚数字的行高（em）。
 * 源站为 .75em，是给自研字体 Aeonik 调校的；回退字体
 * （Inter/Helvetica/PingFang 等）字形更高，.75em 会裁掉字形下半部分，
 * 这里放宽到 1em 保证任意字体完整显示。滚动动画按百分比换算，不受影响。
 */
const DIGIT_LINE_HEIGHT = 1;

/** 源站 ease.expoInOut */
function expoInOut(x: number): number {
  if (x === 0) return 0;
  if (x === 1) return 1;
  x *= 2;
  return x < 1 ? 0.5 * Math.pow(1024, x - 1) : 0.5 * (-Math.pow(2, -10 * (x - 1)) + 2);
}

/** 源站 math.saturate */
function saturate(x: number): number {
  return Math.min(1, Math.max(0, x));
}

/* ------------------------------------------------------------------ */
/* 类型                                                                 */
/* ------------------------------------------------------------------ */

export interface PreloaderProps {
  /** 页面内容：加载完成、黑幕撕开时露出（淡入） */
  children?: ReactNode;
  /**
   * 无 tasks 时内置模拟进度爬满所需时长（秒），默认 1.2。
   * 模拟曲线先快后慢（power2.inOut），贴近真实资源加载体感。
   */
  minDuration?: number;
  /**
   * 真实加载任务数组：传入后计数器跟随任务的完成比例。
   * 显示层仍受 1s 最慢爬升速度约束，不会瞬间跳满。
   */
  tasks?: Promise<unknown>[];
  /** 计数到 100 后、开始揭示前的停顿（秒），默认 0.4 */
  settleDelay?: number;
  /** 揭示动画时长（秒），默认 1.2 */
  revealDuration?: number;
  /** 计数器/对角线细线颜色，默认 #ffffff */
  digitColor?: string;
  /**
   * 计数器字号（CSS 尺寸），默认桌面 `clamp(7rem, 8vw, 20rem)`、移动端 `13vw`。
   * 若外层容器空间有限（如固定高度盒子），可传更小的值（如 '5rem'）。
   */
  digitFontSize?: string;
  /** 幕布背景色，默认 #000000 */
  backgroundColor?: string;
  /** 揭示完成、内容淡入后触发一次（幂等） */
  onComplete?: () => void;
  /** 是否尊重系统 reduced-motion（直接跳过动画），默认 true */
  respectReducedMotion?: boolean;
  /** 容器附加 className */
  className?: string;
}

/* ------------------------------------------------------------------ */
/* 组件                                                                 */
/* ------------------------------------------------------------------ */

export function Preloader({
  children,
  minDuration = 1.2,
  tasks,
  settleDelay = 0.4,
  revealDuration = 1.2,
  digitColor = '#ffffff',
  digitFontSize,
  backgroundColor = '#000000',
  onComplete,
  respectReducedMotion = true,
  className,
}: PreloaderProps) {
  const prefersReduced = useReducedMotion();
  const reduced = respectReducedMotion && prefersReduced === true;
  /** 移动端（≤812px）计数器字号切到 13vw，忠实源站媒体查询 */
  const isNarrow = useMediaQuery('(max-width: 812px)');

  const [digitIndexes] = useState(() => Array.from({ length: DIGIT_COUNT }, (_, i) => i));
  const [overlayGone, setOverlayGone] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const digitsRef = useRef<HTMLDivElement>(null);
  const digitElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const maskTopRef = useRef<HTMLDivElement>(null);
  const maskBottomRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  /* 状态机（全部存 ref，避免 re-render） */
  const state = useRef({
    phase: 'idle' as 'idle' | 'counting' | 'settle' | 'reveal' | 'done',
    percentTarget: 0,
    percent: 0,
    percentToStart: 0,
    t: 0,
    n: 0,
    targetReached: false,
    settleTime: 0,
    revealTime: 0,
    completed: false,
    digitEased: [0, 0, 0] as number[],
    loadProxy: { p: 0 },
    proxyTween: null as ReturnType<typeof gsap.to> | null,
    ticker: null as (() => void) | null,
    resolved: 0,
  });

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const taskList = useMemo(() => tasks ?? [], [tasks]);

  useEffect(() => {
    const s = state.current;
    const root = rootRef.current;
    const digits = digitsRef.current;
    const content = contentRef.current;
    if (!root || !digits || !content) return;

    const ctx = gsap.context(() => {
      /* ---------------- 进度源 ---------------- */

      // 真实任务 → 按完成比例；无任务 → 模拟曲线（先快后慢）
      s.resolved = 0;
      if (taskList.length > 0) {
        taskList.forEach((p) => {
          p.then(
            () => {
              s.resolved += 1;
            },
            () => {
              s.resolved += 1;
            },
          );
        });
      } else {
        s.loadProxy = { p: 0 };
        if (reduced) {
          s.loadProxy.p = 1;
        } else {
          s.proxyTween = gsap.to(s.loadProxy, {
            p: 1,
            duration: Math.max(0.4, minDuration),
            ease: 'power2.inOut',
          });
        }
      }

      /* ---------------- reduced motion：直接快进 ---------------- */

      if (reduced) {
        s.phase = 'done';
        s.t = 1;
        s.n = 1;
        setOverlayGone(true);
        if (s.completed === false) {
          s.completed = true;
          onCompleteRef.current?.();
        }
        return;
      }

      /* ---------------- 逐帧更新（对齐源站 update(delta)） ---------------- */

      s.phase = 'counting';
      s.percent = 0;
      s.percentToStart = 0;
      s.t = 0;
      s.n = 0;
      s.digitEased = [0, 0, 0];
      s.targetReached = false;
      s.settleTime = 0;
      s.revealTime = 0;

      const ticker = () => {
        const dt = gsap.ticker.deltaRatio(60) / 60; // 归一化到 60fps 的秒

        // 1) percentTarget：真实任务 -> 完成比例；模拟 -> proxy 曲线
        if (taskList.length > 0) {
          s.percentTarget = s.resolved / taskList.length;
        } else {
          s.percentTarget = s.loadProxy.p;
        }
        if (s.percentTarget >= 1) s.targetReached = true;

        // 2) percent 以 1s 爬满的速率追赶 target（源站 MIN_PRELOAD_DURATION）
        s.percent = Math.min(
          s.percentTarget,
          s.percent + (s.percentTarget > s.percent ? dt : 0) / MIN_PRELOAD_DURATION,
        );

        // 3) 加载完成后，初始化进度 percentToStart 0→1（0.25s）
        if (s.targetReached) {
          s.percentToStart = Math.min(
            1,
            s.percentToStart + dt / MIN_DURATION_BETWEEN_INIT_AND_START,
          );
        }

        // 4) 显示进度 = 30% 初始化 + 70% 加载
        s.t =
          s.percentToStart * PERCENT_BETWEEN_INIT_AND_START +
          s.percent * (1 - PERCENT_BETWEEN_INIT_AND_START);

        // 5) 100% 后停顿 settleDelay，再进入揭示
        if (s.t >= 1 && s.phase === 'counting') {
          s.phase = 'settle';
          s.settleTime = 0;
        }
        if (s.phase === 'settle') {
          s.settleTime += dt;
          if (s.settleTime >= settleDelay) s.phase = 'reveal';
        }

        // 6) 揭示进度 n：0→1（线性时间，视觉缓动由 expoInOut 承担）
        if (s.phase === 'reveal') {
          s.revealTime += dt;
          s.n = saturate(s.revealTime / Math.max(0.1, revealDuration));
        }

        // 7) 推数字（源站算法）
        const len = DIGIT_COUNT;
        for (let a = 0; a < len; a++) {
          const el = digitElsRef.current[a];
          if (!el) continue;
          const nums = el.querySelectorAll<HTMLDivElement>('.motion-prel-num');
          // 该位在 000–100 中的目标值（百位/十位/个位）
          const c = Math.floor((s.t * 100) / Math.pow(10, len - a - 1));
          // 指数平滑追目标
          s.digitEased[a] += (c - s.digitEased[a]) * (1 - Math.exp(-EXP_SMOOTH * dt));
          if (c - s.digitEased[a] < 0.01) s.digitEased[a] = c;
          const u = s.digitEased[a] % 10;
          const f = Math.floor(u);
          const p = Math.ceil(u) % 10;
          const frac = u - f;
          // 揭示期数字列下滑退场（逐列错峰，源站 0.2 系数）。
          // 源站的下滑被其 canvas 盖层遮住，DOM 复刻里裸奔会被窗口底边"切片"，
          // 因此随下滑同步淡出，避免数字看起来被盒子裁掉半截
          const e = expoInOut(saturate(s.n * 1.2 - (0.2 * a) / (len - 1)));
          nums[0].textContent = String(f);
          nums[1].textContent = String(p);
          el.style.transform = `translateY(${-(frac - e) * 50}%) translateY(-0.05em)`;
          el.style.opacity = String(1 - e);
        }

        // 8) 揭示完成：卸载幕布、内容淡入、回调
        if (s.n >= 1 && !s.completed) {
          s.completed = true;
          s.phase = 'done';
          setOverlayGone(true);
          s.proxyTween?.kill();
          gsap.ticker.remove(ticker);
          s.ticker = null;
          gsap.to(content, {
            autoAlpha: 1,
            duration: 0.45,
            ease: 'power2.out',
            onComplete: () => onCompleteRef.current?.(),
          });
        }
      };
      s.ticker = ticker;
      gsap.ticker.add(ticker);

      /* ---------------- 揭示动画（白线扫过 + 幕布撕开） ---------------- */

      // 白色对角线细线，对应源站 TransitionOverlay 的 lineTransform：计数完成后即扫过
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0, autoAlpha: 0 },
        {
          scaleX: 1.6,
          autoAlpha: 1,
          duration: 0.7,
          ease: 'expo.inOut',
          delay: settleDelay + 0.15,
          overwrite: 'auto',
        },
      );

      // 黑幕沿主对角线撕开：右上三角向左上退、左下三角向右下退，露出内容
      const maskDuration = Math.max(0.4, revealDuration * 0.85);
      gsap.fromTo(
        maskTopRef.current,
        { yPercent: 0, xPercent: 0 },
        {
          yPercent: -108,
          xPercent: 14,
          duration: maskDuration,
          ease: 'expo.inOut',
          delay: settleDelay + 0.45,
          overwrite: 'auto',
        },
      );
      gsap.fromTo(
        maskBottomRef.current,
        { yPercent: 0, xPercent: 0 },
        {
          yPercent: 108,
          xPercent: -14,
          duration: maskDuration,
          ease: 'expo.inOut',
          delay: settleDelay + 0.45,
          overwrite: 'auto',
        },
      );
    }, rootRef);

    return () => {
      ctx.revert();
      if (s.ticker) gsap.ticker.remove(s.ticker);
      s.ticker = null;
    };
    // tasks/时长变化时整体重播；reduced 变化同理（挂载后一般不变）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskList, minDuration, settleDelay, revealDuration, reduced]);

  /* ---------------- 渲染 ---------------- */

  const digitsStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    bottom: 0,
    display: 'flex',
    // 关键：flex item 必须保持自身内容高度（两枚数字 = 2 × 行高），
    // 不能用默认的 stretch——stretch 会把数字列压扁成窗口高度，
    // translateY 的 % 基准随之减半，整数进位时会出现"半叠 + 跳变"的坏滚动。
    alignItems: 'flex-start',
    justifyContent: 'center',
    // 源站：#preloader-percent-digits { font-size: clamp(7em, 8vw, 20em) }，≤812px 时 13vw
    fontSize: digitFontSize ?? (isNarrow ? '13vw' : 'clamp(7rem, 8vw, 20rem)'),
    // 窗口高度 = 一行行高：源站 .75em 专为 Aeonik 调校，回退字体需 1em 才不裁字形
    height: `${DIGIT_LINE_HEIGHT}em`,
    lineHeight: `${DIGIT_LINE_HEIGHT}em`,
    color: digitColor,
    overflow: 'hidden',
    fontFamily:
      "'Aeonik', 'Helvetica Neue', 'Inter', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif",
    fontWeight: 400,
    letterSpacing: '-0.03em',
  };

  return (
    <div
      ref={rootRef}
      className={cn('relative', className)}
      style={{
        // 加载期：fixed 全屏盖层（源站 z-index 200）；完成后还原为普通块容器
        position: overlayGone ? 'relative' : 'fixed',
        inset: overlayGone ? undefined : 0,
        zIndex: overlayGone ? undefined : 200,
        backgroundColor: overlayGone ? 'transparent' : backgroundColor,
      }}
      data-motion-prel-root
    >
      {/* 页面内容层：揭示时淡入 */}
      <div
        ref={contentRef}
        className="relative"
        style={{ opacity: reduced ? 1 : 0, visibility: reduced ? 'visible' : 'hidden' }}
      >
        {children}
      </div>

      {/* 黑幕幕布（盖在内容层上，遮罩期间拦截点击） */}
      {!overlayGone && (
        <div
          aria-hidden
          className="absolute inset-0 overflow-hidden"
          style={{ zIndex: 10 }}
          data-motion-prel-overlay
        >
          {/* 右上三角 + 左下三角：沿主对角线撕开 */}
          <div
            ref={maskTopRef}
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
              backgroundColor,
            }}
          />
          <div
            ref={maskBottomRef}
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
              backgroundColor,
            }}
          />

          {/* 白色对角线细线 */}
          <div
            ref={lineRef}
            className="absolute"
            style={{
              top: '50%',
              left: '50%',
              width: '160vw',
              height: 1,
              backgroundColor: digitColor,
              transform: 'translate(-50%, -50%) rotate(-45deg)',
              transformOrigin: 'center',
              // 初始隐藏，由 GSAP fromTo 的 autoAlpha/scaleX 驱动（React style 无 scaleX 属性）
              opacity: 0,
            }}
          />

          {/* 巨型计数器 */}
          <div ref={digitsRef} style={digitsStyle} data-motion-prel-digits>
            {digitIndexes.map((i) => (
              <div
                key={i}
                ref={(el) => {
                  digitElsRef.current[i] = el;
                }}
                className="motion-prel-digit"
                style={{
                  position: 'relative',
                  float: 'left',
                  width: '1ch',
                  textAlign: 'center',
                  transform: 'translateY(-0.05em)', // 源站基线微调
                }}
              >
                <div className="motion-prel-num">0</div>
                <div className="motion-prel-num">0</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Preloader;