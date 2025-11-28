import { api } from './api';
import { Orcamento } from '../types';

export const orcamentosService = {
  async getAll(): Promise<Orcamento[]> {
    try {
      const response = await api.get('/orcamentos');
      console.log('💰 Resposta BRUTA do backend (orcamentos):', response.data);
      
      if (Array.isArray(response.data)) {
        const orcamentosMapeados = response.data.map((orcamento: any) => {
          // CORREÇÃO: Extrai mês e ano diretamente da string
          let mes, ano;
          
          if (orcamento.mes_ano) {
            // O formato é "YYYY-MM-DD" ou "YYYY-MM"
            const partes = orcamento.mes_ano.split('-');
            if (partes.length >= 2) {
              ano = parseInt(partes[0]);
              mes = parseInt(partes[1]); // Já é o mês correto (1-12)
              console.log(`💰 Mês/ano extraído de "${orcamento.mes_ano}":`, { mes, ano });
            } else {
              // Fallback
              mes = 1;
              ano = new Date().getFullYear();
            }
          } else {
            mes = orcamento.mes || 1;
            ano = orcamento.ano || new Date().getFullYear();
          }
          
          return {
            id: orcamento.id,
            categoria_id: orcamento.categoria_id,
            valor: orcamento.valor_limite,
            mes: mes, // Já está no formato 1-12
            ano: ano,
            categoria: orcamento.categoria_nome ? {
              id: orcamento.categoria_id,
              nome: orcamento.categoria_nome,
              tipo: orcamento.categoria_tipo,
              cor: orcamento.categoria_cor,
              icone: 'target'
            } : undefined
          };
        });
        
        console.log('💰 Orçamentos mapeados (CORRIGIDOS):', orcamentosMapeados);
        return orcamentosMapeados;
      } else {
        return [];
      }
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
    console.log('📤 Criando orçamento:', orcamento);
    
    // Mapear campos para o formato do backend
    const orcamentoData = {
      categoria_id: orcamento.categoria_id,
      valor_limite: orcamento.valor,
      mes_ano: `${orcamento.ano}-${orcamento.mes.toString().padStart(2, '0')}-01`
    };

    console.log('📤 Dados enviados para backend:', orcamentoData);
    
    try {
      const response = await api.post('/orcamentos', orcamentoData);
      console.log('✅ Orçamento criado:', response.data);
      
      // Retorna com ID real do backend
      return {
        ...orcamento,
        id: response.data.orcamento_id
      };
    } catch (error: any) {
      console.error('❌ Erro ao criar orçamento:', error);
      throw error;
    }
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