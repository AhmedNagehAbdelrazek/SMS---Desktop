import { Button, Col, Row, Table, TableProps } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../shared/RTK/hooks";
import { deleteStudents, fetchAllUser } from "../shared/RTK/slices/mainSlice";



const columns = [
  {
    title: 'Id',
    dataIndex: 'id',
    key: "id"
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
];

export default function ListStudents(){
  const {users} = useAppSelector(state => state.main);
  const dispatch = useAppDispatch();

  useEffect(()=>{
    dispatch(fetchAllUser());
  },[])

  return <>
  <Col >
      <Row style={{minWidth:"max-content"}} align={"middle"} justify={"space-around"}>
          <Button onClick={()=>{
            dispatch(fetchAllUser());
          }}>
            refresh
          </Button>
          <Button onClick={()=>{
            dispatch(deleteStudents());
          }}>
            delete all
          </Button>
      </Row>
      <Table
       dataSource={users?.map(user=> {return {key:user.Id,...user}}) ?? []}
       columns={columns}
       />
  </Col>
  </>
}
