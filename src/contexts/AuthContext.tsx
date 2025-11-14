import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '../types/auth';
import { login as loginUtil, signUp as signUpUtil, logout as logoutUtil, getCurrentUser } from '../utils/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking authentication on mount...');
      const token = localStorage.getItem('token');
      console.log('📝 Token in localStorage:', token ? 'EXISTS' : 'MISSING');
      
      const currentUser = await getCurrentUser();
      console.log('👤 getCurrentUser result:', currentUser);
      
      if (currentUser) {
        console.log('✅ User authenticated:', currentUser.username);
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        console.log('❌ No authenticated user found');
      }
      
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('🔐 Attempting login for:', username);
    const loggedInUser = await loginUtil(username, password);
    console.log('Login result:', loggedInUser);
    
    if (loggedInUser) {
      const token = localStorage.getItem('token');
      console.log('✅ Login successful! Token saved:', token ? 'YES' : 'NO');
      setUser(loggedInUser);
      setIsAuthenticated(true);
      return true;
    }
    console.log('❌ Login failed');
    return false;
  };

  const signup = async (username: string, password: string): Promise<boolean> => {
    console.log('📝 Attempting signup for:', username);
    const success = await signUpUtil(username, password);
    console.log('Signup result:', success);
    
    if (success) {
      // Auto-login after signup
      const loggedInUser = await loginUtil(username, password);
      if (loggedInUser) {
        const token = localStorage.getItem('token');
        console.log('✅ Signup + login successful! Token saved:', token ? 'YES' : 'NO');
        setUser(loggedInUser);
        setIsAuthenticated(true);
      }
    }
    return success;
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    logoutUtil();
    setUser(null);
    setIsAuthenticated(false);
    console.log('Token after logout:', localStorage.getItem('token'));
  };

  // Show loading state while checking auth
  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

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