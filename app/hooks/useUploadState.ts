'use client'

import { useState, useCallback } from 'react'
import {
  UploadState,
  UploadPhase,
  FileUploadStatus,
  UploadFileItem,
  UploadStateActions,
} from '../types/upload'
import { UploadResult } from '../types'

const initialState: UploadState = {
  phase: 'idle',
  files: [],
  completedCount: 0,
  errorCount: 0,
  abortController: null,
}

export function useUploadState(): UploadState & UploadStateActions {
  const [state, setState] = useState<UploadState>(initialState)

  // 初始化上传，返回 AbortController 用于取消
  const initializeUpload = useCallback((files: { id: string; file: File }[]): AbortController => {
    const controller = new AbortController()
    const uploadFiles: UploadFileItem[] = files.map((f) => ({
      id: f.id,
      file: f.file,
      status: 'uploading' as FileUploadStatus,
    }))

    setState({
      phase: 'uploading',
      files: uploadFiles,
      completedCount: 0,
      errorCount: 0,
      abortController: controller,
    })

    return controller
  }, [])

  // 设置上传阶段
  const setPhase = useCallback((phase: UploadPhase) => {
    setState((prev) => ({ ...prev, phase }))
  }, [])

  // 设置所有文件的状态
  const setAllFilesStatus = useCallback((status: FileUploadStatus) => {
    setState((prev) => ({
      ...prev,
      files: prev.files.map((f) => ({
        ...f,
        status: f.status === 'success' || f.status === 'error' ? f.status : status,
      })),
    }))
  }, [])

  // 设置上传结果
  const setResults = useCallback((results: UploadResult[]) => {
    setState((prev) => {
      // 匹配结果到文件，按顺序匹配
      const updatedFiles = prev.files.map((file, index) => {
        const result = results[index]
        if (!result) return file

        return {
          ...file,
          status: result.status === 'success' ? 'success' : 'error' as FileUploadStatus,
          result,
          error: result.error,
        }
      })

      const successCount = updatedFiles.filter((f) => f.status === 'success').length
      const errorCount = updatedFiles.filter((f) => f.status === 'error').length

      return {
        ...prev,
        phase: 'completed',
        files: updatedFiles,
        completedCount: successCount,
        errorCount,
        abortController: null,
      }
    })
  }, [])

  // 更新单个文件的状态（用于并发上传）
  const updateFileStatus = useCallback((
    fileId: string,
    status: FileUploadStatus,
    result?: UploadResult
  ) => {
    setState((prev) => {
      const updatedFiles = prev.files.map((f) =>
        f.id === fileId
          ? { ...f, status, result, error: result?.error }
          : f
      )

      const completedCount = updatedFiles.filter((f) => f.status === 'success').length
      const errorCount = updatedFiles.filter((f) => f.status === 'error').length
      const totalDone = completedCount + errorCount

      // 自动判断整体阶段
      let phase: UploadPhase = prev.phase
      if (totalDone === updatedFiles.length && updatedFiles.length > 0) {
        phase = 'completed'
      }

      return {
        ...prev,
        phase,
        files: updatedFiles,
        completedCount,
        errorCount,
      }
    })
  }, [])

  // 取消上传
  const cancelUpload = useCallback(() => {
    setState((prev) => {
      // 中断请求
      if (prev.abortController) {
        prev.abortController.abort()
      }

      // 重置所有文件状态为 pending
      return {
        ...prev,
        phase: 'idle',
        files: prev.files.map((f) => ({
          ...f,
          status: 'pending' as FileUploadStatus,
          error: undefined,
          result: undefined,
        })),
        completedCount: 0,
        errorCount: 0,
        abortController: null,
      }
    })
  }, [])

  // 重置状态
  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  return {
    ...state,
    initializeUpload,
    setPhase,
    setAllFilesStatus,
    setResults,
    updateFileStatus,
    cancelUpload,
    reset,
  }
}
