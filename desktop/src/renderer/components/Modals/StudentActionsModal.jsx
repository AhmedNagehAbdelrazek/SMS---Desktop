import { Modal, Button } from "antd";
import { DeleteOutlined, BlockOutlined } from "@ant-design/icons";

export default function StudentActionsModal({ student, visible, onClose, onAction }) {
  return (
    <Modal
      title={`#${student?.id}`}
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      <div>
        <p>الاسم: {student?.name}</p>
        <p>رقم الهاتف: {student?.phone_number}</p>
      </div>
      <Button onClick={() => onAction("حضور")}>حضور</Button>
      <Button onClick={() => onAction("حذف")} danger>
        <DeleteOutlined /> حذف
      </Button>
      <Button onClick={() => onAction("حظر")} style={{ backgroundColor: "black", color: "white" }}>
        <BlockOutlined /> حظر
      </Button>
    </Modal>
  );
}
