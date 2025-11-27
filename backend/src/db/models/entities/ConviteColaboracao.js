const BaseModel = require('../baseModel');

// MODEL CONVITE COLABORACAO - Gerencia convites para objetivos compartilhados
// Por que existe: Fluxo de convites precisa de operações específicas
class ConviteColaboracao extends BaseModel {
  constructor(db) {
    super('convites_colaboracao', db);
  }

  // BUSCAR POR CONVIDADO - Lista convites recebidos por um usuário
  // Por que existe: Usuário precisa ver e responder convites pendentes
  // Exemplo de uso: await conviteModel.findByConvidado(1)
  findByConvidado(usuarioConvidadoId) {
    return new Promise((resolve, reject) => {
      if (!usuarioConvidadoId) {
        reject(new Error('ID do usuário convidado é obrigatório'));
        return;
      }

      this.db.all(
        `SELECT cc.*, oc.titulo as objetivo_titulo, u.nome as criador_nome 
         FROM convites_colaboracao cc 
         JOIN objetivos_compartilhados oc ON cc.objetivo_compartilhado_id = oc.id 
         JOIN usuarios u ON oc.criador_id = u.id 
         WHERE cc.usuario_convidado_id = ? 
         ORDER BY cc.data_envio DESC`,
        [usuarioConvidadoId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  // BUSCAR POR OBJETIVO - Lista convites de um objetivo específico
  // Por que existe: Criador precisa gerenciar convites do objetivo
  // Exemplo de uso: await conviteModel.findByObjetivo(1)
  findByObjetivo(objetivoCompartilhadoId) {
    return new Promise((resolve, reject) => {
      if (!objetivoCompartilhadoId) {
        reject(new Error('ID do objetivo compartilhado é obrigatório'));
        return;
      }

      this.db.all(
        `SELECT cc.*, u.nome as usuario_convidado_nome, u.email as usuario_convidado_email 
         FROM convites_colaboracao cc 
         JOIN usuarios u ON cc.usuario_convidado_id = u.id 
         WHERE cc.objetivo_compartilhado_id = ? 
         ORDER BY cc.data_envio DESC`,
        [objetivoCompartilhadoId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  // ATUALIZAR STATUS - Altera status do convite (pendente/aceito/recusado)
  // Por que existe: Fluxo de aceitação/recusa de convites
  // Exemplo de uso: await conviteModel.updateStatus(1, 'aceito')
  updateStatus(conviteId, novoStatus) {
    return new Promise((resolve, reject) => {
      const statusValidos = ['pendente', 'aceito', 'recusado'];
      
      if (!conviteId || !novoStatus) {
        reject(new Error('ID do convite e novo status são obrigatórios'));
        return;
      }

      if (!statusValidos.includes(novoStatus)) {
        reject(new Error('Status inválido'));
        return;
      }

      this.db.run(
        'UPDATE convites_colaboracao SET status = ? WHERE id = ?',
        [novoStatus, conviteId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ conviteId, novoStatus, changes: this.changes });
          }
        }
      );
    });
  }

  // BUSCAR CONVITES PENDENTES - Convites não respondidos
  // Por que existe: Notificações e lembretes para convites pendentes
  // Exemplo de uso: await conviteModel.findPendentes(1)
  findPendentes(usuarioConvidadoId) {
    return new Promise((resolve, reject) => {
      if (!usuarioConvidadoId) {
        reject(new Error('ID do usuário convidado é obrigatório'));
        return;
      }

      this.db.all(
        `SELECT cc.*, oc.titulo as objetivo_titulo, u.nome as criador_nome 
         FROM convites_colaboracao cc 
         JOIN objetivos_compartilhados oc ON cc.objetivo_compartilhado_id = oc.id 
         JOIN usuarios u ON oc.criador_id = u.id 
         WHERE cc.usuario_convidado_id = ? AND cc.status = 'pendente' 
         ORDER BY cc.data_envio DESC`,
        [usuarioConvidadoId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }
}

module.exports = (db) => new ConviteColaboracao(db);