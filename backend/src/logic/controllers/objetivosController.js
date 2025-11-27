const MoneyFlowDB = require('../../db/config');

class ObjetivosController {
  
  // Listar objetivos do usuário
  async listarObjetivos(req, res) {
    try {
      const { usuario_id } = req.user;
      const { ativos } = req.query;

      let whereClause = 'WHERE (o.usuario_id = ? OR oc.usuario_compartilhado_id = ?)';
      let params = [usuario_id, usuario_id];

      if (ativos === 'true') {
        whereClause += ' AND o.ativo = 1 AND (o.valor_atual < o.valor_total OR o.data_conclusao > date("now"))';
      }

      const objetivos = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT DISTINCT o.*, 
           (o.valor_atual / o.valor_total * 100) as progresso,
           CASE WHEN o.usuario_id = ? THEN 'dono' ELSE 'membro' END as papel
           FROM objetivos o
           LEFT JOIN objetivos_compartilhados oc ON o.id = oc.objetivo_id
           ${whereClause}
           ORDER BY o.data_conclusao ASC`,
          params,
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      res.json(objetivos.map(objetivo => ({
        ...objetivo,
        progresso: parseFloat(objetivo.progresso || 0)
      })));

    } catch (error) {
      console.error('Erro ao listar objetivos:', error);
      res.status(500).json({ error: 'Erro ao buscar objetivos' });
    }
  }

  // Buscar objetivo por ID
  async buscarObjetivo(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;

      const objetivo = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          `SELECT o.*, 
           (o.valor_atual / o.valor_total * 100) as progresso
           FROM objetivos o
           LEFT JOIN objetivos_compartilhados oc ON o.id = oc.objetivo_id
           WHERE o.id = ? AND (o.usuario_id = ? OR oc.usuario_compartilhado_id = ?)`,
          [id, usuario_id, usuario_id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!objetivo) {
        return res.status(404).json({ error: 'Objetivo não encontrado' });
      }

      objetivo.progresso = parseFloat(objetivo.progresso || 0);
      res.json(objetivo);

    } catch (error) {
      console.error('Erro ao buscar objetivo:', error);
      res.status(500).json({ error: 'Erro ao buscar objetivo' });
    }
  }

  // Criar objetivo
  async criarObjetivo(req, res) {
    try {
      const { usuario_id } = req.user;
      const { nome, descricao, valor_total, valor_atual, data_conclusao, cor, icone, tipo } = req.body;

      if (!nome || !valor_total || !data_conclusao) {
        return res.status(400).json({ error: 'Nome, valor total e data de conclusão são obrigatórios' });
      }

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          `INSERT INTO objetivos 
           (nome, descricao, valor_total, valor_atual, data_conclusao, cor, icone, tipo, usuario_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            nome, 
            descricao || '', 
            valor_total, 
            valor_atual || 0, 
            data_conclusao, 
            cor || '#007bff', 
            icone || 'target', 
            tipo || 'personalizado', 
            usuario_id
          ],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      res.status(201).json({
        message: 'Objetivo criado com sucesso',
        objetivo_id: result.id
      });

    } catch (error) {
      console.error('Erro ao criar objetivo:', error);
      res.status(500).json({ error: 'Erro ao criar objetivo' });
    }
  }

  // Atualizar objetivo
  async atualizarObjetivo(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;
      const { nome, descricao, valor_total, data_conclusao, cor, icone } = req.body;

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          `UPDATE objetivos SET 
           nome = ?, descricao = ?, valor_total = ?, data_conclusao = ?, cor = ?, icone = ?
           WHERE id = ? AND usuario_id = ?`,
          [nome, descricao, valor_total, data_conclusao, cor, icone, id, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Objetivo não encontrado' });
      }

      res.json({ message: 'Objetivo atualizado com sucesso' });

    } catch (error) {
      console.error('Erro ao atualizar objetivo:', error);
      res.status(500).json({ error: 'Erro ao atualizar objetivo' });
    }
  }

  // Adicionar contribuição ao objetivo
  async adicionarContribuicao(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;
      const { valor } = req.body;

      if (!valor || valor <= 0) {
        return res.status(400).json({ error: 'Valor da contribuição deve ser positivo' });
      }

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          `UPDATE objetivos SET valor_atual = valor_atual + ? 
           WHERE id = ? AND (usuario_id = ? OR id IN (
             SELECT objetivo_id FROM objetivos_compartilhados 
             WHERE usuario_compartilhado_id = ? AND permissao = 'escrita'
           ))`,
          [valor, id, usuario_id, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Objetivo não encontrado ou sem permissão' });
      }

      res.json({ message: 'Contribuição adicionada com sucesso' });

    } catch (error) {
      console.error('Erro ao adicionar contribuição:', error);
      res.status(500).json({ error: 'Erro ao adicionar contribuição' });
    }
  }

  // Deletar objetivo
  async deletarObjetivo(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          'DELETE FROM objetivos WHERE id = ? AND usuario_id = ?',
          [id, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Objetivo não encontrado' });
      }

      res.json({ message: 'Objetivo deletado com sucesso' });

    } catch (error) {
      console.error('Erro ao deletar objetivo:', error);
      res.status(500).json({ error: 'Erro ao deletar objetivo' });
    }
  }
}

module.exports = new ObjetivosController();