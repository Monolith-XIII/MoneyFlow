const BaseModel = require('../baseModel');

// MODEL TRANSACAO - Gerencia operações da tabela de transações
// Por que existe: Transações são o core do sistema, precisam de operações complexas
class Transacao extends BaseModel {
  constructor(db) {
    super('transacoes', db);
  }

  // BUSCAR POR USUÁRIO - Lista transações de um usuário com ordenação
  // Por que existe: Interface principal mostra transações do usuário logado
  // Exemplo de uso: await transacaoModel.findByUsuario(1)
  findByUsuario(usuarioId, limit = 50) {
    return new Promise((resolve, reject) => {
      if (!usuarioId) {
        reject(new Error('ID do usuário é obrigatório'));
        return;
      }

      this.db.all(
        `SELECT t.*, c.nome as categoria_nome, ct.nome as conta_nome 
         FROM transacoes t 
         LEFT JOIN categorias c ON t.categoria_id = c.id 
         LEFT JOIN contas ct ON t.conta_id = ct.id 
         WHERE t.usuario_id = ? 
         ORDER BY t.data DESC, t.id DESC 
         LIMIT ?`,
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

  // BUSCAR POR PERÍODO - Transações em um intervalo de datas
  // Por que existe: Relatórios e filtros por período são comuns
  // Exemplo de uso: await transacaoModel.findByPeriodo(1, '2024-01-01', '2024-01-31')
  findByPeriodo(usuarioId, dataInicio, dataFim) {
    return new Promise((resolve, reject) => {
      if (!usuarioId || !dataInicio || !dataFim) {
        reject(new Error('Usuário, data início e data fim são obrigatórios'));
        return;
      }

      this.db.all(
        `SELECT t.*, c.nome as categoria_nome 
         FROM transacoes t 
         LEFT JOIN categorias c ON t.categoria_id = c.id 
         WHERE t.usuario_id = ? AND t.data BETWEEN ? AND ? 
         ORDER BY t.data DESC`,
        [usuarioId, dataInicio, dataFim],
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

  // BUSCAR POR CATEGORIA - Transações de uma categoria específica
  // Por que existe: Análise de gastos por categoria
  // Exemplo de uso: await transacaoModel.findByCategoria(1, 5)
  findByCategoria(usuarioId, categoriaId) {
    return new Promise((resolve, reject) => {
      if (!usuarioId || !categoriaId) {
        reject(new Error('Usuário e categoria são obrigatórios'));
        return;
      }

      this.db.all(
        `SELECT t.*, c.nome as categoria_nome 
         FROM transacoes t 
         LEFT JOIN categorias c ON t.categoria_id = c.id 
         WHERE t.usuario_id = ? AND t.categoria_id = ? 
         ORDER BY t.data DESC`,
        [usuarioId, categoriaId],
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

  // RESUMO POR CATEGORIA - Soma valores agrupados por categoria
  // Por que existe: Gráficos e relatórios precisam de dados agregados
  // Exemplo de uso: await transacaoModel.resumoPorCategoria(1, '2024-01')
  resumoPorCategoria(usuarioId, mesAno) {
    return new Promise((resolve, reject) => {
      if (!usuarioId || !mesAno) {
        reject(new Error('Usuário e mês/ano são obrigatórios'));
        return;
      }

      this.db.all(
        `SELECT c.nome as categoria, c.tipo, SUM(t.valor) as total 
         FROM transacoes t 
         JOIN categorias c ON t.categoria_id = c.id 
         WHERE t.usuario_id = ? AND strftime('%Y-%m', t.data) = ? 
         GROUP BY c.id, c.nome, c.tipo 
         ORDER BY total DESC`,
        [usuarioId, mesAno],
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

module.exports = (db) => new Transacao(db);