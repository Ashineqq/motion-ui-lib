"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PersonaCardMorphProps } from "./types";
import { PERSONAS } from "./mockData";

const IMAGES: Record<string, string> = {
  learner:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&auto=format&fit=crop",
  creator:
    "https://images.unsplash.com/photo-1492724441997-f7b4f376ea68?w=800&q=80&auto=format&fit=crop",
};

/* ───────── 主组件 ───────── */

export function PersonaCardMorph({
  personas = PERSONAS,
  className,
}: PersonaCardMorphProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const close = useCallback(() => setExpandedKey(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const expanded = personas.find((p) => p.key === expandedKey) ?? null;

  return (
    <LayoutGroup>
      <div className={cn("w-full", className)}>
        {/* ── 卡片网格 ── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {personas.map((p) => (
            <div key={p.key} className="min-h-[400px]">
              {/* 占位：展开时保持网格高度，防止另一张卡跳动 */}
              {expandedKey === p.key ? (
                <div className="h-full" />
              ) : (
                <motion.button
                  layoutId={`card-${p.key}`}
                  type="button"
                  onClick={() => setExpandedKey(p.key)}
                  className="group relative flex h-[400px] w-full cursor-pointer overflow-hidden rounded-xl text-left"
                  transition={{
                    layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
                  }}
                >
                  {/* 背景图 */}
                  <motion.div
                    layoutId={`img-${p.key}`}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: IMAGES[p.key]
                        ? `url(${IMAGES[p.key]})`
                        : undefined,
                    }}
                    transition={{
                      layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* 底部文字 */}
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <motion.h3
                      layoutId={`title-${p.key}`}
                      className="text-xl font-semibold leading-tight sm:text-2xl"
                      transition={{
                        layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
                      }}
                    >
                      {p.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`tagline-${p.key}`}
                      className="mt-0.5 text-sm text-white/85"
                      transition={{
                        layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
                      }}
                    >
                      {p.tagline}
                    </motion.p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75">
                      {p.scenario}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.features.slice(0, 3).map((f) => (
                        <span
                          key={f.label}
                          className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white/90"
                        >
                          {f.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 遮罩 + 展开卡片 ── */}
      <AnimatePresence>
        {expanded && (
          <>
            {/* 遮罩 */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={close}
              className="fixed inset-0 z-40 bg-black/50"
            />

            {/* 展开的卡片 */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                layoutId={`card-${expanded.key}`}
                className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-background shadow-2xl"
                transition={{
                  layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
                }}
              >
                {/* 顶部背景图（缩小为装饰条） */}
                <div className="relative h-[140px] w-full overflow-hidden">
                  <motion.div
                    layoutId={`img-${expanded.key}`}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: IMAGES[expanded.key]
                        ? `url(${IMAGES[expanded.key]})`
                        : undefined,
                    }}
                    transition={{
                      layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* 关闭按钮 */}
                  <button
                    onClick={close}
                    className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>

                {/* 标题区 */}
                <div className="bg-muted/60 px-6 pb-3 pt-3">
                  <motion.h3
                    layoutId={`title-${expanded.key}`}
                    className="text-xl font-semibold leading-tight"
                    transition={{
                      layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
                    }}
                  >
                    {expanded.title}
                  </motion.h3>
                  <motion.p
                    layoutId={`tagline-${expanded.key}`}
                    className="mt-1 text-sm text-muted-foreground"
                    transition={{
                      layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
                    }}
                  >
                    {expanded.tagline}
                  </motion.p>
                </div>

                {/* 详情内容（延迟淡入） */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="space-y-4 px-6 pb-6 pt-4"
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {expanded.scenario}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {expanded.features.map((f) => (
                      <div key={f.label}>
                        <p className="text-sm font-medium">{f.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {f.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {expanded.flow}
                  </p>

                  <button
                    onClick={close}
                    className="pt-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    ← 返回
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
