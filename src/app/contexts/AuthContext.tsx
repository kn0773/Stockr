import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('stockr_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock authentication - in real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    const user = {
      email,
      name: email.split('@')[0], // Use email prefix as name
    };
    
    setUser(user);
    localStorage.setItem('stockr_user', JSON.stringify(user));
  };

  const signup = async (email: string, password: string, name: string) => {
    // Mock signup - in real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    const user = {
      email,
      name,
    };
    
    setUser(user);
    localStorage.setItem('stockr_user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stockr_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
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
