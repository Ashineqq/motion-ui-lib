"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PersonaCardDialogProps, PersonaData } from "./types";
import { PERSONAS } from "./mockData";

const IMAGES: Record<string, string> = {
  learner:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&auto=format&fit=crop",
  creator:
    "https://images.unsplash.com/photo-1492724441997-f7b4f376ea68?w=800&q=80&auto=format&fit=crop",
};

/* ───────── 单张卡片（原地展开 / 收起） ───────── */

function PersonaCard({
  persona,
  isExpanded,
  onToggle,
}: {
  persona: PersonaData;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const img = IMAGES[persona.key] ?? "";

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }}
      className={cn(
        "relative w-full overflow-hidden rounded-xl",
        isExpanded ? "" : "cursor-pointer"
      )}
      onClick={!isExpanded ? onToggle : undefined}
    >
      {/* ── 背景图：全幅 ↔ 140px 装饰条 ── */}
      <motion.div
        layout="position"
        className="relative w-full overflow-hidden"
        animate={{ height: isExpanded ? 140 : 280 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      >
        {img && (
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${img})` }}
            animate={{ scale: isExpanded ? 1.05 : 1 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* 标题浮层 */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-4 text-white">
          <motion.h3
            layout="position"
            className="text-xl font-semibold leading-tight sm:text-2xl"
          >
            {persona.title}
          </motion.h3>
          <motion.p
            layout="position"
            className="mt-0.5 text-sm text-white/85"
          >
            {persona.tagline}
          </motion.p>
        </div>
      </motion.div>

      {/* ── 未展开：底部简介 + 标签 ── */}
      <AnimatePresence initial={false}>
        {!isExpanded && (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-background px-5 pb-5 pt-4"
          >
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {persona.scenario}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {persona.features.slice(0, 3).map((f) => (
                <span
                  key={f.label}
                  className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                >
                  {f.label}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 展开：详情内容 ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden bg-background"
          >
            <div className="space-y-4 px-5 pb-5 pt-4">
              {/* 场景 */}
              <p className="text-sm leading-relaxed text-muted-foreground">
                {persona.scenario}
              </p>

              {/* 功能 grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {persona.features.map((f) => (
                  <div key={f.label}>
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* 使用场景 */}
              <p className="text-xs leading-relaxed text-muted-foreground">
                {persona.flow}
              </p>

              {/* 收起按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 15l-6-6-6 6"/></svg>
                收起
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────── 主组件 ───────── */

export function PersonaCardDialog({
  personas = PERSONAS,
  className,
}: PersonaCardDialogProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const toggle = useCallback(
    (key: string) => setExpandedKey((prev) => (prev === key ? null : key)),
    []
  );

  // ESC 收起
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedKey(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {personas.map((p) => (
          <PersonaCard
            key={p.key}
            persona={p}
            isExpanded={expandedKey === p.key}
            onToggle={() => toggle(p.key)}
          />
        ))}
      </div>
    </div>
  );
}
