import { api } from './api';
import { Conta } from '../types';

export const contasService = {
  async getAll(): Promise<Conta[]> {
    try {
      const response = await api.get('/contas');
      return response.data;
    } catch (error) {
      console.warn('API não disponível, usando contas mock');
      return this.getMockContas();
    }
  },

  async getById(id: number): Promise<Conta> {
    const response = await api.get(`/contas/${id}`);
    return response.data;
  },

  async create(conta: Omit<Conta, 'id'>): Promise<Conta> {
    const response = await api.post('/contas', conta);
    return response.data;
  },

  async update(id: number, conta: Partial<Conta>): Promise<Conta> {
    const response = await api.put(`/contas/${id}`, conta);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/contas/${id}`);
  },

  getMockContas(): Conta[] {
    return [
      { id: 1, nome: 'Conta Corrente', saldo: 15420.75, tipo: 'corrente', cor: '#007bff', usuario_id: 1 },
      { id: 2, nome: 'Carteira', saldo: 350.50, tipo: 'carteira', cor: '#28a745', usuario_id: 1 },
      { id: 3, nome: 'Poupança', saldo: 5000.00, tipo: 'poupanca', cor: '#ffc107', usuario_id: 1 },
    ];
  }
};