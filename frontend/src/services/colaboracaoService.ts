import { api } from './api';
import { objetivosService } from './objetivosService';

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
    try {
      const response = await api.post('/colaboracao/compartilhar', { 
        objetivo_id: objetivoId, // Mude aqui
        usuario_destinatario_email: email, // Mude aqui
        permissao: 'leitura' // Adicione este campo
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Objetivo não encontrado. Verifique o ID.');
      }
      throw error;
    }
  },

  async responderConvite(token: string, aceitar: boolean): Promise<any> {
    const response = await api.post(`/colaboracao/responder-convite/${token}`, { 
      aceitar 
    });
    return response.data;
  },

  async removerCompartilhamento(id: number): Promise<void> {
    await api.delete(`/colaboracao/compartilhamento/${id}`);
  },

  async getObjetivosQueCompartilhei(): Promise<any[]> {
    try {
      const response = await api.get('/colaboracao/objetivos-que-compartilhei');
      return response.data;
    } catch (error) {
      console.warn('API não disponível, usando dados mock');
      return this.getMockObjetivosQueCompartilhei();
    }
  },

  getMockObjetivosQueCompartilhei(): any[] {
    return [
      {
        compartilhamento_id: 1,
        objetivo_id: 1,
        objetivo_nome: 'Show do Guns and Roses',
        usuario_compartilhado_nome: 'Maria Silva',
        usuario_compartilhado_email: 'maria@email.com',
        permissao: 'leitura',
        data_compartilhamento: '2025-11-28 13:12:57',
        status_convite: 'aceito'
      }
    ];
  },

  // Use o serviço de objetivos existente
  async getMeusObjetivos(): Promise<any[]> {
    try {
      // Reutiliza o método getAll do objetivosService
      const objetivos = await objetivosService.getAll();
      
      // Filtra apenas os objetivos onde o usuário é dono (não compartilhados)
      const meusObjetivos = objetivos.filter(objetivo => 
        !objetivo.compartilhado || objetivo.usuario_id === this.getCurrentUserId()
      );
      
      console.log('🎯 Meus objetivos para compartilhar:', meusObjetivos);
      return meusObjetivos;
      
    } catch (error) {
      console.warn('API não disponível, usando dados mock');
      return this.getMockMeusObjetivos();
    }
  },

  // Método auxiliar para obter o ID do usuário atual (você pode precisar ajustar isso)
  getCurrentUserId(): number {
    // Isso depende de como você armazena as informações do usuário
    // Pode ser do localStorage, context, etc.
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id || 1; // Fallback para ID 1
      } catch {
        return 1;
      }
    }
    return 1; // Fallback
  },

  getMockMeusObjetivos(): any[] {
    return [
      {
        id: 1,
        titulo: 'Viagem para Europa',
        descricao: 'Economias para viagem de 15 dias',
        valor_objetivo: 10000,
        valor_atual: 3500,
        data_limite: '2025-12-31'
      }
    ];
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