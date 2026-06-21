import { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khôi phục session từ localStorage
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

  const login = async (account, password) => {
    const res = await authApi.login({ account, password });
    const data = res.data.data;
    localStorage.setItem('jwtToken', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch (err) { console.error(err); }
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('currentGuestId');
    setUser(null);
  };

  const isAdmin = () => {
    const role = user?.role;
    return role === 'MANAGER';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
