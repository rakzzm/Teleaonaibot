import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@teleaon.ai': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@teleaon.ai',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  },
  'user@teleaon.ai': {
    password: 'user123',
    user: {
      id: '2',
      email: 'user@teleaon.ai',
      name: 'Demo User',
      role: 'user',
      createdAt: new Date().toISOString(),
    },
  },
  'rakesh@teleaon.ai': {
    password: 'teleaon123',
    user: {
      id: '3',
      email: 'rakesh@teleaon.ai',
      name: 'Rakesh',
      role: 'user',
      createdAt: new Date().toISOString(),
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    // Initialize from localStorage (lazy initialization)
    const stored = localStorage.getItem('teleaon_auth');
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        return {
          user,
          isAuthenticated: true,
          isLoading: false,
        };
      } catch {
        return { user: null, isAuthenticated: false, isLoading: false };
      }
    }
    return { user: null, isAuthenticated: false, isLoading: false };
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUser = MOCK_USERS[email];
    if (mockUser && mockUser.password === password) {
      localStorage.setItem('teleaon_auth', JSON.stringify(mockUser.user));
      setState({
        user: mockUser.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('teleaon_auth');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const isAdmin = state.user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
