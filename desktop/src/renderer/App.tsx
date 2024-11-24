import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import {
  Group,
  Attendance,
  Settings,
  Student,
  Layout,
} from './pages';
import { AlertProvider } from './context';

export default function App() {
  return (
    <AlertProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Student />} />
            <Route path="/:id" element={<Student />} />
            <Route path="group" element={<Group />} />
            <Route path="group/:id" element={<Group />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </AlertProvider>
  );
}
