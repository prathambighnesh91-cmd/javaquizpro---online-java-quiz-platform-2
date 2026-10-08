import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: (payload: { sub: string; email: string; name: string; avatarUrl?: string; role?: Role }) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  switchRole: (role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'javaquiz_current_user_v1';
const CURRENT_TOKEN_KEY = 'javaquiz_current_token_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem(CURRENT_USER_KEY);
        const storedToken = localStorage.getItem(CURRENT_TOKEN_KEY);
        if (storedUser && storedToken) {
          const parsedUser: User = JSON.parse(storedUser);
          if (parsedUser && typeof parsedUser.id === 'number') {
            try {
              // Always verify and fetch the fresh database profile for the CURRENT user ID
              const freshUser = await api.getCurrentUser(parsedUser.id);
              setUser(freshUser);
              setToken(storedToken);
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(freshUser));
            } catch {
              // Stale or deleted user session — clear completely
              localStorage.removeItem(CURRENT_USER_KEY);
              localStorage.removeItem(CURRENT_TOKEN_KEY);
              setUser(null);
              setToken(null);
            }
          }
        }
      } catch {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(CURRENT_TOKEN_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password = 'password123') => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user));
      localStorage.setItem(CURRENT_TOKEN_KEY, res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (payload: {
    sub: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role?: Role;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.loginWithGoogle(payload);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user));
      localStorage.setItem(CURRENT_TOKEN_KEY, res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: Role) => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password, role });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.user));
      localStorage.setItem(CURRENT_TOKEN_KEY, res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_TOKEN_KEY);
  };

  // Safely switch the role of the CURRENT logged in user (never swap to another user)
  const switchRole = async (targetRole: Role) => {
    if (!user) return;
    if (user.role === targetRole) return;
    setIsLoading(true);
    try {
      const updated = await api.updateUserRole(user.id, targetRole);
      setUser(updated);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginWithGoogle, register, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
