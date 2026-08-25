import { useState, useMemo, useEffect } from 'react';
import { Link2Icon, Spinner } from '../ui/icons';
import { useTags } from '../../hooks/useTags';
import TagSelector from './TagSelector';
import OrientationSelector from './OrientationSelector';
import FormatSelector from './FormatSelector';
import LinkOutput from './LinkOutput';
import { Dialog, DialogPanel, DialogHeader } from '../ui/Dialog';

interface RandomApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type Orientation = 'auto' | 'landscape' | 'portrait';
export type Format = 'auto' | 'original' | 'webp' | 'avif';

export default function RandomApiModal({ isOpen, onClose }: RandomApiModalProps) {
  const { tags, isLoading } = useTags();

  const [includeTags, setIncludeTags] = useState<string[]>([]);
  const [excludeTags, setExcludeTags] = useState<string[]>([]);
  const [orientation, setOrientation] = useState<Orientation>('auto');
  const [format, setFormat] = useState<Format>('auto');
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const generatedUrl = useMemo(() => {
    const resolvedBase = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    const url = new URL('/api/random', resolvedBase);

    if (includeTags.length > 0) {
      url.searchParams.set('tags', includeTags.join(','));
    }
    if (excludeTags.length > 0) {
      url.searchParams.set('exclude', excludeTags.join(','));
    }
    if (orientation !== 'auto') {
      url.searchParams.set('orientation', orientation);
    }
    if (format !== 'auto') {
      url.searchParams.set('format', format);
    }

    return url.toString();
  }, [baseUrl, includeTags, excludeTags, orientation, format]);

  const toggleIncludeTag = (tagName: string) => {
    setIncludeTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(t => t !== tagName);
      }
      setExcludeTags(ex => ex.filter(t => t !== tagName));
      return [...prev, tagName];
    });
  };

  const toggleExcludeTag = (tagName: string) => {
    setExcludeTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(t => t !== tagName);
      }
      setIncludeTags(inc => inc.filter(t => t !== tagName));
      return [...prev, tagName];
    });
  };

  const resetAll = () => {
    setIncludeTags([]);
    setExcludeTags([]);
    setOrientation('auto');
    setFormat('auto');
  };

  const tagNames = tags.map(t => t.name);

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogPanel className="flex max-h-[min(82vh,40rem)] max-w-2xl flex-col">
        <DialogHeader
          title="随机图 API"
          subtitle="按标签、方向和格式生成链接"
          tone="gradient"
          icon={<Link2Icon className="h-6 w-6" />}
          onClose={onClose}
          actions={
            <button type="button" onClick={resetAll} className="btn-secondary">
              重置
            </button>
          }
        />
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="h-8 w-8 text-indigo-500" />
            </div>
          ) : (
            <>
              <TagSelector
                availableTags={tagNames}
                includeTags={includeTags}
                excludeTags={excludeTags}
                onToggleInclude={toggleIncludeTag}
                onToggleExclude={toggleExcludeTag}
              />
              <OrientationSelector value={orientation} onChange={setOrientation} />
              <FormatSelector value={format} onChange={setFormat} />
              <LinkOutput url={generatedUrl} />
            </>
          )}
        </div>
      </DialogPanel>
    </Dialog>
  );
}
