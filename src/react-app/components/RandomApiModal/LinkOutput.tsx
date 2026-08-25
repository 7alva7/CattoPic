import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardCopyIcon, CheckIcon } from '../ui/icons';

interface LinkOutputProps {
  url: string;
}

type OutputFormat = 'url' | 'html' | 'markdown';

const formatOptions: { value: OutputFormat; label: string }[] = [
  { value: 'url', label: 'URL' },
  { value: 'html', label: 'HTML' },
  { value: 'markdown', label: 'Markdown' },
];

export default function LinkOutput({ url }: LinkOutputProps) {
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('url');
  const [copied, setCopied] = useState(false);

  const formattedOutput = useMemo(() => {
    switch (outputFormat) {
      case 'html':
        return `<img src="${url}" alt="Random Image" loading="lazy" />`;
      case 'markdown':
        return `![Random Image](${url})`;
      default:
        return url;
    }
  }, [url, outputFormat]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">链接</h3>
        <div className="segment-group">
          {formatOptions.map((option) => {
            const isSelected = outputFormat === option.value;
            return (
              <button
                type="button"
                key={option.value}
                onClick={() => setOutputFormat(option.value)}
                className={`relative h-8 px-3 rounded-lg text-sm font-medium ${
                  isSelected
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="output-format-bg"
                    className="absolute inset-0 rounded-lg bg-indigo-500"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <span className="relative z-10">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        <div className="overflow-x-auto rounded-xl bg-slate-900 p-4 pr-14 font-mono text-sm text-slate-300 dark:bg-slate-950">
          <code className="break-all">{formattedOutput}</code>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`absolute top-2 right-2 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
          }`}
          aria-label={copied ? '已复制' : '复制链接'}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
              >
                <CheckIcon className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
              >
                <ClipboardCopyIcon className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
