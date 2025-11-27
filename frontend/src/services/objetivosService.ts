import { api } from './api';
import { Objetivo } from '../types';

export const objetivosService = {
  async getAll(): Promise<Objetivo[]> {
    try {
      const response = await api.get('/objetivos');
      return response.data;
    } catch (error) {
      console.warn('API não disponível, usando objetivos mock');
      return this.getMockObjetivos();
    }
  },

  async getById(id: number): Promise<Objetivo> {
    const response = await api.get(`/objetivos/${id}`);
    return response.data;
  },

  async create(objetivo: Omit<Objetivo, 'id'>): Promise<Objetivo> {
    const response = await api.post('/objetivos', objetivo);
    return response.data;
  },

  async update(id: number, objetivo: Partial<Objetivo>): Promise<Objetivo> {
    const response = await api.put(`/objetivos/${id}`, objetivo);
    return response.data;
  },

  async addContribuicao(id: number, valor: number): Promise<Objetivo> {
    const response = await api.post(`/objetivos/${id}/contribuir`, { valor });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/objetivos/${id}`);
  },

  getMockObjetivos(): Objetivo[] {
    return [
      {
        id: 1,
        titulo: 'Viagem para Europa',
        descricao: 'Poupar para viagem de 15 dias',
        valor_objetivo: 15000,
        valor_atual: 8200,
        data_limite: '2025-12-31',
        cor: '#007bff',
        icone: 'plane',
        usuario_id: 1,
        compartilhado: false
      },
      {
        id: 2,
        titulo: 'Notebook Novo',
        descricao: 'Comprar MacBook Pro',
        valor_objetivo: 12000,
        valor_atual: 4500,
        data_limite: '2025-06-30',
        cor: '#28a745',
        icone: 'laptop',
        usuario_id: 1,
        compartilhado: false
      }
    ];
  }
};