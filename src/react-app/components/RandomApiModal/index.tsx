import { useState, useMemo, useEffect } from 'react';
import { Link2Icon, Spinner } from '../ui/icons';
import { useTags } from '../../hooks/useTags';
import TagSelector from './TagSelector';
import OrientationSelector from './OrientationSelector';
import FormatSelector from './FormatSelector';
import LinkOutput from './LinkOutput';
import { Modal, ModalPanel, ModalHeader, ModalBody, ModalIconBadge } from '../ui/Modal';

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
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalPanel className="flex min-h-[min(70vh,32rem)] max-h-[min(85vh,40rem)] max-w-2xl flex-col">
        <ModalHeader
          title="随机图 API"
          icon={
            <ModalIconBadge tone="gradient">
              <Link2Icon className="h-5 w-5" />
            </ModalIconBadge>
          }
          onClose={onClose}
          actions={
            <button type="button" onClick={resetAll} className="btn-ghost">
              重置
            </button>
          }
        />

        <ModalBody className="space-y-5">
          {isLoading ? (
            <div className="flex h-full min-h-48 items-center justify-center">
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
        </ModalBody>
      </ModalPanel>
    </Modal>
  );
}
