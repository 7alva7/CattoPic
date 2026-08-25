import { useState } from 'react';
import { PlusIcon, Spinner } from '../ui/icons';

interface TagCreateFormProps {
  onSubmit: (name: string) => Promise<boolean>;
  isProcessing: boolean;
}

export default function TagCreateForm({ onSubmit, isProcessing }: TagCreateFormProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await onSubmit(name.trim());
    setIsSubmitting(false);

    if (success) {
      setName('');
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-slate-700/30">
      <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
        创建新标签
      </h3>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="输入标签名称..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
          disabled={isProcessing}
        />
        <button
          type="submit"
          disabled={!name.trim() || isProcessing || isSubmitting}
          className="btn-primary gap-2"
        >
          {isSubmitting ? (
            <>
              <Spinner className="h-4 w-4" />
              <span>创建中...</span>
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4" />
              <span>创建标签</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
