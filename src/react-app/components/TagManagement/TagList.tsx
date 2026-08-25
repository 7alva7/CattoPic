import TagItem from './TagItem';
import { Tag } from '../../types';
import { TagIcon, CheckIcon } from '../ui/icons';

interface TagListProps {
  tags: Tag[];
  selectedTags: Set<string>;
  editingTag: Tag | null;
  isProcessing: boolean;
  onToggleSelect: (name: string) => void;
  onSelectAll: () => void;
  onEdit: (tag: Tag) => void;
  onCancelEdit: () => void;
  onSave: (oldName: string, newName: string) => void;
  onDelete: (tag: Tag) => void;
}

export default function TagList({
  tags,
  selectedTags,
  editingTag,
  isProcessing,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: TagListProps) {
  const allSelected = tags.length > 0 && selectedTags.size === tags.length;

  if (tags.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-6 py-12 text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <TagIcon className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p className="font-medium">暂无标签</p>
        <p className="mt-1 text-sm">在上方输入名称后创建</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center border-b border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-slate-700/50">
        <button
          type="button"
          onClick={onSelectAll}
          className={`mr-4 flex h-5 w-5 items-center justify-center rounded border transition-colors ${
            allSelected
              ? 'border-indigo-500 bg-indigo-500'
              : 'border-gray-300 hover:border-indigo-400 dark:border-gray-600'
          }`}
          aria-label="全选"
        >
          {allSelected && <CheckIcon className="h-3.5 w-3.5 text-white" />}
        </button>
        <div className="grid flex-1 grid-cols-12 gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
          <span className="col-span-6">标签</span>
          <span className="col-span-3 text-center">使用数量</span>
          <span className="col-span-3 text-right">操作</span>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {tags.map((tag) => (
          <TagItem
            key={tag.name}
            tag={tag}
            isSelected={selectedTags.has(tag.name)}
            isEditing={editingTag?.name === tag.name}
            isProcessing={isProcessing}
            onToggleSelect={() => onToggleSelect(tag.name)}
            onEdit={() => onEdit(tag)}
            onCancelEdit={onCancelEdit}
            onSave={(newName) => onSave(tag.name, newName)}
            onDelete={() => onDelete(tag)}
          />
        ))}
      </div>

      <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-700 dark:bg-slate-700/50 dark:text-gray-400">
        共 {tags.length} 个标签
      </div>
    </div>
  );
}
