const MoneyFlowDB = require('../../db/config');

class ContasController {
  
  // Listar contas do usuário
  async listarContas(req, res) {
    try {
      const { usuario_id } = req.user;

      const contas = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT *, 
           saldo_inicial + COALESCE((
             SELECT SUM(CASE 
               WHEN tipo = 'receita' THEN valor 
               WHEN tipo = 'despesa' THEN -valor 
             END)
             FROM transacoes 
             WHERE conta_id = contas.id 
             AND pago = 1
           ), 0) as saldo_atual
           FROM contas 
           WHERE usuario_id = ? 
           ORDER BY nome`,
          [usuario_id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      res.json(contas.map(conta => ({
        ...conta,
        saldo_atual: parseFloat(conta.saldo_atual)
      })));

    } catch (error) {
      console.error('Erro ao listar contas:', error);
      res.status(500).json({ error: 'Erro ao buscar contas' });
    }
  }

  // Buscar conta por ID
  async buscarConta(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;

      const conta = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          `SELECT *, 
           saldo_inicial + COALESCE((
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
          [id, usuario_id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!conta) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      conta.saldo_atual = parseFloat(conta.saldo_atual);
      res.json(conta);

    } catch (error) {
      console.error('Erro ao buscar conta:', error);
      res.status(500).json({ error: 'Erro ao buscar conta' });
    }
  }

  // Criar conta
  async criarConta(req, res) {
    try {
      const { usuario_id } = req.user;
      const { nome, tipo, saldo_inicial, cor } = req.body;

      if (!nome || !tipo) {
        return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
      }

      const tiposValidos = ['conta_corrente', 'poupanca', 'carteira', 'investimento', 'cartao'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({ error: 'Tipo de conta inválido' });
      }

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          `INSERT INTO contas (nome, tipo, saldo_inicial, cor, usuario_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [nome, tipo, saldo_inicial || 0, cor || '#28a745', usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      res.status(201).json({
        message: 'Conta criada com sucesso',
        conta_id: result.id
      });

    } catch (error) {
      console.error('Erro ao criar conta:', error);
      res.status(500).json({ error: 'Erro ao criar conta' });
    }
  }

  // Atualizar conta
  async atualizarConta(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;
      const { nome, cor, ativa } = req.body;

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          `UPDATE contas SET nome = ?, cor = ?, ativa = ? 
           WHERE id = ? AND usuario_id = ?`,
          [nome, cor, ativa ? 1 : 0, id, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      res.json({ message: 'Conta atualizada com sucesso' });

    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      res.status(500).json({ error: 'Erro ao atualizar conta' });
    }
  }

  // Deletar conta
  async deletarConta(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;

      // Verificar se a conta tem transações
      const transacoesCount = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT COUNT(*) as count FROM transacoes WHERE conta_id = ?',
          [id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
          }
        );
      });

      if (transacoesCount > 0) {
        return res.status(400).json({ 
          error: 'Não é possível deletar conta com transações associadas' 
        });
      }

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          'DELETE FROM contas WHERE id = ? AND usuario_id = ?',
          [id, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      res.json({ message: 'Conta deletada com sucesso' });

    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      res.status(500).json({ error: 'Erro ao deletar conta' });
    }
  }
}

module.exports = new ContasController();