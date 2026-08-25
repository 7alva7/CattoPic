import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Cross1Icon } from './icons';

const overlayTransition = { duration: 0.2 };
const panelTransition = { type: 'spring' as const, damping: 25, stiffness: 300 };

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
          className="modal-overlay"
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

interface ModalPanelProps {
  children: ReactNode;
  className?: string;
}

export function ModalPanel({ children, className = '' }: ModalPanelProps) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ scale: 0.98, y: 10 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.98, y: 10 }}
      transition={panelTransition}
      className={`modal-panel ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </motion.div>
  );
}

export function ModalHeader({
  title,
  icon,
  onClose,
  actions,
  light = false,
}: {
  title: string;
  icon?: ReactNode;
  onClose?: () => void;
  actions?: ReactNode;
  light?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-between gap-3 px-6 py-3.5 ${
        light
          ? ''
          : 'border-b border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon}
        <h2
          className={`truncate text-lg font-bold ${
            light ? 'text-white' : 'text-gray-900 dark:text-white'
          }`}
        >
          {title}
        </h2>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        {onClose && <ModalCloseButton onClick={onClose} light={light} />}
      </div>
    </div>
  );
}

export function ModalBody({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-0 flex-1 overflow-y-auto px-6 py-4 ${className}`}>
      {children}
    </div>
  );
}

export function ModalFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 bg-gray-50/80 px-6 py-3 dark:border-gray-800 dark:bg-gray-800/50 ${className}`}
    >
      {children}
    </div>
  );
}

export function ModalCloseButton({ onClick, light = false }: { onClick: () => void; light?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={light
        ? 'inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors'
        : 'btn-icon'}
      aria-label="关闭"
    >
      <Cross1Icon className="h-5 w-5" />
    </button>
  );
}

export function ModalIconBadge({
  children,
  tone = 'indigo',
}: {
  children: ReactNode;
  tone?: 'indigo' | 'green' | 'red' | 'gradient';
}) {
  const tones = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    gradient: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
  };

  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}>
      {children}
    </div>
  );
}
