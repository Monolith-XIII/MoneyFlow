const BaseModel = require('../baseModel');

// MODEL CONTA - Gerencia operações da tabela de contas bancárias
// Por que existe: Contas armazenam saldos e precisam de operações específicas
class Conta extends BaseModel {
  constructor(db) {
    super('contas', db);
  }

  // BUSCAR POR USUÁRIO - Lista contas de um usuário
  // Por que existe: Usuário só deve ver suas próprias contas
  // Exemplo de uso: await contaModel.findByUsuario(1)
  findByUsuario(usuarioId) {
    return new Promise((resolve, reject) => {
      if (!usuarioId) {
        reject(new Error('ID do usuário é obrigatório'));
        return;
      }

      this.db.all(
        'SELECT * FROM contas WHERE usuario_id = ? ORDER BY nome',
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

  // ATUALIZAR SALDO - Atualiza o saldo de uma conta
  // Por que existe: Saldo é calculado automaticamente pelas transações
  // Exemplo de uso: await contaModel.updateSaldo(1, 1500.75)
  updateSaldo(contaId, novoSaldo) {
    return new Promise((resolve, reject) => {
      if (!contaId || novoSaldo === undefined) {
        reject(new Error('ID da conta e novo saldo são obrigatórios'));
        return;
      }

      this.db.run(
        'UPDATE contas SET saldo_atual = ? WHERE id = ?',
        [novoSaldo, contaId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ contaId, novoSaldo, changes: this.changes });
          }
        }
      );
    });
  }

  // BUSCAR CONTA PRINCIPAL - Encontra a conta marcada como principal
  // Por que existe: Interface precisa saber qual conta mostrar primeiro
  // Exemplo de uso: await contaModel.findContaPrincipal(1)
  findContaPrincipal(usuarioId) {
    return new Promise((resolve, reject) => {
      if (!usuarioId) {
        reject(new Error('ID do usuário é obrigatório'));
        return;
      }

      this.db.get(
        'SELECT * FROM contas WHERE usuario_id = ? AND principal = 1',
        [usuarioId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }
}

module.exports = (db) => new Conta(db);