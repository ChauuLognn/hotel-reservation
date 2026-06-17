import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Guests from './pages/Guests';
import Rooms from './pages/Rooms';
import Bookings from './pages/Bookings';
import Reservations from './pages/Reservations';
import Services from './pages/Services';
import Bills from './pages/Bills';
import Users from './pages/Users';
import Admin from './pages/Admin';
import Settings from './pages/Settings';
import BookingDetail from './pages/BookingDetail';
import UserHome from './pages/UserHome';

// Protected Route - yêu cầu đăng nhập
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner" />Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// Admin Route - chỉ admin/manager/receptionist/employee
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner"><div className="spinner" />Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  const staffRoles = ['ADMIN', 'MANAGER', 'RECEPTIONIST', 'EMPLOYEE'];
  if (!staffRoles.includes(user.role)) return <Navigate to="/user-home" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/user-home" element={<UserHome />} />

      {/* Admin/Staff routes */}
      <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/guests" element={<AdminRoute><Guests /></AdminRoute>} />
      <Route path="/rooms" element={<AdminRoute><Rooms /></AdminRoute>} />
      <Route path="/bookings" element={<AdminRoute><Bookings /></AdminRoute>} />
      <Route path="/reservations" element={<AdminRoute><Reservations /></AdminRoute>} />
      <Route path="/services" element={<AdminRoute><Services /></AdminRoute>} />
      <Route path="/bills" element={<AdminRoute><Bills /></AdminRoute>} />
      <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/booking-detail/:resId" element={<AdminRoute><BookingDetail /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
