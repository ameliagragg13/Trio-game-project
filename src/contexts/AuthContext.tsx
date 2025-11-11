import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '../types/auth';
import { login as loginUtil, signUp as signUpUtil, logout as logoutUtil, getCurrentUser } from '../utils/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const loggedInUser = loginUtil(username, password);
    if (loggedInUser) {
      setUser(loggedInUser);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const signup = async (username: string, password: string): Promise<boolean> => {
    const success = signUpUtil(username, password);
    if (success) {
      // Auto-login after signup
      const loggedInUser = loginUtil(username, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        setIsAuthenticated(true);
      }
    }
    return success;
  };

  const logout = () => {
    logoutUtil();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout }}>
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

