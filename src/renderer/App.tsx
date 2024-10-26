import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ListStudents from './components/ListStudents';
import AddStudents from './components/AddStrudent';
import { Col, Flex, Row } from 'antd';

function Hello() {
  return (
    <Row style={{ height: '100vh' }}>
      <Col style={{overflow:"auto"}} >
        <AddStudents />
        <ListStudents />
      </Col>
    </Row>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
