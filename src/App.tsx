import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/user/Dashboard';
import UserChat from './pages/user/Chat';
import UserSessions from './pages/user/Sessions';
import UserMemory from './pages/user/Memory';
import UserSkills from './pages/user/Skills';
import UserSettings from './pages/user/Settings';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminProviders from './pages/admin/Providers';
import AdminChannels from './pages/admin/Channels';
import AdminCron from './pages/admin/Cron';
import AdminSkills from './pages/admin/Skills';
import AdminConfig from './pages/admin/Config';
import AdminLogs from './pages/admin/Logs';
import AdminStatus from './pages/admin/Status';
import './styles/index.css';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/user" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/user" replace /> : <LoginPage />} />
      
      {/* User Portal Routes */}
      <Route path="/user" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<UserDashboard />} />
        <Route path="chat" element={<UserChat />} />
        <Route path="sessions" element={<UserSessions />} />
        <Route path="memory" element={<UserMemory />} />
        <Route path="skills" element={<UserSkills />} />
        <Route path="settings" element={<UserSettings />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><MainLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="providers" element={<AdminProviders />} />
        <Route path="channels" element={<AdminChannels />} />
        <Route path="cron" element={<AdminCron />} />
        <Route path="skills" element={<AdminSkills />} />
        <Route path="config" element={<AdminConfig />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="status" element={<AdminStatus />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/user" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
