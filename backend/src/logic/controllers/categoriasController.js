const MoneyFlowDB = require('../../db/config');

class CategoriasController {
  
  // Listar todas as categorias do usuário
  async listarCategorias(req, res) {
    try {
      const { usuario_id } = req.user;
      const { tipo } = req.query;

      let whereClause = 'WHERE (usuario_id = ? OR usuario_id IS NULL)';
      let params = [usuario_id];

      if (tipo) {
        whereClause += ' AND tipo = ?';
        params.push(tipo);
      }

      const categorias = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT * FROM categorias 
           ${whereClause} 
           ORDER BY nome`,
          params,
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      res.json(categorias);

    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  }

  // Buscar categoria por ID
  async buscarCategoria(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;

      const categoria = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT * FROM categorias WHERE id = ? AND (usuario_id = ? OR usuario_id IS NULL)',
          [id, usuario_id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!categoria) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.json(categoria);

    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({ error: 'Erro ao buscar categoria' });
    }
  }

  // Criar categoria
  async criarCategoria(req, res) {
    try {
      const { usuario_id } = req.user;
      const { nome, tipo, cor, icone } = req.body;

      if (!nome || !tipo) {
        return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
      }

      if (!['receita', 'despesa'].includes(tipo)) {
        return res.status(400).json({ error: 'Tipo deve ser "receita" ou "despesa"' });
      }

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          `INSERT INTO categorias (nome, tipo, cor, icone, usuario_id) 
           VALUES (?, ?, ?, ?, ?)`,
          [nome, tipo, cor || '#007bff', icone || 'receipt', usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      res.status(201).json({
        message: 'Categoria criada com sucesso',
        categoria_id: result.id
      });

    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }

  // Atualizar categoria
  async atualizarCategoria(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;
      const { nome, cor, icone } = req.body;

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          `UPDATE categorias SET nome = ?, cor = ?, icone = ? 
           WHERE id = ? AND usuario_id = ?`,
          [nome, cor, icone, id, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.json({ message: 'Categoria atualizada com sucesso' });

    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
  }

  // Deletar categoria
  async deletarCategoria(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;

      // Verificar se a categoria está sendo usada em transações
      const transacoesCount = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT COUNT(*) as count FROM transacoes WHERE categoria_id = ?',
          [id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row.count);
          }
        );
      });

      if (transacoesCount > 0) {
        return res.status(400).json({ 
          error: 'Não é possível deletar categoria com transações associadas' 
        });
      }

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          'DELETE FROM categorias WHERE id = ? AND usuario_id = ?',
          [id, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      res.json({ message: 'Categoria deletada com sucesso' });

    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      res.status(500).json({ error: 'Erro ao deletar categoria' });
    }
  }
}

module.exports = new CategoriasController();