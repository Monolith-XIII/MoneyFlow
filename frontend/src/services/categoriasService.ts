import { api } from './api';
import { Categoria } from '../types';

export const categoriasService = {
  async getAll(): Promise<Categoria[]> {
    try {
      const response = await api.get('/categorias');
      return response.data;
    } catch (error) {
      console.warn('API não disponível, usando categorias mock');
      return this.getMockCategorias();
    }
  },

  async getById(id: number): Promise<Categoria> {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },

  async create(categoria: Omit<Categoria, 'id'>): Promise<Categoria> {
    const response = await api.post('/categorias', categoria);
    return response.data;
  },

  async update(id: number, categoria: Partial<Categoria>): Promise<Categoria> {
    const response = await api.put(`/categorias/${id}`, categoria);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/categorias/${id}`);
  },

  getMockCategorias(): Categoria[] {
    return [
      { id: 1, nome: 'Salário', tipo: 'receita', cor: '#28a745', icone: 'dollar-sign' },
      { id: 2, nome: 'Freelance', tipo: 'receita', cor: '#20c997', icone: 'code' },
      { id: 3, nome: 'Investimentos', tipo: 'receita', cor: '#17a2b8', icone: 'trending-up' },
      { id: 4, nome: 'Presente', tipo: 'receita', cor: '#6f42c1', icone: 'gift' },
      { id: 5, nome: 'Alimentação', tipo: 'despesa', cor: '#dc3545', icone: 'shopping-cart' },
      { id: 6, nome: 'Moradia', tipo: 'despesa', cor: '#fd7e14', icone: 'home' },
      { id: 7, nome: 'Transporte', tipo: 'despesa', cor: '#ffc107', icone: 'car' },
      { id: 8, nome: 'Saúde', tipo: 'despesa', cor: '#e83e8c', icone: 'heart' },
      { id: 9, nome: 'Lazer', tipo: 'despesa', cor: '#6f42c1', icone: 'film' },
      { id: 10, nome: 'Educação', tipo: 'despesa', cor: '#007bff', icone: 'book' },
    ];
  }
};