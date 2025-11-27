const BaseModel = require('../baseModel');

// MODEL OBJETIVO COMPARTILHADO - Gerencia objetivos com múltiplos participantes
// Por que existe: Objetivos compartilhados têm lógica diferente dos individuais
class ObjetivoCompartilhado extends BaseModel {
  constructor(db) {
    super('objetivos_compartilhados', db);
  }

  // BUSCAR POR CRIADOR - Lista objetivos criados por um usuário
  // Por que existe: Usuário precisa gerenciar objetivos que criou
  // Exemplo de uso: await objetivoCompartilhadoModel.findByCriador(1)
  findByCriador(usuarioId) {
    return new Promise((resolve, reject) => {
      if (!usuarioId) {
        reject(new Error('ID do usuário é obrigatório'));
        return;
      }

      this.db.all(
        `SELECT *, 
         (valor_atual / valor_total * 100) as progresso_percentual 
         FROM objetivos_compartilhados 
         WHERE criador_id = ? 
         ORDER BY data_criacao DESC`,
        [usuarioId],
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

  // BUSCAR POR PARTICIPANTE - Lista objetivos onde usuário é participante
  // Por que existe: Usuário precisa ver objetivos que participa
  // Exemplo de uso: await objetivoCompartilhadoModel.findByParticipante(1)
  findByParticipante(usuarioId) {
    return new Promise((resolve, reject) => {
      if (!usuarioId) {
        reject(new Error('ID do usuário é obrigatório'));
        return;
      }

      this.db.all(
        `SELECT oc.*, 
         (oc.valor_atual / oc.valor_total * 100) as progresso_percentual 
         FROM objetivos_compartilhados oc 
         JOIN convites_colaboracao cc ON oc.id = cc.objetivo_compartilhado_id 
         WHERE cc.usuario_convidado_id = ? AND cc.status = 'aceito' 
         ORDER BY oc.data_alvo ASC`,
        [usuarioId],
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

  // ATUALIZAR PROGRESSO COMPARTILHADO - Atualiza valor atual
  // Por que existe: Múltiplos usuários contribuem para o mesmo objetivo
  // Exemplo de uso: await objetivoCompartilhadoModel.updateProgresso(1, 1500.00)
  updateProgresso(objetivoId, novoValorAtual) {
    return new Promise((resolve, reject) => {
      if (!objetivoId || novoValorAtual === undefined) {
        reject(new Error('ID do objetivo e novo valor são obrigatórios'));
        return;
      }

      this.db.run(
        'UPDATE objetivos_compartilhados SET valor_atual = ? WHERE id = ?',
        [novoValorAtual, objetivoId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ objetivoId, novoValorAtual, changes: this.changes });
          }
        }
      );
    });
  }
}

module.exports = (db) => new ObjetivoCompartilhado(db);