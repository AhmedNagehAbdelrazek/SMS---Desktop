import { useState, useEffect } from 'react';
import { Drawer, Input, Button, Form, Upload, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAlert } from '../../context/AlertContext';
import { Header } from 'antd/es/layout/layout';

export default function EditStudentDrawer({ visible, onClose, studentId }) {
  const { addAlert } = useAlert();
  const [form] = Form.useForm();
  const [student, setStudent] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (studentId) {
      axios
        .get(`http://localhost:65000/api/student/${studentId}`)
        .then((response) => {
          setStudent(response.data);
          form.setFieldsValue(response.data);
        })
        .catch((error) => {
          console.error('Error fetching student:', error);
          addAlert('حدث خطأ أثناء جلب بيانات الطالب', '', 'error');
        });
    }

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
  }, [studentId, form, addAlert]);

  const handleConfirm = () => {
    form.validateFields()
      .then((values) => {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (values[key] !== student[key]) {
            formData.append(key, values[key]);
          }
        });
        if (fileList.length > 0) {
          formData.append('avatar', fileList[0].originFileObj);
        }

        axios
          .patch(`http://localhost:65000/api/student/${studentId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
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

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  return (
    <Drawer
      open={visible}
      onClose={onClose}
      width={640}
      className='[direction:rtl]'
      placement='left'
      rootClassName='z-[99999]'
      title="تعديل بيانات الطالب"
      footer={
        <div className="flex justify-end gap-4">
          <Button onClick={onClose} className="bg-red-500 text-white rounded-lg">
            إلغاء
          </Button>
          <Button onClick={handleConfirm} className="bg-green-500 text-white rounded-lg">
            تأكيد
          </Button>
        </div>
      }
      // I want to hide the header
      // headerStyle={{ display: 'none' }}
      styles={{ header: { display: 'none' } }}
    >
      {student && (
        <div className="flex flex-col gap-10 items-center">
          <div className="flex justify-center items-center flex-col gap-4">
            <div className="w-52 aspect-square rounded-lg overflow-hidden bg-gray-200 flex justify-center items-center">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="min-w-full min-h-full object-cover"
                />
              ) : (
                <span className="text-2xl text-gray-400">?</span>
              )}
            </div>
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
            <Form.Item name="group_id" label="المجموعة">
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
            <Form.Item label="تحديث الصورة">
              <Upload
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={() => false}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>اختر صورة</Button>
              </Upload>
            </Form.Item>
          </Form>
        </div>
      )}
    </Drawer>
  );
}
