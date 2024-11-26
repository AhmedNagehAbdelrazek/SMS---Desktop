import { useState, useEffect } from 'react';
import axios from 'axios';
import { FloatButton, Button, Descriptions, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/Bars';
import { StudentTable } from '../components/Tables';
import { EditStudentDrawer, AddNewGroupDrawer, EditGroupDrawer } from '../components/Drawers';
import { useAlert } from '../context/AlertContext';
import copyToClipboard from '../utils/copyToClipboard';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
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

const dayOfWeekMapping = {
  '1': 'السبت',
  '2': 'الأحد',
  '3': 'الإثنين',
  '4': 'الثلاثاء',
  '5': 'الأربعاء',
  '6': 'الخميس',
  '7': 'الجمعة',
};

export default function Group() {
  const { id } = useParams();
  const { addAlert } = useAlert();
  const navigate = useNavigate();
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupItems, setGroupItems] = useState([
    {
      key: '1',
      label: 'المجموعة',
      children: 'لا يوجد مجموعة',
    },
  ]);
  const [isEditDrawerVisible, setIsEditDrawerVisible] = useState(false);
  const [isAddDrawerVisible, setIsAddDrawerVisible] = useState(false);

  useEffect(() => {
    if (id) {
      getGroupDetails(id);
    }

    axios
      .get(`http://localhost:65000/api/group`)
      .then((response) => {
        setGroups(response.data);
      })
      .catch((error) => {
        console.error('Error fetching groups:', error);
      });
  }, [id]);

  useEffect(() => {
    if (selectedGroup) {
      getAllStudents(selectedGroup.id);
      setGroupItems([
        {
          key: '1',
          label: 'اسم المجموعة',
          children: (
            <span
              className="cursor-pointer hover:underline"
              onClick={() => copyToClipboard(selectedGroup?.name, addAlert)}
            >
              {selectedGroup?.name}
            </span>
          ),
        },
        {
          key: '4',
          label: 'اليوم',
          children: dayOfWeekMapping[selectedGroup?.day_of_week],
        },
        {
          key: '5',
          label: 'الوقت',
          children: moment(selectedGroup.time_of_day, 'HH:mm:ss').format('HH:mm a'),
        },
      ]);
    }
  }, [selectedGroup]);

  const searchStudent = (searchText) => {
    if (!searchText) {
      setFilteredStudents(students);
      return;
    }

    setFilteredStudents(
      students.filter(
        (student) =>
          student.id.includes(searchText) ||
          student.name.includes(searchText) ||
          student.phone_number.toString().includes(searchText)
      ),
    );
  };

  const getAllStudents = (id) => {
    axios
      .get(`http://localhost:65000/api/group/students/${id}`)
      .then((response) => {
        setStudents(response.data);
        setFilteredStudents(response.data);
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
      });
  };

  const getGroupDetails = (id) => {
    axios
      .get(`http://localhost:65000/api/group/${id}`)
      .then((response) => {
        setSelectedGroup(response.data);
      })
      .catch((error) => {
        console.error('Error fetching group details:', error);
      });
  };

  const handleSearch = (searchText) => {
    searchStudent(searchText);
  };

  const handleRowClick = (student) => {
    navigate(`/${student.id}`);
  };

  const handleEditClick = () => {
    setIsEditDrawerVisible(true);
  };

  const handleDelete = () => {
    axios
      .delete(`http://localhost:65000/api/group/${selectedGroup.id}`)
      .then(() => {
        addAlert('تم حذف المجموعة بنجاح', '', 'success', 3);
        setSelectedGroup(null);
      })
      .catch((error) => {
        console.error('Error deleting group:', error);
        addAlert('حدث خطأ أثناء حذف المجموعة', '', 'error');
      });
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
          65, 59, 80, 81, 91, 100, 15, 20, 100, 54, 81, 40, 81, 56, 55, 40, 70,
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

  return (
    <div
      lang="ar"
      dir="rtl"
      className="w-full min-h-full p-4 flex flex-col gap-6 bg-macos-light-gray text-macos-text font-sans"
    >
      <div className='w-full flex gap-5'>
        <Select
          className='max-w-80 w-full'
          value={selectedGroup?.id}
          onSelect={group_id => getGroupDetails(group_id)}
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

      <div className="mb-4">
        <SearchBar onSearch={handleSearch} />
      </div>

      <StudentTable 
        data={filteredStudents}
        onRowClick={handleRowClick}
        additionalColumns={
          [
            {
              title: 'الحضور',
              dataIndex: 'attendance',
              key: 'attendance',
              width: '10%',
              render: (attendance) => {
                console.log(attendance);
                
                return (
                  <span className={`w-2 aspect-square inline-block rounded-full ${attendance   ? 'bg-green-500' : 'bg-red-500'}`} />
                )
              },
            }
          ]
        }
      />

      {selectedGroup && (
        <div className="mt-4 p-4 bg-white rounded-xl">
          <div className="flex flex-col py-12 gap-10 items-center">
            <div className="w-4/5">
              <Descriptions
                title="تفاصيل المجموعة"
                bordered
                items={groupItems}
                className=""
              />
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
            </div>

            <div className="w-11/12 max-2xl:w-4/5 max-2xl:flex-col flex justify-center items-center gap-2 bg-macos-hover p-16 rounded-xl mt-8">
              <div className="w-1/2 max-2xl:w-full">
                <h3 className="text-xl font-bold mb-4">
                  متوسط الدرجات لكل امتحان
                </h3>
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

              <div className="w-1/2 max-2xl:w-full">
                <h3 className="text-xl font-bold mb-4">متوسط الحضور</h3>
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
        </div>
      )}
      
      <EditGroupDrawer
        visible={isEditDrawerVisible}
        onClose={() => setIsEditDrawerVisible(false)}
        groupId={selectedGroup?.id}
      />

      <AddNewGroupDrawer
        visible={isAddDrawerVisible}
        onClose={() => setIsAddDrawerVisible(false)}
      />

      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        tooltip="إضافة مجموعة جديدة"
        onClick={() => setIsAddDrawerVisible(true)}
      />
    </div>
  );
}
