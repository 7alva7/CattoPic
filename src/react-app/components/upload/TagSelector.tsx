import { useState } from 'react'
import { TagIcon, PlusIcon, Cross1Icon } from '../ui/icons'

interface TagSelectorProps {
  selectedTags: string[]
  availableTags: string[]
  onTagsChange: (tags: string[]) => void
  onNewTagCreated?: () => void
}

export default function TagSelector({ selectedTags, availableTags, onTagsChange, onNewTagCreated }: TagSelectorProps) {
  const [inputTag, setInputTag] = useState('')

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tag = e.target.value
    if (tag && !selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag])
    }
    e.target.value = ''
  }

  const handleRemoveTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag))
  }

  const handleAddTag = () => {
    if (inputTag.trim() && !selectedTags.includes(inputTag.trim())) {
      onTagsChange([...selectedTags, inputTag.trim()])
      setInputTag('')
      onNewTagCreated?.()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center">
        <TagIcon className="mr-2 h-5 w-5 text-indigo-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">标签</span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          onChange={handleTagChange}
          value=""
          className="input-primary sm:flex-1"
        >
          <option value="">选择已有标签</option>
          {availableTags
            .filter(tag => !selectedTags.includes(tag))
            .map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
        </select>

        <div className="flex gap-2 sm:flex-1">
          <input
            type="text"
            value={inputTag}
            onChange={(e) => setInputTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="自定义标签"
            className="input-primary flex-1"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="btn-primary px-3"
            aria-label="添加标签"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <span
              key={tag}
              className="chip bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="rounded-full p-0.5 hover:bg-white/20"
                aria-label={`移除 ${tag}`}
              >
                <Cross1Icon className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
