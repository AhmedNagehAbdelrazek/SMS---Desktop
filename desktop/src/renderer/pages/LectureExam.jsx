import { Button, Select } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import InputWLable from '../components/Input/InputWLable';
import { StudentTable } from '../components/Tables';
import { useAlert } from '../context';

export default function LectureExam() {

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [studentGrade, setStudentGrade] = useState({ id: null, grade: 0 });
  const { addAlert } = useAlert();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:65000/api/group`).then((response) => {
      setGroups(response.data);
      console.log("groups",response.data);
    }).catch((error) => {
      console.error('Error fetching groups:', error);
      addAlert('حدث خطأ أثناء جلب المجموعات', '', 'error');
    });
  },[]);

//   useEffect(() => {
//     if(!selectedLecture) return;
//     if(!selectedLecture.lecture) return;
//     if(selectedLecture == "no_lecture") return;
//     axios.get(`http://localhost:65000/api/lecture/grade/report?groupId=1&lectureId=1/${selectedLecture.lecture.group_id}`).then((response) => {
        
//     }).then((response) => {
        
//     }).catch((error) => {
        
//     })
//   },[selectedLecture])


  const handleSelectGroup = (value) => {
    console.log("selectedGroup",value);
    if(!value) return;
    axios.get(`http://localhost:65000/api/attendance/group/${value}`).then((response) => {
      setSelectedGroup({data:response.data,Group:groups.find((group)=>group.id == value)});
      setSelectedLecture(null);
      console.log("selectedGroup",response.data);
    }).catch((error) => {
      console.error('Error fetching groups:', error);
      addAlert('حدث خطأ أثناء جلب المجموعات', '', 'error');
    })
  }

  const handleSelectedLecture = (value) => {
    console.log("selectedLecture",value);
    if(!value) return;
    if(value == "no_lecture") return;
    console.log("selectedLecture",value);
    let lecture = selectedGroup.data.find((lecture)=>lecture.lecture.id == value);
    console.log(lecture);
    setSelectedLecture(lecture);

    getAllStudents();
  }
  const getAllStudents = () => {
    axios.get(`http://localhost:65000/api/lecture/grade/report?groupId=${selectedGroup?.Group?.id}&lectureId=${selectedLecture?.lecture?.id}`)
    .then((response) => {
        setStudents(response.data);
        console.log("studetnds",response.data);
    })
    .catch((error) => {
        console.error('Error fetching groups:', error);
        addAlert('حدث خطأ أثناء جلب المجموعات', '', 'error');
    })
  }
  const handleAddGrade = () => {
      axios.post(`http://localhost:65000/api/lecture/grade`,{
        studentId:studentGrade.id,
        grade:studentGrade.grade,
        groupId:selectedGroup.Group.id,
        lecture_id:selectedLecture.lecture.id
      }).then(() => {
        addAlert('تم تسجيل الحضور بنجاح', '', 'success', 3);
        setStudentGrade({ id: null, grade: 0 });
        getAllStudents();
      }).catch((error) => {
        console.error('Error fetching groups:', error);
        addAlert('حدث خطأ أثناء جلب المجموعات', '', 'error');
      })
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="w-full flex flex-row gap-5">
          <Select
            placeholder="Select a Group"
            className="min-w-[200px]"
            value={selectedGroup?.data?.id}
            onSelect={(value) => {
              handleSelectGroup(value);
              console.log('selectedGroup', value);
            }}
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
          <Select
            placeholder="Select a Lecture"
            className="min-w-[200px]"
            value={selectedLecture?.id}
            defaultValue={'no_lecture'}
            onSelect={(value) => handleSelectedLecture(value)}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            <Select.Option
              key={'no_lecture'}
              value={'no_lecture'}
              label={'no_lecture'}
            >
              No Lecture Selected
            </Select.Option>
            {selectedGroup &&
              selectedGroup?.data?.map((lecture) => (
                <Select.Option
                  key={lecture.lecture.id}
                  value={lecture.lecture.id}
                  label={lecture.lecture.name}
                >
                  {lecture.lecture.name}
                </Select.Option>
              ))}
          </Select>
        </div>
        {selectedLecture && (
        <>
            <div className="w-full flex flex-row gap-5">
                <div className="w-full flex flex-col gap-2">
                <h1 className="text-2xl font-bold">{selectedLecture?.lecture?.name}</h1>
                <h1 className="text-2xl font-bold">{selectedLecture?.lecture?.createdAt}</h1>
                </div>
            </div>
            <div className='w-full flex flex-row gap-5'>
                <InputWLable label="رقم الطالب" placeholder="ادخل رقم الطالب" onChange={(e) => { setStudentGrade((old)=>({ id: e.target.value, grade: old?.grade }))}} value={studentGrade?.id} />
                <InputWLable label="الدرجة" placeholder="ادخل الدرجة" onChange={(e) => { setStudentGrade((old)=>({ id: old?.id, grade: e.target.value }))}} value={studentGrade?.grade} />
            </div>
            <div>
                <Button onClick={() => handleAddGrade()}>اضافة درجة</Button>
            </div>
        </>
        )}
      </div>
        <StudentTable data={students || []} additionalColumns={[{title:"الدرجة",dataIndex:"grade",key:"grade",render:(grade) => (grade != null ? grade :<span className="text-red-500">لم يسجل</span> || "لم يسجل")}]}/>
    </div>
  );
}
