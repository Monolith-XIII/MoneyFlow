const MoneyFlowDB = require('../../db/config');

class TransacoesController {
  
  // Cadastrar transação
  async cadastrarTransacao(req, res) {
    try {
      const { usuario_id } = req.user;
      const transacao = req.body;

      // Validações básicas
      if (!transacao.descricao || !transacao.valor || !transacao.tipo || 
          !transacao.data_transacao || !transacao.categoria_id || !transacao.conta_id) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      // Verificar se a categoria existe e é do tipo correto
      const categoria = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT tipo FROM categorias WHERE id = ? AND usuario_id IN (?, NULL)',
          [transacao.categoria_id, usuario_id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!categoria) {
        return res.status(400).json({ error: 'Categoria não encontrada' });
      }

      if (categoria.tipo !== transacao.tipo) {
        return res.status(400).json({ error: 'Tipo da transação não corresponde à categoria' });
      }

      // Verificar saldo para despesas
      if (transacao.tipo === 'despesa') {
        const saldoConta = await new Promise((resolve, reject) => {
          MoneyFlowDB.get(
            `SELECT saldo_inicial + COALESCE((
              SELECT SUM(CASE 
                WHEN tipo = 'receita' THEN valor 
                WHEN tipo = 'despesa' THEN -valor 
              END)
              FROM transacoes 
              WHERE conta_id = contas.id 
              AND pago = 1
            ), 0) as saldo_atual
            FROM contas 
            WHERE id = ? AND usuario_id = ?`,
            [transacao.conta_id, usuario_id],
            (err, row) => {
              if (err) reject(err);
              else resolve(row ? row.saldo_atual : 0);
            }
          );
        });

        if (parseFloat(saldoConta) < parseFloat(transacao.valor)) {
          return res.status(400).json({ error: 'Saldo insuficiente na conta' });
        }
      }

      // Inserir transação
      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          `INSERT INTO transacoes 
           (descricao, valor, tipo, data_transacao, categoria_id, usuario_id, conta_id, observacoes, recorrente, pago) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            transacao.descricao,
            transacao.valor,
            transacao.tipo,
            transacao.data_transacao,
            transacao.categoria_id,
            usuario_id,
            transacao.conta_id,
            transacao.observacoes || '',
            transacao.recorrente ? 1 : 0,
            transacao.pago !== undefined ? (transacao.pago ? 1 : 0) : 1
          ],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      res.status(201).json({
        message: 'Transação cadastrada com sucesso',
        transacao_id: result.id
      });

    } catch (error) {
      console.error('Erro ao cadastrar transação:', error);
      res.status(500).json({ error: 'Erro ao cadastrar transação' });
    }
  }

  // Listar transações com filtros
  async listarTransacoes(req, res) {
    try {
      const { usuario_id } = req.user;
      const { 
        pagina = 1, 
        limite = 50, 
        categoria_id, 
        tipo, 
        data_inicio, 
        data_fim,
        pago,
        conta_id 
      } = req.query;

      const offset = (pagina - 1) * limite;
      
      // Construir query dinâmica
      let whereConditions = ['t.usuario_id = ?'];
      let params = [usuario_id];

      if (categoria_id) {
        whereConditions.push('t.categoria_id = ?');
        params.push(categoria_id);
      }

      if (tipo) {
        whereConditions.push('t.tipo = ?');
        params.push(tipo);
      }

      if (data_inicio) {
        whereConditions.push('t.data_transacao >= ?');
        params.push(data_inicio);
      }

      if (data_fim) {
        whereConditions.push('t.data_transacao <= ?');
        params.push(data_fim);
      }

      if (pago !== undefined) {
        whereConditions.push('t.pago = ?');
        params.push(pago === 'true' ? 1 : 0);
      }

      if (conta_id) {
        whereConditions.push('t.conta_id = ?');
        params.push(conta_id);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Buscar transações
      const transacoes = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT t.*, c.nome as categoria_nome, ct.nome as conta_nome, c.cor as categoria_cor
           FROM transacoes t
           LEFT JOIN categorias c ON t.categoria_id = c.id
           LEFT JOIN contas ct ON t.conta_id = ct.id
           ${whereClause}
           ORDER BY t.data_transacao DESC, t.id DESC
           LIMIT ? OFFSET ?`,
          [...params, limite, offset],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      // Contar total para paginação
      const total = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          `SELECT COUNT(*) as total 
           FROM transacoes t 
           ${whereClause}`,
          params,
          (err, row) => {
            if (err) reject(err);
            else resolve(row.total);
          }
        );
      });

      res.json({
        transacoes,
        paginacao: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total: parseInt(total),
          totalPaginas: Math.ceil(total / limite)
        }
      });

    } catch (error) {
      console.error('Erro ao listar transações:', error);
      res.status(500).json({ error: 'Erro ao listar transações' });
    }
  }

  // Análise de frequência de gastos
  async analiseFrequenciaGastos(req, res) {
    try {
      const { usuario_id } = req.user;
      const { periodo = '30dias' } = req.query;

      let whereCondition = '';
      let groupBy = '';

      switch (periodo) {
        case '7dias':
          whereCondition = "AND t.data_transacao >= date('now', '-7 days')";
          groupBy = "strftime('%Y-%m-%d', t.data_transacao)";
          break;
        case '30dias':
          whereCondition = "AND t.data_transacao >= date('now', '-30 days')";
          groupBy = "strftime('%Y-%m-%d', t.data_transacao)";
          break;
        case 'anual':
          whereCondition = "AND t.data_transacao >= date('now', '-1 year')";
          groupBy = "strftime('%Y-%m', t.data_transacao)";
          break;
        default:
          return res.status(400).json({ error: 'Período inválido' });
      }

      const dados = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT 
            ${groupBy} as periodo,
            COUNT(*) as quantidade,
            SUM(t.valor) as total,
            AVG(t.valor) as media
           FROM transacoes t
           WHERE t.usuario_id = ? 
           AND t.tipo = 'despesa'
           ${whereCondition}
           GROUP BY ${groupBy}
           ORDER BY periodo DESC`,
          [usuario_id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      res.json(dados.map(item => ({
        ...item,
        total: parseFloat(item.total),
        media: parseFloat(item.media)
      })));

    } catch (error) {
      console.error('Erro na análise de frequência:', error);
      res.status(500).json({ error: 'Erro na análise de frequência' });
    }
  }

  // Atualizar status de pagamento
  async atualizarStatusPagamento(req, res) {
    try {
      const { usuario_id } = req.user;
      const { transacao_id } = req.params;
      const { pago } = req.body;

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          'UPDATE transacoes SET pago = ? WHERE id = ? AND usuario_id = ?',
          [pago ? 1 : 0, transacao_id, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      res.json({ message: 'Status atualizado com sucesso' });

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }
}

module.exports = new TransacoesController();