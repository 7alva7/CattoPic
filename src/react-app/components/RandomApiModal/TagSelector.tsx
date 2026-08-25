import { PlusIcon, MinusIcon } from '../ui/icons';

interface TagSelectorProps {
  availableTags: string[];
  includeTags: string[];
  excludeTags: string[];
  onToggleInclude: (tag: string) => void;
  onToggleExclude: (tag: string) => void;
}

export default function TagSelector({
  availableTags,
  includeTags,
  excludeTags,
  onToggleInclude,
  onToggleExclude,
}: TagSelectorProps) {
  const getTagState = (tag: string): 'include' | 'exclude' | 'none' => {
    if (includeTags.includes(tag)) return 'include';
    if (excludeTags.includes(tag)) return 'exclude';
    return 'none';
  };

  const cycleTag = (tag: string) => {
    const state = getTagState(tag);
    if (state === 'none') onToggleInclude(tag);
    else onToggleExclude(tag);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">标签</h3>
        <p className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            包含
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            排除
          </span>
          <span>点击切换</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableTags.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">暂无可用标签</p>
        ) : (
          availableTags.map((tag) => {
            const state = getTagState(tag);
            return (
              <button
                type="button"
                key={tag}
                onClick={() => cycleTag(tag)}
                className={`chip transition-colors ${
                  state === 'include'
                    ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                    : state === 'exclude'
                    ? 'bg-linear-to-r from-red-500 to-rose-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {state === 'include' && <PlusIcon className="h-3.5 w-3.5" />}
                {state === 'exclude' && <MinusIcon className="h-3.5 w-3.5" />}
                {tag}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
