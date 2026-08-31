'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { LAND_POINTS } from './worldData';
import { latLngToVec3 } from './geo';

export interface EarthGlobeProps {
  /** 陆地点颜色，默认 "#f97316" */
  landColor?: string;
  /** 陆地点尺寸（px），默认 2.2 */
  landDotSize?: number;
  /** 整体淡入透明度，0..1，默认 1 */
  opacity?: number;
}

// 顶点着色器：把世界坐标 z 分量归一化得到「正对/背对相机」的朝向，
// 用于边缘淡出；gl_PointSize 由 uSize 控制（uSize 已乘 dpr，保证高分屏不缩小）。
const VERTEX_SHADER = /* glsl */ `
uniform float uSize;
varying float vFade;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  float facing = worldPos.z / length(worldPos);   // +1 正对相机，-1 背对
  vFade = smoothstep(-0.15, 0.3, facing);
  gl_PointSize = uSize;
  gl_Position = projectionMatrix * mvPosition;
}
`;

// 片元着色器：用 gl_PointCoord 把方形点裁剪为圆润圆点，并按朝向与整体透明度淡出。
const FRAGMENT_SHADER = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vFade;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  float alpha = 1.0 - smoothstep(0.35, 0.5, d);   // 圆润的圆点
  gl_FragColor = vec4(uColor, uOpacity * vFade * alpha);
}
`;

/** 陆地散点地球：依赖 worldData 的 LAND_POINTS 生成球面上的一圈陆地点，自发光材质渲染。 */
export function EarthGlobe({
  landColor = '#f97316',
  landDotSize = 2.2,
  opacity = 1,
}: EarthGlobeProps): JSX.Element {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);

  // 由 LAND_POINTS（[经度, 纬度]）展平为 Float32Array 位置缓存，半径 1 单位球。
  const positions = useMemo(() => {
    const arr: number[] = [];
    for (const [lng, lat] of LAND_POINTS) {
      const [x, y, z] = latLngToVec3(lat, lng, 1);
      arr.push(x, y, z);
    }
    return new Float32Array(arr);
  }, []);

  // 每帧把 uSize 更新为 landDotSize * dpr，保证 2x 屏下圆点像素尺寸不缩小。
  useFrame(() => {
    const mat = materialRef.current;
    if (mat) mat.uniforms.uSize.value = landDotSize * dpr;
  });

  // 颜色 / 整体透明度随 props 变化同步到着色器 uniform。
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uColor.value.set(landColor);
    mat.uniforms.uOpacity.value = opacity;
  }, [landColor, opacity]);

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={{
          uSize: { value: landDotSize * dpr },
          uColor: { value: new THREE.Color(landColor) },
          uOpacity: { value: opacity },
        }}
      />
    </points>
  );
}
