import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ToastProvider } from './contexts/ToastContext';
import { LanguageProvider } from './contexts/LanguageContext';
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
import EditJob from './pages/employer/EditJob';
import CompanyProfile from './pages/employer/CompanyProfile';
import ApplicationDetail from './pages/employer/ApplicationDetail';
import CandidateDetailView from './pages/employer/CandidateDetailView';
import SavedJobs from './pages/candidate/SavedJobs';
import MyApplications from './pages/candidate/MyApplications';
import MyInvitations from './pages/candidate/MyInvitations';
import Network from './pages/shared/Network';
import EditProfile from './pages/candidate/EditProfile';
import JobAlerts from './pages/candidate/JobAlerts';
import Packages from './pages/shared/Packages';
import Messages from './pages/shared/Messages';
import JobDetailView from './pages/shared/JobDetailView';
import CompanyDetail from './pages/shared/CompanyDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <UserProvider>
        <LanguageProvider>
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
                path="/candidate/profile/edit"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <EditProfile />
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
                path="/candidate/alerts"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <JobAlerts />
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
                path="/candidate/invitations"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <MyInvitations />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/candidate/network"
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <Network />
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
                path="/employer/jobs/:id/edit"
                element={
                  <ProtectedRoute requiredRole="employer">
                    <EditJob />
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
                path="/employer/applications/:id"
                element={
                  <ProtectedRoute requiredRole="employer">
                    <ApplicationDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employer/candidates/:id"
                element={
                  <ProtectedRoute requiredRole="employer">
                    <CandidateDetailView />
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
              <Route
                path="/employer/network"
                element={
                  <ProtectedRoute requiredRole="employer">
                    <Network />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="/jobs/:id" element={<JobDetailView />} />
              <Route path="/jobs" element={<JobSearch />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />
              <Route path="/candidates" element={<CandidateSearch />} />
              <Route path="/candidates/:id" element={<CandidateDetailView />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </LanguageProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
