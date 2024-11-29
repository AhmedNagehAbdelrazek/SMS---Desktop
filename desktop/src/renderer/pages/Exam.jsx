import { useState, useEffect } from 'react';
import axios from 'axios';
import { FloatButton, Descriptions, Select, Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/Bars';
import { StudentTable } from '../components/Tables';
import { AddNewExamDrawer } from '../components/Drawers';
import { useAlert } from '../context/AlertContext';
import InputWLable from '../components/Input/InputWLable';

export default function Exam() {
  const { addAlert } = useAlert();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isEditDrawerVisible, setIsEditDrawerVisible] = useState(false);
  const [isAddDrawerVisible, setIsAddDrawerVisible] = useState(false);
  const [studentGrade, setStudentGrade] = useState({ id: null, grade: 0 });
  const [analysis, setAnalysis] = useState(null);

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

  useEffect(() => {
    getAllStudents();
  }, [selectedExam]);

  const getAllStudents = (id) => {
    axios
      .get(`http://localhost:65000/api/monthexam/report/${selectedExam?.group_id}`)
      .then((response) => {
        setStudents(response.data.students);
        setAnalysis(response.data);
      })
      .catch((error) => {
        console.error('Error fetching students:', error);
      });
  };

  const getExamDetails = (exam_id) => {
    axios
      .get(`http://localhost:65000/api/monthexam/report/${exam_id}`)
      .then((response) => {
        setSelectedExam(response.data);
        console.log({exam:response.data});
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
  const handladdStudentGrade = () => {
    axios
    .post(`http://localhost:65000/api/monthexam/grade`,
      {studentId:studentGrade.id,grade:studentGrade.grade,monthExamId:selectedExam.id})
      .then(() => {
        addAlert('تم تسجيل الحضور بنجاح', '', 'success', 3);
        setStudentGrade({ id: null, grade: 0 });
      }).catch((error) => {
        console.error('Error recording attendance:', error);
        addAlert('الطالب مسجل بالفعل', '', 'error', 3);
      });
  }
  useEffect(() => {
    console.log(students);
  }, [students]);

  const examItems = [
    { key: '1', label: 'الاسم', children: selectedExam?.name },
  ];

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
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {exams.map((exam) => (
            <Select.Option key={exam.id} value={exam.id} label={exam.name}>
              {exam.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      <div className="mb-4">
        {/* //TODO: fix the attended and absent buttons on filtter */}
        <SearchBar onData={students} url={`http://localhost:65000/api/monthexam/report/${selectedExam?.id || ''}?${selectedExam?.group_id != null ? `groupId=${selectedExam?.group_id}&`:''}`}
         setFilteredData={newData => setStudents(newData)
        }
          onDataResponse={(data)=>{
            let students = data.students.map((student) => ({
              key: student.id,
              ...student,
            }));
            setAnalysis(data);
            return students;
          }}
        />
      </div>
      
      <StudentTable
        data={selectedExam ? students : []}
        onRowClick={handleRowClick}
        additionalColumns={[
          {
            title: 'درجة الامتحان',
            dataIndex: 'grade',
            key: 'grade',
            width: '10%',
            render: (grade) => (grade != null ? grade :<span className="text-red-500">لم يسجل</span> || "لم يسجل"),
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
              {analysis && <div>
              {/*add the totalSuccessededStudents and totalFailedStudents and totalStudents and averageGrade */}
              <Typography.Title level={4}>التحليل</Typography.Title>
              <Descriptions bordered>
                <Descriptions.Item label="الطلاب المسجلين">{analysis.totalStudents}</Descriptions.Item>
                <Descriptions.Item label="الطلاب المسجلين بنجاح">{analysis.totalSuccessededStudents}</Descriptions.Item>
                <Descriptions.Item label="الطلاب المسجلين بفشل">{analysis.totalFailedStudents}</Descriptions.Item>
                <Descriptions.Item label="المعدل">{analysis.averageGrade}</Descriptions.Item>
              </Descriptions>
              </div>}
            </div>
            {/* <div className="flex gap-4">
              <Button
                onClick={handleEditClick}
                className="bg-blue-500 text-white rounded-lg"
              >
                تعديل
              </Button>
            </div> */}
            <div className='w-full'>
              <div className='w-full flex gap-4 flex-col'>
                <Typography>
                  <Typography.Title level={4}>اضافة درجة طالب</Typography.Title>
                </Typography>
                <div className='w-3/4 flex flex-row gap-4'>
                    <InputWLable className='flex-1' label="رقم الطالب" placeholder="رقم الطالب"
                     value={studentGrade?.id}
                     onChange={(e) => {
                      setStudentGrade((oldStudentGrade)=>({ ...oldStudentGrade, id: e.target.value }))
                    }} />
                    <InputWLable label="درجة الطالب" placeholder="درجة الطالب"
                      value={studentGrade?.grade}
                      onChange={(e)=>{
                      setStudentGrade((oldStudentGrade)=>({ ...oldStudentGrade, grade: e.target.value }));
                    }} />
                </div>
                <Button variant='solid' color='primary' className='w-[75px]' onClick={handladdStudentGrade}>اضافة</Button>
              </div>
            </div>
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
