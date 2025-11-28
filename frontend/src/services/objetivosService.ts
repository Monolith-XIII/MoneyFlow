import { api } from './api';
import { Objetivo } from '../types';

export const objetivosService = {
  async getAll(): Promise<Objetivo[]> {
    try {
      const response = await api.get('/objetivos');
      console.log('🎯 Resposta completa do backend:', response.data);
      
      if (Array.isArray(response.data)) {
        // MAPEIA OS CAMPOS DO BACKEND PARA O FRONTEND
        const objetivosMapeados = response.data.map((objetivo: any) => ({
          id: objetivo.id,
          titulo: objetivo.nome, // ← MAPEIA nome → titulo
          descricao: objetivo.descricao,
          valor_objetivo: objetivo.valor_total, // ← MAPEIA valor_total → valor_objetivo
          valor_atual: objetivo.valor_atual,
          data_limite: objetivo.data_conclusao, // ← MAPEIA data_conclusao → data_limite
          cor: objetivo.cor,
          icone: objetivo.icone,
          usuario_id: objetivo.usuario_id,
          compartilhado: objetivo.papel === 'membro' // ← INFERE compartilhado do campo papel
        }));
        
        console.log('🎯 Objetivos mapeados:', objetivosMapeados);
        return objetivosMapeados;
      } else {
        console.warn('❌ Resposta não é array');
        return [];
      }
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
    console.log('📤 Criando objetivo:', objetivo);
    
    // Mapeia campos do frontend para o backend
    const objetivoData = {
      nome: objetivo.titulo, // ← MAPEIA titulo → nome
      descricao: objetivo.descricao,
      valor_total: objetivo.valor_objetivo, // ← MAPEIA valor_objetivo → valor_total
      valor_atual: objetivo.valor_atual,
      data_conclusao: objetivo.data_limite, // ← MAPEIA data_limite → data_conclusao
      cor: objetivo.cor,
      icone: objetivo.icone,
      tipo: 'personalizado'
    };

    console.log('📤 Dados enviados para backend:', objetivoData);
    
    const response = await api.post('/objetivos', objetivoData);
    console.log('✅ Objetivo criado:', response.data);
    
    // Mapeia a resposta de volta para o formato do frontend
    return {
      ...objetivo,
      id: response.data.objetivo_id || Date.now()
    };
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