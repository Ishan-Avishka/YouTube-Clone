import { createContext, useContext, useState, useEffect } from 'react';
import { authUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('yt_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username) => {
    const res = await authUser(username);
    setUser(res.data);
    localStorage.setItem('yt_user', JSON.stringify(res.data));
    return res.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('yt_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
