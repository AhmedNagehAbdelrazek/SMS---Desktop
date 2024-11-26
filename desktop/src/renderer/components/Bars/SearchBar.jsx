import { useEffect, useState } from 'react';
import { Input, Select, Checkbox } from 'antd';
const { Option } = Select;

export default function SearchBar({ onFilter }) {
  const [searchText, setSearchText] = useState('');
  const [sortField, setSortField] = useState('name');
  const [isReverse, setIsReverse] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isNotBlocked, setIsNotBlocked] = useState(true);
  const [isAttend, setIsAttend] = useState(true);
  const [isAbsent, setIsAbsent] = useState(true);

  const handleSearch = () => {
    onFilter({
      searchText,
      sortField,
      isReverse,
      isBlocked,
      isNotBlocked,
      isAttend,
      isAbsent,
    });
  };

  useEffect(() => {
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
          <Option value="student-id">كود الطالب</Option>
          <Option value="blocked">الحظر</Option>
          <Option value="attendance">الحضور</Option>
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
