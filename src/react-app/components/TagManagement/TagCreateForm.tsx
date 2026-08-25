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
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="输入新标签名称"
        className="input-primary flex-1"
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
            创建中
          </>
        ) : (
          <>
            <PlusIcon className="h-4 w-4" />
            创建
          </>
        )}
      </button>
    </form>
  );
}
