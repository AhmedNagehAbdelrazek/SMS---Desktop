import { useState, useEffect } from 'react';
import { Drawer, Input, Button, Form, Select } from 'antd';
import axios from 'axios';
import { useAlert } from '../../context/AlertContext';

export default function AddNewExamDrawer({ visible, onClose }) {
  const { addAlert } = useAlert();
  const [form] = Form.useForm();
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    // Fetch groups
    axios
      .get('http://localhost:65000/api/group')
      .then((response) => {
        setGroups(response.data);
      })
      .catch((error) => {
        console.error('Error fetching groups:', error);
        addAlert('حدث خطأ أثناء جلب بيانات المجموعات', '', 'error');
      });
  }, [addAlert]);

  const handleConfirm = () => {
    form
      .validateFields()
      .then((values) => {
        axios
          .post('http://localhost:65000/api/monthexam', values)
          .then(() => {
            addAlert('تم إضافة الامتحان بنجاح', '', 'success', 3);
            onClose();
            form.resetFields();
          })
          .catch((error) => {
            console.error('Error adding exam:', error);
            addAlert('حدث خطأ أثناء إضافة الامتحان', '', 'error');
          });
      })
      .catch((error) => {
        console.error('Validation failed:', error);
      });
  };

  return (
    <Drawer
      open={visible}
      onClose={onClose}
      width={640}
      className="[direction:rtl]"
      placement="left"
      rootClassName="z-[99999]"
      title="إضافة امتحان جديد"
      footer={
        <div className="flex justify-end gap-4">
          <Button
            onClick={onClose}
            className="bg-red-500 text-white rounded-lg"
          >
            إلغاء
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-green-500 text-white rounded-lg"
          >
            تأكيد
          </Button>
        </div>
      }
    >
      <div className="flex flex-col py-12 gap-10 items-center">
        <Form form={form} layout="vertical" className="w-full">
          <Form.Item
            name="groupId"
            label="المجموعة"
            rules={[{ required: true, message: 'الرجاء اختيار المجموعة' }]}
          >
            <Select
              showSearch
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {groups.map((group) => (
                <Select.Option key={group.id} value={group.id} label={group.name}>
                  {group.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="اسم الامتحان"
            rules={[{ required: true, message: 'الرجاء إدخال اسم الامتحان' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="fullMark"
            label="الدرجة الكاملة"
            rules={[{ required: true, message: 'الرجاء إدخال الدرجة الكاملة' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </div>
    </Drawer>
  );
}