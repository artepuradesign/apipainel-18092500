import { useState, useEffect, useCallback } from 'react';

export interface User {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  tipo: 'cliente' | 'admin';
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('usuario');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch {
        // Limpar dados inválidos
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: User, authToken: string) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('usuario', JSON.stringify(userData));
    setUser(userData);
    setToken(authToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('customerEmail');
    localStorage.removeItem('userEmail');
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    setToken(null);
  }, []);

  const isLoggedIn = !!user && !!token;
  const isAdmin = user?.tipo === 'admin';

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    isLoading,
    login,
    logout,
  };
};
