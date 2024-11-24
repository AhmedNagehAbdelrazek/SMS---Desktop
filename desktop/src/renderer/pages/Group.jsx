import axios from 'axios';
import { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { SearchBar } from '../components/Bars';
import { StudentTable } from '../components/Tables';
import { StudentActionsModal } from '../components/Modals';
import { useParams } from 'react-router-dom';

export default function Group() {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:3000/api/student')
      .then((response) => {
        const data = response.data.map((student) => ({
          key: student.id,
          ...student,
        }));
        setStudents(data);
        setFilteredData(data);
      })
      .catch((error) => console.error('Error fetching students:', error));
  }, []);

  const handleSearch = (searchText) => {
    const filtered = students.filter(
      (student) =>
        student.name.includes(searchText) ||
        student.id.toString().includes(searchText),
    );
    setFilteredData(filtered);
  };

  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
  };

  const handleActionClick = (action) => {
    setConfirmAction(action);
    setIsConfirmModalVisible(true);
  };

  return (
    <div lang="ar" dir="rtl">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <SearchBar onSearch={handleSearch} />
        </Col>
      </Row>
      <StudentTable data={filteredData} onRowClick={handleRowClick} />
      <StudentActionsModal
        student={selectedStudent}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAction={handleActionClick}
      />
    </div>
  );
}
