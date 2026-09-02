'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { ConnectionArc } from '../GlobeAnimation/ConnectionArc';
import { DialogOverlay } from '../GlobeAnimation/DialogOverlay';
import { EarthGlobe } from '../GlobeAnimation/EarthGlobe';
import { PersonMarker } from '../GlobeAnimation/PersonMarker';
import { PERSON_SPOTS, type PersonSpot } from '../GlobeAnimation/worldData';
import {
  computeScrollSequence,
  ENTRY_SLIDE_VIEWPORT,
  entryFactor,
  TARGETS,
} from './scrollSequence';
import type { GlobeScrollStoryProps } from './types';

// 注册 ScrollTrigger 插件（模块级执行一次即可）
gsap.registerPlugin(ScrollTrigger);

// 相机固定参数（调研定稿）：z = 3.35、fov = 45°，与 pxPerUnit 换算保持一致
const CAMERA_Z = 3.35;
const CAMERA_FOV = 45;

// 起源小人（1 个）：从 PERSON_SPOTS 取 role==='source'（兜底同源点位，防非空断言）
const SOURCE_SPOT: PersonSpot = PERSON_SPOTS.find((s) => s.role === 'source') ?? {
  id: 'source-main',
  latitude: 47,
  longitude: -77,
  role: 'source',
};

