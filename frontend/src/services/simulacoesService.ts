import { api } from './api';

export const simulacoesService = {
  async getAll(): Promise<any[]> {
    try {
      const response = await api.get('/simulacoes');
      return response.data;
    } catch (error) {
      console.warn('API não disponível, usando simulações mock');
      return this.getMockSimulacoes();
    }
  },

  async getById(id: number): Promise<any> {
    const response = await api.get(`/simulacoes/${id}`);
    return response.data;
  },

  async create(simulacao: any): Promise<any> {
    const response = await api.post('/simulacoes', simulacao);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/simulacoes/${id}`);
  },

  getMockSimulacoes(): any[] {
    return [
      {
        id: 1,
        nome: 'Aumento de Renda',
        descricao: 'Simulação com aumento de 20% na renda',
        data_criacao: '2025-11-27',
        parametros: {
          aumento_renda: 20,
          manter_despesas: true
        },
        resultado: {
          tempo_objetivo_reduzido: 8,
          economia_mensal: 1200
        }
      },
      {
        id: 2,
        nome: 'Redução de Despesas',
        descricao: 'Cortar 15% das despesas variáveis',
        data_criacao: '2025-11-26',
        parametros: {
          reducao_despesas: 15,
          manter_renda: true
        },
        resultado: {
          tempo_objetivo_reduzido: 6,
          economia_mensal: 850
        }
      }
    ];
  }
};