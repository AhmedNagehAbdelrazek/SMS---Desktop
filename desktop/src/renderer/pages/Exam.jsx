import { useState, useEffect } from 'react';
import axios from 'axios';
import { FloatButton, Descriptions, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/Bars';
import { StudentTable } from '../components/Tables';
import { AddNewExamDrawer } from '../components/Drawers';
import { useAlert } from '../context/AlertContext';

export default function Exam() {
  const { addAlert } = useAlert();
  const navigate = useNavigate();
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isEditDrawerVisible, setIsEditDrawerVisible] = useState(false);
  const [isAddDrawerVisible, setIsAddDrawerVisible] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:65000/api/monthexam/')
      .then((response) => {
        setExams(response.data);
      })
      .catch((error) => {
        console.error('Error fetching exams:', error);
        addAlert('حدث خطأ أثناء جلب البيانات', '', 'error');
      });
  }, []);

  const getExamDetails = (exam_id) => {
    axios
      .get(`http://localhost:65000/api/monthexam/report/${exam_id}`)
      .then((response) => {
        setSelectedExam(response.data);
      })
      .catch((error) => {
        console.error('Error fetching exam details:', error);
        addAlert('حدث خطأ أثناء جلب البيانات', '', 'error');
      });
  }

  const handleRowClick = (student) => {
    navigate(`/${student.id}`);
  };

  const handleEditClick = () => {
    setIsEditDrawerVisible(true);
  };

  const examItems = [
    { key: '1', label: 'الاسم', children: selectedExam?.name },
  ];

  const onFilter = ({
    searchText,
    sortField,
    isReverse,
    isBlocked,
    isNotBlocked,
    isAttend,
    isAbsent,
  }) => {
    console.log(
        searchText,
        sortField,
        isReverse,
        isBlocked,
        isNotBlocked,
        isAttend,
        isAbsent,
    );
  };

  return (
    <div
      lang="ar"
      dir="rtl"
      className="w-full min-h-full p-4 flex flex-col gap-6 bg-macos-light-gray text-macos-text font-sans"
    >
      <div className="w-full flex gap-5">
        <Select
          className="max-w-80 w-full"
          onSelect={(exam_id) => getExamDetails(exam_id)}
          showSearch    
          getPopupContainer={(triggerNode) => triggerNode.parentNode}
        >
          {exams.map((exam) => (
            <Select.Option key={exam.id} value={exam.id}>
              {exam.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div className="mb-4">
        <SearchBar onFilter={onFilter} />
      </div>

      <StudentTable
        data={filteredStudents}
        onRowClick={handleRowClick}
        additionalColumns={[
          {
            title: 'الحضور',
            dataIndex: 'attendance',
            key: 'attendance',
            width: '10%',
            render: (attendance) => {
              console.log(attendance);

              return (
                <span
                  className={`w-2 aspect-square inline-block rounded-full ${attendance ? 'bg-green-500' : 'bg-red-500'}`}
                />
              );
            },
          },
        ]}
      />

      {selectedExam && (
        <div className="mt-4 p-4 bg-white rounded-xl">
          <div className="flex flex-col py-12 gap-10 items-center">
            <div className="w-4/5">
              <Descriptions
                title="تفاصيل الاختبار"
                bordered
                items={examItems}
                className=""
              />
            </div>
            {/* <div className="flex gap-4">
              <Button
                onClick={handleEditClick}
                className="bg-blue-500 text-white rounded-lg"
              >
                تعديل
              </Button>
            </div> */}
          </div>
        </div>
      )}
{/*             
      <EditExamDrawer
        visible={isEditDrawerVisible}
        onClose={() => setIsEditDrawerVisible(false)}
        groupId={selectedExam?.id}
      /> */}

      <AddNewExamDrawer
        visible={isAddDrawerVisible}
        onClose={() => setIsAddDrawerVisible(false)}
      />

      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        tooltip="إضافة اختبار جديدة"
        onClick={() => setIsAddDrawerVisible(true)}
      />
    </div>
  );
}