/** Canvas 内场景组件：由滚动进度 p 派生整幕分镜并渲染地球 / 起源 / 连线 / 目标。 */
function SceneRig(props: {
  p: number;
  landColor: string;
  landDotSize: number;
  lineColor: string;
  lineWidth: number;
  personIcon: GlobeScrollStoryProps['personIcon'];
  personColor: string;
  dialogCard?: GlobeScrollStoryProps['dialogCard'];
}): JSX.Element {
  const { p, landColor, landDotSize, lineColor, lineWidth, personIcon, personColor, dialogCard } =
    props;

  // viewport.width：R3F 在 z=0 平面的世界宽度（世界单位），随容器尺寸/resize
  // 自动正确，无需做像素 ↔ 世界单位的手动换算，直接作为入场位移的基准
  const viewport = useThree((s) => s.viewport);

  // 分镜纯函数：入场滑入/回正/淡入由缓出曲线在内部做，滚动 tween 本身保持 linear
  const scene = computeScrollSequence(p, viewport.width);

  return (
    <group rotation={[0, scene.yaw, 0]}>
      {/* 地球点阵：opacity 恒 1 —— 入场淡入/滑入由外层 DOM（CSS opacity/translateX）承担，
          规避点阵着色器在透明度动画下的兼容性缺陷（实测 opacity 0→1 动画会让点阵在部分 GPU 上不渲染） */}
      <EarthGlobe landColor={landColor} landDotSize={landDotSize} opacity={1} />
      {/* 起源小人：到达 SRC_POP_AT 后弹出（visible 恒为 1，active 触发弹跳+波纹） */}
      <PersonMarker
        spot={SOURCE_SPOT}
        visible={1}
        active={scene.srcActive}
        personIcon={personIcon}
        personColor={personColor}
      />

      {/* 对话框卡片：固定在小人左侧弹出（不传 dialogCard 则不渲染） */}
      {dialogCard ? (
        <DialogOverlay
          spot={SOURCE_SPOT}
          visible={1}
          active={scene.dialogActive}
          card={dialogCard}
        />
      ) : null}

      {/* 5 条信号线 + 5 个目标小人：逐条错峰生长，画完后目标弹跳 */}
      {TARGETS.map((t, i) => (
        <group key={t.id}>
          <ConnectionArc
            from={SOURCE_SPOT}
            to={t}
            progress={scene.lines[i].progress}
            visible={1}
            color={lineColor}
            lineWidth={lineWidth}
          />
          <PersonMarker
            spot={t}
            visible={1}
            active={scene.lines[i].targetActive}
            personIcon={personIcon}
            personColor={personColor}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * GlobeScrollStory 主组件：滚动驱动的 3D 地球信号篇章。
 *
 * 最外层 section 是 ScrollTrigger 的 trigger（高 100vh、pin: true），滚动经过
 * scrollDistance 个视口的距离时，GSAP 代理值 p 在 0→1 线性推进并驱动分镜：
 * 地球从右侧 85% 视口宽位置缓缓滑入回正（右侧段停留更久）、起源小人弹出、对话框展开、5 条信号线逐条点亮。
 */
export function GlobeScrollStory(props: GlobeScrollStoryProps): JSX.Element {
  const {
    landColor = '#f97316',
    landDotSize = 2.0,
    lineColor,
    lineWidth = 2,
    personIcon,
    personColor = '#475569',
    dialogCard,
    globeSize = 'min(72vmin, 560px)',
    scrollDistance = 1.6,
    reduceMotion = 'static',
    className,
  } = props;

  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [p, setP] = useState(0);

  // 系统减弱动态：reduceMotion 描述「系统请求减弱动态时」的降级方式
  // （与库内其他组件语义一致）；降级 = 渲染定格静态场景、不创建 ScrollTrigger、不锁滚动
  const systemReduced = useReducedMotion();
  const reduced = systemReduced === true && (reduceMotion === 'pause' || reduceMotion === 'static');

  // 实际连线颜色：默认取陆地色
  const resolvedLineColor = lineColor ?? landColor;

  // 入场因子：驱动外层容器的 translateX 滑入 + opacity 淡入
  // （起点 = ENTRY_SLIDE_VIEWPORT% 画布宽，右侧段缓停更久；calc 百分比不依赖测量，
  //  resize 自动正确）
  const entry = entryFactor(p);
  const slidePercent = ENTRY_SLIDE_VIEWPORT * 100;
  const stageMotion = useMemo(
    () => ({
      transform: `translateX(calc(${slidePercent}% * ${(1 - entry).toFixed(4)}))`,
      opacity: entry,
    }),
    [entry, slidePercent],
  );

  // 画布尺寸：number 视为 px，字符串原样作为 CSS 长度
  const sizeStyle = useMemo(
    () => ({
      width: typeof globeSize === 'number' ? `${globeSize}px` : globeSize,
      height: typeof globeSize === 'number' ? `${globeSize}px` : globeSize,
    }),
    [globeSize],
  );

  // 滚动接线：仅非降级时创建 ScrollTrigger；清理杀死 tween/trigger 并 refresh，
  // React 18 StrictMode 双挂载下第二次挂载会重新创建，互不残留。
  useEffect(() => {
    if (reduced) {
      setP(1); // 定格完整静态场景
      return;
    }
    const section = sectionRef.current;
    if (!section) return;

    // 代理对象：tween 由 ScrollTrigger scrub 驱动 0→1，onUpdate 同步 React 状态
    const proxy = { p: 0 };
    const tween = gsap.to(proxy, {
      p: 1,
      ease: 'none', // 滚动驱动必须 linear；入场缓动在 computeScrollSequence 内做
      onUpdate: () => setP(proxy.p),
    });
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: `+=${scrollDistance * 100}%`,
      pin: true, // 锁定 100vh 篇章
      scrub: 1, // 平滑跟随滚动
      animation: tween,
    });

    // Storybook iframe 布局稳定后再刷一次触发位置，保证 start/end 计算准确
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      st.kill();
      tween.kill();
      ScrollTrigger.refresh();
    };
  }, [reduced, scrollDistance]);

  return (
    <section
      ref={sectionRef}
      style={{ height: '100vh', position: 'relative' }}
      className={className}
    >
      {/* 居中容器：flex 居中、overflow visible（对话框/线头光点可溢出画布不被裁剪） */}
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        {/* Canvas 挂载容器：尺寸 = globeSize；transform/opacity 承担入场滑入与淡入 */}
        <div ref={stageRef} style={{ position: 'relative', ...sizeStyle, ...stageMotion }}>
          {/* Canvas 必须 style overflow:'visible'（R3F v8 默认 overflow hidden 会裁掉
              drei Html 的对话框/线头光点，调研已确认） */}
          <Canvas
            camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}
            gl={{ alpha: true, antialias: true }}
            dpr={[1, 2]}
            style={{ overflow: 'visible', background: 'transparent' }}
          >
            <SceneRig
              p={p}
              landColor={landColor}
              landDotSize={landDotSize}
              lineColor={resolvedLineColor}
              lineWidth={lineWidth}
              personIcon={personIcon}
              personColor={personColor}
              dialogCard={dialogCard}
            />
          </Canvas>
        </div>
      </div>
    </section>
  );
}
