import axios from 'axios';
import { create } from 'zustand';

export const useStudentsStore = create((set,get) => ({
  students: [],
  filteredStudents: [],
  selectedStudent:null,
  // Add Student
  addStudent: async (student) => {
    try {
      await axios
        .post('http://localhost:65000/api/student', student, {
            headers: {
            'Content-Type': 'multipart/form-data',
            },
        });
        await get().getAllStudents();
    } catch (error) {
      console.error('Error adding student:', error);
    }
  },

  // Get All Students
  getAllStudents: async () => {
    try {
      const response = await axios.get('http://localhost:65000/api/student?all=true');
      const data = response.data.map((student) => ({
        key: student.id,
        ...student,
      }));
      set({ students: data, filteredStudents: data });
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  },

  // Get Students of a Group
  getStudentsOfGroup: async (groupId) => {
    try {
      const response = await fetch(`http://localhost:65000/api/student?groupId=${groupId}&all=true`);
      const data = await response.json();
      set({ students: data, filteredStudents: data });
    } catch (error) {
      console.error('Error fetching group students:', error);
    }
  },

  // Update Student
  updateStudent: async (student) => {
    try {
      const response = await fetch(`http://localhost:65000/api/student/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });
      const data = await response.json();
      set((state) => ({
        students: state.students.map((s) => (s.id === student.id ? data : s)),
        filteredStudents: state.filteredStudents.map((s) => (s.id === student.id ? data : s)),
      }));
    } catch (error) {
      console.error('Error updating student:', error);
    }
  },

  // Delete Student
  deleteStudent: async (studentId) => {
    try {
      await fetch(`http://localhost:65000/api/student/${studentId}`, { method: 'DELETE' });
      set((state) => ({
        students: state.students.filter((s) => s.id !== studentId),
        filteredStudents: state.filteredStudents.filter((s) => s.id !== studentId),
      }));
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  },

  // Search Student
  searchStudent: async ({ url, searchText, sortField, isReverse, isBlocked, isNotBlocked, isAttend, isAbsent, onDataResponse }) => {
    try {
      const response = await axios.get(
        `${url}all=true&search=${searchText}&sortBy=${sortField}&sortOrder=${isReverse ? 'DESC' : 'ASC'}${
          isBlocked & isNotBlocked ? '' : '&blocked=' + isBlocked
        }${!isAttend && !isAbsent ? '' : isAttend && !isAbsent ? '&attended=true' : !isAttend && isAbsent ? '&attended=false' : ''}&absent=${isAbsent}`
      );
      let data = [];
      if (onDataResponse) {
        data = onDataResponse(response.data);
      } else {
        data = response.data.map((student) => ({
          key: student.id,
          ...student,
        }));
      }
      set({ students: data, filteredStudents: data });
    } catch (error) {
      console.error('Error searching students:', error);
    }
  },
  getStudent : async (id) => {
    try {
      const response = await axios.get(`http://localhost:65000/api/student/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  },
  setStudent : (student)=>(set({selectedStudent:student}))
}));
