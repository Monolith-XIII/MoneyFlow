import { api } from './api';
import { Orcamento } from '../types';

export const orcamentosService = {
  async getAll(): Promise<Orcamento[]> {
    try {
      const response = await api.get('/orcamentos');
      return response.data;
    } catch (error) {
      console.warn('API não disponível, usando orçamentos mock');
      return this.getMockOrcamentos();
    }
  },

  async getById(id: number): Promise<Orcamento> {
    const response = await api.get(`/orcamentos/${id}`);
    return response.data;
  },

  async create(orcamento: Omit<Orcamento, 'id'>): Promise<Orcamento> {
    const response = await api.post('/orcamentos', orcamento);
    return response.data;
  },

  async update(id: number, orcamento: Partial<Orcamento>): Promise<Orcamento> {
    const response = await api.put(`/orcamentos/${id}`, orcamento);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/orcamentos/${id}`);
  },

  getMockOrcamentos(): Orcamento[] {
    return [
      {
        id: 1,
        categoria_id: 5,
        valor: 1500,
        mes: 11,
        ano: 2025,
        categoria: { id: 5, nome: 'Alimentação', tipo: 'despesa', cor: '#dc3545', icone: 'shopping-cart' }
      },
      {
        id: 2,
        categoria_id: 6,
        valor: 2000,
        mes: 11,
        ano: 2025,
        categoria: { id: 6, nome: 'Moradia', tipo: 'despesa', cor: '#fd7e14', icone: 'home' }
      },
      {
        id: 3,
        categoria_id: 7,
        valor: 800,
        mes: 11,
        ano: 2025,
        categoria: { id: 7, nome: 'Transporte', tipo: 'despesa', cor: '#ffc107', icone: 'car' }
      }
    ];
  }
};