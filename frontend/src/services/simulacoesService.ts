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

  async create(simulacaoData: {
    nome: string;
    descricao?: string;
    scenario_data: {
      receita_atual: number;
      despesa_atual: number;
      reducao_despesas_percentual?: number;
      aumento_receitas_percentual?: number;
      meses_projecao?: number;
      investimento_mensal?: number;
      taxa_retorno_anual?: number;
    };
  }): Promise<any> {
    console.log('📤 Enviando dados para simulação:', simulacaoData);
    
    const response = await api.post('/simulacoes', simulacaoData);
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
      }
    ];
  }
};