import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CaretDownIcon, GearIcon } from '../ui/icons'

interface CompressionSettingsProps {
  quality: number
  maxWidth: number
  preserveAnimation: boolean
  outputFormat: 'webp' | 'avif' | 'both'
  onQualityChange: (quality: number) => void
  onMaxWidthChange: (maxWidth: number) => void
  onPreserveAnimationChange: (preserve: boolean) => void
  onOutputFormatChange: (format: 'webp' | 'avif' | 'both') => void
}

const QUALITY_PRESETS = [
  { value: 95, label: '最高', description: '95%' },
  { value: 90, label: '高', description: '90%' },
  { value: 80, label: '中', description: '80%' },
  { value: 70, label: '低', description: '70%' },
]

const DIMENSION_PRESETS = [
  { value: 0, label: '原图', description: '不限制' },
  { value: 3840, label: '4K', description: '3840px' },
  { value: 2560, label: '2K', description: '2560px' },
  { value: 1920, label: 'FHD', description: '1920px' },
  { value: 1280, label: 'HD', description: '1280px' },
]

const optionClass = (selected: boolean) =>
  `flex min-h-12 flex-col items-center justify-center rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
    selected
      ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-md'
      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
  }`

const CompressionSettings = React.memo(function CompressionSettings({
  quality,
  maxWidth,
  preserveAnimation,
  outputFormat,
  onQualityChange,
  onMaxWidthChange,
  onPreserveAnimationChange,
  onOutputFormatChange,
}: CompressionSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={toggleExpanded}
        className="flex h-10 w-full items-center justify-between rounded-lg px-3 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
      >
        <span className="flex min-w-0 items-center gap-2">
          <GearIcon className="h-4 w-4 shrink-0" />
          <span>压缩设置</span>
          <span className="truncate text-xs text-slate-400 dark:text-slate-500">
            {outputFormat.toUpperCase()} · {quality}% · {maxWidth > 0 ? `${maxWidth}px` : '原图'}
          </span>
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <CaretDownIcon className="h-4 w-4 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  输出格式
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {([
                    { value: 'webp', label: '仅 WebP', desc: '兼容性最好' },
                    { value: 'avif', label: '仅 AVIF', desc: '体积更小' },
                    { value: 'both', label: 'WebP + AVIF', desc: '两者都要' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onOutputFormatChange(opt.value)}
                      className={optionClass(outputFormat === opt.value)}
                    >
                      <span>{opt.label}</span>
                      <span className="text-xs opacity-70">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  压缩质量
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {QUALITY_PRESETS.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => onQualityChange(preset.value)}
                      className={optionClass(quality === preset.value)}
                    >
                      <span>{preset.label}</span>
                      <span className="text-xs opacity-70">{preset.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  最大尺寸
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {DIMENSION_PRESETS.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => onMaxWidthChange(preset.value)}
                      className={optionClass(maxWidth === preset.value)}
                    >
                      <span>{preset.label}</span>
                      <span className="text-xs opacity-70">{preset.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex h-10 items-center justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  保留 GIF 动画
                </label>
                <button
                  type="button"
                  onClick={() => onPreserveAnimationChange(!preserveAnimation)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    preserveAnimation
                      ? 'bg-indigo-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  aria-pressed={preserveAnimation}
                >
                  <motion.div
                    animate={{ x: preserveAnimation ? 20 : 2 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-1 h-4 w-4 rounded-full bg-white shadow"
                  />
                </button>
              </div>

              <div className="rounded-lg bg-slate-100 p-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <p>JPEG/PNG 等格式将按所选输出生成压缩版本。</p>
                <p className="mt-1">上传本身为 WebP/AVIF/GIF 时不会再二次压缩。</p>
                <p className="mt-1">选择「原图」表示不做尺寸缩放（AVIF 在 Cloudflare 上可能仍受尺寸限制）。</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

export default CompressionSettings
