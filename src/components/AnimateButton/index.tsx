import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

import { EASINGS } from '../../utils/easings';

export type AnimateButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface AnimateButtonProps extends HTMLMotionProps<'button'> {
  /** 按钮内容 */
  children?: ReactNode;
  /** 视觉变体 */
  variant?: AnimateButtonVariant;
  /** 是否显示加载态（显示 spinner 并禁用交互） */
  loading?: boolean;
}

const VARIANT_CLASSES: Record<AnimateButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500',
  secondary: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-100',
  ghost: 'text-indigo-700 hover:bg-indigo-50',
};

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium ' +
  'select-none transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

export function AnimateButton({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className,
  ...rest
}: AnimateButtonProps) {
  const interactive = !disabled && !loading;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: EASINGS.smooth }}
      whileHover={
        interactive
          ? { scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 20 } }
          : undefined
      }
      whileTap={
        interactive
          ? { scale: 0.95, transition: { type: 'spring', stiffness: 600, damping: 25 } }
          : undefined
      }
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[BASE_CLASSES, VARIANT_CLASSES[variant], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {loading && (
        <motion.span
          aria-hidden
          className="size-4 rounded-full border-2 border-current border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {children}
    </motion.button>
  );
}
