import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (email: string, pass: string, role?: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, User> = {
  DEPARTMENT_OFFICIAL: {
    id: 1,
    email: 'official@inframind.demo',
    name: 'Dr. Rajeshwari Sharma, IAS',
    role: 'DEPARTMENT_OFFICIAL',
    department: 'DoSJE Monitoring & Vigilance Wing'
  },
  INSPECTION_OFFICER: {
    id: 2,
    email: 'inspector@inframind.demo',
    name: 'Officer Arun Kumar',
    role: 'INSPECTION_OFFICER',
    department: 'District Inspection Cell – Chennai'
  },
  INSTITUTE_NGO: {
    id: 3,
    email: 'institute@inframind.demo',
    name: 'ABC Welfare Centre Admin',
    role: 'INSTITUTE_NGO',
    department: 'ABC Welfare Centre, Chennai',
    institute_id: 1
  },
  SUPER_ADMIN: {
    id: 4,
    email: 'admin@inframind.demo',
    name: 'Central Platform Administrator',
    role: 'SUPER_ADMIN',
    department: 'Ministry of Social Justice & Empowerment, GoI'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('inframind_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.DEPARTMENT_OFFICIAL;
  });
  const [isLoading, setIsLoading] = useState(false);

  const role: UserRole = user?.role || 'DEPARTMENT_OFFICIAL';

  const login = async (email: string, pass: string, chosenRole?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass, chosenRole);
      localStorage.setItem('inframind_token', res.access_token);
      localStorage.setItem('inframind_user', JSON.stringify(res.user));
      setUser(res.user);
    } catch (err) {
      // Fallback to local demo user if backend is unavailable
      const matchedRole = chosenRole as UserRole || (email.includes('inspector') ? 'INSPECTION_OFFICER' : email.includes('institute') ? 'INSTITUTE_NGO' : 'DEPARTMENT_OFFICIAL');
      const fallbackUser = DEMO_USERS[matchedRole];
      localStorage.setItem('inframind_token', 'demo-token');
      localStorage.setItem('inframind_user', JSON.stringify(fallbackUser));
      setUser(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('inframind_token');
    localStorage.removeItem('inframind_user');
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const newUser = DEMO_USERS[newRole];
    setUser(newUser);
    localStorage.setItem('inframind_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, switchRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
