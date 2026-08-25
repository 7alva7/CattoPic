import { UploadResult } from './index'

// 单个文件的上传状态
export type FileUploadStatus = 'pending' | 'uploading' | 'processing' | 'success' | 'error'

// 整体上传阶段
export type UploadPhase = 'idle' | 'uploading' | 'processing' | 'completed'

// 上传文件项
export interface UploadFileItem {
  id: string
  file: File
  status: FileUploadStatus
  error?: string
  result?: UploadResult
}

// 上传状态
export interface UploadState {
  phase: UploadPhase
  files: UploadFileItem[]
  completedCount: number
  errorCount: number
  abortController: AbortController | null
}

// 上传状态操作
export interface UploadStateActions {
  initializeUpload: (files: { id: string; file: File }[]) => AbortController
  setPhase: (phase: UploadPhase) => void
  setAllFilesStatus: (status: FileUploadStatus) => void
  setResults: (results: UploadResult[]) => void
  updateFileStatus: (fileId: string, status: FileUploadStatus, result?: UploadResult) => void
  cancelUpload: () => void
  reset: () => void
}
