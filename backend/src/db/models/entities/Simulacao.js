const BaseModel = require('../baseModel');

// MODEL SIMULACAO - Gerencia simulações financeiras salvas
// Por que existe: Usuários podem salvar e comparar diferentes cenários
class Simulacao extends BaseModel {
  constructor(db) {
    super('simulacoes', db);
  }

  // BUSCAR POR USUÁRIO - Lista simulações de um usuário
  // Por que existe: Cada usuário tem suas próprias simulações
  // Exemplo de uso: await simulacaoModel.findByUsuario(1)
  findByUsuario(usuarioId) {
    return new Promise((resolve, reject) => {
      if (!usuarioId) {
        reject(new Error('ID do usuário é obrigatório'));
        return;
      }

      this.db.all(
        'SELECT * FROM simulacoes WHERE usuario_id = ? ORDER BY data_criacao DESC',
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

  // BUSCAR POR TIPO - Filtra simulações por tipo
  // Por que existe: Diferentes tipos de simulação (investimento, financiamento, etc)
  // Exemplo de uso: await simulacaoModel.findByTipo(1, 'investimento')
  findByTipo(usuarioId, tipo) {
    return new Promise((resolve, reject) => {
      if (!usuarioId || !tipo) {
        reject(new Error('Usuário e tipo são obrigatórios'));
        return;
      }

      this.db.all(
        'SELECT * FROM simulacoes WHERE usuario_id = ? AND tipo = ? ORDER BY data_criacao DESC',
        [usuarioId, tipo],
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

  // ATUALIZAR RESULTADO - Atualiza resultado da simulação
  // Por que existe: Resultados podem ser recalculados e atualizados
  // Exemplo de uso: await simulacaoModel.updateResultado(1, { total: 150000 })
  updateResultado(simulacaoId, resultado) {
    return new Promise((resolve, reject) => {
      if (!simulacaoId || !resultado) {
        reject(new Error('ID da simulação e resultado são obrigatórios'));
        return;
      }

      const resultadoJSON = JSON.stringify(resultado);

      this.db.run(
        'UPDATE simulacoes SET resultado = ? WHERE id = ?',
        [resultadoJSON, simulacaoId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ simulacaoId, resultado, changes: this.changes });
          }
        }
      );
    });
  }
}

module.exports = (db) => new Simulacao(db);