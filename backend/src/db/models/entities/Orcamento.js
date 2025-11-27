const BaseModel = require('../baseModel');

// MODEL ORCAMENTO - Gerencia operações da tabela de orçamentos mensais
// Por que existe: Orçamentos têm relação temporal e precisam de buscas por período
class Orcamento extends BaseModel {
  constructor(db) {
    super('orcamentos', db);
  }

  // BUSCAR POR USUÁRIO E MÊS - Encontra orçamento específico
  // Por que existe: Orçamentos são mensais, busca precisa ser específica
  // Exemplo de uso: await orcamentoModel.findByUsuarioEMes(1, '2024-01')
  findByUsuarioEMes(usuarioId, mesAno) {
    return new Promise((resolve, reject) => {
      if (!usuarioId || !mesAno) {
        reject(new Error('Usuário e mês/ano são obrigatórios'));
        return;
      }

      this.db.get(
        'SELECT * FROM orcamentos WHERE usuario_id = ? AND mes_ano = ?',
        [usuarioId, mesAno],
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

  // BUSCAR TODOS POR USUÁRIO - Lista históricos de orçamentos
  // Por que existe: Permite ver evolução dos orçamentos ao longo do tempo
  // Exemplo de uso: await orcamentoModel.findByUsuario(1)
  findByUsuario(usuarioId, limit = 12) {
    return new Promise((resolve, reject) => {
      if (!usuarioId) {
        reject(new Error('ID do usuário é obrigatório'));
        return;
      }

      this.db.all(
        'SELECT * FROM orcamentos WHERE usuario_id = ? ORDER BY mes_ano DESC LIMIT ?',
        [usuarioId, limit],
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

  // ATUALIZAR VALOR GASTO - Atualiza o valor realizado do orçamento
  // Por que existe: Sistema calcula automaticamente gastos reais
  // Exemplo de uso: await orcamentoModel.updateValorGasto(1, 750.50)
  updateValorGasto(orcamentoId, valorGasto) {
    return new Promise((resolve, reject) => {
      if (!orcamentoId || valorGasto === undefined) {
        reject(new Error('ID do orçamento e valor gasto são obrigatórios'));
        return;
      }

      this.db.run(
        'UPDATE orcamentos SET valor_gasto = ? WHERE id = ?',
        [valorGasto, orcamentoId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ orcamentoId, valorGasto, changes: this.changes });
          }
        }
      );
    });
  }
}

module.exports = (db) => new Orcamento(db);