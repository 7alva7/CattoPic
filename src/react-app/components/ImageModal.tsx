import { useState } from "react";
import { ImageFile } from "../types";
import { ImageData } from "../types/image";
import { ImageInfo } from "./ImageInfo";
import { ImageUrls } from "./ImageUrls";
import { DeleteConfirm } from "./DeleteConfirm";
import { ImagePreview } from "./ImagePreview";
import { TrashIcon } from "./ui/icons";
import { Dialog, DialogPanel, DialogClose } from "./ui/Dialog";

type ImageType = ImageFile | (ImageData & { status: 'success' });

interface ImageModalProps {
  image: ImageType | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => Promise<void>;
}

export default function ImageModal({ image, isOpen, onClose, onDelete }: ImageModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClose = () => {
    setShowDeleteConfirm(false);
    setIsDeleting(false);
    onClose();
  };

  const handleDelete = () => {
    if (!image || !onDelete || !image.id) return;

    setShowDeleteConfirm(false);
    handleClose();

    onDelete(image.id).catch((err) => {
      console.error("删除失败:", err);
    });
  };

  if (!image) return null;

  const canDelete = Boolean(onDelete && image.id);

  return (
    <Dialog isOpen={isOpen} onClose={handleClose}>
          <DialogPanel className="flex h-[min(72vh,30rem)] max-w-none w-[min(92vw,52rem)] flex-col dark:bg-gray-900">
            <div className="relative shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

              <div className="relative px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1 pr-4">
                    <h3 className="truncate text-lg font-bold leading-tight text-white">
                      {image.originalName}
                    </h3>
                    <p className="mt-1 text-sm text-white/70">图片详情</p>
                  </div>
                  <DialogClose onClick={handleClose} light />
                </div>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[11rem_minmax(0,1fr)] lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:grid-rows-none">
              <div className="relative min-h-0 overflow-hidden bg-slate-950">
                <ImagePreview image={image} priority fill />
              </div>

              <div className="flex min-h-0 flex-col border-t border-gray-100 dark:border-gray-800 lg:border-t-0 lg:border-l">
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/30">
                    <ImageInfo image={image} />
                  </div>

                  <div className="px-5 py-4">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-5 w-1 rounded-full bg-gradient-to-b from-violet-500 to-purple-500" />
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">快速复制</h4>
                    </div>
                    <ImageUrls image={image} />
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/80 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/50">
                  {showDeleteConfirm ? (
                    <div className="min-w-0 flex-1">
                      <DeleteConfirm
                        isDeleting={isDeleting}
                        onCancel={() => setShowDeleteConfirm(false)}
                        onConfirm={handleDelete}
                      />
                    </div>
                  ) : (
                    <>
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="group flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <TrashIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                          删除图片
                        </button>
                      ) : (
                        <div />
                      )}
                      <button type="button" onClick={handleClose} className="btn-secondary">
                        关闭
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </DialogPanel>
    </Dialog>
  );
}
