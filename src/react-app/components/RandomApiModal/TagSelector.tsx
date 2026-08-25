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

  const chip = (active: boolean, activeClass: string) =>
    `rounded-full px-3 py-1 text-sm font-medium transition-colors ${
      active ? activeClass : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
    }`;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-slate-700/30">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <PlusIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            包含
            {includeTags.length > 0 && (
              <span className="ml-2 text-xs font-normal text-indigo-600 dark:text-indigo-400">
                {includeTags.length}
              </span>
            )}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableTags.length === 0 ? (
            <p className="text-sm text-gray-400">暂无可用标签</p>
          ) : (
            availableTags.map((tag) => {
              const state = getTagState(tag);
              return (
                <button
                  type="button"
                  key={`include-${tag}`}
                  onClick={() => onToggleInclude(tag)}
                  className={`${chip(state === 'include', 'bg-linear-to-r from-indigo-500 to-purple-500 text-white')} ${
                    state === 'exclude' ? 'opacity-40' : ''
                  }`}
                >
                  {tag}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-slate-700/30">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <MinusIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            排除
            {excludeTags.length > 0 && (
              <span className="ml-2 text-xs font-normal text-red-600 dark:text-red-400">
                {excludeTags.length}
              </span>
            )}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableTags.length === 0 ? (
            <p className="text-sm text-gray-400">暂无可用标签</p>
          ) : (
            availableTags.map((tag) => {
              const state = getTagState(tag);
              return (
                <button
                  type="button"
                  key={`exclude-${tag}`}
                  onClick={() => onToggleExclude(tag)}
                  className={`${chip(state === 'exclude', 'bg-red-500 text-white')} ${
                    state === 'include' ? 'opacity-40' : ''
                  }`}
                >
                  {tag}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
