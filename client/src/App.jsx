import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PublicCapture from './pages/PublicCapture';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeadsList from './pages/LeadsList';
import LeadDetail from './pages/LeadDetail';
import UserManagement from './pages/UserManagement';
import DashboardLayout from './components/Layout/DashboardLayout';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
        <p>Initializing LeadFlow...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12122b',
            color: '#f0f0ff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '14px',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicCapture />} />
      <Route path="/login" element={<Login />} />

      {/* Protected dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<LeadsList />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route
          path="users"
          element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;
