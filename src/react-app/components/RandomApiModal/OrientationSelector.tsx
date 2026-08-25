import { motion } from 'motion/react';
import type { Orientation } from './index';

interface OrientationSelectorProps {
  value: Orientation;
  onChange: (value: Orientation) => void;
}

const options: { value: Orientation; label: string }[] = [
  { value: 'auto', label: '自动' },
  { value: 'landscape', label: '横向' },
  { value: 'portrait', label: '纵向' },
];

export default function OrientationSelector({ value, onChange }: OrientationSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">方向</h3>
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
                  layoutId="orientation-bg"
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
