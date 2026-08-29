import type { ReactNode } from 'react';

/** 单个特性分栏的数据（左文右图） */
export interface FeatureSectionData {
  /** 唯一标识 */
  id: string;
  /** 左侧小图标（内联 SVG / 任意节点） */
  icon?: ReactNode;
  /** 标题（必填） */
  title: ReactNode;
  /** 正文说明（可选，不传不渲染） */
  body?: ReactNode;
  /** 右上角的小标签（如章节序号），可选 */
  eyebrow?: ReactNode;
  /** 右侧视觉区：产品界面预览 / 截图占位 */
  visual: ReactNode;
}

export interface FeatureShowcaseProps {
  /** 分栏数据数组；不传时使用内置的 DeepSeek Harness 示例分栏 */
  sections?: FeatureSectionData[];
  /** 底部收尾大标题（不传时使用默认文案） */
  footerTitle?: ReactNode;
  /** 底部收尾副标题（可选） */
  footerSubtitle?: ReactNode;
  /** 底部 CTA 按钮文案（不传则不渲染按钮） */
  footerCta?: ReactNode;
  /** 是否启用自定义十字准星光标，默认 true（仅在精确指针设备生效） */
  crosshairCursor?: boolean;
  /** 根容器附加 className */
  className?: string;
}
