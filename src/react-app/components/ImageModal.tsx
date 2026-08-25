import { useState } from "react";
import { ImageFile } from "../types";
import { ImageData } from "../types/image";
import { ImageInfo } from "./ImageInfo";
import { ImageUrls } from "./ImageUrls";
import { DeleteConfirm } from "./DeleteConfirm";
import { ImagePreview } from "./ImagePreview";
import { TrashIcon } from "./ui/icons";
import { Modal, ModalPanel, ModalCloseButton } from "./ui/Modal";

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

  const canDelete = Boolean(onDelete && image?.id);

  return (
    <Modal isOpen={isOpen && !!image} onClose={handleClose}>
      {image && (
          <ModalPanel className="flex h-[min(88vh,46rem)] w-[min(96vw,80rem)] max-w-none flex-col">
            <div className="relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

              <div className="relative flex items-center justify-between gap-3 px-6 py-3.5">
                <h3 className="min-w-0 truncate text-base font-bold leading-tight text-white">
                  {image.originalName}
                </h3>
                <ModalCloseButton onClick={handleClose} light />
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.9fr)]">
              <div className="min-h-[40vh] border-b border-gray-100 dark:border-gray-800 lg:min-h-0 lg:border-b-0 lg:border-r">
                <ImagePreview image={image} priority />
              </div>

              <div className="flex min-h-0 flex-col">
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/30">
                    <ImageInfo image={image} />
                  </div>
                  <div className="px-5 py-4">
                    <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">链接</h4>
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
                          className="btn-ghost text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <TrashIcon className="mr-1.5 h-4 w-4" />
                          删除
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
          </ModalPanel>
      )}
    </Modal>
  );
}
