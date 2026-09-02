'use client';

import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';

import { latLngToVec3 } from './geo';
import type { PersonSpot } from './worldData';
import type { GlobeDialogCard } from './types';

export interface DialogOverlayProps {
  /** 来源小人锚点（纬度/经度） */
  spot: PersonSpot;
  /** 旋转可见度 0..1（转背时淡出） */
  visible: number;
  /** 首次弹出标记：false→true 触发 spring 弹入动画 */
  active: boolean;
  /** 卡片内容（标题/正文/可选图标） */
  card: GlobeDialogCard;
}

/** 固定在小人【左侧】弹出的紧凑对话框卡片（装饰用途，不可交互）。
 *  以 Html center 锚定小人，水平偏移 translateX(calc(-100% - 18px))：
 *  百分比相对卡片自身宽度，无需测量；尾巴在右侧边缘指向小人。 */
export function DialogOverlay({ spot, visible, active, card }: DialogOverlayProps): JSX.Element {
  const { title, content, icon } = card;

  return (
    // 将卡片锚定到小人头顶稍外一点（半径 1.06，配合 Html center 做水平偏移）
    <Html
      position={latLngToVec3(spot.latitude, spot.longitude, 1.06)}
      center
      style={{ pointerEvents: 'none' }}
      zIndexRange={[40, 0]}
    >
      {/* 外层：整体跟随旋转可见度淡入淡出，active 触发 spring 弹入 */}
      <motion.div
        initial={active ? { opacity: 0, scale: 0.85 } : false}
        animate={{
          // active 前完全隐藏（透明度 0），active 触发 spring 弹入（与 PersonMarker 门槛一致）
          opacity: active ? visible : 0,
          scale: active ? 1 : 0.85,
        }}
        transition={
          active ? { type: 'spring', stiffness: 380, damping: 22, mass: 0.8 } : { duration: 0.25 }
        }
        style={{ pointerEvents: 'none' }}
        aria-hidden
      >
        {/* 水平偏移层：-100% 相对卡片自身宽度（固定向左，容器已预留空间） */}
        <div style={{ transform: 'translateX(calc(-100% - 18px))' }}>
          <div
            className="relative max-w-[150px] rounded-xl border border-black/5 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur"
            aria-hidden
          >
            <div className="flex items-center gap-1 text-xs font-semibold text-[#303030]">
              {icon ? <span className="shrink-0">{icon}</span> : null}
              <span>{title}</span>
            </div>
            {/* 正文（可省略，仅显示四个字时更紧凑） */}
            {content ? (
              <p className="mt-0.5 text-[10px] leading-relaxed text-[#90A2B9]">{content}</p>
            ) : null}
            {/* 三角尾巴：固定在右侧边缘，指向小人 */}
            <span className="absolute -right-1 top-1/2 size-2 -translate-y-1/2 rotate-45 border-r border-t border-black/5 bg-white/95" />
          </div>
        </div>
      </motion.div>
    </Html>
  );
}
