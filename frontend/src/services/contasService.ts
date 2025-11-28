import { api } from './api';
import { Conta } from '../types/index';

export const contasService = {
  async getAll(): Promise<Conta[]> {
    try {
      const response = await api.get('/contas');
      console.log('💰 Resposta do backend:', response.data);
      
      // MAPEIA saldo_atual → saldo
      const contasMapeadas = response.data.map((conta: any) => ({
        id: conta.id,
        nome: conta.nome,
        tipo: conta.tipo,
        saldo: conta.saldo_atual || conta.saldo_inicial || 0, // ← USA saldo_atual como saldo
        cor: conta.cor,
        usuario_id: conta.usuario_id
      }));
      
      console.log('💰 Contas mapeadas:', contasMapeadas);
      return contasMapeadas;
      
    } catch (error) {
      console.warn('API não disponível, usando contas mock');
      return this.getMockContas();
    }
  },

  async getById(id: number): Promise<Conta> {
    const response = await api.get(`/contas/${id}`);
    return response.data;
  },

  async create(conta: Omit<Conta, 'id'>): Promise<Conta> {
    console.log('📤 Criando conta:', conta);
    
    const tipoBackend = conta.tipo === 'corrente' ? 'conta_corrente' : conta.tipo;

    const contaData = {
      nome: conta.nome,
      tipo: tipoBackend,
      saldo_inicial: conta.saldo_inicial,
      cor: conta.cor
    };

    console.log('📤 Dados enviados para backend:', contaData);
    
    try {
      const response = await api.post('/contas', contaData);
      console.log('✅ Conta criada:', response.data);
      
      // Retorna a conta com saldo mapeado
      return {
        ...conta,
        id: response.data.conta_id || Date.now(),
        saldo: conta.saldo_inicial // Saldo inicial = saldo quando cria
      };
    } catch (error: any) {
      console.error('❌ Erro ao criar conta:', error);
      throw error;
    }
  },

  async update(id: number, conta: Partial<Conta>): Promise<Conta> {
    const response = await api.put(`/contas/${id}`, conta);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/contas/${id}`);
  },

  getMockContas(): Conta[] {
    return [
      { id: 1, nome: 'Conta Corrente', saldo: 15420.75, tipo: 'corrente', cor: '#007bff', usuario_id: 1 },
      { id: 2, nome: 'Carteira', saldo: 350.50, tipo: 'carteira', cor: '#28a745', usuario_id: 1 },
      { id: 3, nome: 'Poupança', saldo: 5000.00, tipo: 'poupanca', cor: '#ffc107', usuario_id: 1 },
    ];
  }
};