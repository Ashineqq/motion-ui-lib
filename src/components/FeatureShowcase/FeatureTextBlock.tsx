import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { EASINGS } from '@/utils/easings';

import type { FeatureSectionData } from './types';

interface FeatureTextBlockProps {
  section: FeatureSectionData;
  /** 章节序号（从 0 开始） */
  index: number;
  /** 是否处于聚焦阈值内（高亮），否则暗化 */
  active: boolean;
  /** 用于滚动定位的 ref 回调 */
  innerRef?: (el: HTMLElement | null) => void;
}

/**
 * 左侧单个特性文案块。处于聚焦阈值内时高亮（全亮），离开后暗化（降透明度）。
 * 块与块之间紧贴堆叠，配合右侧 sticky 预览形成滚动叙事。
 */
export function FeatureTextBlock({ section, index, active, innerRef }: FeatureTextBlockProps) {
  const num = String(index + 1).padStart(2, '0');

  return (
    <div ref={innerRef} className="relative flex min-h-[68vh] items-center">
      {/* 轨道节点：聚焦时点亮为蓝色 */}
      <span
        className="absolute left-0 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-500"
        style={{
          borderColor: active ? 'rgb(56 189 248)' : 'rgba(255,255,255,0.18)',
          background: active ? 'rgb(56 189 248)' : 'transparent',
          boxShadow: active ? '0 0 12px 1px rgba(56,189,248,0.6)' : 'none',
        }}
        aria-hidden
      />

      <motion.div
        className={cn('pl-10 transition-colors duration-500', active ? 'text-neutral-50' : 'text-neutral-500')}
        animate={{ opacity: active ? 1 : 0.32 }}
        transition={{ duration: 0.5, ease: EASINGS.smooth }}
      >
        <div className="flex items-center gap-3 text-neutral-500">
          <span className="font-mono text-[12px] tracking-widest">{num}</span>
          <span className="h-px w-8 bg-white/15" />
        </div>

        <div
          className={cn(
            'mt-6 flex size-12 items-center justify-center rounded-xl border transition-colors duration-500',
            active ? 'border-white/15 bg-white/[0.05] text-neutral-100' : 'border-white/10 bg-white/[0.02] text-neutral-400',
          )}
        >
          {section.icon}
        </div>

        <h2
          className={cn(
            'mt-6 text-balance text-3xl font-semibold tracking-tight transition-colors duration-500 sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]',
            active ? 'text-neutral-50' : 'text-neutral-400',
          )}
        >
          {section.title}
        </h2>

        {section.body && (
          <p
            className={cn(
              'mt-5 max-w-md text-[15px] leading-relaxed transition-colors duration-500',
              active ? 'text-neutral-300' : 'text-neutral-500',
            )}
          >
            {section.body}
          </p>
        )}
      </motion.div>
    </div>
  );
}
