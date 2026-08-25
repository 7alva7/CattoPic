import { useEffect, useState } from 'react';
import { Tag } from '../../types';
import { CheckIcon, TrashIcon } from '../ui/icons';
import { Pencil } from 'lucide-react';

interface TagItemProps {
  tag: Tag;
  isSelected: boolean;
  isEditing: boolean;
  isProcessing: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (newName: string) => void;
  onDelete: () => void;
}

export default function TagItem({
  tag,
  isSelected,
  isEditing,
  isProcessing,
  onToggleSelect,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: TagItemProps) {
  const [draft, setDraft] = useState(tag.name);

  useEffect(() => {
    if (isEditing) setDraft(tag.name);
  }, [isEditing, tag.name]);

  if (isEditing) {
    return (
      <form
        className="flex items-center gap-2 px-4 py-2 bg-indigo-50/60 dark:bg-indigo-900/15"
        onSubmit={(e) => {
          e.preventDefault();
          const next = draft.trim();
          if (!next || next === tag.name) return;
          onSave(next);
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="input-primary flex-1"
          autoFocus
          disabled={isProcessing}
        />
        <button type="button" onClick={onCancelEdit} className="btn-secondary" disabled={isProcessing}>
          取消
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isProcessing || !draft.trim() || draft.trim() === tag.name}
        >
          保存
        </button>
      </form>
    );
  }

  return (
    <div
      className={`flex items-center px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${
        isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
      }`}
    >
      <button
        type="button"
        onClick={onToggleSelect}
        className={`flex items-center justify-center w-5 h-5 rounded border transition-colors mr-4 ${
          isSelected
            ? 'bg-indigo-500 border-indigo-500'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
        }`}
        aria-label={isSelected ? '取消选择' : '选择标签'}
      >
        {isSelected && <CheckIcon className="h-3.5 w-3.5 text-white" />}
      </button>

      <div className="flex-1 grid grid-cols-12 gap-4 items-center min-w-0">
        <div className="col-span-6 min-w-0">
          <span className="chip bg-linear-to-r from-indigo-500 to-purple-500 text-white">
            {tag.name}
          </span>
        </div>

        <div className="col-span-3 text-center">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {tag.count} 张
          </span>
        </div>

        <div className="col-span-3 flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="btn-icon-sm hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            title="重命名"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="btn-icon-sm hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="删除"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
