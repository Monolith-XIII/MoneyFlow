import { api } from './api';
import { User, RegisterData } from '../types';

export const authService = {
  async login(email: string, senha: string): Promise<{ token: string }> {
    const response = await api.post('/auth/login', { email, senha });
    console.log('📊 Resposta COMPLETA do login:', response.data);
    console.log('🔑 Token recebido:', response.data.token);
    
    return { token: response.data.token };
  },

  async register(userData: RegisterData): Promise<{ token: string }> {
    const response = await api.post('/auth/registrar', userData);
    console.log('✅ Resposta do registro:', response.data);
    return { token: response.data.token };
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/usuario/perfil');
    console.log('📊 Resposta COMPLETA do perfil:', response.data);
    
    // O backend retorna o usuário diretamente, não dentro de { usuario: ... }
    const userData = response.data;
    
    // Mapear para o tipo User
    const user: User = {
      id: userData.id,
      nome: userData.nome,
      email: userData.email,
      created_at: userData.data_criacao || new Date().toISOString(),
      updated_at: userData.ultimo_acesso || new Date().toISOString()
    };
    
    console.log('✅ Usuário mapeado:', user);
    return user;
  },

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put('/usuario/perfil', userData);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/usuario/alterar-senha', { currentPassword, newPassword });
  }
};