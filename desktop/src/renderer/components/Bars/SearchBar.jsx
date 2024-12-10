import { useEffect, useState } from 'react';
import { Input, Select, Checkbox } from 'antd';
const { Option } = Select;
import axios from 'axios';
import { useStudentsStore } from '../../Store/useStudentStore';

export default function SearchBar({ url, setFilteredData , onDataResponse , }) {
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('id');
  const [isReverse, setIsReverse] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isNotBlocked, setIsNotBlocked] = useState(true);
  const [isAttend, setIsAttend] = useState(true);
  const [isAbsent, setIsAbsent] = useState(true);

  const searchStudent = useStudentsStore(state => state.searchStudent);
  const students = useStudentsStore(state => state.students);

  const handleSearch = async () => {
    await searchStudent({ url, searchText, sortField, isReverse, isBlocked, isNotBlocked, isAttend, isAbsent, onDataResponse });
    setFilteredData(students);
  };

  useEffect(() => {
    if ((!isBlocked || !isNotBlocked) && sortField === 'blocked') {
      setSortField('id');      
    }
    handleSearch();
  }, [searchText, sortField, isReverse, isBlocked, isNotBlocked, isAttend, isAbsent]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-macos-light-gray rounded-xl shadow-md">
      <div className="flex gap-4">
        <Input
          placeholder="ابحث عن الطالب"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="mb-2"
        />
        <Select
          title="ترتيب"
          direction='rtl'
          value={sortField}
          onChange={(value) => setSortField(value)}
          className="w-full mb-2"
        >
          <Option value="name">الاسم</Option>
          <Option value="id">كود الطالب</Option>
          {isBlocked & isNotBlocked && <Option value="blocked">الحظر</Option>}
        </Select>
      </div>
      <div className="flex flex-wrap gap-4">
        <Checkbox
          checked={isReverse}
          onChange={(e) => setIsReverse(e.target.checked)}
        >
          ترتيب عكسي
        </Checkbox>
        <Checkbox
          checked={isBlocked}
          onChange={(e) => setIsBlocked(e.target.checked)}
        >
          محظور
        </Checkbox>
        <Checkbox
          checked={isNotBlocked}
          onChange={(e) => setIsNotBlocked(e.target.checked)}
        >
          غير محظور
        </Checkbox>
        <Checkbox
          checked={isAttend}
          onChange={(e) => setIsAttend(e.target.checked)}
        >
          حاضر
        </Checkbox>
        <Checkbox
          checked={isAbsent}
          onChange={(e) => setIsAbsent(e.target.checked)}
        >
          لم يحضر
        </Checkbox>
      </div>
    </div>
  );
}
