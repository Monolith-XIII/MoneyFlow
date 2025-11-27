import { api } from './api';

export const colaboracaoService = {
  async getObjetivosCompartilhados(): Promise<any[]> {
    try {
      const response = await api.get('/colaboracao/objetivos-compartilhados');
      return response.data;
    } catch (error) {
      console.warn('API não disponível, usando dados mock');
      return this.getMockObjetivosCompartilhados();
    }
  },

  async getConvitesPendentes(): Promise<any[]> {
    try {
      const response = await api.get('/colaboracao/convites-pendentes');
      return response.data;
    } catch (error) {
      console.warn('API não disponível, usando dados mock');
      return this.getMockConvitesPendentes();
    }
  },

  async compartilharObjetivo(objetivoId: number, email: string): Promise<any> {
    const response = await api.post('/colaboracao/compartilhar', { objetivoId, email });
    return response.data;
  },

  async responderConvite(token: string, aceitar: boolean): Promise<any> {
    const response = await api.post(`/colaboracao/responder-convite/${token}`, { aceitar });
    return response.data;
  },

  async removerCompartilhamento(id: number): Promise<void> {
    await api.delete(`/colaboracao/compartilhamento/${id}`);
  },

  getMockObjetivosCompartilhados(): any[] {
    return [
      {
        id: 1,
        titulo: 'Fundo para Festa',
        descricao: 'Fundo coletivo para festa de fim de ano',
        valor_objetivo: 5000,
        valor_atual: 3200,
        data_limite: '2025-12-15',
        proprietario: { nome: 'João Silva', email: 'joao@email.com' },
        participantes: 3
      }
    ];
  },

  getMockConvitesPendentes(): any[] {
    return [
      {
        id: 1,
        token: 'abc123',
        objetivo: {
          titulo: 'Viagem em Grupo',
          descricao: 'Viagem para a praia em julho'
        },
        proprietario: { nome: 'Maria Santos', email: 'maria@email.com' },
        data_convite: '2025-11-20'
      }
    ];
  }
};