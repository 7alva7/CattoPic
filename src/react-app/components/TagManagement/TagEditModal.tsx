import { useState } from 'react';
import { Tag } from '../../types';
import { Spinner, CheckIcon } from '../ui/icons';
import { Pencil } from 'lucide-react';
import { Dialog, DialogPanel, DialogHeader } from '../ui/Dialog';

interface TagEditModalProps {
  tag: Tag | null;
  isOpen: boolean;
  isProcessing: boolean;
  onClose: () => void;
  onSubmit: (oldName: string, newName: string) => void;
}

function TagEditModalContent({
  tag,
  isProcessing,
  onClose,
  onSubmit,
}: {
  tag: Tag;
  isProcessing: boolean;
  onClose: () => void;
  onSubmit: (oldName: string, newName: string) => void;
}) {
  const [newName, setNewName] = useState(tag.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newName.trim() === tag.name) return;
    onSubmit(tag.name, newName.trim());
  };

  return (
    <DialogPanel className="max-w-md">
      <DialogHeader
        title="编辑标签"
        icon={<Pencil className="h-5 w-5" />}
        onClose={onClose}
      />
      <form onSubmit={handleSubmit}>
        <div className="px-6 py-5">
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            标签名称
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-slate-700 dark:text-white dark:focus:ring-indigo-400"
            autoFocus
            disabled={isProcessing}
          />
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={isProcessing}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!newName.trim() || newName.trim() === tag.name || isProcessing}
            className="btn-primary gap-2"
          >
            {isProcessing ? (
              <>
                <Spinner className="h-4 w-4" />
                保存中
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                保存
              </>
            )}
          </button>
        </div>
      </form>
    </DialogPanel>
  );
}

export default function TagEditModal({ tag, isOpen, isProcessing, onClose, onSubmit }: TagEditModalProps) {
  return (
    <Dialog isOpen={isOpen && !!tag} onClose={onClose}>
      {tag && (
        <TagEditModalContent
          key={tag.name}
          tag={tag}
          isProcessing={isProcessing}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}
