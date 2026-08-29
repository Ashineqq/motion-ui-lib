import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * 自定义十字准星光标（+ 形状，白色，带科技感）。
 * 跟随鼠标以弹簧缓动移动；在指向可交互元素时放大高亮。
 * 仅在精确指针（鼠标）设备下渲染。使用方需在其根容器上设置 `cursor-none` 隐藏原生光标。
 */
export function CrosshairCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.4 });

  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement | null;
      setActive(Boolean(el?.closest('a,button,[role="button"],[data-cursor="hover"]')));
    };
    const leave = () => {
      x.set(-100);
      y.set(-100);
    };

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[120] mix-blend-difference"
      style={{ x: sx, y: sy }}
    >
      <div className="relative size-6 -translate-x-1/2 -translate-y-1/2 text-white">
        <motion.span
          className="absolute inset-0 rounded-full border border-white/70"
          animate={{ scale: active ? 1.5 : 1, opacity: active ? 0.9 : 0.35 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
        <svg
          className="absolute inset-0"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
        >
          <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
          <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      </div>
    </motion.div>
  );
}
