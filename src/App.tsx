import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ToastProvider } from './contexts/ToastContext';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import CandidateSearch from './pages/CandidateSearch';
import JobSearch from './pages/JobSearch';
import CandidateProfile from './pages/CandidateProfile';
import EmployerJobs from './pages/EmployerJobs';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <UserProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/candidate/dashboard" replace />} />
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/candidate/profile" element={<CandidateProfile />} />
            <Route path="/candidate/jobs" element={<JobSearch />} />
            <Route path="/candidate/settings" element={<Settings />} />
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            <Route path="/employer/candidates" element={<CandidateSearch />} />
            <Route path="/employer/jobs" element={<EmployerJobs />} />
            <Route path="/employer/settings" element={<Settings />} />
          </Routes>
        </ToastProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
