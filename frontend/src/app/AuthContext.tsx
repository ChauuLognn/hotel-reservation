import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authApi from '@features/auth/api/authApi';

export interface User {
  token: string;
  tokenType: string;
  userId: number;
  account: string;
  empId?: number | null;
  empName?: string | null;
  role: 'MANAGER' | 'EMPLOYEE' | 'CUSTOMER' | string;
  guestId?: number | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (account: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const userInfo = localStorage.getItem('userInfo');
    if (token && userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (account: string, password: string): Promise<User> => {
    const res = await authApi.login({ account, password });
    const data = res.data as User;
    if (!data?.token) {
      throw new Error('Phản hồi đăng nhập không hợp lệ');
    }
    localStorage.setItem('jwtToken', data.token);
    localStorage.setItem('userId', String(data.userId));
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('currentGuestId');
    setUser(null);
  };

  const isAdmin = (): boolean => {
    const role = user?.role;
    return role === 'MANAGER';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
