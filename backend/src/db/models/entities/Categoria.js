const BaseModel = require('../baseModel');

// MODEL CATEGORIA - Gerencia operações da tabela de categorias
// Por que existe: Categorias organizam transações, precisam de operações específicas
class Categoria extends BaseModel {
  constructor(db) {
    super('categorias', db);
  }

  // BUSCAR POR TIPO - Filtra categorias por tipo (receita/despesa)
  // Por que existe: Interface normalmente mostra categorias separadas por tipo
  // Exemplo de uso: await categoriaModel.findByTipo('despesa')
  findByTipo(tipo) {
    return new Promise((resolve, reject) => {
      if (!tipo) {
        reject(new Error('Tipo é obrigatório'));
        return;
      }

      this.db.all(
        'SELECT * FROM categorias WHERE tipo = ? ORDER BY nome',
        [tipo],
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

  // BUSCAR POR USUÁRIO - Lista categorias de um usuário específico
  // Por que existe: Cada usuário tem suas próprias categorias
  // Exemplo de uso: await categoriaModel.findByUsuario(1)
  findByUsuario(usuarioId) {
    return new Promise((resolve, reject) => {
      if (!usuarioId) {
        reject(new Error('ID do usuário é obrigatório'));
        return;
      }

      this.db.all(
        'SELECT * FROM categorias WHERE usuario_id = ? ORDER BY nome',
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

  // BUSCAR CATEGORIAS PADRÃO - Categorias do sistema (usuario_id IS NULL)
  // Por que existe: Sistema oferece categorias padrão para novos usuários
  // Exemplo de uso: await categoriaModel.findCategoriasPadrao()
  findCategoriasPadrao() {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM categorias WHERE usuario_id IS NULL ORDER BY tipo, nome',
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

module.exports = (db) => new Categoria(db);