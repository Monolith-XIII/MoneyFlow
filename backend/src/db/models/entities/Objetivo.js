const BaseModel = require('../baseModel');

// MODEL OBJETIVO - Gerencia operações da tabela de objetivos financeiros
// Por que existe: Objetivos têm cálculos específicos de progresso
class Objetivo extends BaseModel {
  constructor(db) {
    super('objetivos', db);
  }

  // BUSCAR POR USUÁRIO - Lista objetivos de um usuário
  // Por que existe: Cada usuário tem seus próprios objetivos
  // Exemplo de uso: await objetivoModel.findByUsuario(1)
  findByUsuario(usuarioId) {
    return new Promise((resolve, reject) => {
      if (!usuarioId) {
        reject(new Error('ID do usuário é obrigatório'));
        return;
      }

      this.db.all(
        `SELECT *, 
         (valor_atual / valor_total * 100) as progresso_percentual 
         FROM objetivos 
         WHERE usuario_id = ? 
         ORDER BY data_alvo ASC`,
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

  // ATUALIZAR PROGRESSO - Atualiza valor atual do objetivo
  // Por que existe: Progresso é atualizado quando há contribuições
  // Exemplo de uso: await objetivoModel.updateProgresso(1, 500.00)
  updateProgresso(objetivoId, novoValorAtual) {
    return new Promise((resolve, reject) => {
      if (!objetivoId || novoValorAtual === undefined) {
        reject(new Error('ID do objetivo e novo valor são obrigatórios'));
        return;
      }

      this.db.run(
        'UPDATE objetivos SET valor_atual = ? WHERE id = ?',
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

  // BUSCAR OBJETIVOS ATIVOS - Objetivos não concluídos
  // Por que existe: Interface normalmente foca em objetivos em andamento
  // Exemplo de uso: await objetivoModel.findAtivos(1)
  findAtivos(usuarioId) {
    return new Promise((resolve, reject) => {
      if (!usuarioId) {
        reject(new Error('ID do usuário é obrigatório'));
        return;
      }

      this.db.all(
        `SELECT *, 
         (valor_atual / valor_total * 100) as progresso_percentual 
         FROM objetivos 
         WHERE usuario_id = ? AND concluido = 0 
         ORDER BY data_alvo ASC`,
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
}

module.exports = (db) => new Objetivo(db);