import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data.user);
        setRole(res.data.role);
      })
      .catch((e) => {
        console.error("Auth me error:", e);
        sessionStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    sessionStorage.setItem('token', res.data.access_token);
    setToken(res.data.access_token);
    setRole(res.data.role);
    
    // fetch user
    const userRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${res.data.access_token}` }
    });
    setUser(userRes.data.user);
    return userRes.data;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setUser(null);
    setRole(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, role, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
