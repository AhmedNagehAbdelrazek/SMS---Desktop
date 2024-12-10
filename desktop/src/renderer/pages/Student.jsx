import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  FloatButton,
  Button,
  Descriptions,
  Image,
  Badge,
  QRCode,
  Select,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useParams, Link } from 'react-router-dom';
import { SearchBar } from '../components/Bars';
import { StudentTable } from '../components/Tables';
import { ConfirmActionModal } from '../components/Modals';
import { EditStudentDrawer, AddNewStudentDrawer } from '../components/Drawers';
import { useAlert } from '../context/AlertContext';
import copyToClipboard from '../utils/copyToClipboard';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
);

export default function Student() {
  const { id } = useParams();
  const { addAlert } = useAlert();
  const [studetns, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [confirmAction, setConfirmAction] = useState('');
  const [groups, setGroups] = useState([]);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isEditDrawerVisible, setIsEditDrawerVisible] = useState(false);
  const [isAddDrawerVisible, setIsAddDrawerVisible] = useState(false);
  const qrCodeRef = useRef(null);

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:65000/api/student/${id}`)
        .then((response) => {
          setSelectedStudent(response.data);
        })
        .catch((error) => {
          console.error('Error fetching student:', error);
          // searchStudent(id);
        });
    }

    axios
      .get(`http://localhost:65000/api/group`)
      .then((response) => {
        setGroups(response.data);
      })
      .catch((error) => {
        console.error('Error fetching groups:', error);
      });

    getAllStudents();
  }, [id]);

  useEffect(() => {
    if (selectedStudent) {
      fetchGroupDetails(selectedStudent.group_id);
    }
  }, [selectedStudent]);

  const fetchGroupDetails = (groupId) => {
    axios
      .get(`http://localhost:65000/api/group/${groupId}`)
      .then((response) => {
        getAllStudents();
        setGroupDetails(response.data);
      })
      .catch((error) => {
        console.error('Error fetching group details:', error);
        setGroupDetails(null);
      });
  };

  const getAllStudents = () => {
    axios
      .get(`http://localhost:65000/api/student?all=true`)
      .then((response) => {
        const data = response.data.map((student) => ({
          key: student.id,
          ...student,
        }));
        setStudents(data);
      })
      .catch((error) => {
        console.error('Error fetching student:', error);
      });
  };

  const handleRowClick = (student) => {
    setSelectedStudent(student);
    getAllStudents();
  };

  const handleEditClick = () => {
    setIsEditDrawerVisible(true);
  };

  const handleDelete = () => {
    axios
      .delete(`http://localhost:65000/api/student/${selectedStudent.id}`)
      .then(() => {
        addAlert('تم حذف الطالب بنجاح', '', 'success', 3);
        setSelectedStudent(null);
        // searchStudent('');
        getAllStudents();
        getAllStudents();
      })
      .catch((error) => {
        console.error('Error deleting student:', error);
        addAlert('حدث خطأ أثناء حذف الطالب', '', 'error');
      });
  };

  const handleBlock = () => {
    axios
      .patch(`http://localhost:65000/api/student/${selectedStudent.id}`, {
        blocked: true,
      })
      .then(() => {
        addAlert('تم حظر الطالب بنجاح', '', 'success', 3);
        // searchStudent('');
        setSelectedStudent({ ...selectedStudent, blocked: true });
        getAllStudents();
      })
      .catch((error) => {
        console.error('Error blocking student:', error);
        addAlert('حدث خطأ أثناء حظر الطالب', '', 'error');
      });
  };

  const handleUnblock = () => {
    axios
      .patch(`http://localhost:65000/api/student/${selectedStudent.id}`, {
        blocked: false,
      })
      .then(() => {
        addAlert('تم إلغاء حظر الطالب بنجاح', '', 'success', 3);
        setSelectedStudent({ ...selectedStudent, blocked: false });
        getAllStudents();
      })
      .catch((error) => {
        console.error('Error unblocking student:', error);
        addAlert('حدث خطأ أثناء إلغاء حظر الطالب', '', 'error');
      });
  };

  const handleDownloadQR = () => {
    const canvas = qrCodeRef.current.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `student-${selectedStudent.id}-qr.png`;
    link.click();
  };

  const degreesData = {
    labels: [
      'اختبار 1',
      'اختبار 2',
      'اختبار 3',
      'اختبار 4',
      'اختبار 5',
      'اختبار 6',
      'اختبار 7',
      'اختبار 8',
      'اختبار 9',
      'اختبار 10',
      'اختبار 11',
      'اختبار 12',
      'اختبار 13',
      'اختبار 14',
      'اختبار 15',
      'اختبار 16',
      'اختبار 17',
      'اختبار 18',
      'اختبار 19',
      'اختبار 20',
      'اختبار 21',
      'اختبار 22',
      'اختبار 23',
      'اختبار 24',
      'اختبار 25',
      'اختبار 26',
      'اختبار 27',
      'اختبار 28',
      'اختبار 29',
      'اختبار 30',
    ],
    datasets: [
      {
        label: 'Degrees',
        data: [
          65, 59, 80, 81, 56, 55, 40, 70, 81, 56, 55, 40, 81, 56, 55, 40, 70,
          81, 56, 55, 40, 70, 81, 56, 55, 40, 70, 81, 56, 55, 40,
        ],
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const studentItems = selectedStudent
    ? [
        {
          key: '1',
          label: 'الاسم',
          children: (
            <span
              className="cursor-pointer hover:underline"
              onClick={() => copyToClipboard(selectedStudent.name, addAlert)}
            >
              {selectedStudent.name}
            </span>
          ),
        },
        {
          key: '2',
          label: 'رقم الهاتف',
          children: (
            <span
              className="cursor-pointer hover:underline"
              onClick={() =>
                copyToClipboard(selectedStudent.phone_number, addAlert)
              }
            >
              {selectedStudent.phone_number}
            </span>
          ),
        },
        {
          key: '3',
          label: 'هاتف ولي الأمر 1',
          children: (
            <span
              className="cursor-pointer hover:underline"
              onClick={() =>
                copyToClipboard(
                  selectedStudent.parent_phone_1 || 'لا يوجد',
                  addAlert,
                )
              }
            >
              {selectedStudent.parent_phone_1 || 'لا يوجد'}
            </span>
          ),
        },
        {
          key: '4',
          label: 'هاتف ولي الأمر 2',
          children: (
            <span
              className="cursor-pointer hover:underline"
              onClick={() =>
                copyToClipboard(
                  selectedStudent.parent_phone_2 || 'لا يوجد',
                  addAlert,
                )
              }
            >
              {selectedStudent.parent_phone_2 || 'لا يوجد'}
            </span>
          ),
        },
        {
          key: '5',
          label: 'هاتف ولي الأمر 3',
          children: (
            <span
              className="cursor-pointer hover:underline"
              onClick={() =>
                copyToClipboard(
                  selectedStudent.parent_phone_3 || 'لا يوجد',
                  addAlert,
                )
              }
            >
              {selectedStudent.parent_phone_3 || 'لا يوجد'}
            </span>
          ),
        },
        {
          key: '6',
          label: 'الحالة',
          children: selectedStudent.blocked ? (
            <Badge status="error" text="محظور" />
          ) : (
            <Badge status="success" text="نشط" />
          ),
        },
        {
          key: '7',
          label: 'رمز الاستجابة السريعة',
          children: (
            <div
              ref={qrCodeRef}
              onClick={handleDownloadQR}
              className="cursor-pointer"
            >
              <QRCode value={selectedStudent.id.toString()} size={160} />
            </div>
          ),
        },
      ]
    : [];

  const groupItems = groupDetails
    ? [
        {
          key: '1',
          label: 'اسم المجموعة',
          children: (
            <Link
              to={`/group/${groupDetails.id}`}
              className="cursor-pointer hover:underline"
            >
              {groupDetails.name}
            </Link>
          ),
        },
        {
          key: '4',
          label: 'اليوم',
          children: groupDetails.day_of_week,
        },
        {
          key: '5',
          label: 'الوقت',
          children: groupDetails.time_of_day,
        },
      ]
    : [
        {
          key: '1',
          label: 'المجموعة',
          children: (
            <div className="w-full flex gap-5">
              <Select
                className="max-w-80 w-full"
                value={selectedStudent?.groupId}
                onSelect={(group_id) => {
                  const formData = new FormData();
                  formData.append('group_id', group_id);
                  axios
                    .patch(
                      `http://localhost:65000/api/student/${selectedStudent.id}`,
                      formData,
                      {
                        headers: {
                          'Content-Type': 'multipart/form-data',
                        },
                      },
                    )
                    .then(() => {
                      addAlert(
                        'تم تحديث بيانات الطالب بنجاح',
                        '',
                        'success',
                        3,
                      );
                      setSelectedStudent({ ...selectedStudent, group_id });
                      onClose();
                    })
                    .catch((error) => {
                      console.error('Error updating student:', error);
                      addAlert(
                        'حدث خطأ أثناء تحديث بيانات الطالب',
                        '',
                        'error',
                      );
                    });
                }}
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
            </div>
          ),
        },
      ];

  return (
    <div
      lang="ar"
      dir="rtl"
      className="w-full min-h-full p-4 bg-macos-light-gray text-macos-text font-sans"
    >
      <div className="mb-4">
        <SearchBar url='http://localhost:65000/api/student?' setFilteredData={newData => setStudents(newData)} />
      </div>

      <StudentTable data={studetns} onRowClick={handleRowClick} />

      <ConfirmActionModal
        action={confirmAction}
        visible={isConfirmModalVisible}
        onConfirm={() => console.log('تم تأكيد الإجراء')}
        onCancel={() => setIsConfirmModalVisible(false)}
      />

      {selectedStudent && (
        <div className="mt-4 p-4 bg-white rounded-xl">
          <div className="flex flex-col py-12 gap-10 items-center">
            <div className="flex justify-center items-center flex-col gap-4">
              <div className="w-40 aspect-square rounded-lg overflow-hidden bg-gray-200 flex justify-center items-center">
                {selectedStudent.avatar ? (
                  <Image
                    src={selectedStudent.avatar}
                    alt={selectedStudent.name}
                    className="min-w-full min-h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-400">?</span>
                )}
              </div>
              <div className="flex flex-col justify-center w-full items-center">
                <h2
                  onClick={() => {
                    copyToClipboard(selectedStudent.name, addAlert);
                  }}
                  className="text-2xl font-bold hover:underline cursor-pointer select-none"
                >
                  {selectedStudent.name}
                </h2>
                <span
                  onClick={() => {
                    copyToClipboard(selectedStudent.id, addAlert);
                  }}
                  className="text-textSecondary hover:underline cursor-pointer select-none"
                >
                  #{selectedStudent.id}
                </span>
                {selectedStudent.blocked && (
                  <span className="text-red-500 text-lg mt-2">محظور</span>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleEditClick}
                className="bg-blue-500 text-white rounded-lg"
              >
                تعديل
              </Button>
              <Button
                onClick={handleDelete}
                className="bg-red-500 text-white rounded-lg"
              >
                حذف
              </Button>
              {selectedStudent.blocked ? (
                <Button
                  onClick={handleUnblock}
                  className="bg-green-500 text-white rounded-lg"
                >
                  إلغاء الحظر
                </Button>
              ) : (
                <Button
                  onClick={handleBlock}
                  className="bg-yellow-500 text-white rounded-lg"
                >
                  حظر
                </Button>
              )}
            </div>

            <div className="w-4/5">
              <Descriptions
                title="معلومات الطالب"
                bordered
                items={studentItems}
              />
              <Descriptions
                title="تفاصيل المجموعة"
                bordered
                items={groupItems}
                className="mt-4"
              />
            </div>

            <div className="w-4/5 bg-macos-hover p-16 rounded-xl mt-8">
              <h3 className="text-xl font-bold mb-4">الدرجات لكل امتحان</h3>
              <Line
                data={degreesData}
                options={{
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          return `${context.label}: ${context.raw}`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      <EditStudentDrawer
        visible={isEditDrawerVisible}
        onClose={() => setIsEditDrawerVisible(false)}
        studentId={selectedStudent?.id}
      />

      <AddNewStudentDrawer
        visible={isAddDrawerVisible}
        onClose={() => setIsAddDrawerVisible(false)}
      />

      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        tooltip="إضافة طالب جديد"
        onClick={() => setIsAddDrawerVisible(true)}
      />
    </div>
  );
}
