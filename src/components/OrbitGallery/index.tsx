"use client";

import { useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import type {
  OrbitGalleryProps,
  OrbitItem,
} from "./types";

const DEG = Math.PI / 180;

/** 缺省圆心：呼应原站点的「上传」占位方块 */
function DefaultCenter() {
  return (
    <div className="grid h-28 w-28 place-items-center rounded-3xl border border-neutral-300 bg-white/90 text-neutral-400 shadow-sm">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
      </svg>
    </div>
  );
}

/**
 * OrbitGallery —— 把「若干照片绕着中心元素匀速转圈」的动效抽象为可复用组件。
 *
 * 机制（对齐 fourmula.ai 的 hero 动画）：
 *  - 轨道层整体绕圆心匀速旋转（默认 32s/圈，线性、无限循环）；
 *  - 每张照片用一个反向等速旋转的「内层」抵消轨道旋转，从而始终保持正立、仅做公转；
 *  - 照片按 360/n 的角度均匀分布在半径上，圆心可放任意元素。
 *
 * 旋转由 useMotionValue + useAnimationFrame 驱动，因此悬停暂停时只是「停止累加」，
 * 不会像切换 animate 目标那样回弹到 0，体验更顺。
 */
export function OrbitGallery({
  items,
  center,
  size = 680,
  radius,
  itemSize = { width: 104, height: 128 },
  itemRadius = 16,
  speed = 32,
  direction = "clockwise",
  startAngle = -90,
  renderItem,
  className,
  spin = true,
  pauseOnHover = false,
  reduceMotion: reduceMotionProp = "static",
}: OrbitGalleryProps) {
  const prefersReduced = useReducedMotion();

  const [hovered, setHovered] = useState(false);
  // 是否真正旋转：默认旋转；仅在「用户关掉 spin」或
  // 「系统要求减少动态且策略为 static」时停转（无障碍兜底）。
  const animateRef = useRef(true);
  animateRef.current =
    spin && !hovered && !(prefersReduced && reduceMotionProp === "static");

  const count = items.length;
  const r = radius ?? Math.round(size * 0.33);
  const dir: 1 | -1 = direction === "clockwise" ? 1 : -1;

  // 轨道旋转角度（连续累加），反向值用于让每张照片保持正立
  const rotation = useMotionValue(0);
  const itemRotation = useTransform(rotation, (v) => -v);

  const last = useRef(0);
  useAnimationFrame((t) => {
    if (count === 0 || !animateRef.current) {
      last.current = t;
      return;
    }
    const dt = (t - last.current) / 1000;
    last.current = t;
    const degPerSec = 360 / Math.max(speed, 0.001);
    rotation.set(rotation.get() + degPerSec * dt * dir);
  });

  const cardStyle: CSSProperties = {
    width: itemSize.width,
    height: itemSize.height,
    marginLeft: -itemSize.width / 2,
    marginTop: -itemSize.height / 2,
    borderRadius: itemRadius,
  };

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
      onMouseEnter={() => pauseOnHover && setHovered(true)}
      onMouseLeave={() => pauseOnHover && setHovered(false)}
    >
      {/* 圆心元素 */}
      <div className="absolute inset-0 grid place-items-center">
        {center ?? <DefaultCenter />}
      </div>

      {/* 旋转轨道层（绕圆心公转，rotate: rotation 连续累加） */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{ width: 0, height: 0, rotate: rotation }}
      >
        {items.map((item: OrbitItem, i) => {
          const angle = startAngle * DEG + (count === 0 ? 0 : (i / count) * 2 * Math.PI);
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          return (
            <div
              key={`${item.src}-${i}`}
              className="absolute left-1/2 top-1/2"
              style={{ width: 0, height: 0, transform: `translate(${x}px, ${y}px)` }}
            >
              {/* 内层：反向等速旋转，抵消轨道旋转 → 照片始终正立 */}
              <motion.div
                className="absolute left-1/2 top-1/2"
                style={{ width: 0, height: 0, rotate: itemRotation }}
              >
                <div
                  className="absolute left-1/2 top-1/2 overflow-hidden bg-neutral-100"
                  style={cardStyle}
                >
                  {renderItem ? (
                    renderItem(item, i)
                  ) : (
                    <img
                      src={item.src}
                      alt={item.alt ?? ""}
                      className={cn("h-full w-full object-cover", item.className)}
                      draggable={false}
                      loading="lazy"
                    />
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

export type {
  OrbitGalleryProps,
  OrbitItem,
  OrbitGalleryDirection,
  ReduceMotionMode,
} from "./types";
