import { useState } from 'react';
import { ImageFile } from '../types';
import { ImageData } from '../types/image';
import { previewSrc } from '../utils/cdnImage';
import { LoadingSpinner } from './LoadingSpinner';
import { DownloadIcon } from './ui/icons';

type ImageType = ImageFile | (ImageData & { status: 'success' });

interface ImagePreviewProps {
  image: ImageType;
  priority?: boolean;
  fill?: boolean;
  onLoad?: () => void;
}

export const ImagePreview = ({
  image,
  priority = false,
  fill = false,
  onLoad,
}: ImagePreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const format = (image.format || '').toLowerCase();
  const isGif = format === 'gif';
  const imageUrl = previewSrc(image.urls?.original || '', isGif);

  const handleLoadComplete = () => {
    setIsLoading(false);
    onLoad?.();
  };

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
        <span>Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${fill ? 'bg-slate-950' : 'flex items-center justify-center bg-black/5 dark:bg-black/30 min-h-[12rem]'}`}>
      {imageUrl && (
        <img
          src={imageUrl}
          alt={image.originalName || ''}
          className={fill
            ? `absolute inset-0 h-full w-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`
            : `max-h-[50vh] max-w-full object-contain ${isLoading ? 'opacity-0' : 'opacity-100'}`
          }
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoadComplete}
          onError={() => setError('Failed to load image')}
        />
      )}
      {isLoading && <LoadingSpinner />}
      {isGif && imageUrl && (
        <a
          href={imageUrl}
          download={image.originalName}
          className="absolute bottom-4 right-4 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full shadow-lg transition-colors duration-300"
          onClick={(e) => e.stopPropagation()}
          title="下载GIF"
        >
          <DownloadIcon className="h-5 w-5" />
        </a>
      )}
    </div>
  );
};
