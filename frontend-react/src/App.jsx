import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';
import Dashboard from './features/dashboard/Dashboard';
import Guests from './features/users/Guests';
import Rooms from './features/rooms/Rooms';
import Reservations from './features/reservations/Reservations';
import ReservationGuests from './features/reservations/ReservationGuests';
import Services from './features/services/Services';
import Bills from './features/billing/Bills';
import Users from './features/users/Users';
import Admin from './features/dashboard/Admin';
import BookingDetail from './features/reservations/BookingDetail';
import UserHome from './features/dashboard/UserHome';

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
  const staffRoles = ['MANAGER', 'EMPLOYEE'];
  if (!staffRoles.includes(user.role)) return <Navigate to="/user-home" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/user-home" element={<ProtectedRoute><UserHome /></ProtectedRoute>} />

      {/* Admin/Staff routes */}
      <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
      <Route path="/guests" element={<AdminRoute><Guests /></AdminRoute>} />
      <Route path="/rooms" element={<AdminRoute><Rooms /></AdminRoute>} />
      <Route path="/bookings" element={<AdminRoute><Reservations /></AdminRoute>} />
      <Route path="/reservations" element={<AdminRoute><ReservationGuests /></AdminRoute>} />
      <Route path="/services" element={<AdminRoute><Services /></AdminRoute>} />
      <Route path="/bills" element={<AdminRoute><Bills /></AdminRoute>} />
      <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />      <Route path="/booking-detail/:resId" element={<AdminRoute><BookingDetail /></AdminRoute>} />

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
