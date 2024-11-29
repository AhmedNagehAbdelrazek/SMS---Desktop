import React, { useEffect, useState } from "react";
import { Button, Select, Table, Tabs } from "antd";
import Attend from './Attend';
import { group } from "console";
import axios from "axios";
import { useAlert } from "../context";

export default function Settings() {
  return (
    <>
      <HistoryPage/>
    </>
  )
}



const { TabPane } = Tabs;

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState("attendance");

  // Example data for each category
  const data = {
    attendance: [
      { id:1, name:"Ahmed", group_name:"Group A", date: "2024-11-01", attended: true },
      {  date: "2024-11-02", status: "Absent" },
    ],
    homework: [
      { key: "1", date: "2024-11-01", task: "Math Assignment", status: "Submitted" },
    ],
    lectureExam: [
      { key: "1", subject: "Physics", date: "2024-11-01", grade: "A" },
    ],
    monthExam: [
      { key: "1", subject: "Math", date: "2024-10-31", grade: "B" },
    ],
  };

  // Define columns for tables
  const columns= {
    attendance: [
      { title: "Date", dataIndex: "date", key: "date" },
      { title: "Status", dataIndex: "status", key: "status" },
    ],
    homework: [
      { title: "Date", dataIndex: "date", key: "date" },
      { title: "Task", dataIndex: "task", key: "task" },
      { title: "Status", dataIndex: "status", key: "status" },
    ],
    lectureExam: [
      { title: "Subject", dataIndex: "subject", key: "subject" },
      { title: "Date", dataIndex: "date", key: "date" },
      { title: "Grade", dataIndex: "grade", key: "grade" },
    ],
    monthExam: [
      { title: "Subject", dataIndex: "subject", key: "subject" },
      { title: "Date", dataIndex: "date", key: "date" },
      { title: "Grade", dataIndex: "grade", key: "grade" },
    ],
  };

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="w-full p-5">
        <h1 className="text-center text-xl font-bold mb-5">History Management</h1>
        {/* Tabs for switching history types */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          type="card"
          size="large"
        >
          <TabPane tab="Attendance" key="attendance">
            <AttendTable data={data.attendance} />
          </TabPane>
          <TabPane tab="Homework" key="homework">
            <Table columns={columns.homework} dataSource={data.homework} />
          </TabPane>
          <TabPane tab="Lecture Exams" key="lectureExam">
            <Table columns={columns.lectureExam} dataSource={data.lectureExam} />
          </TabPane>
          <TabPane tab="Month Exams" key="monthExam">
            <Table columns={columns.monthExam} dataSource={data.monthExam} />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

function AttendTable() {
  const columns = [
    { title: "Id", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Group Name", dataIndex: "group_name", key: "group_name" ,
      render: (group_name) => (group_name != null ? group_name :<span className="text-red-500">لم يسجل</span> || "لم يسجل"),
    },
    { title: "Date", dataIndex: "date", key: "date" ,
      render: (group_name) => (group_name != null ? group_name :<span className="text-red-500">لم يحضر</span> || "لم يحضر"),
    },
    { title: "Attended", dataIndex: "attended", key: "attended" , render: (attended) => {
      return (
        <span className={`w-2 aspect-square inline-block rounded-full ${attended   ? 'bg-green-500' : 'bg-red-500'}`} />
      )
    }},
  ]
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [students, setStudents] = useState([]);
  const {addAlert} = useAlert();

  useEffect(() => {
    axios.get(`http://localhost:65000/api/group`).then((response) => {
      setGroups(response.data);
      console.log("groups",response.data);
    }).catch((error) => {
      console.error('Error fetching groups:', error);
      addAlert('حدث خطأ أثناء جلب المجموعات', '', 'error');
    });
  },[])
  
  useEffect(() => {
    console.log(selectedGroup);
    if(!selectedGroup) return;
    let allStudents = selectedGroup.map((lecture)=>{
      return lecture.students
    });
    allStudents = allStudents.map((students)=>{
      students = students.map((student)=>{
        return {...student,group_name:student?.Group?.name}
      })
      return students
    });
    allStudents = allStudents?.flat();

    setStudents(allStudents);
  },[selectedGroup]);

  useEffect(() => {
    console.log(selectedLecture);
    if(!selectedLecture) return;
    if(selectedLecture == "no_lecture") return;
    setStudents([...selectedLecture.attended.map((s)=>({...s,attended:true})),...selectedLecture.notAttended.map((s)=>({...s,attended:false}))]);
  },[selectedLecture]);

  useEffect(() => {
    console.log("students",students);
  },[students]);

  const handleSelectGroup = (value) => {
    console.log("selectedGroup",value);
    if(!value) return;
    axios.get(`http://localhost:65000/api/attendance/group/${value}`).then((response) => {
      setSelectedGroup(response.data);
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
    setSelectedLecture(selectedGroup.find((lecture)=>lecture.id == value));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex flex-row gap-5">
        <Select
         placeholder="Select a Group" 
         className="min-w-[200px]" 
         value={selectedGroup?.id}
         onSelect={(value) => {handleSelectGroup(value); console.log("selectedGroup",value);}}
         filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }>
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
         defaultValue={"no_lecture"}
         onSelect={(value) => handleSelectedLecture(value)}
         filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }>
          <Select.Option key={"no_lecture"} value={"no_lecture"} label={"no_lecture"}>
              No Lecture Selected
          </Select.Option>
          {selectedGroup && selectedGroup?.map((lecture) => (
            <Select.Option key={lecture.lecture.id} value={lecture.lecture.id} label={lecture.lecture.name}>
              {lecture.lecture.name}
            </Select.Option>
          ))}
        </Select>
      </div>
      <Table columns={columns} dataSource={students} onRow={(record) => ({ onClick: () => console.log(record)})} />
    </div>
  );
}