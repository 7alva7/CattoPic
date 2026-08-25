import { motion } from 'motion/react'
import { FileUploadStatus } from '../../types/upload'
import {
  ImageIcon,
  UploadIcon,
  CheckIcon,
  Cross1Icon,
  Spinner,
} from '../ui/icons'

interface UploadStatusIndicatorProps {
  status: FileUploadStatus
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}

export default function UploadStatusIndicator({
  status,
  size = 'md',
}: UploadStatusIndicatorProps) {
  const sizeClass = sizeClasses[size]

  switch (status) {
    case 'pending':
      return (
        <div className={`${sizeClass} flex items-center justify-center text-slate-400`}>
          <ImageIcon className="w-full h-full" />
        </div>
      )

    case 'uploading':
      return (
        <motion.div
          className={`${sizeClass} flex items-center justify-center text-indigo-500`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <UploadIcon className="w-full h-full" />
        </motion.div>
      )

    case 'processing':
      return (
        <div className={`${sizeClass} flex items-center justify-center text-amber-500`}>
          <Spinner className="w-full h-full" />
        </div>
      )

    case 'success':
      return (
        <motion.div
          className={`${sizeClass} flex items-center justify-center text-green-500`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 25,
          }}
        >
          <CheckIcon className="w-full h-full" />
        </motion.div>
      )

    case 'error':
      return (
        <motion.div
          className={`${sizeClass} flex items-center justify-center text-red-500`}
          initial={{ x: 0 }}
          animate={{ x: [0, -4, 4, -4, 4, 0] }}
          transition={{
            duration: 0.4,
            ease: 'easeInOut',
          }}
        >
          <Cross1Icon className="w-full h-full" />
        </motion.div>
      )

    default:
      return null
  }
}

// 状态文字
export function getStatusText(status: FileUploadStatus): string {
  switch (status) {
    case 'pending':
      return '等待上传'
    case 'uploading':
      return '上传中...'
    case 'processing':
      return '处理中...'
    case 'success':
      return '已完成'
    case 'error':
      return '上传失败'
    default:
      return ''
  }
}

// 状态颜色类
export function getStatusColorClass(status: FileUploadStatus): string {
  switch (status) {
    case 'pending':
      return 'text-slate-500'
    case 'uploading':
      return 'text-indigo-500'
    case 'processing':
      return 'text-amber-500'
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    default:
      return 'text-slate-500'
  }
}
