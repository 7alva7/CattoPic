import { TrashIcon, Spinner, ExclamationTriangleIcon } from '../ui/icons';
import { Dialog, DialogPanel, DialogHeader } from '../ui/Dialog';

interface TagDeleteConfirmProps {
  isOpen: boolean;
  tagName: string;
  tagCount?: number;
  isBatch?: boolean;
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function TagDeleteConfirm({
  isOpen,
  tagName,
  tagCount = 0,
  isBatch = false,
  isProcessing,
  onCancel,
  onConfirm,
}: TagDeleteConfirmProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onCancel}>
      <DialogPanel className="max-w-md">
        <DialogHeader
          title="确认删除"
          tone="red"
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
          onClose={onCancel}
        />
        <div className="space-y-3 px-6 py-5 text-sm text-gray-600 dark:text-gray-300">
          <p>
            {isBatch ? (
              <>确定删除选中的 <span className="font-semibold text-red-600 dark:text-red-400">{tagName}</span> 吗？</>
            ) : (
              <>确定删除标签 <span className="font-semibold text-red-600 dark:text-red-400">「{tagName}」</span> 吗？</>
            )}
          </p>
          {!isBatch && tagCount > 0 && (
            <p className="font-medium text-red-600 dark:text-red-400">
              将同时删除 {tagCount} 张关联图片。
            </p>
          )}
          <p className="text-amber-600 dark:text-amber-400">此操作不可撤销。</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isProcessing}
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="btn-danger gap-2"
          >
            {isProcessing ? (
              <>
                <Spinner className="h-4 w-4" />
                删除中
              </>
            ) : (
              <>
                <TrashIcon className="h-4 w-4" />
                确认删除
              </>
            )}
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
