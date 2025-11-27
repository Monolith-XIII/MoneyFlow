const MoneyFlowDB = require('../../db/config');

class DashboardController {
  
  // Dados consolidados do mês
  async getDadosConsolidados(req, res) {
    try {
      const { usuario_id } = req.user;
      const { mes, ano } = req.query;

      if (!mes || !ano) {
        return res.status(400).json({ error: 'Mês e ano são obrigatórios' });
      }

      const dataInicio = `${ano}-${mes.padStart(2, '0')}-01`;
      const dataFim = `${ano}-${mes.padStart(2, '0')}-31`;

      // Buscar receitas do mês
      const receitas = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          `SELECT COALESCE(SUM(valor), 0) as total 
           FROM transacoes 
           WHERE usuario_id = ? 
           AND tipo = 'receita' 
           AND strftime('%Y-%m', data_transacao) = ? 
           AND pago = 1`,
          [usuario_id, `${ano}-${mes.padStart(2, '0')}`],
          (err, row) => {
            if (err) reject(err);
            else resolve(row.total);
          }
        );
      });

      // Buscar despesas do mês
      const despesas = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          `SELECT COALESCE(SUM(valor), 0) as total 
           FROM transacoes 
           WHERE usuario_id = ? 
           AND tipo = 'despesa' 
           AND strftime('%Y-%m', data_transacao) = ? 
           AND pago = 1`,
          [usuario_id, `${ano}-${mes.padStart(2, '0')}`],
          (err, row) => {
            if (err) reject(err);
            else resolve(row.total);
          }
        );
      });

      // Saldo atual
      const saldoAtual = receitas - despesas;

      res.json({
        receitas: parseFloat(receitas),
        despesas: parseFloat(despesas),
        saldoAtual: parseFloat(saldoAtual),
        mes,
        ano
      });

    } catch (error) {
      console.error('Erro no dashboard:', error);
      res.status(500).json({ error: 'Erro ao buscar dados consolidados' });
    }
  }

  // Status das contas a pagar
  async getStatusContasPagar(req, res) {
    try {
      const { usuario_id } = req.user;
      const { mes, ano } = req.query;

      const dataReferencia = `${ano}-${mes.padStart(2, '0')}`;
      const hoje = new Date().toISOString().split('T')[0];

      // Contas vencidas
      const vencidas = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT t.*, c.nome as categoria_nome 
           FROM transacoes t 
           LEFT JOIN categorias c ON t.categoria_id = c.id 
           WHERE t.usuario_id = ? 
           AND t.tipo = 'despesa' 
           AND t.pago = 0 
           AND t.data_transacao < ? 
           AND strftime('%Y-%m', t.data_transacao) = ?`,
          [usuario_id, hoje, dataReferencia],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      // Contas que vencem hoje
      const vencemHoje = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT t.*, c.nome as categoria_nome 
           FROM transacoes t 
           LEFT JOIN categorias c ON t.categoria_id = c.id 
           WHERE t.usuario_id = ? 
           AND t.tipo = 'despesa' 
           AND t.pago = 0 
           AND t.data_transacao = ?`,
          [usuario_id, hoje],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      // Contas a vencer
      const aVencer = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT t.*, c.nome as categoria_nome 
           FROM transacoes t 
           LEFT JOIN categorias c ON t.categoria_id = c.id 
           WHERE t.usuario_id = ? 
           AND t.tipo = 'despesa' 
           AND t.pago = 0 
           AND t.data_transacao > ? 
           AND strftime('%Y-%m', t.data_transacao) = ?`,
          [usuario_id, hoje, dataReferencia],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      res.json({
        vencidas: {
          quantidade: vencidas.length,
          total: vencidas.reduce((sum, item) => sum + parseFloat(item.valor), 0),
          itens: vencidas
        },
        vencemHoje: {
          quantidade: vencemHoje.length,
          total: vencemHoje.reduce((sum, item) => sum + parseFloat(item.valor), 0),
          itens: vencemHoje
        },
        aVencer: {
          quantidade: aVencer.length,
          total: aVencer.reduce((sum, item) => sum + parseFloat(item.valor), 0),
          itens: aVencer
        }
      });

    } catch (error) {
      console.error('Erro ao buscar contas a pagar:', error);
      res.status(500).json({ error: 'Erro ao buscar contas a pagar' });
    }
  }

  // Dados para gráfico de categorias
  async getDadosGraficoCategorias(req, res) {
    try {
      const { usuario_id } = req.user;
      const { mes, ano, tipo } = req.query;

      const dados = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT c.nome, c.cor, SUM(t.valor) as total 
           FROM transacoes t 
           JOIN categorias c ON t.categoria_id = c.id 
           WHERE t.usuario_id = ? 
           AND t.tipo = ? 
           AND strftime('%Y-%m', t.data_transacao) = ? 
           AND t.pago = 1 
           GROUP BY c.id, c.nome, c.cor 
           ORDER BY total DESC`,
          [usuario_id, tipo, `${ano}-${mes.padStart(2, '0')}`],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      res.json(dados.map(item => ({
        ...item,
        total: parseFloat(item.total)
      })));

    } catch (error) {
      console.error('Erro no gráfico de categorias:', error);
      res.status(500).json({ error: 'Erro ao buscar dados do gráfico' });
    }
  }

  // Evolução mensal (últimos 12 meses)
  async getEvolucaoMensal(req, res) {
    try {
      const { usuario_id } = req.user;

      const evolucao = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT 
            strftime('%Y-%m', data_transacao) as mes_ano,
            SUM(CASE WHEN tipo = 'receita' AND pago = 1 THEN valor ELSE 0 END) as receitas,
            SUM(CASE WHEN tipo = 'despesa' AND pago = 1 THEN valor ELSE 0 END) as despesas
           FROM transacoes 
           WHERE usuario_id = ? 
           AND data_transacao >= date('now', '-12 months')
           GROUP BY strftime('%Y-%m', data_transacao)
           ORDER BY mes_ano DESC
           LIMIT 12`,
          [usuario_id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      res.json(evolucao.map(item => ({
        ...item,
        receitas: parseFloat(item.receitas),
        despesas: parseFloat(item.despesas),
        saldo: parseFloat(item.receitas) - parseFloat(item.despesas)
      })));

    } catch (error) {
      console.error('Erro na evolução mensal:', error);
      res.status(500).json({ error: 'Erro ao buscar evolução mensal' });
    }
  }
}

module.exports = new DashboardController();