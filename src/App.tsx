import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
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
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route 
              path="/candidate/dashboard" 
              element={
                <ProtectedRoute requiredRole="candidate">
                  <CandidateDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidate/profile" 
              element={
                <ProtectedRoute requiredRole="candidate">
                  <CandidateProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidate/jobs" 
              element={
                <ProtectedRoute requiredRole="candidate">
                  <JobSearch />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidate/settings" 
              element={
                <ProtectedRoute requiredRole="candidate">
                  <Settings />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/employer/dashboard" 
              element={
                <ProtectedRoute requiredRole="employer">
                  <EmployerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/candidates" 
              element={
                <ProtectedRoute requiredRole="employer">
                  <CandidateSearch />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/jobs" 
              element={
                <ProtectedRoute requiredRole="employer">
                  <EmployerJobs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/settings" 
              element={
                <ProtectedRoute requiredRole="employer">
                  <Settings />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
