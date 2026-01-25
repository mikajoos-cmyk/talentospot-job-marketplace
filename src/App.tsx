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
import PostJob from './pages/employer/PostJob';
import CompanyProfile from './pages/employer/CompanyProfile';
import SavedJobs from './pages/candidate/SavedJobs';
import MyApplications from './pages/candidate/MyApplications';
import Packages from './pages/shared/Packages';
import Messages from './pages/shared/Messages';
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
              path="/candidate/saved" 
              element={
                <ProtectedRoute requiredRole="candidate">
                  <SavedJobs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidate/applications" 
              element={
                <ProtectedRoute requiredRole="candidate">
                  <MyApplications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidate/messages" 
              element={
                <ProtectedRoute requiredRole="candidate">
                  <Messages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidate/packages" 
              element={
                <ProtectedRoute requiredRole="candidate">
                  <Packages />
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
              path="/employer/post-job" 
              element={
                <ProtectedRoute requiredRole="employer">
                  <PostJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/profile" 
              element={
                <ProtectedRoute requiredRole="employer">
                  <CompanyProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/messages" 
              element={
                <ProtectedRoute requiredRole="employer">
                  <Messages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/packages" 
              element={
                <ProtectedRoute requiredRole="employer">
                  <Packages />
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
