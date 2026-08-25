import { Spinner } from './ui/icons';

interface DeleteConfirmProps {
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteConfirm = ({ isDeleting, onCancel, onConfirm }: DeleteConfirmProps) => {
  return (
    <div className="flex items-center gap-2">
      <p className="min-w-0 flex-1 text-sm text-red-600 dark:text-red-400">
        删除此图片及所有格式？
      </p>
      <button
        type="button"
        onClick={onCancel}
        className="btn-secondary"
        disabled={isDeleting}
      >
        取消
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="btn-danger"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <>
            <Spinner className="-ml-1 mr-2 h-4 w-4 text-white" />
            处理中
          </>
        ) : (
          '删除'
        )}
      </button>
    </div>
  );
};
