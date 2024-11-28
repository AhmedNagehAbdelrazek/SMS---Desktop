import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CameraOutlined } from '@ant-design/icons';
import { Button, Descriptions, Image, Badge, Select, Slider, Input, Switch } from 'antd';
import { useAlert } from '../context/AlertContext';
import { QrReader } from 'react-qr-reader';

export default function Attend() {
  const qrReaderRef = useRef();
  const { addAlert } = useAlert();
  const [student, setStudent] = useState(null);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [homework, setHomework] = useState(10);
  const [qrCodeResult, setQrCodeResult] = useState(null);
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    if (qrCodeResult) {
      fetchStudentDetails(qrCodeResult);
    }
  }, [qrCodeResult]);

  useEffect(() => {
    const video = qrReaderRef.current?.video?.getVideoTracks
      ? qrReaderRef.current?.video
      : null;

    if (video) {
      video.style.transform = 'scaleX(-1)'; // Flip horizontally
    }
  }, []);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
      const videoDevices = deviceInfos.filter((device) => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId);
      }
    });
  }, []);

  const fetchStudentDetails = (id) => {
    axios
      .get(`http://localhost:65000/api/student/${id}`)
      .then((response) => {
        setStudent(response.data);
        fetchActiveGroup();
        fetchGroups();
        if (response.data.group_id) {
          fetchGroupDetails(response.data.group_id);
        }
      })
      .catch((error) => {
        addAlert('حدث خطأ أثناء مسح رمز الاستجابة السريعة', '', 'error', 2);
        console.error('Error fetching student:', error);
        setStudent(null); // Show empty state if student is not found
      });
  };

  const handleGroupChange = (groupId) => {
    const formData = new FormData();
    formData.append('group_id', groupId);
    axios
      .patch(`http://localhost:65000/api/student/${student.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        addAlert('تم تحديث بيانات الطالب بنجاح', '', 'success', 3);
        setStudent({ ...student, group_id: groupId });
        fetchGroupDetails(groupId);
      })
      .catch((error) => {
        console.error('Error updating student:', error);
        addAlert('حدث خطأ أثناء تحديث بيانات الطالب', '', 'error');
      });
  };

  const fetchActiveGroup = () => {
    axios
      .get(`http://localhost:65000/api/group?active=true`)
      .then((response) => {
        setActiveGroup(response.data);
        setSelectedGroup(response.data.id); // Default to active group
      })
      .catch((error) => {
        console.error('Error fetching active group:', error);
        addAlert('حدث خطأ أثناء جلب المجموعة النشطة', '', 'error');
      });
  };

  const fetchGroups = () => {
    axios
      .get(`http://localhost:65000/api/group`)
      .then((response) => {
        setGroups(response.data);
      })
      .catch((error) => {
        console.error('Error fetching groups:', error);
        addAlert('حدث خطأ أثناء جلب المجموعات', '', 'error');
      });
  };

  const fetchGroupDetails = (groupId) => {
    axios
      .get(`http://localhost:65000/api/group/${groupId}`)
      .then((response) => {
        setActiveGroup(response.data);
      })
      .catch((error) => {
        console.error('Error fetching group details:', error);
        addAlert('حدث خطأ أثناء جلب تفاصيل المجموعة', '', 'error');
      });
  };

  const handleAttend = () => {
    const data = {
      studentId: student.id,
      homework,
    };
    if (selectedGroup) {
      data.groupId = selectedGroup;
    }

    axios
      .post(`http://localhost:65000/api/attendance/attend`, data)
      .then(() => {
        addAlert('تم تسجيل الحضور بنجاح', '', 'success', 3);
      })
      .catch((error) => {
        console.error('Error recording attendance:', error);
        addAlert('الطالب مسجل بالفعل', '', 'error', 3);
      });
  };

  const handleScan = (data) => {
    if (data) {
      setQrCodeResult(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  const handleSearch = (e) => {
    const id = e.target.value;
    if (id) {
      fetchStudentDetails(id);
    }
  };

  return (
    <div lang="ar" dir="rtl" className="w-full min-h-full p-4 bg-macos-light-gray text-macos-text font-sans">
      <h2 className="text-2xl font-bold mb-4">تسجيل الحضور</h2>
      <div className="flex justify-between">
        <div className="flex flex-col items-end">
          <div className="relative flex justify-center items-center bg-gray-400 w-60 h-60 rounded-xl overflow-hidden">
            {isScanning ? (
              <QrReader
                delay={700}
                ref={qrReaderRef}
                className='w-full h-full'
                onResult={(result, error) => {
                  if (!!result) {
                    handleScan(result?.text);
                  }
                  3
                  if (!!error) {
                    handleError(error);
                  }
                }}
                videoStyle={{
                  objectFit: 'cover', // Ensures the video fits properly
                }}
                constraints={{ deviceId: selectedDevice }}
              />
            ) : <CameraOutlined className='text-7xl' />}
          </div>
          <Select
            className="mt-2"
            value={selectedDevice}
            onChange={setSelectedDevice}
            style={{ width: '100%' }}
          >
            {devices.map((device) => (
              <Select.Option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </Select.Option>
            ))}
          </Select>
          <div className="mt-2 flex items-center gap-2">
            <span>تفعيل المسح</span>
            <Switch checked={isScanning} onChange={setIsScanning} />
          </div>
          <Input
            className="mt-2"
            placeholder="ابحث عن الطالب برقم الهوية"
            onChange={handleSearch}
          />
        </div>
        {student && (
          <div className="mt-4 p-4 bg-white rounded-xl w-3/4">
            <div className="flex flex-col py-12 gap-10 items-center">
              <div className="flex justify-center items-center flex-col gap-4">
                <div className="w-40 aspect-square rounded-lg overflow-hidden bg-gray-200 flex justify-center items-center">
                  {student.avatar ? (
                    <Image
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
                  {student.blocked && (
                    <span className="text-red-500 text-lg mt-2">محظور</span>
                  )}
                </div>
              </div>
              <div className="w-4/5">
                <Descriptions title="معلومات الطالب" bordered>
                  <Descriptions.Item label="الاسم">{student.name}</Descriptions.Item>
                  <Descriptions.Item label="رقم الهاتف">{student.phone_number}</Descriptions.Item>
                  <Descriptions.Item label="الحالة">
                    {student.blocked ? (
                      <Badge status="error" text="محظور" />
                    ) : (
                      <Badge status="success" text="نشط" />
                    )}
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions title="تفاصيل المجموعة" bordered className="mt-4">
                  {student.group_id ? (
                    <>
                      <Descriptions.Item label="اسم المجموعة">{activeGroup?.name}</Descriptions.Item>
                      <Descriptions.Item label="رقم المجموعة">{activeGroup?.id}</Descriptions.Item>
                      <Descriptions.Item label="عدد المحاضرات">{activeGroup?.last_lecture_number}</Descriptions.Item>
                      <Descriptions.Item label="اليوم">{activeGroup?.day_of_week}</Descriptions.Item>
                      <Descriptions.Item label="الوقت">{activeGroup?.time_of_day}</Descriptions.Item>
                    </>
                  ) : (
                    <Descriptions.Item label="المجموعة">
                      <div className='w-full flex gap-5'>
                        <Select
                          className='max-w-80 w-full'
                          value={selectedGroup}
                          onSelect={handleGroupChange}
                          showSearch        
                          getPopupContainer={(triggerNode) => triggerNode.parentNode}
                        >
                          {groups.map((group) => (
                            <Select.Option key={group.id} value={group.id}>
                              {group.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                    </Descriptions.Item>
                  )}
                </Descriptions>
                <div className="mt-4 flex items-center gap-4">
                  <h3 className="text-xl font-bold mb-4">الواجب</h3>
                  <Slider
                    min={0}
                    max={10}
                    defaultValue={10}
                    onChange={setHomework}
                    value={homework}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={homework}
                    onChange={(e) => setHomework(Number(e.target.value))}
                    className="w-16"
                  />
                </div>
                <Button
                  type="primary"
                  className="mt-4"
                  onClick={handleAttend}
                >
                  تسجيل الحضور
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
