import { TagIcon } from './ui/icons';
import TagManagement from './TagManagement';
import { Modal, ModalPanel, ModalHeader, ModalBody, ModalIconBadge } from './ui/Modal';

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TagManagementModal({ isOpen, onClose }: TagManagementModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalPanel className="flex h-[min(85vh,40rem)] max-w-2xl flex-col">
        <ModalHeader
          title="标签管理"
          icon={
            <ModalIconBadge>
              <TagIcon className="h-5 w-5" />
            </ModalIconBadge>
          }
          onClose={onClose}
        />
        <ModalBody className="flex flex-col">
          <TagManagement />
        </ModalBody>
      </ModalPanel>
    </Modal>
  );
}
