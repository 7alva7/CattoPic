import { TagIcon } from './ui/icons';
import TagManagement from './TagManagement';
import { Dialog, DialogPanel, DialogHeader } from './ui/Dialog';

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TagManagementModal({ isOpen, onClose }: TagManagementModalProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogPanel className="flex max-h-[min(82vh,40rem)] max-w-2xl flex-col">
        <DialogHeader
          title="标签管理"
          subtitle="创建、重命名或删除标签"
          icon={<TagIcon className="h-6 w-6" />}
          onClose={onClose}
        />
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <TagManagement />
        </div>
      </DialogPanel>
    </Dialog>
  );
}
