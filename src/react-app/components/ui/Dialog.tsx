import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Cross1Icon } from './icons';

interface DialogProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export function Dialog({ isOpen, onClose, children }: DialogProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="dialog-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function DialogPanel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ scale: 0.96, y: 12 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.96, y: 12 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className={`dialog-panel ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  );
}

export function DialogClose({ onClick, light = false }: { onClick: () => void; light?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="关闭"
      className={light
        ? 'rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white'
        : 'rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'}
    >
      <Cross1Icon className="h-5 w-5" />
    </button>
  );
}

export function DialogBadge({
  children,
  tone = 'indigo',
}: {
  children: ReactNode;
  tone?: 'indigo' | 'green' | 'red' | 'gradient';
}) {
  const tones = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    gradient: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
  };

  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}>
      {children}
    </div>
  );
}

export function DialogHeader({
  title,
  subtitle,
  icon,
  tone = 'indigo',
  onClose,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  tone?: 'indigo' | 'green' | 'red' | 'gradient';
  onClose?: () => void;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-5 dark:border-gray-700">
      <div className="flex min-w-0 items-center gap-4">
        {icon && <DialogBadge tone={tone}>{icon}</DialogBadge>}
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        {onClose && <DialogClose onClick={onClose} />}
      </div>
    </div>
  );
}
