import { useState, useEffect } from 'react';
import { useTags } from '../../hooks/useTags';
import TagList from './TagList';
import TagCreateForm from './TagCreateForm';
import TagDeleteConfirm from './TagDeleteConfirm';
import { showToast } from '../ToastContainer';
import { Tag } from '../../types';
import { Spinner, TrashIcon } from '../ui/icons';

export default function TagManagement() {
  const {
    tags,
    isLoading,
    error,
    selectedTags,
    fetchTags,
    createTag,
    renameTag,
    deleteTag,
    deleteTags,
    toggleTagSelection,
    selectAllTags,
    clearSelection,
  } = useTags();

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreate = async (name: string) => {
    setIsProcessing(true);
    const success = await createTag(name);
    setIsProcessing(false);
    if (success) {
      showToast('标签创建成功', 'success');
    } else {
      showToast('标签创建失败', 'error');
    }
    return success;
  };

  const handleRename = async (oldName: string, newName: string) => {
    setIsProcessing(true);
    const success = await renameTag(oldName, newName);
    setIsProcessing(false);
    setEditingTag(null);
    if (success) {
      showToast('标签重命名成功', 'success');
    } else {
      showToast('标签重命名失败', 'error');
    }
  };

  const handleDelete = async (tag: Tag) => {
    setIsProcessing(true);
    const success = await deleteTag(tag.name);
    setIsProcessing(false);
    setDeletingTag(null);
    if (success) {
      showToast('标签删除成功', 'success');
    } else {
      showToast('标签删除失败', 'error');
    }
  };

  const handleBatchDelete = async () => {
    setIsProcessing(true);
    const success = await deleteTags(Array.from(selectedTags));
    setIsProcessing(false);
    setShowBatchDeleteConfirm(false);
    if (success) {
      showToast(`成功删除 ${selectedTags.size} 个标签`, 'success');
    } else {
      showToast('批量删除失败', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner className="h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
        {error}
        <button type="button" onClick={fetchTags} className="btn-ghost ml-2">
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <TagCreateForm onSubmit={handleCreate} isProcessing={isProcessing} />

      {selectedTags.size > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 dark:border-indigo-800 dark:bg-indigo-900/20">
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            已选择 {selectedTags.size} 个标签
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={clearSelection} className="btn-ghost">
              取消选择
            </button>
            <button
              type="button"
              onClick={() => setShowBatchDeleteConfirm(true)}
              className="btn-danger gap-1.5"
            >
              <TrashIcon className="h-4 w-4" />
              批量删除
            </button>
          </div>
        </div>
      )}

      <TagList
        tags={tags}
        selectedTags={selectedTags}
        editingTag={editingTag}
        isProcessing={isProcessing}
        onToggleSelect={toggleTagSelection}
        onSelectAll={selectAllTags}
        onEdit={setEditingTag}
        onCancelEdit={() => setEditingTag(null)}
        onSave={handleRename}
        onDelete={setDeletingTag}
      />

      <TagDeleteConfirm
        isOpen={!!deletingTag}
        tagName={deletingTag?.name || ''}
        tagCount={deletingTag?.count || 0}
        isProcessing={isProcessing}
        onCancel={() => setDeletingTag(null)}
        onConfirm={() => deletingTag && handleDelete(deletingTag)}
      />

      <TagDeleteConfirm
        isOpen={showBatchDeleteConfirm}
        tagName={`${selectedTags.size} 个标签`}
        isBatch
        isProcessing={isProcessing}
        onCancel={() => setShowBatchDeleteConfirm(false)}
        onConfirm={handleBatchDelete}
      />
    </div>
  );
}
