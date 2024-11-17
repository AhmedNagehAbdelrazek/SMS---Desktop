import { Input, Select, Checkbox } from "antd";
const { Option } = Select;

export default function SearchBar({ onSearch }) {
  return (
    <div>
      <Input
        placeholder="ابحث عن الطالب"
        onChange={(e) => onSearch(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <Select defaultValue="name" style={{ width: 200, marginRight: 10 }}>
        <Option value="name">الاسم</Option>
        <Option value="student-id">كود الطالب</Option>
      </Select>
      <Checkbox style={{ marginLeft: 10 }}>ترتيب عكسي</Checkbox>
    </div>
  );
}
