import { api } from './api';
import { User } from '../types';

export const usuarioService = {
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put('/usuario/perfil', userData);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/usuario/alterar-senha', { currentPassword, newPassword });
  },

  async buscarUsuarios(query: string): Promise<User[]> {
    const response = await api.get('/usuario/buscar', { params: { query } });
    return response.data;
  },

  async desativarConta(): Promise<void> {
    await api.post('/usuario/desativar-conta');
  }
};