import { motion } from 'motion/react';
import type { Format } from './index';

interface FormatSelectorProps {
  value: Format;
  onChange: (value: Format) => void;
}

const options: { value: Format; label: string }[] = [
  { value: 'auto', label: '自动' },
  { value: 'original', label: '原图' },
  { value: 'webp', label: 'WebP' },
  { value: 'avif', label: 'AVIF' },
];

export default function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">格式</h3>
      <div className="segment-group">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              type="button"
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`segment-item ${
                isSelected ? 'text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="format-bg"
                  className="absolute inset-0 rounded-lg bg-linear-to-r from-indigo-500 to-purple-500"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <span className="relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
