'use client';

import { useEffect, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { latLngToVec3 } from './geo';
import type { PersonSpot } from './worldData';

export interface PersonMarkerProps {
  /** 唯一确定经纬度的点位 */
  spot: PersonSpot;
  /** 0..1 主组件算好的旋转可见度（不包含 active 门槛） */
  visible: number;
  /** 是否已「出现/接收」（出现瞬间弹跳一次 + 波纹） */
  active: boolean;
  /** 自定义小人插槽，缺省渲染内置 PersonGlyph */
  personIcon?: React.ReactNode;
  /** 内置小人颜色，默认 "#475569" */
  personColor?: string;
}

/** 内置简洁小人 SVG（圆头 + 圆润身体），fill 用 personColor，尺寸约 22px */
export function PersonGlyph({
  color = '#475569',
  size = 22,
}: {
  color?: string;
  size?: number;
}): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* 圆头 */}
      <circle cx="12" cy="7" r="4" fill={color} />
      {/* 圆润身体 */}
      <path d="M5 21c0-4.418 3.134-7 7-7s7 2.582 7 7" fill={color} strokeLinecap="round" />
    </svg>
  );
}

/** 地球表面小人：位置固定在球面之上，随可见度淡入，active 上升沿触发弹跳与扩散波纹。 */
export function PersonMarker({
  spot,
  visible,
  active,
  personIcon,
  personColor = '#475569',
}: PersonMarkerProps): JSX.Element {
  // 略微浮在球面上方（半径 1.04），避免与散点重叠。
  const [x, y, z] = latLngToVec3(spot.latitude, spot.longitude, 1.04);

  // active 上升沿触发一次扩散波纹：用自增 key 驱动动画重放。
  const [pingKey, setPingKey] = useState(0);
  const prevActive = useRef(active);
  useEffect(() => {
    if (active && !prevActive.current) setPingKey((k) => k + 1);
    prevActive.current = active;
  }, [active]);

  // 有效透明度：可见度 ×（是否已出现）。active 为 false 时整体不渲染/透明。
  const effectiveOpacity = visible * (active ? 1 : 0);
  const showFloat = effectiveOpacity > 0;

  return (
    <Html position={[x, y, z]} center style={{ pointerEvents: 'none' }}>
      {/* 外层：控制有效透明度与出现弹跳（active 上升沿从 0.4 弹到 1） */}
      <motion.div
        style={{ opacity: effectiveOpacity }}
        animate={{ scale: active ? 1 : 0.4 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      >
        {/* 内层：仅当有效透明度 > 0 时做轻柔上下浮动（y 0 → -3px 往复） */}
        <motion.div
          animate={showFloat ? { y: [0, -3, 0] } : { y: 0 }}
          transition={
            showFloat ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }
          }
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* active 上升沿的一次扩散波纹 */}
          <motion.span
            key={pingKey}
            initial={{ scale: 0.6, opacity: 0.9 }}
            animate={active ? { scale: 2, opacity: 0 } : { scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: 22,
              height: 22,
              borderRadius: '9999px',
              border: '2px solid ' + (personColor ?? '#475569'),
              pointerEvents: 'none',
            }}
          />
          {personIcon ?? <PersonGlyph color={personColor} />}
        </motion.div>
      </motion.div>
    </Html>
  );
}
