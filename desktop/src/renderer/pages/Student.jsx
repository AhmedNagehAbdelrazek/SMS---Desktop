import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Button } from 'antd';
import { useParams } from 'react-router-dom';
import { SearchBar } from '../components/Bars';
import { StudentTable } from '../components/Tables';
import { useAlert } from '../context/AlertContext';
import copyToClipboard from '../utils/copyToClipboard';
import { EditStudentModal } from '../components/Modals';

export default function Student() {
  const { id } = useParams();
  const { addAlert } = useAlert();
  const [filteredData, setFilteredData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [confirmAction, setConfirmAction] = useState('');
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:3000/api/student/${id}`)
        .then((response) => {
          setSelectedStudent(response.data);
        })
        .catch((error) => {
          console.error('Error fetching student:', error);
          searchStudent(id);
        });
    } else {
      axios
        .get(`http://localhost:3000/api/student`)
        .then((response) => {
          const data = response.data.map((student) => ({
            key: student.id,
            ...student,
          }));
          setFilteredData(data);
        })
        .catch((error) => {
          console.error('Error fetching student:', error);
        });
    }
  }, [id]);

  const searchStudent = (searchText) => {
    axios
      .get(`http://localhost:3000/api/student/search?query=${searchText}`)
      .then((response) => {
        const data = response.data.map((student) => ({
          key: student.id,
          ...student,
        }));
        setFilteredData(data);
      })
      .catch((error) => console.error('Error searching students:', error));
  };

  const handleSearch = (searchText) => {
    searchStudent(searchText);
  };

  const handleRowClick = (student) => {
    setSelectedStudent(student);
  };

  const handleActionClick = (action) => {
    setConfirmAction(action);
    setIsConfirmModalVisible(true);
  };

  const handleEditClick = () => {
    setIsEditModalVisible(true);
  };

  return (
    <div
      lang="ar"
      dir="rtl"
      className="w-full min-h-full p-4 bg-macos-light-gray text-macos-text font-sans"
    >
      <div>
        <SearchBar onSearch={handleSearch} />
      </div>

      <StudentTable data={filteredData} onRowClick={handleRowClick} />


      {selectedStudent && (
        <div className="mt-4 p-4 bg-white rounded-xl">
          <div className="flex flex-col py-12 gap-10 items-center">
            <div className="flex justify-center items-center flex-col gap-4">
              {selectedStudent.avatar ? (
                <img
                  src={selectedStudent.avatar}
                  alt={selectedStudent.name}
                  className="w-40 aspect-square rounded-lg"
                />
              ) : (
                <div className="w-40 aspect-square rounded-lg bg-gray-200 flex justify-center items-center">
                  <span className="text-2xl text-gray-400">?</span>
                </div>
              )}
              <div className="flex flex-col justify-center gap-2 w-full items-center">
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
                  className="text-textSecondary font-bold hover:underline cursor-pointer select-none"
                >
                  #{selectedStudent.id}
                </span>
              </div>
            </div>
            <div
              className="flex justify-start gap-12 w-full"
              dir="rtl"
              lang="ar"
            >
              <p
                className={`text-lg select-none ${
                  selectedStudent.phone_number
                    ? 'cursor-pointer hover:underline'
                    : 'text-red-500 cursor-not-allowed'
                }`}
                onClick={() =>
                  selectedStudent.phone_number &&
                  copyToClipboard(selectedStudent.phone_number, addAlert)
                }
              >
                الهاتف: {selectedStudent.phone_number || 'لا يوجد'}
              </p>
              <p
                className={`text-lg select-none ${
                  selectedStudent.parent_phone_1
                    ? 'cursor-pointer hover:underline'
                    : 'text-red-500 cursor-not-allowed'
                }`}
                onClick={() =>
                  selectedStudent.parent_phone_1 &&
                  copyToClipboard(selectedStudent.parent_phone_1, addAlert)
                }
              >
                هاتف ولي الأمر 1: {selectedStudent.parent_phone_1 || 'لا يوجد'}
              </p>
              <p
                className={`text-lg select-none ${
                  selectedStudent.parent_phone_2
                    ? 'cursor-pointer hover:underline'
                    : 'text-red-500 cursor-not-allowed'
                }`}
                onClick={() =>
                  selectedStudent.parent_phone_2 &&
                  copyToClipboard(selectedStudent.parent_phone_2, addAlert)
                }
              >
                هاتف ولي الأمر 2: {selectedStudent.parent_phone_2 || 'لا يوجد'}
              </p>
              <p
                className={`text-lg select-none ${
                  selectedStudent.parent_phone_3
                    ? 'cursor-pointer hover:underline'
                    : 'text-red-500 cursor-not-allowed'
                }`}
                onClick={() =>
                  selectedStudent.parent_phone_3 &&
                  copyToClipboard(selectedStudent.parent_phone_3, addAlert)
                }
              >
                هاتف ولي الأمر 3: {selectedStudent.parent_phone_3 || 'لا يوجد'}
              </p>
            </div>

          <div className="mt-4 flex gap-4">
            <Button color='#22c55e' onClick={handleEditClick} className="bg-green-500 hover:!border-green-400 hover:!text-green-400 text-white rounded-lg">
              تعديل
            </Button>
            <Button color='#ef4444' className="bg-red-500 hover:!border-red-500 hover:!text-red-500 text-white rounded-lg">
              حذف
            </Button>
            <Button color='#eab308'  className="bg-yellow-500 hover:!border-yellow-500 hover:!text-yellow-500 text-white rounded-lg">
              تعديل
            </Button>
          </div>
          </div>
        </div>
      )}

      <EditStudentModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        studentId={selectedStudent?.id}
      />
    </div>
  );
}
