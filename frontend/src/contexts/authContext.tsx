import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { User, AuthContextType, RegisterData } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erro ao restaurar usuário:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      // 1. Fazer login para pegar o token
      const { token } = await authService.login(email, senha);
      
      console.log('💾 Token salvo no localStorage:', token);
      localStorage.setItem('token', token);
      
      // Pequeno delay para garantir que o token foi salvo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 2. Buscar perfil do usuário com o token
      console.log('🔄 Buscando perfil...');
      const userProfile = await authService.getProfile();
      
      // 3. Salvar usuário
      setUser(userProfile);
      localStorage.setItem('user', JSON.stringify(userProfile));
      
      console.log('✅ Login completo - Usuário:', userProfile);
      return { user: userProfile, token };
      
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      // 1. Fazer registro para pegar o token
      const { token } = await authService.register(userData);
      
      // 2. Buscar perfil do usuário com o token
      const userProfile = await authService.getProfile();
      
      // 3. Salvar tudo
      setUser(userProfile);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userProfile));
      
      return { user: userProfile, token };
      
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};