import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Group from './pages/GroupPage';
import Student from './pages/Student';
// import Settings from './pages/Settings';
import AppLayout from './pages/Layout';
import { AlertProvider } from './context';

export default function App() {
  return (
    <AlertProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Student />} />
            <Route path="group" element={<Group />} />
            {/* <Route path="settings" element={<Settings />} /> */}
          </Route>
        </Routes>
      </Router>
    </AlertProvider>
  );
}
