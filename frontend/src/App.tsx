import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import { ToastProvider } from '@contexts/ToastContext';
import { ConfirmProvider } from '@contexts/ConfirmContext';

// Pages
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import ForgotPassword from '@pages/auth/ForgotPassword';
import Dashboard from '@pages/dashboard/Dashboard';
import Guests from '@pages/guests/Guests';
import Rooms from '@pages/rooms/Rooms';
import Reservations from '@pages/bookings/Reservations';
import ReservationGuests from '@pages/bookings/ReservationGuests';
import Services from '@pages/services/Services';
import Bills from '@pages/bookings/Bills';
import Employees from '@pages/employees/Employees';
import Admin from '@pages/dashboard/Admin';
import BookingDetail from '@pages/bookings/BookingDetail';
import UserHome from '@pages/customer/UserHome';

interface RouteProps {
  children: React.ReactNode;
}

// Protected Route - yêu cầu đăng nhập
function ProtectedRoute({ children }: RouteProps) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-apple-canvas-parchment text-apple-ink-muted-48 gap-2">
        <span className="w-5 h-5 border-2 border-apple-primary border-t-transparent rounded-full animate-spin-custom"></span>
        Đang tải...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Admin Route - chỉ admin/manager/receptionist/employee
function AdminRoute({ children }: RouteProps) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-apple-canvas-parchment text-apple-ink-muted-48 gap-2">
        <span className="w-5 h-5 border-2 border-apple-primary border-t-transparent rounded-full animate-spin-custom"></span>
        Đang tải...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  const staffRoles = ['MANAGER', 'EMPLOYEE'];
  if (!staffRoles.includes(user.role)) return <Navigate to="/user-home" replace />;
  return <>{children}</>;
}

// Manager Route - chỉ MANAGER được truy cập
function ManagerRoute({ children }: RouteProps) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-apple-canvas-parchment text-apple-ink-muted-48 gap-2">
        <span className="w-5 h-5 border-2 border-apple-primary border-t-transparent rounded-full animate-spin-custom"></span>
        Đang tải...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'MANAGER') return <Navigate to="/" replace />;
  return <>{children}</>;
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
      <Route path="/users" element={<ManagerRoute><Employees /></ManagerRoute>} />
      <Route path="/admin" element={<ManagerRoute><Admin /></ManagerRoute>} />
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
        <ToastProvider>
          <ConfirmProvider>
            <AppRoutes />
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
