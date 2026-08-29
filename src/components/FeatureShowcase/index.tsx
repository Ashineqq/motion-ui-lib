import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { EASINGS } from '@/utils/easings';

import { CrosshairCursor } from './CrosshairCursor';
import { ArrowRightIcon, GridNineIcon, PluginCubeIcon, TimelineClockIcon } from './icons';
import { FeatureTextBlock } from './FeatureTextBlock';
import { PreviewSwitcher } from './PreviewSwitcher';
import { ModeDropdownMockup } from './mockups/ModeDropdownMockup';
import { PluginPanelMockup } from './mockups/PluginPanelMockup';
import { TrajectoryMockup } from './mockups/TrajectoryMockup';
import type { FeatureSectionData, FeatureShowcaseProps } from './types';

/* ------------------------------------------------------------------ */
/* 内置示例分栏：DeepSeek Harness                                       */
/* ------------------------------------------------------------------ */

const deepseekSections: FeatureSectionData[] = [
  {
    id: 'plugins',
    icon: <PluginCubeIcon className="size-6" />,
    title: '一切皆插件',
    body: (
      <>
        DeepSeek Harness 基于 <span className="text-neutral-200">Cordis</span> 插件系统构建，
        所有 Agent 能力——模型、工具、技能、UI 等——均由插件提供。开发者可在配置层选择、替换或扩展，
        无需改动内核。
      </>
    ),
    visual: <PluginPanelMockup />,
  },
  {
    id: 'trajectory',
    icon: <TimelineClockIcon className="size-6" />,
    title: '每一次运行都有迹可循',
    body: (
      <>
        仅追加（append-only）设计的会话日志，完整记录系统提示词、思维链、工具调用与子 Agent 调度。
        支持在 <span className="text-neutral-200">Trajectory</span> 视图中按来源查看，并随时恢复、分支、检索与回放。
      </>
    ),
    visual: <TrajectoryMockup />,
  },
  {
    id: 'modes',
    icon: <GridNineIcon className="size-6" />,
    title: '多种运行模式',
    body: (
      <>
        标准模式提供完整工具链；PTC 模式以代码组合多轮调用；极简模式仅保留 shell 与编辑器，用于基准测试；
        创造模式支持运行时检查与内存中试验插件。
      </>
    ),
    visual: <ModeDropdownMockup />,
  },
];

export function FeatureShowcase({
  sections = deepseekSections,
  footerTitle = '自定义你的 DeepSeek Harness',
  footerSubtitle = '选择能力、编排运行、回放每一次决策——把 Agent 搭成你想要的形态。',
  footerCta = '开始构建',
  crosshairCursor = true,
  className,
}: FeatureShowcaseProps) {
  const reduce = useReducedMotion();
  const blockRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  // 滚动时取「中心最接近视口中线」的文案块作为当前激活项：
  // 处于聚焦阈值内的块高亮，离开阈值（被其它块更靠近中线）的块暗化。
  useEffect(() => {
    let raf = 0;
    const compute = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (typeof window === 'undefined') return;
        const center = window.innerHeight / 2;
        let best = 0;
        let bestDist = Infinity;
        blockRefs.current.forEach((el, i) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const blockCenter = rect.top + rect.height / 2;
          const dist = Math.abs(blockCenter - center);
          if (dist < bestDist) {
            bestDist = dist;
            best = i;
          }
        });
        setActive((prev) => (prev === best ? prev : best));
      });
    };
    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className={cn(
        'relative w-full bg-[#0a0a0a] text-neutral-200',
        'bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(99,110,160,0.10),transparent_60%)]',
        crosshairCursor && 'cursor-none',
        className,
      )}
    >
      {crosshairCursor && <CrosshairCursor />}

      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-16">
          {/* 左侧：紧贴堆叠的文案块 + 竖向轨道 */}
          <div className="relative order-2 pb-6 lg:order-1">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" aria-hidden />
              {sections.map((section, i) => (
                <FeatureTextBlock
                  key={section.id}
                  section={section}
                  index={i}
                  active={i === active}
                  innerRef={(el) => {
                    blockRefs.current[i] = el;
                  }}
                />
              ))}
            </div>
            {/* 底部留白：为最后一个分栏提供滚动余量，使其在激活时能与右侧 sticky 预览居中对齐。
                否则右侧预览会在滚到末尾前提前脱离顶部，导致预览底部与 Section 3 文字底部对齐。 */}
            <div className="h-[26vh]" aria-hidden />
          </div>

          {/* 右侧：唯一且 sticky 的预览组件，随滚动切换卡片 */}
          <div className="order-1 lg:order-2">
            <div className="sticky top-0 flex h-[56vh] items-center py-10 lg:h-screen lg:py-0">
              <PreviewSwitcher sections={sections} active={active} />
            </div>
          </div>
        </div>
      </div>

      <Footer title={footerTitle} subtitle={footerSubtitle} cta={footerCta} reduce={reduce ?? false} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 底部 CTA                                                             */
/* ------------------------------------------------------------------ */

interface FooterProps {
  title: ReactNode;
  subtitle: ReactNode;
  cta: ReactNode;
  reduce: boolean;
}

function Footer({ title, subtitle, cta, reduce }: FooterProps) {
  return (
    <section className="relative mx-auto flex min-h-[70vh] w-full max-w-6xl flex-col items-center justify-center px-6 py-28 text-center lg:px-10">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 0.8, ease: EASINGS.smooth }}
        className="flex flex-col items-center"
      >
        <div className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[12px] text-neutral-400">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          DeepSeek Harness
        </div>

        <h2 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-neutral-50 sm:text-5xl lg:text-6xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-neutral-400">{subtitle}</p>
        )}

        {cta && (
          <button
            type="button"
            data-cursor="hover"
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-neutral-50 px-6 py-3 text-[14px] font-medium text-neutral-900 transition-colors hover:bg-white"
          >
            {cta}
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 导出                                                                 */
/* ------------------------------------------------------------------ */

export { FeatureTextBlock } from './FeatureTextBlock';
export { PreviewSwitcher } from './PreviewSwitcher';
export { CrosshairCursor } from './CrosshairCursor';
export { PluginPanelMockup } from './mockups/PluginPanelMockup';
export { TrajectoryMockup } from './mockups/TrajectoryMockup';
export { ModeDropdownMockup } from './mockups/ModeDropdownMockup';
export type { FeatureSectionData, FeatureShowcaseProps } from './types';
