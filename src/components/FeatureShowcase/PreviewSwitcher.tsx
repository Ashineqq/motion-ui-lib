import { motion, useReducedMotion } from 'framer-motion';

import { EASINGS } from '@/utils/easings';

import type { FeatureSectionData } from './types';

interface PreviewSwitcherProps {
  /** 分栏数据（每个的 visual 即一张内容卡片） */
  sections: FeatureSectionData[];
  /** 当前激活序号——决定展示哪张卡片 */
  active: number;
}

/**
 * 右侧唯一的预览组件：sticky 固定在视口，随左侧文案滚动在卡片间交叉淡入淡出。
 * 始终只渲染「当前激活」那一张为高亮，其余淡出（保持挂载以便平滑过渡）。
 */
export function PreviewSwitcher({ sections, active }: PreviewSwitcherProps) {
  const reduce = useReducedMotion();

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.04]">
      {/* 顶部高光，强化「悬浮于纯黑背景」的层次 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      {/* 轻微外发光 */}
      <div className="pointer-events-none absolute -inset-px z-10 rounded-2xl shadow-[0_0_60px_-20px_rgba(120,150,255,0.25)]" />

      <div className="absolute inset-0">
        {sections.map((section, i) => (
          <motion.div
            key={section.id}
            className="absolute inset-0"
            initial={false}
            animate={{
              opacity: i === active ? 1 : 0,
              scale: i === active ? 1 : 0.98,
            }}
            transition={{ duration: reduce ? 0 : 0.5, ease: EASINGS.smooth }}
            style={{ pointerEvents: i === active ? 'auto' : 'none' }}
            aria-hidden={i !== active}
          >
            {section.visual}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
