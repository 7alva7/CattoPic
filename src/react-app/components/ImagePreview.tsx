import { ImageFile } from '../types';
import { ImageData } from '../types/image';
import { getFullUrl } from '../utils/baseUrl';
import { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { DownloadIcon } from './ui/icons';

type ImageType = ImageFile | (ImageData & { status: 'success' });

interface ImagePreviewProps {
  image: ImageType;
  priority?: boolean;
  onLoad?: () => void;
  quality?: number;
}

export const ImagePreview = ({
  image,
  priority = false,
  onLoad,
}: ImagePreviewProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const imageUrl = getFullUrl(image.urls?.webp || image.urls?.original || '');
  const format = (image.format || '').toLowerCase();

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
    <div className="relative h-full w-full flex items-center justify-center">
      <img
        src={imageUrl}
        alt={image.originalName || ''}
        className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoadComplete}
        onError={() => setError('Failed to load image')}
      />
      {isLoading && <LoadingSpinner />}
      {format === 'gif' && (
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
