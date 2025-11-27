// CLASSE BASE MODEL - Fornece operações CRUD básicas reutilizáveis
// Por que existe: Evitar duplicação de código em todos os models e garantir consistência
// nas operações básicas de banco de dados
class BaseModel {
  constructor(tableName, db) {
    // Nome da tabela no banco de dados - usado em todas as queries
    this.tableName = tableName;
    
    // Instância do banco SQLite - injetada para permitir mock em testes
    this.db = db;
  }

  // BUSCAR POR ID - Retorna um único registro pelo ID primário
  // Por que existe: Operação fundamental para recuperar registros específicos
  // Exemplo de uso: await usuarioModel.findById(1)
  findById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  // BUSCAR TODOS - Retorna todos os registros com filtros opcionais
  // Por que existe: Permite listagem com filtragem flexível
  // Exemplo de uso: await transacaoModel.findAll('valor > ?', [100])
  findAll(where = '', params = []) {
    return new Promise((resolve, reject) => {
      const whereClause = where ? `WHERE ${where}` : '';
      const query = `SELECT * FROM ${this.tableName} ${whereClause} ORDER BY id DESC`;
      
      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // CRIAR REGISTRO - Insere um novo registro no banco
  // Por que existe: Operação fundamental de criação com validação básica
  // Exemplo de uso: await model.create({ nome: 'Exemplo', valor: 100 })
  create(data) {
    return new Promise((resolve, reject) => {
      // Validação básica: dados devem ser um objeto não vazio
      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        reject(new Error('Dados inválidos para criação'));
        return;
      }

      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      this.db.run(
        `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            // Retorna o ID do registro criado e os dados completos
            resolve({ id: this.lastID, ...data });
          }
        }
      );
    });
  }

  // ATUALIZAR REGISTRO - Atualiza um registro existente pelo ID
  // Por que existe: Operação fundamental de atualização com validações
  // Exemplo de uso: await model.update(1, { nome: 'Novo Nome' })
  update(id, data) {
    return new Promise((resolve, reject) => {
      // Validação básica: ID deve existir e dados não podem estar vazios
      if (!id) {
        reject(new Error('ID é obrigatório para atualização'));
        return;
      }

      if (!data || Object.keys(data).length === 0) {
        reject(new Error('Dados de atualização não podem estar vazios'));
        return;
      }

      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(data), id];

      this.db.run(
        `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...data, changes: this.changes });
          }
        }
      );
    });
  }

  // DELETAR REGISTRO - Remove um registro pelo ID
  // Por que existe: Operação fundamental de exclusão com validação
  // Exemplo de uso: await model.delete(1)
  delete(id) {
    return new Promise((resolve, reject) => {
      if (!id) {
        reject(new Error('ID é obrigatório para exclusão'));
        return;
      }

      this.db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deletedId: id, changes: this.changes });
        }
      });
    });
  }
}

module.exports = BaseModel;