import { motion, AnimatePresence } from 'motion/react'
import {
  ImageIcon,
  TrashIcon,
  UploadIcon,
  Spinner,
  Cross2Icon,
} from '../ui/icons'
import { ModalCloseButton } from '../ui/Modal'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useEffect, useRef } from 'react'
import { UploadPhase, UploadFileItem, FileUploadStatus } from '../../types/upload'
import UploadStatusIndicator, { getStatusText, getStatusColorClass } from './UploadStatusIndicator'

interface PreviewSidebarProps {
  files: UploadFileItem[]
  phase: UploadPhase
  completedCount: number
  errorCount: number
  onRemoveFile: (id: string) => void
  onRemoveAll: () => void
  isOpen: boolean
  onClose: () => void
  onUpload: () => void
  onCancelUpload: () => void
}

// 将文件大小转换为可读格式
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取头部标题
const getHeaderTitle = (phase: UploadPhase, totalFiles: number, completedCount: number, errorCount: number): string => {
  switch (phase) {
    case 'idle':
      return `待上传图片 (${totalFiles})`
    case 'uploading':
      return `上传中... (${totalFiles})`
    case 'processing':
      return `处理中... (${totalFiles})`
    case 'completed':
      if (errorCount > 0) {
        return `完成 (${completedCount} 成功, ${errorCount} 失败)`
      }
      return `上传完成 (${completedCount})`
    default:
      return `待上传图片 (${totalFiles})`
  }
}

// 获取头部背景色
const getHeaderBgClass = (phase: UploadPhase, errorCount: number): string => {
  if (phase === 'completed' && errorCount > 0) {
    return 'bg-amber-600'
  }
  if (phase === 'completed') {
    return 'bg-green-600'
  }
  return 'bg-indigo-600'
}

// 判断文件是否可以删除
const canRemoveFile = (status: FileUploadStatus): boolean => {
  return status === 'pending' || status === 'error'
}

// 判断是否正在上传过程中
const isUploading = (phase: UploadPhase): boolean => {
  return phase === 'uploading' || phase === 'processing'
}

export default function PreviewSidebar({
  files,
  phase,
  completedCount,
  errorCount,
  onRemoveFile,
  onRemoveAll,
  isOpen,
  onClose,
  onUpload,
  onCancelUpload,
}: PreviewSidebarProps) {
  const uploading = isUploading(phase)
  const totalFiles = files.length
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const getScrollElement = useCallback(() => scrollRef.current, [])
  const estimateSize = useCallback(() => 72, [])
  const removeFile = useCallback((id: string) => onRemoveFile(id), [onRemoveFile])

  // eslint-disable-next-line react-hooks/incompatible-library
  const listVirtualizer = useVirtualizer({
    count: files.length,
    getScrollElement,
    estimateSize,
    overscan: 12,
    gap: 12, // space-y-3
  })

  useEffect(() => {
    if (!isOpen) return
    listVirtualizer.measure()
  }, [isOpen, listVirtualizer, files.length])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed top-0 right-0 w-full sm:w-96 h-full bg-indigo-100/10 dark:bg-slate-800/20 shadow-xl z-30 border-l border-slate-200/50 dark:border-slate-700/50 overflow-hidden flex flex-col"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {/* 侧边栏头部 */}
          <div className={`flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700/50 ${getHeaderBgClass(phase, errorCount)} text-white transition-colors duration-300`}>
            <h2 className="text-lg font-semibold flex items-center">
              {uploading ? (
                <Spinner className="h-5 w-5 mr-2 text-white" />
              ) : (
                <ImageIcon className="h-5 w-5 mr-2 text-white opacity-90" />
              )}
              {getHeaderTitle(phase, totalFiles, completedCount, errorCount)}
            </h2>
            <div className={uploading ? 'pointer-events-none opacity-50' : ''}>
              <ModalCloseButton onClick={onClose} light />
            </div>
          </div>

          {/* 侧边栏内容 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="p-4">
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 p-6">
                <ImageIcon className="h-16 w-16 mb-4 text-slate-300 dark:text-slate-600" />
                <p className="text-lg font-medium mb-2">暂无文件</p>
                <p className="text-sm">选择要上传的文件后会显示在这里</p>
              </div>
            ) : (
              <div
                style={{
                  height: `${listVirtualizer.getTotalSize()}px`,
                  position: 'relative',
                }}
              >
                {listVirtualizer.getVirtualItems().map((virtualItem) => {
                  const item = files[virtualItem.index]
                  if (!item) return null

                  return (
                    <div
                      key={item.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translate3d(0, ${virtualItem.start}px, 0)`,
                      }}
                    >
                      <div
                        className={`group flex items-center p-3 rounded-lg border transition-colors duration-200 ${
                          item.status === 'success'
                            ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-800/30'
                            : item.status === 'error'
                              ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200/50 dark:border-red-800/30'
                              : 'bg-slate-200/50 dark:bg-slate-700/30 border-slate-300/30 dark:border-slate-600/30 hover:bg-slate-200/80 dark:hover:bg-slate-700/50'
                        }`}
                        style={{ height: 72 }}
                      >
                        {/* 状态指示器 */}
                        <div className="shrink-0 mr-3">
                          <div className="w-12 h-12 flex items-center justify-center overflow-hidden bg-white/50 dark:bg-slate-800/50 rounded-lg">
                            <UploadStatusIndicator status={item.status} size="md" />
                          </div>
                        </div>

                        {/* 文件信息 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                            {item.file.name}
                          </p>
                          <div className="flex items-center mt-1">
                            {item.status === 'error' && item.error ? (
                              <span className="text-xs text-red-500 truncate">
                                {item.error}
                              </span>
                            ) : (
                              <>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {formatFileSize(item.file.size)}
                                </span>
                                <span className="mx-1.5 text-slate-300 dark:text-slate-600">|</span>
                                <span className={`text-xs ${getStatusColorClass(item.status)}`}>
                                  {getStatusText(item.status)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        {canRemoveFile(item.status) && (
                          <button
                            type="button"
                            onClick={() => removeFile(item.id)}
                            className="btn-icon-sm shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                            aria-label="移除文件"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            </div>
          </div>

          {/* 底部操作栏 */}
          {files.length > 0 && (
            <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-800/50">
              <div className="flex space-x-2">
                {uploading ? (
                  <button
                    type="button"
                    onClick={onCancelUpload}
                    className="btn-danger"
                  >
                    <Cross2Icon className="h-4 w-4 mr-2" />
                    取消上传
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onRemoveAll}
                    disabled={phase === 'completed' && errorCount === 0}
                    className="btn-secondary"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    清除全部
                  </button>
                )}

                <button
                  type="button"
                  onClick={onUpload}
                  disabled={uploading || (phase === 'completed' && errorCount === 0)}
                  className="btn-primary flex-1"
                >
                  {phase === 'uploading' ? (
                    <>
                      <Spinner className="-ml-1 mr-2 h-5 w-5 text-white" />
                      上传中...
                    </>
                  ) : phase === 'processing' ? (
                    <>
                      <Spinner className="-ml-1 mr-2 h-5 w-5 text-white" />
                      处理中...
                    </>
                  ) : phase === 'completed' && errorCount > 0 ? (
                    <>
                      <UploadIcon className="h-5 w-5 mr-2" />
                      重试失败项
                    </>
                  ) : (
                    <>
                      <UploadIcon className="h-5 w-5 mr-2" />
                      开始上传
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
