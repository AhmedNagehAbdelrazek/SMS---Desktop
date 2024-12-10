import { useEffect, useRef, useState } from "react";
import { Button, Select, Space, Table, Tabs ,Input  } from "antd";
import axios from "axios";
import { useAlert } from "../context";
const { TabPane } = Tabs;
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { getFullDate } from "../utils/getDateFormatted";

export default function Settings() {
  return (
    <>
      <HistoryPage/>
    </>
  )
}

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState("attendance");

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
            <AttendTable />
          </TabPane>
          <TabPane tab="Homework" key="homework">
            <HomeworkTable />
          </TabPane>
          <TabPane tab="Lecture Exams" key="lectureExam">
            <LectureExamTable />
          </TabPane>
          <TabPane tab="Month Exams" key="monthExam">
            <MonthExamTable  />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

function AttendTable() {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => {
            setSelectedKeys(e.target.value ? [e.target.value] : []);
                          confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
          }}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            onClick={() => {
              clearFilters && handleReset(clearFilters);
              setSearchText('');
              setSearchedColumn('');
              confirm({
                closeDropdown: false,
              });
            }}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });


  const columns = [
    { title: "Id", dataIndex: "id", key: "id", 
      sorter: (a, b) => Number(a.id) - Number(b.id) || a - b,
      sortDirections: ['descend', 'ascend'],
    },
    { title: "Name", dataIndex: "name", key: "name", ...getColumnSearchProps('name') },
    { title: "Group Name", dataIndex: "group_name", key: "group_name" ,
      render: (group_name) => (group_name != null ? group_name :<span className="text-red-500">لم يسجل</span> || "لم يسجل"),
    },
    { title: "Date", dataIndex: "date", key: "date" ,
      render: (date) => (date != null ? getFullDate(date) :<span className="text-red-500">لم يحضر</span> || "لم يحضر"),
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
  const [selectedLectureId, setSelectedLectureId] = useState(null);
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
    setStudents(selectedLecture.students);
  },[selectedLecture]);

  useEffect(() => {
    console.log("students",students);
  },[students]);

  const handleSelectGroup = (value) => {
    console.log("selectedGroup",value);
    if(!value) return;
    setSelectedLecture(null);
    setSelectedLectureId(null);
    setStudents([]);
    axios.get(`http://localhost:65000/api/attendance/group/${value}`).then((response) => {
      setSelectedGroup(response.data);
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
    console.log("selectedGroup",selectedGroup);

    const foundLecture = selectedGroup.find((lecture)=>lecture.lecture.id == value);
    console.log(foundLecture);
    setSelectedLecture(foundLecture);
    setSelectedLectureId(value);
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
         value={selectedLectureId || "no_lecture"}
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

function HomeworkTable() {
  const columns = [
    { title: "Id", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Group Name", dataIndex: "group_name", key: "group_name" ,
      render: (group_name) => (group_name != null ? group_name :<span className="text-red-500">لم يسجل</span> || "لم يسجل"),
    },
    { title: "Date", dataIndex: "date", key: "date" ,
      render: (group_name) => (group_name != null ? group_name :<span className="text-red-500">لم يحضر</span> || "لم يحضر"),
    },
    { title: "Homework Grade", dataIndex: "homework_type", key: "homework_type" },
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

function LectureExamTable() {
  const columns = [
    { title: "Id", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Group Name", dataIndex: "group_name", key: "group_name" ,
      render: (group_name) => (group_name != null ? group_name :<span className="text-red-500">لم يسجل</span> || "لم يسجل"),
    },
    { title: "Date", dataIndex: "date", key: "date" ,
      render: (group_name) => (group_name != null ? group_name :<span className="text-red-500">لم يحضر</span> || "لم يحضر"),
    },
    { title: "Lecture Exam Grade", dataIndex: "grade", key: "grade" },
  ]
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
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

    // setStudents(allStudents);
  },[selectedGroup]);

  // useEffect(() => {
  //   console.log(selectedLecture);
  //   if(!selectedLecture) return;
  //   if(selectedLecture == "no_lecture") return;
  //   setStudents([...selectedLecture.attended.map((s)=>({...s,attended:true})),...selectedLecture.notAttended.map((s)=>({...s,attended:false}))]);
  // },[selectedLecture]);

  useEffect(() => {
    console.log("students",students);
  },[students]);

  const handleSelectGroup = (value) => {
    console.log("selectedGroup",value);
    if(!value) return;
    setSelectedLecture(null);
    setStudents([]);
    axios.get(`http://localhost:65000/api/attendance/group/${value}`).then((response) => {
      setSelectedGroup(response.data);
      setSelectedLecture(null);
      setSelectedGroupId(value);
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
    axios.get(`http://localhost:65000/api/lecture/grade/report?groupId=${selectedGroupId}&lectureId=${value}`).then((response) => {
      setStudents(response.data);
    }).catch((error) => {
      console.error('Error fetching groups:', error);
      addAlert('حدث خطأ أثناء جلب المجموعات', '', 'error');
    });
    setSelectedLecture(value);
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
         value={selectedLecture || "no_lecture"}
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

function MonthExamTable() {
  const columns = [
    { title: "Id", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Group Name", dataIndex: "group_name", key: "group_name" ,
      render: (group_name) => (group_name != null ? group_name :<span className="text-red-500">لم يسجل</span> || "لم يسجل"),
    },
    { title: "Date", dataIndex: "date", key: "date" ,
      render: (group_name) => (group_name != null ? group_name :<span className="text-red-500">لم يحضر</span> || "لم يحضر"),
    },
    { title: "Lecture Exam Grade", dataIndex: "grade", key: "grade" },
    { title: "Full Mark", dataIndex: "fullmark", key: "fullmark" },
  ]
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);
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
  
  // useEffect(() => {
  //   console.log(selectedGroup);
  //   if(!selectedGroup) return;
  //   let allStudents = selectedGroup.map((lecture)=>{
  //     return lecture.students
  //   });
  //   allStudents = allStudents.map((students)=>{
  //     students = students.map((student)=>{
  //       return {...student,group_name:student?.Group?.name}
  //     })
  //     return students
  //   });
  //   allStudents = allStudents?.flat();

  //   setStudents(allStudents);
  // },[selectedGroup]);

  // useEffect(() => {
  //   console.log(selectedLecture);
  //   if(!selectedLecture) return;
  //   if(selectedLecture == "no_lecture") return;
  //   setStudents([...selectedLecture.attended.map((s)=>({...s,attended:true})),...selectedLecture.notAttended.map((s)=>({...s,attended:false}))]);
  // },[selectedLecture]);

  useEffect(() => {
    console.log("students",students);
  },[students]);

  const handleSelectGroup = (value) => {
    console.log("selectedGroup",value);
    if(!value) return;
    setSelectedExam(null);
    setStudents([]);
    axios.get(`http://localhost:65000/api/monthexam/?groupId=${value}`).then((response) => {
      setSelectedGroup(response.data);
      setSelectedGroupId(value);
      console.log("selectedGroup",response.data);
    }).catch((error) => {
      console.error('Error fetching groups:', error);
      addAlert('حدث خطأ أثناء جلب المجموعات', '', 'error');
    })
  }
  const handleSelectedExam = (value) => {
    console.log("selectedLecture",value);
    if(!value) return;
    if(value == "no_lecture") return;
    axios.get(`http://localhost:65000/api/monthexam/report/${value}?groupId=${selectedGroupId}&all=true`).then((response) => {
      setStudents(response.data.students);
      setSelectedExam(response.data);
    }).catch((error) => {
      console.error('Error fetching groups:', error);
      addAlert('حدث خطأ أثناء جلب المجموعات', '', 'error');
    });
    setSelectedExamId(value);
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
         placeholder="Select Month Exam" 
         className="min-w-[200px]" 
         value={selectedExamId || "no_exam"}
         defaultValue={"no_lecture"}
         onSelect={(value) => handleSelectedExam(value)}
         filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }>
          <Select.Option key={"no_exam"} value={"no_exam"} label={"no_exam"}>
              No Exam Selected
          </Select.Option>
          {selectedGroup && selectedGroup?.map((exam) => (
            <Select.Option key={exam.id} value={exam.id} label={exam.name}>
              {exam.name}
            </Select.Option>
          ))}
        </Select>
      </div>
      <Table columns={columns} dataSource={students} onRow={(record) => ({ onClick: () => console.log(record)})} />
    </div>
  );
}