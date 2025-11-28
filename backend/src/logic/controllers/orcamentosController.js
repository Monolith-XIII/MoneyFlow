const MoneyFlowDB = require('../../db/config');

class OrcamentosController {
  
  // Listar orçamentos do usuário
  async listarOrcamentos(req, res) {
    try {
      const { usuario_id } = req.user;
      const { mes, ano } = req.query;

      let whereClause = 'WHERE o.usuario_id = ?';
      let params = [usuario_id];

      if (mes && ano) {
        whereClause += ' AND strftime("%Y-%m", o.mes_ano) = ?';
        params.push(`${ano}-${mes.padStart(2, '0')}`);
      }

      const orcamentos = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT o.*, c.nome as categoria_nome, c.tipo as categoria_tipo, c.cor as categoria_cor,
           COALESCE(SUM(t.valor), 0) as gasto_real,
           (o.valor_limite - COALESCE(SUM(t.valor), 0)) as saldo_restante,
           CASE 
             WHEN COALESCE(SUM(t.valor), 0) > o.valor_limite THEN 'excedido'
             WHEN COALESCE(SUM(t.valor), 0) > o.valor_limite * 0.8 THEN 'alerta' 
             ELSE 'dentro'
           END as status
           FROM orcamentos o
           LEFT JOIN categorias c ON o.categoria_id = c.id
           LEFT JOIN transacoes t ON t.categoria_id = o.categoria_id 
             AND strftime("%Y-%m", t.data_transacao) = strftime("%Y-%m", o.mes_ano)
             AND t.tipo = 'despesa' AND t.pago = 1
           ${whereClause}
           GROUP BY o.id
           ORDER BY o.mes_ano DESC, c.nome`,
          params,
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      res.json(orcamentos.map(orcamento => ({
        ...orcamento,
        gasto_real: parseFloat(orcamento.gasto_real),
        saldo_restante: parseFloat(orcamento.saldo_restante)
      })));

    } catch (error) {
      console.error('Erro ao listar orçamentos:', error);
      res.status(500).json({ error: 'Erro ao buscar orçamentos' });
    }
  }

  // Buscar orçamento por ID
  async buscarOrcamento(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;

      const orcamento = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          `SELECT o.*, c.nome as categoria_nome, c.tipo as categoria_tipo
           FROM orcamentos o
           LEFT JOIN categorias c ON o.categoria_id = c.id
           WHERE o.id = ? AND o.usuario_id = ?`,
          [id, usuario_id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!orcamento) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }

      res.json(orcamento);

    } catch (error) {
      console.error('Erro ao buscar orçamento:', error);
      res.status(500).json({ error: 'Erro ao buscar orçamento' });
    }
  }

  // Criar orçamento
  async criarOrcamento(req, res) {
    try {
      const { usuario_id } = req.user;
      const { categoria_id, valor_limite, mes_ano } = req.body;

      console.log('📥 Dados recebidos no backend:', req.body);
      console.log('👤 Usuário ID:', usuario_id);

      // Validações básicas
      if (!categoria_id || !valor_limite || !mes_ano) {
        console.log('❌ Campos obrigatórios faltando:', {
          categoria_id: !categoria_id,
          valor_limite: !valor_limite, 
          mes_ano: !mes_ano
        });
        return res.status(400).json({ error: 'Categoria, valor limite e mês/ano são obrigatórios' });
      }

      console.log('🔍 Verificando categoria ID:', categoria_id);

      // Verificar se a categoria existe
      const categoria = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT id, nome FROM categorias WHERE id = ? AND (usuario_id = ? OR usuario_id IS NULL)',
          [categoria_id, usuario_id],
          (err, row) => {
            if (err) {
              console.error('❌ Erro na query de categoria:', err);
              reject(err);
            } else {
              console.log('🔍 Categoria encontrada:', row);
              resolve(row);
            }
          }
        );
      });

      if (!categoria) {
        console.log('❌ Categoria não encontrada');
        return res.status(400).json({ error: 'Categoria não encontrada' });
      }

      // Verificar se já existe orçamento para essa categoria no mês
      const orcamentoExistente = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT id FROM orcamentos WHERE categoria_id = ? AND usuario_id = ? AND mes_ano = ?',
          [categoria_id, usuario_id, mes_ano],
          (err, row) => {
            if (err) {
              console.error('❌ Erro na verificação de orçamento existente:', err);
              reject(err);
            } else {
              console.log('🔍 Orçamento existente:', row);
              resolve(row);
            }
          }
        );
      });

      if (orcamentoExistente) {
        console.log('❌ Já existe orçamento para esta categoria neste mês');
        return res.status(400).json({ error: 'Já existe um orçamento para esta categoria neste mês' });
      }

      console.log('✅ Inserindo orçamento no banco...');

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          `INSERT INTO orcamentos (categoria_id, usuario_id, valor_limite, mes_ano) 
          VALUES (?, ?, ?, ?)`,
          [categoria_id, usuario_id, valor_limite, mes_ano],
          function(err) {
            if (err) {
              console.error('❌ Erro ao inserir orçamento:', err);
              reject(err);
            } else {
              console.log('✅ Orçamento inserido com ID:', this.lastID);
              resolve({ id: this.lastID });
            }
          }
        );
      });

      res.status(201).json({
        message: 'Orçamento criado com sucesso',
        orcamento_id: result.id
      });

    } catch (error) {
      console.error('Erro ao cadastrar orçamento:', error);
      res.status(500).json({ error: 'Erro ao cadastrar orçamento' });
    }
  }

  // Atualizar orçamento
  async atualizarOrcamento(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;
      const { valor_limite } = req.body;

      if (!valor_limite) {
        return res.status(400).json({ error: 'Valor limite é obrigatório' });
      }

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          'UPDATE orcamentos SET valor_limite = ? WHERE id = ? AND usuario_id = ?',
          [valor_limite, id, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }

      res.json({ message: 'Orçamento atualizado com sucesso' });

    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      res.status(500).json({ error: 'Erro ao atualizar orçamento' });
    }
  }

  // Deletar orçamento
  async deletarOrcamento(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          'DELETE FROM orcamentos WHERE id = ? AND usuario_id = ?',
          [id, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }

      res.json({ message: 'Orçamento deletado com sucesso' });

    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      res.status(500).json({ error: 'Erro ao deletar orçamento' });
    }
  }
}

module.exports = new OrcamentosController();