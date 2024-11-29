import { useState, useEffect } from 'react';
import { Drawer, Input, Button, Form, Select, TimePicker } from 'antd';
import axios from 'axios';
import { useAlert } from '../../context/AlertContext';
import moment from 'moment';

export default function AddNewGroupDrawer({ visible, onClose }) {
  const { addAlert } = useAlert();
  const [form] = Form.useForm();

  const handleConfirm = () => {
    form
      .validateFields()
      .then((values) => {
        // Format the time_of_day value to HH:mm:ss
        values.time_of_day = values.time_of_day.format('HH:mm:ss');

        axios
          .post('http://localhost:65000/api/group', values)
          .then(() => {
            addAlert('تم إضافة المجموعة بنجاح', '', 'success', 3);
            onClose();
            form.resetFields();
          })
          .catch((error) => {
            console.error('Error adding group:', error);
            addAlert('حدث خطأ أثناء إضافة المجموعة', '', 'error');
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
      title="إضافة مجموعة جديدة"
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
            name="name"
            label="اسم المجموعة"
            rules={[{ required: true, message: 'الرجاء إدخال اسم المجموعة' }]}
          >
            <Input />
          </Form.Item>
          <div className="flex gap-5">
            <Form.Item
              name="day_of_week"
              className="w-4/5"
              label="اليوم"
              rules={[{ required: true, message: 'الرجاء إدخال اليوم' }]}
            >
              <Select
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              >
                <Select.Option value="1">السبت</Select.Option>
                <Select.Option value="2">الأحد</Select.Option>
                <Select.Option value="3">الإثنين</Select.Option>
                <Select.Option value="4">الثلاثاء</Select.Option>
                <Select.Option value="5">الأربعاء</Select.Option>
                <Select.Option value="6">الخميس</Select.Option>
                <Select.Option value="7">الجمعة</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              lang="ar"
              dir="rtl"
              name="time_of_day"
              label="الوقت"
              rules={[{ required: true, message: 'الرجاء إدخال الوقت' }]}
            >
              <TimePicker
                lang="ar"
                dir="rtl"
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                format="HH:mm a"
              />
            </Form.Item>
          </div>
          <Form.Item
            name="preiod"
            label="الفترة"
            rules={[{ required: true, message: 'الرجاء إدخال الفترة' }]}
          >
            <Input type="number" />
          </Form.Item>
        </Form>
      </div>
    </Drawer>
  );
}
