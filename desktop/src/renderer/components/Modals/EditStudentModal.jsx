import { useState, useEffect } from 'react';
import { Modal, Input, Button, Form } from 'antd';
import axios from 'axios';
import { useAlert } from '../../context/AlertContext';

export default function EditStudentModal({ visible, onClose, studentId }) {
  const { addAlert } = useAlert();
  const [form] = Form.useForm();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (studentId) {
      axios
        .get(`http://localhost:3000/api/student/${studentId}`)
        .then((response) => {
          setStudent(response.data);
          form.setFieldsValue(response.data);
        })
        .catch((error) => {
          console.error('Error fetching student:', error);
          addAlert('حدث خطأ أثناء جلب بيانات الطالب', '', 'error');
        });
    }
  }, [studentId, form, addAlert]);

  const handleConfirm = () => {
    form.validateFields()
      .then((values) => {
        axios
          .put(`http://localhost:3000/api/student/${studentId}`, values)
          .then(() => {
            addAlert('تم تحديث بيانات الطالب بنجاح', '', 'success', 3);
            onClose();
          })
          .catch((error) => {
            console.error('Error updating student:', error);
            addAlert('حدث خطأ أثناء تحديث بيانات الطالب', '', 'error');
          });
      })
      .catch((error) => {
        console.error('Validation failed:', error);
      });
  };

  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      footer={null}
      className="rounded-xl"
    >
      {student && (
        <div className="flex flex-col py-12 gap-10 items-center">
          <div className="flex justify-center items-center flex-col gap-4">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
                className="w-52 aspect-square rounded-lg"
              />
            ) : (
              <div className="w-52 aspect-square rounded-lg bg-gray-200 flex justify-center items-center">
                <span className="text-2xl text-gray-400">?</span>
              </div>
            )}
            <div className="flex flex-col justify-center w-full items-center">
              <h2 className="text-2xl font-bold">{student.name}</h2>
              <span className="text-textSecondary">#{student.id}</span>
            </div>
          </div>
          <Form form={form} layout="vertical" className="w-full">
            <Form.Item name="name" label="الاسم" rules={[{ required: true, message: 'الرجاء إدخال الاسم' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone_number" label="رقم الهاتف" rules={[{ required: true, message: 'الرجاء إدخال رقم الهاتف' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="parent_phone_1" label="هاتف ولي الأمر 1">
              <Input />
            </Form.Item>
            <Form.Item name="parent_phone_2" label="هاتف ولي الأمر 2">
              <Input />
            </Form.Item>
            <Form.Item name="parent_phone_3" label="هاتف ولي الأمر 3">
              <Input />
            </Form.Item>
          </Form>
          <div className="flex justify-end gap-4 w-full">
            <Button onClick={onClose} className="bg-red-500 text-white rounded-lg">
              إلغاء
            </Button>
            <Button onClick={handleConfirm} className="bg-green-500 text-white rounded-lg">
              تأكيد
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
