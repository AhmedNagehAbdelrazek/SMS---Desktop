import { Table } from 'antd';

export default function StudentTable({ data, onRowClick }) {
  const columns = [
    {
      title: 'كود الطالب',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'رقم الهاتف',
      dataIndex: 'phone_number',
      key: 'phone_number',
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      pagination={false}
      onRow={(record) => ({
        onClick: () => onRowClick(record),
      })}
    />
  );
}
