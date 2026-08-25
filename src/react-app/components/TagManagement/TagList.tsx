import { motion } from 'motion/react';
import TagItem from './TagItem';
import { Tag } from '../../types';
import { TagIcon, CheckIcon } from '../ui/icons';

interface TagListProps {
  tags: Tag[];
  selectedTags: Set<string>;
  onToggleSelect: (name: string) => void;
  onSelectAll: () => void;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
}

export default function TagList({
  tags,
  selectedTags,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete,
}: TagListProps) {
  const allSelected = tags.length > 0 && selectedTags.size === tags.length;

  if (tags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-6 py-12 text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <TagIcon className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
        <p className="text-lg font-medium">暂无标签</p>
        <p className="mt-2 text-sm">请创建您的第一个标签</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700">
      {/* 表头 */}
      <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={onSelectAll}
          className={`flex items-center justify-center w-5 h-5 rounded border transition-colors mr-4 ${
            allSelected
              ? 'bg-indigo-500 border-indigo-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
          }`}
        >
          {allSelected && <CheckIcon className="h-3.5 w-3.5 text-white" />}
        </button>
        <div className="flex-1 grid grid-cols-12 gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
          <span className="col-span-6">标签名称</span>
          <span className="col-span-3 text-center">使用数量</span>
          <span className="col-span-3 text-right">操作</span>
        </div>
      </div>

      {/* 标签项列表 */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {tags.map((tag, index) => (
          <motion.div
            key={tag.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <TagItem
              tag={tag}
              isSelected={selectedTags.has(tag.name)}
              onToggleSelect={() => onToggleSelect(tag.name)}
              onEdit={() => onEdit(tag)}
              onDelete={() => onDelete(tag)}
            />
          </motion.div>
        ))}
      </div>

      {/* 总计 */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        共 {tags.length} 个标签
      </div>
    </div>
  );
}
