import { useState, useEffect } from 'react';
import { Drawer, Input, Button, Form, Upload, Select, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAlert } from '../../context/AlertContext';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export default function AddNewStudentDrawer({ visible, onClose }) {
  const { addAlert } = useAlert();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
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
    form.validateFields()
      .then((values) => {
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if( values[key] != undefined) {
            formData.append(key, values[key]);
          }
        });
        if (fileList.length > 0) {
          formData.append('avatar', fileList[0].originFileObj);
        }

        axios
          .post('http://localhost:65000/api/student', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then(() => {
            addAlert('تم إضافة الطالب بنجاح', '', 'success', 3);
            onClose();
            form.resetFields();
            setFileList([]);
          })
          .catch((error) => {
            console.error('Error adding student:', error);
            addAlert('حدث خطأ أثناء إضافة الطالب', '', 'error');
          });
      })
      .catch((error) => {
        console.error('Validation failed:', error);
      });
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1)); // Ensure only one image is uploaded
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>اختر صورة</div>
    </div>
  );

  return (
    <Drawer
      open={visible}
      onClose={onClose}
      width={640}
      className='[direction:rtl]'
      placement='left'
      rootClassName='z-[99999]'
      title="إضافة طالب جديد"
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
    >
      <div className="flex flex-col py-12 gap-10 items-center">
        <Form form={form} layout="vertical" className="w-full">
          <Form.Item label="تحديث الصورة">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleUploadChange}
              beforeUpload={() => false}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            {previewImage && (
              <Image
                wrapperStyle={{ display: 'none' }}
                preview={{
                  visible: previewOpen,
                  onVisibleChange: (visible) => setPreviewOpen(visible),
                  afterOpenChange: (visible) => !visible && setPreviewImage(''),
                }}
                src={previewImage}
              />
            )}
          </Form.Item>
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
        </Form>
      </div>
    </Drawer>
  );
}