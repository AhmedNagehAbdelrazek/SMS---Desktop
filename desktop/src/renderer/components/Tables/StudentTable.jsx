import { useEffect, useState } from 'react';
import { Table, Button } from 'antd';

export default function StudentTable({ data, onRowClick, itemsPerPage = 10, additionalColumns=[] }) {
  const [currentPage, setCurrentPage] = useState(0);

  // Divide data into chunks
  const chunkedData = [];

  data = data.map((student) => ({ ...student, key: student.id , group_name:student?.Group?.name || "لا يوجد جروب" }));
  for (let i = 0; i < data.length; i += itemsPerPage) {
    chunkedData.push(data.slice(i, i + itemsPerPage));
  }

  const totalPages = chunkedData.length;

  const columns = [
    {
      title: 'كود الطالب',
      dataIndex: 'id',
      key: 'id',
      width: '15%',
    },
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
    },
    {
      title: 'رقم الهاتف',
      dataIndex: 'phone_number',
      key: 'phone_number',
      width: '20%',
    },
    {
      title: 'اسم الجروب',
      dataIndex: 'group_name',
      key: 'group_name',
      width: '35%',
    },
    ...additionalColumns,
    {
      title: '',
      dataIndex: 'blocked',
      key: 'blocked',
      width: '1%',
      render: (blocked) => (
        <span className={`w-2 aspect-square inline-block rounded-full ${blocked ? 'bg-black' : 'bg-white border'}`} />
      ),
    },
  ];
  useEffect(() => {
    data = data.map((student) => ({ ...student, key: student.id , group_name:student?.Group?.name || "لا يوجد جروب" }));
    console.log({students:data});
  }, [data]);

  const renderPageButtons = () => {
    const buttons = [];

    // Always show the first page
    buttons.push(
      <Button
        key={0}
        className={`mx-1 ${currentPage === 0 ? 'bg-macos-selected text-white' : ''}`}
        onClick={() => setCurrentPage(0)}
      >
        1
      </Button>
    );

    // Show ellipsis if current page is greater than 3
    if (currentPage > 3) {
      buttons.push(<span key="ellipsis1" className="select-none text-lg font-bold mx-1">...</span>);
    }

    // Show pages around the current page
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages - 2, currentPage + 2); i++) {
      buttons.push(
        <Button
          key={i}
          className={`mx-1 ${currentPage === i ? 'bg-macos-selected text-white' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i + 1}
        </Button>
      );
    }

    // Show ellipsis if current page is less than totalPages - 3
    if (currentPage < totalPages - 3) {
      buttons.push(<span key="ellipsis2" className="select-none text-lg font-bold mx-1">...</span>);
    }

    // Always show the last page
    if (totalPages > 1) {
      buttons.push(
        <Button
          key={totalPages - 1}
          className={`mx-1 ${currentPage === totalPages - 1 ? 'bg-macos-selected text-white' : ''}`}
          onClick={() => setCurrentPage(totalPages - 1)}
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="">
      <div className='!rounded-xl border overflow-hidden'>
        <Table
          dataSource={chunkedData[currentPage]}
          columns={columns}
          pagination={false}
          onRow={(record) => ({
            onClick: () => onRowClick(record),
          })}
          rowClassName={`cursor-pointer`}
        />
      </div>
      <div className="flex justify-center mt-4">
        <Button
          className="mx-2"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          السابق
        </Button>
        {renderPageButtons()}
        <Button
          className="mx-2"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={currentPage === totalPages - 1}
        >
          التالي
        </Button>
      </div>
    </div>
  );
}
