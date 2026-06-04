import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import NoteConverter from './pages/NoteConverter';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects/:id" element={<ProjectView />} />
        <Route path="/convert" element={<NoteConverter />} />
      </Routes>
    </BrowserRouter>
  );
}
