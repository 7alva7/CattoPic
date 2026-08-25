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
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => onChange('images')}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          mode === 'images'
            ? 'bg-indigo-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <ImageIcon className="h-4 w-4" />
        <span>图片上传</span>
      </button>
      <button
        onClick={() => onChange('zip')}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          mode === 'zip'
            ? 'bg-indigo-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <ArchiveIcon className="h-4 w-4" />
        <span>ZIP批量上传</span>
      </button>
    </div>
  )
}
