import { Modal } from 'antd';

export default function ConfirmActionModal({
  action,
  visible,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      title={`تأكيد ${action}`}
      open={visible}
      onOk={onConfirm}
      onCancel={onCancel}
    >
      <p>هل أنت متأكد أنك تريد {action} هذا الطالب؟</p>
    </Modal>
  );
}
