'use client';

import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';

import { ConnectionArc } from './ConnectionArc';
import { DialogOverlay } from './DialogOverlay';
import { EarthGlobe } from './EarthGlobe';
import { PersonMarker } from './PersonMarker';
import { visibilityFactor } from './geo';
import type { GlobeAnimationProps } from './types';
import { PERSON_SPOTS, type PersonSpot } from './worldData';

/** 将数值约束到 [0,1] */
function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** 归一化到 [0,360)（正前方旋转角） */
function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

// 来源小人（1 个）：纬度 47 / 经度 -77（地球正面左上）
const SOURCE_LAT = 47;
const SOURCE_LNG = -77;

// ── 演出序列时序（固定原速，不随地球转速变化；单位：秒）──
// 复刻「20°/s 时代」的节奏：来源小人 0.075s 弹跳、对话框 0.15s 弹出、
// 第 0 条线 0.5s 起画、每条线 0.6s 画完、线间间隔 0.55s。
// 淡出仍绑定真实旋转角（见 visibilityFactor），因此地球转慢后小人停留更久，
// 但连线生长/弹跳/对话框节奏保持不变。
const SRC_POP_AT = 0.075;
const DIALOG_POP_AT = 0.15;
const LINE_START_BASE = 0.5;
const LINE_START_STEP = 0.55;
const LINE_DRAW_S = 0.6;
const LOOP_FREEZE_DEG = 180; // loop=false 时序列冻结阈值（真实旋转角，度）

interface SceneState {
  dotsOpacity: number;
  srcVis: number;
  srcActive: boolean;
  dialogActive: boolean;
  lines: Array<{
    progress: number;
    lineVis: number;
    targetVis: number;
    targetActive: boolean;
  }>;
}

/** 根据真实旋转角 θm 与序列时间 seqTime（本轮周期内的秒数）计算整段演出：
 *  序列节奏（弹跳/对话框/连线生长）固定原速；淡出绑定真实旋转（θm）。 */
function computeSequence(thetaMod: number, seqTime: number, loop: boolean): SceneState {
  // loop=false 且真实旋转越过冻结点：序列冻结（保持隐藏/未激活），可见度函数照常
  const frozen = !loop && thetaMod > LOOP_FREEZE_DEG;

  // 地球点阵常亮（不随 θ 变化；首帧/后台节流时也保证可见）
  const dotsOpacity = 1;

  // 来源小人：弹跳出现（原速），随真实旋转淡出
  const srcVis = visibilityFactor(SOURCE_LAT, SOURCE_LNG, thetaMod);
  const srcActive = frozen ? false : seqTime >= SRC_POP_AT;

  // 对话框：原速弹出，随来源小人可见度淡出
  const dialogActive = frozen ? false : seqTime >= DIALOG_POP_AT;

  // 5 条信号线（target 顺序 = PERSON_SPOTS 中 role==="target" 的顺序）
  const targets = PERSON_SPOTS.filter((s) => s.role === 'target');
  const lines = targets.map((t, i) => {
    const start = LINE_START_BASE + i * LINE_START_STEP;
    const progress = frozen ? 0 : clamp01((seqTime - start) / LINE_DRAW_S);
    const targetVis = visibilityFactor(t.latitude, t.longitude, thetaMod);
    const lineVis = Math.min(srcVis, targetVis);
    const targetActive = frozen ? false : progress >= 1;
    return { progress, lineVis, targetVis, targetActive };
  });

  return { dotsOpacity, srcVis, srcActive, dialogActive, lines };
}

