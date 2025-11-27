const crypto = require('crypto');
const MoneyFlowDB = require('../../db/config');

class ColaboracaoController {
  
  // Listar objetivos compartilhados com o usuário
  async listarObjetivosCompartilhados(req, res) {
    try {
      const { usuario_id } = req.user;

      const objetivos = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT oc.*, o.nome as objetivo_nome, o.descricao, o.valor_total, o.valor_atual,
           u.nome as usuario_dono_nome, u.email as usuario_dono_email
           FROM objetivos_compartilhados oc
           JOIN objetivos o ON oc.objetivo_id = o.id
           JOIN usuarios u ON oc.usuario_dono_id = u.id
           WHERE oc.usuario_compartilhado_id = ? AND oc.ativo = 1
           ORDER BY oc.created_at DESC`,
          [usuario_id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      res.json(objetivos);

    } catch (error) {
      console.error('Erro ao listar objetivos compartilhados:', error);
      res.status(500).json({ error: 'Erro ao buscar objetivos compartilhados' });
    }
  }

  // Listar convites pendentes
  async listarConvitesPendentes(req, res) {
    try {
      const { usuario_id } = req.user;

      const convites = await new Promise((resolve, reject) => {
        MoneyFlowDB.all(
          `SELECT c.*, u.nome as remetente_nome, o.nome as objetivo_nome
           FROM convites_colaboracao c
           JOIN usuarios u ON c.usuario_remetente_id = u.id
           JOIN objetivos o ON c.token LIKE '%' || o.id || '%'
           WHERE c.usuario_destinatario_email = (
             SELECT email FROM usuarios WHERE id = ?
           ) AND c.status = 'pendente' AND c.expira_em > datetime('now')
           ORDER BY c.created_at DESC`,
          [usuario_id],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
          }
        );
      });

      res.json(convites);

    } catch (error) {
      console.error('Erro ao listar convites:', error);
      res.status(500).json({ error: 'Erro ao buscar convites' });
    }
  }

  // Compartilhar objetivo
  async compartilharObjetivo(req, res) {
    try {
      const { usuario_id } = req.user;
      const { objetivo_id, usuario_destinatario_email, permissao } = req.body;

      // Verificar se o objetivo pertence ao usuário
      const objetivo = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT id FROM objetivos WHERE id = ? AND usuario_id = ?',
          [objetivo_id, usuario_id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!objetivo) {
        return res.status(404).json({ error: 'Objetivo não encontrado' });
      }

      // Verificar se o destinatário existe
      const destinatario = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          'SELECT id, email FROM usuarios WHERE email = ?',
          [usuario_destinatario_email],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!destinatario) {
        return res.status(404).json({ error: 'Usuário destinatário não encontrado' });
      }

      // Verificar se já existe compartilhamento
      const compartilhamentoExistente = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          `SELECT id FROM objetivos_compartilhados 
           WHERE objetivo_id = ? AND usuario_compartilhado_id = ?`,
          [objetivo_id, destinatario.id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (compartilhamentoExistente) {
        return res.status(400).json({ error: 'Objetivo já compartilhado com este usuário' });
      }

      // Criar token único
      const token = crypto.randomBytes(32).toString('hex');
      const expira_em = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

      // Criar convite
      const resultConvite = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          `INSERT INTO convites_colaboracao 
           (usuario_remetente_id, usuario_destinatario_email, token, expira_em) 
           VALUES (?, ?, ?, ?)`,
          [usuario_id, usuario_destinatario_email, token, expira_em.toISOString()],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      // Criar compartilhamento
      const resultCompartilhamento = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          `INSERT INTO objetivos_compartilhados 
           (objetivo_id, usuario_dono_id, usuario_compartilhado_id, permissao) 
           VALUES (?, ?, ?, ?)`,
          [objetivo_id, usuario_id, destinatario.id, permissao || 'leitura'],
          function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
          }
        );
      });

      res.status(201).json({
        message: 'Objetivo compartilhado com sucesso',
        convite_id: resultConvite.id,
        compartilhamento_id: resultCompartilhamento.id
      });

    } catch (error) {
      console.error('Erro ao compartilhar objetivo:', error);
      res.status(500).json({ error: 'Erro ao compartilhar objetivo' });
    }
  }

  // Responder convite
  async responderConvite(req, res) {
    try {
      const { usuario_id } = req.user;
      const { token } = req.params;
      const { aceitar } = req.body;

      // Buscar convite
      const convite = await new Promise((resolve, reject) => {
        MoneyFlowDB.get(
          `SELECT c.*, u.email as destinatario_email
           FROM convites_colaboracao c
           JOIN usuarios u ON c.usuario_destinatario_email = u.email
           WHERE c.token = ? AND u.id = ? AND c.status = 'pendente' AND c.expira_em > datetime('now')`,
          [token, usuario_id],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!convite) {
        return res.status(404).json({ error: 'Convite não encontrado ou expirado' });
      }

      const novoStatus = aceitar ? 'aceito' : 'recusado';

      // Atualizar status do convite
      await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          'UPDATE convites_colaboracao SET status = ? WHERE token = ?',
          [novoStatus, token],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Se recusou, remover compartilhamento
      if (!aceitar) {
        await new Promise((resolve, reject) => {
          MoneyFlowDB.run(
            `DELETE FROM objetivos_compartilhados 
             WHERE objetivo_id IN (
               SELECT id FROM objetivos WHERE usuario_id = ?
             ) AND usuario_compartilhado_id = ?`,
            [convite.usuario_remetente_id, usuario_id],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }

      res.json({ 
        message: `Convite ${aceitar ? 'aceito' : 'recusado'} com sucesso`,
        status: novoStatus
      });

    } catch (error) {
      console.error('Erro ao responder convite:', error);
      res.status(500).json({ error: 'Erro ao responder convite' });
    }
  }

  // Remover compartilhamento
  async removerCompartilhamento(req, res) {
    try {
      const { usuario_id } = req.user;
      const { id } = req.params;

      const result = await new Promise((resolve, reject) => {
        MoneyFlowDB.run(
          `DELETE FROM objetivos_compartilhados 
           WHERE id = ? AND (usuario_dono_id = ? OR usuario_compartilhado_id = ?)`,
          [id, usuario_id, usuario_id],
          function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
          }
        );
      });

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Compartilhamento não encontrado' });
      }

      res.json({ message: 'Compartilhamento removido com sucesso' });

    } catch (error) {
      console.error('Erro ao remover compartilhamento:', error);
      res.status(500).json({ error: 'Erro ao remover compartilhamento' });
    }
  }
}

module.exports = new ColaboracaoController();