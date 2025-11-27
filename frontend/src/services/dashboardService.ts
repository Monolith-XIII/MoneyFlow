import { api } from './api';
import { DashboardData } from '../types';

export const dashboardService = {
  async getData(mes: number, ano: number): Promise<DashboardData> {
    try {
      console.log('📊 Buscando dados do dashboard...');
      
      // Fazer todas as requisições em paralelo
      const [consolidado, contasPagar, categoriasDespesa, evolucaoMensal] = await Promise.all([
        // Dados consolidados
        api.get('/dashboard/consolidado', { params: { mes, ano } }),
        
        // Contas a pagar
        api.get('/dashboard/contas-pagar', { params: { mes, ano } }),
        
        // Gráfico de categorias (despesas)
        api.get('/dashboard/grafico-categorias', { params: { mes, ano, tipo: 'despesa' } }),
        
        // Evolução mensal
        api.get('/dashboard/evolucao-mensal')
      ]);

      console.log('✅ Dados recebidos do backend:', {
        consolidado: consolidado.data,
        contasPagar: contasPagar.data,
        categoriasDespesa: categoriasDespesa.data,
        evolucaoMensal: evolucaoMensal.data
      });

      // Calcular contas a pagar total
      const contasPagarTotal = 
        (contasPagar.data.vencidas?.total || 0) +
        (contasPagar.data.vencemHoje?.total || 0) +
        (contasPagar.data.aVencer?.total || 0);

      // Formatar dados para o frontend
      const dashboardData: DashboardData = {
        saldoAtual: consolidado.data.saldoAtual || 0,
        receitasMes: consolidado.data.receitas || 0,
        despesasMes: consolidado.data.despesas || 0,
        contasPagar: contasPagarTotal,
        evolucaoMensal: evolucaoMensal.data.map((item: any) => ({
          mes: this.formatarMes(item.mes_ano),
          receitas: item.receitas || 0,
          despesas: item.despesas || 0
        })),
        distribuicaoCategorias: categoriasDespesa.data.map((item: any) => ({
          categoria: item.nome,
          valor: item.total || 0
        }))
      };

      console.log('✅ Dashboard data formatado:', dashboardData);
      return dashboardData;

    } catch (error) {
      console.warn('❌ API não disponível, usando dados mock');
      return this.getMockData(mes, ano);
    }
  },

  formatarMes(mesAno: string): string {
    const [ano, mes] = mesAno.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(mes) - 1]}`;
  },

  getMockData(mes: number, ano: number): DashboardData {
    // Dados mock realistas para desenvolvimento
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return {
      saldoAtual: 15420.75,
      receitasMes: 8250.00,
      despesasMes: 6734.25,
      contasPagar: 1230.50,
      evolucaoMensal: [
        { mes: meses[0], receitas: 7200, despesas: 6100 },
        { mes: meses[1], receitas: 7800, despesas: 6400 },
        { mes: meses[2], receitas: 8100, despesas: 6700 },
        { mes: meses[3], receitas: 7900, despesas: 6200 },
        { mes: meses[4], receitas: 8500, despesas: 6900 },
        { mes: meses[5], receitas: 8250, despesas: 6734 },
      ],
      distribuicaoCategorias: [
        { categoria: 'Moradia', valor: 2100 },
        { categoria: 'Alimentação', valor: 1650 },
        { categoria: 'Transporte', valor: 850 },
        { categoria: 'Saúde', valor: 720 },
        { categoria: 'Lazer', valor: 580 },
        { categoria: 'Educação', valor: 450 },
        { categoria: 'Outros', valor: 384 },
      ]
    };
  }
};