/** 场景内部组件：持有旋转控制（useFrame 驱动 θ 并写入 state）。 */
function SceneRig(props: {
  landColor: string;
  landDotSize: number;
  lineColor: string;
  lineWidth: number;
  personIcon: GlobeAnimationProps['personIcon'];
  personColor: string;
  rotationSpeed: number;
  loop: boolean;
  dialogCard?: GlobeAnimationProps['dialogCard'];
  reduced: boolean;
}): JSX.Element {
  const {
    landColor,
    landDotSize,
    lineColor,
    lineWidth,
    personIcon,
    personColor,
    rotationSpeed,
    loop,
    dialogCard,
    reduced,
  } = props;

  const thetaRef = useRef(0); // 累计旋转角（度）
  const lastThetaRef = useRef(0); // 上一帧的归一化旋转角，用于检测 360° wrap
  const cycleStartRef = useRef(0); // 本轮周期开始时的 clock 时间（秒）
  const [theta, setTheta] = useState(0); // 归一化真实旋转角，用于旋转渲染与淡出
  const [seqTime, setSeqTime] = useState(0); // 本轮周期内的序列时间（秒），驱动演出节奏

  useFrame((state, delta) => {
    if (reduced) return; // 静态模式：冻结，不推进旋转
    thetaRef.current += rotationSpeed * delta; // 正值=右旋
    const tm = normalizeDeg(thetaRef.current);
    // 真实旋转转满一圈（359→0）时重置序列计时，演出随新周期重播
    if (tm < lastThetaRef.current - 180) {
      cycleStartRef.current = state.clock.elapsedTime;
    }
    lastThetaRef.current = tm;
    setTheta(tm);
    setSeqTime(state.clock.elapsedTime - cycleStartRef.current);
  });

  // 减弱动态：渲染完整静态场景（θ=0 冻结、点阵全亮、来源小人+对话框、
  // 5 个目标小人与其满弧线都展示，仅无任何运动）
  const targets = PERSON_SPOTS.filter((s) => s.role === 'target');
  const state: SceneState = reduced
    ? {
        dotsOpacity: 1,
        srcVis: 1,
        srcActive: true,
        dialogActive: true,
        lines: targets.map((t) => ({
          progress: 1,
          lineVis: Math.min(1, visibilityFactor(t.latitude, t.longitude, 0)),
          targetVis: visibilityFactor(t.latitude, t.longitude, 0),
          targetActive: true,
        })),
      }
    : computeSequence(theta, seqTime, loop);

  const { dotsOpacity, srcVis, srcActive, dialogActive, lines } = state;

  const sourceSpot: PersonSpot = {
    id: 'source',
    latitude: SOURCE_LAT,
    longitude: SOURCE_LNG,
    role: 'source',
  };

  // 真实右旋：整个场景（点阵/小人/弧线）绕 Y 轴按 θ 旋转，正值=正面表面向右移动
  const thetaRad = (theta * Math.PI) / 180;

  return (
    <group rotation={[0, thetaRad, 0]}>
      {/* 地球点阵：常亮（不随 θ 淡入，保证任何时刻可见） */}
      <EarthGlobe landColor={landColor} landDotSize={landDotSize} opacity={dotsOpacity} />

      {/* 来源小人（位于正面左上） */}
      <PersonMarker
        spot={sourceSpot}
        visible={srcVis}
        active={srcActive}
        personIcon={personIcon}
        personColor={personColor}
      />

      {/* 对话框卡片：固定在小人左侧弹出（容器已预留左侧空间） */}
      {dialogCard ? (
        <DialogOverlay spot={sourceSpot} visible={srcVis} active={dialogActive} card={dialogCard} />
      ) : null}

      {/* 5 条信号线 + 5 个 target 小人 */}
      {targets.map((t, i) => {
        const l = lines[i];
        return (
          <group key={t.id}>
            <ConnectionArc
              from={sourceSpot}
              to={t}
              progress={l.progress}
              visible={l.lineVis}
              color={lineColor}
              lineWidth={lineWidth}
            />
            <PersonMarker
              spot={t}
              visible={l.targetVis}
              active={l.targetActive}
              personIcon={personIcon}
              personColor={personColor}
            />
          </group>
        );
      })}
    </group>
  );
}

/** GlobeAnimation 主组件：3D 点阵地球右旋、起源小人发信号到 5 个固定陆地点、循环演出。 */
export function GlobeAnimation(props: GlobeAnimationProps): JSX.Element {
  const {
    landColor = '#f97316',
    landDotSize = 2.0,
    diameter = 480,
    rotationSpeed = 8,
    lineColor,
    lineWidth = 2,
    dialogCard,
    personIcon,
    personColor = '#475569',
    loop = true,
    width,
    height,
    className,
    reduceMotion = 'static',
  } = props;

  const systemReduced = useReducedMotion();
  // reduceMotion 只描述「系统请求减弱动态时」的降级方式（两种取值均为静态画面，
  // 与库内其他组件语义一致）；默认不强制静态，动画正常播放。
  const reduced = systemReduced === true && (reduceMotion === 'pause' || reduceMotion === 'static');

  // 实际连线颜色：默认取陆地色
  const resolvedLineColor = lineColor ?? landColor;

  // 容器尺寸：number 视为 px，缺省等于 diameter
  const w = width ?? diameter;
  const h = height ?? diameter;
  const sizeStyle = useMemo(
    () => ({
      width: typeof w === 'number' ? `${w}px` : w,
      height: typeof h === 'number' ? `${h}px` : h,
    }),
    [w, h],
  );

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...sizeStyle,
        background: 'transparent',
        overflow: 'visible',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3.35], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <SceneRig
          landColor={landColor}
          landDotSize={landDotSize}
          lineColor={resolvedLineColor}
          lineWidth={lineWidth}
          personIcon={personIcon}
          personColor={personColor}
          rotationSpeed={rotationSpeed}
          loop={loop}
          dialogCard={dialogCard}
          reduced={reduced}
        />
      </Canvas>
    </div>
  );
}
