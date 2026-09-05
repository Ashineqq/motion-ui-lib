"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { LogoMarqueeItem, TrustedByMarqueeProps } from "./types";

/**
 * 复刻自 fourmula.ai 首页底部「Trusted By」动画：
 *  - 左侧标签 + 右侧一条无限向左滚动的 logo 序列
 *  - 原站用两条完全相同的 `.how__bottom-row`，各跑 `@keyframes marquee { translateX(0 → -100%) }`，
 *    靠「第二份在循环复位瞬间与第一份内容重合」实现无缝衔接。
 *  - 这里用纯 CSS 等价实现（更贴近原站、且不依赖 JS 帧循环）：轨道内把 `items` 渲染两份，
 *    平移 `-50%`（即恰好一份的宽度）并从 `repeat: infinite` 循环 → 第二份始终与第一份内容一致，无跳变。
 *  - logo 以 `currentColor` 着色（源站为 rgb(2,1,8) 64% 透明度的灰黑 wordmark）。
 */

/** 系统级「减少动态效果」偏好（纯 matchMedia，避免依赖动画库的帧循环） */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function TrustedByMarquee({
  label = "Trusted By",
  items,
  className,
  duration = 24,
  direction = "left",
  pauseOnHover = false,
  gap = 56,
  logoHeight = 28,
  labelWidth = 200,
  logoClassName,
  fadeWidth = 80,
  fadeEdges = "both",
}: TrustedByMarqueeProps) {
  const [hovering, setHovering] = useState(false);
  const prefersReduced = usePrefersReducedMotion();
  const animate = !prefersReduced;
  // reduceMotion 仅描述降级模式；两种模式在系统要求减少动态时都停在原位（与库内其他组件一致）

  const trackStyle: CSSProperties | undefined = animate
    ? {
        animation: `trusted-by-marquee ${duration}s linear infinite`,
        animationDirection: direction === "right" ? "reverse" : "normal",
        animationPlayState:
          pauseOnHover && hovering ? "paused" : "running",
      }
    : undefined;

  // 边缘淡出遮罩（复刻原站 .how__bottom-gr-left/right 的渐隐）：
  // 用 mask-image 而非颜色渐变覆盖层——不依赖背景色，深/浅背景都能正确隐入。
  const mask =
    fadeEdges === "none"
      ? undefined
      : fadeEdges === "left"
        ? `linear-gradient(to right, transparent 0, #000 ${fadeWidth}px)`
        : fadeEdges === "right"
          ? `linear-gradient(to right, #000 calc(100% - ${fadeWidth}px), transparent 100%)`
          : `linear-gradient(to right, transparent 0, #000 ${fadeWidth}px, #000 calc(100% - ${fadeWidth}px), transparent 100%)`;
  const viewportStyle: CSSProperties | undefined = mask
    ? { WebkitMaskImage: mask, maskImage: mask }
    : undefined;

  const renderSet = (prefix: string, hidden: boolean) =>
    items.map((it: LogoMarqueeItem) => (
      <div
        key={`${prefix}-${it.id}`}
        className={cn(
          "flex h-full shrink-0 items-center text-neutral-900/60",
          logoClassName,
        )}
        style={{ height: logoHeight, paddingRight: gap }}
        role={it.alt ? "img" : undefined}
        aria-label={it.alt}
        aria-hidden={hidden || (it.alt ? undefined : true)}
      >
        {it.logo}
      </div>
    ));

  return (
    <div
      className={cn("flex w-full items-center font-sans", className)}
      onMouseEnter={
        pauseOnHover
          ? () => setHovering(true)
          : undefined
      }
      onMouseLeave={
        pauseOnHover
          ? () => setHovering(false)
          : undefined
      }
    >
      {/* 左侧标签列 */}
      <div className="shrink-0 px-6 py-6" style={{ width: labelWidth }}>
        <span className="whitespace-nowrap text-[15px] font-normal text-neutral-900">
          {label as ReactNode}
        </span>
      </div>

      {/* 右侧无限滚动视口（边缘淡出由 mask 实现） */}
      <div className="relative flex-1 overflow-hidden py-6" style={viewportStyle}>
        <div className="flex w-max items-center" style={trackStyle}>
          {/* 第一份：可被屏幕阅读器朗读 */}
          {renderSet("a", false)}
          {/* 第二份：装饰性副本，用于无缝循环，对辅助技术隐藏 */}
          {renderSet("b", true)}
        </div>
      </div>
    </div>
  );
}

export type {
  LogoMarqueeItem,
  TrustedByMarqueeProps,
  TrustedByDirection,
  TrustedByReduceMotionMode,
} from "./types";
