import { api } from './api';
import { Transacao } from '../types';

export const transacoesService = {
  async getAll(filters?: {
    mes?: number;
    ano?: number;
    categoria_id?: number;
    tipo?: 'receita' | 'despesa';
  }): Promise<Transacao[]> {
    try {
      console.log('📊 Buscando transações...', filters);
      const response = await api.get('/transacoes', { params: filters });
      console.log('📨 Resposta completa:', response.data);
      console.log('🔍 Tipo da resposta:', typeof response.data);
      console.log('🔍 É array?', Array.isArray(response.data));
      
      // O backend pode estar retornando um objeto com paginação
      let transacoes: Transacao[];
      
      if (Array.isArray(response.data)) {
        // Se for array direto
        transacoes = response.data;
      } else if (response.data.transacoes && Array.isArray(response.data.transacoes)) {
        // Se for { transacoes: [], total: X, pagina: X }
        transacoes = response.data.transacoes;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Se for { data: [], total: X }
        transacoes = response.data.data;
      } else {
        console.warn('❌ Estrutura inesperada, usando array vazio');
        transacoes = [];
      }
      
      console.log('✅ Transações extraídas:', transacoes);
      return transacoes;
      
    } catch (error) {
      console.warn('❌ API não disponível, usando transações mock');
      return this.getMockTransacoes();
    }
  },

  async getById(id: number): Promise<Transacao> {
    const response = await api.get(`/transacoes/${id}`);
    return response.data;
  },

  async create(transacao: Omit<Transacao, 'id'>): Promise<Transacao> {
    console.log('📤 Criando transação:', transacao);
    const response = await api.post('/transacoes', transacao);
    console.log('✅ Transação criada:', response.data);
    return response.data;
  },

  async update(id: number, transacao: Partial<Transacao>): Promise<Transacao> {
    console.log('📝 Atualizando transação:', id, transacao);
    const response = await api.put(`/transacoes/${id}`, transacao);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    console.log('🗑️ Deletando transação:', id);
    await api.delete(`/transacoes/${id}`);
  },

  async updateStatus(id: number, pago: boolean): Promise<Transacao> {
    console.log('🔄 Atualizando status da transação:', id, pago);
    const response = await api.patch(`/transacoes/${id}/status`, { pago });
    return response.data;
  },

  async getAnaliseFrequencia(): Promise<any> {
    try {
      const response = await api.get('/transacoes/analise-frequencia');
      return response.data;
    } catch (error) {
      console.warn('❌ API análise não disponível');
      return this.getMockAnaliseFrequencia();
    }
  },

  getMockTransacoes(): Transacao[] {
    const categorias = [
      { id: 1, nome: 'Salário', tipo: 'receita' as const, cor: '#28a745', icone: 'dollar-sign' },
      { id: 5, nome: 'Alimentação', tipo: 'despesa' as const, cor: '#dc3545', icone: 'shopping-cart' },
      { id: 6, nome: 'Moradia', tipo: 'despesa' as const, cor: '#fd7e14', icone: 'home' },
      { id: 7, nome: 'Transporte', tipo: 'despesa' as const, cor: '#ffc107', icone: 'car' },
    ];

    return [
      {
        id: 1,
        descricao: 'Salário Mensal',
        valor: 5000,
        tipo: 'receita',
        data_transacao: new Date().toISOString(),
        categoria_id: 1,
        conta_id: 1,
        pago: true,
        recorrente: true,
        categoria: categorias[0]
      },
      {
        id: 2,
        descricao: 'Supermercado',
        valor: 350,
        tipo: 'despesa',
        data_transacao: new Date().toISOString(),
        categoria_id: 5,
        conta_id: 1,
        pago: true,
        recorrente: false,
        categoria: categorias[1]
      },
      {
        id: 3,
        descricao: 'Aluguel',
        valor: 1200,
        tipo: 'despesa',
        data_transacao: new Date().toISOString(),
        categoria_id: 6,
        conta_id: 1,
        pago: false,
        recorrente: true,
        categoria: categorias[2]
      },
      {
        id: 4,
        descricao: 'Combustível',
        valor: 200,
        tipo: 'despesa',
        data_transacao: new Date().toISOString(),
        categoria_id: 7,
        conta_id: 1,
        pago: true,
        recorrente: false,
        categoria: categorias[3]
      }
    ];
  },

  getMockAnaliseFrequencia(): any {
    return {
      categoriasMaisFrequentes: [
        { categoria: 'Alimentação', frequencia: 12, valorTotal: 1850 },
        { categoria: 'Transporte', frequencia: 8, valorTotal: 650 },
        { categoria: 'Lazer', frequencia: 5, valorTotal: 420 }
      ],
      diasSemana: [
        { dia: 'Segunda', quantidade: 8 },
        { dia: 'Terça', quantidade: 6 },
        { dia: 'Quarta', quantidade: 7 },
        { dia: 'Quinta', quantidade: 5 },
        { dia: 'Sexta', quantidade: 9 },
        { dia: 'Sábado', quantidade: 12 },
        { dia: 'Domingo', quantidade: 3 }
      ]
    };
  }
};