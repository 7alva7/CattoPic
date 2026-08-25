export interface ImageData {
  id: string
  status: 'success' | 'error'
  originalName?: string
  format?: string
  orientation?: 'landscape' | 'portrait'
  expiryTime?: string
  tags?: string[]
  urls?: {
    original: string
    webp: string
    avif: string
  }
  sizes?: {
    original: number
    webp: number
    avif: number
  }
  error?: string
}

export interface CopyStatus {
  type: string
} 