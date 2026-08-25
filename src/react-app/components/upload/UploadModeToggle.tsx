import { ImageIcon, ArchiveIcon } from '../ui/icons'

export type UploadMode = 'images' | 'zip'

interface UploadModeToggleProps {
  mode: UploadMode
  onChange: (mode: UploadMode) => void
  disabled?: boolean
}

export default function UploadModeToggle({
  mode,
  onChange,
  disabled = false,
}: UploadModeToggleProps) {
  const itemClass = (active: boolean) =>
    `segment-item gap-2 ${
      active
        ? 'text-white'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`

  return (
    <div className="segment-group mb-6 w-full sm:max-w-md">
      <button
        type="button"
        onClick={() => onChange('images')}
        disabled={disabled}
        className={itemClass(mode === 'images')}
      >
        {mode === 'images' && (
          <span className="absolute inset-0 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600" />
        )}
        <ImageIcon className="relative z-10 h-4 w-4" />
        <span className="relative z-10">图片上传</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('zip')}
        disabled={disabled}
        className={itemClass(mode === 'zip')}
      >
        {mode === 'zip' && (
          <span className="absolute inset-0 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600" />
        )}
        <ArchiveIcon className="relative z-10 h-4 w-4" />
        <span className="relative z-10">ZIP 批量</span>
      </button>
    </div>
  )
}
