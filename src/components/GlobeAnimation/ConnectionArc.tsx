'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { arcPoints } from './geo';
import type { PersonSpot } from './worldData';

export interface ConnectionArcProps {
  /** 起点（source） */
  from: PersonSpot;
  /** 终点（target） */
  to: PersonSpot;
  /** 0..1 生长进度（主组件算好传入） */
  progress: number;
  /** 0..1 整条线可见度（主组件取两端可见度较小值传入） */
  visible: number;
  /** 连线颜色，默认 "#f97316" */
  color?: string;
  /** 线头光点颜色，默认 "#ffffff" */
  headColor?: string;
  /** 连线宽度（px），默认 2（LineBasicMaterial 实际多为 1px，保留参数） */
  lineWidth?: number;
}

/** 信号弧线与线头光点：线从起点向终点按 progress 生长，线头为始终跟随尖端的圆点。 */
export function ConnectionArc({
  from,
  to,
  progress = 0,
  visible = 1,
  color = '#f97316',
  headColor = '#ffffff',
}: ConnectionArcProps): JSX.Element {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const headRef = useRef<THREE.Mesh>(null);

  // 计算弧线点：起点→终点，弧高 bulge 0.35；半径 1 单位球，48 段。
  const points = useMemo(
    () => arcPoints([from.longitude, from.latitude], [to.longitude, to.latitude], 1, 48, 0.35),
    [from.longitude, from.latitude, to.longitude, to.latitude],
  );

  const positions = useMemo(() => {
    const arr = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      arr[i * 3] = points[i][0];
      arr[i * 3 + 1] = points[i][1];
      arr[i * 3 + 2] = points[i][2];
    }
    return arr;
  }, [points]);

  // 随 progress 改变绘制范围：线从起点向终点生长。
  useLayoutEffect(() => {
    const geo = geometryRef.current;
    if (!geo) return;
    const count = Math.max(1, Math.round(progress * (points.length - 1)) + 1);
    geo.setDrawRange(0, count);
  }, [progress, points.length]);

  // 线头位置：取当前弧线尖端，随 progress 变化。
  useLayoutEffect(() => {
    const mesh = headRef.current;
    if (!mesh) return;
    const idx = Math.min(Math.round(progress * (points.length - 1)), points.length - 1);
    const tip = points[idx];
    mesh.position.fromArray(tip);
  }, [progress, points]);

  return (
    <group>
      {/* 弧线本体：depthTest=false 让线条始终浮在点阵之上，视觉更干净 */}
      <line frustumCulled={false}>
        <bufferGeometry ref={geometryRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={visible}
          depthWrite={false}
          depthTest={false}
        />
      </line>

      {/* 线头光点：半径 0.026 世界单位（相机拉远后约 3px），始终跟随弧线尖端 */}
      <mesh frustumCulled={false} ref={headRef}>
        <circleGeometry args={[0.026, 16]} />
        <meshBasicMaterial color={headColor} transparent opacity={visible} depthWrite={false} />
      </mesh>
    </group>
  );
}
